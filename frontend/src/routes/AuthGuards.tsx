import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '../features/auth';
import { PATHS, getRoleDashboardPath } from './paths';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

/**
 * Guard bảo vệ các tuyến đường yêu cầu đăng nhập và phân quyền (RBAC)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#475569'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #E2E8F0',
          borderTop: '3px solid #1D6AE5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Đang xác thực quyền truy cập...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu vai trò cụ thể mà user không thỏa mãn -> điều hướng về Dashboard đúng của user
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = getRoleDashboardPath(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Guard dành riêng cho trang Khách vãng lai (Login, Register).
 * Nếu đã đăng nhập rồi thì không cho vào lại Login mà tự động đưa thẳng vào Dashboard tương ứng.
 */
export const GuestRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
