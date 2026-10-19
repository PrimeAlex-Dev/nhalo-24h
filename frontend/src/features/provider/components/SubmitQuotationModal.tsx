import React, { useState, useEffect } from 'react';
import { X, DollarSign, Clock, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { providerJobService } from '../../../services';
import './SubmitQuotationModal.css';

interface SubmitQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  orderTitle?: string;
  onSuccess?: () => void;
}

export function SubmitQuotationModal({
  isOpen,
  onClose,
  requestId,
  orderTitle,
  onSuccess,
}: SubmitQuotationModalProps) {
  const [quotedPrice, setQuotedPrice] = useState<string>('');
  const [providerNote, setProviderNote] = useState<string>('');
  const [arrivalHours, setArrivalHours] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setQuotedPrice('');
    setProviderNote('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(quotedPrice.replace(/\D/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Vui lòng nhập giá tiền hợp lệ lớn hơn 0.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Calculate estimated arrival time: current time + arrivalHours
      const hours = parseFloat(arrivalHours) || 1;
      const arrivalDate = new Date(Date.now() + hours * 3600 * 1000);

      await providerJobService.submitQuotation(requestId, {
        quotedPrice: priceNum,
        providerNote: providerNote.trim() || undefined,
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setQuotedPrice('');
      return;
    }
    const num = parseInt(rawVal, 10);
    setQuotedPrice(num.toLocaleString('vi-VN'));
  };

  return (
    <div className="quote-modal-backdrop" onClick={handleClose}>
      <div 
        className="quote-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="quote-modal-header">
          <div>
            <h3 className="quote-modal-title">Gửi Báo Giá Cho Khách Hàng</h3>
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
          <div className="quote-modal-body">
            {/* 1. Nhập giá tiền */}
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} className="text-blue" />
                <span>Giá báo dự kiến trọn gói (VNĐ) *</span>
              </label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  className="price-input"
                  placeholder="Ví dụ: 250.000"
                  value={quotedPrice}
                  onChange={handlePriceChange}
                  autoFocus
                />
                <span className="currency-suffix">VNĐ</span>
              </div>
              <span className="form-hint">
                Hãy đưa ra mức giá cạnh tranh và minh bạch để tăng tỷ lệ khách hàng chọn bạn.
              </span>
            </div>

            {/* 2. Thời gian ước tính có mặt */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="text-blue" />
                <span>Ước tính có mặt sau (giờ)</span>
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

            {/* 3. Ghi chú cam kết / vật tư */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} className="text-blue" />
                <span>Ghi chú giải pháp & bảo hành cho khách</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Ví dụ: Giá đã bao gồm tiền công và linh kiện thay mới chính hãng, cam kết bảo hành 6 tháng..."
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
              />
            </div>
          </div>

          <div className="quote-modal-footer">
            <button 
              type="button" 
              className="btn-quote-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-quote-submit"
              disabled={loading || !quotedPrice}
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
