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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product.images?.[0] || '');
  
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = product.images?.[0] || '';
      if (imageFile) {
        const fileData = new FormData();
        fileData.append('file', imageFile);
        const uploadResult = await uploadImage(fileData);
        if (uploadResult.success) {
          imageUrl = uploadResult.url!;
        } else {
          alert('Erro ao fazer upload da imagem: ' + uploadResult.error);
          setLoading(false);
          return;
        }
      }

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
        images: imageUrl ? [imageUrl] : [],
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      
      {/* Informações Básicas */}
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Informações Básicas</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nome do Produto *</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descrição Curta (Vitrine) *</label>
            <input 
              type="text" 
              required 
              maxLength={100}
              value={formData.short_description}
              onChange={e => setFormData({...formData, short_description: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descrição Completa</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Preço e Imagem */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Preço</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Preço de Venda (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                required 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Preço Original (opcional)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.original_price}
                onChange={e => setFormData({...formData, original_price: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Imagem Principal</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            ) : (
              <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-surface-active)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={40} color="var(--color-text-muted)" />
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              id="image-upload"
              style={{ display: 'none' }}
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
              Alterar Imagem
            </Button>
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
          <span style={{ fontWeight: 500 }}>Produto Ativo (Visível)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={formData.featured}
            onChange={e => setFormData({...formData, featured: e.target.checked})}
            style={{ width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: 500 }}>Destacar na Home</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="lg" isLoading={loading}>
          Atualizar Produto
        </Button>
      </div>

    </form>
  );
}
