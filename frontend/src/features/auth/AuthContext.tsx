import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../../services/authService';
import { getAuthToken, setAuthToken, removeAuthToken, USER_STORAGE_KEY } from '../../services/apiClient';
import type { AuthUser, LoginPayload } from './types/auth';
import { AuthContext, type AuthContextType } from './authContextDef';


function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken);
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getAuthToken());

  // Xác thực lại phiên đăng nhập khi khởi động ứng dụng (hoặc khi F5 tải lại trang)
  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      setTokenState(currentToken);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
      } catch {
        // Ignore storage errors
      }
    } catch {
      // Token hết hạn hoặc không hợp lệ -> xóa sạch session
      setUser(null);
      setTokenState(null);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const freshUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(freshUser);
          setTokenState(currentToken);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
          } catch {
            // Ignore storage errors
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          removeAuthToken();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    // Lắng nghe sự kiện 401 Unauthorized từ apiClient
    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setTokenState(null);
        removeAuthToken();
      }
    };

    window.addEventListener('nhalo24h:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('nhalo24h:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const response = await authService.login(payload);
    setTokenState(response.accessToken);
    setUser(response.user);
    setAuthToken(response.accessToken);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    } catch {
      // Ignore storage errors
    }
    return response.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setTokenState(null);
      removeAuthToken();
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }), [user, token, isLoading, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
