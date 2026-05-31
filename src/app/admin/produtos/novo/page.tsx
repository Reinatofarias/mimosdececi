"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { createProduct, uploadImage } from '../actions';
import { UploadCloud } from 'lucide-react';

export default function NovoProduto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    cost_price: '',
    original_price: '',
    featured: false,
    active: true,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrls: string[] = [];
      
      // Upload all selected files sequentially
      for (const file of imageFiles) {
        const fileData = new FormData();
        fileData.append('file', file);
        const uploadResult = await uploadImage(fileData);
        if (uploadResult.success) {
          imageUrls.push(uploadResult.url!);
        } else {
          alert(`Erro ao fazer upload da imagem "${file.name}": ` + uploadResult.error);
          setLoading(false);
          return;
        }
      }

      // Convert price (ex: 50,00 -> 5000)
      const priceCents = Math.round(parseFloat(formData.price.replace(',', '.')) * 100);
      const originalPriceCents = formData.original_price 
        ? Math.round(parseFloat(formData.original_price.replace(',', '.')) * 100) 
        : null;
      const costPriceCents = formData.cost_price 
        ? Math.round(parseFloat(formData.cost_price.replace(',', '.')) * 100) 
        : 0;

      // Generate a simple slug
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

      const result = await createProduct({
        name: formData.name,
        slug,
        description: formData.description,
        short_description: formData.short_description,
        price: priceCents,
        cost_price: costPriceCents,
        original_price: originalPriceCents,
        images: imageUrls,
        featured: formData.featured,
        active: formData.active
      });

      if (result.success) {
        alert('Produto criado com sucesso!');
        router.push('/admin/produtos');
      } else {
        alert('Erro ao salvar produto: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', fontFamily: 'var(--font-admin)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-xl)', color: 'var(--color-text)' }}>Novo Produto</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        {/* Informações Básicas */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Informações Básicas</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nome do Produto *</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                placeholder="Ex: Cesta de Café da Manhã Premium"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Descrição Curta (Vitrine) *</label>
              <input 
                type="text" 
                required 
                maxLength={100}
                value={formData.short_description}
                onChange={e => setFormData({...formData, short_description: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                placeholder="Ex: Deliciosa cesta para começar o dia bem."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Descrição Completa</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical', outline: 'none' }}
                placeholder="Detalhes completos do que vem na cesta, medidas, etc..."
              />
            </div>
          </div>
        </div>

        {/* Preço e Imagem */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Preço */}
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Preço</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Preço de Venda (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Preço Original (opcional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.original_price}
                  onChange={e => setFormData({...formData, original_price: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                  placeholder="Preço antigo para mostrar promoção"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Custo de Produção/Compra (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.cost_price}
                  onChange={e => setFormData({...formData, cost_price: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                  placeholder="Quanto custou para fazer/comprar"
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Fotos do Produto</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {imagePreviews.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(239, 122, 136, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Remover Foto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--color-surface-active)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={32} color="var(--color-text-muted)" />
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleImageChange}
                id="image-upload"
                style={{ display: 'none' }}
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} style={{ width: '100%' }}>
                Adicionar Fotos
              </Button>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
                Você pode selecionar e enviar várias fotos juntas.
              </p>
            </div>
          </div>
        </div>

        {/* Visibilidade */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-xl)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={formData.active}
              onChange={e => setFormData({...formData, active: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 500, fontSize: '14px' }}>Produto Ativo (Visível no Site)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={formData.featured}
              onChange={e => setFormData({...formData, featured: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 500, fontSize: '14px' }}>Destacar na Vitrine Inicial</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Salvar Mimo
          </Button>
        </div>

      </form>
      
      <style>{`
        input:focus, textarea:focus {
          border-color: var(--color-primary-dark) !important;
          box-shadow: 0 0 0 3px rgba(244, 146, 158, 0.15);
        }
      `}</style>
    </div>
  );
}
