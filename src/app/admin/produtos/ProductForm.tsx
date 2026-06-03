"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, GripVertical, UploadCloud, X } from 'lucide-react';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import type { Category, Product } from '@/lib/types/database';
import { createProduct, deleteUploadedProductImages, updateProduct, uploadImage } from './actions';

type ProductFormProps = {
  mode: 'create' | 'edit';
  categories: Category[];
  product?: Product;
};

type FormMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

type ImageEntry = {
  preview: string;
  file?: File;
};

function moneyToCents(value: string) {
  if (!value.trim()) return 0;
  return Math.round(parseFloat(value.replace(',', '.')) * 100);
}

function parseVariations(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, priceDelta] = line.split('|').map((part) => part.trim());
      return {
        name,
        price_delta: priceDelta ? moneyToCents(priceDelta) : 0,
      };
    });
}

function formatMoney(cents?: number | null) {
  if (!cents) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function ProductForm({ mode, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>(() => (product?.images || []).map((preview) => ({ preview })));
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: formatMoney(product?.price),
    cost_price: formatMoney(product?.cost_price),
    original_price: formatMoney(product?.original_price),
    category_id: product?.category_id || '',
    featured: product?.featured || false,
    product_status: product?.product_status || (product?.active === false ? 'draft' : 'published'),
    availability: product?.availability || 'available',
    stock_quantity: String(product?.stock_quantity || 0),
    variations: product?.variations?.map((variation) => `${variation.name}${variation.price_delta ? ` | ${formatMoney(variation.price_delta)}` : ''}`).join('\n') || '',
  });

  const previewProduct = useMemo(() => ({
    name: formData.name || 'Novo mimo',
    price: moneyToCents(formData.price),
    short_description: formData.short_description || 'Descrição curta do produto',
    image: imageEntries[0]?.preview || '/logo-compact.png',
  }), [formData.name, formData.price, formData.short_description, imageEntries]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageEntries((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageEntries((prev) => {
      const removed = prev[index];
      if (removed?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageEntries.length) return;
    setImageEntries((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    moveImage(dragIndex, index);
    setDragIndex(null);
  };

  const uploadOrderedImages = async () => {
    const orderedImages: string[] = [];
    const uploadedUrls: string[] = [];

    for (const entry of imageEntries) {
      if (!entry.file) {
        orderedImages.push(entry.preview);
        continue;
      }

      const fileData = new FormData();
      fileData.append('file', entry.file);
      const uploadResult = await uploadImage(fileData);

      if (uploadResult.success && uploadResult.url) {
        orderedImages.push(uploadResult.url);
        uploadedUrls.push(uploadResult.url);
      } else {
        if (uploadedUrls.length > 0) await deleteUploadedProductImages(uploadedUrls);
        throw new Error(`Erro ao enviar "${entry.file.name}": ${uploadResult.error || 'falha sem detalhe'}`);
      }
    }

    return { orderedImages, uploadedUrls };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const existingUrls = imageEntries.filter((entry) => !entry.file).map((entry) => entry.preview);
      const { orderedImages, uploadedUrls } = await uploadOrderedImages();

      const productStatus = formData.product_status as 'draft' | 'published' | 'archived';
      const payload = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        price: moneyToCents(formData.price),
        cost_price: moneyToCents(formData.cost_price),
        original_price: formData.original_price ? moneyToCents(formData.original_price) : null,
        category_id: formData.category_id || null,
        images: orderedImages.length > 0 ? orderedImages : existingUrls,
        featured: formData.featured,
        active: productStatus === 'published',
        product_status: productStatus,
        availability: formData.availability as 'available' | 'made_to_order' | 'sold_out' | 'hidden',
        stock_quantity: Number(formData.stock_quantity || 0),
        variations: parseVariations(formData.variations),
      };

      const result = mode === 'create'
        ? await createProduct(payload)
        : await updateProduct(product!.id, payload);

      if (!result.success) {
        if (uploadedUrls.length > 0) {
          await deleteUploadedProductImages(uploadedUrls);
        }
        setMessage({ type: 'error', text: result.error || 'Não foi possível salvar o produto.' });
        return;
      }

      setMessage({ type: 'success', text: mode === 'create' ? 'Produto criado com sucesso.' : 'Produto atualizado com sucesso.' });
      router.push('/admin/produtos');
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 'var(--space-xl)', alignItems: 'start' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', fontFamily: 'var(--font-admin)' }}>
        {message && (
          <AdminMessage type={message.type} onDismiss={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        )}

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>Informações Básicas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Nome do Produto *</span>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Descrição Curta *</span>
              <input required maxLength={100} value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Categoria</span>
              <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                <option value="">Nenhuma / Sem Categoria</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Descrição Completa</span>
              <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }} />
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Preço e Estoque</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                ['price', 'Preço de Venda (R$) *'],
                ['original_price', 'Preço Original (opcional)'],
                ['cost_price', 'Custo de Produção/Compra (R$)'],
                ['stock_quantity', 'Estoque disponível'],
              ].map(([key, label]) => (
                <label key={key}>
                  <span style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>{label}</span>
                  <input type="number" step={key === 'stock_quantity' ? '1' : '0.01'} required={key === 'price'} value={formData[key as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </label>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Fotos do Produto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: 10, minHeight: 92 }}>
              {imageEntries.map((entry, index) => (
                <div
                  key={`${entry.preview}-${index}`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: index === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', cursor: 'grab' }}
                  title={index === 0 ? 'Capa do produto' : 'Arraste para reordenar'}
                >
                  <Image src={entry.preview} alt={`Foto ${index + 1}`} fill unoptimized={entry.preview.startsWith('blob:')} style={{ objectFit: 'cover' }} />
                  <GripVertical size={16} style={{ position: 'absolute', left: 4, top: 4, color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' }} />
                  {index === 0 && <span style={{ position: 'absolute', left: 4, bottom: 4, background: 'var(--color-primary-dark)', color: 'white', fontSize: 9, padding: '2px 5px', borderRadius: 4 }}>CAPA</span>}
                  <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 0, background: 'rgba(239, 122, 136, .95)', color: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              {imageEntries.length === 0 && <div style={{ height: 120, gridColumn: '1/-1', backgroundColor: 'var(--color-surface-active)', borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center' }}><UploadCloud size={32} color="var(--color-text-muted)" /></div>}
            </div>
            <input id="product-image-upload" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            <Button type="button" variant="outline" onClick={() => document.getElementById('product-image-upload')?.click()} style={{ width: '100%', marginTop: 12 }}>Adicionar Fotos</Button>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>Arraste as fotos para ordenar. A primeira é a capa.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Publicação e Variações</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Status</span>
              <select value={formData.product_status} onChange={(e) => setFormData({ ...formData, product_status: e.target.value as 'draft' | 'published' | 'archived' })} style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Disponibilidade</span>
              <select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value as 'available' | 'made_to_order' | 'sold_out' | 'hidden' })} style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <option value="available">Disponível</option>
                <option value="made_to_order">Sob encomenda</option>
                <option value="sold_out">Esgotado</option>
                <option value="hidden">Oculto</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
            Destacar na Vitrine Inicial
          </label>
          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Variações simples</span>
            <textarea rows={3} value={formData.variations} onChange={(e) => setFormData({ ...formData, variations: e.target.value })} placeholder="Ex: Tamanho família | 20,00" style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
          <Button type="button" variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>{mode === 'create' ? 'Salvar Mimo' : 'Atualizar Mimo'}</Button>
        </div>
      </form>

      <aside style={{ position: 'sticky', top: 100, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700 }}>
          <Eye size={18} />
          Preview
        </div>
        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-bg-warm)' }}>
          <Image src={previewProduct.image} alt={previewProduct.name} fill unoptimized={previewProduct.image.startsWith('blob:')} style={{ objectFit: 'cover' }} />
        </div>
        <h3 style={{ margin: '12px 0 4px', fontSize: 18 }}>{previewProduct.name}</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{previewProduct.short_description}</p>
        <strong style={{ color: 'var(--color-primary-dark)', fontSize: 22 }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(previewProduct.price / 100)}
        </strong>
      </aside>
    </div>
  );
}
