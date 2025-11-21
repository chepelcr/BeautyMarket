import { Router, Request, Response } from 'express';
import { S3UploadService } from '../services';

export class S3UploadController {
  constructor(private s3UploadService: S3UploadService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.post('/presigned', this.handlePresignedUpload.bind(this));
    router.post('/upload', this.handlePresignedUpload.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/upload/presigned:
   *   post:
   *     summary: Get presigned URL for S3 upload
   *     tags: [Upload]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fileName
   *               - fileType
   *             properties:
   *               fileName:
   *                 type: string
   *               fileType:
   *                 type: string
   *               folder:
   *                 type: string
   *     responses:
   *       200:
   *         description: Presigned URL generated
   */
  async handlePresignedUpload(req: Request, res: Response) {
    try {
      const { fileName, fileType, folder } = req.body;

      if (!fileName || !fileType) {
        return res.status(400).json({
          success: false,
          error: 'fileName and fileType are required'
        });
      }

      if (!this.s3UploadService.validateConfiguration()) {
        return res.status(500).json({
          success: false,
          error: 'AWS S3 bucket not configured'
        });
      }

      const { uploadUrl, fileUrl, s3Key } = await this.s3UploadService.getPresignedUploadUrl(
        fileName,
        fileType,
        folder
      );

      res.json({
        success: true,
        uploadUrl,
        fileUrl,
        s3Key,
      });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate upload URL'
      });
    }
  }
}
