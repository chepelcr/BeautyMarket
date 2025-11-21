import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutBucketPolicyCommand,
  PutBucketWebsiteCommand,
  PutPublicAccessBlockCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  type ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3ClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface UploadFileOptions {
  bucket: string;
  key: string;
  body: Buffer | string;
  contentType?: string;
  cacheControl?: string;
}

export interface PresignedUrlOptions {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number;
}

export interface BucketWebsiteOptions {
  bucket: string;
  indexDocument?: string;
  errorDocument?: string;
}

export interface BucketPolicyOptions {
  bucket: string;
  policy: object;
}

export interface PublicAccessBlockOptions {
  bucket: string;
  blockPublicAcls?: boolean;
  ignorePublicAcls?: boolean;
  blockPublicPolicy?: boolean;
  restrictPublicBuckets?: boolean;
}

export interface ListObjectsOptions {
  bucket: string;
  prefix?: string;
  continuationToken?: string;
  maxKeys?: number;
}

export interface ListObjectsResult {
  contents: Array<{ key: string; size?: number; lastModified?: Date }>;
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface CopyObjectOptions {
  sourceBucket: string;
  sourceKey: string;
  destinationBucket: string;
  destinationKey: string;
  contentType?: string;
}

export class AwsS3Service {
  private client: S3Client;
  private region: string;

  constructor(config?: S3ClientConfig) {
    this.region = config?.region || process.env.AWS_REGION || 'us-east-1';

    const clientConfig: any = { region: this.region };

    if (config?.credentials) {
      clientConfig.credentials = config.credentials;
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  getRegion(): string {
    return this.region;
  }

  // Bucket Operations

  async createBucket(bucketName: string): Promise<void> {
    await this.client.send(new CreateBucketCommand({
      Bucket: bucketName,
      ...(this.region !== 'us-east-1' && {
        CreateBucketConfiguration: {
          LocationConstraint: this.region as any,
        },
      }),
    }));
  }

  async deleteBucket(bucketName: string): Promise<void> {
    await this.client.send(new DeleteBucketCommand({
      Bucket: bucketName,
    }));
  }

  async setBucketPolicy(options: BucketPolicyOptions): Promise<void> {
    await this.client.send(new PutBucketPolicyCommand({
      Bucket: options.bucket,
      Policy: JSON.stringify(options.policy),
    }));
  }

  async setBucketWebsite(options: BucketWebsiteOptions): Promise<void> {
    await this.client.send(new PutBucketWebsiteCommand({
      Bucket: options.bucket,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: options.indexDocument || 'index.html',
        },
        ErrorDocument: {
          Key: options.errorDocument || 'index.html',
        },
      },
    }));
  }

  async setPublicAccessBlock(options: PublicAccessBlockOptions): Promise<void> {
    await this.client.send(new PutPublicAccessBlockCommand({
      Bucket: options.bucket,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: options.blockPublicAcls ?? true,
        IgnorePublicAcls: options.ignorePublicAcls ?? true,
        BlockPublicPolicy: options.blockPublicPolicy ?? true,
        RestrictPublicBuckets: options.restrictPublicBuckets ?? true,
      },
    }));
  }

  // Object Operations

  async uploadFile(options: UploadFileOptions): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      CacheControl: options.cacheControl,
    }));
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
  }

  async deleteObjects(bucket: string, keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const objects: ObjectIdentifier[] = keys.map(key => ({ Key: key }));

    await this.client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: objects,
        Quiet: true,
      },
    }));
  }

  async copyObject(options: CopyObjectOptions): Promise<void> {
    await this.client.send(new CopyObjectCommand({
      Bucket: options.destinationBucket,
      Key: options.destinationKey,
      CopySource: `${options.sourceBucket}/${options.sourceKey}`,
      ContentType: options.contentType,
      MetadataDirective: options.contentType ? 'REPLACE' : 'COPY',
    }));
  }

  async listObjects(options: ListObjectsOptions): Promise<ListObjectsResult> {
    const response = await this.client.send(new ListObjectsV2Command({
      Bucket: options.bucket,
      Prefix: options.prefix,
      ContinuationToken: options.continuationToken,
      MaxKeys: options.maxKeys,
    }));

    return {
      contents: (response.Contents || []).map(obj => ({
        key: obj.Key!,
        size: obj.Size,
        lastModified: obj.LastModified,
      })),
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    };
  }

  async listAllObjects(bucket: string, prefix?: string): Promise<Array<{ key: string; size?: number }>> {
    const allObjects: Array<{ key: string; size?: number }> = [];
    let continuationToken: string | undefined;

    do {
      const result = await this.listObjects({
        bucket,
        prefix,
        continuationToken,
      });

      allObjects.push(...result.contents);
      continuationToken = result.nextContinuationToken;
    } while (continuationToken);

    return allObjects;
  }

  async emptyBucket(bucket: string): Promise<number> {
    let totalDeleted = 0;
    let continuationToken: string | undefined;

    do {
      const result = await this.listObjects({
        bucket,
        continuationToken,
      });

      if (result.contents.length > 0) {
        const keys = result.contents.map(obj => obj.key);
        await this.deleteObjects(bucket, keys);
        totalDeleted += keys.length;
      }

      continuationToken = result.nextContinuationToken;
    } while (continuationToken);

    return totalDeleted;
  }

  // Presigned URL Operations

  async getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
      ContentType: options.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 900, // 15 minutes default
    });
  }

  // Utility Methods

  extractKeyFromUrl(url: string, bucket: string): string | null {
    // Handle CloudFront URLs
    if (url.includes('cloudfront.net')) {
      const match = url.match(/cloudfront\.net\/(.+)/);
      return match ? match[1] : null;
    }

    // Handle S3 URLs
    const patterns = [
      // https://bucket.s3.region.amazonaws.com/key
      new RegExp(`${bucket}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`),
      // https://bucket.s3.amazonaws.com/key
      new RegExp(`${bucket}\\.s3\\.amazonaws\\.com/(.+)`),
      // https://s3.region.amazonaws.com/bucket/key
      new RegExp(`s3\\.[^/]+\\.amazonaws\\.com/${bucket}/(.+)`),
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  buildS3Url(bucket: string, key: string): string {
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
