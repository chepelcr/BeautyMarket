import type { AppConfig } from '@/types';

export async function getConfig(): Promise<AppConfig> {
  const res = await fetch('/config.json');
  if (!res.ok) throw new Error('Failed to load config.json');
  return res.json();
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const res = await fetch('/api/config', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Failed to save config');
  }
}
