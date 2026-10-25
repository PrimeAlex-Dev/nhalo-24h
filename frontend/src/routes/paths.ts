/**
 * Centralized Route Paths definition
 * Foundation for scalable routing across the application
 */
export const PATHS = {
  // Public / Landing Module
  HOME: '/',
  
  // Customer Portal Module
  CUSTOMER: {
    ROOT: '/customer',
    SERVICES: '/customer/services',
    ORDERS: '/customer/orders',
    PROVIDERS: '/customer/providers',
    PROVIDER_DETAIL: '/customer/providers/:providerId',
    PROFILE: '/customer/profile',
    SETTINGS: '/customer/settings',
  },

  // Foundation for future modules
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  
  PROVIDER: {
    ROOT: '/provider',
    DASHBOARD: '/provider/dashboard',
    JOBS: '/provider/jobs',
    EARNINGS: '/provider/earnings',
    ACCOUNT: '/provider/account',
  },

  // Admin Portal Module
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    ORDERS: '/admin/orders',
    FINANCIAL: '/admin/financial',
    USERS: '/admin/users',
    SERVICES: '/admin/services',
  },
} as const;

export function getRoleDashboardPath(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return PATHS.ADMIN.USERS;
    case 'PROVIDER':
      return PATHS.PROVIDER.ROOT;
    case 'CUSTOMER':
    default:
      return PATHS.CUSTOMER.ROOT;
  }
}
