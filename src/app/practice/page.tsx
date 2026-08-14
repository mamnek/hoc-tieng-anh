'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, CircleHelp, Link as LinkIcon, Keyboard, Headphones, Shuffle, Play } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { GAME_MODES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function PracticeHub() {
  const router = useRouter();
  const { wordSets, sessions, words, getDueWords } = useAppStore();
  
  const [selectedWordSet, setSelectedWordSet] = useState<string>('all');
  const [filter, setFilter] = useState<string>('all');
  const [order, setOrder] = useState<string>('random');
  const [count, setCount] = useState<string>('10');

  const srsWordsCount = getDueWords().length;

  const handleStartGame = (modeId: string) => {
    const params = new URLSearchParams({
      wordSetId: selectedWordSet,
      filter,
      order,
      count
    });
    router.push(`/practice/${modeId}?${params.toString()}`);
  };

  const icons: Record<string, React.ReactNode> = {
    flashcard: <Layers className="w-8 h-8" />,
    quiz: <CircleHelp className="w-8 h-8" />,
    matching: <LinkIcon className="w-8 h-8" />,
    typing: <Keyboard className="w-8 h-8" />,
    listening: <Headphones className="w-8 h-8" />,
    mixed: <Shuffle className="w-8 h-8" />
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Luyện tập & Ôn tập</h1>

      {/* SRS Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-10 shadow-lg flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Ôn tập ngắt quãng (SRS)
            <span className="bg-white text-purple-600 text-sm py-1 px-3 rounded-full font-semibold">
              {srsWordsCount} từ cần ôn
            </span>
          </h2>
          <p className="text-purple-100">
            Hệ thống tự động nhắc lại các từ vựng bạn sắp quên. Học ít, nhớ lâu!
          </p>
        </div>
        <button 
          onClick={() => router.push('/practice/flashcard?filter=srs')}
          disabled={srsWordsCount === 0}
          className="mt-4 md:mt-0 bg-white text-purple-600 hover:bg-gray-50 font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          Bắt đầu ôn tập
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bộ từ vựng</label>
          <select 
            value={selectedWordSet}
            onChange={(e) => setSelectedWordSet(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2"
          >
            <option value="all">Tất cả</option>
            {wordSets.map(set => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bộ lọc</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2"
          >
            <option value="all">Tất cả</option>
            <option value="unlearned">Chưa thuộc</option>
            <option value="learned">Đã thuộc</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
          <select 
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2"
          >
            <option value="random">Ngẫu nhiên</option>
            <option value="sequential">Tuần tự</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
          <select 
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2"
          >
            <option value="10">10 từ</option>
            <option value="20">20 từ</option>
            <option value="50">50 từ</option>
          </select>
        </div>
      </div>

      {/* Game Modes Grid */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">Chế độ chơi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {GAME_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleStartGame(mode.id)}
            className={cn(
              "relative text-left p-6 rounded-2xl text-white overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl bg-gradient-to-br shadow-lg cursor-pointer border border-white/10 opacity-100",
              mode.bgGradient
            )}
          >
            {/* Subtle light overlay on hover */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {mode.hot && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider animate-pulse">
                HOT
              </span>
            )}
            
            <div className="mb-4 text-white p-3 bg-white/15 backdrop-blur-md rounded-xl w-fit">
              {icons[mode.id]}
            </div>
            
            <h4 className="text-xl font-bold mb-1 text-white opacity-100">{mode.name}</h4>
            <p className="text-white/90 text-sm mb-4 line-clamp-2 font-medium">
              {mode.description}
            </p>
            
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-sm font-bold text-white shadow-inner">
              +{mode.coins} xu
            </div>
          </button>
        ))}
      </div>

      {/* Practice History */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Lịch sử luyện tập</h3>
        {sessions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            Chưa có dữ liệu luyện tập. Hãy bắt đầu một trò chơi!
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {sessions.slice(0, 10).map((session: import('@/lib/types').PracticeSession, i) => {
                const mode = GAME_MODES.find(m => m.id === session.mode);
                return (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg text-white", mode?.color || "bg-gray-500")}>
                        {mode ? icons[mode.id] : <CircleHelp className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{mode?.name || session.mode}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.playedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{session.accuracy}%</p>
                      <p className="text-sm text-yellow-600 font-medium">+{session.coinsEarned} xu</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
