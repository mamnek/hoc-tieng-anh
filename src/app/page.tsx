'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { EXAM_TYPES } from '@/lib/constants';
import { presetWordSets, presetWords } from '@/lib/preset-data';
import { cn, getStreakDays } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  TrendingUp,
  Plus,
  Gamepad2,
  Map,
  Trophy,
  Copy,
  Eye,
  X
} from 'lucide-react';

export default function Dashboard() {
  const { user, words, copyPresetWordSet, getProgress } = useAppStore();
  const [selectedExamType, setSelectedExamType] = useState('IELTS');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSetId, setPreviewSetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  // Compute stats
  const totalWords = words?.length || 0;
  const masteredCount = words?.filter(w => getProgress(w.id)?.isMastered).length || 0;
  const notMasteredCount = totalWords - masteredCount;
  const progressPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  
  // Try to get streak days from utils, fallback to mock if it's undefined
  const rawStreakDays = typeof getStreakDays === 'function' && user ? getStreakDays(user.lastActiveDate, user.streakCount) : [false, false, false, true, false, false, false];
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const streakDays = dayLabels.map((label, idx) => ({
    label,
    active: rawStreakDays[idx],
    today: idx === (new Date().getDay() + 6) % 7
  }));
  
  const currentStreak = streakDays.filter(d => d.active).length;

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleCopy = (setId: string) => {
    if (copyPresetWordSet) {
      copyPresetWordSet(setId);
      showToast('Đã sao chép bộ từ vựng vào danh sách của bạn!');
    }
  };

  const filteredSets = presetWordSets?.filter(set => set.examType === selectedExamType) || [];
  const previewWords = previewSetId ? presetWords?.filter(w => w.wordSetId === previewSetId) : [];
  const previewSetName = previewSetId ? presetWordSets?.find(s => s.id === previewSetId)?.category : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          {toast.message}
        </div>
      )}

      {/* 1. Welcome Banner */}
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-lg overflow-hidden flex items-center justify-between">
        <div className="relative z-10 text-white space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, {user?.name || 'Học viên'}! 👋</h1>
          <p className="text-indigo-100 text-lg">Hãy tiếp tục hành trình học từ vựng của bạn</p>
        </div>
        <div className="hidden md:block relative z-10 opacity-90">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-l-[#22C55E] flex items-center space-x-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-6 h-6 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Đã thuộc</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{masteredCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-l-[#F97316] flex items-center space-x-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <XCircle className="w-6 h-6 text-[#F97316]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chưa thuộc</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notMasteredCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-l-[#3B82F6] flex items-center space-x-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <BookOpen className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng từ</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWords}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-l-[#6C5CE7] flex items-center space-x-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <TrendingUp className="w-6 h-6 text-[#6C5CE7]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tiến độ</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercent}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Streak Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-md p-6 text-white flex flex-col justify-between h-full transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl">
                <span className="text-3xl">🔥</span>
              </div>
              <div>
                <p className="text-orange-100 font-medium">Chuỗi học tập</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold">{currentStreak}</span>
                  <span className="text-orange-100">ngày liên tiếp</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-black/10 p-4 rounded-xl">
              {streakDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-medium text-orange-100">{day.label}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                    day.active ? "bg-white text-orange-500 font-bold shadow-sm" : "bg-black/10 text-orange-100/50",
                    day.today && !day.active && "border-2 border-white/50 text-white",
                    day.today && day.active && "ring-4 ring-white/30"
                  )}>
                    {day.active && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Quick Access */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            <Link href="/words" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03]">
              <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Thêm từ mới</h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Plus className="w-32 h-32" />
              </div>
            </Link>

            <Link href="/practice" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03]">
              <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Luyện tập</h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Gamepad2 className="w-32 h-32" />
              </div>
            </Link>

            <Link href="/roadmap" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03]">
              <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <Map className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Lộ trình học</h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Map className="w-32 h-32" />
              </div>
            </Link>

            <Link href="/leaderboard" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03]">
              <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Xếp hạng</h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Trophy className="w-32 h-32" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Preset Word Sets */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bộ từ vựng có sẵn</h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {EXAM_TYPES?.map(exam => (
              <button
                key={exam}
                onClick={() => setSelectedExamType(exam)}
                className={cn(
                  "px-6 py-2 rounded-md font-medium text-sm transition-all duration-200",
                  selectedExamType === exam 
                    ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSets.map(set => (
            <div key={set.id} className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all duration-300 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{set.category}</h3>
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {set.wordCount} từ
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{set.name}</p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setPreviewSetId(set.id);
                    setPreviewModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem</span>
                </button>
                <button
                  onClick={() => handleCopy(set.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>
          ))}
          {filteredSets.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              Chưa có bộ từ vựng nào cho loại kỳ thi này.
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết bộ từ</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{previewSetName}</p>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewWords?.map((word, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{word.term}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">({word.partOfSpeech})</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{word.meaningVi}</p>
                      {word.ipa && (
                        <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-1">{word.ipa}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!previewWords || previewWords.length === 0) && (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    Không tìm thấy từ vựng nào trong bộ này.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-4">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (previewSetId) handleCopy(previewSetId);
                  setPreviewModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Sao chép tất cả</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
