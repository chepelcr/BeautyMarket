import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class SesDao {
  private client: SESClient;

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
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
