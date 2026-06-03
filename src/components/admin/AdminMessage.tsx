import React from 'react';

type AdminMessageProps = {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onDismiss?: () => void;
};

const styles = {
  success: { background: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  error: { background: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  warning: { background: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  info: { background: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
};

export function AdminMessage({ type, children, onDismiss }: AdminMessageProps) {
  const colors = styles[type];

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: colors.background,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            border: 0,
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          Fechar
        </button>
      )}
    </div>
  );
}
