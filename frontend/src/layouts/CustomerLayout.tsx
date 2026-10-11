import { Outlet } from 'react-router-dom';
import { CustomerNavbar } from '../features/customer/components/CustomerNavbar';
import { Footer } from '../components/layout/Footer';

export function CustomerLayout() {
  return (
    <div className="layout-customer">
      <CustomerNavbar />
      <main className="customer-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
