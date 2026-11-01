import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { providerJobService } from '../../../services';
import { DongIcon } from '../../../components/common';
import './SubmitQuotationModal.css';

interface SubmitQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  orderTitle?: string;
  onSuccess?: () => void;
}

const parseVnd = (val: string): number => {
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

const formatVndInput = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('vi-VN');
};

export function SubmitQuotationModal({
  isOpen,
  onClose,
  requestId,
  orderTitle,
  onSuccess,
}: SubmitQuotationModalProps) {
  const [travelFee, setTravelFee] = useState<string>('30.000');
  const [laborFee, setLaborFee] = useState<string>('');
  const [materialsFee, setMaterialsFee] = useState<string>('0');
  const [providerNote, setProviderNote] = useState<string>('');
  const [scopeAndConditions, setScopeAndConditions] = useState<string>(
    'Miễn 100% phí di chuyển nếu khách hàng đồng ý sửa chữa sau khi kiểm tra thực tế.'
  );
  const [arrivalHours, setArrivalHours] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setTravelFee('30.000');
    setLaborFee('');
    setMaterialsFee('0');
    setProviderNote('');
    setScopeAndConditions(
      'Miễn 100% phí di chuyển nếu khách hàng đồng ý sửa chữa sau khi kiểm tra thực tế.'
    );
    setArrivalHours('1');
    setErrorMsg(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, requestId]);

  if (!isOpen || !requestId) return null;

  const travelNum = parseVnd(travelFee);
  const laborNum = parseVnd(laborFee);
  const materialsNum = parseVnd(materialsFee);

  // Khách sửa: Phí di chuyển = 0đ (miễn phí theo chính sách sàn)
  const totalEstimatedIfRepaired = laborNum + materialsNum;
  const feeIfDeclinedAfterSurvey = travelNum;
  const estimatedCommission = Math.round(laborNum * 0.1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (laborNum <= 0 && travelNum <= 0) {
      setErrorMsg('Vui lòng nhập Tiền công dự kiến (hoặc Phí di chuyển) lớn hơn 0.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const hours = parseFloat(arrivalHours) || 1;
      const arrivalDate = new Date(Date.now() + hours * 3600 * 1000);

      await providerJobService.submitQuotation(requestId, {
        travelFee: travelNum,
        waiveTravelIfRepaired: true,
        estimatedLaborFee: laborNum,
        estimatedMaterialsFee: materialsNum,
        quotedPrice: totalEstimatedIfRepaired > 0 ? totalEstimatedIfRepaired : feeIfDeclinedAfterSurvey,
        providerNote: providerNote.trim() || undefined,
        scopeAndConditions: scopeAndConditions.trim() || undefined,
        estimatedArrivalTime: arrivalDate.toISOString(),
      });

      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi báo giá, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quote-modal-backdrop" onClick={handleClose}>
      <div
        className="quote-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="quote-modal-header">
          <div className="quote-modal-header-left">
            <div className="quote-modal-icon-badge">
              <DongIcon size={20} />
            </div>
            <div>
              <h3 className="quote-modal-title">Gửi Báo Giá Dịch Vụ</h3>
              <p className="quote-modal-subtitle">
                Đơn hàng: <strong>{orderTitle || 'Yêu cầu dịch vụ'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="quote-modal-close"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="quote-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="quote-modal-form">
          <div className="quote-modal-body">
            {/* Khối Cơ Cấu Chi Phí Hợp Nhất */}
            <div className="quote-pricing-card">
              <div className="quote-pricing-card-header">
                <span className="quote-pricing-card-title">
                  <Truck size={16} style={{ color: '#2563EB' }} />
                  <span>Phí di chuyển / kiểm tra</span>
                </span>
                <span className="quote-free-badge">
                  Miễn phí khi khách sửa
                </span>
              </div>

              <div>
                <div className="price-input-wrapper">
                  <input
                    type="text"
                    className="price-input"
                    placeholder="30.000"
                    value={travelFee}
                    onChange={(e) => setTravelFee(formatVndInput(e.target.value))}
                  />
                  <span className="currency-suffix">VNĐ</span>
                </div>
                <p className="form-hint" style={{ marginTop: '0.35rem' }}>
                  Đã gồm công đi lại & kiểm tra. Thợ nhận khoản này nếu khách quyết định dừng đơn sau khi kiểm tra.
                </p>
              </div>

              {/* Grid 2 cột: Tiền công & Vật tư */}
              <div className="quote-pricing-grid">
                <div className="form-group">
                  <label className="form-label">
                    <DongIcon size={14} style={{ color: '#2563EB' }} />
                    <span>Tiền công thợ *</span>
                  </label>
                  <div className="price-input-wrapper">
                    <input
                      type="text"
                      className="price-input"
                      placeholder="Ví dụ: 200.000"
                      value={laborFee}
                      onChange={(e) => setLaborFee(formatVndInput(e.target.value))}
                      autoFocus
                    />
                    <span className="currency-suffix">VNĐ</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Wrench size={14} style={{ color: '#2563EB' }} />
                    <span>Vật tư dự kiến</span>
                  </label>
                  <div className="price-input-wrapper">
                    <input
                      type="text"
                      className="price-input"
                      placeholder="0"
                      value={materialsFee}
                      onChange={(e) => setMaterialsFee(formatVndInput(e.target.value))}
                    />
                    <span className="currency-suffix">VNĐ</span>
                  </div>
                </div>
              </div>

              {/* Bảng tóm tắt tài chính minh bạch */}
              <div className="quote-summary-box">
                <div className="quote-summary-row primary">
                  <span>Tổng khách trả khi sửa (Công + Vật tư):</span>
                  <strong>{totalEstimatedIfRepaired.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div className="quote-summary-row sub">
                  <span>Nếu khách từ chối sửa sau kiểm tra:</span>
                  <strong>{feeIfDeclinedAfterSurvey.toLocaleString('vi-VN')} đ (Hoa hồng: 0đ)</strong>
                </div>
                <div className="quote-summary-row commission">
                  <span>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Hoa hồng nền tảng (10% chỉ tính trên Tiền công):
                  </span>
                  <strong>{estimatedCommission.toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>
            </div>

            {/* Thời gian ước tính có mặt */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={15} style={{ color: '#2563EB' }} />
                <span>Ước tính có mặt sau</span>
              </label>
              <select
                className="form-select"
                value={arrivalHours}
                onChange={(e) => setArrivalHours(e.target.value)}
              >
                <option value="0.5">Khoảng 30 phút nữa</option>
                <option value="1">Khoảng 1 giờ nữa</option>
                <option value="2">Khoảng 2 giờ nữa</option>
                <option value="3">Khoảng 3 giờ nữa</option>
                <option value="5">Trong buổi hôm nay</option>
                <option value="24">Vào ngày mai</option>
              </select>
            </div>

            {/* Ghi chú giải pháp */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={15} style={{ color: '#2563EB' }} />
                <span>Phương án kiểm tra, thi công & cam kết bảo hành</span>
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ví dụ: Kiểm tra bo mạch, nạp bổ sung gas hoặc thay linh kiện chính hãng, bảo hành 6 tháng..."
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
              />
            </div>

            {/* Lưu ý phát sinh */}
            <div className="form-group">
              <label className="form-label">
                <ShieldCheck size={15} style={{ color: '#2563EB' }} />
                <span>Lưu ý phát sinh hoặc cam kết thêm (nếu có)</span>
              </label>
              <input
                type="text"
                className="form-select"
                placeholder="Ví dụ: Đã bao gồm trọn gói công và vật tư, không phụ thu..."
                value={scopeAndConditions}
                onChange={(e) => setScopeAndConditions(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="quote-modal-footer">
            <button
              type="button"
              className="btn-quote-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-quote-submit"
              disabled={loading || (laborNum <= 0 && travelNum <= 0)}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Xác nhận gửi báo giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
