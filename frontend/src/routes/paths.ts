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
  },
} as const;
