import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  ImageIcon,
  Zap
} from 'lucide-react';
import { 
  customerOrderService, 
  customerAddressService, 
  categoryService, 
  fileService 
} from '../../../services';
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

interface UploadItem {
  id: string;
  previewUrl: string;
  serverUrl?: string;
  isUploading: boolean;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const [urgencyLevel, setUrgencyLevel] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [serviceMetadata, setServiceMetadata] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('14:00');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedImagesRef = useRef<UploadItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach((img) => {
        if (img.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUrgencyLevel('NORMAL');
    setServiceMetadata('');
    setContactName('');
    setContactPhone('');
    uploadedImages.forEach((img) => {
      if (img.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setUploadedImages([]);
    setIsDragging(false);
    setErrorMsg(null);
    setSubmitting(false);
    setScheduleDate(getTomorrowDateString());
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

  const handleFilesAdded = async (newFiles: File[]) => {
    if (!newFiles || newFiles.length === 0) return;

    const currentCount = uploadedImages.length;
    if (currentCount >= MAX_IMAGES) {
      setErrorMsg('Đã đạt giới hạn tối đa 5 hình ảnh cho mỗi đơn hàng.');
      return;
    }

    const availableSlots = MAX_IMAGES - currentCount;
    const filesToProcess = newFiles.slice(0, availableSlots);
    if (newFiles.length > availableSlots) {
      setErrorMsg(`Chỉ có thể chọn thêm tối đa ${availableSlots} ảnh nữa.`);
    }

    const validFiles: File[] = [];
    for (const file of filesToProcess) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const type = file.type.toLowerCase();
      const isValidType = ALLOWED_TYPES.includes(type) || ALLOWED_EXTS.includes(ext);

      if (!isValidType) {
        setErrorMsg(`Tệp "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng JPG, PNG, WEBP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`Tệp "${file.name}" vượt quá kích thước cho phép (tối đa 10MB).`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newItems: UploadItem[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    setUploadedImages((prev) => [...prev, ...newItems]);
    setErrorMsg(null);

    try {
      const urls = await fileService.uploadOrderImages(validFiles);
      setUploadedImages((prev) =>
        prev.map((item) => {
          const indexInBatch = newItems.findIndex((n) => n.id === item.id);
          if (indexInBatch !== -1 && urls[indexInBatch]) {
            return {
              ...item,
              serverUrl: urls[indexInBatch],
              isUploading: false,
            };
          }
          return item;
        })
      );
    } catch (err: any) {
      const newIds = new Set(newItems.map((n) => n.id));
      newItems.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      setUploadedImages((prev) => prev.filter((item) => !newIds.has(item.id)));
      setErrorMsg(err.message || 'Không thể tải ảnh lên máy chủ, vui lòng thử lại.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
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

    const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime.getTime() <= Date.now()) {
      setErrorMsg('Thời gian hẹn mong muốn không thể ở trong quá khứ. Vui lòng chọn ngày và giờ từ hiện tại trở đi.');
      return;
    }

    const trimmedContactName = contactName.trim();
    if (trimmedContactName.length > 0) {
      if (trimmedContactName.length < 2 || trimmedContactName.length > 100) {
        setErrorMsg('Tên người liên hệ tại nhà phải từ 2 đến 100 ký tự.');
        return;
      }
    }

    const trimmedContactPhone = contactPhone.trim();
    const VIETNAM_PHONE_REGEX = /^0[0-9]{9}$/;
    if (trimmedContactPhone.length > 0) {
      if (!VIETNAM_PHONE_REGEX.test(trimmedContactPhone)) {
        setErrorMsg('Số điện thoại liên hệ phải gồm đúng 10 chữ số và bắt đầu bằng số 0.');
        return;
      }
    }

    const anyUploading = uploadedImages.some((img) => img.isUploading);
    if (anyUploading) {
      setErrorMsg('Hình ảnh đang được tải lên, vui lòng đợi giây lát.');
      return;
    }

    const finalImageUrls = uploadedImages
      .map((img) => img.serverUrl)
      .filter((url): url is string => Boolean(url));

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Combine date and time to ISO 8601 Instant
      const expectedDateTime = selectedDateTime.toISOString();

      const payload = {
        categoryId: selectedCategoryId,
        addressId: selectedAddressId,
        title: title.trim(),
        description: description.trim(),
        urgencyLevel,
        serviceMetadata: serviceMetadata.trim() || undefined,
        expectedScheduleTime: expectedDateTime,
        contactName: trimmedContactName || undefined,
        contactPhone: trimmedContactPhone || undefined,
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
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
            <h2 className="create-order-title">Đặt lịch dịch vụ & Nhận báo giá</h2>
            <p className="create-order-subtitle">
              Mô tả sự cố hoặc quy mô dịch vụ để thợ chuyên nghiệp gửi báo giá bóc tách 3 nhóm chi phí minh bạch.
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
                  <span>Địa chỉ nơi thực hiện dịch vụ *</span>
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

              {/* 2. Chọn danh mục & Mức độ khẩn cấp */}
              <div className="form-row-two-col">
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

                <div className="form-group-section">
                  <label className="section-label">
                    <Zap size={15} />
                    <span>Mức độ khẩn cấp</span>
                  </label>
                  <select
                    className="form-select"
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as 'NORMAL' | 'URGENT' | 'EMERGENCY')}
                  >
                    <option value="NORMAL">Bình thường (Đặt lịch chuẩn)</option>
                    <option value="URGENT">Cần xử lý gấp trong ngày</option>
                    <option value="EMERGENCY">Khẩn cấp (Sự cố rò nước / chập điện)</option>
                  </select>
                </div>
              </div>

              {/* 3. Tiêu đề & mô tả */}
              <div className="form-group-section">
                <label className="section-label">Tiêu đề yêu cầu *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Vòi nước bồn rửa chén bị rò rỉ / Vệ sinh 2 máy lạnh treo tường"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="form-group-section">
                <label className="section-label">Mô tả chi tiết tình trạng / yêu cầu *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Mô tả cụ thể hiện tượng: chảy nước liên tục, chập điện cầu dao, máy lạnh không lạnh..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group-section">
                <label className="section-label">Thông số bổ sung (Hãng thiết bị / Công suất / Diện tích - tùy chọn)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Máy lạnh Daikin Inverter 1.5HP, căn hộ tầng 5 có thang máy..."
                  value={serviceMetadata}
                  onChange={(e) => setServiceMetadata(e.target.value)}
                  maxLength={250}
                />
                <span className="field-helper-hint">Giúp thợ chuẩn bị đúng vật tư hoặc gửi gói báo giá cố định chính xác hơn</span>
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
                    min={getTodayDateString()}
                    value={scheduleDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduleDate(val);
                      if (val && val < getTodayDateString()) {
                        setErrorMsg('Ngày mong muốn không thể là ngày trong quá khứ.');
                      } else {
                        setErrorMsg(null);
                      }
                    }}
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
                    onChange={(e) => {
                      setScheduleTime(e.target.value);
                      setErrorMsg(null);
                    }}
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
                    maxLength={100}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                  <span className="field-helper-hint">Tối đa 100 ký tự (để trống sẽ lấy tên tài khoản)</span>
                </div>
                <div className="form-group-section">
                  <label className="section-label">Số điện thoại liên hệ (tùy chọn)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="form-input"
                    placeholder="Mặc định lấy SĐT tài khoản"
                    value={contactPhone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setContactPhone(val);
                    }}
                  />
                  <span className="field-helper-hint">10 chữ số, bắt đầu bằng 0 (để trống lấy SĐT tài khoản)</span>
                </div>
              </div>

              {/* 6. Đính kèm hình ảnh minh chứng sự cố từ thiết bị */}
              <div className="form-group-section">
                <div className="section-label-row">
                  <label className="section-label">
                    <ImageIcon size={16} />
                    <span>Hình ảnh hiện trạng (tối đa 5 ảnh)</span>
                  </label>
                  <span className="image-counter-badge">{uploadedImages.length}/5 ảnh</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesAdded(Array.from(e.target.files));
                    }
                    e.target.value = '';
                  }}
                />

                {uploadedImages.length < MAX_IMAGES && (
                  <div
                    className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="dropzone-icon-circle">
                      <Upload size={22} />
                    </div>
                    <div className="dropzone-content">
                      <p className="dropzone-primary-text">
                        <span>Kéo & thả ảnh vào đây hoặc</span> <span className="dropzone-browse-text">chọn từ thiết bị</span>
                      </p>
                      <p className="dropzone-secondary-text">
                        Định dạng JPG, PNG, WEBP &bull; Tối đa 10MB/ảnh
                      </p>
                    </div>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="image-preview-grid">
                    {uploadedImages.map((img, idx) => (
                      <div key={img.id} className="image-preview-card">
                        <img src={img.previewUrl} alt={`Ảnh sự cố ${idx + 1}`} />
                        {img.isUploading && (
                          <div className="image-uploading-overlay">
                            <Loader2 size={20} className="spin-icon" />
                            <span>Đang tải...</span>
                          </div>
                        )}
                        {!img.isUploading && (
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(img.id);
                            }}
                            title="Xóa ảnh"
                            aria-label="Xóa ảnh"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
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
                onClick={handleClose}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="btn-submit-order"
                disabled={submitting || addresses.length === 0 || uploadedImages.some((img) => img.isUploading)}
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
