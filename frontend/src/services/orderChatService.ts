import { request } from './apiClient';
import type {
  ChatMessageItem,
  SendChatMessagePayload,
} from '../types/order';

export const orderChatService = {
  /**
   * Lấy lịch sử tin nhắn của yêu cầu báo giá
   */
  async getMessages(requestId: string): Promise<ChatMessageItem[]> {
    return request<ChatMessageItem[]>(`/api/v1/orders/requests/${requestId}/messages`, {
      method: 'GET',
    });
  },

  /**
   * Gửi tin nhắn mới trao đổi về báo giá / tình trạng sự cố
   */
  async sendMessage(requestId: string, payload: SendChatMessagePayload): Promise<ChatMessageItem> {
    return request<ChatMessageItem>(`/api/v1/orders/requests/${requestId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
