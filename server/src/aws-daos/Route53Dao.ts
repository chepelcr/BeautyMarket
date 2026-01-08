import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  type ResourceRecordSet,
} from '@aws-sdk/client-route-53';

export interface Route53ClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface CreateRecordOptions {
  hostedZoneId: string;
  recordName: string;
  recordType: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  target: string;
  ttl?: number;
  aliasTarget?: {
    hostedZoneId: string;
    dnsName: string;
    evaluateTargetHealth: boolean;
  };
}

export interface DeleteRecordOptions {
  hostedZoneId: string;
  recordName: string;
  recordType: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  target: string;
  aliasTarget?: {
    hostedZoneId: string;
    dnsName: string;
    evaluateTargetHealth: boolean;
  };
}

export interface ListRecordsOptions {
  hostedZoneId: string;
  recordName?: string;
  recordType?: string;
}

export class Route53Dao {
  private client: Route53Client;

  constructor(config?: Route53ClientConfig) {
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

    this.client = new Route53Client(clientConfig);
  }

  /**
   * Create a DNS record (A record alias to CloudFront or standard record)
   */
  async createRecord(options: CreateRecordOptions): Promise<{ changeId: string }> {
    const resourceRecordSet: any = {
      Name: options.recordName,
      Type: options.recordType,
    };

    if (options.aliasTarget) {
      // Alias record (e.g., to CloudFront)
      resourceRecordSet.AliasTarget = {
        HostedZoneId: options.aliasTarget.hostedZoneId,
        DNSName: options.aliasTarget.dnsName,
        EvaluateTargetHealth: options.aliasTarget.evaluateTargetHealth,
      };
    } else {
      // Standard record
      resourceRecordSet.TTL = options.ttl || 300;
      resourceRecordSet.ResourceRecords = [{ Value: options.target }];
    }

    const response = await this.client.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: options.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'CREATE',
          ResourceRecordSet: resourceRecordSet,
        }],
      },
    }));

    return {
      changeId: response.ChangeInfo?.Id || '',
    };
  }

  /**
   * Delete a DNS record
   */
  async deleteRecord(options: DeleteRecordOptions): Promise<{ changeId: string }> {
    const resourceRecordSet: any = {
      Name: options.recordName,
      Type: options.recordType,
    };

    if (options.aliasTarget) {
      // Alias record (e.g., to CloudFront)
      resourceRecordSet.AliasTarget = {
        HostedZoneId: options.aliasTarget.hostedZoneId,
        DNSName: options.aliasTarget.dnsName,
        EvaluateTargetHealth: options.aliasTarget.evaluateTargetHealth,
      };
    } else {
      // Standard record - need TTL and value for deletion
      resourceRecordSet.TTL = 300;
      resourceRecordSet.ResourceRecords = [{ Value: options.target }];
    }

    const response = await this.client.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: options.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'DELETE',
          ResourceRecordSet: resourceRecordSet,
        }],
      },
    }));

    return {
      changeId: response.ChangeInfo?.Id || '',
    };
  }

  /**
   * List DNS records in a hosted zone
   */
  async listRecords(options: ListRecordsOptions): Promise<ResourceRecordSet[]> {
    const response = await this.client.send(new ListResourceRecordSetsCommand({
      HostedZoneId: options.hostedZoneId,
      StartRecordName: options.recordName,
      StartRecordType: options.recordType as any,
    }));

    return response.ResourceRecordSets || [];
  }
}
