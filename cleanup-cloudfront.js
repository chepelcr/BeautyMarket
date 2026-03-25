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

/**
 * Delete CloudFront distributions for template organizations
 */
async function cleanupTemplateDistributions() {
  try {
    console.log('🧹 Finding template CloudFront distributions to delete...\n');

    // List all distributions
    const listResponse = await cloudFrontClient.send(new ListDistributionsCommand({}));
    const allDistributions = listResponse.DistributionList?.Items || [];

    // Filter template distributions (those with "example.j-markets.jcampos.dev" in comment)
    const templateDistributions = allDistributions.filter((dist) =>
      dist.Comment?.includes('example.j-markets.jcampos.dev')
    );

    console.log(`Found ${templateDistributions.length} template distributions to delete:\n`);

    if (templateDistributions.length === 0) {
      console.log('✅ No template distributions found to clean up');
      return;
    }

    // Display what will be deleted
    templateDistributions.forEach((dist) => {
      console.log(`  - ${dist.Id}: ${dist.Comment || 'No comment'} (${dist.Status})`);
    });

    console.log('\n⏳ Disabling and deleting distributions (this may take a while)...\n');

    // Disable and delete each distribution
    let successCount = 0;
    let failedCount = 0;

    for (const dist of templateDistributions) {
      try {
        console.log(`Processing ${dist.Id}...`);

        // Get current distribution config
        const configResponse = await cloudFrontClient.send(
          new GetDistributionConfigCommand({ Id: dist.Id })
        );

        const config = configResponse.DistributionConfig;
        const etag = configResponse.ETag;

        // If already disabled, just delete
        if (!config.Enabled) {
          console.log(`  Distribution already disabled, deleting...`);
          await cloudFrontClient.send(
            new DeleteDistributionCommand({ Id: dist.Id, IfMatch: etag })
          );
          console.log(`  ✅ Deleted ${dist.Id}\n`);
          successCount++;
          continue;
        }

        // Disable the distribution first
        console.log(`  Disabling distribution...`);
        config.Enabled = false;

        await cloudFrontClient.send(
          new UpdateDistributionCommand({
            Id: dist.Id,
            DistributionConfig: config,
            IfMatch: etag,
          })
        );

        console.log(`  ✅ Disabled ${dist.Id}`);
        console.log(`  ℹ️  Wait for distribution to deploy (status: Deployed), then delete manually`);
        console.log(`     Command: aws cloudfront delete-distribution --id ${dist.Id} --if-match <new-etag>\n`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to process ${dist.Id}:`, error.message);
        failedCount++;
      }
    }

    console.log('\n📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total distributions found: ${templateDistributions.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log('\n📝 IMPORTANT: Disabled distributions need to deploy before deletion.');
    console.log('   Check CloudFront console in 15-20 minutes, then run this script again');
    console.log('   or delete manually using the AWS console.\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupTemplateDistributions();
