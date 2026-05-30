import { Button } from '@/components/ui/Button/Button';
import { Gift } from 'lucide-react';

export default function Home() {
  return (
    <main className="container" style={{ padding: 'var(--space-2xl) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)', textAlign: 'center' }}>
      <header>
        <h1 style={{ color: 'var(--color-primary)' }}>Mimos de Ceci</h1>
        <p className="text-accent" style={{ fontSize: 'var(--text-2xl)' }}>Presentes Personalizados</p>
      </header>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
          Transformamos momentos especiais em presentes inesquecíveis. 
          Descubra nossas cestas, kits e mimos feitos com amor.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary" size="lg" leftIcon={<Gift size={20} />}>
          Ver Catálogo
        </Button>
        <Button variant="whatsapp" size="lg">
          Falar no WhatsApp
        </Button>
      </div>
    </main>
  );
}
