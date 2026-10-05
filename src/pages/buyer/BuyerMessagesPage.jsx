import React from 'react';
import { ChatApp } from '../../components/chat/ChatApp';

export const BuyerMessagesPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages & Coordination</h1>
          <p className="page-description">
            Direct 1-on-1 real-time messaging with sellers whose offers you have accepted.
          </p>
        </div>
      </div>

      <ChatApp role="buyer" />
    </div>
  );
};
