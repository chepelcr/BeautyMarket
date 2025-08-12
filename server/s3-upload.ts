import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Request, Response } from 'express';

// Configure AWS S3 Client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Generate presigned URL for direct upload to S3
export const getPresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    ACL: 'public-read', // Make files publicly accessible
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
};

// Get presigned URL endpoint
export const handlePresignedUpload = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, folder } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ 
        success: false, 
        error: 'fileName and fileType are required' 
      });
    }

    if (!BUCKET_NAME) {
      return res.status(500).json({ 
        success: false, 
        error: 'AWS S3 bucket not configured' 
      });
    }

    const { uploadUrl, fileUrl } = await getPresignedUploadUrl(fileName, fileType, folder);

    res.json({
      success: true,
      uploadUrl,
      fileUrl,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate upload URL' 
    });
  }
};

// Delete file from S3
export const deleteS3File = async (fileUrl: string): Promise<boolean> => {
  try {
    if (!fileUrl || !BUCKET_NAME) return false;
    
    // Extract key from URL
    const key = fileUrl.split(`${BUCKET_NAME}.s3.`)[1]?.split('/').slice(1).join('/');
    if (!key) return false;

    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();

    return true;
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    return false;
  }
};