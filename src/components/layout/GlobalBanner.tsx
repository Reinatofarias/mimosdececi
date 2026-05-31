"use client";

import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (bannerData?.active && bannerData?.text) {
      setIsVisible(true);
    }
  }, [bannerData]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else if (currentScrollY < 100) {
        // Re-show if near top
        if (bannerData?.active && bannerData?.text) setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, bannerData]);

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
              onClick={() => setIsVisible(false)}
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
