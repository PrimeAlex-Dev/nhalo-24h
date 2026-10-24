import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Navigation,
  MessageSquare,
  DollarSign,
  Ban,
  Info,
  ClipboardCheck,
  FilePlus2,
  Banknote,
  Layers
} from 'lucide-react';
import type { ProviderJobItem } from '../../../types/order';
import './JobDetailModal.css';

interface JobDetailModalProps {
  job: ProviderJobItem | null;
  onClose: () => void;
  onOpenQuoteModal: (job: ProviderJobItem) => void;
  onRejectRequest: (job: ProviderJobItem) => void;
  onOpenChat: (job: ProviderJobItem) => void;
  onCompleteOrder: (job: ProviderJobItem) => void;
  onOpenSurveyOrChangeModal?: (job: ProviderJobItem, mode: 'SURVEY_FINAL' | 'IN_PROGRESS_CHANGE') => void;
  onOpenConfirmCashModal?: (job: ProviderJobItem) => void;
}

export function JobDetailModal({
  job,
  onClose,
  onOpenQuoteModal,
  onRejectRequest,
  onOpenChat,
  onCompleteOrder,
  onOpenSurveyOrChangeModal,
  onOpenConfirmCashModal,
}: JobDetailModalProps) {
  if (!job) return null;

  const handleCall = () => {
    if (job.customerPhone && !job.customerPhone.includes('*')) {
      window.open(`tel:${job.customerPhone}`);
    }
  };

  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(job.addressSnapshot);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const isAssignedToMe = job.requestStatus === 'ACCEPTED';
  const isAwaitingSurvey = isAssignedToMe && job.orderStatus === 'AWAITING_SURVEY';
  const isAwaitingCustomerApproval = isAssignedToMe && job.orderStatus === 'AWAITING_CUSTOMER_APPROVAL';
  const isMyJobInProgress = isAssignedToMe && job.orderStatus === 'IN_PROGRESS';
  const isAwaitingCompletionConfirm = isAssignedToMe && job.orderStatus === 'AWAITING_COMPLETION_CONFIRMATION';
  const isDeclinedAfterSurvey = isAssignedToMe && job.orderStatus === 'DECLINED_AFTER_SURVEY';
  const isMyJobCompleted = isAssignedToMe && job.orderStatus === 'COMPLETED';
  const isCashPendingConfirmation = isAssignedToMe && job.paymentStatus === 'CASH_PENDING_CONFIRMATION';
  const isPaymentDisputed = isAssignedToMe && job.paymentStatus === 'PAYMENT_DISPUTED';

  const isAssignedToOther =
    job.requestStatus === 'CANCELED' &&
    job.orderStatus !== 'CANCELED' &&
    job.orderStatus !== 'PENDING_PROVIDER';
  const isOrderCanceled = job.orderStatus === 'CANCELED';
  const isRejected = job.requestStatus === 'REJECTED';
  const isQuoted = job.requestStatus === 'QUOTED' && job.orderStatus === 'PENDING_PROVIDER';
  const isPending = job.requestStatus === 'PENDING_RESPONSE' && job.orderStatus === 'PENDING_PROVIDER';

  const canSeePhone = isAssignedToMe && job.customerPhone && !job.customerPhone.includes('*');

  return (
    <div className="job-modal-backdrop" onClick={onClose}>
      <div className="job-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Grab bar for mobile */}
        <div className="job-modal-grab-bar" />

        {/* Modal Header */}
        <div className="job-modal-header">
          <div>
            <div className="job-modal-category-chip">
              <Wrench size={13} />
              <span>{job.categoryName || 'Sửa chữa'}</span>
              <span className="order-code-tag">· {job.orderCode}</span>
              {job.quoteMode === 'COMMITTED_FIXED' ? (
                <span style={{
                  marginLeft: '0.35rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  background: '#dcfce7',
                  color: '#166534',
                  fontWeight: 600
                }}>
                  Giá cố định
                </span>
              ) : (
                <span style={{
                  marginLeft: '0.35rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 600
                }}>
                  Cần khảo sát
                </span>
              )}
            </div>
            <h3 className="job-modal-title">{job.title}</h3>
          </div>
          <button 
            type="button" 
            className="job-modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="job-modal-body">
          {/* Status / Earnings banner */}
          {isCashPendingConfirmation ? (
            <div className="job-modal-price-box in-progress" style={{ background: '#fefce8', borderColor: '#fde047' }}>
              <div>
                <div className="job-modal-price-label" style={{ color: '#854d0e' }}>
                  Khách khai báo đã trả tiền mặt — Chờ bạn xác nhận
                </div>
                <div className="job-modal-price-value" style={{ color: '#a16207' }}>
                  {(job.customerDeclaredAmount ?? job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ
                </div>
                {job.customerPaymentNote && (
                  <div style={{ fontSize: '0.78rem', color: '#713f12', marginTop: '0.2rem' }}>
                    Ghi chú của khách: "{job.customerPaymentNote}"
                  </div>
                )}
              </div>
              <div className="job-modal-price-tag in-progress" style={{ background: '#eab308', color: '#fff' }}>
                Chờ xác nhận tiền mặt
              </div>
            </div>
          ) : isPaymentDisputed ? (
            <div className="job-modal-price-box rejected">
              <div>
                <div className="job-modal-price-label">Đang đối soát thanh toán (Admin)</div>
                <div className="job-modal-price-value" style={{ color: '#b91c1c' }}>
                  {(job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ
                </div>
                {job.disputeReason && (
                  <div className="job-modal-price-subdesc">Lý do: {job.disputeReason}</div>
                )}
              </div>
              <div className="job-modal-price-tag rejected">Chờ đối soát</div>
            </div>
          ) : isAwaitingSurvey ? (
            <div className="job-modal-price-box in-progress">
              <div>
                <div className="job-modal-price-label">Khách đã chọn bạn — Hãy đến khảo sát thực tế</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice ? `Dự kiến: ${job.quotedPrice.toLocaleString('vi-VN')} đ` : 'Khảo sát báo giá'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                  Phí khảo sát đã chốt: {(job.surveyFee ?? 0).toLocaleString('vi-VN')} đ · Phí di chuyển: {(job.travelFee ?? 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag in-progress">Chờ khảo sát</div>
            </div>
          ) : isAwaitingCustomerApproval ? (
            <div className="job-modal-price-box quoted">
              <div>
                <div className="job-modal-price-label">Đã gửi báo giá sau khảo sát — Chờ khách duyệt</div>
                <div className="job-modal-price-value">
                  {job.quoteVersions && job.quoteVersions.length > 0
                    ? `${job.quoteVersions[job.quoteVersions.length - 1].totalAmount.toLocaleString('vi-VN')} đ`
                    : `${(job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ`}
                </div>
              </div>
              <div className="job-modal-price-tag quoted">Chờ khách duyệt giá</div>
            </div>
          ) : isMyJobInProgress ? (
            <div className="job-modal-price-box in-progress">
              <div>
                <div className="job-modal-price-label">Giá đã được khách duyệt (Đang thi công)</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice ? `${job.quotedPrice.toLocaleString('vi-VN')} đ` : 'Chờ xác nhận'}
                </div>
              </div>
              <div className="job-modal-price-tag in-progress">Đang thực hiện</div>
            </div>
          ) : isAwaitingCompletionConfirm ? (
            <div className="job-modal-price-box in-progress">
              <div>
                <div className="job-modal-price-label">Đã báo hoàn thành — Chờ khách nghiệm thu & Thanh toán</div>
                <div className="job-modal-price-value">
                  {(job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag in-progress">Chờ thanh toán</div>
            </div>
          ) : isDeclinedAfterSurvey ? (
            <div className="job-modal-price-box assigned-other">
              <div>
                <div className="job-modal-price-label">Khách không sửa sau khảo sát (Thu phí khảo sát + di chuyển)</div>
                <div className="job-modal-price-value">
                  {(job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                  Trạng thái thanh toán: <strong>{job.paymentStatus}</strong> (Hoa hồng nền tảng: 0 đ)
                </div>
              </div>
              <div className="job-modal-price-tag assigned-other">Dừng sau khảo sát</div>
            </div>
          ) : isMyJobCompleted ? (
            <div className="job-modal-price-box completed">
              <div>
                <div className="job-modal-price-label">
                  Đã hoàn tất & Quyết toán ({job.paymentStatus === 'PAID_ONLINE' ? 'Online' : 'Tiền mặt'})
                </div>
                <div className="job-modal-price-value">
                  {job.quotedPrice?.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag completed">Hoàn thành</div>
            </div>
          ) : isAssignedToOther ? (
            <div className="job-modal-price-box assigned-other">
              <div className="assigned-other-content">
                <div className="assigned-other-title">
                  <Info size={16} />
                  <span>Đơn đã có thợ khác nhận</span>
                </div>
                <div className="assigned-other-desc">
                  Khách hàng đã lựa chọn một thợ khác cho công việc này. Yêu cầu báo giá của bạn đã đóng.
                </div>
                {job.quotedPrice ? (
                  <div className="assigned-other-subprice">
                    Mức giá bạn đã gửi báo giá: <strong>{job.quotedPrice.toLocaleString('vi-VN')} đ</strong>
                  </div>
                ) : null}
              </div>
              <div className="job-modal-price-tag assigned-other">Đã đóng</div>
            </div>
          ) : isOrderCanceled ? (
            <div className="job-modal-price-box canceled">
              <div>
                <div className="job-modal-price-label">Trạng thái đơn hàng</div>
                <div className="job-modal-price-value text-muted">Đã bị hủy</div>
                <div className="job-modal-price-subdesc">Khách hàng đã hủy yêu cầu công việc này.</div>
              </div>
              <div className="job-modal-price-tag canceled">Đã hủy</div>
            </div>
          ) : isRejected ? (
            <div className="job-modal-price-box rejected">
              <div>
                <div className="job-modal-price-label">Trạng thái yêu cầu</div>
                <div className="job-modal-price-value text-muted">Đã từ chối</div>
                {job.rejectReason && <div className="job-modal-price-subdesc">Lý do: {job.rejectReason}</div>}
              </div>
              <div className="job-modal-price-tag rejected">Từ chối</div>
            </div>
          ) : isQuoted ? (
            <div className="job-modal-price-box quoted">
              <div>
                <div className="job-modal-price-label">Giá dự kiến bạn đã báo cho khách</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice?.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag quoted">Đang chờ khách duyệt</div>
            </div>
          ) : (
            <div className="job-modal-price-box pending">
              <div>
                <div className="job-modal-price-label">Trạng thái yêu cầu</div>
                <div className="job-modal-price-value text-blue">Chờ bạn báo giá</div>
              </div>
              <div className="job-modal-price-tag pending">Yêu cầu mới</div>
            </div>
          )}

          {/* 3-Group Financial Breakdown Card */}
          {(isAssignedToMe || isQuoted) && (
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
                <span>Cấu trúc chi phí 3 nhóm & Hoa hồng nền tảng</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1. Phí khảo sát thỏa thuận:</span>
                  <span>
                    <strong>{(job.surveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                    {job.waiveSurveyIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>2. Phí di chuyển thỏa thuận:</span>
                  <span>
                    <strong>{(job.travelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                    {job.waiveTravelIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>3a. Tiền công thợ:</span>
                  <strong>{(job.laborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>3b. Tiền vật tư / linh kiện:</span>
                  <strong>{(job.materialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '0.35rem',
                  marginTop: '0.15rem',
                  color: '#0f766e'
                }}>
                  <span>Hoa hồng nền tảng ({job.commissionRateSnapshot ?? 10}% chỉ tính trên tiền công):</span>
                  <strong>{(job.commissionAmount ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>
            </div>
          )}

          {/* Quote Versions History */}
          {job.quoteVersions && job.quoteVersions.length > 0 && (
            <div style={{
              padding: '0.85rem 1rem',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                Lịch sử phiên bản Báo giá & Vật tư ({job.quoteVersions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {job.quoteVersions.map((ver) => (
                  <div
                    key={ver.id}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      background: ver.status === 'APPROVED' ? '#f0fdf4' : ver.status === 'PENDING_APPROVAL' ? '#fefce8' : '#f8fafc',
                      border: ver.status === 'APPROVED' ? '1px solid #bbf7d0' : ver.status === 'PENDING_APPROVAL' ? '1px solid #fde047' : '1px solid #e2e8f0',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>
                        Lần #{ver.versionNumber} ·{' '}
                        {ver.versionType === 'INITIAL_ESTIMATE'
                          ? 'Báo giá ban đầu'
                          : ver.versionType === 'POST_SURVEY_FINAL'
                          ? 'Báo giá chốt sau khảo sát'
                          : 'Điều chỉnh phát sinh'}
                      </span>
                      <span style={{
                        color: ver.status === 'APPROVED' ? '#15803d' : ver.status === 'PENDING_APPROVAL' ? '#a16207' : '#64748b'
                      }}>
                        {ver.status === 'APPROVED'
                          ? '✓ Khách đã duyệt'
                          : ver.status === 'PENDING_APPROVAL'
                          ? '⏳ Chờ khách duyệt'
                          : ver.status === 'REJECTED'
                          ? '✕ Khách từ chối'
                          : 'Đã thay thế'}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.25rem', color: '#334155' }}>
                      Tiền công: <strong>{ver.laborFee.toLocaleString('vi-VN')} đ</strong> · Vật tư: <strong>{ver.materialsFee.toLocaleString('vi-VN')} đ</strong> · Tổng: <strong>{ver.totalAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {ver.diagnosisOrReason && (
                      <div style={{ marginTop: '0.2rem', color: '#475569' }}>
                        Chẩn đoán / Lý do: <em>{ver.diagnosisOrReason}</em>
                      </div>
                    )}
                    {ver.items && ver.items.length > 0 && (
                      <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1' }}>
                        {ver.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569' }}>
                            <span>• {item.itemName} ({item.quantity} {item.unit || 'cái'})</span>
                            <span>{(item.totalPrice ?? item.quantity * item.unitPrice).toLocaleString('vi-VN')} đ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Customer info card */}
          <div className="job-modal-info-card">
            {/* Customer & Phone */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <Phone size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Khách hàng</div>
                <div className="job-modal-info-val">
                  {job.customerName} · <strong>{job.customerPhone || '***-***'}</strong>
                </div>
                {!canSeePhone && (
                  <span className="phone-privacy-hint">SĐT được bảo mật và hiển thị khi khách chốt việc.</span>
                )}
              </div>
              {canSeePhone && (
                <button 
                  type="button" 
                  onClick={handleCall}
                  className="btn-call-customer"
                >
                  Gọi điện
                </button>
              )}
            </div>

            {/* Address */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Địa chỉ thực hiện</div>
                <div className="job-modal-info-val">{job.addressSnapshot}</div>
              </div>
              <button 
                type="button" 
                onClick={handleOpenMap}
                title="Mở chỉ đường Google Maps"
                className="btn-open-maps"
              >
                <Navigation size={13} />
                <span>Bản đồ</span>
              </button>
            </div>

            {/* Time */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <Clock size={18} />
              </div>
              <div>
                <div className="job-modal-info-label">Thời gian khách mong muốn</div>
                <div className="job-modal-info-val">
                  {new Date(job.expectedScheduleTime).toLocaleString('vi-VN', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Customer problem description */}
          <div className="job-modal-note-box">
            <div className="job-modal-note-title">
              <AlertTriangle size={15} />
              <span>Mô tả sự cố từ khách hàng:</span>
            </div>
            <p className="job-modal-note-text">{job.description}</p>
          </div>

          {/* Photos */}
          {job.images && job.images.length > 0 && (
            <div className="job-images-container">
              <div className="job-images-label">Ảnh sự cố khách cung cấp ({job.images.length})</div>
              <div className="job-images-grid">
                {job.images.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="job-img-link">
                    <img src={url} alt={`Ảnh sự cố ${idx + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Your submitted quotation notes if available */}
          {job.providerNote && (
            <div className="job-provider-note-box">
              <span className="note-box-title">Ghi chú bạn đã gửi cho khách:</span>
              <p className="note-box-text">{job.providerNote}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="job-modal-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Always provide chat button so provider can consult */}
          <button 
            type="button" 
            className="btn-provider-chat"
            onClick={() => onOpenChat(job)}
          >
            <MessageSquare size={16} />
            <span>Chat với khách</span>
          </button>

          {isPending && (
            <>
              <button 
                type="button" 
                className="job-modal-decline-btn" 
                onClick={() => onRejectRequest(job)}
              >
                <Ban size={15} />
                <span>Từ chối</span>
              </button>
              <button 
                type="button" 
                className="job-modal-accept-btn" 
                onClick={() => onOpenQuoteModal(job)}
              >
                <DollarSign size={17} />
                <span>Gửi báo giá</span>
              </button>
            </>
          )}

          {(isAwaitingSurvey || isAwaitingCustomerApproval) && onOpenSurveyOrChangeModal && (
            <button
              type="button"
              className="job-modal-accept-btn"
              onClick={() => onOpenSurveyOrChangeModal(job, 'SURVEY_FINAL')}
            >
              <ClipboardCheck size={17} />
              <span>{isAwaitingSurvey ? 'Gửi báo giá sau khảo sát' : 'Cập nhật báo giá khảo sát'}</span>
            </button>
          )}

          {isAwaitingSurvey && (
            <button 
              type="button" 
              className="job-modal-decline-btn" 
              onClick={() => onRejectRequest(job)}
              title="Xác nhận hủy đơn khi đã thỏa thuận với khách"
            >
              <Ban size={15} />
              <span>Hủy việc (Thỏa thuận)</span>
            </button>
          )}

          {isMyJobInProgress && (
            <>
              {onOpenSurveyOrChangeModal && (
                <button
                  type="button"
                  className="btn-provider-chat"
                  style={{ borderColor: '#0284c7', color: '#0369a1' }}
                  onClick={() => onOpenSurveyOrChangeModal(job, 'IN_PROGRESS_CHANGE')}
                >
                  <FilePlus2 size={16} />
                  <span>Báo phát sinh vật tư</span>
                </button>
              )}
              <button 
                type="button" 
                className="job-modal-complete-btn"
                onClick={() => onCompleteOrder(job)}
              >
                <CheckCircle2 size={18} />
                <span>Báo hoàn thành việc</span>
              </button>
            </>
          )}

          {isCashPendingConfirmation && onOpenConfirmCashModal && (
            <button
              type="button"
              className="job-modal-complete-btn"
              style={{ background: '#ca8a04' }}
              onClick={() => onOpenConfirmCashModal(job)}
            >
              <Banknote size={18} />
              <span>Xác nhận thu tiền mặt</span>
            </button>
          )}

          {(isMyJobCompleted || isAssignedToOther || isOrderCanceled || isRejected || isQuoted) && (
            <button type="button" className="job-modal-done-btn" onClick={onClose}>
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
