import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Upload, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  UserCheck 
} from 'lucide-react';
import { customerOrderService, customerAddressService, categoryService } from '../../../services';
import type { UserAddress } from '../types/customer';
import type { CustomerOrderDetail } from '../../../types/order';
import './CreateOrderModal.css';

interface CategoryOption {
  id: string;
  name: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: CustomerOrderDetail) => void;
  initialProviderId?: string;
  initialProviderName?: string;
  defaultCategoryId?: string;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
  initialProviderId,
  initialProviderName,
  defaultCategoryId,
}: CreateOrderModalProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('14:00');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContactName('');
    setContactPhone('');
    setImageInput('');
    setImageUrls([]);
    setErrorMsg(null);
    setSubmitting(false);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('14:00');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setErrorMsg(null);
      const [addrRes, catRes] = await Promise.all([
        customerAddressService.getAddresses(),
        categoryService.getCategories(),
      ]);

      setAddresses(addrRes);
      // Auto-select default address if exists
      const defaultAddr = addrRes.find((a) => a.isDefault) || addrRes[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }

      const catList = catRes.content || [];
      setCategories(catList.map((c: any) => ({ id: c.id, name: c.name })));
      if (defaultCategoryId) {
        setSelectedCategoryId(defaultCategoryId);
      } else if (catList.length > 0) {
        setSelectedCategoryId(catList[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải sổ địa chỉ và danh mục.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddImage = () => {
    if (!imageInput.trim()) return;
    if (imageUrls.length >= 5) {
      setErrorMsg('Tối đa 5 hình ảnh cho mỗi đơn hàng.');
      return;
    }
    setImageUrls([...imageUrls, imageInput.trim()]);
    setImageInput('');
    setErrorMsg(null);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setErrorMsg('Vui lòng chọn địa chỉ sự cố từ sổ địa chỉ.');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMsg('Vui lòng chọn danh mục dịch vụ.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề sự cố.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả chi tiết sự cố.');
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      setErrorMsg('Vui lòng chọn ngày và giờ mong muốn.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Combine date and time to ISO 8601 Instant
      const expectedDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();

      const payload = {
        categoryId: selectedCategoryId,
        addressId: selectedAddressId,
        title: title.trim(),
        description: description.trim(),
        expectedScheduleTime: expectedDateTime,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        initialProviderIds: initialProviderId ? [initialProviderId] : undefined,
      };

      const result = await customerOrderService.createOrder(payload);
      resetForm();
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-order-modal-backdrop" onClick={handleClose}>
      <div 
        className="create-order-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="create-order-header">
          <div>
            <h2 className="create-order-title">Đặt lịch sửa chữa & Nhận báo giá</h2>
            <p className="create-order-subtitle">
              Mô tả sự cố để thợ chuyên nghiệp gần bạn nhận định và gửi báo giá minh bạch.
            </p>
          </div>
          <button 
            type="button" 
            className="create-order-close-btn" 
            onClick={handleClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {initialProviderName && (
          <div className="create-order-provider-banner">
            <UserCheck size={18} />
            <span>
              Yêu cầu báo giá sẽ được gửi trực tiếp đến thợ <strong>{initialProviderName}</strong>.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="create-order-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {loadingData ? (
          <div className="create-order-loading">
            <Loader2 size={32} className="spin-icon" />
            <p>Đang tải thông tin sổ địa chỉ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-order-form">
            <div className="create-order-body">
              {/* 1. Chọn địa chỉ từ sổ địa chỉ */}
              <div className="form-group-section">
                <label className="section-label">
                  <MapPin size={16} />
                  <span>Địa chỉ nơi xảy ra sự cố *</span>
                </label>
                {addresses.length === 0 ? (
                  <div className="no-address-box">
                    <p>Bạn chưa có địa chỉ nào trong sổ địa chỉ.</p>
                    <a href="/customer/profile" className="btn-add-address-link">
                      <Plus size={14} /> Thêm địa chỉ mới tại Hồ sơ
                    </a>
                  </div>
                ) : (
                  <div className="address-radio-grid">
                    {addresses.map((addr) => (
                      <label 
                        key={addr.id} 
                        className={`address-radio-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="addressRadio"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div className="address-card-info">
                          <div className="address-card-header">
                            <span className="address-label-badge">{addr.label}</span>
                            {addr.isDefault && <span className="default-tag">Mặc định</span>}
                          </div>
                          <p className="address-full-text">{addr.fullAddress}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Chọn danh mục sự cố */}
              <div className="form-group-section">
                <label className="section-label">Danh mục dịch vụ *</label>
                <select 
                  className="form-select"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Tiêu đề & mô tả */}
              <div className="form-group-section">
                <label className="section-label">Tiêu đề sự cố *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Vòi nước bồn rửa chén bị rò rỉ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="form-group-section">
                <label className="section-label">Mô tả chi tiết tình trạng *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Mô tả cụ thể hiện tượng: chảy nước liên tục, chập điện cầu dao, máy lạnh không lạnh..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* 4. Thời gian mong muốn */}
              <div className="form-row-two-col">
                <div className="form-group-section">
                  <label className="section-label">
                    <Calendar size={16} />
                    <span>Ngày mong muốn *</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="form-group-section">
                  <label className="section-label">
                    <Clock size={16} />
                    <span>Giờ mong muốn *</span>
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              {/* 5. Tùy chọn người nhận thay thế */}
              <div className="form-row-two-col">
                <div className="form-group-section">
                  <label className="section-label">Tên người liên hệ tại nhà (tùy chọn)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mặc định lấy tên tài khoản"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="form-group-section">
                  <label className="section-label">Số điện thoại liên hệ (tùy chọn)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Mặc định lấy SĐT tài khoản"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* 6. Đính kèm hình ảnh minh chứng sự cố */}
              <div className="form-group-section">
                <label className="section-label">
                  <Upload size={16} />
                  <span>Hình ảnh sự cố (tối đa 5 ảnh)</span>
                </label>
                <div className="image-input-group">
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Nhập đường link ảnh (vd: https://res.cloudinary.com/...)"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn-add-img"
                    onClick={handleAddImage}
                  >
                    Thêm ảnh
                  </button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="image-preview-list">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="image-preview-item">
                        <img src={url} alt={`Ảnh ${idx + 1}`} />
                        <button
                          type="button"
                          className="btn-del-img"
                          onClick={() => handleRemoveImage(idx)}
                          title="Xóa ảnh"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="create-order-footer">
              <button 
                type="button" 
                className="btn-cancel-order" 
                onClick={onClose}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="btn-submit-order"
                disabled={submitting || addresses.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Đang tạo đơn...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Gửi yêu cầu đặt thợ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
