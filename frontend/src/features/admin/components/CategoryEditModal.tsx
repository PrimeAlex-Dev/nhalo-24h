import { useState } from 'react';
import { X, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import type { AdminCategoryItem, AdminServiceItem } from '../types/admin';
import './CategoryEditModal.css';

interface CategoryEditModalProps {
  category: AdminCategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedCategory: AdminCategoryItem) => void;
}

interface CategoryFormContentProps {
  category: AdminCategoryItem | null;
  onClose: () => void;
  onSave: (savedCategory: AdminCategoryItem) => void;
}

function CategoryFormContent({ category, onClose, onSave }: CategoryFormContentProps) {
  const [name, setName] = useState(category ? category.name : '');
  const [slug, setSlug] = useState(category ? category.slug : '');
  const [description, setDescription] = useState(category ? category.description : '');
  const [iconName, setIconName] = useState<AdminCategoryItem['iconName']>(
    category ? category.iconName : 'wrench'
  );
  const [colorTheme, setColorTheme] = useState(category ? category.colorTheme : '#1d6ae5');
  const [isActive, setIsActive] = useState(category ? category.isActive : true);
  const [services, setServices] = useState<AdminServiceItem[]>(category ? category.services : []);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('200000');
  const [newServiceUnit, setNewServiceUnit] = useState('lần');
  const [newServiceDuration, setNewServiceDuration] = useState('45 phút');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const price = parseInt(newServicePrice.replace(/\D/g, ''), 10) || 100000;
    const newService: AdminServiceItem = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      basePrice: price,
      unit: newServiceUnit,
      duration: newServiceDuration,
      isActive: true,
    };
    setServices((prev) => [...prev, newService]);
    setNewServiceName('');
    setNewServicePrice('200000');
  };

  const handleRemoveService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const minPrice = services.length > 0 
      ? Math.min(...services.map((s) => s.basePrice))
      : 150000;

    const updatedCat: AdminCategoryItem = {
      id: category ? category.id : `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || 'danh-muc-moi',
      description: description.trim(),
      iconName,
      colorTheme,
      activeProviders: category ? category.activeProviders : 12,
      minPrice,
      isActive,
      services,
      updatedAt: 'Hôm nay',
    };

    onSave(updatedCat);
    onClose();
  };

  return (
    <div 
      className="cat-modal-dialog" 
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-modal-title"
    >
      <div className="cat-modal-header">
        <div className="cat-modal-title-wrap">
          <h2 id="cat-modal-title" className="cat-modal-title">
            {category ? 'Chỉnh Sửa Danh Mục Dịch Vụ' : 'Thêm Mới Danh Mục Dịch Vụ'}
          </h2>
          <p className="cat-modal-subtitle">
            Cấu hình thông tin danh mục và danh sách dịch vụ chi tiết cho nền tảng
          </p>
        </div>
        <button 
          type="button" 
          className="cat-modal-close" 
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cat-modal-form">
        <div className="cat-modal-body">
          {/* General Info */}
          <div className="cat-form-group">
            <label htmlFor="cat-name-input" className="cat-label">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name-input"
              type="text"
              className="cat-input"
              placeholder="VD: Sửa Chữa Điện & Chiếu Sáng"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="cat-grid-2">
            <div className="cat-form-group">
              <label htmlFor="cat-slug-input" className="cat-label">
                Đường dẫn thân thiện (Slug)
              </label>
              <input
                id="cat-slug-input"
                type="text"
                className="cat-input"
                placeholder="sua-chua-dien-chieu-sang"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="cat-form-group">
              <label htmlFor="cat-status-select" className="cat-label">
                Trạng thái hiển thị
              </label>
              <select
                id="cat-status-select"
                className="cat-select"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <option value="active">Đang kích hoạt (Hiển thị cho khách & thợ)</option>
                <option value="inactive">Tạm ẩn (Bảo trì / Ngưng cung cấp)</option>
              </select>
            </div>
          </div>

          <div className="cat-grid-2">
            <div className="cat-form-group">
              <label htmlFor="cat-icon-select" className="cat-label">
                Biểu tượng (Icon đại diện)
              </label>
              <select
                id="cat-icon-select"
                className="cat-select"
                value={iconName}
                onChange={(e) => setIconName(e.target.value as AdminCategoryItem['iconName'])}
              >
                <option value="zap">Tia sét (Điện & Chiếu sáng)</option>
                <option value="snowflake">Bông tuyết (Điện lạnh & Điều hòa)</option>
                <option value="wrench">Cờ lê (Cấp thoát nước & Đường ống)</option>
                <option value="key">Chìa khóa (Sửa khóa & Cửa cuốn)</option>
                <option value="sparkles">Lấp lánh (Tổng vệ sinh & Giúp việc)</option>
                <option value="tv">Màn hình (Điện tử & Gia dụng)</option>
                <option value="hammer">Búa thợ (Cơ khí & Xây dựng)</option>
              </select>
            </div>

            <div className="cat-form-group">
              <label className="cat-label">
                Màu sắc chủ đạo
              </label>
              <div className="cat-color-picker-row">
                {[
                  { color: '#1d6ae5', label: 'Xanh dương' },
                  { color: '#0284c7', label: 'Xanh ngọc' },
                  { color: '#059669', label: 'Xanh lá' },
                  { color: '#f59e0b', label: 'Vàng cam' },
                  { color: '#dc2626', label: 'Đỏ' },
                  { color: '#7c3aed', label: 'Tím' },
                  { color: '#ea580c', label: 'Cam đậm' },
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    className={`cat-color-dot ${colorTheme === item.color ? 'is-selected' : ''}`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => setColorTheme(item.color)}
                    title={item.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cat-form-group">
            <label htmlFor="cat-desc-input" className="cat-label">
              Mô tả chi tiết danh mục
            </label>
            <textarea
              id="cat-desc-input"
              className="cat-textarea"
              rows={2}
              placeholder="Mô tả các hạng mục công việc được phục vụ trong danh mục này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Sub Services Management inside Category */}
          <div className="cat-services-section">
            <div className="cat-services-header">
              <h3 className="cat-services-title">
                Bảng Dịch Vụ Con Chuẩn Hóa ({services.length})
              </h3>
              <span className="cat-services-tip">
                Dịch vụ định hình giá sàn và tiêu chuẩn cho thợ & khách
              </span>
            </div>

            {/* Add service mini-form */}
            <div className="cat-add-service-box">
              <input
                type="text"
                className="service-input-name"
                placeholder="Tên dịch vụ con (VD: Vệ sinh máy lạnh 1.5 HP)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
              <input
                type="number"
                className="service-input-price"
                placeholder="Giá chuẩn (VNĐ)"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
              />
              <input
                type="text"
                className="service-input-unit"
                placeholder="Đơn vị (máy, lần...)"
                value={newServiceUnit}
                onChange={(e) => setNewServiceUnit(e.target.value)}
              />
              <input
                type="text"
                className="service-input-duration"
                placeholder="Thời lượng (45 phút)"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
              />
              <button
                type="button"
                className="btn-add-service-inline"
                onClick={handleAddService}
              >
                <Plus size={16} /> Thêm
              </button>
            </div>

            {/* Service list table */}
            <div className="cat-services-list">
              {services.length === 0 ? (
                <p className="cat-services-empty">
                  Chưa có dịch vụ nào trong danh mục này. Hãy thêm dịch vụ ở trên.
                </p>
              ) : (
                services.map((srv, idx) => (
                  <div key={srv.id || idx} className="cat-service-row">
                    <div className="service-row-name">
                      <strong>{srv.name}</strong>
                      <span className="service-row-meta">
                        {srv.duration} • Tính theo: {srv.unit}
                      </span>
                    </div>
                    <div className="service-row-price">
                      {srv.basePrice.toLocaleString('vi-VN')} đ
                    </div>
                    <button
                      type="button"
                      className="btn-remove-service"
                      onClick={() => handleRemoveService(srv.id)}
                      title="Xóa dịch vụ này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="cat-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn-modal-save"
          >
            <CheckCircle2 size={16} /> Lưu danh mục
          </button>
        </div>
      </form>
    </div>
  );
}

export function CategoryEditModal({
  category,
  isOpen,
  onClose,
  onSave,
}: CategoryEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="cat-modal-backdrop" onClick={onClose}>
      <CategoryFormContent
        key={category ? category.id : 'new-category'}
        category={category}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
