import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ProviderNavbar } from '../features/provider/components/ProviderNavbar';
import './ProviderLayout.css';

export interface ProviderContextType {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  toggleOnline: () => void;
}

export function ProviderLayout() {
  const [isOnline, setIsOnline] = useState(true);

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  return (
    <div className="provider-layout">
      {/* Provider Navbar: Top bar on desktop & top bar + bottom nav on mobile */}
      <ProviderNavbar 
        isOnline={isOnline} 
        onToggleOnline={toggleOnline} 
      />

      {/* Main Page Area */}
      <main className="provider-main-wrapper">
        <Outlet context={{ isOnline, setIsOnline, toggleOnline } satisfies ProviderContextType} />
      </main>
    </div>
  );
}
