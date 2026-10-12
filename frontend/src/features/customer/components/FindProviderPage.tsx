import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './FindProviderPage.css';
import { 
  Search, 
  BadgeCheck, 
  Star, 
  MapPin, 
  Clock, 
  ArrowLeftRight,
  ChevronDown
} from 'lucide-react';
import { mockProviders, providerCategoryFilters, mockCategories } from '../data/customerMockData';

export function FindProviderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Best match');

  const categoryParam = searchParams.get('category');

  // Derive selected category from URL search params (or default to 'All services')
  const selectedCategory = useMemo(() => {
    if (!categoryParam) return 'All services';
    const found = providerCategoryFilters.find(
      (c) => c.toLowerCase() === categoryParam.trim().toLowerCase()
    );
    if (found) return found;

    const byId = mockCategories.find(
      (c) => c.id.toLowerCase() === categoryParam.trim().toLowerCase()
    );
    if (byId) return byId.title;

    return 'All services';
  }, [categoryParam]);

  const handleCategorySelect = (category: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'All services') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    setSearchParams(nextParams);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    return mockProviders
      .filter((provider) => {
        // Category filter
        if (selectedCategory !== 'All services' && provider.category !== selectedCategory) {
          return false;
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
  }, [searchQuery, selectedCategory, availableTodayOnly, sortBy]);

  return (
    <div className="find-provider-page">
      <div className="container">
        {/* Page Header */}
        <div className="find-provider-header">
          <h1 className="find-provider-title">Find a provider</h1>
          <p className="find-provider-subtitle">
            Browse verified professionals or filter by what you need.
          </p>
        </div>

        {/* Search Bar */}
        <div className="provider-search-wrapper">
          <Search size={20} className="provider-search-icon" />
          <input
            type="text"
            className="provider-search-input"
            placeholder="Search by name, company, or service"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="provider-category-pills">
          {providerCategoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              className={`provider-pill ${selectedCategory === category ? 'active' : ''}`}
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
            <span className="available-label">Available today</span>
          </label>

          <div className="provider-sort-container">
            <span className="sort-by-text">Sort by</span>
            <div className="sort-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="Best match">Best match</option>
                <option value="Highest rating">Highest rating</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="sort-chevron-icon" />
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="providers-grid">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="provider-card">
              {/* Card Header */}
              <div className="provider-card-header">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="provider-avatar"
                />

                <div className="provider-primary-info">
                  <div className="provider-name-row">
                    <h3 className="provider-name">{provider.name}</h3>
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
                  <span className="price-prefix">from</span>
                  <span className="price-rate">${provider.pricePerHour}<span className="price-unit">/hr</span></span>
                </div>
              </div>

              {/* Tags Row */}
              <div className="provider-tags-row">
                <span className="provider-tag service-tag">{provider.category}</span>
                {provider.isTopRated && (
                  <span className="provider-tag top-rated-tag">Top rated</span>
                )}
              </div>

              {/* Availability Badge */}
              <div className="provider-availability-row">
                {provider.availability === 'Available today' ? (
                  <div className="availability-pill available-today">
                    <Clock size={13} />
                    <span>Available today</span>
                  </div>
                ) : (
                  <div className="availability-pill available-soon">
                    <Clock size={13} />
                    <span>Available soon</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="provider-card-actions">
                <button
                  type="button"
                  className="provider-action-btn view-profile-btn"
                  onClick={(e) => e.preventDefault()}
                >
                  View Profile
                </button>
                <button
                  type="button"
                  className="provider-action-btn compare-btn"
                  onClick={(e) => e.preventDefault()}
                >
                  <ArrowLeftRight size={15} />
                  <span>Compare</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <div className="no-providers-found">
            <p>No providers found matching your criteria.</p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                handleCategorySelect('All services');
                setAvailableTodayOnly(false);
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindProviderPage;
