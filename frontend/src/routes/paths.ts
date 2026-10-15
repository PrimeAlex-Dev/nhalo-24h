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
} as const;
