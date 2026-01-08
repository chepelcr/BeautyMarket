import 'dotenv/config';
import {
  S3Client,
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  HeadBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  GetDistributionCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
  ListDistributionsCommand,
  CreateOriginAccessControlCommand,
  ListOriginAccessControlsCommand,
} from '@aws-sdk/client-cloudfront';
import {
  Route53Client,
  ListHostedZonesByNameCommand,
  ChangeResourceRecordSetsCommand,
  GetHostedZoneCommand,
} from '@aws-sdk/client-route-53';
import {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  ListCertificatesCommand,
  DeleteCertificateCommand,
} from '@aws-sdk/client-acm';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const TEMPLATE_BUCKET = process.env.TEMPLATE_SOURCE_BUCKET || 'jmarkets-template-market';
const CLIENT_DIST_FOLDER = './dist/public';
const LANDING_DIST_FOLDER = './dist/landing';
const REGION = process.env.AWS_REGION || 'us-east-1';
const BASE_DOMAIN = 'jmarkets.jcampos.dev';
const HOSTED_ZONE_ID = process.env.HOSTED_ZONE_ID; // Add this to .env file

// Template organizations from seed data
const TEMPLATE_ORGS = [
  'jmarkets-demo-example',
  'tech-gadgets-example',
  'vintage-fashion-example',
  'artisan-crafts-example',
  'gourmet-foods-example',
  'fitness-hub-example',
  'pet-care-example',
  'beauty-essentials-example',
];

// Map template subdomains to their build directories
const TEMPLATE_BUILD_PATHS = {
  'jmarkets-demo-example': './dist/templates/jmarkets-demo',
  'tech-gadgets-example': './dist/templates/tech-gadgets',
  'vintage-fashion-example': './dist/templates/vintage-fashion',
  'artisan-crafts-example': './dist/templates/artisan-crafts',
  'gourmet-foods-example': './dist/templates/gourmet-foods',
  'fitness-hub-example': './dist/templates/fitness-hub',
  'pet-care-example': './dist/templates/pet-care',
  'beauty-essentials-example': './dist/templates/beauty-essentials',
};

// Configure AWS Clients
const awsConfig = {
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(awsConfig);
const cloudFrontClient = new CloudFrontClient(awsConfig);
const route53Client = new Route53Client(awsConfig);
const acmClient = new ACMClient(awsConfig);

// Resource tracker for rollback on failure
const resourceTracker = {
  buckets: [],           // S3 bucket names
  distributions: [],     // CloudFront distribution IDs
  dnsRecords: [],        // Route53 DNS records {name, target}
  certificateArn: null,  // ACM certificate ARN (only if newly created)
};

/**
 * Cleanup function - removes all tracked resources
 */
async function cleanupResources() {
  console.log('\n🧹 Rolling back created resources due to failure...\n');

  // Delete CloudFront distributions
  for (const distributionId of resourceTracker.distributions) {
    try {
      console.log(`  Deleting CloudFront distribution: ${distributionId}...`);

      // Get current config
      const configResp = await cloudFrontClient.send(
        new GetDistributionConfigCommand({ Id: distributionId })
      );
      const config = configResp.DistributionConfig;
      const etag = configResp.ETag;

      // If enabled, disable it first
      if (config.Enabled) {
        config.Enabled = false;
        await cloudFrontClient.send(
          new UpdateDistributionCommand({
            Id: distributionId,
            DistributionConfig: config,
            IfMatch: etag,
          })
        );
        console.log(`    ✅ Disabled ${distributionId} (will need manual deletion after deployment)`);
      } else {
        // Already disabled, try to delete
        await cloudFrontClient.send(
          new DeleteDistributionCommand({ Id: distributionId, IfMatch: etag })
        );
        console.log(`    ✅ Deleted ${distributionId}`);
      }
    } catch (error) {
      console.error(`    ⚠️  Failed to delete distribution ${distributionId}:`, error.message);
    }
  }

  // Delete Route53 DNS records
  for (const record of resourceTracker.dnsRecords) {
    try {
      console.log(`  Deleting DNS record: ${record.name}...`);
      await route53Client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: HOSTED_ZONE_ID,
          ChangeBatch: {
            Comment: `Rollback: Delete ${record.name}`,
            Changes: [
              {
                Action: 'DELETE',
                ResourceRecordSet: {
                  Name: record.name,
                  Type: 'A',
                  AliasTarget: {
                    HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                    DNSName: record.target,
                    EvaluateTargetHealth: false,
                  },
                },
              },
            ],
          },
        })
      );
      console.log(`    ✅ Deleted DNS record ${record.name}`);
    } catch (error) {
      console.error(`    ⚠️  Failed to delete DNS record ${record.name}:`, error.message);
    }
  }

  // Delete S3 buckets (must empty first)
  for (const bucketName of resourceTracker.buckets) {
    try {
      console.log(`  Deleting S3 bucket: ${bucketName}...`);

      // List and delete all objects
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({ Bucket: bucketName })
      );

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        for (const object of listResponse.Contents) {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key })
          );
        }
        console.log(`    Deleted ${listResponse.Contents.length} objects`);
      }

      // Delete bucket
      await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
      console.log(`    ✅ Deleted bucket ${bucketName}`);
    } catch (error) {
      console.error(`    ⚠️  Failed to delete bucket ${bucketName}:`, error.message);
    }
  }

  console.log('\n✅ Rollback complete\n');
}

/**
 * Request or get existing wildcard certificate for *.jmarkets.jcampos.dev
 */
async function requestOrGetWildcardCertificate() {
  const wildcardDomain = `*.${BASE_DOMAIN}`;

  try {
    console.log(`\n🔐 Checking for existing wildcard certificate for ${wildcardDomain}...`);

    // Check if certificate already exists
    const listResponse = await acmClient.send(new ListCertificatesCommand({}));
    const existingCert = listResponse.CertificateSummaryList?.find(
      (cert) => cert.DomainName === wildcardDomain && cert.Status !== 'FAILED'
    );

    if (existingCert) {
      console.log(`  ✅ Found existing certificate: ${existingCert.CertificateArn}`);

      // Get certificate details to check status
      const describeResponse = await acmClient.send(
        new DescribeCertificateCommand({ CertificateArn: existingCert.CertificateArn })
      );

      const status = describeResponse.Certificate.Status;
      console.log(`  📊 Certificate status: ${status}`);

      if (status === 'FAILED') {
        console.log(`  ⚠️  Existing certificate has FAILED status, deleting it...`);
        try {
          await acmClient.send(
            new DeleteCertificateCommand({ CertificateArn: existingCert.CertificateArn })
          );
          console.log(`  ✅ Deleted failed certificate`);
        } catch (deleteError) {
          console.log(`  ⚠️  Could not delete failed certificate: ${deleteError.message}`);
        }
        // Fall through to request a new certificate
      } else if (status === 'PENDING_VALIDATION') {
        console.log(`  ⏳ Certificate is pending validation, will add DNS records...`);
        await addCertificateValidationRecords(describeResponse.Certificate);
        const validated = await waitForCertificateValidation(existingCert.CertificateArn);
        if (validated) {
          return existingCert.CertificateArn;
        } else {
          console.log(`  ⚠️  Certificate validation timed out, will request a new one`);
          // Fall through to request a new certificate
        }
      } else if (status === 'ISSUED') {
        console.log(`  ✅ Certificate is already validated and issued`);
        return existingCert.CertificateArn;
      }
    } else {
      console.log(`  📝 No existing wildcard certificate found`);
    }

    // Request new certificate
    console.log(`  📝 Requesting new wildcard certificate for ${wildcardDomain}...`);
    const requestResponse = await acmClient.send(
      new RequestCertificateCommand({
        DomainName: wildcardDomain,
        SubjectAlternativeNames: [BASE_DOMAIN], // Include root domain
        ValidationMethod: 'DNS',
      })
    );

    const certificateArn = requestResponse.CertificateArn;
    console.log(`  ✅ Certificate requested: ${certificateArn}`);

    // Wait a moment for AWS to generate validation records
    console.log(`  ⏳ Waiting for validation records to be generated...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get certificate details for validation
    const describeResponse = await acmClient.send(
      new DescribeCertificateCommand({ CertificateArn: certificateArn })
    );

    // Add DNS validation records
    await addCertificateValidationRecords(describeResponse.Certificate);

    // Wait for validation to complete
    await waitForCertificateValidation(certificateArn);

    return certificateArn;
  } catch (error) {
    console.error('❌ Failed to handle wildcard certificate:', error.message);
    throw error;
  }
}

/**
 * Add DNS validation records to Route53 for certificate validation
 */
async function addCertificateValidationRecords(certificate) {
  if (!HOSTED_ZONE_ID) {
    console.log(`  ⚠️  HOSTED_ZONE_ID not set, skipping automatic DNS validation`);
    console.log(`  ℹ️  Manual action: Add the following DNS records for validation:`);

    certificate.DomainValidationOptions?.forEach((option) => {
      const record = option.ResourceRecord;
      if (record) {
        console.log(`\n    Domain: ${option.DomainName}`);
        console.log(`    Type: ${record.Type}`);
        console.log(`    Name: ${record.Name}`);
        console.log(`    Value: ${record.Value}`);
      }
    });

    return;
  }

  try {
    console.log(`  📝 Adding DNS validation records to Route53...`);

    // Verify hosted zone before adding records
    try {
      const verifyResponse = await route53Client.send(
        new GetHostedZoneCommand({ Id: HOSTED_ZONE_ID })
      );
      const zoneName = verifyResponse.HostedZone.Name;
      console.log(`  🌐 Hosted Zone: ${zoneName} (ID: ${HOSTED_ZONE_ID})`);

      // Check if certificate domain matches hosted zone
      const zoneNameWithoutDot = zoneName.replace(/\.$/, '');
      if (!BASE_DOMAIN.endsWith(zoneNameWithoutDot)) {
        console.error(`  ⚠️  Warning: Certificate domain ${BASE_DOMAIN} doesn't match hosted zone ${zoneName}`);
      }
    } catch (zoneError) {
      console.error(`  ⚠️  Failed to verify hosted zone:`, zoneError.message);
    }

    // Build validation records and deduplicate by record name
    // (ACM generates duplicate records when cert includes both wildcard and root domain)
    const recordsMap = new Map();
    for (const option of certificate.DomainValidationOptions || []) {
      const record = option.ResourceRecord;
      if (record) {
        const key = `${record.Type}:${record.Name}`;
        if (!recordsMap.has(key)) {
          recordsMap.set(key, {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: record.Name,
              Type: record.Type,
              TTL: 300,
              ResourceRecords: [{ Value: record.Value }],
            },
          });
        }
      }
    }

    const changes = Array.from(recordsMap.values());

    if (changes.length === 0) {
      console.log(`  ⚠️  No validation records found to add`);
      return;
    }

    // Log what records are being attempted
    console.log(`  📋 Attempting to add ${changes.length} validation record(s):`);
    changes.forEach((change, idx) => {
      console.log(`    Record ${idx + 1}:`);
      console.log(`      Name: ${change.ResourceRecordSet.Name}`);
      console.log(`      Type: ${change.ResourceRecordSet.Type}`);
      console.log(`      Value: ${change.ResourceRecordSet.ResourceRecords[0].Value}`);
    });

    await route53Client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: 'ACM certificate validation records',
          Changes: changes,
        },
      })
    );

    console.log(`  ✅ Added ${changes.length} DNS validation record(s) to Route53`);
  } catch (error) {
    console.error(`  ❌ ERROR: Failed to add DNS validation records`);
    console.error(`  Error Name: ${error.name}`);
    console.error(`  Error Code: ${error.Code || 'N/A'}`);
    console.error(`  Error Message: ${error.message}`);
    console.error(`  Error Fault: ${error.$fault || 'N/A'}`);

    if (error.$metadata) {
      console.error(`  HTTP Status: ${error.$metadata.httpStatusCode}`);
      console.error(`  Request ID: ${error.$metadata.requestId}`);
    }

    // Log the full error object for maximum debugging
    console.error(`  Full Error:`, JSON.stringify(error, null, 2));

    console.log(`  ℹ️  You may need to manually add the validation records`);
  }
}

/**
 * Wait for certificate to be validated (with timeout)
 */
async function waitForCertificateValidation(certificateArn, maxWaitMinutes = 10) {
  console.log(`  ⏳ Waiting for certificate validation (max ${maxWaitMinutes} minutes)...`);

  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  let attempts = 0;

  while (Date.now() - startTime < maxWaitMs) {
    attempts++;

    try {
      const describeResponse = await acmClient.send(
        new DescribeCertificateCommand({ CertificateArn: certificateArn })
      );

      const status = describeResponse.Certificate.Status;

      if (status === 'ISSUED') {
        console.log(`  ✅ Certificate validated and issued! (after ${attempts} checks)`);
        return true;
      } else if (status === 'FAILED') {
        console.error(`  ❌ Certificate validation failed`);
        return false;
      }

      // Still pending, wait before next check
      process.stdout.write(`  ⏳ Still pending... (attempt ${attempts}, elapsed ${Math.floor((Date.now() - startTime) / 1000)}s)\r`);
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Check every 30 seconds
    } catch (error) {
      console.error(`\n  ⚠️  Error checking certificate status:`, error.message);
    }
  }

  console.log(`\n  ⏰ Timeout waiting for certificate validation after ${maxWaitMinutes} minutes`);
  console.log(`  ℹ️  Certificate validation may still complete. Check ACM console.`);
  return false;
}

async function createBucket() {
  try {
    console.log(`📦 Creating template bucket: ${TEMPLATE_BUCKET}`);

    const params = {
      Bucket: TEMPLATE_BUCKET,
      ...(REGION !== 'us-east-1' && {
        CreateBucketConfiguration: {
          LocationConstraint: REGION,
        },
      }),
    };

    await s3Client.send(new CreateBucketCommand(params));
    console.log(`✅ Bucket created: ${TEMPLATE_BUCKET}`);
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
      console.log(`✅ Bucket already exists: ${TEMPLATE_BUCKET}`);
    } else {
      throw error;
    }
  }
}

async function blockPublicAccess() {
  console.log(`🔒 Blocking public access on ${TEMPLATE_BUCKET}`);

  await s3Client.send(new PutPublicAccessBlockCommand({
    Bucket: TEMPLATE_BUCKET,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: true,
      RestrictPublicBuckets: true,
    },
  }));

  console.log(`✅ Public access blocked`);
}

async function uploadClientFiles() {
  console.log(`\n📤 Uploading client files from ${CLIENT_DIST_FOLDER}`);

  if (!fs.existsSync(CLIENT_DIST_FOLDER)) {
    console.error(`❌ Client distribution folder ${CLIENT_DIST_FOLDER} does not exist.`);
    console.log('   Run "npm run build" first to build the client application.');
    process.exit(1);
  }

  const uploadPromises = await uploadDirectory(CLIENT_DIST_FOLDER, '', TEMPLATE_BUCKET);
  await Promise.all(uploadPromises);

  console.log(`✅ Client files uploaded to template bucket`);
}

async function listBucketContents() {
  console.log(`\n📋 Template bucket contents:`);

  const response = await s3Client.send(new ListObjectsV2Command({
    Bucket: TEMPLATE_BUCKET,
  }));

  const fileCount = response.Contents?.length || 0;
  console.log(`   Total files: ${fileCount}`);

  if (fileCount > 0 && fileCount <= 10) {
    response.Contents.forEach(obj => {
      console.log(`   - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
    });
  }
}

/**
 * Get or create Origin Access Control for CloudFront
 */
async function getOrCreateOriginAccessControl() {
  try {
    // List existing OACs
    const listResponse = await cloudFrontClient.send(
      new ListOriginAccessControlsCommand({})
    );

    // Check if we already have an OAC for jmarkets
    const existingOac = listResponse.OriginAccessControlList?.Items?.find(
      (oac) => oac.Name === 'jmarkets-template-oac'
    );

    if (existingOac) {
      console.log(`✅ Using existing Origin Access Control: ${existingOac.Id}`);
      return existingOac.Id;
    }

    // Create new OAC
    const createResponse = await cloudFrontClient.send(
      new CreateOriginAccessControlCommand({
        OriginAccessControlConfig: {
          Name: 'jmarkets-template-oac',
          Description: 'Origin Access Control for JMarkets template organizations',
          OriginAccessControlOriginType: 's3',
          SigningBehavior: 'always',
          SigningProtocol: 'sigv4',
        },
      })
    );

    console.log(`✅ Created Origin Access Control: ${createResponse.OriginAccessControl.Id}`);
    return createResponse.OriginAccessControl.Id;
  } catch (error) {
    console.error('❌ Failed to get/create Origin Access Control:', error.message);
    throw error;
  }
}

/**
 * Request or get existing ACM certificate for a subdomain
 */
async function getOrRequestCertificate(subdomain) {
  try {
    const domainName = `${subdomain}.${BASE_DOMAIN}`;

    // List existing certificates
    const listResponse = await acmClient.send(new ListCertificatesCommand({}));

    // Check if certificate already exists
    const existingCert = listResponse.CertificateSummaryList?.find(
      (cert) => cert.DomainName === domainName
    );

    if (existingCert) {
      // Check certificate status
      const describeResponse = await acmClient.send(
        new DescribeCertificateCommand({ CertificateArn: existingCert.CertificateArn })
      );

      if (describeResponse.Certificate.Status === 'ISSUED') {
        console.log(`  ✅ Using existing certificate: ${existingCert.CertificateArn}`);
        return existingCert.CertificateArn;
      }

      console.log(`  ⏳ Certificate exists but status is: ${describeResponse.Certificate.Status}`);
      return existingCert.CertificateArn;
    }

    // Request new certificate
    const requestResponse = await acmClient.send(
      new RequestCertificateCommand({
        DomainName: domainName,
        ValidationMethod: 'DNS',
        SubjectAlternativeNames: [`www.${domainName}`],
      })
    );

    console.log(`  📜 Requested new certificate: ${requestResponse.CertificateArn}`);
    console.log(`  ⚠️  Manual action required: Validate certificate in AWS Console`);

    return requestResponse.CertificateArn;
  } catch (error) {
    console.error(`  ❌ Failed to get/request certificate for ${subdomain}:`, error.message);
    throw error;
  }
}

/**
 * Create S3 bucket for a template organization
 */
async function createTemplateBucket(subdomain) {
  const bucketName = `${subdomain}-${BASE_DOMAIN.replace(/\./g, '-')}`;

  try {
    // Check if bucket already exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`  ✅ Bucket already exists: ${bucketName}`);
      return bucketName;
    } catch (err) {
      // Bucket doesn't exist, create it
      if (err.name !== 'NotFound') {
        throw err;
      }
    }

    // Create bucket
    const params = {
      Bucket: bucketName,
      ...(REGION !== 'us-east-1' && {
        CreateBucketConfiguration: {
          LocationConstraint: REGION,
        },
      }),
    };

    await s3Client.send(new CreateBucketCommand(params));
    console.log(`  ✅ Created bucket: ${bucketName}`);

    // Block public access (CloudFront will access via OAC)
    await s3Client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: false, // Allow bucket policy for CloudFront
          RestrictPublicBuckets: false,
        },
      })
    );

    console.log(`  🔒 Configured bucket access settings`);

    return bucketName;
  } catch (error) {
    console.error(`  ❌ Failed to create bucket for ${subdomain}:`, error.message);
    throw error;
  }
}

/**
 * Create bucket policy to allow CloudFront OAC access
 */
async function createBucketPolicy(bucketName, distributionId) {
  try {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipal',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${process.env.AWS_ACCOUNT_ID}:distribution/${distributionId}`,
            },
          },
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );

    console.log(`  🔐 Updated bucket policy for CloudFront access`);
  } catch (error) {
    console.error(`  ⚠️  Warning: Failed to create bucket policy:`, error.message);
    console.log(`  ℹ️  You may need to manually configure the bucket policy`);
  }
}

/**
 * Create CloudFront distribution for a template organization
 */
async function createCloudFrontDistribution(subdomain, bucketName, oacId, certificateArn = null) {
  const domainName = `${subdomain}.${BASE_DOMAIN}`;

  try {
    // Check if distribution already exists
    const listResponse = await cloudFrontClient.send(new ListDistributionsCommand({}));
    const existingDist = listResponse.DistributionList?.Items?.find(
      (dist) => dist.Aliases?.Items?.includes(domainName)
    );

    if (existingDist) {
      console.log(`  ✅ CloudFront distribution already exists: ${existingDist.Id}`);
      return existingDist.Id;
    }

    if (certificateArn) {
      console.log(`  🔐 Creating distribution with SSL certificate`);
    } else {
      console.log(`  ⚠️  Creating distribution without SSL certificate (requires manual setup)`);
    }

    const distributionConfig = {
      CallerReference: `${subdomain}-${Date.now()}`,
      Comment: `Distribution for ${domainName}`,
      Enabled: true,
      DefaultRootObject: 'index.html',
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: `S3-${bucketName}`,
            DomainName: `${bucketName}.s3.${REGION}.amazonaws.com`,
            OriginAccessControlId: oacId,
            S3OriginConfig: {
              OriginAccessIdentity: '',
            },
          },
        ],
      },
      DefaultCacheBehavior: {
        TargetOriginId: `S3-${bucketName}`,
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        Compress: true,
        ForwardedValues: {
          QueryString: false,
          Cookies: {
            Forward: 'none',
          },
        },
        MinTTL: 0,
        DefaultTTL: 86400,
        MaxTTL: 31536000,
        TrustedSigners: {
          Enabled: false,
          Quantity: 0,
        },
      },
      CustomErrorResponses: {
        Quantity: 2,
        Items: [
          {
            ErrorCode: 404,
            ResponseCode: '200',
            ResponsePagePath: '/index.html',
            ErrorCachingMinTTL: 300,
          },
          {
            ErrorCode: 403,
            ResponseCode: '200',
            ResponsePagePath: '/index.html',
            ErrorCachingMinTTL: 300,
          },
        ],
      },
      // SSL Certificate and Custom Domain Configuration
      ...(certificateArn
        ? {
            Aliases: {
              Quantity: 1,
              Items: [domainName],
            },
            ViewerCertificate: {
              ACMCertificateArn: certificateArn,
              SSLSupportMethod: 'sni-only',
              MinimumProtocolVersion: 'TLSv1.2_2021',
              Certificate: certificateArn,
              CertificateSource: 'acm',
            },
          }
        : {
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true,
            },
          }),
      PriceClass: 'PriceClass_100',
    };

    const createResponse = await cloudFrontClient.send(
      new CreateDistributionCommand({
        DistributionConfig: distributionConfig,
      })
    );

    const distributionId = createResponse.Distribution.Id;
    const cloudFrontDomain = createResponse.Distribution.DomainName;

    console.log(`  ✅ Created CloudFront distribution: ${distributionId}`);
    console.log(`  🌐 CloudFront domain: ${cloudFrontDomain}`);

    return distributionId;
  } catch (error) {
    console.error(`  ❌ Failed to create CloudFront distribution:`, error.message);
    throw error;
  }
}

/**
 * Create Route53 DNS record for subdomain
 */
async function createRoute53Record(subdomain, cloudFrontDomain) {
  if (!HOSTED_ZONE_ID) {
    console.log(`  ⚠️  HOSTED_ZONE_ID not set, skipping Route53 record creation`);
    console.log(`  ℹ️  Manual action: Create A record for ${subdomain}.${BASE_DOMAIN} → ${cloudFrontDomain}`);
    return;
  }

  try {
    const domainName = `${subdomain}.${BASE_DOMAIN}`;

    const params = {
      HostedZoneId: HOSTED_ZONE_ID,
      ChangeBatch: {
        Comment: `DNS record for ${domainName}`,
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: domainName,
              Type: 'A',
              AliasTarget: {
                HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID (constant)
                DNSName: cloudFrontDomain,
                EvaluateTargetHealth: false,
              },
            },
          },
        ],
      },
    };

    await route53Client.send(new ChangeResourceRecordSetsCommand(params));
    console.log(`  ✅ Created Route53 A record: ${domainName} → ${cloudFrontDomain}`);
  } catch (error) {
    console.error(`  ⚠️  Warning: Failed to create Route53 record:`, error.message);
    console.log(`  ℹ️  You may need to manually create the DNS record`);
  }
}

/**
 * Upload files to a specific bucket
 */
async function uploadFilesToBucket(bucketName, sourceFolder) {
  console.log(`  📤 Uploading files to ${bucketName}...`);

  if (!fs.existsSync(sourceFolder)) {
    console.error(`  ❌ Source folder ${sourceFolder} does not exist`);
    return;
  }

  const uploadPromises = await uploadDirectory(sourceFolder, '', bucketName);
  await Promise.all(uploadPromises);

  console.log(`  ✅ Files uploaded to ${bucketName}`);
}

/**
 * Modified uploadDirectory to accept bucket name
 */
async function uploadDirectory(dirPath, prefix = '', bucketName = TEMPLATE_BUCKET) {
  const files = fs.readdirSync(dirPath);
  const uploadPromises = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const key = prefix ? `${prefix}/${file}` : file;

    if (fs.statSync(filePath).isDirectory()) {
      const subPromises = await uploadDirectory(filePath, key, bucketName);
      uploadPromises.push(...subPromises);
    } else {
      uploadPromises.push(
        uploadFile(filePath, key, bucketName)
          .then(() => {
            // Silent on individual file uploads
          })
          .catch((err) => {
            console.error(`  ❌ Failed to upload ${key}:`, err.message);
          })
      );
    }
  }

  return uploadPromises;
}

/**
 * Modified uploadFile to accept bucket name
 */
async function uploadFile(filePath, key, bucketName = TEMPLATE_BUCKET) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  };

  // Set cache control for different file types
  if (contentType.startsWith('text/html')) {
    params.CacheControl = 'no-cache';
  } else if (contentType.startsWith('image/') || contentType.startsWith('font/')) {
    params.CacheControl = 'max-age=31536000'; // 1 year
  } else {
    params.CacheControl = 'max-age=86400'; // 1 day
  }

  await s3Client.send(new PutObjectCommand(params));
}

/**
 * Setup infrastructure for a single template organization
 */
async function setupTemplateOrganization(subdomain, certificateArn = null) {
  console.log(`\n🏗️  Setting up infrastructure for: ${subdomain}.${BASE_DOMAIN}`);

  try {
    // Step 1: Create S3 bucket
    const bucketName = await createTemplateBucket(subdomain);

    // Step 2: Get or create Origin Access Control
    const oacId = await getOrCreateOriginAccessControl();

    // Step 3: Create CloudFront distribution (with SSL if certificate provided)
    const distributionId = await createCloudFrontDistribution(subdomain, bucketName, oacId, certificateArn);

    // Step 4: Update bucket policy for CloudFront access
    if (process.env.AWS_ACCOUNT_ID) {
      await createBucketPolicy(bucketName, distributionId);
    } else {
      console.log(`  ⚠️  AWS_ACCOUNT_ID not set, skipping bucket policy creation`);
    }

    // Step 5: Get CloudFront domain for DNS
    const distResponse = await cloudFrontClient.send(
      new GetDistributionCommand({ Id: distributionId })
    );
    const cloudFrontDomain = distResponse.Distribution.DomainName;

    // Step 6: Create Route53 DNS record (if HOSTED_ZONE_ID is set)
    await createRoute53Record(subdomain, cloudFrontDomain);

    // Step 7: Upload template-specific files
    const templateBuildPath = TEMPLATE_BUILD_PATHS[subdomain];
    if (!templateBuildPath) {
      throw new Error(`No build path configured for template: ${subdomain}`);
    }

    if (!fs.existsSync(templateBuildPath)) {
      console.error(`  ❌ Template build folder ${templateBuildPath} does not exist`);
      console.log(`  ℹ️  Run "npm run build:templates" to build all templates first`);
      throw new Error(`Template build not found: ${templateBuildPath}`);
    }

    await uploadFilesToBucket(bucketName, templateBuildPath);

    console.log(`  ✅ Infrastructure setup complete for ${subdomain}`);

    return {
      subdomain,
      bucketName,
      distributionId,
      cloudFrontDomain,
      url: `https://${cloudFrontDomain}`,
      customDomain: `https://${subdomain}.${BASE_DOMAIN}`,
    };
  } catch (error) {
    console.error(`  ❌ Failed to setup ${subdomain}:`, error.message);
    throw error;
  }
}

/**
 * Setup infrastructure for the landing page at the base domain
 */
async function setupLandingPage(certificateArn = null) {
  console.log(`\n🏠 Setting up landing page infrastructure for: ${BASE_DOMAIN}`);

  try {
    // Step 1: Create S3 bucket for landing page
    const bucketName = `${BASE_DOMAIN.replace(/\./g, '-')}-landing`;

    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`  ✅ Bucket already exists: ${bucketName}`);
    } catch (err) {
      if (err.name !== 'NotFound') {
        throw err;
      }

      // Create bucket
      const params = {
        Bucket: bucketName,
        ...(REGION !== 'us-east-1' && {
          CreateBucketConfiguration: {
            LocationConstraint: REGION,
          },
        }),
      };

      await s3Client.send(new CreateBucketCommand(params));
      console.log(`  ✅ Created bucket: ${bucketName}`);

      // Block public access (CloudFront will access via OAC)
      await s3Client.send(
        new PutPublicAccessBlockCommand({
          Bucket: bucketName,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: false, // Allow bucket policy for CloudFront
            RestrictPublicBuckets: false,
          },
        })
      );

      console.log(`  🔒 Configured bucket access settings`);
    }

    // Step 2: Get or create Origin Access Control
    const oacId = await getOrCreateOriginAccessControl();

    // Step 3: Create CloudFront distribution for base domain (with SSL if certificate provided)
    if (certificateArn) {
      console.log(`  🔐 Creating distribution with SSL certificate`);
    } else {
      console.log(`  ⚠️  Creating distribution without SSL certificate (requires manual setup)`);
    }

    const domainName = BASE_DOMAIN;

    // Check if distribution already exists
    const listResponse = await cloudFrontClient.send(new ListDistributionsCommand({}));
    const existingDist = listResponse.DistributionList?.Items?.find(
      (dist) => dist.Aliases?.Items?.includes(domainName)
    );

    let distributionId;
    let cloudFrontDomain;

    if (existingDist) {
      console.log(`  ✅ CloudFront distribution already exists: ${existingDist.Id}`);
      distributionId = existingDist.Id;
      cloudFrontDomain = existingDist.DomainName;
    } else {
      const distributionConfig = {
        CallerReference: `landing-${Date.now()}`,
        Comment: `Landing page distribution for ${domainName}`,
        Enabled: true,
        DefaultRootObject: 'index.html',
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: `S3-${bucketName}`,
              DomainName: `${bucketName}.s3.${REGION}.amazonaws.com`,
              OriginAccessControlId: oacId,
              S3OriginConfig: {
                OriginAccessIdentity: '',
              },
            },
          ],
        },
        DefaultCacheBehavior: {
          TargetOriginId: `S3-${bucketName}`,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 3,
            Items: ['GET', 'HEAD', 'OPTIONS'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          Compress: true,
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: 'none',
            },
          },
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
          TrustedSigners: {
            Enabled: false,
            Quantity: 0,
          },
        },
        CustomErrorResponses: {
          Quantity: 2,
          Items: [
            {
              ErrorCode: 404,
              ResponseCode: '200',
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: 300,
            },
            {
              ErrorCode: 403,
              ResponseCode: '200',
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: 300,
            },
          ],
        },
        // SSL Certificate and Custom Domain Configuration
        ...(certificateArn
          ? {
              Aliases: {
                Quantity: 1,
                Items: [domainName],
              },
              ViewerCertificate: {
                ACMCertificateArn: certificateArn,
                SSLSupportMethod: 'sni-only',
                MinimumProtocolVersion: 'TLSv1.2_2021',
                Certificate: certificateArn,
                CertificateSource: 'acm',
              },
            }
          : {
              ViewerCertificate: {
                CloudFrontDefaultCertificate: true,
              },
            }),
        PriceClass: 'PriceClass_100',
      };

      const createResponse = await cloudFrontClient.send(
        new CreateDistributionCommand({
          DistributionConfig: distributionConfig,
        })
      );

      distributionId = createResponse.Distribution.Id;
      cloudFrontDomain = createResponse.Distribution.DomainName;

      console.log(`  ✅ Created CloudFront distribution: ${distributionId}`);
      console.log(`  🌐 CloudFront domain: ${cloudFrontDomain}`);
    }

    // Step 4: Update bucket policy for CloudFront access
    if (process.env.AWS_ACCOUNT_ID) {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowCloudFrontServicePrincipal',
            Effect: 'Allow',
            Principal: {
              Service: 'cloudfront.amazonaws.com',
            },
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
            Condition: {
              StringEquals: {
                'AWS:SourceArn': `arn:aws:cloudfront::${process.env.AWS_ACCOUNT_ID}:distribution/${distributionId}`,
              },
            },
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(policy),
        })
      );

      console.log(`  🔐 Updated bucket policy for CloudFront access`);
    } else {
      console.log(`  ⚠️  AWS_ACCOUNT_ID not set, skipping bucket policy creation`);
    }

    // Step 5: Create Route53 DNS record for base domain (if HOSTED_ZONE_ID is set)
    if (HOSTED_ZONE_ID) {
      try {
        const params = {
          HostedZoneId: HOSTED_ZONE_ID,
          ChangeBatch: {
            Comment: `DNS record for ${domainName}`,
            Changes: [
              {
                Action: 'UPSERT',
                ResourceRecordSet: {
                  Name: domainName,
                  Type: 'A',
                  AliasTarget: {
                    HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID (constant)
                    DNSName: cloudFrontDomain,
                    EvaluateTargetHealth: false,
                  },
                },
              },
            ],
          },
        };

        await route53Client.send(new ChangeResourceRecordSetsCommand(params));
        console.log(`  ✅ Created Route53 A record: ${domainName} → ${cloudFrontDomain}`);
      } catch (error) {
        console.error(`  ⚠️  Warning: Failed to create Route53 record:`, error.message);
        console.log(`  ℹ️  You may need to manually create the DNS record`);
      }
    } else {
      console.log(`  ⚠️  HOSTED_ZONE_ID not set, skipping Route53 record creation`);
      console.log(`  ℹ️  Manual action: Create A record for ${domainName} → ${cloudFrontDomain}`);
    }

    // Step 6: Upload landing page files
    console.log(`  📤 Uploading landing page files to ${bucketName}...`);

    if (!fs.existsSync(LANDING_DIST_FOLDER)) {
      console.error(`  ❌ Landing page folder ${LANDING_DIST_FOLDER} does not exist`);
      console.log('   Run "npm run build:landing" first to build the landing page.');
    } else {
      const uploadPromises = await uploadDirectory(LANDING_DIST_FOLDER, '', bucketName);
      await Promise.all(uploadPromises);
      console.log(`  ✅ Landing page files uploaded to ${bucketName}`);
    }

    console.log(`  ✅ Landing page infrastructure setup complete`);

    return {
      domainName,
      bucketName,
      distributionId,
      cloudFrontDomain,
      url: `https://${cloudFrontDomain}`,
      customDomain: `https://${domainName}`,
    };
  } catch (error) {
    console.error(`  ❌ Failed to setup landing page:`, error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log('🚀 Setting up template buckets and CloudFront distributions for all template organizations\n');
    console.log(`📋 Template organizations: ${TEMPLATE_ORGS.length}`);
    console.log(`🌍 Base domain: ${BASE_DOMAIN}\n`);

    // Validate environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not found in environment variables');
    }

    if (!fs.existsSync(CLIENT_DIST_FOLDER)) {
      console.error(`❌ Client distribution folder ${CLIENT_DIST_FOLDER} does not exist.`);
      console.log('   Run "npm run build:store" first to build the client application.');
      process.exit(1);
    }

    // Validate template builds exist
    console.log('🔍 Validating template builds...\n');
    const missingTemplates = [];
    for (const subdomain of TEMPLATE_ORGS) {
      const buildPath = TEMPLATE_BUILD_PATHS[subdomain];
      if (!buildPath) {
        console.error(`  ❌ No build path configured for: ${subdomain}`);
        missingTemplates.push(subdomain);
      } else if (!fs.existsSync(buildPath)) {
        console.error(`  ❌ Build not found: ${buildPath}`);
        missingTemplates.push(subdomain);
      } else {
        console.log(`  ✅ ${subdomain}: ${buildPath}`);
      }
    }

    if (missingTemplates.length > 0) {
      console.error(`\n❌ Missing template builds for: ${missingTemplates.join(', ')}`);
      console.log('\n💡 Run the following command to build all templates:');
      console.log('   npm run build:templates\n');
      console.log('   Or build individual templates:');
      missingTemplates.forEach(subdomain => {
        const templateName = subdomain.replace('-example', '');
        console.log(`   npm run build:template:${templateName}`);
      });
      process.exit(1);
    }
    console.log();

    // Setup main template bucket
    console.log('📦 Setting up main template bucket...\n');
    await createBucket();
    await blockPublicAccess();
    await uploadClientFiles();
    await listBucketContents();

    // Request or get wildcard SSL certificate
    let certificateArn = null;
    try {
      certificateArn = await requestOrGetWildcardCertificate();
    } catch (error) {
      console.error('⚠️  Failed to setup SSL certificate:', error.message);
      console.log('   Continuing without SSL (distributions will use CloudFront default certificate)\n');
    }

    // Setup infrastructure for each template organization
    const results = [];
    for (const subdomain of TEMPLATE_ORGS) {
      try {
        const result = await setupTemplateOrganization(subdomain, certificateArn);
        results.push(result);
      } catch (error) {
        console.error(`Failed to setup ${subdomain}, continuing with next...`);
        results.push({ subdomain, error: error.message });
      }
    }

    // Setup landing page infrastructure
    let landingPageResult = null;
    try {
      landingPageResult = await setupLandingPage(certificateArn);
    } catch (error) {
      console.error(`Failed to setup landing page, continuing...`);
      landingPageResult = { error: error.message };
    }

    // Summary
    console.log('\n\n📊 SETUP SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Main template bucket: ${TEMPLATE_BUCKET}`);
    console.log(`✅ Template organizations processed: ${results.length}/${TEMPLATE_ORGS.length}`);
    if (landingPageResult && !landingPageResult.error) {
      console.log(`✅ Landing page deployed: ${landingPageResult.customDomain}`);
    } else if (landingPageResult && landingPageResult.error) {
      console.log(`❌ Landing page failed: ${landingPageResult.error}`);
    }
    console.log();

    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);

    // Show landing page details first
    if (landingPageResult && !landingPageResult.error) {
      console.log(`\n🏠 LANDING PAGE:`);
      console.log(`\n  ${landingPageResult.domainName}`);
      console.log(`    S3 Bucket:        ${landingPageResult.bucketName}`);
      console.log(`    Distribution ID:  ${landingPageResult.distributionId}`);
      console.log(`    CloudFront URL:   ${landingPageResult.url}`);
      console.log(`    Custom Domain:    ${landingPageResult.customDomain}`);
    }

    if (successful.length > 0) {
      console.log(`\n✅ TEMPLATE ORGANIZATIONS (${successful.length}):`);
      successful.forEach((result) => {
        console.log(`\n  ${result.subdomain}.${BASE_DOMAIN}`);
        console.log(`    S3 Bucket:        ${result.bucketName}`);
        console.log(`    Distribution ID:  ${result.distributionId}`);
        console.log(`    CloudFront URL:   ${result.url}`);
        console.log(`    Custom Domain:    ${result.customDomain}`);
      });
    }

    if (failed.length > 0) {
      console.log(`\n\n❌ FAILED DEPLOYMENTS (${failed.length}):`);
      failed.forEach((result) => {
        console.log(`  ${result.subdomain}: ${result.error}`);
      });
    }

    console.log('\n\n📝 NEXT STEPS:');
    console.log('  1. If certificates were requested, validate them in AWS ACM Console');
    console.log('  2. Update CloudFront distributions with validated certificates');
    console.log('  3. Update HOSTED_ZONE_ID in .env if you want automatic DNS record creation');
    console.log('  4. Update AWS_ACCOUNT_ID in .env for automatic bucket policy creation');
    console.log('\n🎉 Setup completed!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
