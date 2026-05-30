"use client";

import React, { useState, useTransition } from 'react';
import { updateOrderStatus } from './actions';

interface StatusSelectProps {
  orderId: string;
  initialStatus: string;
}

export function StatusSelect({ orderId, initialStatus }: StatusSelectProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'new': return '#FFC107'; // Amarelo
      case 'confirmed': return '#2196F3'; // Azul
      case 'in_production': return '#9C27B0'; // Roxo
      case 'ready': return '#FF9800'; // Laranja
      case 'delivered': return '#4CAF50'; // Verde
      case 'cancelled': return '#F44336'; // Vermelho
      default: return '#9e9e9e';
    }
  };

  return (
    <select 
      value={status} 
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: '4px 8px',
        borderRadius: '20px',
        border: `1px solid ${getStatusColor(status)}`,
        backgroundColor: `${getStatusColor(status)}20`, // 20% opacity
        color: getStatusColor(status),
        fontWeight: 600,
        fontSize: '12px',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      <option value="new">Novo</option>
      <option value="confirmed">Confirmado</option>
      <option value="in_production">Em Produção</option>
      <option value="ready">Pronto</option>
      <option value="delivered">Entregue</option>
      <option value="cancelled">Cancelado</option>
    </select>
  );
}
