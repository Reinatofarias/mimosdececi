"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GlobalBannerProps {
  bannerData: {
    active: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
  };
}

export function GlobalBanner({ bannerData }: GlobalBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const lastScrollYRef = useRef(0);
  const isVisible = Boolean(bannerData?.active && bannerData?.text && !isDismissed && !isHiddenByScroll);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHiddenByScroll(currentScrollY > 100 && currentScrollY > lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: bannerData.backgroundColor || 'var(--color-primary)',
            color: bannerData.textColor || '#fff',
            position: 'relative',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div className="container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '12px var(--space-xl)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.5px' }}>
              {bannerData.text}
            </p>
            <button 
              onClick={() => setIsDismissed(true)}
              style={{ 
                position: 'absolute', 
                right: 'var(--space-md)', 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
