import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { providerJobService } from '../../../services';
import type { ProviderJobItem, QuoteItemDto } from '../../../types/order';
import './SubmitQuotationModal.css';

interface SurveyAndChangeQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProviderJobItem | null;
  mode: 'SURVEY_FINAL' | 'IN_PROGRESS_CHANGE';
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

export function SurveyAndChangeQuoteModal({
  isOpen,
  onClose,
  job,
  mode,
  onSuccess,
}: SurveyAndChangeQuoteModalProps) {
  const [laborFee, setLaborFee] = useState<string>('');
  const [diagnosisOrReason, setDiagnosisOrReason] = useState<string>('');
  const [items, setItems] = useState<QuoteItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && job) {
      setLaborFee(job.laborFee ? job.laborFee.toLocaleString('vi-VN') : '');
      setDiagnosisOrReason('');
      // Lấy danh sách vật tư từ phiên bản gần nhất nếu có
      const latestVersion =
        job.quoteVersions && job.quoteVersions.length > 0
          ? job.quoteVersions[job.quoteVersions.length - 1]
          : null;
      if (latestVersion && latestVersion.items && latestVersion.items.length > 0) {
        setItems(latestVersion.items.map((it) => ({ ...it })));
      } else {
        setItems([]);
      }
      setErrorMsg(null);
      setLoading(false);
    }
  }, [isOpen, job, mode]);

  if (!isOpen || !job) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemName: '', unit: 'Cái', quantity: 1, unitPrice: 0, note: '' },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof QuoteItemDto, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        updated.totalPrice = (updated.quantity || 1) * (updated.unitPrice || 0);
        return updated;
      })
    );
  };

  const laborNum = parseVnd(laborFee);
  const materialsNum = items.reduce(
    (sum, it) => sum + (it.quantity || 1) * (it.unitPrice || 0),
    0
  );
  const appliedSurvey = job.waiveSurveyIfRepaired ? 0 : job.surveyFee || 0;
  const appliedTravel = job.waiveTravelIfRepaired ? 0 : job.travelFee || 0;
  const totalAmount = appliedSurvey + appliedTravel + laborNum + materialsNum;
  const commissionAmount = Math.round(laborNum * 0.1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosisOrReason.trim() || diagnosisOrReason.trim().length < 5) {
      setErrorMsg(
        mode === 'SURVEY_FINAL'
          ? 'Vui lòng nhập kết quả kiểm tra thực tế và nguyên nhân hư hỏng.'
          : 'Vui lòng nhập rõ lý do phát sinh hoặc điều chỉnh chi phí.'
      );
      return;
    }

    for (const it of items) {
      if (!it.itemName || !it.itemName.trim()) {
        setErrorMsg('Vui lòng nhập tên cho tất cả các dòng linh kiện / vật tư.');
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        laborFee: laborNum,
        diagnosisOrReason: diagnosisOrReason.trim(),
        items: items.map((it) => ({
          itemName: it.itemName.trim(),
          unit: it.unit || 'Cái',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          totalPrice: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          note: it.note,
        })),
      };

      if (mode === 'SURVEY_FINAL') {
        await providerJobService.submitSurveyQuote(job.orderId, payload);
      } else {
        await providerJobService.submitChangeRequest(job.orderId, payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi cập nhật báo giá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quote-modal-backdrop" onClick={onClose}>
      <div
        className="quote-modal-dialog"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="quote-modal-header">
          <div>
            <h3 className="quote-modal-title">
              {mode === 'SURVEY_FINAL'
                ? 'Cập Nhật Kết Quả Khảo Sát & Báo Giá Cuối'
                : 'Gửi Yêu Cầu Điều Chỉnh Chi Phí / Vật Tư Phát Sinh'}
            </h3>
            <p className="quote-modal-subtitle">
              Mã đơn: #{job.orderCode} · {job.title}
            </p>
          </div>
          <button type="button" className="quote-modal-close" onClick={onClose}>
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
            {/* Kết quả kiểm tra / Lý do phát sinh */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} className="text-blue" />
                <span>
                  {mode === 'SURVEY_FINAL'
                    ? 'Kết quả khảo sát thực tế & nguyên nhân hư hỏng *'
                    : 'Giải thích nguyên nhân phát sinh / điều chỉnh giá *'}
                </span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={
                  mode === 'SURVEY_FINAL'
                    ? 'Ví dụ: Qua kiểm tra thực tế phát hiện hỏng tụ đề 35uF và rò gas đầu tán cục nóng...'
                    : 'Ví dụ: Phát hiện thêm đoạn ống thoát nước bị nứt gãy âm tường, cần thay mới 2m ống...'
                }
                value={diagnosisOrReason}
                onChange={(e) => setDiagnosisOrReason(e.target.value)}
                autoFocus
              />
            </div>

            {/* Tiền công thực tế */}
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} className="text-blue" />
                <span>Tiền công sửa chữa thực tế chốt (VNĐ) *</span>
              </label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  className="price-input"
                  placeholder="Ví dụ: 250.000"
                  value={laborFee}
                  onChange={(e) => setLaborFee(formatVndInput(e.target.value))}
                />
                <span className="currency-suffix">VNĐ</span>
              </div>
            </div>

            {/* Danh sách vật tư / linh kiện */}
            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <Wrench size={16} className="text-blue" />
                  <span>Bảng kê vật tư / linh kiện thay thế ({items.length})</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #2563eb',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>Thêm linh kiện / vật tư</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  Không sử dụng thêm vật tư / linh kiện (Tiền vật tư = 0đ). Nhấn "Thêm linh kiện / vật tư" nếu cần thay thế phụ tùng.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 70px 80px 120px 36px',
                        gap: '8px',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Tên linh kiện (VD: Tụ đề 35uF)"
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="ĐVT"
                        className="form-select"
                        style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                        value={item.unit || ''}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="SL"
                        className="form-select"
                        style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                      />
                      <input
                        type="text"
                        placeholder="Đơn giá"
                        className="form-select"
                        style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                        value={item.unitPrice ? item.unitPrice.toLocaleString('vi-VN') : ''}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseVnd(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{
                          border: 'none',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '6px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Xóa dòng này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hộp tổng kết 3 nhóm chi phí */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.84rem',
                color: '#1e3a8a',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>
                Bảng Tổng Hợp Báo Giá Gửi Khách Duyệt:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>1. Phí khảo sát ({job.waiveSurveyIfRepaired ? 'Miễn phí khi sửa' : 'Áp dụng'}):</span>
                <strong>{appliedSurvey.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>2. Phí di chuyển ({job.waiveTravelIfRepaired ? 'Miễn phí khi sửa' : 'Áp dụng'}):</span>
                <strong>{appliedTravel.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>3a. Tiền công sửa chữa:</span>
                <strong>{laborNum.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>3b. Tiền vật tư / linh kiện ({items.length} mục):</span>
                <strong>{materialsNum.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #93c5fd',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                <span>Tổng cộng khách thanh toán (nếu đồng ý):</span>
                <span style={{ color: '#1d4ed8' }}>{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  fontSize: '0.78rem',
                  color: '#475569',
                }}
              >
                <span>
                  <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Hoa hồng nền tảng (10% chỉ tính trên Tiền công):
                </span>
                <strong>{commissionAmount.toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </div>

          <div className="quote-modal-footer">
            <button type="button" className="btn-quote-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-quote-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={17} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  <span>
                    {mode === 'SURVEY_FINAL'
                      ? 'Gửi Báo Giá Cuối Cho Khách Duyệt'
                      : 'Gửi Yêu Cầu Duyệt Phát Sinh'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
