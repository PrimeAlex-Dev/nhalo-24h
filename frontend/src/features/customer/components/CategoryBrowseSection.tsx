import './CategoryBrowseSection.css';
import { 
  ArrowRight, 
  Snowflake, 
  Zap, 
  Wrench, 
  Sparkles, 
  Key, 
  Hammer, 
  PaintRoller, 
  Bug 
} from 'lucide-react';
import { mockCategories } from '../data/customerMockData';
import type { CategoryItem } from '../types/customer';

const renderCategoryIcon = (icon: CategoryItem['icon']) => {
  switch (icon) {
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
      return <PaintRoller size={22} strokeWidth={2.2} />;
    case 'bug':
      return <Bug size={22} strokeWidth={2.2} />;
    default:
      return <Wrench size={22} strokeWidth={2.2} />;
  }
};

export function CategoryBrowseSection() {
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
            <a 
              href="#all-providers" 
              className="view-all-providers-link"
              onClick={(e) => e.preventDefault()}
            >
              <span>View all providers</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="category-grid">
          {mockCategories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              role="button"
              tabIndex={0}
            >
              <div className="category-icon-wrapper">
                {renderCategoryIcon(category.icon)}
              </div>

              <div className="category-info">
                <h3 className="category-card-title">{category.title}</h3>
                <p className="category-card-desc">{category.description}</p>
              </div>

              <div className="category-card-footer">
                <span className="category-price">from ${category.priceFrom}</span>
                <span className="category-jobs-count">{category.completedJobs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
