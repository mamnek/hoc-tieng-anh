"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
      }
      if (isAuthenticated && isPublicRoute) {
        router.push("/");
      }
    }
  }, [mounted, isAuthenticated, isPublicRoute, router]);

  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Return null on initial server/client mount to prevent browser extensions (Bitdefender bis_skin_checked, Grammarly, etc.) from causing hydration mismatches
  if (!mounted) {
    return null;
  }

  // Standalone public auth pages (login/register)
  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  // If not authenticated, render loading screen while redirecting to /login
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8F9FC] text-[#1E1E2E]">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Đang chuyển hướng tới trang Đăng nhập...</p>
          </div>
        </div>
      </div>
    );
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
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
