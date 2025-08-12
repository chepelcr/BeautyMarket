const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const DIST_FOLDER = './dist';

if (!BUCKET_NAME) {
  console.error('❌ AWS_S3_BUCKET_NAME environment variable is required');
  process.exit(1);
}

async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  };

  // Set cache control for different file types
  if (contentType.startsWith('text/html')) {
    params.CacheControl = 'no-cache';
  } else if (contentType.startsWith('image/') || contentType.startsWith('font/')) {
    params.CacheControl = 'max-age=31536000'; // 1 year
  } else {
    params.CacheControl = 'max-age=86400'; // 1 day
  }

  return s3.upload(params).promise();
}

async function uploadDirectory(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);
  const uploadPromises = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const key = prefix ? `${prefix}/${file}` : file;
    
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively upload subdirectories
      const subPromises = await uploadDirectory(filePath, key);
      uploadPromises.push(...subPromises);
    } else {
      uploadPromises.push(
        uploadFile(filePath, key).then(() => {
          console.log(`✅ Uploaded: ${key}`);
        }).catch(err => {
          console.error(`❌ Failed to upload ${key}:`, err.message);
        })
      );
    }
  }

  return uploadPromises;
}

async function deploy() {
  try {
    console.log(`🚀 Starting deployment to S3 bucket: ${BUCKET_NAME}`);
    
    if (!fs.existsSync(DIST_FOLDER)) {
      console.error(`❌ Distribution folder ${DIST_FOLDER} does not exist. Run 'npm run build' first.`);
      process.exit(1);
    }

    const uploadPromises = await uploadDirectory(DIST_FOLDER);
    await Promise.all(uploadPromises);
    
    console.log('🎉 Deployment completed successfully!');
    console.log(`🌐 Website URL: https://${BUCKET_NAME}.s3-website.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`);
    console.log('📝 Make sure your S3 bucket is configured for static website hosting.');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();