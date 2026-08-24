/**
 * MetaTab Component
 * Orchestrator for meta information and URLs
 */

import { useConfig } from '@/hooks/useConfig';
import { TextField, TextAreaField } from './components';
import { DefaultLanguageSection } from './meta/DefaultLanguageSection';

export function MetaTab() {
  const { config, setConfig } = useConfig();
  const meta = config.meta;

  const set = (key: keyof typeof meta, val: string) =>
    setConfig({ ...config, meta: { ...meta, [key]: val } });

  return (
    <div className="space-y-6">
      {/* URLs and Metadata */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
          URLs y Metadatos
        </h3>
        <TextField
          label="App URL (Login / Iniciar sesión)"
          type="url"
          value={meta.appUrl}
          onChange={val => set('appUrl', val)}
          placeholder="https://pos-system.tsuru.jcampos.dev"
          hint="Hacia dónde apuntan los botones 'Iniciar sesión' — tanto en el nav como en la sección CTA."
        />

        <TextField
          label="URL del Sitio"
          type="url"
          value={meta.siteUrl}
          onChange={val => set('siteUrl', val)}
        />

        <TextField
          label="Título del Sitio"
          value={meta.siteTitle}
          onChange={val => set('siteTitle', val)}
        />

        <TextAreaField
          label="Descripción del Sitio"
          value={meta.siteDescription}
          onChange={val => set('siteDescription', val)}
          rows={2}
        />
      </div>

      {/* Default Language - Last */}
      <DefaultLanguageSection />
    </div>
  );
}
