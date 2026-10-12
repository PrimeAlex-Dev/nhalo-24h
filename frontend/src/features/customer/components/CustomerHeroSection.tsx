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
    tag: 'AC Repair',
    headline: 'Cooling problems? Fixed today.'
  },
  {
    id: 2,
    image: bannerTho2,
    alt: 'Đội ngũ kỹ thuật viên uy tín, báo giá minh bạch',
    tag: 'Verified Pros',
    headline: 'Trusted experts for every home need.'
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
            <span>Home services made easy</span>
          </div>

          {/* Heading */}
          <h1 className="customer-hero-title">
            What do you need<br />
            help with?
          </h1>

          {/* Subtitle */}
          <p className="customer-hero-subtitle">
            Describe your household problem in plain words, and we will match you with trusted, verified pros near you.
          </p>

          {/* Problem Input Card */}
          <div className="customer-search-card">
            <div className="problem-input-container">
              <textarea
                className="problem-textarea"
                placeholder='Describe your problem, e.g. "My air conditioner is not cooling properly and sometimes leaks water."'
                rows={2}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />
            </div>

            <div className="search-card-actions">
              <Link
                to={PATHS.CUSTOMER.PROVIDERS}
                className="ai-search-submit-btn"
                aria-label="Find a pro"
              >
                <span>Find a pro</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Suggestions Row */}
            <div className="problem-suggestions-row">
              <span className="try-label">Try:</span>
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
              <span>Verified & background-checked</span>
            </div>
            <div className="trust-indicator-item">
              <Star size={18} className="trust-icon-star" fill="#F59E0B" />
              <span>4.9 average rating</span>
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
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="slider-nav-arrow slider-next-arrow"
              onClick={nextSlide}
              aria-label="Next banner"
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
