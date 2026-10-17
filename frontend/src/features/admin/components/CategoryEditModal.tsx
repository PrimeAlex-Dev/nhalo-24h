import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Snowflake, 
  Wrench, 
  Key, 
  Sparkles, 
  Tv, 
  Hammer, 
  Layers, 
  Link as LinkIcon 
} from 'lucide-react';
import { categoryService } from '../../../services';
import type { AdminCategoryItem, CategoryStatus } from '../types/admin';
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

const PRESET_ICONS = [
  { id: 'zap', label: 'Tia sét (Điện)', Icon: Zap },
  { id: 'snowflake', label: 'Bông tuyết (Điện lạnh)', Icon: Snowflake },
  { id: 'wrench', label: 'Cờ lê (Điện nước)', Icon: Wrench },
  { id: 'key', label: 'Chìa khóa (Sửa khóa)', Icon: Key },
  { id: 'sparkles', label: 'Lấp lánh (Vệ sinh)', Icon: Sparkles },
  { id: 'tv', label: 'Gia dụng (Điện tử)', Icon: Tv },
  { id: 'hammer', label: 'Búa (Cơ khí & Xây dựng)', Icon: Hammer },
  { id: 'layers', label: 'Mặc định (Ngành nghề)', Icon: Layers },
];

function CategoryFormContent({ category, onClose, onSave }: CategoryFormContentProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [displayOrder, setDisplayOrder] = useState<number>(category?.displayOrder ?? 0);
  const [status, setStatus] = useState<CategoryStatus>(category?.status ?? 'ACTIVE');

  // Icon handling: check if category.iconUrl matches one of PRESET_ICONS or is a custom URL
  const initialIcon = category?.iconUrl ?? 'wrench';
  const isInitialPreset = PRESET_ICONS.some((p) => p.id === initialIcon);
  const [iconChoice, setIconChoice] = useState<string>(isInitialPreset ? initialIcon : 'custom');
  const [customIconUrl, setCustomIconUrl] = useState<string>(isInitialPreset ? '' : (category?.iconUrl ?? ''));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to auto-generate slug from name in create mode
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalSlug = slug.trim() ? slug.trim() : undefined;
      const finalIconUrl = iconChoice === 'custom' 
        ? (customIconUrl.trim() || undefined) 
        : iconChoice;
      const finalDescription = description.trim() ? description.trim() : undefined;
      const order = Number(displayOrder);
      const finalDisplayOrder = Number.isInteger(order) && order >= 0 ? order : 0;

      if (category) {
        // Edit mode
        const updated = await categoryService.updateCategory(category.id, {
          name: name.trim(),
          slug: finalSlug,
          description: finalDescription,
          iconUrl: finalIconUrl,
          displayOrder: finalDisplayOrder,
        });

        let finalResult = updated;
        if (status !== category.status) {
          finalResult = await categoryService.updateCategoryStatus(category.id, { status });
        }

        onSave(finalResult);
        onClose();
      } else {
        // Create mode
        const created = await categoryService.createCategory({
          name: name.trim(),
          slug: finalSlug,
          description: finalDescription,
          iconUrl: finalIconUrl,
          displayOrder: finalDisplayOrder,
          status,
        });

        onSave(created);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
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
            Cấu hình thông tin danh mục dịch vụ trực tiếp với cơ sở dữ liệu hệ thống
          </p>
        </div>
        <button 
          type="button" 
          className="cat-modal-close" 
          onClick={onClose}
          aria-label="Đóng"
          disabled={submitting}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cat-modal-form">
        <div className="cat-modal-body">
          {/* Error Notice */}
          {error && (
            <div className="cat-modal-error-banner">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              maxLength={100}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              disabled={submitting}
            />
            <span className="cat-field-hint">Tối đa 100 ký tự</span>
          </div>

          <div className="cat-grid-2">
            <div className="cat-form-group">
              <label htmlFor="cat-slug-input" className="cat-label">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                id="cat-slug-input"
                type="text"
                className="cat-input"
                placeholder="sua-chua-dien-chieu-sang"
                value={slug}
                maxLength={120}
                onChange={(e) => setSlug(e.target.value)}
                disabled={submitting}
              />
              <span className="cat-field-hint">
                Để trống hệ thống sẽ tự động tạo slug từ tên danh mục
              </span>
            </div>

            <div className="cat-form-group">
              <label htmlFor="cat-order-input" className="cat-label">
                Thứ tự hiển thị ưu tiên
              </label>
              <input
                id="cat-order-input"
                type="number"
                min={0}
                className="cat-input"
                placeholder="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                disabled={submitting}
              />
              <span className="cat-field-hint">Số nhỏ hơn sẽ hiển thị trước (0, 1, 2...)</span>
            </div>
          </div>

          <div className="cat-form-group">
            <label htmlFor="cat-status-select" className="cat-label">
              Trạng thái hoạt động
            </label>
            <select
              id="cat-status-select"
              className="cat-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as CategoryStatus)}
              disabled={submitting}
            >
              <option value="ACTIVE">ACTIVE - Đang hoạt động (Hiển thị cho khách & thợ)</option>
              <option value="INACTIVE">INACTIVE - Tạm ngưng phục vụ (Tạm ẩn)</option>
            </select>
          </div>

          {/* Icon Selection */}
          <div className="cat-form-group">
            <label className="cat-label">
              Biểu tượng đại diện (Icon)
            </label>
            <div className="cat-icon-choice-grid">
              {PRESET_ICONS.map((preset) => {
                const { Icon } = preset;
                const isSelected = iconChoice === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`cat-icon-choice-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setIconChoice(preset.id)}
                    disabled={submitting}
                    title={preset.label}
                  >
                    <Icon size={20} />
                    <span className="choice-label">{preset.id}</span>
                  </button>
                );
              })}
              <button
                type="button"
                className={`cat-icon-choice-btn ${iconChoice === 'custom' ? 'is-selected' : ''}`}
                onClick={() => setIconChoice('custom')}
                disabled={submitting}
                title="Sử dụng URL biểu tượng tùy chỉnh"
              >
                <LinkIcon size={20} />
                <span className="choice-label">URL icon</span>
              </button>
            </div>

            {iconChoice === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  className="cat-input"
                  placeholder="https://example.com/icons/electrical.png"
                  value={customIconUrl}
                  maxLength={500}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  disabled={submitting}
                />
                <span className="cat-field-hint">Nhập URL hình ảnh icon đại diện (tối đa 500 ký tự)</span>
              </div>
            )}
          </div>

          <div className="cat-form-group">
            <label htmlFor="cat-desc-input" className="cat-label">
              Mô tả chi tiết danh mục
            </label>
            <textarea
              id="cat-desc-input"
              className="cat-textarea"
              rows={3}
              maxLength={500}
              placeholder="Mô tả phạm vi các dịch vụ, bảo trì hoặc sửa chữa thuộc danh mục này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
            <span className="cat-field-hint">{description.length}/500 ký tự</span>
          </div>
        </div>

        <div className="cat-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn-modal-save"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Lưu danh mục
              </>
            )}
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
