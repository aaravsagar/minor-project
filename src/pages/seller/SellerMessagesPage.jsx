import React from 'react';
import { ChatApp } from '../../components/chat/ChatApp';

export const SellerMessagesPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages & Buyer Inquiries</h1>
          <p className="page-description">
            Live 1-to-1 conversation with buyers whose requirements you are fulfilling.
          </p>
        </div>
      </div>

      <ChatApp role="seller" />
    </div>
  );
};
