import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

export interface StsClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface CallerIdentity {
  userId: string;
  account: string;
  arn: string;
}

export class StsDao {
  private client: STSClient;
  private accountIdCache?: string;

  constructor(config?: StsClientConfig) {
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

    this.client = new STSClient(clientConfig);
  }

  /**
   * Get caller identity information
   */
  async getCallerIdentity(): Promise<CallerIdentity> {
    const response = await this.client.send(new GetCallerIdentityCommand({}));

    return {
      userId: response.UserId || '',
      account: response.Account || '',
      arn: response.Arn || '',
    };
  }

  /**
   * Get AWS Account ID (with caching)
   */
  async getAccountId(): Promise<string> {
    if (this.accountIdCache) {
      return this.accountIdCache;
    }

    const identity = await this.getCallerIdentity();
    this.accountIdCache = identity.account;
    return this.accountIdCache;
  }
}
