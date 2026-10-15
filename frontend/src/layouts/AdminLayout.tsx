import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { AdminHeader } from '../features/admin/components/AdminHeader';
import { ADMIN_MOCK_ORDERS, ADMIN_MOCK_USERS } from '../features/admin/data/adminMockData';
import './AdminLayout.css';

export interface AdminContextType {
  searchQuery: string;
}

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate dynamic badge counters for sidebar/header
  const pendingUsersCount = ADMIN_MOCK_USERS.filter((u) => u.status === 'pending').length;
  const backlogOrdersCount = ADMIN_MOCK_ORDERS.filter((o) => o.backlogStatus !== 'normal').length;

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        pendingUsersCount={pendingUsersCount}
        backlogOrdersCount={backlogOrdersCount}
      />

      {/* Main Content Area */}
      <div className="admin-main-container">
        {/* Sticky Top Header */}
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          backlogCount={backlogOrdersCount}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Content */}
        <main className="admin-page-content">
          <Outlet context={{ searchQuery } satisfies AdminContextType} />
        </main>
      </div>
    </div>
  );
}
