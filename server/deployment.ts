import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { storage } from './storage';

const execAsync = promisify(exec);

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

async function configureBucketWebsite(): Promise<void> {
  if (!BUCKET_NAME) return;
  
  console.log('🌐 Configuring S3 bucket for website hosting...');
  
  try {
    const websiteParams = {
      Bucket: BUCKET_NAME,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: 'index.html'
        },
        ErrorDocument: {
          Key: 'index.html' // Serve index.html for all 404s to enable SPA routing
        }
      }
    };
    
    await s3.putBucketWebsite(websiteParams).promise();
    console.log('✅ S3 bucket configured for SPA website hosting');
  } catch (error) {
    console.warn('⚠️ Could not configure bucket website settings (may need manual setup):', error.message);
  }
}

interface DeploymentStatus {
  status: 'idle' | 'building' | 'uploading' | 'success' | 'error';
  message: string;
  timestamp: Date;
  buildId?: string;
}

let currentDeployment: DeploymentStatus = {
  status: 'idle',
  message: 'Ready to deploy',
  timestamp: new Date()
};

export async function getDeploymentStatus(): Promise<DeploymentStatus> {
  return currentDeployment;
}

async function uploadFile(filePath: string, key: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath);
  const mime = await import('mime-types');
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params: any = {
    Bucket: BUCKET_NAME!,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    // Removed ACL since bucket doesn't allow ACLs
  };

  // Set cache control for different file types
  if (contentType.startsWith('text/html')) {
    params.CacheControl = 'no-cache';
  } else if (contentType.startsWith('image/') || contentType.startsWith('font/')) {
    params.CacheControl = 'max-age=31536000'; // 1 year
  } else {
    params.CacheControl = 'max-age=86400'; // 1 day
  }

  await s3.upload(params).promise();
}

async function uploadDirectory(dirPath: string, prefix = '', preserveImages = true): Promise<void> {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const key = prefix ? `${prefix}/${file}` : file;
    
    // Skip existing images directory to preserve uploaded images during deployment
    if (preserveImages && key === 'images') {
      console.log(`⚠️  Skipping images directory to preserve uploaded content`);
      continue;
    }
    
    if (fs.statSync(filePath).isDirectory()) {
      await uploadDirectory(filePath, key, preserveImages);
    } else {
      await uploadFile(filePath, key);
    }
  }
}

async function deleteExistingAssets(): Promise<void> {
  if (!BUCKET_NAME) return;
  
  console.log('🗑️  Cleaning up existing client assets...');
  
  // List all objects except images directory
  const listParams = {
    Bucket: BUCKET_NAME,
    Prefix: '', 
  };
  
  const objects = await s3.listObjectsV2(listParams).promise();
  
  if (objects.Contents && objects.Contents.length > 0) {
    // Filter out images directory to preserve uploaded images
    const objectsToDelete = objects.Contents.filter(obj => 
      obj.Key && !obj.Key.startsWith('images/')
    );
    
    if (objectsToDelete.length > 0) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objectsToDelete.map(obj => ({ Key: obj.Key! })),
          Quiet: true
        }
      };
      
      await s3.deleteObjects(deleteParams).promise();
      console.log(`✅ Deleted ${objectsToDelete.length} existing assets (preserved images directory)`);
    }
  }
}

export async function deployToS3(buildId: string = Date.now().toString()): Promise<boolean> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
  }

  let deploymentRecord: any;

  try {
    // Create deployment record
    deploymentRecord = await storage.createDeployment({
      buildId,
      status: 'building',
      message: 'Building application...',
      deployUrl: `https://${BUCKET_NAME}.s3-website.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`
    });

    currentDeployment = {
      status: 'building',
      message: 'Building application...',
      timestamp: new Date(),
      buildId
    };

    // Build the application
    console.log('🔨 Building application...');
    const { stdout, stderr } = await execAsync('node build-static.js', {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes timeout
    });

    if (stderr && !stderr.includes('warnings')) {
      console.error('Build stderr:', stderr);
    }

    // Update deployment record to uploading
    if (deploymentRecord) {
      await storage.updateDeployment(deploymentRecord.id, {
        status: 'uploading',
        message: 'Uploading to S3...'
      });
    }

    currentDeployment = {
      status: 'uploading',
      message: 'Uploading to S3...',
      timestamp: new Date(),
      buildId
    };

    const distFolder = './dist/public';
    if (!fs.existsSync(distFolder)) {
      throw new Error('Build folder not found. Build may have failed.');
    }

    // Clean up existing assets (but preserve images)
    await deleteExistingAssets();
    
    // Configure S3 bucket for website hosting
    await configureBucketWebsite();
    
    // Upload to S3
    console.log('📤 Uploading to S3...');
    await uploadDirectory(distFolder);

    const deployUrl = `https://${BUCKET_NAME}.s3-website.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

    // Update deployment record to success
    if (deploymentRecord) {
      await storage.updateDeployment(deploymentRecord.id, {
        status: 'success',
        message: 'Successfully deployed!',
        completedAt: new Date(),
        filesUploaded: await countFiles(distFolder)
      });
    }

    currentDeployment = {
      status: 'success',
      message: `Successfully deployed! Website URL: ${deployUrl}`,
      timestamp: new Date(),
      buildId
    };

    console.log('🎉 Deployment completed successfully!');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
    
    // Update deployment record to error
    if (deploymentRecord) {
      await storage.updateDeployment(deploymentRecord.id, {
        status: 'error',
        message: `Deployment failed: ${errorMessage}`,
        completedAt: new Date(),
        errorDetails: errorMessage
      });
    }
    
    currentDeployment = {
      status: 'error',
      message: `Deployment failed: ${errorMessage}`,
      timestamp: new Date(),
      buildId
    };

    console.error('❌ Deployment failed:', error);
    return false;
  }
}

async function countFiles(dirPath: string): Promise<number> {
  let count = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      count += await countFiles(filePath);
    } else {
      count++;
    }
  }
  
  return count;
}

// Auto-deploy function that can be called from CMS
export async function triggerAutoDeployment(): Promise<{ success: boolean; message: string }> {
  if (currentDeployment.status === 'building' || currentDeployment.status === 'uploading') {
    return {
      success: false,
      message: 'A deployment is already in progress'
    };
  }

  try {
    const buildId = `cms-${Date.now()}`;
    const success = await deployToS3(buildId);
    
    return {
      success,
      message: success 
        ? 'Deployment completed successfully!' 
        : 'Deployment failed. Check server logs for details.'
    };
  } catch (error) {
    return {
      success: false,
      message: `Deployment error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}