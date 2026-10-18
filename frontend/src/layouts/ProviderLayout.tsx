import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ProviderNavbar } from '../features/provider/components/ProviderNavbar';
import { providerProfileService, type ProviderProfileData } from '../services';
import './ProviderLayout.css';

export interface ProviderContextType {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  toggleOnline: () => Promise<void> | void;
  profile: ProviderProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProviderProfileData | null>>;
}

export function ProviderLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProviderProfileData | null>(null);

  // Sync initial online/available status and profile data from database
  useEffect(() => {
    let ignore = false;

    providerProfileService
      .getMyProfile()
      .then((prof) => {
        if (!ignore) {
          setProfile(prof);
          if (prof.isAvailable !== undefined && prof.isAvailable !== null) {
            setIsOnline(prof.isAvailable);
          }
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
        profile={profile}
      />

      {/* Main Page Area */}
      <main className="provider-main-wrapper">
        <Outlet context={{ isOnline, setIsOnline, toggleOnline, profile, setProfile } satisfies ProviderContextType} />
      </main>
    </div>
  );
}
