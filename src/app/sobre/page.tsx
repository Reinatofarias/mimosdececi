import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 3600; // 1 hora

export default function AboutPage() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: 'var(--color-bg-warm)', minHeight: '100vh', padding: 'var(--space-3xl) 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-3xl)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center'
          }}>
            <h1 className="text-accent" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-lg)' }}>
              Sobre a Mimos de Ceci
            </h1>
            
            <div style={{ 
              color: 'var(--color-text-secondary)', 
              lineHeight: 1.8, 
              fontSize: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              textAlign: 'left'
            }}>
              <p>
                A <strong>Mimos de Ceci</strong> nasceu da paixão por eternizar momentos e arrancar sorrisos de quem mais amamos.
              </p>
              <p>
                Acreditamos que um presente não é apenas um objeto, mas uma forma de carinho, gratidão e amor embalados com todo o cuidado. Cada cesta, cada kit e cada detalhe é pensado exclusivamente para tornar a sua data comemorativa inesquecível.
              </p>
              <p>
                Trabalhamos com produtos selecionados, chocolates de alta qualidade e decorações artesanais. Tudo feito sob medida para impressionar.
              </p>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>Fale Conosco</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong>WhatsApp:</strong> (81) 99226-5790<br/>
                <strong>E-mail:</strong> contato@mimosdececi.com.br
              </p>
            </div>
            
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
