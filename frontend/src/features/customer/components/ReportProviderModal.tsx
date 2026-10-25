import { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Upload, 
  Trash2, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { reportService, fileService } from '../../../services';
import type { ReportReasonType } from '../../../types/report';
import './ReportProviderModal.css';

interface ReportProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  providerAvatar?: string | null;
  orderId?: string;
  orderCode?: string;
  onSuccess: () => void;
}

interface ReasonOption {
  value: ReportReasonType;
  label: string;
  sub: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {
    value: 'OVERCHARGING_OR_OFF_PLATFORM',
    label: 'Ép giá / Vòi thêm tiền / Rủ giao dịch ngoài app',
    sub: 'Thợ tự ý tăng giá ngoài thỏa thuận hoặc dụ dỗ thanh toán riêng để né bảo hành'
  },
  {
    value: 'POOR_QUALITY_OR_DAMAGE',
    label: 'Thi công ẩu / Làm hư hỏng tài sản trong nhà',
    sub: 'Gây vỡ gạch, chập điện, rò rỉ nước hoặc làm hỏng thiết bị gia đình'
  },
  {
    value: 'NO_SHOW_OR_ABANDONMENT',
    label: 'Bỏ hẹn không đến / Bỏ dở công việc giữa chừng',
    sub: 'Thợ không đến đúng hẹn đã nhận, hoặc thi công dở dang rồi biến mất'
  },
  {
    value: 'UNPROFESSIONAL_BEHAVIOR',
    label: 'Thái độ thô lỗ / Đe dọa / Thiếu văn hóa',
    sub: 'Có lời lẽ xúc phạm, to tiếng hoặc đe dọa gia chủ'
  },
  {
    value: 'WARRANTY_REFUSAL',
    label: 'Trốn tránh trách nhiệm bảo hành',
    sub: 'Sự cố tái phát trong thời hạn bảo hành nhưng thợ từ chối quay lại khắc phục'
  },
  {
    value: 'FRAUD_OR_DISHONEST',
    label: 'Gian lận vật tư / Khai khống giá linh kiện',
    sub: 'Tráo đồ cũ, mua hàng kém chất lượng nhưng tính giá hàng cao cấp'
  },
  {
    value: 'OTHER',
    label: 'Lý do khác',
    sub: 'Các vấn đề phát sinh khác cần Quản trị viên can thiệp xử lý'
  }
];

export function ReportProviderModal({
  isOpen,
  onClose,
  providerId,
  providerName,
  providerAvatar,
  orderId,
  orderCode,
  onSuccess,
}: ReportProviderModalProps) {
  const [reasonType, setReasonType] = useState<ReportReasonType>('OVERCHARGING_OR_OFF_PLATFORM');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [expectedResolution, setExpectedResolution] = useState<string>(
    'Yêu cầu đền bù thiệt hại / hoàn tiền từ tiền ký quỹ của thợ'
  );

  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (evidenceImages.length + files.length > 5) {
      setErrorMsg('Bạn chỉ có thể đính kèm tối đa 5 hình ảnh bằng chứng');
      return;
    }

    try {
      setUploadingImages(true);
      setErrorMsg(null);
      const urls = await fileService.uploadOrderImages(files);
      setEvidenceImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải ảnh bằng chứng lên');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages(evidenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tóm tắt tiêu đề sự việc');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setErrorMsg('Vui lòng mô tả chi tiết sự việc (tối thiểu 15 ký tự)');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await reportService.createReport({
        orderId: orderId || undefined,
        providerId,
        reasonType,
        title: title.trim(),
        description: description.trim(),
        evidenceImages,
        expectedResolution,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div 
        className="report-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="report-modal-header">
          <div className="header-left">
            <div className="report-alert-badge">
              <ShieldAlert size={15} />
              <span>Khiếu nại & Báo cáo vi phạm</span>
            </div>
            <h3 className="report-modal-title">Báo cáo thợ cho Quản trị viên</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Protection Banner */}
        <div className="report-protection-banner">
          <ShieldCheck size={20} className="banner-icon" />
          <div className="banner-text">
            <strong>Bảo vệ khách hàng 100%:</strong> NhaLo24h cam kết thụ lý trong vòng <strong>24h</strong>. Thợ có ký quỹ bảo đảm <strong>2.000.000đ</strong> tại hệ thống, nếu xác định thợ vi phạm cam kết hoặc gây thiệt hại, sàn sẽ trích phạt trực tiếp tiền ký quỹ để bồi thường cho bạn.
          </div>
        </div>

        {/* Accused Provider Strip */}
        <div className="accused-provider-strip">
          {providerAvatar ? (
            <img src={providerAvatar} alt={providerName} className="accused-avatar" />
          ) : (
            <div className="accused-avatar-fallback">
              {providerName ? providerName.charAt(0).toUpperCase() : 'T'}
            </div>
          )}
          <div className="accused-info">
            <div className="accused-label">Thợ bị báo cáo:</div>
            <div className="accused-name">{providerName}</div>
            {orderCode && <div className="accused-order">Liên quan đến đơn hàng: <strong>{orderCode}</strong></div>}
          </div>
        </div>

        {errorMsg && (
          <div className="report-alert-error">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          {/* Reason Type Selection */}
          <div className="form-group">
            <label className="field-label">1. Loại vi phạm của thợ (*):</label>
            <div className="reasons-radio-list">
              {REASON_OPTIONS.map((opt) => (
                <label 
                  key={opt.value} 
                  className={`reason-radio-item ${reasonType === opt.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="reasonType"
                    value={opt.value}
                    checked={reasonType === opt.value}
                    onChange={() => setReasonType(opt.value)}
                  />
                  <div className="reason-content">
                    <span className="reason-title">{opt.label}</span>
                    <span className="reason-sub">{opt.sub}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div className="form-group">
            <label className="field-label" htmlFor="report-title">2. Tóm tắt sự việc (*):</label>
            <input
              id="report-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thợ tự ý nâng giá thêm 300k, không làm đúng hợp đồng..."
              className="text-input"
              maxLength={200}
            />
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="field-label" htmlFor="report-desc">3. Mô tả chi tiết diễn biến sự việc (*):</label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng trình bày rõ: thời gian diễn ra, địa điểm, nội dung thợ nói/làm và mức độ thiệt hại nếu có..."
              rows={4}
              className="textarea-input"
            />
          </div>

          {/* Evidence Upload */}
          <div className="form-group">
            <label className="field-label">4. Bằng chứng hình ảnh (ảnh đồ đạc hỏng, hóa đơn, tin nhắn vòi tiền...):</label>
            <div className="evidence-grid">
              {evidenceImages.map((url, i) => (
                <div key={i} className="evidence-box">
                  <img src={url} alt={`Bằng chứng ${i + 1}`} className="evidence-img" />
                  <button
                    type="button"
                    className="evidence-del-btn"
                    onClick={() => handleRemoveImage(i)}
                    title="Xóa ảnh"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {evidenceImages.length < 5 && (
                <label className="evidence-upload-trigger">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploadingImages || submitting}
                    style={{ display: 'none' }}
                  />
                  {uploadingImages ? (
                    <Loader2 size={20} className="spin-icon text-blue" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Thêm bằng chứng</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Expected Resolution */}
          <div className="form-group">
            <label className="field-label">5. Nguyện vọng xử lý của bạn:</label>
            <select
              value={expectedResolution}
              onChange={(e) => setExpectedResolution(e.target.value)}
              className="select-input"
            >
              <option value="Yêu cầu đền bù thiệt hại / hoàn tiền từ tiền ký quỹ của thợ">
                Yêu cầu đền bù thiệt hại / hoàn tiền từ tiền ký quỹ của thợ
              </option>
              <option value="Yêu cầu thợ quay lại bảo hành sửa chữa miễn phí theo cam kết">
                Yêu cầu thợ quay lại bảo hành sửa chữa miễn phí theo cam kết
              </option>
              <option value="Yêu cầu xử lý kỷ luật / khóa tài khoản thợ vi phạm">
                Yêu cầu xử lý kỷ luật / khóa tài khoản thợ vi phạm
              </option>
              <option value="Cần Quản trị viên gọi điện hỗ trợ hòa giải">
                Cần Quản trị viên gọi điện hỗ trợ hòa giải
              </option>
            </select>
          </div>

          {/* Actions */}
          <div className="report-modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-submit-report"
              disabled={submitting || uploadingImages}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi khiếu nại...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>Gửi khiếu nại lên Quản trị viên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
