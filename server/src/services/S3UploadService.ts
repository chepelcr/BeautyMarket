import { S3Dao } from '../aws-daos';

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class S3UploadService {
  private s3Dao: S3Dao;
  private bucketName: string;
  private cloudfrontDomain: string;

  constructor(s3Dao?: S3Dao) {
    this.s3Dao = s3Dao || new S3Dao();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || 'd1taomm62uzhjk.cloudfront.net';
  }

  // Generate presigned URL for direct upload to S3
  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: string = 'uploads'
  ): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
    // Use 'images' folder for CMS images to preserve them during deployments
    const actualFolder = folder === 'uploads' ? 'images' : folder;
    const key = `${actualFolder}/${Date.now()}-${fileName}`;

    const uploadUrl = await this.s3Dao.getPresignedUploadUrl({
      bucket: this.bucketName,
      key,
      contentType: fileType,
      expiresIn: 900, // 15 minutes
    });

    // Use CloudFront URL for consistent image delivery
    const fileUrl = `https://${this.cloudfrontDomain}/${key}`;

    return { uploadUrl, fileUrl, s3Key: key };
  }

  // Delete file from S3
  async deleteS3File(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl || !this.bucketName) return false;

      // Extract key from URL using the centralized service
      const key = this.s3Dao.extractKeyFromUrl(fileUrl, this.bucketName);
      if (!key) return false;

      await this.s3Dao.deleteObject(this.bucketName, key);

      return true;
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      return false;
    }
  }

  // Validate bucket configuration
  validateConfiguration(): boolean {
    return !!this.bucketName;
  }
}
