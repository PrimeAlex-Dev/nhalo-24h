import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Snowflake, 
  Wrench, 
  Key, 
  Sparkles, 
  Tv, 
  Hammer, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Layers, 
  Tag, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { CategoryEditModal } from '../components/CategoryEditModal';
import { categoryService } from '../../../services';
import type { 
  AdminCategoryItem, 
  SpringPageResponse, 
  CategoryStatusFilter 
} from '../types/admin';
import './AdminServicesPage.css';

const PALETTE_COLORS = [
  '#1d6ae5', 
  '#0284c7', 
  '#059669', 
  '#f59e0b', 
  '#dc2626', 
  '#7c3aed', 
  '#ea580c'
];

export function AdminServicesPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [pageInfo, setPageInfo] = useState<SpringPageResponse<AdminCategoryItem>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>('ALL');
  const [page, setPage] = useState(0);

  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load categories from backend API
  const loadCategories = useCallback(async (
    status: CategoryStatusFilter,
    search: string,
    pageNum: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories({
        status: status === 'ALL' ? undefined : status,
        search: search.trim() ? search.trim() : undefined,
        page: pageNum,
        size: 10,
        sort: 'displayOrder,asc',
      });
      setCategories(res.content || []);
      setPageInfo(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ backend');
      setCategories([]);
      setPageInfo({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories(statusFilter, searchQuery, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery, page, loadCategories]);

  // Reset page to 0 on new search or filter
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  const handleStatusFilterChange = (val: CategoryStatusFilter) => {
    setStatusFilter(val);
    setPage(0);
  };

  // KPI statistics derived directly from backend responses
  const totalCategoriesCount = pageInfo.totalElements;
  const activeCategoriesCount = categories.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCategoriesCount = categories.filter((c) => c.status === 'INACTIVE').length;
  const activeRate = categories.length > 0 
    ? Math.round((activeCategoriesCount / categories.length) * 100) 
    : 0;

  // Icon and theme color helpers
  const getCategoryThemeColor = (cat: AdminCategoryItem) => {
    const order = typeof cat.displayOrder === 'number' ? Math.abs(cat.displayOrder) : 0;
    return PALETTE_COLORS[order % PALETTE_COLORS.length];
  };

  const renderCategoryIcon = (iconUrl: string | null | undefined, colorTheme: string) => {
    if (iconUrl && (iconUrl.startsWith('http://') || iconUrl.startsWith('https://') || iconUrl.startsWith('/'))) {
      return <img src={iconUrl} alt="icon" className="cat-icon-img" />;
    }
    const props = { size: 24, style: { color: colorTheme } };
    switch (iconUrl) {
      case 'zap':
        return <Zap {...props} />;
      case 'snowflake':
        return <Snowflake {...props} />;
      case 'wrench':
        return <Wrench {...props} />;
      case 'key':
        return <Key {...props} />;
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'tv':
        return <Tv {...props} />;
      case 'hammer':
        return <Hammer {...props} />;
      default:
        return <Layers {...props} />;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Actions
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategoryItem) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (saved: AdminCategoryItem) => {
    showToast(`Đã lưu thành công danh mục "${saved.name}"!`);
    loadCategories(statusFilter, searchQuery, page);
  };

  const handleToggleCategoryStatus = async (cat: AdminCategoryItem) => {
    const newStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionLoadingId(cat.id);
    try {
      await categoryService.updateCategoryStatus(cat.id, { status: newStatus });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
      );
      showToast(
        newStatus === 'ACTIVE'
          ? `Đã kích hoạt lại danh mục "${cat.name}"!`
          : `Đã chuyển danh mục "${cat.name}" sang trạng thái Tạm ngưng!`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái danh mục');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCategory = async (cat: AdminCategoryItem) => {
    const confirmed = window.confirm(
      `Hệ thống backend quản lý danh mục theo chính sách bảo toàn: Thao tác này sẽ chuyển danh mục "${cat.name}" sang trạng thái "Tạm ngưng phục vụ" (INACTIVE). Bạn có muốn tiếp tục?`
    );
    if (!confirmed) return;

    setActionLoadingId(cat.id);
    try {
      await categoryService.updateCategoryStatus(cat.id, { status: 'INACTIVE' });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: 'INACTIVE' } : c))
      );
      showToast(`Đã chuyển danh mục "${cat.name}" sang trạng thái Tạm ngưng.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi xử lý danh mục');
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleExpand = (catId: string) => {
    setExpandedCatId((prev) => (prev === catId ? null : catId));
  };

  return (
    <div className="admin-services-page">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="admin-toast-banner">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="services-page-header">
        <div>
          <h2 className="services-page-title">
            04. Quản Lý Danh Mục & Dịch Vụ
          </h2>
          <p className="services-page-sub">
            Cấu hình danh mục ngành nghề, thứ tự hiển thị và trạng thái hoạt động kết nối trực tiếp với backend
          </p>
        </div>

        <button
          type="button"
          className="btn-add-category"
          onClick={handleOpenCreate}
        >
          <Plus size={16} /> Thêm Danh Mục Mới
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div className="services-stat-grid">
        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-blue">
            <Layers size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Tổng Danh Mục Hệ Thống</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{totalCategoriesCount}</strong>
              <span className="stat-card-unit">danh mục</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Đang Hoạt Động (ACTIVE)</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{activeCategoriesCount}</strong>
              <span className="stat-card-unit">sẵn sàng</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-amber">
            <Clock size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Tạm Ngưng (INACTIVE)</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{inactiveCategoriesCount}</strong>
              <span className="stat-card-unit">tạm ẩn</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-purple">
            <Tag size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Tỷ Lệ Sẵn Sàng (Trang này)</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">
                {activeRate}%
              </strong>
              <span className="stat-card-unit">hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="services-toolbar">
        <div className="services-search-box">
          <Search size={16} className="services-search-icon" />
          <input
            type="text"
            className="services-search-input"
            placeholder="Tìm theo tên danh mục hoặc slug..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="services-filter-box">
          <Filter size={14} className="services-filter-icon" />
          <select
            className="services-filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as CategoryStatusFilter)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang kích hoạt (ACTIVE)</option>
            <option value="INACTIVE">Tạm ngưng phục vụ (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="services-error-banner">
          <AlertCircle size={20} className="error-banner-icon" />
          <div className="error-banner-text">
            <strong>Không thể kết nối với dịch vụ backend</strong>
            <p className="error-banner-hint">{error}</p>
          </div>
          <button
            type="button"
            className="btn-retry-fetch"
            onClick={() => loadCategories(statusFilter, searchQuery, page)}
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {/* Categories Cards List */}
      <div className="categories-card-list">
        {loading ? (
          <div className="categories-loading-panel">
            <RefreshCw size={28} className="animate-spin text-primary mb-3" />
            <p className="font-semibold text-slate-700 m-0">Đang nạp danh mục dịch vụ từ backend...</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty-panel">
            <Layers size={40} className="text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Danh sách danh mục trống</p>
            <p className="text-xs text-slate-500">
              {searchQuery.trim() || statusFilter !== 'ALL'
                ? 'Không tìm thấy danh mục nào phù hợp với bộ lọc tìm kiếm.'
                : 'Chưa có danh mục nào trong cơ sở dữ liệu hệ thống.'}
            </p>
            <button
              type="button"
              className="btn-create-first-category"
              onClick={handleOpenCreate}
            >
              <Plus size={14} /> Thêm danh mục mới ngay
            </button>
          </div>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCatId === cat.id;
            const colorTheme = getCategoryThemeColor(cat);
            const isInactive = cat.status === 'INACTIVE';
            const isCurrentActionLoading = actionLoadingId === cat.id;

            return (
              <div 
                key={cat.id} 
                className={`category-item-card ${isInactive ? 'is-inactive' : ''}`}
              >
                {/* Header row */}
                <div className="cat-card-header">
                  <div className="cat-header-main">
                    <div 
                      className="cat-icon-container" 
                      style={{ backgroundColor: `${colorTheme}18` }}
                    >
                      {renderCategoryIcon(cat.iconUrl, colorTheme)}
                    </div>

                    <div className="cat-title-block">
                      <div className="cat-title-row">
                        <h3 className="cat-name">{cat.name}</h3>
                        <span className={`cat-status-badge ${!isInactive ? 'badge-active' : 'badge-inactive'}`}>
                          {cat.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                      </div>
                      <p className="cat-description">
                        {cat.description || 'Chưa có mô tả cho danh mục dịch vụ này.'}
                      </p>
                      <span className="cat-slug-text">/{cat.slug}</span>
                    </div>
                  </div>

                  {/* Metadata counters */}
                  <div className="cat-header-meta">
                    <div className="cat-meta-col">
                      <span className="meta-col-label">Thứ tự ưu tiên</span>
                      <strong className="meta-col-val">#{cat.displayOrder ?? 0}</strong>
                    </div>

                    <div className="cat-meta-col">
                      <span className="meta-col-label">Ngày khởi tạo</span>
                      <strong className="meta-col-val text-slate-600">
                        {formatDate(cat.createdAt)}
                      </strong>
                    </div>

                    <div className="cat-meta-col">
                      <span className="meta-col-label">Cập nhật gần nhất</span>
                      <strong className="meta-col-val text-slate-600">
                        {formatDate(cat.updatedAt)}
                      </strong>
                    </div>

                    {/* Actions */}
                    <div className="cat-header-actions">
                      <button
                        type="button"
                        className="btn-cat-action btn-cat-edit"
                        onClick={() => handleOpenEdit(cat)}
                        title="Chỉnh sửa thông tin danh mục"
                        disabled={isCurrentActionLoading}
                      >
                        <Edit size={14} /> Sửa
                      </button>

                      <button
                        type="button"
                        className={`btn-cat-action ${cat.status === 'ACTIVE' ? 'btn-cat-deactivate' : 'btn-cat-activate'}`}
                        onClick={() => handleToggleCategoryStatus(cat)}
                        disabled={isCurrentActionLoading}
                        title={cat.status === 'ACTIVE' ? 'Tạm ngưng cung cấp' : 'Kích hoạt lại'}
                      >
                        {isCurrentActionLoading ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : cat.status === 'ACTIVE' ? (
                          'Tạm ẩn'
                        ) : (
                          'Bật lại'
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-cat-action btn-cat-delete"
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={isCurrentActionLoading}
                        title="Chuyển sang trạng thái Tạm ngưng"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn-cat-toggle-expand"
                        onClick={() => toggleExpand(cat.id)}
                        title={isExpanded ? 'Thu gọn' : 'Xem thông số chi tiết'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-details panel when expanded */}
                {isExpanded && (
                  <div className="cat-subservices-panel">
                    <div className="subservices-panel-header">
                      <h4 className="subservices-panel-title">
                        Thông Số Kỹ Thuật & Cấu Hình Danh Mục "{cat.name}"
                      </h4>
                      <span className="text-xs text-slate-500">
                        ID: <code className="text-xs font-mono">{cat.id}</code>
                      </span>
                    </div>

                    <div className="cat-details-grid">
                      <div className="cat-detail-card">
                        <span className="cat-detail-label">Tên danh mục</span>
                        <strong>{cat.name}</strong>
                      </div>
                      <div className="cat-detail-card">
                        <span className="cat-detail-label">Đường dẫn tĩnh (Slug)</span>
                        <code className="text-primary font-mono font-semibold">/{cat.slug}</code>
                      </div>
                      <div className="cat-detail-card">
                        <span className="cat-detail-label">Thứ tự hiển thị (displayOrder)</span>
                        <strong>#{cat.displayOrder ?? 0}</strong>
                      </div>
                      <div className="cat-detail-card">
                        <span className="cat-detail-label">Trạng thái hiện tại</span>
                        <span className={`service-status-tag ${cat.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {cat.status === 'ACTIVE' ? 'Hoạt động (ACTIVE)' : 'Tạm ngưng (INACTIVE)'}
                        </span>
                      </div>
                      <div className="cat-detail-card col-span-full">
                        <span className="cat-detail-label">Biểu tượng (Icon URL / Preset)</span>
                        <span className="text-xs text-slate-600 break-all">
                          {cat.iconUrl || 'Mặc định (Layers)'}
                        </span>
                      </div>
                      <div className="cat-detail-card col-span-full">
                        <span className="cat-detail-label">Mô tả đầy đủ</span>
                        <span className="text-xs text-slate-600">
                          {cat.description || 'Chưa thiết lập mô tả cho danh mục này.'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {pageInfo.totalPages > 1 && (
        <div className="services-pagination-footer">
          <div className="pagination-info">
            Đang hiển thị <strong>{categories.length}</strong> trên tổng số <strong>{pageInfo.totalElements}</strong> danh mục
            {pageInfo.totalPages > 1 && ` (Trang ${page + 1} / ${pageInfo.totalPages})`}
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page-nav"
              disabled={page <= 0 || loading}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={16} /> Trang trước
            </button>
            <span className="page-indicator">
              {page + 1}
            </span>
            <button
              type="button"
              className="btn-page-nav"
              disabled={page >= pageInfo.totalPages - 1 || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryEditModal
        category={editingCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
