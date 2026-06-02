"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { saveSettings } from './actions';
import type { GlobalBannerSettings, StoreSettingsFormData } from './actions';
import type { SettingsMap } from '@/lib/dal/settings';

interface SettingsFormProps {
  initialData: SettingsMap;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultBanner: GlobalBannerSettings = {
    active: false,
    text: '',
    backgroundColor: '#F4929E',
    textColor: '#FFFFFF',
  };
  
  const [formData, setFormData] = useState<StoreSettingsFormData>({
    whatsapp_number: initialData.whatsapp_number || '',
    global_banner: {
      ...defaultBanner,
      ...initialData.global_banner,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await saveSettings(formData);
    
    if (result.success) {
      alert('Configurações salvas com sucesso!');
      router.refresh();
    } else {
      alert('Erro ao salvar: ' + result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      
      {/* WhatsApp */}
      <section style={{ backgroundColor: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>Atendimento (WhatsApp)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 600 }}>Número do WhatsApp (apenas números)</label>
          <input
            type="text"
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') })}
            placeholder="Ex: 5581992265790"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
          />
        </div>
      </section>

      {/* Global Banner */}
      <section style={{ backgroundColor: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>Faixa de Aviso (Topo do site)</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.global_banner.active}
              onChange={(e) => setFormData({ 
                ...formData, 
                global_banner: { ...formData.global_banner, active: e.target.checked } 
              })}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: 600 }}>Ativar Faixa de Aviso</span>
          </label>

          {formData.global_banner.active && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Texto do Aviso</label>
                <input
                  type="text"
                  value={formData.global_banner.text}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    global_banner: { ...formData.global_banner, text: e.target.value } 
                  })}
                  placeholder="Ex: Frete grátis para todo o Brasil!"
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label>Cor de Fundo</label>
                  <input
                    type="color"
                    value={formData.global_banner.backgroundColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      global_banner: { ...formData.global_banner, backgroundColor: e.target.value } 
                    })}
                    style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label>Cor do Texto</label>
                  <input
                    type="color"
                    value={formData.global_banner.textColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      global_banner: { ...formData.global_banner, textColor: e.target.value } 
                    })}
                    style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <div>
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}
