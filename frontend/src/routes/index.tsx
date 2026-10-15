import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { CustomerHomePage, FindProviderPage, ProviderProfilePage, MyOrdersPage, MyProfilePage } from '../features/customer';
import { LoginPage, RegisterPage } from '../features/auth';
import { 
  ProviderHomePage, 
  ProviderJobsPage, 
  ProviderEarningsPage, 
  ProviderAccountPage 
} from '../features/provider';
import { AdminLayout } from '../layouts/AdminLayout';
import { 
  AdminDashboardPage, 
  AdminOrdersPage, 
  AdminUsersPage,
  AdminServicesPage
} from '../features/admin';
import { PATHS } from './paths';

const router = createBrowserRouter([
  // Authentication Routes (Standalone full-page experience)
  {
    path: PATHS.AUTH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PATHS.AUTH.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: '/sign-in',
    element: <LoginPage />,
  },
  {
    path: '/sign-up',
    element: <RegisterPage />,
  },
  // Landing Page Route (Guest)
  {
    path: PATHS.HOME,
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },

  // Customer Module Routes (Authenticated Portal with CustomerLayout)
  {
    element: <CustomerLayout />,
    children: [
      {
        path: PATHS.CUSTOMER.ROOT,
        element: <CustomerHomePage />,
      },
      {
        path: PATHS.CUSTOMER.PROVIDERS,
        element: <FindProviderPage />,
      },
      {
        path: PATHS.CUSTOMER.PROVIDER_DETAIL,
        element: <ProviderProfilePage />,
      },
      {
        path: PATHS.CUSTOMER.ORDERS,
        element: <MyOrdersPage />,
      },
      {
        path: PATHS.CUSTOMER.PROFILE,
        element: <MyProfilePage />,
      },
      // Convenience aliases so direct paths work seamlessly
      {
        path: '/profile',
        element: <MyProfilePage />,
      },
      {
        path: '/my-profile',
        element: <MyProfilePage />,
      },
      {
        path: '/orders',
        element: <MyOrdersPage />,
      },
      {
        path: '/my-orders',
        element: <MyOrdersPage />,
      },
      {
        path: '/providers',
        element: <FindProviderPage />,
      },
      {
        path: '/providers/:providerId',
        element: <ProviderProfilePage />,
      },
    ],
  },

  // Provider Module Routes (Dedicated Partner Portal with ProviderLayout)
  {
    path: PATHS.PROVIDER.ROOT,
    element: <ProviderLayout />,
    children: [
      {
        index: true,
        element: <ProviderHomePage />,
      },
      {
        path: 'dashboard',
        element: <ProviderHomePage />,
      },
      {
        path: 'jobs',
        element: <ProviderJobsPage />,
      },
      {
        path: 'earnings',
        element: <ProviderEarningsPage />,
      },
      {
        path: 'account',
        element: <ProviderAccountPage />,
      },
    ],
  },

  // Admin Module Routes (Dedicated Dashboard Portal with AdminLayout)
  {
    path: PATHS.ADMIN.ROOT,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'services',
        element: <AdminServicesPage />,
      },
    ],
  },

  // Catch-all route: redirect to home
  {
    path: '*',
    element: <Navigate to={PATHS.HOME} replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
