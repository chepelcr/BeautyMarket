import 'dotenv/config';
import { CloudFrontClient, GetDistributionConfigCommand, UpdateDistributionCommand, DeleteDistributionCommand } from '@aws-sdk/client-cloudfront';

const client = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function deleteLast() {
  const id = 'E2E30Z1LPL4C9N';

  try {
    // Get config
    const configResp = await client.send(new GetDistributionConfigCommand({ Id: id }));
    const config = configResp.DistributionConfig;
    const etag = configResp.ETag;

    // Disable
    config.Enabled = false;
    await client.send(new UpdateDistributionCommand({ Id: id, DistributionConfig: config, IfMatch: etag }));
    console.log('✅ Disabled, waiting 3 minutes...');

    await new Promise(r => setTimeout(r, 180000));

    // Get new ETag and delete
    const newConfigResp = await client.send(new GetDistributionConfigCommand({ Id: id }));
    const newEtag = newConfigResp.ETag;

    await client.send(new DeleteDistributionCommand({ Id: id, IfMatch: newEtag }));
    console.log('✅ Deleted E2E30Z1LPL4C9N');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteLast();
