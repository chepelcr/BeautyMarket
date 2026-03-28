import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { OrganizationRegisteredEvent } from '../events/OrganizationRegisteredEvent';
import type { OrganizationRegisteredData } from '../events/OrganizationRegisteredEvent';
import { appConfig } from '../config/appConfig';

/**
 * Publishes organization domain events to the SNS topic.
 *
 * Required env var:
 *   ORGANIZATION_TOPIC_ARN — SNS topic ARN for organization events
 *   AWS_REGION             — AWS region (defaults to us-east-1)
 *
 * If ORGANIZATION_TOPIC_ARN is not set, publish calls are silently skipped
 * so the service works in local development without SNS configured.
 */
export class OrganizationEventPublisher {
  private readonly sns: SNSClient;

  constructor() {
    this.sns = new SNSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
  }

  async publishOrganizationRegistered(data: OrganizationRegisteredData): Promise<void> {
    const topicArn = await appConfig.getKey('sns.organization-topic-arn');
    if (!topicArn) {
      console.warn('[OrganizationEventPublisher] sns.organization-topic-arn is not set. Skipping SNS publish.');
      return;
    }

    const event = new OrganizationRegisteredEvent(data);
    const message = JSON.stringify(event.toSqsMessage());

    await this.sns.send(new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      Subject: event.eventType,
      MessageAttributes: {
        eventType: { DataType: 'String', StringValue: event.eventType },
      },
    }));

    console.log(`[OrganizationEventPublisher] Published ${event.eventType} for org id: ${data.id}`);
  }
}
