import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { messageService } from '../../services/messageService';
import { formatCurrency, formatDate, timeAgo } from '../../utils/formatters';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { 
  Send, 
  MessageSquare, 
  User, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Phone 
} from 'lucide-react';

export const ChatApp = ({ role = 'buyer' }) => {
  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Listen to user conversations in real-time
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoadingConvs(true);
    const unsubscribe = messageService.subscribeToUserConversations(
      currentUser.uid,
      (convList) => {
        setConversations(convList);
        setLoadingConvs(false);
        // Automatically select first conversation if none selected
        setActiveConversation(prev => {
          if (!prev && convList.length > 0) return convList[0];
          if (prev) {
            // sync active with latest
            const found = convList.find(c => c.id === prev.id);
            return found || prev;
          }
          return null;
        });
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Listen to messages for active conversation in real-time
  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = messageService.subscribeToMessages(
      activeConversation.id,
      (msgs) => {
        setMessages(msgs);
      }
    );

    return () => unsubscribe();
  }, [activeConversation?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation || sending) return;

    const receiverId = role === 'buyer' ? activeConversation.sellerId : activeConversation.buyerId;

    try {
      setSending(true);
      const messageText = text;
      setText(''); // optimistic clear

      await messageService.sendMessage({
        conversationId: activeConversation.id,
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName || (role === 'buyer' ? 'Buyer' : 'Seller'),
        receiverId,
        text: messageText
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loadingConvs) {
    return <LoadingSpinner text="Connecting to realtime chat service..." />;
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E5E9',
        borderRadius: '8px',
        display: 'flex',
        height: '620px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Sidebar: Conversation Threads */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid #E2E5E9',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8FAFC'
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E5E9', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
            Matched Conversations ({conversations.length})
          </h3>
          <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '2px' }}>
            Real-time chat enabled upon deal acceptance
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#667085', fontSize: '13px' }}>
              No active conversations yet. Once a buyer accepts a pitch, a private chat thread will open here.
            </div>
          ) : (
            conversations.map((conv) => {
              const otherPartyName = role === 'buyer' ? conv.sellerName : conv.buyerName;
              const isSelected = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #E2E5E9',
                    backgroundColor: isSelected ? '#EBF2FC' : '#FFFFFF',
                    borderLeft: isSelected ? '3px solid #2457A6' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2933' }}>
                      {otherPartyName}
                    </div>
                    <span style={{ fontSize: '11px', color: '#667085' }}>
                      {timeAgo(conv.updatedAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#2457A6', marginBottom: '3px' }}>
                    {conv.requirementTitle}
                  </div>

                  <div style={{ fontSize: '12px', color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage || 'No messages yet'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        {activeConversation ? (
          <>
            {/* Chat Top Header */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #E2E5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAFAFA'
              }}
            >
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1F2933' }}>
                  {role === 'buyer' ? activeConversation.sellerName : activeConversation.buyerName}
                </div>
                <div style={{ fontSize: '12px', color: '#667085' }}>
                  Regarding: <strong>{activeConversation.requirementTitle}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#287D3C', fontWeight: 500 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#287D3C' }} />
                Realtime Connected
              </div>
            </div>

            {/* Messages Feed */}
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#F7F7F5'
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#667085', fontSize: '13px' }}>
                  <MessageSquare size={32} style={{ color: '#BCD0EE', margin: '0 auto 8px' }} />
                  <div>No messages yet in this conversation.</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Send a message below to coordinate delivery.</div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '10px 14px',
                          borderRadius: isMe ? '8px 8px 1px 8px' : '8px 8px 8px 1px',
                          backgroundColor: isMe ? '#2457A6' : '#FFFFFF',
                          color: isMe ? '#FFFFFF' : '#1F2933',
                          border: isMe ? 'none' : '1px solid #E2E5E9',
                          fontSize: '13.5px',
                          lineHeight: 1.45,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.text}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#667085',
                          marginTop: '3px',
                          paddingLeft: isMe ? 0 : '4px',
                          paddingRight: isMe ? '4px' : 0
                        }}
                      >
                        {msg.senderName} • {formatDate(msg.createdAt, true)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #E2E5E9',
                display: 'flex',
                gap: '10px',
                backgroundColor: '#FFFFFF'
              }}
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message to coordinate handover or delivery..."
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #E2E5E9',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
                disabled={sending}
              />
              <Button
                type="submit"
                variant="primary"
                icon={Send}
                disabled={!text.trim() || sending}
                loading={sending}
              >
                Send
              </Button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No Conversation Selected"
            description="Select a conversation thread from the left to start sending messages."
          />
        )}
      </div>
    </div>
  );
};
