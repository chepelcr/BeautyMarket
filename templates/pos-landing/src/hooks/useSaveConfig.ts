import { useState } from 'react';
import { useConfigContext } from '@/context/ConfigContext';
import { saveConfig } from '@/lib/configApi';
import type { AppConfig } from '@/types';

export function useSaveConfig() {
  const { config, setConfig } = useConfigContext();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState(false);

  const save = async (updates?: Partial<AppConfig>) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const next = updates ? { ...config, ...updates } : config;
    try {
      await saveConfig(next);
      setConfig(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error, saved };
}
