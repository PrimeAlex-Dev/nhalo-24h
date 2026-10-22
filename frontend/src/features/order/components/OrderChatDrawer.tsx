import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Loader2, 
  MessageSquare, 
  Sparkles, 
  User 
} from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && requestId) {
      loadMessages(true);
      // Auto-poll messages every 3.5 seconds
      const timer = setInterval(() => {
        loadMessages(false);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [isOpen, requestId]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !requestId || sending) return;

    const messageContent = inputText.trim();
    try {
      setSending(true);
      const newMsg = await orderChatService.sendMessage(requestId, {
        content: messageContent,
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      inputRef.current?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const suggestions = currentUserRole === 'CUSTOMER'
    ? [
        'Xin chào thợ, thời gian nào anh/chị có thể qua xem được?',
        'Mức giá báo này đã bao gồm tiền công và linh kiện chưa ạ?',
        'Tôi có đính kèm ảnh chi tiết sự cố trong đơn hàng rồi nhé.',
      ]
    : [
        'Xin chào quý khách, tôi có thể qua kiểm tra theo đúng giờ hẹn.',
        'Quý khách có thể mô tả kỹ hơn hiện tượng đang bị sự cố không ạ?',
        'Tôi đã xem ảnh sự cố và sẽ chuẩn bị sẵn thiết bị để xử lý.',
      ];

  const partnerRoleLabel = currentUserRole === 'CUSTOMER' ? 'Thợ chuyên nghiệp' : 'Khách hàng';

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
            <div className="chat-avatar-wrapper">
              {partnerAvatar ? (
                <img src={partnerAvatar} alt={partnerName} className="chat-partner-avatar" />
              ) : (
                <div className="chat-partner-avatar-fallback">
                  {partnerName ? partnerName.charAt(0).toUpperCase() : <User size={18} />}
                </div>
              )}
              <span className="chat-online-dot" title="Đang trực tuyến" />
            </div>

            <div className="chat-partner-text-meta">
              <div className="chat-partner-name-row">
                <h3 className="chat-partner-name">{partnerName}</h3>
                <span className="chat-role-pill">{partnerRoleLabel}</span>
              </div>
              <p className="chat-order-context" title={partnerHeadline || orderTitle || 'Trao đổi báo giá'}>
                {partnerHeadline ? partnerHeadline : (orderTitle ? `Đơn: ${orderTitle}` : 'Trao đổi trực tiếp')}
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            {quotedPrice && quotedPrice > 0 && (
              <div className="chat-header-price-tag" title="Mức giá báo">
                <span className="price-tag-sub">Báo giá</span>
                <span className="price-tag-val">{quotedPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <button 
              type="button" 
              className="chat-close-btn" 
              onClick={onClose}
              aria-label="Đóng chat"
              title="Đóng cửa sổ chat"
            >
              <X size={18} />
            </button>
          </div>
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
              <Loader2 size={32} className="spin-icon chat-spinner" />
              <p>Đang kết nối tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon-circle">
                <MessageSquare size={32} />
              </div>
              <h4 className="chat-empty-title">Bắt đầu cuộc trò chuyện</h4>
              <p className="chat-empty-sub">
                Trao đổi thêm về tình trạng sự cố, chốt thời gian đến nhà hoặc thương lượng chi tiết chi phí trước khi làm việc.
              </p>

              {/* Quick suggestions */}
              <div className="chat-suggestions-box">
                <div className="chat-suggestions-label">
                  <Sparkles size={13} />
                  <span>Gợi ý câu hỏi nhanh:</span>
                </div>
                <div className="chat-suggestions-list">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="chat-suggestion-chip"
                      onClick={() => handleSelectSuggestion(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-messages-stream">
              <div className="chat-conversation-start-badge">
                <span>Cuộc trò chuyện trao đổi báo giá</span>
              </div>

              {messages.map((msg) => {
                const isMine = msg.senderRole === currentUserRole;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : 'partner'}`}>
                    {!isMine && (
                      <div className="partner-mini-avatar-col">
                        {partnerAvatar ? (
                          <img src={partnerAvatar} alt="" className="partner-mini-avatar" />
                        ) : (
                          <div className="partner-mini-avatar fallback">
                            {partnerName ? partnerName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="chat-bubble">
                      <div className="chat-text">{msg.content}</div>
                      <div className="chat-bubble-meta">
                        <span className="chat-timestamp">{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="chat-input-footer">
          <div className="chat-input-bar">
            <input
              ref={inputRef}
              type="text"
              className="chat-input-field"
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending || loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={!inputText.trim() || sending || loading}
              aria-label="Gửi tin nhắn"
              title="Gửi tin nhắn"
            >
              {sending ? <Loader2 size={18} className="spin-icon" /> : <Send size={17} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
