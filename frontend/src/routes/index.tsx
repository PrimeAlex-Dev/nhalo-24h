import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { CustomerHomePage, FindProviderPage, ProviderProfilePage, MyOrdersPage } from '../features/customer';
import { PATHS } from './paths';

const router = createBrowserRouter([
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
      // Convenience aliases so direct paths work seamlessly
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

  // Catch-all route: redirect to home
  {
    path: '*',
    element: <Navigate to={PATHS.HOME} replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
