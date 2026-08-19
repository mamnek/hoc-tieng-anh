"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Home,
  FolderOpen,
  BookOpen,
  Gamepad2,
  ShoppingBag,
  Trophy,
  Map as MapIcon,
  Video as VideoIcon,
  Mic,
  Swords,
  BookOpenCheck,
  Clock,
  LogOut
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileMenuOpen?: boolean;
  onMobileClose?: () => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Home': return Home;
    case 'BookOpenCheck': return BookOpenCheck;
    case 'Swords': return Swords;
    case 'Clock': return Clock;
    case 'Mic': return Mic;
    case 'Video': return VideoIcon;
    case 'FolderOpen': return FolderOpen;
    case 'BookOpen': return BookOpen;
    case 'Gamepad2': return Gamepad2;
    case 'ShoppingBag': return ShoppingBag;
    case 'Trophy': return Trophy;
    case 'Map': return MapIcon;
    default: return Home;
  }
};

export function Sidebar({ collapsed, onToggle, mobileMenuOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentUser = useAppStore((state) => state.currentUser);
  const logoutUser = useAppStore((state) => state.logoutUser);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-card-light dark:bg-card-dark border-r border-[#E2E8F0] dark:border-[#2D3748] transition-all duration-300 ease-in-out",
          collapsed ? "w-[80px]" : "w-[280px]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 border-b border-[#E2E8F0] dark:border-[#2D3748] px-4 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden" onClick={() => onMobileClose?.()}>
            <div className="bg-primary/20 p-2 rounded-lg text-primary shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl text-primary whitespace-nowrap animate-fade-in">
                VocabMaster
              </span>
            )}
          </Link>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Đóng menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors")} />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User avatar & Logout & Collapse toggle */}
        <div className="border-t border-[#E2E8F0] dark:border-[#2D3748] p-4 shrink-0 flex flex-col gap-3">
          <div className={cn("flex items-center justify-between gap-2 overflow-hidden", collapsed ? "justify-center" : "")}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/20">
                {currentUser?.name?.charAt(0).toUpperCase() || '😊'}
              </div>
              {!collapsed && (
                <div className="flex flex-col whitespace-nowrap min-w-0">
                  <span className="font-semibold text-sm truncate">{currentUser?.name || "Học viên"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email || "Chưa đăng nhập"}</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onToggle}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
}
