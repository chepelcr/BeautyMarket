import {
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
  CreateInvalidationCommand,
  CreateOriginAccessControlCommand,
  type DistributionConfig,
} from '@aws-sdk/client-cloudfront';

export interface CloudFrontClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface InvalidationOptions {
  distributionId: string;
  paths?: string[];
  callerReference?: string;
}

export interface InvalidationResult {
  invalidationId: string;
}

export interface OriginAccessControlOptions {
  name: string;
  description?: string;
}

export interface CreateDistributionOptions {
  bucketName: string;
  bucketRegion: string;
  subdomain: string;
  baseDomain: string;
  certificateArn: string;
  originAccessControlId: string;
  comment?: string;
}

export interface DistributionResult {
  distributionId: string;
  domainName: string;
}

export interface UpdateAliasesOptions {
  distributionId: string;
  aliases: string[];
  certificateArn?: string;
}

export class AwsCloudFrontService {
  private client: CloudFrontClient;

  constructor(config?: CloudFrontClientConfig) {
    const region = config?.region || process.env.AWS_REGION || 'us-east-1';

    const clientConfig: any = { region };

    if (config?.credentials) {
      clientConfig.credentials = config.credentials;
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new CloudFrontClient(clientConfig);
  }

  // Invalidation Operations

  async createInvalidation(options: InvalidationOptions): Promise<InvalidationResult> {
    const paths = options.paths || ['/*'];
    const callerReference = options.callerReference || `invalidation-${Date.now()}`;

    const response = await this.client.send(new CreateInvalidationCommand({
      DistributionId: options.distributionId,
      InvalidationBatch: {
        CallerReference: callerReference,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    }));

    return {
      invalidationId: response.Invalidation?.Id || '',
    };
  }

  // Origin Access Control Operations

  async createOriginAccessControl(options: OriginAccessControlOptions): Promise<string> {
    const response = await this.client.send(new CreateOriginAccessControlCommand({
      OriginAccessControlConfig: {
        Name: options.name,
        Description: options.description || `OAC for ${options.name}`,
        SigningProtocol: 'sigv4',
        SigningBehavior: 'always',
        OriginAccessControlOriginType: 's3',
      },
    }));

    return response.OriginAccessControl!.Id!;
  }

  // Distribution Operations

  async createDistribution(options: CreateDistributionOptions): Promise<DistributionResult> {
    const originId = `S3-${options.bucketName}`;
    const aliases = [`${options.subdomain}.${options.baseDomain}`];

    const response = await this.client.send(new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: `${options.bucketName}-${Date.now()}`,
        Comment: options.comment || `Distribution for ${options.subdomain}`,
        Enabled: true,
        Origins: {
          Quantity: 1,
          Items: [{
            Id: originId,
            DomainName: `${options.bucketName}.s3.${options.bucketRegion}.amazonaws.com`,
            S3OriginConfig: {
              OriginAccessIdentity: '', // Empty for OAC
            },
            OriginAccessControlId: options.originAccessControlId,
          }],
        },
        DefaultCacheBehavior: {
          TargetOriginId: originId,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized
          Compress: true,
        },
        DefaultRootObject: 'index.html',
        Aliases: {
          Quantity: aliases.length,
          Items: aliases,
        },
        ViewerCertificate: {
          ACMCertificateArn: options.certificateArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021',
        },
        CustomErrorResponses: {
          Quantity: 1,
          Items: [{
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
            ErrorCachingMinTTL: 300,
          }],
        },
        PriceClass: 'PriceClass_100', // US, Canada, Europe
      },
    }));

    return {
      distributionId: response.Distribution!.Id!,
      domainName: response.Distribution!.DomainName!,
    };
  }

  async getDistribution(distributionId: string): Promise<{
    distribution: any;
    etag: string;
  }> {
    const response = await this.client.send(new GetDistributionCommand({
      Id: distributionId,
    }));

    return {
      distribution: response.Distribution,
      etag: response.ETag!,
    };
  }

  async getDistributionConfig(distributionId: string): Promise<{
    config: DistributionConfig;
    etag: string;
  }> {
    const response = await this.client.send(new GetDistributionConfigCommand({
      Id: distributionId,
    }));

    return {
      config: response.DistributionConfig!,
      etag: response.ETag!,
    };
  }

  async updateDistributionConfig(
    distributionId: string,
    config: DistributionConfig,
    etag: string
  ): Promise<void> {
    await this.client.send(new UpdateDistributionCommand({
      Id: distributionId,
      DistributionConfig: config,
      IfMatch: etag,
    }));
  }

  async updateAliases(options: UpdateAliasesOptions): Promise<void> {
    const { config, etag } = await this.getDistributionConfig(options.distributionId);

    config.Aliases = {
      Quantity: options.aliases.length,
      Items: options.aliases,
    };

    if (options.certificateArn) {
      config.ViewerCertificate = {
        ACMCertificateArn: options.certificateArn,
        SSLSupportMethod: 'sni-only',
        MinimumProtocolVersion: 'TLSv1.2_2021',
      };
    }

    await this.updateDistributionConfig(options.distributionId, config, etag);
  }

  async disableDistribution(distributionId: string): Promise<void> {
    const { config, etag } = await this.getDistributionConfig(distributionId);
    config.Enabled = false;
    await this.updateDistributionConfig(distributionId, config, etag);
  }

  async deleteDistribution(distributionId: string): Promise<void> {
    // Get latest etag
    const { distribution } = await this.getDistribution(distributionId);

    // Check if distribution is enabled
    if (distribution?.DistributionConfig?.Enabled) {
      console.log(`Distribution ${distributionId} is enabled. Disabling first...`);
      await this.disableDistribution(distributionId);
      // Note: In production, you'd need to wait for the distribution to be fully disabled
      // This can take 15-20 minutes
    }

    // Get latest etag after potential disable
    const { etag } = await this.getDistribution(distributionId);

    await this.client.send(new DeleteDistributionCommand({
      Id: distributionId,
      IfMatch: etag,
    }));
  }
}
