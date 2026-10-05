import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'active' | 'fulfilled' | 'closed' | 'pending' | 'accepted' | 'rejected' | 'open' | 'resolved' | 'match' | 'buyer' | 'seller' | 'admin' | 'info'
  size = 'md',
  style = {}
}) => {
  const getColors = () => {
    switch (variant.toLowerCase()) {
      case 'active':
      case 'accepted':
      case 'resolved':
      case 'seller':
        return { bg: '#EBF6EE', color: '#287D3C', border: '#B4E0C0' };
      case 'fulfilled':
      case 'match':
      case 'buyer':
        return { bg: '#EBF2FC', color: '#2457A6', border: '#BCD0EE' };
      case 'pending':
      case 'open':
        return { bg: '#FEF6EC', color: '#A15C00', border: '#FADCB3' };
      case 'closed':
      case 'rejected':
      case 'suspended':
      case 'danger':
        return { bg: '#FEF3F2', color: '#B42318', border: '#FECDCA' };
      case 'admin':
        return { bg: '#F4EBFF', color: '#6927DA', border: '#D8B4FE' };
      case 'info':
      default:
        return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
    }
  };

  const { bg, color, border } = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {children}
    </span>
  );
};
