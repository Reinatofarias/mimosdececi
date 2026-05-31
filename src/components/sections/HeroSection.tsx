import React from 'react';
import { Button } from '../ui/Button/Button';
import { Gift, Info } from 'lucide-react';
import Link from 'next/link';
import { FadeIn } from '../ui/FadeIn/FadeIn';

export function HeroSection() {
  return (
    <section style={{
      background: 'radial-gradient(120% 120% at 50% 0%, var(--color-primary-lightest) 0%, var(--color-bg) 75%)',
      padding: 'var(--space-4xl) 0 var(--space-3xl)',
      textAlign: 'center',
      borderBottom: '1px solid var(--color-border)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs for visual depth */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'var(--color-primary-lighter)',
        opacity: 0.15,
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        opacity: 0.12,
        filter: 'blur(70px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <FadeIn delay={0.2} duration={0.8}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)',
            maxWidth: '850px',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-2xl) var(--space-xl)',
            boxShadow: '0 8px 32px rgba(244, 146, 158, 0.1)'
          }}>

        {/* Custom Decorative Heading */}
        <h1 style={{ 
          fontSize: 'var(--text-5xl)', 
          color: 'var(--color-text)',
          marginBottom: 'var(--space-sm)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
          maxWidth: '750px'
        }}>
          Presentes feitos com o{' '}
          <span style={{ 
            color: 'var(--color-primary-darker)', 
            fontFamily: 'var(--font-accent)', 
            fontWeight: 'normal', 
            fontSize: 'var(--text-6xl)', 
            display: 'inline-block',
            transform: 'rotate(-2deg) translateY(4px)',
            marginLeft: '4px'
          }}>
            coração
          </span>
        </h1>
        
        {/* Supporting Copy */}
        <p style={{ 
          fontSize: 'var(--text-lg)', 
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
          maxWidth: '650px',
          margin: '0 auto var(--space-md)'
        }}>
          Transformamos momentos especiais em lembranças inesquecíveis. 
          Descubra nossas cestas artesanais, mimos exclusivos e kits sob medida feitos para surpreender quem você ama.
        </p>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-md)', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          marginTop: 'var(--space-sm)'
        }}>
          <Link href="/catalogo">
            <Button variant="primary" size="lg" leftIcon={<Gift size={18} />} style={{ boxShadow: 'var(--shadow-pink)', transition: 'transform 0.2s' }} className="hero-cta-btn">
              Explorar Catálogo
            </Button>
          </Link>
          <Link href="/sobre">
            <Button variant="outline" size="lg" leftIcon={<Info size={18} />}>
              Nossa História
            </Button>
          </Link>
        </div>

        </div>
        </FadeIn>
      </div>
      <style>{`
        .hero-cta-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
