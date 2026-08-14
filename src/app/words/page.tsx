'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PART_OF_SPEECH_OPTIONS } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  Volume2,
  MoreVertical,
  BookOpen,
  CheckCircle,
  Clock,
  Percent,
  Sparkles,
  Download,
  Trash2,
  Edit
} from 'lucide-react';
import AddWordModal from '@/components/words/add-word-modal';
import AiWordModal from '@/components/words/ai-word-modal';

function WordsContent() {
  const searchParams = useSearchParams();
  const paramSetId = searchParams.get('wordSetId') || searchParams.get('setId') || 'all';

  const { words, wordSets, toggleMastered, deleteWord, getProgress } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetId, setSelectedSetId] = useState(paramSetId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (paramSetId) {
      setSelectedSetId(paramSetId);
    }
  }, [paramSetId]);
  
  const wordsPerPage = 20;

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch =
        word.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaningVi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSet = selectedSetId === 'all' || word.wordSetId === selectedSetId;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'mastered' && getProgress(word.id)?.isMastered) ||
        (statusFilter === 'learning' && !getProgress(word.id)?.isMastered);
      return matchesSearch && matchesSet && matchesStatus;
    });
  }, [words, searchQuery, selectedSetId, statusFilter, getProgress]);

  const totalWords = words.length;
  const masteredWords = words.filter(w => getProgress(w.id)?.isMastered).length;
  const learningWords = totalWords - masteredWords;
  const masterRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
  const paginatedWords = filteredWords.slice((currentPage - 1) * wordsPerPage, currentPage * wordsPerPage);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPosColor = (pos: string) => {
    const posColors: Record<string, string> = {
      noun: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      verb: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      adjective: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      adverb: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      preposition: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      conjunction: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pronoun: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      phrase: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    };
    return posColors[pos] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWords}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tổng số từ</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{masteredWords}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Đã thành thạo</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{learningWords}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Đang học</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{masterRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tỷ lệ thuộc</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Set Filter */}
          <select
            value={selectedSetId}
            onChange={(e) => {
              setSelectedSetId(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả bộ từ vựng</option>
            {wordSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name} ({set.isPreset ? 'Có sẵn' : 'Tự tạo'})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="learning">Đang học</option>
            <option value="mastered">Đã thuộc</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            + Tạo với AI
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Thêm từ
          </button>
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        {paginatedWords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Không tìm thấy từ vựng nào</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hãy thử tìm kiếm từ khác hoặc thêm từ mới vào bộ từ vựng này.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm từ vựng ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold">
                  <th className="p-4">Từ vựng & Phát âm</th>
                  <th className="p-4">Nghĩa tiếng Việt</th>
                  <th className="p-4">Loại từ</th>
                  <th className="p-4">Ví dụ</th>
                  <th className="p-4 text-center">Thuộc</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {paginatedWords.map((word) => {
                  const isMastered = getProgress(word.id)?.isMastered;
                  return (
                    <tr key={word.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => speak(word.term)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            title="Phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <div>
                            <p className="font-bold text-base text-gray-900 dark:text-white">{word.term}</p>
                            {word.ipa && (
                              <p className="text-xs text-gray-400 font-mono">{word.ipa}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                        {word.meaningVi}
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getPosColor(word.partOfSpeech))}>
                          {word.partOfSpeech}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        {word.exampleEn ? (
                          <div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{word.exampleEn}</p>
                            <p className="text-xs text-gray-400 italic mt-0.5">{word.exampleVi}</p>
                          </div>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={!!isMastered}
                          onChange={() => toggleMastered(word.id)}
                          className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa từ "${word.term}"?`)) {
                              deleteWord(word.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Xóa từ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Trang trước
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddWordModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <AiWordModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </div>
  );
}

export default function WordsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500 font-medium">Đang tải từ vựng...</div>}>
      <WordsContent />
    </Suspense>
  );
}
