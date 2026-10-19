import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageSquare, Clock } from 'lucide-react';
import { orderChatService } from '../../../services';
import type { ChatMessageItem, MessageSenderRole } from '../../../types/order';
import './OrderChatDrawer.css';

interface OrderChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  partnerName: string;
  partnerAvatar?: string;
  partnerHeadline?: string;
  orderTitle?: string;
  quotedPrice?: number;
  currentUserRole: MessageSenderRole;
}

export function OrderChatDrawer({
  isOpen,
  onClose,
  requestId,
  partnerName,
  partnerAvatar,
  partnerHeadline,
  orderTitle,
  quotedPrice,
  currentUserRole,
}: OrderChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && requestId) {
      loadMessages(true);
      // Auto-poll messages every 4 seconds
      const timer = setInterval(() => {
        loadMessages(false);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isOpen, requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (isFirstLoad: boolean) => {
    if (!requestId) return;
    try {
      if (isFirstLoad) setLoading(true);
      const data = await orderChatService.getMessages(requestId);
      setMessages(data);
      setErrorMsg(null);
    } catch (err: any) {
      if (isFirstLoad) {
        setErrorMsg(err.message || 'Không thể tải cuộc trò chuyện.');
      }
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !requestId || sending) return;

    try {
      setSending(true);
      const newMsg = await orderChatService.sendMessage(requestId, {
        content: inputText.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-drawer-backdrop" onClick={onClose}>
      <div 
        className="chat-drawer-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="chat-drawer-header">
          <div className="chat-partner-info">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} className="chat-partner-avatar" />
            ) : (
              <div className="chat-partner-avatar-fallback">
                {partnerName ? partnerName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="chat-partner-name-row">
                <h3 className="chat-partner-name">{partnerName}</h3>
                {quotedPrice && quotedPrice > 0 && (
                  <span className="chat-price-badge">
                    {quotedPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>
              <p className="chat-order-context">
                {partnerHeadline ? partnerHeadline : (orderTitle ? `Đơn: ${orderTitle}` : 'Trao đổi báo giá')}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="chat-close-btn" 
            onClick={onClose}
            aria-label="Đóng chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Body */}
        <div className="chat-messages-body">
          {errorMsg && (
            <div className="chat-error-notice">
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="chat-loading-state">
              <Loader2 size={28} className="spin-icon" />
              <p>Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <MessageSquare size={36} className="chat-empty-icon" />
              <p className="chat-empty-title">Chưa có tin nhắn nào</p>
              <p className="chat-empty-sub">
                Hãy gửi tin nhắn để trao đổi chi tiết về sự cố, giá cả và thời gian hẹn nhé!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : 'partner'}`}>
                  <div className="chat-bubble">
                    <p className="chat-text">{msg.content}</p>
                    <span className="chat-timestamp">
                      <Clock size={11} /> {formattedTime}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="chat-input-footer">
          <input
            type="text"
            className="chat-input-field"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending || loading}
          />
          <button 
            type="submit" 
            className="chat-send-btn" 
            disabled={!inputText.trim() || sending || loading}
            aria-label="Gửi tin nhắn"
          >
            {sending ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
