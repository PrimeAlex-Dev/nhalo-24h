import { CustomerNavbar } from './components/CustomerNavbar';
import { CustomerHeroSection } from './components/CustomerHeroSection';
import { CategoryBrowseSection } from './components/CategoryBrowseSection';

interface CustomerModuleProps {
  onLogout?: () => void;
}

export function CustomerModule({ onLogout }: CustomerModuleProps) {
  return (
    <div className="customer-module-wrapper">
      <CustomerNavbar onLogout={onLogout} />
      <main className="customer-main-content">
        <CustomerHeroSection />
        <CategoryBrowseSection />
      </main>
    </div>
  );
}

export default CustomerModule;
