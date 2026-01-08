import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SesClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class SesDao {
  private client: SESClient;

  constructor(config?: SesClientConfig) {
    const region = config?.region || process.env.AWS_REGION || 'us-east-1';

    const clientConfig: any = { region };

    if (config?.credentials) {
      clientConfig.credentials = config.credentials;
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new SESClient(clientConfig);
  }

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    const command = new SendEmailCommand({
      Source: options.from,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: options.htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: options.textBody,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await this.client.send(command);

    return {
      messageId: response.MessageId || '',
    };
  }
}
