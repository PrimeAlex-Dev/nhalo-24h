import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  SearchCheck,
  Wrench,
} from 'lucide-react';
import { providerJobService } from '../../../services';
import type { QuoteMode } from '../../../types/order';
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
  const [quoteMode, setQuoteMode] = useState<QuoteMode>('SURVEY_REQUIRED');
  const [surveyFee, setSurveyFee] = useState<string>('50.000');
  const [travelFee, setTravelFee] = useState<string>('30.000');
  const [waiveSurvey, setWaiveSurvey] = useState<boolean>(true);
  const [waiveTravel, setWaiveTravel] = useState<boolean>(true);
  const [laborFee, setLaborFee] = useState<string>('');
  const [materialsFee, setMaterialsFee] = useState<string>('0');
  const [providerNote, setProviderNote] = useState<string>('');
  const [scopeAndConditions, setScopeAndConditions] = useState<string>(
    'Miễn 100% phí khảo sát & di chuyển nếu khách hàng đồng ý sửa chữa sau khi kiểm tra thực tế.'
  );
  const [arrivalHours, setArrivalHours] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setQuoteMode('SURVEY_REQUIRED');
    setSurveyFee('50.000');
    setTravelFee('30.000');
    setWaiveSurvey(true);
    setWaiveTravel(true);
    setLaborFee('');
    setMaterialsFee('0');
    setProviderNote('');
    setScopeAndConditions(
      'Miễn 100% phí khảo sát & di chuyển nếu khách hàng đồng ý sửa chữa sau khi kiểm tra thực tế.'
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

  const surveyNum = quoteMode === 'COMMITTED_FIXED' ? 0 : parseVnd(surveyFee);
  const travelNum = quoteMode === 'COMMITTED_FIXED' ? 0 : parseVnd(travelFee);
  const laborNum = parseVnd(laborFee);
  const materialsNum = parseVnd(materialsFee);

  const appliedSurveyIfRepaired = quoteMode === 'COMMITTED_FIXED' || waiveSurvey ? 0 : surveyNum;
  const appliedTravelIfRepaired = quoteMode === 'COMMITTED_FIXED' || waiveTravel ? 0 : travelNum;
  const totalEstimatedIfRepaired =
    appliedSurveyIfRepaired + appliedTravelIfRepaired + laborNum + materialsNum;
  const feeIfDeclinedAfterSurvey = surveyNum + travelNum;
  const estimatedCommission = Math.round(laborNum * 0.1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (laborNum <= 0 && surveyNum <= 0) {
      setErrorMsg('Vui lòng nhập Tiền công dự kiến (hoặc Phí khảo sát) lớn hơn 0.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const hours = parseFloat(arrivalHours) || 1;
      const arrivalDate = new Date(Date.now() + hours * 3600 * 1000);

      await providerJobService.submitQuotation(requestId, {
        quoteMode,
        surveyFee: surveyNum,
        travelFee: travelNum,
        waiveSurveyIfRepaired: quoteMode === 'COMMITTED_FIXED' ? true : waiveSurvey,
        waiveTravelIfRepaired: quoteMode === 'COMMITTED_FIXED' ? true : waiveTravel,
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
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="quote-modal-header">
          <div>
            <h3 className="quote-modal-title">Gửi Báo Giá Chuẩn 3 Nhóm Chi Phí</h3>
            {orderTitle && <p className="quote-modal-subtitle">Đơn: {orderTitle}</p>}
          </div>
          <button
            type="button"
            className="quote-modal-close"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="quote-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="quote-modal-form">
          <div className="quote-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Chọn chế độ báo giá */}
            <div className="form-group">
              <label className="form-label">
                <Wrench size={16} className="text-blue" />
                <span>Hình thức báo giá & quy trình làm việc *</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setQuoteMode('SURVEY_REQUIRED')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: quoteMode === 'SURVEY_REQUIRED' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: quoteMode === 'SURVEY_REQUIRED' ? '#eff6ff' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 4 }}>
                    🔍 Cần khảo sát thực tế
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Báo giá sơ bộ trước, đến kiểm tra thực tế rồi chốt giá cuối & vật tư (Phù hợp Sửa chữa / Vệ sinh thực tế).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQuoteMode('COMMITTED_FIXED')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: quoteMode === 'COMMITTED_FIXED' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: quoteMode === 'COMMITTED_FIXED' ? '#eff6ff' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 4 }}>
                    ✅ Báo giá cố định cam kết
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Cam kết đúng giá theo mô tả ban đầu, khách chọn là bắt đầu làm ngay (Phù hợp Gói vệ sinh chuẩn).
                  </div>
                </button>
              </div>
            </div>

            {/* Nhóm 1 & Nhóm 2: Phí khảo sát & Phí di chuyển (Chỉ hiện khi SURVEY_REQUIRED) */}
            {quoteMode === 'SURVEY_REQUIRED' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '10px' }}>
                  Nhóm 1 & 2: Phí khảo sát và Phí di chuyển
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>
                      <SearchCheck size={14} className="text-blue" />
                      <span>1. Phí khảo sát (VNĐ)</span>
                    </label>
                    <input
                      type="text"
                      className="price-input"
                      style={{ padding: '8px 12px', fontSize: '0.95rem' }}
                      placeholder="50.000"
                      value={surveyFee}
                      onChange={(e) => setSurveyFee(formatVndInput(e.target.value))}
                    />
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        color: '#334155',
                        marginTop: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={waiveSurvey}
                        onChange={(e) => setWaiveSurvey(e.target.checked)}
                      />
                      <span>Miễn phí khảo sát nếu khách đồng ý sửa</span>
                    </label>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>
                      <Truck size={14} className="text-blue" />
                      <span>2. Phí di chuyển (VNĐ)</span>
                    </label>
                    <input
                      type="text"
                      className="price-input"
                      style={{ padding: '8px 12px', fontSize: '0.95rem' }}
                      placeholder="30.000"
                      value={travelFee}
                      onChange={(e) => setTravelFee(formatVndInput(e.target.value))}
                    />
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        color: '#334155',
                        marginTop: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={waiveTravel}
                        onChange={(e) => setWaiveTravel(e.target.checked)}
                      />
                      <span>Miễn phí di chuyển nếu khách đồng ý sửa</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Nhóm 3: Tiền công & Vật tư */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#14532d', marginBottom: '10px' }}>
                Nhóm 3: Tiền công & Vật tư {quoteMode === 'SURVEY_REQUIRED' ? '(Dự kiến ban đầu)' : '(Giá cam kết)'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    <DollarSign size={14} className="text-blue" />
                    <span>Tiền công thợ (VNĐ) *</span>
                  </label>
                  <input
                    type="text"
                    className="price-input"
                    style={{ padding: '8px 12px', fontSize: '0.95rem' }}
                    placeholder="Ví dụ: 200.000"
                    value={laborFee}
                    onChange={(e) => setLaborFee(formatVndInput(e.target.value))}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    <Wrench size={14} className="text-blue" />
                    <span>Tiền vật tư / linh kiện dự kiến (VNĐ)</span>
                  </label>
                  <input
                    type="text"
                    className="price-input"
                    style={{ padding: '8px 12px', fontSize: '0.95rem' }}
                    placeholder="Ví dụ: 100.000 (hoặc 0)"
                    value={materialsFee}
                    onChange={(e) => setMaterialsFee(formatVndInput(e.target.value))}
                  />
                </div>
              </div>

              {/* Minh bạch hoa hồng cho thợ */}
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px dashed #86efac',
                  fontSize: '0.8rem',
                  color: '#166534',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tổng khách trả dự kiến (khi đồng ý làm):</span>
                  <strong>{totalEstimatedIfRepaired.toLocaleString('vi-VN')} đ</strong>
                </div>
                {quoteMode === 'SURVEY_REQUIRED' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Nếu khách từ chối sửa sau khảo sát (Khách trả KS + Di chuyển):</span>
                    <strong>{feeIfDeclinedAfterSurvey.toLocaleString('vi-VN')} đ (Hoa hồng: 0đ)</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Hoa hồng nền tảng (10% chỉ tính trên Tiền công, 0% vật tư):
                  </span>
                  <strong>{estimatedCommission.toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>
            </div>

            {/* Thời gian ước tính có mặt */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="text-blue" />
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

            {/* Ghi chú giải pháp & phạm vi điều kiện */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} className="text-blue" />
                <span>Phương án kiểm tra, phạm vi công việc & cam kết bảo hành</span>
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ví dụ: Kiểm tra bo mạch, nạp bổ sung gas hoặc thay linh kiện chính hãng, bảo hành 6 tháng..."
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
              />
            </div>

            {quoteMode === 'SURVEY_REQUIRED' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>Điều kiện miễn phí khảo sát / di chuyển & lưu ý phát sinh</span>
                </label>
                <input
                  type="text"
                  className="form-select"
                  value={scopeAndConditions}
                  onChange={(e) => setScopeAndConditions(e.target.value)}
                />
              </div>
            )}
          </div>

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
              disabled={loading || (laborNum <= 0 && surveyNum <= 0)}
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
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
