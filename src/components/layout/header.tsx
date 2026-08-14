"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Flame, Coins, Moon, Sun, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuToggle, sidebarCollapsed }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Select primitive properties directly to avoid re-creating object references
  const currentUser = useAppStore((state) => state.currentUser);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  useEffect(() => {
    setMounted(true);
  }, []);

  const streak = currentUser?.streakCount ?? 0;
  const coins = currentUser?.coins ?? 0;

  return (
    <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-[#1A1A2E]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#2D3748] z-30 flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 mr-2 text-text-light dark:text-text-dark"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-streak px-3 py-1.5 rounded-full font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer">
          <Flame className="w-4 h-4 fill-current" />
          <span>{mounted ? streak : 0}</span>
          <span className="hidden sm:inline">ngày</span>
        </div>

        {/* Coins Badge */}
        <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 px-3 py-1.5 rounded-full font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer">
          <Coins className="w-4 h-4 fill-current" />
          <span>{mounted ? coins : 0}</span>
          <span className="hidden sm:inline">xu</span>
        </div>

        <div className="w-px h-6 bg-[#E2E8F0] dark:bg-[#2D3748] mx-1"></div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-light dark:text-text-dark"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted && isDarkMode ? (
            <Sun className="w-5 h-5 hover:text-yellow-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 hover:text-primary transition-colors" />
          )}
        </button>
      </div>
    </header>
  );
}
