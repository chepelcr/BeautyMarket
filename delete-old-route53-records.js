import 'dotenv/config';
import { Route53Client, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';

const HOSTED_ZONE_ID = process.env.HOSTED_ZONE_ID || 'Z05141403P1S3ULKPN7Z3';

const route53Client = new Route53Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const OLD_RECORDS = [
  { name: 'beauty-demo-example.j-markets.jcampos.dev.', target: 'd2g913p7fy7cbf.cloudfront.net.' },
  { name: 'beauty-salon-example.j-markets.jcampos.dev.', target: 'd2m8tidvf48e1t.cloudfront.net.' },
  { name: 'bella-natural-example.j-markets.jcampos.dev.', target: 'dipzf740pvzwf.cloudfront.net.' },
  { name: 'glam-studio-example.j-markets.jcampos.dev.', target: 'droqz87wu2k26.cloudfront.net.' },
  { name: 'pro-nails-example.j-markets.jcampos.dev.', target: 'd199frglt4oawk.cloudfront.net.' },
  { name: 'royal-hair-example.j-markets.jcampos.dev.', target: 'd2oh5zn4u4kjcx.cloudfront.net.' },
  { name: 'skin-love-example.j-markets.jcampos.dev.', target: 'dss6ul7nxkrws.cloudfront.net.' },
];

async function deleteOldRecords() {
  console.log('🗑️  Deleting old Route53 DNS records...\n');

  for (const record of OLD_RECORDS) {
    try {
      await route53Client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: HOSTED_ZONE_ID,
          ChangeBatch: {
            Comment: `Delete old record for ${record.name}`,
            Changes: [
              {
                Action: 'DELETE',
                ResourceRecordSet: {
                  Name: record.name,
                  Type: 'A',
                  AliasTarget: {
                    HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                    DNSName: record.target,
                    EvaluateTargetHealth: false,
                  },
                },
              },
            ],
          },
        })
      );
      console.log(`  ✅ Deleted ${record.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to delete ${record.name}:`, error.message);
    }
  }

  console.log('\n✅ All old DNS records deleted!');
}

deleteOldRecords();
