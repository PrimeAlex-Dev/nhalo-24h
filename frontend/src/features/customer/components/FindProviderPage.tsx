import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import './FindProviderPage.css';
import { 
  Search, 
  BadgeCheck, 
  Star, 
  MapPin, 
  Clock, 
  ChevronDown,
  Loader2,
  UserX,
  ArrowLeft,
  Home,
  Send,
  ZoomIn
} from 'lucide-react';
import { providerCategoryFilters, mockCategories } from '../data/customerMockData';
import { 
  providerProfileService, 
  categoryService,
  customerOrderService,
  type PublicProviderItem 
} from '../../../services';
import type { CustomerOrderSummary } from '../../../types/order';
import type { ProviderItem } from '../types/customer';
import { CreateOrderModal } from './CreateOrderModal';
import { SelectOrderForProviderModal } from './SelectOrderForProviderModal';
import { AvatarLightboxModal } from '../../../components/common';

export function FindProviderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Best match');

  // Real data state
  const [realProviders, setRealProviders] = useState<PublicProviderItem[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Booking & Dispatch state
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<PublicProviderItem | null>(null);
  const [showSelectOrderModal, setShowSelectOrderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<CustomerOrderSummary[]>([]);
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [lightboxProvider, setLightboxProvider] = useState<ProviderItem | null>(null);

  const categoryParam = searchParams.get('category');

  // Load real active categories and public providers from database
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [providersRes, categoriesRes] = await Promise.allSettled([
          providerProfileService.getPublicProviders(),
          categoryService.getCategories({ status: 'ACTIVE', size: 50 }),
        ]);

        if (!ignore) {
          if (providersRes.status === 'fulfilled' && providersRes.value) {
            setRealProviders(providersRes.value);
          }
          if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.content) {
            const catNames = categoriesRes.value.content.map((c) => c.name);
            setDbCategories(catNames);
          }
        }
      } catch (err) {
        console.error('Error fetching public providers:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  // Combined category filters (DB categories + fallback filters)
  const categoryFilters = useMemo(() => {
    const combined = ['Tất cả dịch vụ'];
    if (dbCategories.length > 0) {
      combined.push(...dbCategories);
    } else {
      combined.push(...providerCategoryFilters.filter((c) => c !== 'Tất cả dịch vụ' && c !== 'All services'));
    }
    return Array.from(new Set(combined));
  }, [dbCategories]);

  // Derive selected category from URL search params (or default to 'Tất cả dịch vụ')
  const selectedCategory = useMemo(() => {
    if (!categoryParam || categoryParam.toLowerCase() === 'all services') return 'Tất cả dịch vụ';
    const found = categoryFilters.find(
      (c) => c.toLowerCase() === categoryParam.trim().toLowerCase()
    );
    if (found) return found;

    const byId = mockCategories.find(
      (c) => c.id.toLowerCase() === categoryParam.trim().toLowerCase()
    );
    if (byId) return byId.title;

    return categoryParam.trim();
  }, [categoryParam, categoryFilters]);

  const handleCategorySelect = (category: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'Tất cả dịch vụ' || category === 'All services') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    setSearchParams(nextParams);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Map real providers from database (no fake mock data fallback)
  const providersPool = useMemo(() => {
    return realProviders.map((rp) => ({
      id: rp.id,
      name: rp.name,
      verified: rp.verified ?? true,
      company: rp.headline || rp.company || 'Thợ Kỹ Thuật Độc Lập',
      rating: rp.rating || 5.0,
      reviewsCount: rp.reviewsCount || 0,
      distance: rp.distance || rp.serviceArea || 'Gần bạn',
      pricePerHour: rp.pricePerHour || 0,
      category: rp.category || (rp.categories && rp.categories.length > 0 ? rp.categories[0].name : 'Dịch vụ gia đình'),
      isTopRated: rp.isTopRated ?? true,
      availability: (rp.availability === 'Available today' ? 'Available today' : 'Available soon') as 'Available today' | 'Available soon',
      avatar: rp.avatar || '',
    }));
  }, [realProviders]);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    return providersPool
      .filter((provider) => {
        // Category filter
        if (selectedCategory !== 'Tất cả dịch vụ' && selectedCategory !== 'All services') {
          const catLower = selectedCategory.toLowerCase();
          const pCatLower = provider.category.toLowerCase();
          if (!pCatLower.includes(catLower) && !catLower.includes(pCatLower)) {
            return false;
          }
        }

        // Available today filter
        if (availableTodayOnly && provider.availability !== 'Available today') {
          return false;
        }

        // Search query filter (matches name, company, or category)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = provider.name.toLowerCase().includes(query);
          const matchesCompany = provider.company.toLowerCase().includes(query);
          const matchesCategory = provider.category.toLowerCase().includes(query);
          return matchesName || matchesCompany || matchesCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Highest rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'Price: Low to High') {
          return a.pricePerHour - b.pricePerHour;
        }
        if (sortBy === 'Price: High to Low') {
          return b.pricePerHour - a.pricePerHour;
        }
        return 0; // Default: Best match (keep order)
      });
  }, [providersPool, searchQuery, selectedCategory, availableTodayOnly, sortBy]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('vi-VN')} đ`;
  };

  const handleQuickBook = async (provider: any) => {
    setSelectedProviderForBooking(provider);
    try {
      setCheckingOrders(true);
      const res = await customerOrderService.getMyOrders('PENDING_PROVIDER', 0, 50);
      const orders = res.content;
      if (orders && orders.length > 0) {
        setPendingOrders(orders);
        setShowSelectOrderModal(true);
      } else {
        setShowCreateModal(true);
      }
    } catch {
      setShowCreateModal(true);
    } finally {
      setCheckingOrders(false);
    }
  };

  const handleSelectExistingOrder = async (orderId: string) => {
    if (!selectedProviderForBooking) return;
    await customerOrderService.dispatchRequests(orderId, {
      providerIds: [selectedProviderForBooking.id],
    });
    setShowSelectOrderModal(false);
    navigate(PATHS.CUSTOMER.ORDERS);
  };

  return (
    <div className="find-provider-page">
      <div className="container">
        {/* Quick Back to Home Navigation Pill */}
        <div className="find-provider-breadcrumb-box">
          <Link to={PATHS.CUSTOMER.ROOT} className="back-to-home-pill" title="Quay về Trang chủ Nhà Lo 24h">
            <ArrowLeft size={15} />
            <Home size={15} />
            <span>Quay về Trang chủ</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="find-provider-header">
          <h1 className="find-provider-title">Tìm kiếm thợ chuyên nghiệp</h1>
          <p className="find-provider-subtitle">
            Duyệt danh sách thợ đối tác thật đã xác minh và chọn người phù hợp nhất cho công việc của bạn.
          </p>
        </div>

        {/* Search Bar */}
        <div className="provider-search-wrapper">
          <Search size={20} className="provider-search-icon" />
          <input
            type="text"
            className="provider-search-input"
            placeholder="Tìm theo tên thợ, chức danh, hoặc dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="provider-category-pills">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              className={`provider-pill ${selectedCategory.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filter and Sort Controls */}
        <div className="provider-controls-bar">
          <label className="available-today-toggle">
            <input
              type="checkbox"
              checked={availableTodayOnly}
              onChange={(e) => setAvailableTodayOnly(e.target.checked)}
              className="available-checkbox"
            />
            <span className="available-label">Đang sẵn sàng hôm nay</span>
          </label>

          <div className="provider-sort-container">
            <span className="sort-by-text">Sắp xếp theo</span>
            <div className="sort-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="Best match">Phù hợp nhất</option>
                <option value="Highest rating">Đánh giá cao nhất</option>
                <option value="Price: Low to High">Giá: Thấp đến Cao</option>
                <option value="Price: High to Low">Giá: Cao đến Thấp</option>
              </select>
              <ChevronDown size={14} className="sort-chevron-icon" />
            </div>
          </div>
        </div>

        {/* Loading state indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', color: '#64748B' }}>
            <Loader2 size={20} className="spin-icon" />
            <span>Đang tải danh sách thợ từ hệ thống...</span>
          </div>
        )}

        {/* Providers Grid */}
        <div className="providers-grid">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="provider-card">
              {/* Card Header */}
              <div className="provider-card-header">
                {provider.avatar ? (
                  <div
                    className="provider-avatar-zoom-trigger"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLightboxProvider(provider);
                    }}
                    title="Nhấp để phóng to xem rõ mặt thợ"
                  >
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="provider-avatar"
                    />
                    <span className="provider-avatar-zoom-badge" aria-hidden="true">
                      <ZoomIn size={12} />
                    </span>
                  </div>
                ) : (
                  <Link
                    to={`/customer/providers/${provider.id}`}
                    className="provider-avatar-link"
                    title={`Xem hồ sơ ${provider.name}`}
                  >
                    <div className="provider-avatar-letter-placeholder">
                      {provider.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                )}

                <div className="provider-primary-info">
                  <div className="provider-name-row">
                    <Link
                      to={`/customer/providers/${provider.id}`}
                      className="provider-name-link"
                    >
                      <h3 className="provider-name">{provider.name}</h3>
                    </Link>
                    {provider.verified && (
                      <BadgeCheck size={17} className="provider-verified-badge" />
                    )}
                  </div>
                  <p className="provider-company">{provider.company}</p>

                  <div className="provider-meta-row">
                    <div className="provider-rating">
                      <Star size={14} className="rating-star-icon" fill="#F59E0B" />
                      <span className="rating-score">
                        {provider.rating} <span className="reviews-count">({provider.reviewsCount})</span>
                      </span>
                    </div>
                    <div className="provider-distance">
                      <MapPin size={13} className="distance-pin-icon" />
                      <span>{provider.distance}</span>
                    </div>
                  </div>
                </div>

                <div className="provider-price-box">
                  <span className="price-prefix">từ</span>
                  <span className="price-rate">{formatPrice(provider.pricePerHour)}<span className="price-unit">/giờ</span></span>
                </div>
              </div>

              {/* Tags Row */}
              <div className="provider-tags-row">
                <span className="provider-tag service-tag">{provider.category}</span>
                {provider.isTopRated && (
                  <span className="provider-tag top-rated-tag">Đánh giá tốt</span>
                )}
              </div>

              {/* Availability Badge */}
              <div className="provider-availability-row">
                {provider.availability === 'Available today' ? (
                  <div className="availability-pill available-today">
                    <Clock size={13} />
                    <span>Sẵn sàng hôm nay</span>
                  </div>
                ) : (
                  <div className="availability-pill available-soon">
                    <Clock size={13} />
                    <span>Sắp rảnh</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="provider-card-actions">
                <Link
                  to={`/customer/providers/${provider.id}`}
                  className="provider-action-btn view-profile-btn"
                >
                  Xem hồ sơ
                </Link>
                <button
                  type="button"
                  className="provider-action-btn book-btn"
                  onClick={() => handleQuickBook(provider)}
                  disabled={checkingOrders}
                >
                  <Send size={13} />
                  <span>Đặt thợ</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredProviders.length === 0 && (
          <div className="no-providers-found">
            <div className="no-providers-icon-wrap">
              <UserX size={36} className="no-providers-icon" />
            </div>
            <h3 className="no-providers-title">
              {realProviders.length === 0 
                ? 'Hiện chưa có thợ khả thi' 
                : 'Không tìm thấy thợ phù hợp'}
            </h3>
            <p className="no-providers-desc">
              {realProviders.length === 0
                ? 'Hệ thống hiện tại chưa có thợ đối tác nào đăng ký hoặc sẵn sàng nhận việc. Vui lòng quay lại sau!'
                : 'Không có thợ nào khớp với từ khóa tìm kiếm hoặc bộ lọc danh mục đã chọn.'}
            </p>
            <div className="no-providers-actions">
              {realProviders.length > 0 && (
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    handleCategorySelect('Tất cả dịch vụ');
                    setAvailableTodayOnly(false);
                  }}
                >
                  Đặt lại bộ lọc
                </button>
              )}
              <Link to={PATHS.CUSTOMER.ROOT} className="back-home-btn">
                <Home size={15} />
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Smart Select Order Modal */}
      {showSelectOrderModal && selectedProviderForBooking && (
        <SelectOrderForProviderModal
          isOpen={showSelectOrderModal}
          onClose={() => setShowSelectOrderModal(false)}
          provider={selectedProviderForBooking}
          pendingOrders={pendingOrders}
          onSelectExistingOrder={handleSelectExistingOrder}
          onCreateNewOrder={() => {
            setShowSelectOrderModal(false);
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Direct Create Order Modal */}
      {showCreateModal && selectedProviderForBooking && (
        <CreateOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          initialProviderId={selectedProviderForBooking.id}
          initialProviderName={selectedProviderForBooking.name}
          onSuccess={() => {
            setShowCreateModal(false);
            navigate(PATHS.CUSTOMER.ORDERS);
          }}
        />
      )}

      {/* Phóng to xem ảnh thợ trực tiếp đè lên trang danh sách */}
      <AvatarLightboxModal
        isOpen={!!lightboxProvider}
        onClose={() => setLightboxProvider(null)}
        imageUrl={lightboxProvider?.avatar}
        name={lightboxProvider?.name || ''}
        role={lightboxProvider?.company || lightboxProvider?.category || ''}
        verified={lightboxProvider?.verified}
        badgeText="Nhận diện thợ"
      />
    </div>
  );
}

export default FindProviderPage;
