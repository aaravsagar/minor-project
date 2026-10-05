import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  onClick,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#2457A6',
          color: '#FFFFFF',
          border: '1px solid #2457A6'
        };
      case 'secondary':
        return {
          backgroundColor: '#F3F4F6',
          color: '#1F2933',
          border: '1px solid #E2E5E9'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#2457A6',
          border: '1px solid #BCD0EE'
        };
      case 'danger':
        return {
          backgroundColor: '#B42318',
          color: '#FFFFFF',
          border: '1px solid #B42318'
        };
      case 'success':
        return {
          backgroundColor: '#287D3C',
          color: '#FFFFFF',
          border: '1px solid #287D3C'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#667085',
          border: '1px solid transparent'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '5px 10px', fontSize: '12.5px', height: '30px' };
      case 'lg':
        return { padding: '10px 20px', fontSize: '15px', height: '42px' };
      case 'md':
      default:
        return { padding: '7px 14px', fontSize: '13.5px', height: '36px' };
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        borderRadius: '6px',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
        whiteSpace: 'nowrap',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`btn ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
};
