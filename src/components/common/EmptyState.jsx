import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records matching your request at this time.',
  actionText,
  onAction,
  actionIcon,
  style = {}
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px dashed #D0D5DD',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#F3F4F6',
          color: '#667085',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#667085', maxWidth: '380px', marginBottom: actionText ? '18px' : 0, lineHeight: 1.4 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} icon={actionIcon} size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
