'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // 로그인 페이지에서는 레이아웃 적용하지 않음
  const isAuthPage = pathname?.includes('/admin/auth');

  if (isAuthPage) {
    return (
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    );
  }

  // 모든 관리자 페이지에 공통 레이아웃 적용
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <AdminHeader
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}