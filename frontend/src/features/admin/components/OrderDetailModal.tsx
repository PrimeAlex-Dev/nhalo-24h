import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Wrench, 
  CreditCard, 
  AlertCircle,
  Clock,
  Ban,
  Calendar,
  Image as ImageIcon,
  ShieldAlert,
  CheckCircle2,
  History,
  Layers,
  FileEdit,
  ShieldCheck
} from 'lucide-react';
import type {
  QuoteVersionItem,
  OrderAuditLogItem,
  ResolveDisputePayload,
  AdjustInvoicePayload,
  DismissAbnormalFlagPayload
} from '../../../types/order';
import './OrderDetailModal.css';

export interface GenericOrderItem {
  id: string;
  orderCode?: string;
  code?: string;
  title?: string;
  serviceName?: string;
  categoryName?: string;
  category?: string;
  contactName?: string;
  customerName?: string;
  contactPhone?: string;
  customerPhone?: string;
  addressSnapshot?: string;
  customerAddress?: string;
  description?: string;
  notes?: string;
  expectedScheduleTime?: string;
  scheduledTime?: string;
  status: string;
  workflowMode?: string;
  agreedSurveyFee?: number;
  agreedTravelFee?: number;
  waiveSurveyIfRepaired?: boolean;
  waiveTravelIfRepaired?: boolean;
  appliedSurveyFee?: number;
  appliedTravelFee?: number;
  finalLaborFee?: number;
  finalMaterialsFee?: number;
  finalPrice?: number;
  price?: number;
  commissionRateSnapshot?: number;
  commissionAmount?: number;
  paymentMethod?: string | null;
  paymentStatus?: string;
  customerDeclaredAmount?: number | null;
  customerPaymentNote?: string | null;
  providerConfirmedAmount?: number | null;
  disputeReason?: string | null;
  isFlaggedAbnormal?: boolean;
  abnormalReason?: string | null;
  cancelReason?: string;
  assignedProviderName?: string;
  providerName?: string;
  assignedProviderPhone?: string;
  providerPhone?: string;
  assignedProviderAvatar?: string;
  providerAvatar?: string;
  images?: string[];
  quotationCount?: number;
  quoteVersions?: QuoteVersionItem[];
  auditLogs?: OrderAuditLogItem[];
  createdAt?: string;
}

interface OrderDetailModalProps {
  order: GenericOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  onResolveDispute?: (orderId: string, payload: ResolveDisputePayload) => Promise<void>;
  onAdjustInvoice?: (orderId: string, payload: AdjustInvoicePayload) => Promise<void>;
  onDismissAbnormalFlag?: (orderId: string, payload: DismissAbnormalFlagPayload) => Promise<void>;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  onResolveDispute,
  onAdjustInvoice,
  onDismissAbnormalFlag,
}: OrderDetailModalProps) {
  // Hòa giải hóa đơn (Trước thanh toán)
  const [adjustLaborStr, setAdjustLaborStr] = useState('');
  const [adjustMaterialsStr, setAdjustMaterialsStr] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Phán quyết tranh chấp tiền mặt (Đóng đơn)
  const [disputeLaborStr, setDisputeLaborStr] = useState('');
  const [disputeMaterialsStr, setDisputeMaterialsStr] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Gỡ cờ cảnh báo
  const [dismissNote, setDismissNote] = useState('');
  const [dismissing, setDismissing] = useState(false);
  const [dismissError, setDismissError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      const labor = (order.finalLaborFee ?? 0).toString();
      const materials = (order.finalMaterialsFee ?? 0).toString();

      setAdjustLaborStr(labor);
      setAdjustMaterialsStr(materials);
      setAdjustNote('');
      setAdjustError(null);
      setAdjusting(false);

      setDisputeLaborStr(labor);
      setDisputeMaterialsStr(materials);
      setResolutionNote('');
      setResolveError(null);
      setResolving(false);

      setDismissNote('');
      setDismissError(null);
      setDismissing(false);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderCode = order.orderCode || order.code || 'ORD-UNKNOWN';
  const orderTitle = order.title || order.serviceName || 'Dịch vụ sửa chữa';
  const categoryTitle = order.categoryName || order.category || 'Dịch vụ gia đình';
  const customer = order.contactName || order.customerName || 'Khách hàng';
  const phone = order.contactPhone || order.customerPhone || 'Chưa có SĐT';
  const address = order.addressSnapshot || order.customerAddress || 'Chưa có địa chỉ';
  const desc = order.description || order.notes;
  const provider = order.assignedProviderName || order.providerName;
  const provPhone = order.assignedProviderPhone || order.providerPhone;
  const provAvatar = order.assignedProviderAvatar || order.providerAvatar;
  const priceVal = order.finalPrice ?? order.price;
  const schedule = order.expectedScheduleTime || order.scheduledTime || 'Thỏa thuận';
  const createdDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa cập nhật';

  // Khóa chết công thức toán học: Tổng = Tiền công + Vật tư + (Phí KS + Di chuyển)
  const appliedSurvey = order.waiveSurveyIfRepaired ? 0 : (order.appliedSurveyFee ?? order.agreedSurveyFee ?? 0);
  const appliedTravel = order.waiveTravelIfRepaired ? 0 : (order.appliedTravelFee ?? order.agreedTravelFee ?? 0);

  const parsedAdjustLabor = parseInt(adjustLaborStr.replace(/\D/g, '') || '0', 10);
  const parsedAdjustMaterials = parseInt(adjustMaterialsStr.replace(/\D/g, '') || '0', 10);
  const computedAdjustTotal = parsedAdjustLabor + parsedAdjustMaterials + appliedSurvey + appliedTravel;

  const parsedDisputeLabor = parseInt(disputeLaborStr.replace(/\D/g, '') || '0', 10);
  const parsedDisputeMaterials = parseInt(disputeMaterialsStr.replace(/\D/g, '') || '0', 10);
  const computedDisputeTotal = parsedDisputeLabor + parsedDisputeMaterials + appliedSurvey + appliedTravel;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="status-badge status-unassigned">Chờ thợ báo giá</span>;
      case 'AWAITING_SURVEY':
        return <span className="status-badge status-progress">Chờ khảo sát</span>;
      case 'AWAITING_CUSTOMER_APPROVAL':
        return <span className="status-badge status-unassigned">Chờ khách duyệt giá KS</span>;
      case 'IN_PROGRESS':
        return <span className="status-badge status-progress">Đang thực hiện</span>;
      case 'AWAITING_COMPLETION_CONFIRMATION':
        return <span className="status-badge status-progress">Chờ nghiệm thu & TT</span>;
      case 'DECLINED_AFTER_SURVEY':
        return <span className="status-badge status-cancelled">Dừng sau khảo sát</span>;
      case 'COMPLETED':
        return <span className="status-badge status-completed">Đã hoàn thành</span>;
      case 'CANCELED':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge status-unassigned">{status}</span>;
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      onCancelOrder?.(order.id, 'Quản trị viên hủy đơn');
    }
  };

  // 1. Gỡ cờ cảnh báo bất thường
  const handleDismissFlag = async () => {
    if (!onDismissAbnormalFlag) return;
    if (!dismissNote.trim()) {
      setDismissError('Vui lòng nhập kết luận xác minh trước khi gỡ cảnh báo.');
      return;
    }
    try {
      setDismissing(true);
      setDismissError(null);
      await onDismissAbnormalFlag(order.id, { note: dismissNote.trim() });
    } catch (err: any) {
      setDismissError(err.message || 'Không thể gỡ cờ cảnh báo.');
    } finally {
      setDismissing(false);
    }
  };

  // 2. Điều chỉnh hóa đơn hòa giải TRƯỚC THANH TOÁN (khách vẫn tự thanh toán)
  const handleAdjustInvoiceSubmit = async () => {
    if (!onAdjustInvoice) return;
    if (!adjustNote.trim()) {
      setAdjustError('Vui lòng nhập biên bản / lý do điều chỉnh hóa đơn hòa giải.');
      return;
    }
    try {
      setAdjusting(true);
      setAdjustError(null);
      await onAdjustInvoice(order.id, {
        adjustedLaborFee: parsedAdjustLabor,
        adjustedMaterialsFee: parsedAdjustMaterials,
        adminNote: adjustNote.trim(),
      });
    } catch (err: any) {
      setAdjustError(err.message || 'Không thể cập nhật hóa đơn hòa giải.');
    } finally {
      setAdjusting(false);
    }
  };

  // 3. Phán quyết tranh chấp tiền mặt (ĐÓNG ĐƠN HOÀN TẤT)
  const handleResolveDisputeSubmit = async () => {
    if (!onResolveDispute) return;
    if (!resolutionNote.trim()) {
      setResolveError('Vui lòng nhập biên bản / ghi chú xử lý đối soát.');
      return;
    }
    try {
      setResolving(true);
      setResolveError(null);
      await onResolveDispute(order.id, {
        verifiedLaborFee: parsedDisputeLabor,
        verifiedMaterialsFee: parsedDisputeMaterials,
        verifiedTotalPaid: computedDisputeTotal,
        resolutionNote: resolutionNote.trim(),
      });
    } catch (err: any) {
      setResolveError(err.message || 'Không thể xử lý đối soát đơn hàng.');
    } finally {
      setResolving(false);
    }
  };

  // Điều kiện hiển thị 3 khối chức năng
  const canAdjustInvoice =
    (order.paymentStatus === 'UNPAID' || order.paymentStatus === 'PAYMENT_PENDING') &&
    (order.status === 'AWAITING_COMPLETION_CONFIRMATION' || order.status === 'IN_PROGRESS' || order.status === 'DECLINED_AFTER_SURVEY');

  const isCashDisputed =
    order.paymentStatus === 'PAYMENT_DISPUTED' || order.status === 'DISPUTED';

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div 
        className="order-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-modal-title-wrap">
            <span className="order-modal-code">{orderCode}</span>
            <h2 id="order-modal-title" className="order-modal-title">
              {orderTitle}
            </h2>
            <span className="order-modal-category">{categoryTitle}</span>
          </div>
          <div className="order-modal-header-actions">
            {getStatusBadge(order.status)}
            <button 
              type="button" 
              className="order-modal-close-btn" 
              onClick={onClose}
              aria-label="Đóng chi tiết"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 1. KHỐI CẢNH BÁO BẤT THƯỜNG & NÚT GỠ CẢNH BÁO */}
        {order.isFlaggedAbnormal && (
          <div style={{
            margin: '0 1.5rem 1rem',
            padding: '0.9rem 1.1rem',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            color: '#92400e',
            fontSize: '0.84rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                  Hệ thống cảnh báo biến động giá bất thường (Audit Flag)
                </div>
                <div>{order.abnormalReason || 'Tiền công giảm sâu so với dự kiến ban đầu, cần kiểm tra.'}</div>
                <div style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#78350f' }}>
                  * Lưu ý: Cảnh báo này chỉ để giám sát, không can thiệp vào đơn hàng nếu khách và thợ đã đồng thuận.
                </div>
              </div>
            </div>

            {onDismissAbnormalFlag && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Ghi chú xác minh (VD: Hiện trường nhẹ hơn dự kiến nên tiền công giảm hợp lý)..."
                  value={dismissNote}
                  onChange={(e) => setDismissNote(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={handleDismissFlag}
                  disabled={dismissing}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#d97706',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>{dismissing ? 'Đang gỡ...' : 'Xác minh & Gỡ cờ cảnh báo'}</span>
                </button>
              </div>
            )}
            {dismissError && <div style={{ color: '#dc2626', fontSize: '0.78rem' }}>{dismissError}</div>}
          </div>
        )}

        {/* Cảnh báo đơn bị hủy */}
        {order.cancelReason && (
          <div className="order-backlog-alert-box">
            <div className="backlog-alert-icon-wrap">
              <Ban size={22} className="backlog-alert-icon" />
            </div>
            <div className="backlog-alert-content">
              <h4 className="backlog-alert-heading">Đơn hàng đã bị hủy</h4>
              <p className="backlog-alert-desc">Lý do hủy: {order.cancelReason}</p>
            </div>
          </div>
        )}

        {/* Body Grid */}
        <div className="order-modal-body">
          {/* Column 1: Customer & Assigned Provider */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <User size={16} /> Thông tin khách hàng & Địa điểm
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Người liên hệ:</span>
                  <span className="order-info-val font-semibold">{customer}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Số điện thoại:</span>
                  <span className="order-info-val text-primary font-medium">
                    <Phone size={14} className="inline-icon" /> {phone}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Địa chỉ thực hiện:</span>
                  <span className="order-info-val">
                    <MapPin size={14} className="inline-icon" /> {address}
                  </span>
                </div>
                {desc && (
                  <div className="order-notes-box">
                    <span className="order-notes-title">Mô tả chi tiết từ khách:</span>
                    <p className="order-notes-text">"{desc}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="order-section-card">
              <h3 className="order-section-title">
                <Wrench size={16} /> Thợ kỹ thuật phụ trách
              </h3>
              {provider ? (
                <div className="provider-assigned-card">
                  {provAvatar ? (
                    <img 
                      src={provAvatar} 
                      alt={provider} 
                      className="provider-thumb-avatar" 
                    />
                  ) : (
                    <div className="provider-thumb-avatar-placeholder">
                      {provider.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="provider-assigned-info">
                    <span className="provider-assigned-name">{provider}</span>
                    <span className="provider-assigned-phone">
                      <Phone size={13} /> {provPhone || 'Đã tiếp nhận'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="provider-unassigned-notice">
                  <AlertCircle size={18} className="text-amber-500" />
                  <div>
                    <p className="unassigned-title">Đang chờ thợ nhận việc / gửi báo giá</p>
                    <p className="unassigned-sub">
                      Khách hàng đang phát thông báo tới các thợ trong khu vực để nhận báo giá cạnh tranh.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quote Versions History */}
            {order.quoteVersions && order.quoteVersions.length > 0 && (
              <div className="order-section-card">
                <h3 className="order-section-title">
                  <Layers size={16} /> Lịch sử Phiên bản Báo giá ({order.quoteVersions.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {order.quoteVersions.map((ver) => (
                    <div
                      key={ver.id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        background: ver.status === 'APPROVED' ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Lần #{ver.versionNumber} ({ver.versionType})</span>
                        <span>{ver.status}</span>
                      </div>
                      <div style={{ marginTop: '0.2rem', color: '#334155' }}>
                        Công: <strong>{ver.laborFee.toLocaleString('vi-VN')} đ</strong> · Vật tư: <strong>{ver.materialsFee.toLocaleString('vi-VN')} đ</strong> · Tổng: <strong>{ver.totalAmount.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      {ver.diagnosisOrReason && (
                        <div style={{ marginTop: '0.15rem', color: '#64748b' }}>
                          Ghi chú: {ver.diagnosisOrReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Order Metadata, 3-Group Pricing, Commission & Audit Logs */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <CreditCard size={16} /> Chi tiết 3 nhóm chi phí & Hoa hồng nền tảng
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Chế độ báo giá:</span>
                  <span className="order-info-val font-semibold">
                    {order.workflowMode === 'COMMITTED_FIXED' ? 'Gói cố định (COMMITTED_FIXED)' : 'Cần khảo sát (SURVEY_REQUIRED)'}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">1. Phí khảo sát (Thỏa thuận / Áp dụng):</span>
                  <span className="order-info-val">
                    {(order.agreedSurveyFee ?? 0).toLocaleString('vi-VN')} đ / <strong>{(order.appliedSurveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">2. Phí di chuyển (Thỏa thuận / Áp dụng):</span>
                  <span className="order-info-val">
                    {(order.agreedTravelFee ?? 0).toLocaleString('vi-VN')} đ / <strong>{(order.appliedTravelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">3a. Tiền công thực tế (Cơ sở tính hoa hồng):</span>
                  <span className="order-info-val font-semibold">
                    {(order.finalLaborFee ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">3b. Tiền vật tư / linh kiện:</span>
                  <span className="order-info-val">
                    {(order.finalMaterialsFee ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Tổng hóa đơn chốt:</span>
                  <span className="order-price-val">
                    {priceVal !== undefined && priceVal !== null ? `${priceVal.toLocaleString('vi-VN')} đ` : 'Chờ thỏa thuận'}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Hoa hồng nền tảng ({order.commissionRateSnapshot ?? 10}% tiền công):</span>
                  <span className="order-info-val font-semibold" style={{ color: '#0f766e' }}>
                    {(order.commissionAmount ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Trạng thái thanh toán:</span>
                  <span className="order-info-val font-semibold">
                    {order.paymentStatus || 'UNPAID'} {order.paymentMethod ? `(${order.paymentMethod})` : ''}
                  </span>
                </div>
                {order.customerDeclaredAmount !== undefined && order.customerDeclaredAmount !== null && (
                  <div className="order-info-item">
                    <span className="order-info-label">Khách khai báo trả tiền mặt:</span>
                    <span className="order-info-val font-semibold">
                      {order.customerDeclaredAmount.toLocaleString('vi-VN')} đ
                      {order.customerPaymentNote ? ` (${order.customerPaymentNote})` : ''}
                    </span>
                  </div>
                )}
                {order.providerConfirmedAmount !== undefined && order.providerConfirmedAmount !== null && (
                  <div className="order-info-item">
                    <span className="order-info-label">Thợ xác nhận đã nhận:</span>
                    <span className="order-info-val font-semibold">
                      {order.providerConfirmedAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
                <div className="order-info-item">
                  <span className="order-info-label">Lịch hẹn mong muốn:</span>
                  <span className="order-info-val">
                    <Calendar size={14} className="inline-icon" /> {schedule}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Thời điểm tạo đơn:</span>
                  <span className="order-info-val text-muted">
                    <Clock size={14} className="inline-icon" /> {createdDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. KHỐI ĐIỀU CHỈNH HÓA ĐƠN HÒA GIẢI (TRƯỚC KHI KHÁCH THANH TOÁN) */}
            {canAdjustInvoice && onAdjustInvoice && (
              <div className="order-section-card" style={{ borderColor: '#0284c7', background: '#f0f9ff' }}>
                <h3 className="order-section-title" style={{ color: '#0369a1' }}>
                  <FileEdit size={16} /> Hòa giải & Điều chỉnh hóa đơn (Trước thanh toán)
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.5rem' }}>
                  Áp dụng khi khách khiếu nại báo giá/vật tư nhưng chưa thanh toán. Sau khi lưu, đơn hàng <strong>vẫn ở trạng thái chờ thanh toán để Khách tự bấm trả tiền</strong>.
                </p>
                {adjustError && (
                  <div style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{adjustError}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>Tiền công (đ)</label>
                      <input
                        type="number"
                        value={adjustLaborStr}
                        onChange={(e) => setAdjustLaborStr(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>Tiền vật tư (đ)</label>
                      <input
                        type="number"
                        value={adjustMaterialsStr}
                        onChange={(e) => setAdjustMaterialsStr(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', color: '#0284c7' }}>
                        Tổng hóa đơn mới (Khóa)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${computedAdjustTotal.toLocaleString('vi-VN')} đ`}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #bae6fd', background: '#e0f2fe', fontWeight: 700, color: '#0369a1' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Biên bản hòa giải / Lý do điều chỉnh hóa đơn *
                    </label>
                    <textarea
                      rows={2}
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      placeholder="VD: Khách và thợ thống nhất giảm 150k tiền công do giảm 1 hạng mục..."
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAdjustInvoiceSubmit}
                    disabled={adjusting}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#0284c7',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <FileEdit size={16} />
                    <span>{adjusting ? 'Đang cập nhật...' : 'Lưu biểu giá hòa giải (Khách vẫn tự thanh toán)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. KHỐI PHÁN QUYẾT TRANH CHẤP TIỀN MẶT (CHỈ HIỆN KHI BỊ PAYMENT_DISPUTED - ĐÓNG ĐƠN HOÀN TẤT) */}
            {isCashDisputed && onResolveDispute && (
              <div className="order-section-card" style={{ borderColor: '#dc2626', background: '#fef2f2' }}>
                <h3 className="order-section-title" style={{ color: '#991b1b' }}>
                  <ShieldAlert size={16} /> Phán quyết tranh chấp tiền mặt (Đóng đơn hoàn tất)
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#991b1b', marginBottom: '0.4rem' }}>
                  <strong>Nguyên nhân tranh chấp:</strong> {order.disputeReason || 'Số tiền mặt khai báo không khớp giữa khách và thợ.'}
                </div>
                {resolveError && (
                  <div style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{resolveError}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>Tiền công chốt (đ)</label>
                      <input
                        type="number"
                        value={disputeLaborStr}
                        onChange={(e) => setDisputeLaborStr(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>Tiền vật tư chốt (đ)</label>
                      <input
                        type="number"
                        value={disputeMaterialsStr}
                        onChange={(e) => setDisputeMaterialsStr(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', color: '#991b1b' }}>
                        Tổng tiền mặt chốt (Khóa)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${computedDisputeTotal.toLocaleString('vi-VN')} đ`}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fee2e2', fontWeight: 700, color: '#991b1b' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Biên bản kết luận đối soát tranh chấp tiền mặt của Admin *
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Nhập kết luận xác minh thực tế 2 bên đã giao nhận tiền mặt sòng phẳng..."
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResolveDisputeSubmit}
                    disabled={resolving}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#991b1b',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{resolving ? 'Đang lưu phán quyết...' : 'Chốt phán quyết tiền mặt & Đóng đơn (COMPLETED)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            {order.auditLogs && order.auditLogs.length > 0 && (
              <div className="order-section-card">
                <h3 className="order-section-title">
                  <History size={16} /> Nhật ký kiểm toán trạng thái & Giá ({order.auditLogs.length})
                </h3>
                <div style={{
                  maxHeight: '190px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  fontSize: '0.78rem'
                }}>
                  {order.auditLogs.map((log) => (
                    <div key={log.id} style={{ padding: '0.45rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#0f172a' }}>
                        <span>[{log.actorRole}] {log.actionType}</span>
                        <span style={{ color: '#64748b' }}>
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {log.description && (
                        <div style={{ marginTop: '0.15rem', color: '#334155' }}>{log.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images attached by customer */}
            {order.images && order.images.length > 0 && (
              <div className="order-section-card">
                <h3 className="order-section-title">
                  <ImageIcon size={16} /> Hình ảnh hiện trường ({order.images.length})
                </h3>
                <div className="order-images-grid">
                  {order.images.map((img, idx) => (
                    <a 
                      key={idx} 
                      href={img} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="order-image-thumb"
                    >
                      <img src={img} alt={`Hiện trường ${idx + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="order-modal-footer">
          {order.status !== 'CANCELED' && order.status !== 'cancelled' && onCancelOrder && (
            <button 
              type="button" 
              className="btn-admin-cancel" 
              onClick={handleCancel}
            >
              <Ban size={15} /> Hủy đơn hàng
            </button>
          )}
          <div className="order-footer-right">
            <button 
              type="button" 
              className="btn-modal-close" 
              onClick={onClose}
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
