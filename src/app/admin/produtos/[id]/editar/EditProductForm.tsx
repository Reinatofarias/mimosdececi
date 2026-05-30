"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { updateProduct, uploadImage } from '../../actions';
import { UploadCloud } from 'lucide-react';
import type { Product } from '@/lib/types/database';

interface EditProductFormProps {
  product: Product;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    short_description: product.short_description || '',
    price: (product.price / 100).toFixed(2).replace('.', ','),
    original_price: product.original_price ? (product.original_price / 100).toFixed(2).replace('.', ',') : '',
    featured: product.featured || false,
    active: product.active || false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...files]);
      
      const previews = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload all staged new image files sequentially
      for (const file of newImageFiles) {
        const fileData = new FormData();
        fileData.append('file', file);
        const uploadResult = await uploadImage(fileData);
        if (uploadResult.success) {
          uploadedUrls.push(uploadResult.url!);
        } else {
          alert(`Erro ao fazer upload da imagem "${file.name}": ` + uploadResult.error);
          setLoading(false);
          return;
        }
      }

      // Combine remaining existing images + newly uploaded URLs
      const allImages = [...existingImages, ...uploadedUrls];

      const priceCents = Math.round(parseFloat(formData.price.replace(',', '.')) * 100);
      const originalPriceCents = formData.original_price 
        ? Math.round(parseFloat(formData.original_price.replace(',', '.')) * 100) 
        : null;

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const result = await updateProduct(product.id, {
        name: formData.name,
        slug,
        description: formData.description,
        short_description: formData.short_description,
        price: priceCents,
        original_price: originalPriceCents,
        images: allImages,
        featured: formData.featured,
        active: formData.active
      });

      if (result.success) {
        alert('Produto atualizado com sucesso!');
        router.push('/admin/produtos');
      } else {
        alert('Erro ao atualizar produto: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', fontFamily: 'var(--font-admin)' }}>
      
      {/* Informações Básicas */}
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Informações Básicas</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nome do Mimo *</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
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
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Descrição Completa</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Preço e Fotos */}
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
              />
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Fotos do Produto</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {(existingImages.length > 0 || newImagePreviews.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img src={img} alt={`Salva ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
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

                {/* New Previews */}
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-primary-light)' }}>
                    <img src={preview} alt={`Nova Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '2px', left: '2px', backgroundColor: 'var(--color-primary-dark)', color: 'white', fontSize: '7px', padding: '1px 3px', borderRadius: '2px', fontWeight: 'bold' }}>NOVA</span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
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
              Adicionar Novas Fotos
            </Button>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
              Suas fotos existentes são salvas. Você pode adicionar mais arquivos de uma vez.
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
          Atualizar Mimo
        </Button>
      </div>
      
      <style>{`
        input:focus, textarea:focus {
          border-color: var(--color-primary-dark) !important;
          box-shadow: 0 0 0 3px rgba(244, 146, 158, 0.15);
        }
      `}</style>
    </form>
  );
}
