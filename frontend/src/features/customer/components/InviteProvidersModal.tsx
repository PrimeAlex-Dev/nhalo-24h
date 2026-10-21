import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  UserCheck, 
  Star, 
  Clock, 
  MapPin, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Tag,
  Eye
} from 'lucide-react';
import { providerProfileService, customerOrderService } from '../../../services';
import type { PublicProviderItem } from '../../../services/providerProfileService';
import { ProviderQuickViewDrawer } from './ProviderQuickViewDrawer';
import './InviteProvidersModal.css';

interface InviteProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTitle: string;
  categoryId?: string;
  categoryName?: string;
  existingProviderIds?: string[];
  onSuccess: () => void;
}

export function InviteProvidersModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  categoryId,
  categoryName,
  existingProviderIds = [],
  onSuccess,
}: InviteProvidersModalProps) {
  const [providers, setProviders] = useState<PublicProviderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewProvider, setPreviewProvider] = useState<PublicProviderItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProviders();
      setSearchQuery('');
      setSelectedIds([]);
      setPreviewProvider(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, categoryId, categoryName]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      // Query providers matching category of the order
      const categoryParam = categoryId || categoryName;
      const data = await providerProfileService.getPublicProviders(
        categoryParam ? { category: categoryParam } : {}
      );
      setProviders(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải danh sách thợ đối tác.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // 1. Strict category check: Provider must belong to the order's category
      if (categoryId || categoryName) {
        const matchesCategory =
          // Match by categoryId in provider's categories list
          (categoryId &&
            p.categories &&
            p.categories.some(
              (c) => c.id.toLowerCase() === categoryId.toLowerCase()
            )) ||
          // Match by categoryName in provider's categories list or primary category
          (categoryName &&
            ((p.categories &&
              p.categories.some(
                (c) =>
                  c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
                  categoryName.toLowerCase().includes(c.name.toLowerCase())
              )) ||
              (p.category &&
                (p.category.toLowerCase().includes(categoryName.toLowerCase()) ||
                  categoryName.toLowerCase().includes(p.category.toLowerCase())))));

        if (!matchesCategory) {
          return false;
        }
      }

      // 2. Search query check
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.headline && p.headline.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [providers, searchQuery, categoryId, categoryName]);

  const toggleSelect = (providerId: string) => {
    if (existingProviderIds.includes(providerId)) return;
    setSelectedIds((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]
    );
  };

  const handleSendRequests = async () => {
    if (selectedIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 thợ để gửi yêu cầu.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await customerOrderService.dispatchRequests(orderId, {
        providerIds: selectedIds,
      });

      setSuccessMsg(`Đã gửi yêu cầu tới ${selectedIds.length} thợ thành công!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi yêu cầu tới thợ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="invite-modal-backdrop" onClick={onClose}>
      <div 
        className="invite-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="invite-modal-header">
          <div>
            <span className="invite-modal-subtitle">Gửi đơn hàng tới thợ chuyên môn</span>
            <h2 className="invite-modal-title">Mời thêm thợ báo giá</h2>
            <div className="invite-order-meta-row">
              <p className="invite-order-name">Đơn: <strong>{orderTitle}</strong></p>
              {categoryName && (
                <span className="invite-order-category-tag">
                  <Tag size={12} />
                  Chuyên môn: <strong>{categoryName}</strong>
                </span>
              )}
            </div>
          </div>
          <button 
            type="button" 
            className="invite-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="invite-alert-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="invite-alert-success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="invite-search-box">
          <Search size={18} className="invite-search-icon" />
          <input
            type="text"
            className="invite-search-input"
            placeholder={categoryName ? `Tìm thợ ${categoryName} theo tên...` : 'Tìm theo tên thợ, chuyên ngành...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Provider List */}
        <div className="invite-list-body">
          {loading ? (
            <div className="invite-loading-box">
              <Loader2 size={32} className="spin-icon text-blue" />
              <p>Đang tìm danh sách thợ chuyên môn khả thi...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="invite-empty-box">
              <p>
                {categoryName
                  ? `Hiện chưa có thợ nào thuộc chuyên môn "${categoryName}" khả dụng${
                      searchQuery.trim() ? ' khớp với tìm kiếm' : ''
                    }.`
                  : 'Không tìm thấy thợ phù hợp.'}
              </p>
              <span className="invite-empty-subtext">
                Hệ thống chỉ hiển thị đúng thợ có chuyên môn tương ứng để đảm bảo chất lượng dịch vụ.
              </span>
            </div>
          ) : (
            <div className="invite-provider-grid">
              {filteredProviders.map((provider) => {
                const isAlreadyInvited = existingProviderIds.includes(provider.id);
                const isSelected = selectedIds.includes(provider.id);

                return (
                  <div
                    key={provider.id}
                    className={`invite-provider-card ${isSelected ? 'selected' : ''} ${
                      isAlreadyInvited ? 'already-invited' : ''
                    }`}
                    onClick={() => toggleSelect(provider.id)}
                  >
                    <div className="invite-card-left">
                      <input
                        type="checkbox"
                        checked={isSelected || isAlreadyInvited}
                        disabled={isAlreadyInvited}
                        onChange={() => toggleSelect(provider.id)}
                        className="invite-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="invite-avatar-wrap">
                        {provider.avatar ? (
                          <img
                            src={provider.avatar}
                            alt={provider.name}
                            className="invite-avatar"
                          />
                        ) : (
                          <div className="invite-avatar-fallback">
                            {provider.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="invite-info">
                        <div className="invite-name-row">
                          <span 
                            className="invite-provider-name clickable"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewProvider(provider);
                            }}
                            title="Bấm để xem chi tiết hồ sơ & đánh giá"
                          >
                            {provider.name}
                          </span>
                          {isAlreadyInvited && (
                            <span className="badge-already-invited">
                              <UserCheck size={12} /> Đã gửi yêu cầu
                            </span>
                          )}
                        </div>
                        <p className="invite-headline">
                          {provider.headline || provider.category}
                        </p>
                        <div className="invite-meta-chips">
                          <span className="meta-chip meta-chip-category">
                            {provider.category}
                          </span>
                          <span className="meta-chip">
                            <Star size={12} className="star-icon" />
                            {provider.rating.toFixed(1)} ({provider.reviewsCount})
                          </span>
                          <span className="meta-chip">
                            <MapPin size={12} />
                            {provider.distance || 'Gần bạn'}
                          </span>
                          <span className="meta-chip">
                            <Clock size={12} />
                            {provider.responseTime || '~15p'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="invite-card-right">
                      <span className="invite-rate">
                        {provider.pricePerHour > 1000
                          ? `${provider.pricePerHour.toLocaleString('vi-VN')} đ`
                          : `${provider.pricePerHour} đ`}
                        <small>/giờ</small>
                      </span>

                      <button
                        type="button"
                        className="btn-view-quick-profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewProvider(provider);
                        }}
                        title="Xem chi tiết hồ sơ & nhận xét khách hàng"
                      >
                        <Eye size={13} />
                        <span>Xem hồ sơ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="invite-modal-footer">
          <div className="invite-footer-left">
            <span>
              Đã chọn: <strong>{selectedIds.length}</strong> thợ
            </span>
          </div>
          <div className="invite-footer-right">
            <button
              type="button"
              className="btn-cancel-invite"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn-submit-invite"
              onClick={handleSendRequests}
              disabled={submitting || selectedIds.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Gửi yêu cầu ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Drawer for Provider Profile & Reviews */}
      <ProviderQuickViewDrawer
        isOpen={!!previewProvider}
        onClose={() => setPreviewProvider(null)}
        provider={previewProvider}
        isSelected={previewProvider ? selectedIds.includes(previewProvider.id) : false}
        isAlreadyInvited={previewProvider ? existingProviderIds.includes(previewProvider.id) : false}
        onToggleSelect={(id) => toggleSelect(id)}
      />
    </div>
  );
}
