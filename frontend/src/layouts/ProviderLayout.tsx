import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ProviderNavbar } from '../features/provider/components/ProviderNavbar';
import { providerProfileService, providerJobService, type ProviderProfileData } from '../services';
import './ProviderLayout.css';

export interface ProviderContextType {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  toggleOnline: () => Promise<void> | void;
  profile: ProviderProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProviderProfileData | null>>;
  incomingRequestsCount: number;
  refreshIncomingRequestsCount: () => Promise<void>;
}

export function ProviderLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProviderProfileData | null>(null);
  const [incomingRequestsCount, setIncomingRequestsCount] = useState<number>(0);

  const refreshIncomingRequestsCount = useCallback(async () => {
    try {
      const count = await providerJobService.getPendingRequestsCount();
      setIncomingRequestsCount(count);
    } catch {
      setIncomingRequestsCount(0);
    }
  }, []);

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

    refreshIncomingRequestsCount();

    // Auto-poll incoming request count every 12 seconds
    const pollTimer = setInterval(() => {
      refreshIncomingRequestsCount();
    }, 12000);

    // Immediate sync when provider switches back to tab
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshIncomingRequestsCount();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      ignore = true;
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [refreshIncomingRequestsCount]);

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
        incomingRequestsCount={incomingRequestsCount}
      />

      {/* Main Page Area */}
      <main className="provider-main-wrapper">
        <Outlet 
          context={{ 
            isOnline, 
            setIsOnline, 
            toggleOnline, 
            profile, 
            setProfile,
            incomingRequestsCount,
            refreshIncomingRequestsCount
          } satisfies ProviderContextType} 
        />
      </main>
    </div>
  );
}
