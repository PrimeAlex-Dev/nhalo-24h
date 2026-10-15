import { useState, useMemo } from 'react';
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
  Users, 
  Tag
} from 'lucide-react';
import { CategoryEditModal } from '../components/CategoryEditModal';
import { ADMIN_MOCK_CATEGORIES } from '../data/adminMockData';
import type { AdminCategoryItem } from '../types/admin';
import './AdminServicesPage.css';

export function AdminServicesPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>(ADMIN_MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedCatId, setExpandedCatId] = useState<string | null>('cat-electrical');
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statistics
  const totalCategories = categories.length;
  const totalServices = categories.reduce((acc, cat) => acc + cat.services.length, 0);
  const totalProviders = categories.reduce((acc, cat) => acc + cat.activeProviders, 0);
  const activeCategoriesCount = categories.filter((c) => c.isActive).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCategoryIcon = (iconName: AdminCategoryItem['iconName'], colorTheme: string) => {
    const props = { size: 24, style: { color: colorTheme } };
    switch (iconName) {
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
        return <Wrench {...props} />;
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (statusFilter === 'active' && !cat.isActive) return false;
      if (statusFilter === 'inactive' && cat.isActive) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = cat.name.toLowerCase().includes(query);
        const matchDesc = cat.description.toLowerCase().includes(query);
        const matchSlug = cat.slug.toLowerCase().includes(query);
        const matchService = cat.services.some((s) => s.name.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchSlug && !matchService) {
          return false;
        }
      }

      return true;
    });
  }, [categories, statusFilter, searchQuery]);

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
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev];
    });
    showToast(`Đã lưu danh mục "${saved.name}" thành công!`);
  };

  const handleToggleCategoryActive = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, isActive: !c.isActive } : c
      )
    );
    showToast('Đã cập nhật trạng thái hiển thị của danh mục!');
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" cùng toàn bộ dịch vụ liên quan?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast(`Đã xóa danh mục "${name}".`);
    }
  };

  const handleToggleSubServiceActive = (catId: string, serviceId: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          services: c.services.map((s) =>
            s.id === serviceId ? { ...s, isActive: !s.isActive } : s
          ),
        };
      })
    );
    showToast('Đã cập nhật trạng thái dịch vụ con!');
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
            Cấu hình bảng giá dịch vụ tiêu chuẩn, định hình ngành nghề và mạng lưới thợ phụ trách
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
            <span className="stat-card-label">Tổng Danh Mục Ngành Nghề</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{totalCategories}</strong>
              <span className="stat-card-unit">ngành chính</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-emerald">
            <Tag size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Dịch Vụ Chuẩn Hóa</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{totalServices}</strong>
              <span className="stat-card-unit">gói dịch vụ</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-amber">
            <Users size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Đội Ngũ Thợ Phụ Trách</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">{totalProviders}</strong>
              <span className="stat-card-unit">lượt thợ chuyên ngành</span>
            </div>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-card-icon-wrap icon-purple">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Trạng Thái Sẵn Sàng</span>
            <div className="stat-card-val-row">
              <strong className="stat-card-number">
                {Math.round((activeCategoriesCount / totalCategories) * 100)}%
              </strong>
              <span className="stat-card-unit">đang phục vụ</span>
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
            placeholder="Tìm theo tên danh mục, dịch vụ, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="services-filter-box">
          <Filter size={14} className="services-filter-icon" />
          <select
            className="services-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Tạm ngưng phục vụ</option>
          </select>
        </div>
      </div>

      {/* Categories Cards List */}
      <div className="categories-card-list">
        {filteredCategories.length === 0 ? (
          <div className="categories-empty-panel">
            <Layers size={40} className="text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Không tìm thấy danh mục nào phù hợp</p>
            <p className="text-xs text-slate-500">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isExpanded = expandedCatId === cat.id;

            return (
              <div 
                key={cat.id} 
                className={`category-item-card ${!cat.isActive ? 'is-inactive' : ''}`}
              >
                {/* Header row */}
                <div className="cat-card-header">
                  <div className="cat-header-main">
                    <div 
                      className="cat-icon-container" 
                      style={{ backgroundColor: `${cat.colorTheme}18` }}
                    >
                      {getCategoryIcon(cat.iconName, cat.colorTheme)}
                    </div>

                    <div className="cat-title-block">
                      <div className="cat-title-row">
                        <h3 className="cat-name">{cat.name}</h3>
                        <span className={`cat-status-badge ${cat.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {cat.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                      </div>
                      <p className="cat-description">{cat.description}</p>
                      <span className="cat-slug-text">/{cat.slug}</span>
                    </div>
                  </div>

                  {/* Metadata counters */}
                  <div className="cat-header-meta">
                    <div className="cat-meta-col">
                      <span className="meta-col-label">Dịch vụ trực thuộc</span>
                      <strong className="meta-col-val">{cat.services.length} dịch vụ</strong>
                    </div>

                    <div className="cat-meta-col">
                      <span className="meta-col-label">Thợ chuyên môn</span>
                      <strong className="meta-col-val">{cat.activeProviders} đối tác</strong>
                    </div>

                    <div className="cat-meta-col">
                      <span className="meta-col-label">Giá sàn tham khảo</span>
                      <strong className="meta-col-val text-emerald-600">
                        từ {cat.minPrice.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    {/* Actions */}
                    <div className="cat-header-actions">
                      <button
                        type="button"
                        className="btn-cat-action btn-cat-edit"
                        onClick={() => handleOpenEdit(cat)}
                        title="Chỉnh sửa danh mục & bảng giá"
                      >
                        <Edit size={14} /> Sửa
                      </button>

                      <button
                        type="button"
                        className={`btn-cat-action ${cat.isActive ? 'btn-cat-deactivate' : 'btn-cat-activate'}`}
                        onClick={() => handleToggleCategoryActive(cat.id)}
                        title={cat.isActive ? 'Tạm ngưng cung cấp' : 'Kích hoạt lại'}
                      >
                        {cat.isActive ? 'Tạm ẩn' : 'Bật lại'}
                      </button>

                      <button
                        type="button"
                        className="btn-cat-action btn-cat-delete"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        title="Xóa danh mục"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn-cat-toggle-expand"
                        onClick={() => toggleExpand(cat.id)}
                        title={isExpanded ? 'Thu gọn' : 'Xem các gói dịch vụ con'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-services breakdown when expanded */}
                {isExpanded && (
                  <div className="cat-subservices-panel">
                    <div className="subservices-panel-header">
                      <h4 className="subservices-panel-title">
                        Các Gói Dịch Vụ Thuộc Danh Mục "{cat.name}"
                      </h4>
                      <button
                        type="button"
                        className="btn-subservice-add"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Plus size={13} /> Thêm gói dịch vụ
                      </button>
                    </div>

                    <div className="subservices-table-wrap">
                      <table className="subservices-table">
                        <thead>
                          <tr>
                            <th>Tên Dịch Vụ Chuẩn</th>
                            <th>Đơn Vị Tính</th>
                            <th>Thời Gian Ước Tính</th>
                            <th>Giá Sàn Tiêu Chuẩn</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.services.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-6 text-slate-400">
                                Chưa có dịch vụ con nào được định cấu hình.
                              </td>
                            </tr>
                          ) : (
                            cat.services.map((srv) => (
                              <tr key={srv.id}>
                                <td>
                                  <span className="font-semibold text-slate-800">
                                    {srv.name}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                    {srv.unit}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-slate-600 text-xs">
                                    {srv.duration}
                                  </span>
                                </td>
                                <td>
                                  <span className="font-bold text-emerald-600">
                                    {srv.basePrice.toLocaleString('vi-VN')} đ
                                  </span>
                                </td>
                                <td>
                                  <span className={`service-status-tag ${srv.isActive ? 'active' : 'inactive'}`}>
                                    {srv.isActive ? 'Sẵn sàng' : 'Tạm ngưng'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-toggle-service-status"
                                    onClick={() => handleToggleSubServiceActive(cat.id, srv.id)}
                                  >
                                    {srv.isActive ? 'Tạm ẩn' : 'Kích hoạt'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
