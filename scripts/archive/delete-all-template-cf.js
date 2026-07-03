import 'dotenv/config';
import {
  CloudFrontClient,
  ListDistributionsCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
} from '@aws-sdk/client-cloudfront';

const REGION = process.env.AWS_REGION || 'us-east-1';

const cloudFrontClient = new CloudFrontClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function deleteAllTemplateDistributions() {
  try {
    console.log('🗑️  Deleting ALL template CloudFront distributions...\n');

    const listResponse = await cloudFrontClient.send(new ListDistributionsCommand({}));
    const allDistributions = listResponse.DistributionList?.Items || [];

    const templateDistributions = allDistributions.filter((dist) =>
      dist.Comment?.includes('example.tsuru.jcampos.dev')
    );

    console.log(`Found ${templateDistributions.length} template distributions\n`);

    const enabled = templateDistributions.filter(d => d.Enabled);
    const disabled = templateDistributions.filter(d => !d.Enabled);

    console.log(`  Enabled: ${enabled.length}`);
    console.log(`  Disabled: ${disabled.length}\n`);

    // Step 1: Delete all disabled distributions
    console.log('Step 1: Deleting disabled distributions...\n');
    for (const dist of disabled) {
      try {
        const configResponse = await cloudFrontClient.send(
          new GetDistributionConfigCommand({ Id: dist.Id })
        );
        const etag = configResponse.ETag;

        await cloudFrontClient.send(
          new DeleteDistributionCommand({ Id: dist.Id, IfMatch: etag })
        );
        console.log(`  ✅ Deleted ${dist.Id}`);
      } catch (error) {
        console.error(`  ❌ Failed to delete ${dist.Id}:`, error.message);
      }
    }

    // Step 2: Disable all enabled distributions
    console.log('\nStep 2: Disabling enabled distributions...\n');
    for (const dist of enabled) {
      try {
        const configResponse = await cloudFrontClient.send(
          new GetDistributionConfigCommand({ Id: dist.Id })
        );
        const config = configResponse.DistributionConfig;
        const etag = configResponse.ETag;

        config.Enabled = false;

        await cloudFrontClient.send(
          new UpdateDistributionCommand({
            Id: dist.Id,
            DistributionConfig: config,
            IfMatch: etag,
          })
        );
        console.log(`  ✅ Disabled ${dist.Id}`);
      } catch (error) {
        console.error(`  ❌ Failed to disable ${dist.Id}:`, error.message);
      }
    }

    // Step 3: Wait and delete newly disabled distributions
    if (enabled.length > 0) {
      console.log('\nStep 3: Waiting 3 minutes for distributions to deploy...');
      await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutes

      console.log('\nStep 3: Deleting newly disabled distributions...\n');
      for (const dist of enabled) {
        try {
          const configResponse = await cloudFrontClient.send(
            new GetDistributionConfigCommand({ Id: dist.Id })
          );
          const etag = configResponse.ETag;

          await cloudFrontClient.send(
            new DeleteDistributionCommand({ Id: dist.Id, IfMatch: etag })
          );
          console.log(`  ✅ Deleted ${dist.Id}`);
        } catch (error) {
          if (error.name === 'DistributionNotDisabled') {
            console.log(`  ⏳ ${dist.Id} still deploying, run script again later`);
          } else {
            console.error(`  ❌ Failed to delete ${dist.Id}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    process.exit(1);
  }
}

deleteAllTemplateDistributions();
