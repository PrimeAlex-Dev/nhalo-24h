import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Loader2,
  Ban, 
  User,
  UserPlus,
  Eye,
  ArrowUpDown,
  ChevronDown,
  ZoomIn,
  Layers,
  CreditCard,
  Banknote,
  ShieldCheck,
  FileCheck2,
  XCircle
} from 'lucide-react';
import { customerOrderService } from '../../../services';
import type { CustomerOrderDetail, QuotationItem, OnlinePaymentInitResponse } from '../../../types/order';
import type { PublicProviderItem } from '../../../services/providerProfileService';
import { InviteProvidersModal } from './InviteProvidersModal';
import { CancelOrderModal } from './CancelOrderModal';
import { CancelSurveyNoticeModal } from './CancelSurveyNoticeModal';
import { AcceptQuotationModal } from './AcceptQuotationModal';
import { ProviderQuickViewDrawer } from './ProviderQuickViewDrawer';
import { AvatarLightboxModal } from '../../../components/common';
import './CustomerOrderDetailModal.css';

interface CustomerOrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
  onOpenChat: (
    requestId: string,
    partnerName: string,
    partnerAvatar?: string,
    partnerHeadline?: string,
    quotedPrice?: number,
    orderTitle?: string
  ) => void;
}

export type QuotationSortOption = 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC';

export function CustomerOrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
  onOpenChat,
}: CustomerOrderDetailModalProps) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [quotingToAccept, setQuotingToAccept] = useState<QuotationItem | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSurveyModal, setShowCancelSurveyModal] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<PublicProviderItem | null>(null);
  const [quotationSort, setQuotationSort] = useState<QuotationSortOption>('DEFAULT');
  const [avatarLightbox, setAvatarLightbox] = useState<{
    imageUrl: string;
    name: string;
    role: string;
    badgeText?: string;
  } | null>(null);

  // Payment UI states
  const [paymentTab, setPaymentTab] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [onlineSession, setOnlineSession] = useState<OnlinePaymentInitResponse | null>(null);
  const [cashDeclaredStr, setCashDeclaredStr] = useState('');
  const [cashNote, setCashNote] = useState('');
  const [declineSurveyReason, setDeclineSurveyReason] = useState('');
  const [showDeclineSurveyBox, setShowDeclineSurveyBox] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setQuotationSort('DEFAULT');
      setOnlineSession(null);
      setShowDeclineSurveyBox(false);
      setDeclineSurveyReason('');
      loadOrderDetail(false);

      // Auto-poll order detail every 6 seconds while modal is open
      const intervalTimer = setInterval(() => {
        loadOrderDetail(true);
      }, 6000);

      const handleFocus = () => {
        if (document.visibilityState === 'visible') {
          loadOrderDetail(true);
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        clearInterval(intervalTimer);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
      };
    }
  }, [isOpen, orderId]);

  const loadOrderDetail = async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) {
        setLoading(true);
      }
      setErrorMsg(null);
      const data = await customerOrderService.getOrderDetail(orderId);
      setOrder(data);
      if (!silent && data.finalPrice !== undefined && data.finalPrice !== null) {
        setCashDeclaredStr(data.finalPrice.toLocaleString('vi-VN'));
      }
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err.message || 'Không thể tải chi tiết đơn hàng.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleOpenAcceptModal = (q: QuotationItem) => {
    setQuotingToAccept(q);
  };

  const handleConfirmAcceptQuotation = async () => {
    if (!quotingToAccept) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await customerOrderService.acceptQuotation(quotingToAccept.requestId);
      setSuccessMsg(
        quotingToAccept.quoteMode === 'COMMITTED_FIXED'
          ? `Đã chọn thợ ${quotingToAccept.providerName} theo gói giá cố định! Đơn hàng bắt đầu thực hiện.`
          : `Đã chọn thợ ${quotingToAccept.providerName} đến khảo sát thực tế!`
      );
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể chấp nhận báo giá.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveLatestQuote = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await customerOrderService.approveLatestQuote(order.id);
      setSuccessMsg('Đã duyệt báo giá thành công! Thợ sẽ tiến hành công việc theo mức giá đã chốt.');
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể duyệt báo giá.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineAfterSurvey = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await customerOrderService.declineAfterSurvey(
        order.id,
        { reason: declineSurveyReason.trim() || 'Khách hàng quyết định không sửa sau khi khảo sát' }
      );
      setShowDeclineSurveyBox(false);
      setSuccessMsg(
        'Đã xác nhận dừng đơn sau khảo sát. Vui lòng thanh toán Phí khảo sát & Phí di chuyển cho thợ.'
      );
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể từ chối sửa sau khảo sát.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectChangeRequest = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await customerOrderService.rejectChangeRequest(order.id);
      setSuccessMsg('Đã từ chối khoản phát sinh. Đơn hàng giữ nguyên mức giá đã duyệt trước đó.');
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể từ chối yêu cầu phát sinh.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitOnlinePayment = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const session = await customerOrderService.initOnlinePayment(order.id);
      setOnlineSession(session);
      if (session.amountToPay === 0) {
        setSuccessMsg('Hóa đơn 0đ đã được hoàn tất tự động!');
        await loadOrderDetail();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể khởi tạo giao dịch thanh toán online.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmMockOnlinePayment = async () => {
    if (!order || !onlineSession) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await customerOrderService.confirmOnlinePayment(order.id, {
        transactionRef: onlineSession.transactionRef,
        success: true,
      });
      setOnlineSession(null);
      setSuccessMsg('Thanh toán Online thành công! Đơn hàng đã hoàn tất và quyết toán.');
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xác nhận thanh toán Online thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclareCashPayment = async () => {
    if (!order) return;
    const raw = cashDeclaredStr.replace(/\D/g, '');
    const declaredAmount = raw ? parseInt(raw, 10) : 0;
    const invoiceTotal = order.finalPrice ?? 0;

    if (declaredAmount !== invoiceTotal && !cashNote.trim()) {
      setErrorMsg(
        `Số tiền bạn khai báo (${declaredAmount.toLocaleString('vi-VN')} đ) khác với hóa đơn (${invoiceTotal.toLocaleString('vi-VN')} đ). Vui lòng nhập lý do giải trình.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);
      await customerOrderService.declareCashPayment(order.id, {
        declaredAmount,
        note: cashNote.trim() || undefined,
      });
      setSuccessMsg(
        'Đã ghi nhận khai báo thanh toán tiền mặt! Hệ thống đã gửi yêu cầu sang máy của thợ để xác nhận (Bước 2/2).'
      );
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể khai báo thanh toán tiền mặt.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async (reason: string) => {
    if (!order) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await customerOrderService.cancelOrder(order.id, { reason: reason || 'Khách hàng yêu cầu hủy' });
      setSuccessMsg('Đã hủy đơn hàng thành công.');
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hủy đơn hàng.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCancelSurveyNotice = async (reason: string) => {
    if (!order) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await customerOrderService.notifyCancelRequest(order.id, { reason });
      setOrder(updated);
      setSuccessMsg('Đã gửi thông báo yêu cầu dời lịch / hủy đơn tới thợ.');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi thông báo.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProviderProfile = (params: {
    id: string;
    userId?: string;
    name: string;
    avatar?: string | null;
    headline?: string | null;
    phone?: string | null;
    pricePerHour?: number;
    category?: string;
  }) => {
    const fallbackItem: PublicProviderItem = {
      id: params.id,
      userId: params.userId || params.id,
      name: params.name,
      avatar: params.avatar || null,
      headline: params.headline || 'Thợ chuyên nghiệp Nhà Lô 24h',
      company: 'Đối tác Nhà Lô 24h',
      about: null,
      experienceYears: 5,
      pricePerHour: params.pricePerHour || 0,
      serviceArea: 'Khu vực hoạt động toàn thành phố',
      distance: '< 5 km',
      responseTime: '~ 15 phút',
      isAvailable: true,
      availability: 'Available today',
      category: params.category || order?.categoryName || 'Dịch vụ gia đình',
      categories: order?.categoryName ? [{ id: order.categoryId || 'cat-1', name: order.categoryName, slug: '' }] : [],
      rating: 4.9,
      reviewsCount: 16,
      completedJobsCount: '30+',
      verified: true,
      isTopRated: true,
    };
    setViewingProvider(fallbackItem);
  };

  const sortedQuotations = useMemo(() => {
    if (!order?.quotations || order.quotations.length === 0) return [];
    const list = [...order.quotations];

    if (quotationSort === 'PRICE_ASC') {
      return list.sort((a, b) => {
        const hasPriceA = a.quotedPrice !== undefined && a.quotedPrice !== null;
        const hasPriceB = b.quotedPrice !== undefined && b.quotedPrice !== null;

        if (hasPriceA && !hasPriceB) return -1;
        if (!hasPriceA && hasPriceB) return 1;

        if (hasPriceA && hasPriceB) {
          if (a.quotedPrice !== b.quotedPrice) {
            return a.quotedPrice! - b.quotedPrice!;
          }
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    if (quotationSort === 'PRICE_DESC') {
      return list.sort((a, b) => {
        const hasPriceA = a.quotedPrice !== undefined && a.quotedPrice !== null;
        const hasPriceB = b.quotedPrice !== undefined && b.quotedPrice !== null;

        if (hasPriceA && !hasPriceB) return -1;
        if (!hasPriceA && hasPriceB) return 1;

        if (hasPriceA && hasPriceB) {
          if (a.quotedPrice !== b.quotedPrice) {
            return b.quotedPrice! - a.quotedPrice!;
          }
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    return list;
  }, [order?.quotations, quotationSort]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="status-badge-custom pending">Đang tìm / Chờ báo giá</span>;
      case 'AWAITING_SURVEY':
        return <span className="status-badge-custom in-progress">Chờ thợ đến khảo sát</span>;
      case 'AWAITING_CUSTOMER_APPROVAL':
        return <span className="status-badge-custom pending">Chờ bạn duyệt giá khảo sát</span>;
      case 'IN_PROGRESS':
        return <span className="status-badge-custom in-progress">Đang sửa chữa</span>;
      case 'AWAITING_COMPLETION_CONFIRMATION':
        return <span className="status-badge-custom pending">Chờ nghiệm thu & Thanh toán</span>;
      case 'DECLINED_AFTER_SURVEY':
        return <span className="status-badge-custom canceled">Dừng sau khảo sát</span>;
      case 'COMPLETED':
        return <span className="status-badge-custom completed">Đã hoàn thành</span>;
      case 'CANCELED':
        return <span className="status-badge-custom canceled">Đã hủy</span>;
      default:
        return <span className="status-badge-custom">{status}</span>;
    }
  };

  // Tìm phiên bản báo giá đang chờ khách duyệt (POST_SURVEY_FINAL hoặc IN_PROGRESS_CHANGE)
  const pendingApprovalQuoteVersion = useMemo(() => {
    if (!order) return null;

    if (order.quoteVersions && order.quoteVersions.length > 0) {
      // 1. Tìm bản có status PENDING_APPROVAL mới nhất
      const pending = [...order.quoteVersions].reverse().find(
        (v) =>
          v.status === 'PENDING_APPROVAL' &&
          (v.versionType === 'POST_SURVEY_FINAL' || v.versionType === 'IN_PROGRESS_CHANGE')
      );
      if (pending) return pending;

      // 2. Nếu order đang ở AWAITING_CUSTOMER_APPROVAL nhưng bản ghi chưa cập nhật kịp status,
      // fallback lấy bản POST_SURVEY_FINAL mới nhất hoặc bản cuối cùng
      if (order.status === 'AWAITING_CUSTOMER_APPROVAL') {
        const postSurvey = [...order.quoteVersions].reverse().find((v) => v.versionType === 'POST_SURVEY_FINAL');
        if (postSurvey) return postSurvey;
        return order.quoteVersions[order.quoteVersions.length - 1];
      }
    }

    // 3. Fallback khi order.status là AWAITING_CUSTOMER_APPROVAL nhưng quoteVersions tạm thời rỗng
    if (order.status === 'AWAITING_CUSTOMER_APPROVAL') {
      return {
        id: 'fallback-survey-quote',
        orderId: order.id,
        versionNumber: 1,
        versionType: 'POST_SURVEY_FINAL' as const,
        quoteMode: order.workflowMode || ('SURVEY_REQUIRED' as const),
        surveyFee: order.agreedSurveyFee ?? 0,
        travelFee: order.agreedTravelFee ?? 0,
        waiveSurveyIfRepaired: order.waiveSurveyIfRepaired ?? true,
        waiveTravelIfRepaired: order.waiveTravelIfRepaired ?? true,
        laborFee: order.finalLaborFee ?? 0,
        materialsFee: order.finalMaterialsFee ?? 0,
        totalAmount: order.finalPrice ?? ((order.finalLaborFee ?? 0) + (order.finalMaterialsFee ?? 0)),
        diagnosisOrReason: 'Thợ đã hoàn thành khảo sát thực tế và gửi báo giá chốt công việc',
        status: 'PENDING_APPROVAL' as const,
        items: [],
        createdAt: order.updatedAt || new Date().toISOString(),
      };
    }

    return null;
  }, [order]);

  const needsPaymentAction = useMemo(() => {
    if (!order) return false;
    const isAwaitingPaymentStatus =
      order.status === 'AWAITING_COMPLETION_CONFIRMATION' ||
      order.status === 'DECLINED_AFTER_SURVEY';
    const isUnpaid =
      !order.paymentStatus ||
      order.paymentStatus === 'UNPAID' ||
      order.paymentStatus === 'PAYMENT_PENDING';
    return Boolean(isAwaitingPaymentStatus && isUnpaid);
  }, [order]);

  return (
    <div className="order-detail-backdrop" onClick={onClose}>
      <div 
        className="order-detail-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="order-detail-header">
          <div>
            <div className="order-code-badge">{order?.orderCode || 'Đang tải...'}</div>
            <h2 className="order-detail-title">{order?.title || 'Chi tiết đơn hàng'}</h2>
          </div>
          <div className="header-right-actions">
            {order && getStatusBadge(order.status)}
            <button 
              type="button" 
              className="order-detail-close-btn" 
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="modal-alert-error">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="modal-alert-success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="order-detail-loading">
            <Loader2 size={36} className="spin-icon text-blue" />
            <p>Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : order ? (
          <div className="order-detail-scroll-body">
            {/* Assigned Provider Banner */}
            {order.assignedProviderId && (
              <div className="assigned-provider-box">
                <div 
                  className="assigned-provider-left clickable"
                  onClick={() => handleViewProviderProfile({
                    id: order.assignedProviderId!,
                    userId: order.assignedProviderId!,
                    name: order.assignedProviderName || 'Thợ đảm nhận',
                    avatar: order.assignedProviderAvatar,
                    phone: order.assignedProviderPhone,
                    category: order.categoryName,
                  })}
                  title="Nhấp để xem chi tiết hồ sơ & đánh giá thợ"
                >
                  {order.assignedProviderAvatar ? (
                    <div 
                      className="avatar-zoomable-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarLightbox({
                          imageUrl: order.assignedProviderAvatar!,
                          name: order.assignedProviderName || 'Thợ đảm nhận',
                          role: order.categoryName ? `Thợ chuyên trách: ${order.categoryName}` : 'Thợ đảm nhận đơn hàng',
                          badgeText: 'Thợ phụ trách đơn này'
                        });
                      }}
                      title="Nhấp để phóng to xem rõ mặt thợ"
                    >
                      <img src={order.assignedProviderAvatar} alt={order.assignedProviderName} className="assigned-avatar" />
                      <span className="avatar-zoom-badge" aria-hidden="true">
                        <ZoomIn size={12} />
                      </span>
                    </div>
                  ) : (
                    <div className="assigned-avatar-fallback">
                      {order.assignedProviderName ? order.assignedProviderName.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                  <div>
                    <div className="assigned-name-title">
                      <span className="pro-tag">Thợ đảm nhận</span>
                      <h4>{order.assignedProviderName}</h4>
                    </div>
                    {order.assignedProviderPhone && (
                      <p className="assigned-phone">
                        <Phone size={13} /> SĐT: <strong>{order.assignedProviderPhone}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="assigned-provider-right">
                  <div className="assigned-price-box">
                    <span className="price-label">Tổng hóa đơn chốt:</span>
                    <span className="price-val">
                      {order.finalPrice !== undefined && order.finalPrice !== null
                        ? `${order.finalPrice.toLocaleString('vi-VN')} đ`
                        : 'Chờ báo giá khảo sát'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-view-assigned-pro"
                    onClick={() => handleViewProviderProfile({
                      id: order.assignedProviderId!,
                      userId: order.assignedProviderId!,
                      name: order.assignedProviderName || 'Thợ đảm nhận',
                      avatar: order.assignedProviderAvatar,
                      phone: order.assignedProviderPhone,
                      category: order.categoryName,
                    })}
                    title="Xem chi tiết hồ sơ & đánh giá"
                  >
                    <Eye size={14} />
                    <span>Xem hồ sơ</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BANNER 1: DUYỆT BÁO GIÁ SAU KHẢO SÁT HOẶC DUYỆT PHÁT SINH */}
            {pendingApprovalQuoteVersion && (
              <div style={{
                padding: '1.1rem',
                background: '#fffbeb',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                marginBottom: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#92400e', fontSize: '0.96rem', marginBottom: '0.5rem' }}>
                  <FileCheck2 size={20} />
                  <span>
                    {pendingApprovalQuoteVersion.versionType === 'POST_SURVEY_FINAL'
                      ? 'Thợ đã gửi Báo giá cuối sau khảo sát — Chờ bạn xác nhận để bắt đầu sửa'
                      : 'Thợ gửi yêu cầu điều chỉnh / Phát sinh vật tư trong quá trình làm'}
                  </span>
                </div>

                <div style={{
                  padding: '0.8rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  marginBottom: '0.8rem'
                }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong>Chẩn đoán / Lý do từ thợ:</strong> {pendingApprovalQuoteVersion.diagnosisOrReason}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tiền công thợ:</span>
                      <strong>{pendingApprovalQuoteVersion.laborFee.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tiền vật tư / linh kiện:</span>
                      <strong>{pendingApprovalQuoteVersion.materialsFee.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {pendingApprovalQuoteVersion.items && pendingApprovalQuoteVersion.items.length > 0 && (
                      <div style={{
                        margin: '0.35rem 0',
                        padding: '0.45rem 0.65rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Chi tiết vật tư:</div>
                        {pendingApprovalQuoteVersion.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {item.itemName} ({item.quantity} {item.unit || 'cái'} x {item.unitPrice.toLocaleString('vi-VN')} đ)</span>
                            <strong>{(item.totalPrice ?? item.quantity * item.unitPrice).toLocaleString('vi-VN')} đ</strong>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed #cbd5e1',
                      paddingTop: '0.35rem',
                      fontSize: '0.92rem',
                      color: '#0369a1'
                    }}>
                      <strong>Tổng hóa đơn nếu đồng ý sửa:</strong>
                      <strong>{pendingApprovalQuoteVersion.totalAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                </div>

                {!showDeclineSurveyBox ? (
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleApproveLatestQuote}
                      disabled={actionLoading}
                      style={{
                        padding: '0.6rem 1.1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#16a34a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>
                        {pendingApprovalQuoteVersion.versionType === 'POST_SURVEY_FINAL'
                          ? 'Đồng ý Báo giá cuối & Tiến hành sửa'
                          : 'Đồng ý duyệt khoản phát sinh này'}
                      </span>
                    </button>

                    {pendingApprovalQuoteVersion.versionType === 'POST_SURVEY_FINAL' ? (
                      <button
                        type="button"
                        onClick={() => setShowDeclineSurveyBox(true)}
                        disabled={actionLoading}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #dc2626',
                          background: '#fff',
                          color: '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <XCircle size={16} />
                        <span>Không sửa — Chỉ trả phí khảo sát ({((order.agreedSurveyFee ?? 0) + (order.agreedTravelFee ?? 0)).toLocaleString('vi-VN')} đ)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRejectChangeRequest}
                        disabled={actionLoading}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #dc2626',
                          background: '#fff',
                          color: '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Từ chối khoản phát sinh này
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}>
                      Xác nhận dừng đơn sau khảo sát: Bạn sẽ thanh toán Phí khảo sát ({(order.agreedSurveyFee ?? 0).toLocaleString('vi-VN')} đ) + Phí di chuyển ({(order.agreedTravelFee ?? 0).toLocaleString('vi-VN')} đ) = {((order.agreedSurveyFee ?? 0) + (order.agreedTravelFee ?? 0)).toLocaleString('vi-VN')} đ cho thợ.
                    </div>
                    <input
                      type="text"
                      value={declineSurveyReason}
                      onChange={(e) => setDeclineSurveyReason(e.target.value)}
                      placeholder="Nhập lý do không tiếp tục sửa (VD: Chi phí thay linh kiện cao hơn dự kiến)..."
                      style={{
                        padding: '0.5rem 0.7rem',
                        borderRadius: '6px',
                        border: '1px solid #fca5a5',
                        fontSize: '0.84rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={handleDeclineAfterSurvey}
                        disabled={actionLoading}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#dc2626',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Xác nhận dừng sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeclineSurveyBox(false)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Quay lại
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION BANNER 2: NGHIỆM THU & THANH TOÁN (ONLINE MOCK GATEWAY / TIỀN MẶT 2 BƯỚC) */}
            {needsPaymentAction && (
              <div style={{
                padding: '1.15rem',
                background: '#f0f9ff',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                marginBottom: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0369a1', fontSize: '0.98rem', marginBottom: '0.4rem' }}>
                  <CreditCard size={20} />
                  <span>
                    {order.status === 'DECLINED_AFTER_SURVEY'
                      ? 'Thanh toán Phí Khảo sát & Di chuyển cho thợ'
                      : 'Nghiệm thu hoàn thành & Thanh toán hóa đơn'}
                  </span>
                </div>

                {order.completionNote && (
                  <div style={{
                    padding: '0.6rem 0.8rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    fontSize: '0.83rem',
                    color: '#0f172a',
                    marginBottom: '0.75rem'
                  }}>
                    <strong>Báo cáo bàn giao & Bảo hành từ thợ:</strong> "{order.completionNote}"
                  </div>
                )}

                <div style={{
                  padding: '0.75rem 0.9rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.84rem',
                  marginBottom: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phí khảo sát áp dụng:</span>
                    <strong>{(order.appliedSurveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phí di chuyển áp dụng:</span>
                    <strong>{(order.appliedTravelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tiền công thực hiện:</span>
                    <strong>{(order.finalLaborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tiền vật tư / linh kiện:</span>
                    <strong>{(order.finalMaterialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '0.35rem',
                    marginTop: '0.2rem',
                    fontSize: '0.96rem',
                    color: '#0369a1'
                  }}>
                    <strong>Tổng số tiền cần thanh toán:</strong>
                    <strong>{(order.finalPrice ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>

                {/* Chọn Phương thức thanh toán */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('ONLINE')}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: paymentTab === 'ONLINE' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: paymentTab === 'ONLINE' ? '#e0f2fe' : '#fff',
                      color: paymentTab === 'ONLINE' ? '#0369a1' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CreditCard size={16} />
                    <span>Thanh toán Online (Khuyên dùng)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('CASH')}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: paymentTab === 'CASH' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: paymentTab === 'CASH' ? '#dcfce7' : '#fff',
                      color: paymentTab === 'CASH' ? '#166534' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Banknote size={16} />
                    <span>Tiền mặt (Xác nhận 2 bước)</span>
                  </button>
                </div>

                {paymentTab === 'ONLINE' ? (
                  <div style={{
                    padding: '0.85rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    {!onlineSession ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155' }}>
                          Thanh toán qua cổng điện tử NhaLoPay giúp xác nhận tự động ngay lập tức, bảo vệ quyền lợi bảo hành của bạn.
                        </p>
                        <button
                          type="button"
                          onClick={handleInitOnlinePayment}
                          disabled={actionLoading}
                          style={{
                            padding: '0.65rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#0284c7',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                          }}
                        >
                          {actionLoading ? 'Đang khởi tạo...' : `Thanh toán Online ${(order.finalPrice ?? 0).toLocaleString('vi-VN')} đ`}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ fontSize: '0.84rem', color: '#0369a1', fontWeight: 700 }}>
                          Cổng thanh toán giả lập (NhaLoPay Mock Gateway)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                          Mã giao dịch: <strong>{onlineSession.transactionRef}</strong> · Số tiền: <strong>{onlineSession.amountToPay.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleConfirmMockOnlinePayment}
                          disabled={actionLoading}
                          style={{
                            padding: '0.65rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#16a34a',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <CheckCircle2 size={17} />
                          <span>{actionLoading ? 'Đang xử lý...' : 'Xác nhận Thanh toán Online Thành công'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '0.85rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1e293b' }}>
                        Số tiền mặt thực tế bạn đã đưa cho thợ (VNĐ)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cashDeclaredStr}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setCashDeclaredStr(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1e293b' }}>
                        Ghi chú / Lý do giải trình (Bắt buộc nếu số tiền khác hóa đơn {(order.finalPrice ?? 0).toLocaleString('vi-VN')} đ)
                      </label>
                      <input
                        type="text"
                        value={cashNote}
                        onChange={(e) => setCashNote(e.target.value)}
                        placeholder="Nhập ghi chú thanh toán..."
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDeclareCashPayment}
                      disabled={actionLoading}
                      style={{
                        padding: '0.65rem 1.2rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#16a34a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}
                    >
                      {actionLoading ? 'Đang gửi xác nhận...' : 'Khai báo đã trả tiền mặt (Chờ thợ xác nhận)'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Status Banner if Cash Pending or Disputed */}
            {order.paymentStatus === 'CASH_PENDING_CONFIRMATION' && (
              <div style={{
                padding: '0.85rem 1rem',
                background: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.84rem',
                color: '#854d0e'
              }}>
                <strong>⏳ Đang chờ thợ xác nhận tiền mặt (Bước 2/2):</strong> Bạn đã khai báo thanh toán <strong>{(order.customerDeclaredAmount ?? 0).toLocaleString('vi-VN')} đ</strong> tiền mặt. Đơn hàng sẽ hoàn tất ngay khi thợ bấm xác nhận đã nhận tiền.
              </div>
            )}

            {order.paymentStatus === 'PAYMENT_DISPUTED' && (
              <div style={{
                padding: '0.85rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.84rem',
                color: '#991b1b'
              }}>
                <strong>⚠️ Đang chờ Quản trị viên đối soát thanh toán:</strong> {order.disputeReason || 'Có chênh lệch số tiền khai báo giữa hai bên.'}
              </div>
            )}

            {/* 3-Group Financial Breakdown & Quote Versions History */}
            {order.assignedProviderId && (
              <div style={{
                padding: '0.9rem 1rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.84rem'
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={15} />
                  <span>Bóc tách 3 nhóm chi phí & Lịch sử báo giá</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Phí khảo sát đã thỏa thuận:</span>
                    <span>
                      <strong>{(order.agreedSurveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                      {order.waiveSurveyIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Phí di chuyển đã thỏa thuận:</span>
                    <span>
                      <strong>{(order.agreedTravelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                      {order.waiveTravelIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>3a. Tiền công thực hiện:</span>
                    <strong>{(order.finalLaborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>3b. Tiền vật tư / linh kiện:</span>
                    <strong>{(order.finalMaterialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '0.35rem',
                    marginTop: '0.15rem',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}>
                    <span>Tổng hóa đơn ({order.paymentStatus}):</span>
                    <span>{(order.finalPrice ?? 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'AWAITING_SURVEY' && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.9rem 1.1rem',
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                marginBottom: '1.15rem'
              }}>
                <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '0.15rem' }} />
                <div style={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.45 }}>
                  <strong>Thợ đang chuẩn bị đồ nghề & di chuyển tới khảo sát theo lịch hẹn.</strong>
                  <div>
                    Để bảo vệ quyền lợi của thợ, hệ thống không cho phép hủy tự do 1 chạm lúc này. Nếu bạn có việc đột xuất cần dời lịch hoặc hủy đơn, vui lòng bấm nút <strong>Cần dời lịch / Hủy hẹn</strong> ở chân trang hoặc liên hệ trực tiếp cho thợ.
                  </div>
                </div>
              </div>
            )}

            {/* General Info Card */}
            <div className="detail-info-card">
              <div className="detail-info-row">
                <div className="info-icon-col"><Calendar size={17} /></div>
                <div>
                  <span className="info-item-label">Thời gian hẹn</span>
                  <span className="info-item-val">
                    {new Date(order.expectedScheduleTime).toLocaleString('vi-VN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              <div className="detail-info-row">
                <div className="info-icon-col"><MapPin size={17} /></div>
                <div>
                  <span className="info-item-label">Địa chỉ thực hiện</span>
                  <span className="info-item-val">{order.addressSnapshot}</span>
                </div>
              </div>

              <div className="detail-info-row">
                <div className="info-icon-col"><User size={17} /></div>
                <div>
                  <span className="info-item-label">Người liên hệ</span>
                  <span className="info-item-val">{order.contactName} · {order.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-desc-box">
              <h4 className="box-heading">Mô tả sự cố</h4>
              <p className="desc-text">{order.description}</p>
              {order.serviceMetadata && (
                <p style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Thông số bổ sung:</strong> {order.serviceMetadata}
                </p>
              )}
            </div>

            {/* Images */}
            {order.images && order.images.length > 0 && (
              <div className="detail-images-box">
                <h4 className="box-heading">Hình ảnh sự cố ({order.images.length})</h4>
                <div className="images-grid">
                  {order.images.map((imgUrl, idx) => (
                    <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="img-thumbnail-link">
                      <img src={imgUrl} alt={`Ảnh sự cố ${idx + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quotations List (Core multi-provider quotation feature) */}
            <div className="detail-quotations-section">
              <div className="quotations-header-row">
                <div className="quotations-title-wrap">
                  <h4 className="box-heading">
                    Danh sách Báo giá từ Thợ ({order.quotations ? order.quotations.length : 0})
                  </h4>
                  {order.status === 'PENDING_PROVIDER' && (
                    <span className="quotation-guide-tag">So sánh 3 nhóm chi phí & Chọn 1 thợ ưng ý</span>
                  )}
                </div>

                <div className="quotations-header-actions">
                  {order.quotations && order.quotations.length >= 2 && (
                    <div className="quotation-sort-wrapper">
                      <label htmlFor="quotationSortSelect" className="sort-label">
                        <ArrowUpDown size={13} className="sort-icon" />
                        <span className="sort-label-text">Sắp xếp:</span>
                      </label>
                      <div className="sort-select-box">
                        <select
                          id="quotationSortSelect"
                          value={quotationSort}
                          onChange={(e) => setQuotationSort(e.target.value as QuotationSortOption)}
                          className="quotation-sort-select"
                          aria-label="Sắp xếp danh sách báo giá theo giá"
                        >
                          <option value="DEFAULT">Mặc định (Mới nhất)</option>
                          <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                          <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
                        </select>
                        <ChevronDown size={14} className="sort-chevron-icon" />
                      </div>
                    </div>
                  )}

                  {order.status === 'PENDING_PROVIDER' && (
                    <button
                      type="button"
                      className="btn-invite-more-pro"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus size={14} />
                      <span>Mời thêm thợ</span>
                    </button>
                  )}
                </div>
              </div>

              {(!order.quotations || order.quotations.length === 0) ? (
                <div className="no-quotation-notice">
                  <Clock size={24} className="text-gray" />
                  <p>Chưa có thợ nào được mời hoặc chưa có báo giá cho đơn này.</p>
                  {order.status === 'PENDING_PROVIDER' && (
                    <button
                      type="button"
                      className="btn-invite-first-pro"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus size={16} />
                      <span>Chọn thợ gửi yêu cầu ngay</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="quotation-cards-list">
                  {sortedQuotations.map((q) => {
                    const isQuoted = q.status === 'QUOTED';
                    const isAccepted = q.status === 'ACCEPTED';
                    const isRejected = q.status === 'REJECTED';
                    const isCanceled = q.status === 'CANCELED';

                    return (
                      <div key={q.requestId} className={`quotation-card ${q.status.toLowerCase()}`}>
                        <div className="quotation-card-top">
                          <div 
                            className="pro-brief-info clickable"
                            onClick={() => handleViewProviderProfile({
                              id: q.providerId,
                              userId: q.providerUserId,
                              name: q.providerName,
                              avatar: q.providerAvatar,
                              headline: q.providerHeadline,
                              pricePerHour: q.pricePerHour,
                              category: order.categoryName,
                            })}
                            title="Nhấp để xem chi tiết hồ sơ & đánh giá thợ"
                          >
                            {q.providerAvatar ? (
                              <div 
                                className="avatar-zoomable-wrapper"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAvatarLightbox({
                                    imageUrl: q.providerAvatar!,
                                    name: q.providerName,
                                    role: q.providerHeadline || 'Thợ gửi báo giá',
                                    badgeText: 'Thợ gửi báo giá'
                                  });
                                }}
                                title="Nhấp để phóng to xem rõ mặt thợ"
                              >
                                <img src={q.providerAvatar} alt={q.providerName} className="pro-avatar" />
                                <span className="avatar-zoom-badge" aria-hidden="true">
                                  <ZoomIn size={11} />
                                </span>
                              </div>
                            ) : (
                              <div className="pro-avatar-fallback">
                                {q.providerName ? q.providerName.charAt(0).toUpperCase() : 'T'}
                              </div>
                            )}
                            <div>
                              <div className="pro-name-row">
                                <h5 className="pro-name">{q.providerName}</h5>
                                <span className="pro-headline">{q.providerHeadline || 'Thợ chuyên nghiệp'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
                                {q.quoteMode === 'COMMITTED_FIXED' ? (
                                  <span style={{
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    background: '#dcfce7',
                                    color: '#166534',
                                    fontWeight: 600
                                  }}>
                                    Gói giá cố định
                                  </span>
                                ) : (
                                  <span style={{
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    fontWeight: 600
                                  }}>
                                    Cần khảo sát thực tế
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quoted Price Box */}
                          <div className="quote-price-col">
                            {isQuoted ? (
                              <>
                                <span className="quote-badge-label">
                                  {q.quoteMode === 'COMMITTED_FIXED' ? 'Giá cam kết:' : 'Tổng dự kiến:'}
                                </span>
                                <span className="quote-amount-highlight">
                                  {q.quotedPrice?.toLocaleString('vi-VN')} đ
                                </span>
                              </>
                            ) : isAccepted ? (
                              <span className="quote-status-pill accepted">✓ Đã chốt nhận việc</span>
                            ) : isRejected ? (
                              <span className="quote-status-pill rejected">Thợ từ chối</span>
                            ) : isCanceled ? (
                              <span className="quote-status-pill canceled">Đã hủy</span>
                            ) : (
                              <span className="quote-status-pill pending">⏳ Đang chờ thợ báo giá</span>
                            )}
                          </div>
                        </div>

                        {/* 3-Group Breakdown inside Quotation Card */}
                        {(isQuoted || isAccepted) && (
                          <div style={{
                            marginTop: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.79rem',
                            color: '#334155',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.35rem 0.75rem'
                          }}>
                            <div>
                              • Phí khảo sát: <strong>{(q.surveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                              {q.waiveSurveyIfRepaired ? ' (Miễn khi sửa)' : ''}
                            </div>
                            <div>
                              • Phí di chuyển: <strong>{(q.travelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                              {q.waiveTravelIfRepaired ? ' (Miễn khi sửa)' : ''}
                            </div>
                            <div>
                              • Tiền công dự kiến: <strong>{(q.estimatedLaborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                            <div>
                              • Tiền vật tư dự kiến: <strong>{(q.estimatedMaterialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                          </div>
                        )}

                        {/* Note & Arrival Time */}
                        {q.providerNote && (
                          <div className="quote-note-row">
                            <strong>Nhận định từ thợ:</strong> {q.providerNote}
                          </div>
                        )}
                        {q.scopeAndConditions && (
                          <div className="quote-note-row" style={{ marginTop: '0.25rem', color: '#166534' }}>
                            <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            <strong>Phạm vi cam kết:</strong> {q.scopeAndConditions}
                          </div>
                        )}
                        {q.estimatedArrivalTime && (
                          <div className="quote-eta-row">
                            <Clock size={13} />
                            <span>Ước tính có mặt: {new Date(q.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {q.rejectReason && (
                          <div className="quote-reject-row">
                            Lý do thợ từ chối: {q.rejectReason}
                          </div>
                        )}

                        {/* Quotation Action Buttons */}
                        <div className="quotation-card-actions">
                          <button
                            type="button"
                            className="btn-quote-profile"
                            onClick={() =>
                              handleViewProviderProfile({
                                id: q.providerId,
                                userId: q.providerUserId,
                                name: q.providerName,
                                avatar: q.providerAvatar,
                                headline: q.providerHeadline,
                                pricePerHour: q.pricePerHour,
                                category: order.categoryName,
                              })
                            }
                            title="Xem chi tiết hồ sơ & đánh giá thợ"
                          >
                            <Eye size={15} />
                            <span>Xem hồ sơ</span>
                          </button>

                          <button
                            type="button"
                            className="btn-quote-chat"
                            onClick={() =>
                              onOpenChat(
                                q.requestId,
                                q.providerName,
                                q.providerAvatar,
                                q.providerHeadline,
                                q.quotedPrice,
                                order.title
                              )
                            }
                          >
                            <MessageSquare size={15} />
                            <span>Nhắn tin trao đổi</span>
                          </button>

                          {isQuoted && order.status === 'PENDING_PROVIDER' && (
                            <button
                              type="button"
                              className="btn-quote-accept"
                              onClick={() => handleOpenAcceptModal(q)}
                              disabled={actionLoading}
                            >
                              <CheckCircle2 size={16} />
                              <span>
                                {q.quoteMode === 'COMMITTED_FIXED'
                                  ? 'Chốt gói cố định & Chọn thợ'
                                  : 'Chốt điều kiện KS & Chọn thợ'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {order && (
          <div className="order-detail-footer">
            {order.status === 'PENDING_PROVIDER' && (
              <button 
                type="button" 
                className="btn-cancel-this-order"
                onClick={handleOpenCancelModal}
                disabled={actionLoading}
              >
                <Ban size={15} />
                <span>Hủy đơn hàng</span>
              </button>
            )}
            {order.status === 'AWAITING_SURVEY' && (
              <button 
                type="button" 
                className="btn-cancel-this-order"
                style={{
                  borderColor: '#f59e0b',
                  backgroundColor: '#fffbeb',
                  color: '#b45309'
                }}
                onClick={() => setShowCancelSurveyModal(true)}
                disabled={actionLoading}
              >
                <AlertTriangle size={15} />
                <span>Cần dời lịch / Hủy hẹn</span>
              </button>
            )}
            <button type="button" className="btn-close-modal" onClick={onClose}>
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Invite Providers Modal */}
      {showInviteModal && order && (
        <InviteProvidersModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          orderId={order.id}
          orderTitle={order.title}
          categoryId={order.categoryId}
          categoryName={order.categoryName}
          existingProviderIds={order.quotations ? order.quotations.map((q) => q.providerId) : []}
          onSuccess={() => {
            loadOrderDetail();
            if (onOrderUpdated) onOrderUpdated();
          }}
        />
      )}

      {/* Accept Quotation Modal */}
      {quotingToAccept && (
        <AcceptQuotationModal
          isOpen={!!quotingToAccept}
          onClose={() => setQuotingToAccept(null)}
          orderTitle={order?.title}
          quotation={quotingToAccept}
          onConfirmAccept={handleConfirmAcceptQuotation}
        />
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          orderCode={order?.orderCode}
          orderTitle={order?.title}
          onConfirmCancel={handleConfirmCancelOrder}
        />
      )}

      {/* Cancel Survey Notice Modal (Phương án A) */}
      {showCancelSurveyModal && order && (
        <CancelSurveyNoticeModal
          isOpen={showCancelSurveyModal}
          onClose={() => setShowCancelSurveyModal(false)}
          orderCode={order.orderCode}
          orderTitle={order.title}
          providerName={order.assignedProviderName || undefined}
          providerPhone={order.assignedProviderPhone}
          scheduledTime={order.expectedScheduleTime}
          onOpenChat={() => {
            const assignedQuote = order.quotations?.find(q => q.status === 'ACCEPTED') || order.quotations?.[0];
            if (assignedQuote) {
              onOpenChat(
                assignedQuote.requestId,
                order.assignedProviderName || 'Thợ đảm nhận',
                order.assignedProviderAvatar,
                assignedQuote.providerHeadline,
                assignedQuote.quotedPrice,
                order.title
              );
            }
          }}
          onSendNotify={handleSendCancelSurveyNotice}
        />
      )}

      {/* Quick View Provider Profile & Reviews Drawer */}
      <ProviderQuickViewDrawer
        isOpen={!!viewingProvider}
        onClose={() => setViewingProvider(null)}
        provider={viewingProvider}
        isAssigned={Boolean(
          viewingProvider && order?.assignedProviderId && 
          (order.assignedProviderId === viewingProvider.id || order.assignedProviderId === viewingProvider.userId)
        )}
        isAlreadyInvited={true}
      />

      {/* In-place Avatar Lightbox Overlay */}
      <AvatarLightboxModal
        isOpen={!!avatarLightbox}
        onClose={() => setAvatarLightbox(null)}
        imageUrl={avatarLightbox?.imageUrl}
        name={avatarLightbox?.name || ''}
        role={avatarLightbox?.role || ''}
        badgeText={avatarLightbox?.badgeText || 'Nhận diện thợ'}
        verified={true}
      />
    </div>
  );
}
