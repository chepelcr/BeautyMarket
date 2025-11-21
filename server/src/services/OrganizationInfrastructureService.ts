import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from '@aws-sdk/client-route-53';
import {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  DeleteCertificateCommand,
} from '@aws-sdk/client-acm';
import { AwsS3Service } from './AwsS3Service';
import { AwsCloudFrontService } from './AwsCloudFrontService';
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
  private s3Service: AwsS3Service;
  private cloudfrontService: AwsCloudFrontService;
  private route53Client: Route53Client;
  private acmClient: ACMClient;
  private region: string;
  private hostedZoneId: string;
  private baseDomain: string;
  private templateSourceBucket: string;

  constructor(
    private organizationRepo: OrganizationRepository,
    s3Service?: AwsS3Service,
    cloudfrontService?: AwsCloudFrontService
  ) {
    this.region = process.env.AWS_REGION || 'us-east-1';

    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    };

    this.s3Service = s3Service || new AwsS3Service({ credentials, region: this.region });
    this.cloudfrontService = cloudfrontService || new AwsCloudFrontService({ credentials, region: this.region });
    this.route53Client = new Route53Client({ credentials, region: this.region });
    // ACM must be in us-east-1 for CloudFront
    this.acmClient = new ACMClient({ credentials, region: 'us-east-1' });

    this.hostedZoneId = process.env.ROUTE53_HOSTED_ZONE_ID || '';
    this.baseDomain = process.env.BASE_DOMAIN || 'jmarkets.jcampos.dev';
    this.templateSourceBucket = process.env.TEMPLATE_SOURCE_BUCKET || 'jmarkets-template-market';
  }

  async provisionInfrastructure(organization: Organization): Promise<ProvisioningResult> {
    const bucketName = `jmarkets-org-${organization.slug}`;

    try {
      // Update status to provisioning
      await this.organizationRepo.update(organization.id, {
        infrastructureStatus: 'provisioning' as InfrastructureStatus,
      });

      // Step 1: Create S3 Bucket
      console.log(`Creating S3 bucket: ${bucketName}`);
      await this.createS3Bucket(bucketName);

      // Step 1.5: Deploy template market to bucket
      console.log(`Deploying template market to bucket: ${bucketName}`);
      const deployResult = await this.deployTemplateMarket(bucketName);
      if (!deployResult.success) {
        console.warn(`Warning: Template deployment failed: ${deployResult.error}`);
      }

      // Step 2: Create Origin Access Control for CloudFront
      const oacId = await this.createOriginAccessControl(organization.slug);

      // Step 3: Create CloudFront Distribution
      console.log(`Creating CloudFront distribution for: ${organization.slug}`);
      const { distributionId, domainName } = await this.createCloudFrontDistribution(
        bucketName,
        organization.subdomain || organization.slug,
        oacId
      );

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
    await this.s3Service.createBucket(bucketName);

    // Block all public access (CloudFront will use OAC)
    await this.s3Service.setPublicAccessBlock({
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
      const objects = await this.s3Service.listAllObjects(this.templateSourceBucket);

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

        await this.s3Service.copyObject({
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
    return this.cloudfrontService.createOriginAccessControl({
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

    const result = await this.cloudfrontService.createDistribution({
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
    const accountId = process.env.AWS_ACCOUNT_ID;

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

    await this.s3Service.setBucketPolicy({
      bucket: bucketName,
      policy,
    });
  }

  private async createRoute53Record(subdomain: string, cloudfrontDomain: string): Promise<string> {
    const recordName = `${subdomain}.${this.baseDomain}`;

    const response = await this.route53Client.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: this.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: recordName,
            Type: 'A',
            AliasTarget: {
              HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID (global)
              DNSName: cloudfrontDomain,
              EvaluateTargetHealth: false,
            },
          },
        }],
      },
    }));

    return response.ChangeInfo!.Id!;
  }

  private async getOrCreateWildcardCertificate(): Promise<string> {
    // Use existing wildcard certificate or create one
    // In production, you'd have a pre-created wildcard certificate
    const wildcardCertArn = process.env.WILDCARD_CERTIFICATE_ARN;
    if (wildcardCertArn) {
      return wildcardCertArn;
    }

    throw new Error('WILDCARD_CERTIFICATE_ARN environment variable is required');
  }

  async requestCustomDomainCertificate(
    organizationId: string,
    customDomain: string
  ): Promise<CustomDomainResult> {
    try {
      // Request ACM certificate
      const response = await this.acmClient.send(new RequestCertificateCommand({
        DomainName: customDomain,
        ValidationMethod: 'DNS',
        SubjectAlternativeNames: [`www.${customDomain}`],
      }));

      const certificateArn = response.CertificateArn!;

      // Wait a moment for AWS to generate validation records
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get validation records
      const certDetails = await this.acmClient.send(new DescribeCertificateCommand({
        CertificateArn: certificateArn,
      }));

      const validationRecords: ACMValidationRecord[] = (
        certDetails.Certificate?.DomainValidationOptions || []
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
    const response = await this.acmClient.send(new DescribeCertificateCommand({
      CertificateArn: certificateArn,
    }));

    return response.Certificate?.Status || 'UNKNOWN';
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
      const { config: distributionConfig, etag } = await this.cloudfrontService.getDistributionConfig(
        organization.cloudfrontDistributionId
      );

      // Add custom domain to aliases
      const currentAliases = distributionConfig.Aliases?.Items || [];
      if (!currentAliases.includes(organization.customDomain)) {
        currentAliases.push(organization.customDomain);
      }

      await this.cloudfrontService.updateAliases({
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
        await this.acmClient.send(new DeleteCertificateCommand({
          CertificateArn: organization.acmCertificateArn,
        }));
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

    await this.route53Client.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: this.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'DELETE',
          ResourceRecordSet: {
            Name: recordName,
            Type: 'A',
            AliasTarget: {
              HostedZoneId: 'Z2FDTNDATAQYW2',
              DNSName: cloudfrontDomain,
              EvaluateTargetHealth: false,
            },
          },
        }],
      },
    }));
  }

  private async deleteCloudFrontDistribution(distributionId: string): Promise<void> {
    await this.cloudfrontService.deleteDistribution(distributionId);
  }

  private async deleteS3Bucket(bucketName: string): Promise<void> {
    // Empty bucket first (delete all objects)
    await this.s3Service.emptyBucket(bucketName);

    // Delete bucket
    await this.s3Service.deleteBucket(bucketName);
  }
}
