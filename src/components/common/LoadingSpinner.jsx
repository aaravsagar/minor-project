import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', minHeight = '200px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '12px',
        color: '#667085',
        fontSize: '13.5px'
      }}
    >
      <Loader2 size={28} className="animate-spin" color="#2457A6" style={{ animation: 'spin 1s linear infinite' }} />
      <span>{text}</span>
    </div>
  );
};
