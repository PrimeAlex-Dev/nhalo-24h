import { useState } from 'react';
import './CustomerHeroSection.css';
import {
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import heroAcImg from '../../../assets/customer_hero_ac.png';
import { mockSuggestionPrompts } from '../data/customerMockData';

export function CustomerHeroSection() {
  const [problemDescription, setProblemDescription] = useState('');

  const handleSuggestionClick = (prompt: string) => {
    setProblemDescription(prompt);
  };

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
              <a
                href="#find-pro"
                className="find-pro-link"
                onClick={(e) => e.preventDefault()}
              >
                <span>Find a Pro</span>
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                className="ai-search-submit-btn"
                aria-label="Search pros"
              >
                <span>Search</span>
                <ArrowRight size={15} />
              </button>
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

        {/* Right Column: Hero Visual Card */}
        <div className="customer-hero-right">
          <div className="hero-pro-card">
            <img
              src={heroAcImg}
              alt="AC Repair Technician at work"
              className="hero-pro-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
