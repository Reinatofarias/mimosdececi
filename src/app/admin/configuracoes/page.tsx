import React from 'react';
import { getSettings } from '@/lib/dal/settings';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>Configurações Gerais</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Gerencie o número de atendimento, os banners promocionais e outras opções da loja.
        </p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
