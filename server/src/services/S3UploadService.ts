import { S3Dao } from '../aws-daos';
import { appConfig } from '../config/appConfig';

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class S3UploadService {
  private s3Dao: S3Dao;

  constructor(s3Dao?: S3Dao) {
    this.s3Dao = s3Dao || new S3Dao();
  }

  // Generate presigned URL for direct upload to S3
  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: string = 'uploads'
  ): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
    const bucketName = await appConfig.getKey('s3.bucket') ?? '';
    const cloudfrontDomain = await appConfig.getKey('cloudfront.domain', 'd1taomm62uzhjk.cloudfront.net') ?? 'd1taomm62uzhjk.cloudfront.net';

    // Use 'images' folder for CMS images to preserve them during deployments
    const actualFolder = folder === 'uploads' ? 'images' : folder;
    const key = `${actualFolder}/${Date.now()}-${fileName}`;

    const uploadUrl = await this.s3Dao.getPresignedUploadUrl({
      bucket: bucketName,
      key,
      contentType: fileType,
      expiresIn: 900, // 15 minutes
    });

    // Use CloudFront URL for consistent image delivery
    const fileUrl = `https://${cloudfrontDomain}/${key}`;

    return { uploadUrl, fileUrl, s3Key: key };
  }

  // Delete file from S3
  async deleteS3File(fileUrl: string): Promise<boolean> {
    try {
      const bucketName = await appConfig.getKey('s3.bucket') ?? '';
      if (!fileUrl || !bucketName) return false;

      // Extract key from URL using the centralized service
      const key = this.s3Dao.extractKeyFromUrl(fileUrl, bucketName);
      if (!key) return false;

      await this.s3Dao.deleteObject(bucketName, key);

      return true;
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      return false;
    }
  }

  // Validate bucket configuration
  async validateConfiguration(): Promise<boolean> {
    const bucketName = await appConfig.getKey('s3.bucket') ?? '';
    return !!bucketName;
  }
}
