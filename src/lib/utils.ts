import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateStr);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getStreakDays(lastActiveDate: string, currentStreak: number): boolean[] {
  // Returns array of 7 booleans for Mon-Sun, representing if user studied that day this week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const result: boolean[] = new Array(7).fill(false);
  
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Fill in streak days backwards from today
  for (let i = 0; i < Math.min(currentStreak, 7); i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const idx = (checkDate.getDay() + 6) % 7; // Convert Sun=0 to Mon=0
    result[idx] = true;
  }
  
  return result;
}

export function calculateCoins(mode: string, accuracy: number, totalQuestions: number): number {
  const baseCoins: Record<string, number> = {
    flashcard: 5,
    quiz: 10,
    matching: 10,
    typing: 10,
    listening: 15,
    mixed: 20,
  };
  const base = baseCoins[mode] || 5;
  return Math.round(base * (accuracy / 100) * Math.min(totalQuestions / 10, 2));
}
