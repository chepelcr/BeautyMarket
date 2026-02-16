import { S3Dao, CloudFrontDao, Route53Dao, AcmDao, StsDao } from '../aws-daos';
import type { Organization, ACMValidationRecord, InfrastructureStatus } from '../entities';
import type { OrganizationRepository } from '../repositories/OrganizationRepository';

export interface ProvisioningResult {
  success: boolean;
  error?: string;
  s3BucketName?: string;
  cloudfrontDistributionId?: string;
  cloudfrontDomain?: string;
  route53RecordId?: string;
  templateDeployed?: boolean;
}

export interface DeployTemplateResult {
  success: boolean;
  error?: string;
  filesDeployed?: number;
}

export interface CustomDomainResult {
  success: boolean;
  error?: string;
  certificateArn?: string;
  validationRecords?: ACMValidationRecord[];
}

export interface IOrganizationInfrastructureService {
  provisionInfrastructure(organization: Organization): Promise<ProvisioningResult>;
  deprovisionInfrastructure(organization: Organization): Promise<boolean>;
  deployTemplateMarket(bucketName: string): Promise<DeployTemplateResult>;
  requestCustomDomainCertificate(organizationId: string, customDomain: string): Promise<CustomDomainResult>;
  checkCertificateStatus(certificateArn: string): Promise<string>;
  attachCustomDomainToDistribution(organizationId: string): Promise<boolean>;
}

export class OrganizationInfrastructureService implements IOrganizationInfrastructureService {
  private s3Dao: S3Dao;
  private cloudfrontDao: CloudFrontDao;
  private route53Dao: Route53Dao;
  private acmDao: AcmDao;
  private stsDao: StsDao;
  private region: string;
  private hostedZoneId: string;
  private baseDomain: string;
  private templateSourceBucket: string;

  constructor(
    private organizationRepo: OrganizationRepository,
    s3Dao?: S3Dao,
    cloudfrontDao?: CloudFrontDao
  ) {
    this.region = process.env.AWS_REGION || 'us-east-1';

    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    };

    this.s3Dao = s3Dao || new S3Dao({ credentials, region: this.region });
    this.cloudfrontDao = cloudfrontDao || new CloudFrontDao({ credentials, region: this.region });
    this.route53Dao = new Route53Dao({ credentials, region: this.region });
    // ACM must be in us-east-1 for CloudFront
    this.acmDao = new AcmDao({ credentials, region: 'us-east-1' });
    this.stsDao = new StsDao({ credentials, region: this.region });

    this.hostedZoneId = process.env.ROUTE53_HOSTED_ZONE_ID || '';
    this.baseDomain = process.env.BASE_DOMAIN || 'jcampos.dev';
    this.templateSourceBucket = process.env.TEMPLATE_SOURCE_BUCKET || 'jmarkets-template-market';
  }

  private async getAccountId(): Promise<string> {
    return this.stsDao.getAccountId();
  }

  async provisionInfrastructure(organization: Organization): Promise<ProvisioningResult> {
    const bucketName = `jmarkets-org-${organization.slug}`;

    try {
      // Update status to provisioning
      await this.organizationRepo.update(organization.id, {
        infrastructureStatus: 'provisioning' as InfrastructureStatus,
      });

      // Step 1: Create S3 Bucket (idempotent)
      const bucketExists = await this.s3Dao.bucketExists(bucketName);
      if (!bucketExists) {
        console.log(`Creating S3 bucket: ${bucketName}`);
        await this.createS3Bucket(bucketName);
      } else {
        console.log(`S3 bucket already exists: ${bucketName}`);
      }

      // Step 1.5: Deploy template market to bucket
      console.log(`Deploying template market to bucket: ${bucketName}`);
      const deployResult = await this.deployTemplateMarket(bucketName);
      if (!deployResult.success) {
        console.warn(`Warning: Template deployment failed: ${deployResult.error}`);
      }

      // Step 2: Create Origin Access Control for CloudFront (skip if distribution exists)
      let oacId: string;
      if (!organization.cloudfrontDistributionId) {
        try {
          oacId = await this.createOriginAccessControl(organization.slug);
        } catch (error: any) {
          if (error.name === 'OriginAccessControlAlreadyExists') {
            console.log(`OAC already exists for ${organization.slug}, will reuse existing`);
            oacId = ''; // CloudFront will use existing OAC by name
          } else {
            throw error;
          }
        }
      } else {
        console.log(`CloudFront distribution already exists, skipping OAC creation`);
        oacId = ''; // Will not be used
      }

      // Step 3: Create CloudFront Distribution (idempotent)
      let distributionId: string;
      let domainName: string;
      if (!organization.cloudfrontDistributionId) {
        console.log(`Creating CloudFront distribution for: ${organization.slug}`);
        const result = await this.createCloudFrontDistribution(
          bucketName,
          organization.subdomain || organization.slug,
          oacId
        );
        distributionId = result.distributionId;
        domainName = result.domainName;
      } else {
        console.log(`CloudFront distribution already exists: ${organization.cloudfrontDistributionId}`);
        distributionId = organization.cloudfrontDistributionId;
        domainName = organization.cloudfrontDomain!;
      }

      // Step 4: Update S3 Bucket Policy to allow CloudFront OAC
      await this.updateBucketPolicyForCloudFront(bucketName, distributionId);

      // Step 5: Create Route53 record for subdomain
      let route53RecordId: string | undefined;
      if (organization.subdomain) {
        console.log(`Creating Route53 record for: ${organization.subdomain}.${this.baseDomain}`);
        route53RecordId = await this.createRoute53Record(
          organization.subdomain,
          domainName
        );
      }

      // Update organization with infrastructure details
      await this.organizationRepo.update(organization.id, {
        s3BucketName: bucketName,
        cloudfrontDistributionId: distributionId,
        cloudfrontDomain: domainName,
        route53RecordId,
        infrastructureStatus: 'active' as InfrastructureStatus,
      });

      console.log(`✓ Infrastructure provisioned for organization: ${organization.name}`);

      return {
        success: true,
        s3BucketName: bucketName,
        cloudfrontDistributionId: distributionId,
        cloudfrontDomain: domainName,
        route53RecordId,
        templateDeployed: deployResult.success,
      };
    } catch (error: any) {
      console.error(`Error provisioning infrastructure for ${organization.slug}:`, error);

      // Update status to failed
      await this.organizationRepo.update(organization.id, {
        infrastructureStatus: 'failed' as InfrastructureStatus,
      });

      return {
        success: false,
        error: error.message || 'Failed to provision infrastructure',
      };
    }
  }

  private async createS3Bucket(bucketName: string): Promise<void> {
    // Create bucket
    await this.s3Dao.createBucket(bucketName);

    // Block all public access (CloudFront will use OAC)
    await this.s3Dao.setPublicAccessBlock({
      bucket: bucketName,
      blockPublicAcls: true,
      ignorePublicAcls: true,
      blockPublicPolicy: true,
      restrictPublicBuckets: true,
    });
  }

  async deployTemplateMarket(targetBucketName: string): Promise<DeployTemplateResult> {
    try {
      console.log(`Deploying template market from ${this.templateSourceBucket} to ${targetBucketName}`);

      // List all objects in source bucket
      const objects = await this.s3Dao.listAllObjects(this.templateSourceBucket);

      if (!objects || objects.length === 0) {
        return {
          success: false,
          error: 'No files found in template source bucket',
          filesDeployed: 0,
        };
      }

      // Copy each object to target bucket
      let deployedCount = 0;
      for (const obj of objects) {
        if (!obj.key) continue;

        await this.s3Dao.copyObject({
          sourceBucket: this.templateSourceBucket,
          sourceKey: obj.key,
          destinationBucket: targetBucketName,
          destinationKey: obj.key,
        });

        deployedCount++;
      }

      console.log(`✓ Deployed ${deployedCount} files to ${targetBucketName}`);

      return {
        success: true,
        filesDeployed: deployedCount,
      };
    } catch (error: any) {
      console.error(`Error deploying template market to ${targetBucketName}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to deploy template market',
        filesDeployed: 0,
      };
    }
  }

  private async createOriginAccessControl(slug: string): Promise<string> {
    return this.cloudfrontDao.createOriginAccessControl({
      name: `oac-${slug}`,
      description: `OAC for ${slug} organization`,
    });
  }

  private async createCloudFrontDistribution(
    bucketName: string,
    subdomain: string,
    oacId: string
  ): Promise<{ distributionId: string; domainName: string }> {
    // Get ACM certificate for the subdomain
    const certificateArn = await this.getOrCreateWildcardCertificate();

    const result = await this.cloudfrontDao.createDistribution({
      bucketName,
      bucketRegion: this.region,
      subdomain,
      baseDomain: this.baseDomain,
      certificateArn,
      originAccessControlId: oacId,
      comment: `Distribution for ${subdomain}`,
    });

    return {
      distributionId: result.distributionId,
      domainName: result.domainName,
    };
  }

  private async updateBucketPolicyForCloudFront(bucketName: string, distributionId: string): Promise<void> {
    const accountId = await this.getAccountId();

    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'AllowCloudFrontServicePrincipal',
        Effect: 'Allow',
        Principal: {
          Service: 'cloudfront.amazonaws.com',
        },
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
        Condition: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`,
          },
        },
      }],
    };

    await this.s3Dao.setBucketPolicy({
      bucket: bucketName,
      policy,
    });
  }

  private async createRoute53Record(subdomain: string, cloudfrontDomain: string): Promise<string> {
    const recordName = `${subdomain}.${this.baseDomain}`;

    const response = await this.route53Dao.createRecord({
      hostedZoneId: this.hostedZoneId,
      recordName,
      recordType: 'A',
      target: cloudfrontDomain,
      aliasTarget: {
        hostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID (global)
        dnsName: cloudfrontDomain,
        evaluateTargetHealth: false,
      },
    });

    return response.changeId;
  }

  private async getOrCreateWildcardCertificate(): Promise<string> {
    const wildcardDomain = `*.jmarkets.${this.baseDomain}`;
    
    try {
      const certificates = await this.acmDao.listCertificates();
      
      for (const cert of certificates) {
        if (cert.DomainName === wildcardDomain) {
          console.log(`Found wildcard certificate: ${wildcardDomain}`);
          return cert.CertificateArn!;
        }
      }
      
      console.log(`Wildcard certificate not found, creating: ${wildcardDomain}`);
      const response = await this.acmDao.requestCertificate({
        domainName: wildcardDomain,
        validationMethod: 'DNS',
      });
      
      console.log(`✓ Created wildcard certificate: ${response.certificateArn}`);
      return response.certificateArn;
    } catch (error: any) {
      throw new Error(`Failed to get or create wildcard certificate: ${error.message}`);
    }
  }

  async requestCustomDomainCertificate(
    organizationId: string,
    customDomain: string
  ): Promise<CustomDomainResult> {
    try {
      // Request ACM certificate
      const response = await this.acmDao.requestCertificate({
        domainName: customDomain,
        subjectAlternativeNames: [`www.${customDomain}`],
        validationMethod: 'DNS',
      });

      const certificateArn = response.certificateArn;

      // Wait a moment for AWS to generate validation records
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get validation records
      const certDetails = await this.acmDao.describeCertificate(certificateArn);

      const validationRecords: ACMValidationRecord[] = (
        certDetails.DomainValidationOptions || []
      ).map(opt => ({
        name: opt.ResourceRecord?.Name || '',
        type: opt.ResourceRecord?.Type || '',
        value: opt.ResourceRecord?.Value || '',
        status: opt.ValidationStatus as ACMValidationRecord['status'],
      }));

      // Update organization with certificate info
      await this.organizationRepo.update(organizationId, {
        customDomain,
        acmCertificateArn: certificateArn,
        acmValidationRecords: validationRecords as any,
        domainVerified: false,
      });

      console.log(`✓ ACM certificate requested for ${customDomain}`);

      return {
        success: true,
        certificateArn,
        validationRecords,
      };
    } catch (error: any) {
      console.error(`Error requesting certificate for ${customDomain}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to request certificate',
      };
    }
  }

  async checkCertificateStatus(certificateArn: string): Promise<string> {
    const response = await this.acmDao.getCertificateStatus(certificateArn);
    return response.status;
  }

  async attachCustomDomainToDistribution(organizationId: string): Promise<boolean> {
    const organization = await this.organizationRepo.findById(organizationId);
    if (!organization || !organization.cloudfrontDistributionId || !organization.customDomain) {
      return false;
    }

    // Verify certificate is issued
    const status = await this.checkCertificateStatus(organization.acmCertificateArn!);
    if (status !== 'ISSUED') {
      throw new Error(`Certificate is not yet issued. Current status: ${status}`);
    }

    try {
      // Get current distribution config
      const { config: distributionConfig, etag } = await this.cloudfrontDao.getDistributionConfig(
        organization.cloudfrontDistributionId
      );

      // Add custom domain to aliases
      const currentAliases = distributionConfig.Aliases?.Items || [];
      if (!currentAliases.includes(organization.customDomain)) {
        currentAliases.push(organization.customDomain);
      }

      await this.cloudfrontDao.updateAliases({
        distributionId: organization.cloudfrontDistributionId,
        aliases: currentAliases,
        certificateArn: organization.acmCertificateArn!,
      });

      // Mark domain as verified
      await this.organizationRepo.update(organizationId, {
        domainVerified: true,
      });

      console.log(`✓ Custom domain ${organization.customDomain} attached to CloudFront`);

      return true;
    } catch (error: any) {
      console.error(`Error attaching custom domain:`, error);
      throw error;
    }
  }

  async deprovisionInfrastructure(organization: Organization): Promise<boolean> {
    try {
      // Update status
      await this.organizationRepo.update(organization.id, {
        infrastructureStatus: 'deleting' as InfrastructureStatus,
      });

      // Delete Route53 record
      if (organization.route53RecordId && organization.subdomain) {
        await this.deleteRoute53Record(
          organization.subdomain,
          organization.cloudfrontDomain!
        );
      }

      // Disable and delete CloudFront distribution
      if (organization.cloudfrontDistributionId) {
        await this.deleteCloudFrontDistribution(organization.cloudfrontDistributionId);
      }

      // Delete S3 bucket (must be empty)
      if (organization.s3BucketName) {
        await this.deleteS3Bucket(organization.s3BucketName);
      }

      // Delete ACM certificate if exists
      if (organization.acmCertificateArn) {
        await this.acmDao.deleteCertificate(organization.acmCertificateArn);
      }

      // Clear infrastructure fields
      await this.organizationRepo.update(organization.id, {
        s3BucketName: null,
        cloudfrontDistributionId: null,
        cloudfrontDomain: null,
        route53RecordId: null,
        acmCertificateArn: null,
        acmValidationRecords: null,
        infrastructureStatus: 'pending' as InfrastructureStatus,
      });

      console.log(`✓ Infrastructure deprovisioned for organization: ${organization.name}`);

      return true;
    } catch (error: any) {
      console.error(`Error deprovisioning infrastructure:`, error);
      return false;
    }
  }

  private async deleteRoute53Record(subdomain: string, cloudfrontDomain: string): Promise<void> {
    const recordName = `${subdomain}.${this.baseDomain}`;

    await this.route53Dao.deleteRecord({
      hostedZoneId: this.hostedZoneId,
      recordName,
      recordType: 'A',
      target: cloudfrontDomain,
      aliasTarget: {
        hostedZoneId: 'Z2FDTNDATAQYW2',
        dnsName: cloudfrontDomain,
        evaluateTargetHealth: false,
      },
    });
  }

  private async deleteCloudFrontDistribution(distributionId: string): Promise<void> {
    await this.cloudfrontDao.deleteDistribution(distributionId);
  }

  private async deleteS3Bucket(bucketName: string): Promise<void> {
    // Empty bucket first (delete all objects)
    await this.s3Dao.emptyBucket(bucketName);

    // Delete bucket
    await this.s3Dao.deleteBucket(bucketName);
  }
}
