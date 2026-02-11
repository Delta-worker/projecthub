'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu, X } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-background border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } ${mobileMenuOpen ? 'ml-64' : 'ml-0'} lg:ml-0 pt-16 lg:pt-0`}
      >
        {children}
      </main>
    </>
  );
}
