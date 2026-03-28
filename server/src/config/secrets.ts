import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { appConfig } from './appConfig';

// ---------------------------------------------------------------------------
// secrets.ts — Database credential resolution following the shared-db-secrets pattern.
//
// Resolution chain:
//   1. NEW_DATABASE_URL env var → use directly (local dev, skips all AWS calls)
//   2. SSM /jcampos/{env}/jmarkets/aws/database → returns Secrets Manager secret NAME
//   3. Secrets Manager GetSecretValue(secretName) → JSON { host, port, username, password, dbname }
//   4. Build postgres:// connection URL
// ---------------------------------------------------------------------------

interface DatabaseSecret {
  host: string;
  port: number | string;
  username: string;
  password: string;
  dbname: string;
}

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Module-level cache — persists across warm Lambda invocations
let _cachedUrl: string | undefined;

/**
 * Resolve the PostgreSQL connection URL.
 * On subsequent calls returns the cached URL (never re-fetches on warm invocations).
 */
export async function getDatabaseUrl(): Promise<string> {
  if (_cachedUrl) return _cachedUrl;

  // 1. Local dev fast-path: use env var directly
  const envUrl = process.env.NEW_DATABASE_URL || process.env.DATABASE_URL;
  if (envUrl) {
    _cachedUrl = envUrl;
    return _cachedUrl;
  }

  // 2. Fetch secret name from SSM via AppConfig
  const secretName = await appConfig.getKey('aws.database');
  if (!secretName) {
    throw new Error(
      'Database credentials not found. ' +
      'Set NEW_DATABASE_URL env var (local dev) or deploy SSM params stack (Lambda).'
    );
  }

  // 3. Fetch credentials from Secrets Manager
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);

  if (!response.SecretString) {
    throw new Error(`Secrets Manager secret "${secretName}" has no SecretString`);
  }

  const secret: DatabaseSecret = JSON.parse(response.SecretString);
  const { host, port, username, password, dbname } = secret;

  if (!host || !username || !password || !dbname) {
    throw new Error(
      `Secrets Manager secret "${secretName}" is missing required fields ` +
      '(expected: host, port, username, password, dbname)'
    );
  }

  _cachedUrl = `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port ?? 5432}/${dbname}`;
  return _cachedUrl;
}
