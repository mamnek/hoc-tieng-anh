"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, Video, BookOpen, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ITEMS = [
  { path: '/', label: 'Trang chủ', icon: Home },
  { path: '/speaking', label: 'Luyện nói', icon: Mic, highlight: true },
  { path: '/video', label: 'Video', icon: Video },
  { path: '/words', label: 'Từ vựng', icon: BookOpen },
  { path: '/practice', label: 'Luyện tập', icon: Gamepad2 },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on practice room pages to maximize full screen focus
  const isPracticeRoom = pathname.includes('/speaking/practice/') || pathname.includes('/video/');

  if (isPracticeRoom) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121224]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative group cursor-pointer",
                isActive
                  ? "text-primary dark:text-primary-light font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
              )}
            >
              {/* Highlight background pill for active state */}
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl -z-10 animate-fade-in scale-95" />
              )}

              <div className="relative">
                <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110", item.highlight && isActive && "text-primary")} />
                {item.highlight && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
