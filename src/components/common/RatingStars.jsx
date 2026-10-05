import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  showNumber = false
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[...Array(max)].map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starNumber)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              color: isFilled ? '#F59E0B' : '#E5E7EB',
              outline: 'none'
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#F59E0B' : 'transparent'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {showNumber && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2933', marginLeft: '4px' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
