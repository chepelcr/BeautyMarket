import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// AppConfig — TypeScript equivalent of the Python shared AppConfig class.
//
// Resolution order for every key (dot-notation):
//   1. SSM Parameter Store  ({ssmpath}/{dot-key → slash-path})  ← primary
//   2. Environment variable  (UPPER_SNAKE_CASE of dot key)      ← local dev
//   3. default argument                                         ← fallback
//
// Key mapping examples:
//   "cognito.user-pool-id" → SSM: {ssmpath}/cognito/user-pool-id
//   "cognito.user-pool-id" → env: COGNITO_USER_POOL_ID
//   "aws.database"         → SSM: {ssmpath}/aws/database
//   "aws.database"         → env: AWS_DATABASE
//
// settings.cfg format (INI):
//   [PRODUCTION]
//   ssmpath = /jcampos/prod/jmarkets
//   [DEVELOPMENT]
//   ssmpath = /jcampos/dev/jmarkets
// ---------------------------------------------------------------------------

interface SsmCacheEntry {
  value: string;
  expiresAt: number;
}

const SSM_TTL_MS = 5 * 60 * 1000; // 5 minutes, same as Python implementation

class AppConfig {
  private ssmBasePath: string;
  private ssmClient: SSMClient;
  private cache: Map<string, SsmCacheEntry> = new Map();

  constructor() {
    this.ssmBasePath = this._resolveSsmBasePath();
    this.ssmClient = new SSMClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Resolve a dot-notation config key.
   * Resolution order: SSM → env var → defaultValue
   */
  async getKey(dotKey: string, defaultValue?: string): Promise<string | undefined> {
    // 1. SSM Parameter Store
    const ssmValue = await this._getFromSsm(dotKey);
    if (ssmValue !== undefined) return ssmValue;

    // 2. Environment variable
    const envValue = this._getFromEnv(dotKey);
    if (envValue !== undefined) return envValue;

    // 3. Default
    return defaultValue;
  }

  /**
   * Same as getKey but throws if the value is not found.
   */
  async requireKey(dotKey: string): Promise<string> {
    const value = await this.getKey(dotKey);
    if (value === undefined || value === '') {
      throw new Error(`Required config key "${dotKey}" not found in SSM or environment`);
    }
    return value;
  }

  getSsmBasePath(): string {
    return this.ssmBasePath;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _getFromSsm(dotKey: string): Promise<string | undefined> {
    const paramPath = `${this.ssmBasePath}/${dotKey.replace(/\./g, '/')}`;

    // Check cache
    const cached = this.cache.get(paramPath);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    try {
      const command = new GetParameterCommand({ Name: paramPath });
      const response = await this.ssmClient.send(command);
      const value = response.Parameter?.Value;

      if (value !== undefined) {
        this.cache.set(paramPath, { value, expiresAt: Date.now() + SSM_TTL_MS });
        return value;
      }
    } catch (err: any) {
      // ParameterNotFound is expected for optional keys — not an error
      if (err?.name !== 'ParameterNotFound') {
        console.warn(`[AppConfig] SSM lookup failed for "${paramPath}": ${err?.message}`);
      }
    }

    return undefined;
  }

  private _getFromEnv(dotKey: string): string | undefined {
    const envKey = dotKey.replace(/\./g, '_').replace(/-/g, '_').toUpperCase();
    const value = process.env[envKey];
    return value !== undefined && value !== '' ? value : undefined;
  }

  private _resolveSsmBasePath(): string {
    // SSM_BASE_PATH env var takes highest priority (set by Lambda template)
    if (process.env.SSM_BASE_PATH) {
      return process.env.SSM_BASE_PATH;
    }

    // Otherwise read settings.cfg relative to this file's location
    const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
    let section: string;

    if (nodeEnv === 'production') {
      section = 'PRODUCTION';
    } else if (nodeEnv === 'staging') {
      section = 'STAGING';
    } else {
      section = 'DEVELOPMENT';
    }

    try {
      // settings.cfg lives in server/ (two levels up from src/config/)
      const cfgPath = path.resolve(__dirname, '../../settings.cfg');
      const content = fs.readFileSync(cfgPath, 'utf-8');
      const ssmpath = this._parseIniSection(content, section, 'ssmpath');
      if (ssmpath) return ssmpath;
    } catch {
      // settings.cfg not found — fall through to default
    }

    // Final fallback
    return `/jcampos/dev/jmarkets`;
  }

  private _parseIniSection(content: string, section: string, key: string): string | undefined {
    const lines = content.split('\n');
    let inSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === `[${section}]`) {
        inSection = true;
        continue;
      }
      if (trimmed.startsWith('[') && inSection) {
        break; // moved to next section
      }
      if (inSection && trimmed.startsWith(key)) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          return trimmed.slice(eqIdx + 1).trim();
        }
      }
    }

    return undefined;
  }
}

// Module-level singleton — reused across warm Lambda invocations
export const appConfig = new AppConfig();

// ---------------------------------------------------------------------------
// initializeAppConfig — bridge SSM values into process.env at app startup.
//
// Call this once before starting the server (alongside initializeDatabase).
// Services that read process.env.X directly will pick up SSM values
// without requiring any changes to their code.
// ---------------------------------------------------------------------------

const SSM_TO_ENV_MAP: Array<{ key: string; envVar: string }> = [
  { key: 'cognito.user-pool-id',       envVar: 'AWS_COGNITO_USER_POOL_ID' },
  { key: 'cognito.client-id',          envVar: 'AWS_COGNITO_CLIENT_ID' },
  { key: 'sns.organization-topic-arn', envVar: 'ORGANIZATION_TOPIC_ARN' },
  { key: 's3.bucket',                  envVar: 'AWS_S3_BUCKET_NAME' },
  { key: 'email.from',                 envVar: 'FROM_EMAIL' },
  { key: 'frontend.url',               envVar: 'FRONTEND_URL' },
  { key: 'aws.region',                 envVar: 'AWS_REGION' },
];

export async function initializeAppConfig(): Promise<void> {
  await Promise.all(
    SSM_TO_ENV_MAP.map(async ({ key, envVar }) => {
      const value = await appConfig.getKey(key);
      if (value) {
        process.env[envVar] = value;
      }
    })
  );
}
