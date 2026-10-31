/**
 * Quản lý đồng bộ trạng thái nhận việc của thợ giữa các tabs, cửa sổ và components
 * Sử dụng kết hợp BroadcastChannel (cross-tab) và CustomEvent (cùng window).
 */

const CHANNEL_NAME = 'nhalo24h_provider_availability';
const EVENT_NAME = 'nhalo24h:provider-availability-changed';

export interface ProviderStatusChangePayload {
  isAvailable: boolean;
  providerId?: string;
  timestamp: number;
}

export function broadcastProviderStatusChange(isAvailable: boolean, providerId?: string): void {
  const payload: ProviderStatusChangePayload = {
    isAvailable,
    providerId,
    timestamp: Date.now(),
  };

  // 1. Gửi qua BroadcastChannel (cho các tab khác trong cùng trình duyệt)
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (err) {
    console.debug('BroadcastChannel post error:', err);
  }

  // 2. Gửi qua CustomEvent (cho các component trong cùng window)
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
  } catch (err) {
    console.debug('CustomEvent dispatch error:', err);
  }
}

export function subscribeProviderStatusChange(callback: (payload: ProviderStatusChangePayload) => void): () => void {
  let channel: BroadcastChannel | null = null;

  const handleMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object') {
      callback(event.data as ProviderStatusChangePayload);
    }
  };

  const handleCustomEvent = (event: Event) => {
    const customEvt = event as CustomEvent<ProviderStatusChangePayload>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.addEventListener('message', handleMessage);
    }
  } catch (err) {
    console.debug('BroadcastChannel subscribe error:', err);
  }

  window.addEventListener(EVENT_NAME, handleCustomEvent);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    }
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
  };
}
