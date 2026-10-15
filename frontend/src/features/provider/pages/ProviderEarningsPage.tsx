import { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2
} from 'lucide-react';
import { mockProviderProfile, mockProviderEarnings } from '../data/providerMockData';
import './ProviderEarningsPage.css';

export function ProviderEarningsPage() {
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);

  const handleWithdraw = () => {
    setWithdrawNotice('Yêu cầu rút 1.000.000 đ về tài khoản MB Bank đã được tiếp nhận. Tiền sẽ về trong 5 phút!');
    setTimeout(() => setWithdrawNotice(null), 4000);
  };

  return (
    <div className="provider-earnings-page">
      <h1 className="provider-earnings-title">Ví & Thu nhập</h1>

      {withdrawNotice && (
        <div style={{
          background: '#059669',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '14px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)'
        }}>
          <CheckCircle2 size={18} />
          <span>{withdrawNotice}</span>
        </div>
      )}

      <div className="provider-earnings-desktop-grid">
        {/* Left Column on Laptop */}
        <div className="provider-earnings-left-col">
          {/* Wallet Card */}
          <div className="provider-wallet-card">
            <div>
              <p className="provider-wallet-sub">Số dư khả dụng trong ví</p>
              <h2 className="provider-wallet-balance">
                {mockProviderProfile.walletBalance.toLocaleString('vi-VN')} đ
              </h2>
            </div>

            <div className="provider-wallet-actions">
              <button 
                type="button" 
                className="provider-wallet-btn primary"
                onClick={handleWithdraw}
              >
                <ArrowUpRight size={18} />
                <span>Rút tiền</span>
              </button>

              <button 
                type="button" 
                className="provider-wallet-btn"
                onClick={() => alert('Chức năng nạp tiền ví ký quỹ đang hoạt động bình thường qua quét mã VietQR.')}
              >
                <ArrowDownLeft size={18} />
                <span>Nạp tiền</span>
              </button>
            </div>
          </div>

          {/* 4 Performance Metrics */}
          <div className="provider-earnings-grid">
            <div className="provider-metric-card">
              <span className="provider-metric-label">Thu nhập hôm nay</span>
              <span className="provider-metric-val">
                {mockProviderProfile.todayEarnings.toLocaleString('vi-VN')} đ
              </span>
              <span className="provider-metric-sub">2 đơn hoàn tất</span>
            </div>

            <div className="provider-metric-card">
              <span className="provider-metric-label">Tỷ lệ nhận cuốc</span>
              <span className="provider-metric-val">{mockProviderProfile.acceptanceRate}%</span>
              <span className="provider-metric-sub">Rất tốt (Chuẩn 5★)</span>
            </div>

            <div className="provider-metric-card">
              <span className="provider-metric-label">Tỷ lệ hoàn thành</span>
              <span className="provider-metric-val">{mockProviderProfile.completionRate}%</span>
              <span className="provider-metric-sub">Đạt chuẩn chất lượng</span>
            </div>

            <div className="provider-metric-card">
              <span className="provider-metric-label">Đánh giá trung bình</span>
              <span className="provider-metric-val">{mockProviderProfile.rating} ★</span>
              <span className="provider-metric-sub">{mockProviderProfile.reviewsCount} lượt đánh giá</span>
            </div>
          </div>
        </div>

        {/* Right Column on Laptop */}
        <div className="provider-earnings-right-col">
          {/* Earnings History */}
          <div className="provider-history-card">
            <h3 className="provider-history-title">Lịch sử thu nhập gần đây</h3>

            <div className="provider-history-list">
              {mockProviderEarnings.map((item) => (
                <div key={item.id} className="provider-history-item">
                  <div className="provider-history-info">
                    <h4>{item.title}</h4>
                    <p>Khách: {item.customerName} · {item.date}, {item.completedAt}</p>
                  </div>

                  <div className="provider-history-right">
                    <div className="provider-history-amount">
                      +{item.netAmount.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="provider-history-method">
                      {item.paymentMethod === 'wallet' ? 'Ví điện tử' : item.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
