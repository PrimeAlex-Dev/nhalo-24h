import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { CustomerHomePage } from '../features/customer';
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

  // Customer Module Routes (Authenticated Portal)
  {
    path: PATHS.CUSTOMER.ROOT,
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHomePage />,
      },
      // Foundation for future customer sub-routes:
      // { path: 'orders', element: <CustomerOrdersPage /> },
      // { path: 'services', element: <CustomerServicesPage /> },
      // { path: 'profile', element: <CustomerProfilePage /> },
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
