'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { shuffleArray, calculateCoins } from '@/lib/utils';
import { Word } from '@/lib/types';
import { Trophy, Coins, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchItem {
  id: string;
  wordId: string;
  content: string;
  type: 'term' | 'meaning';
}

function MatchingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, updateProgress, addSession } = useAppStore();

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<[string, string] | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    if (gameState !== 'setup') return;

    const count = parseInt(searchParams.get('count') || '10', 10);
    // matching gets up to 8 at a time on screen, but total pool can be up to count
    let filtered = shuffleArray([...words]).slice(0, Math.min(count, 8)); // Let's keep it simple: 1 round of max 8
    
    if (filtered.length === 0) {
      alert("Không đủ từ vựng!");
      router.push('/practice');
      return;
    }

    setTotalWords(filtered.length);
    
    const newItems: MatchItem[] = [];
    filtered.forEach(w => {
      newItems.push({ id: `t-${w.id}`, wordId: w.id, content: w.term, type: 'term' });
      newItems.push({ id: `m-${w.id}`, wordId: w.id, content: w.meaningVi, type: 'meaning' });
    });

    setItems(shuffleArray(newItems));
    setStartTime(Date.now());
    setGameState('playing');
  }, [words, searchParams, router, gameState]);

  const handleSelect = (item: MatchItem) => {
    if (matchedIds.has(item.id) || wrongMatch) return;

    if (!selectedId) {
      setSelectedId(item.id);
      return;
    }

    if (selectedId === item.id) {
      setSelectedId(null);
      return;
    }

    const firstItem = items.find(i => i.id === selectedId)!;
    
    if (firstItem.wordId === item.wordId && firstItem.type !== item.type) {
      // Match
      setMatchedIds(prev => new Set(prev).add(firstItem.id).add(item.id));
      setSelectedId(null);
      updateProgress(firstItem.wordId, true);
      
      if (matchedIds.size + 2 === items.length) {
        setTimeout(() => finishGame(), 500);
      }
    } else {
      // Wrong
      setWrongMatch([firstItem.id, item.id]);
      setMistakes(m => m + 1);
      updateProgress(firstItem.wordId, false);
      updateProgress(item.wordId, false);
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedId(null);
      }, 500);
    }
  };

  const finishGame = () => {
    const accuracy = Math.max(0, Math.round(((totalWords - mistakes) / totalWords) * 100));
    const coins = calculateCoins('matching', accuracy, totalWords);
    
    addSession({
      mode: 'matching',
      wordSetId: searchParams.get('wordSetId') || 'all',
      totalQuestions: totalWords,
      correctCount: totalWords - mistakes > 0 ? totalWords - mistakes : 0,
      accuracy,
      coinsEarned: coins
    });
    
    setGameState('result');
  };

  if (gameState === 'setup') return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (gameState === 'result') {
    const accuracy = Math.max(0, Math.round(((totalWords - mistakes) / totalWords) * 100));
    const coins = calculateCoins('matching', accuracy, totalWords);
    
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
          <div className="flex justify-center items-baseline gap-2 mb-8">
            <span className={cn("text-5xl font-black", accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-orange-500" : "text-red-500")}>
              {accuracy}%
            </span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4 mb-8">
            <div className="text-center">
              <p className="text-gray-500 mb-1">Lỗi sai</p>
              <p className="text-2xl font-bold text-red-500">{mistakes}</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-gray-500 mb-1">Thưởng</p>
              <p className="text-2xl font-bold text-yellow-500 flex items-center gap-1 justify-center">
                +{coins} <Coins className="w-5 h-5" />
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Chơi lại</button>
            <button onClick={() => router.push('/practice')} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl">Quay về</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 text-center font-bold text-gray-700">Nối từ vựng</div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {items.map(item => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedId === item.id;
            const isWrong = wrongMatch?.includes(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                disabled={isMatched}
                className={cn(
                  "p-6 rounded-2xl text-lg font-semibold shadow-sm transition-all duration-300 flex items-center justify-center text-center min-h-[100px]",
                  isMatched ? "opacity-0 invisible" : "bg-white hover:bg-blue-50 text-gray-800",
                  isSelected && "ring-2 ring-blue-500 bg-blue-50",
                  isWrong && "ring-2 ring-red-500 bg-red-50 shake text-red-700"
                )}
              >
                {item.content}
              </button>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        .shake { animation: shake 0.4s; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}} />
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <MatchingContent />
    </Suspense>
  );
}
