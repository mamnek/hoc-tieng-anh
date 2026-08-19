"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isPublicRoute = pathname === "/login" || pathname === "/register";

  // Standalone public auth pages (login/register)
  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark" suppressHydrationWarning>
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileMenuOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header 
          sidebarCollapsed={collapsed} 
          onMenuToggle={toggleMobileMenu} 
        />
        <main className="flex-1 overflow-auto p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 md:pb-8 animate-fade-in relative z-0">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
