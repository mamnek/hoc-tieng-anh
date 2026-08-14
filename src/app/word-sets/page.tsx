'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Folder, Plus, Star, Trash2, Eye, Play, Search, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function WordSetsPage() {
  const { wordSets, words, user, progress, deleteWordSet, addWordSet } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'custom' | 'preset'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetCategory, setNewSetCategory] = useState('');
  const [newSetExamType, setNewSetExamType] = useState<'IELTS' | 'TOEIC' | 'SAT' | 'THPT' | 'Custom'>('Custom');

  const filteredSets = useMemo(() => {
    return wordSets.filter((set) => {
      if (filter === 'custom') return !set.isPreset;
      if (filter === 'preset') return set.isPreset;
      return true;
    });
  }, [wordSets, filter]);

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim()) return;

    addWordSet({
      name: newSetName,
      category: newSetCategory || 'General',
      isPreset: false,
      examType: newSetExamType,
    });

    setNewSetName('');
    setNewSetCategory('');
    setNewSetExamType('Custom');
    setIsCreateModalOpen(false);
  };

  const getWordCount = (setId: string) => words.filter(w => w.wordSetId === setId).length;
  const getMasteryPercentage = (setId: string) => {
    const setWords = words.filter(w => w.wordSetId === setId);
    if (setWords.length === 0) return 0;
    const masteredWords = setWords.filter(w => {
      const p = progress.find(prog => prog.wordId === w.id);
      return p?.isMastered === true;
    });
    return Math.round((masteredWords.length / setWords.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="w-8 h-8 text-primary" />
            Bộ từ vựng của bạn
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Quản lý và học theo các chủ đề từ vựng
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo bộ mới
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-8">
        {(['all', 'custom', 'preset'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all",
              filter === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            {tab === 'all' && 'Tất cả'}
            {tab === 'custom' && 'Tự tạo'}
            {tab === 'preset' && 'Có sẵn'}
          </button>
        ))}
      </div>

      {filteredSets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <Folder className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Chưa có bộ từ vựng nào</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bạn chưa tạo hoặc lưu bộ từ vựng nào trong danh mục này.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2 rounded-xl font-medium transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Tạo bộ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => {
            const wordCount = getWordCount(set.id);
            const mastery = getMasteryPercentage(set.id);

            return (
              <div
                key={set.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col h-full relative group"
              >
                {set.isPreset && (
                  <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Có sẵn
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4 pr-16">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <Folder className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                      {set.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                        {set.category}
                      </span>
                      {set.examType && (
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
                          {set.examType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-500 dark:text-gray-400">
                      <span>{wordCount} từ vựng</span>
                      <span>{mastery}% thuộc</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${mastery}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/practice?wordSetId=${set.id}`}
                      className="flex-1 bg-primary text-white flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Play className="w-4 h-4 fill-current" /> Học
                    </Link>
                    <Link
                      href={`/words?setId=${set.id}`}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" /> Xem
                    </Link>
                    {!set.isPreset && (
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa bộ từ này?')) {
                            deleteWordSet(set.id);
                          }
                        }}
                        className="px-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center justify-center"
                        title="Xóa bộ từ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo bộ từ mới</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên bộ từ *
                </label>
                <input
                  type="text"
                  required
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="VD: Từ vựng hàng ngày"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại kỳ thi
                </label>
                <select
                  value={newSetExamType}
                  onChange={(e) => setNewSetExamType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                >
                  <option value="Custom">Khác / Tự do</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="SAT">SAT</option>
                  <option value="THPT">THPT Quốc gia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={newSetCategory}
                  onChange={(e) => setNewSetCategory(e.target.value)}
                  placeholder="VD: Kinh tế, Giải trí..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newSetName.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
