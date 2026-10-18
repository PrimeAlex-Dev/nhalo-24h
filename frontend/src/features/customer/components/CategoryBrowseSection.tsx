import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Snowflake, 
  Zap, 
  Wrench, 
  Sparkles, 
  Key, 
  Hammer, 
  PaintRoller, 
  Bug,
  Tv,
  Layers,
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { categoryService } from '../../../services';
import type { AdminCategoryItem } from '../../admin/types/admin';
import { PATHS } from '../../../routes/paths';
import './CategoryBrowseSection.css';

/**
 * Hiển thị icon danh mục dựa theo iconUrl cấu hình trong database:
 * - Hỗ trợ các preset icon: snowflake, zap, wrench, sparkles, key, hammer, paint-roller, bug, tv, layers
 * - Hỗ trợ URL hình ảnh tuỳ biến (bắt đầu bằng http, https, data:, /)
 * - Mặc định hiển thị icon Wrench hoặc Layers
 */
const renderCategoryIcon = (iconUrl?: string | null) => {
  if (!iconUrl) {
    return <Layers size={22} strokeWidth={2.2} />;
  }

  const trimmed = iconUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('/')
  ) {
    return (
      <img 
        src={trimmed} 
        alt="Category icon" 
        className="category-custom-icon" 
      />
    );
  }

  const normalized = trimmed.toLowerCase();
  switch (normalized) {
    case 'snowflake':
      return <Snowflake size={22} strokeWidth={2.2} />;
    case 'zap':
      return <Zap size={22} strokeWidth={2.2} />;
    case 'wrench':
      return <Wrench size={22} strokeWidth={2.2} />;
    case 'sparkles':
      return <Sparkles size={22} strokeWidth={2.2} />;
    case 'key':
      return <Key size={22} strokeWidth={2.2} />;
    case 'hammer':
      return <Hammer size={22} strokeWidth={2.2} />;
    case 'paint-roller':
    case 'paintroller':
      return <PaintRoller size={22} strokeWidth={2.2} />;
    case 'bug':
      return <Bug size={22} strokeWidth={2.2} />;
    case 'tv':
      return <Tv size={22} strokeWidth={2.2} />;
    case 'layers':
      return <Layers size={22} strokeWidth={2.2} />;
    default:
      return <Wrench size={22} strokeWidth={2.2} />;
  }
};

export function CategoryBrowseSection() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadInitialCategories() {
      try {
        const response = await categoryService.getCategories({
          status: 'ACTIVE',
          sort: 'displayOrder,asc',
          size: 50,
        });
        if (!ignore) {
          setCategories(response.content || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Không thể tải danh sách danh mục dịch vụ từ cơ sở dữ liệu.';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories({
        status: 'ACTIVE',
        sort: 'displayOrder,asc',
        size: 50,
      });
      setCategories(response.content || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách danh mục dịch vụ từ cơ sở dữ liệu.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="category-browse-section">
      <div className="container">
        {/* Section Header */}
        <div className="category-header">
          <div className="category-header-left">
            <h2 className="category-main-title">Browse by category</h2>
            <p className="category-sub-title">
              Pick a service or just describe your problem — AI handles the rest.
            </p>
          </div>
          <div className="category-header-right">
            <Link 
              to={PATHS.CUSTOMER.PROVIDERS} 
              className="view-all-providers-link"
            >
              <span>View all providers</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Categories Grid or States */}
        {loading ? (
          <div className="category-grid" aria-label="Đang tải danh mục dịch vụ...">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="category-card category-skeleton-card">
                <div className="category-skeleton-icon" />
                <div className="category-skeleton-info">
                  <div className="category-skeleton-line category-skeleton-title" />
                  <div className="category-skeleton-line category-skeleton-desc" />
                  <div className="category-skeleton-line category-skeleton-desc-short" />
                </div>
                <div className="category-skeleton-footer">
                  <div className="category-skeleton-badge" />
                  <div className="category-skeleton-action" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="category-state-container category-error-container">
            <AlertCircle size={32} className="category-state-icon category-error-icon" />
            <h3 className="category-state-title">Đã xảy ra lỗi khi tải danh mục</h3>
            <p className="category-state-desc">{error}</p>
            <button 
              type="button" 
              onClick={handleRetry} 
              className="category-retry-btn"
            >
              <RefreshCw size={15} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="category-state-container category-empty-container">
            <FolderOpen size={32} className="category-state-icon category-empty-icon" />
            <h3 className="category-state-title">Chưa có danh mục dịch vụ nào</h3>
            <p className="category-state-desc">
              Các danh mục dịch vụ hiện đang được quản trị viên cập nhật. Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`${PATHS.CUSTOMER.PROVIDERS}?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <div className="category-icon-wrapper">
                  {renderCategoryIcon(category.iconUrl)}
                </div>

                <div className="category-info">
                  <h3 className="category-card-title">{category.name}</h3>
                  <p className="category-card-desc">
                    {category.description || 'Dịch vụ uy tín, thợ tận tâm và bảo hành chu đáo'}
                  </p>
                </div>

                <div className="category-card-footer">
                  <span className="category-service-badge">Dịch vụ xác thực</span>
                  <span className="category-view-link">
                    <span>Xem thợ</span>
                    <ArrowRight size={13} className="category-arrow-icon" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryBrowseSection;
