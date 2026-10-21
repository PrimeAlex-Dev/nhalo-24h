import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { AdminHeader } from '../features/admin/components/AdminHeader';
import { userService } from '../services';
import './AdminLayout.css';

export interface AdminContextType {
  searchQuery: string;
}

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    userService
      .getUsers({ role: 'PROVIDER', status: 'DISABLED', size: 1 })
      .then((res) => {
        setPendingUsersCount(res.totalElements);
      })
      .catch(() => {
        // Backend offline or error -> fallback 0
      });
  }, []);

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
        backlogOrdersCount={0}
      />

      {/* Main Content Area */}
      <div className="admin-main-container">
        {/* Sticky Top Header */}
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          backlogCount={pendingUsersCount}
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
