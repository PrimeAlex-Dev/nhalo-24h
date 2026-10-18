import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ProviderNavbar } from '../features/provider/components/ProviderNavbar';
import { providerProfileService } from '../services';
import './ProviderLayout.css';

export interface ProviderContextType {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  toggleOnline: () => Promise<void> | void;
}

export function ProviderLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Sync initial online/available status with real provider profile in database
  useEffect(() => {
    let ignore = false;

    providerProfileService
      .getMyProfile()
      .then((prof) => {
        if (!ignore && prof.isAvailable !== undefined && prof.isAvailable !== null) {
          setIsOnline(prof.isAvailable);
        }
      })
      .catch((err) => {
        console.warn('Could not load provider profile availability:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const toggleOnline = useCallback(async () => {
    setIsOnline((prev) => {
      const nextVal = !prev;
      providerProfileService.updateMyProfile({ isAvailable: nextVal }).catch((err) => {
        console.error('Failed to sync availability status to backend:', err);
        setIsOnline(prev);
      });
      return nextVal;
    });
  }, []);

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
