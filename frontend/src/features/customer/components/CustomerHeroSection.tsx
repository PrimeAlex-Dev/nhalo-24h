import { useState, useEffect, useCallback } from 'react';
import './CustomerHeroSection.css';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import bannerTho1 from '../../../assets/banner-tho-1.jpg';
import bannerTho2 from '../../../assets/banner-tho-2.jpg';
import { mockSuggestionPrompts } from '../data/customerMockData';
import { PATHS } from '../../../routes/paths';

const heroBanners = [
  {
    id: 1,
    image: bannerTho1,
    alt: 'Thợ sửa chữa chuyên nghiệp tận tâm tại nhà',
    tag: 'Sửa điện lạnh',
    headline: 'Sự cố làm lạnh? Xử lý ngay trong ngày.'
  },
  {
    id: 2,
    image: bannerTho2,
    alt: 'Đội ngũ kỹ thuật viên uy tín, báo giá minh bạch',
    tag: 'Thợ uy tín',
    headline: 'Đội ngũ chuyên gia tin cậy cho mọi gia đình.'
  }
];

export function CustomerHeroSection() {
  const [problemDescription, setProblemDescription] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleSuggestionClick = (prompt: string) => {
    setProblemDescription(prompt);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, []);

  // Auto transition slides
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section className="customer-hero-section">
      <div className="container customer-hero-container">
        {/* Left Column: AI Description & Matching Card */}
        <div className="customer-hero-left">
          {/* Badge */}
          <div className="customer-hero-badge">
            <span>Dịch vụ gia đình tiện lợi &amp; chuyên nghiệp</span>
          </div>

          {/* Heading */}
          <h1 className="customer-hero-title">
            Bạn cần sửa chữa<br />
            sự cố gì?
          </h1>

          {/* Subtitle */}
          <p className="customer-hero-subtitle">
            Mô tả sự cố bạn đang gặp phải, hệ thống sẽ kết nối ngay thợ uy tín, tay nghề cao gần bạn nhất.
          </p>

          {/* Problem Input Card */}
          <div className="customer-search-card">
            <div className="problem-input-container">
              <textarea
                className="problem-textarea"
                placeholder='Mô tả sự cố bạn gặp phải, ví dụ: "Máy lạnh không mát và có dấu hiệu rò rỉ nước ở dàn lạnh..."'
                rows={2}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />
            </div>

            <div className="search-card-actions">
              <Link
                to={PATHS.CUSTOMER.PROVIDERS}
                className="ai-search-submit-btn"
                aria-label="Tìm thợ ngay"
              >
                <span>Tìm thợ ngay</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Suggestions Row */}
            <div className="problem-suggestions-row">
              <span className="try-label">Gợi ý:</span>
              <div className="suggestions-list">
                {mockSuggestionPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggestion-pill"
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="customer-trust-indicators">
            <div className="trust-indicator-item">
              <CheckCircle2 size={18} className="trust-icon-check" />
              <span>Thợ xác minh lý lịch &amp; tay nghề</span>
            </div>
            <div className="trust-indicator-item">
              <Star size={18} className="trust-icon-star" fill="#F59E0B" />
              <span>Đánh giá trung bình 4.9★</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Banner Carousel Card */}
        <div className="customer-hero-right">
          <div 
            className="hero-slider-card"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Banner Slides */}
            {heroBanners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                aria-hidden={index !== currentSlide}
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="hero-slide-image"
                />
                
                {/* Content Overlay */}
                <div className="hero-slide-overlay">
                  <span className="hero-slide-tag">{banner.tag}</span>
                  <h3 className="hero-slide-headline">{banner.headline}</h3>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              type="button"
              className="slider-nav-arrow slider-prev-arrow"
              onClick={prevSlide}
              aria-label="Banner trước"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="slider-nav-arrow slider-next-arrow"
              onClick={nextSlide}
              aria-label="Banner tiếp theo"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicator Dots */}
            <div className="hero-slider-dots">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`slider-dot-btn ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerHeroSection;
