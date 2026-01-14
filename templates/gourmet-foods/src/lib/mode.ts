export type AppMode = 'demo' | 'prod';

export interface ModeConfig {
  mode: AppMode;
  id: string;
  subdomain: string;
}

let cachedConfig: ModeConfig | null = null;

export async function detectMode(): Promise<ModeConfig> {
  if (cachedConfig) return cachedConfig;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const subdomain = parts[0];

  try {
    const response = await fetch('/config.json');
    const config = await response.json();

    cachedConfig = {
      mode: config.mode,
      id: config.mode === 'demo' ? config.templateId : config.orgId,
      subdomain,
    };

    return cachedConfig;
  } catch {
    // Fallback to subdomain detection
    const isDemo = subdomain.endsWith('-example');
    const templateName = isDemo ? subdomain.replace('-example', '') : subdomain;

    cachedConfig = {
      mode: isDemo ? 'demo' : 'prod',
      id: templateName,
      subdomain,
    };

    return cachedConfig;
  }
}

export function detectModeSync(): ModeConfig {
  if (cachedConfig) return cachedConfig;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const subdomain = parts[0];
  const isDemo = subdomain.endsWith('-example');
  const templateName = isDemo ? subdomain.replace('-example', '') : subdomain;

  return {
    mode: isDemo ? 'demo' : 'prod',
    id: templateName,
    subdomain,
  };
}
