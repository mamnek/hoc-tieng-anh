'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { shuffleArray, calculateCoins } from '@/lib/utils';
import { Word } from '@/lib/types';
import { Trophy, Coins, X, Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function FlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, updateProgress, addSession, getProgress, getDueWords } = useAppStore();

  const [cards, setCards] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (gameState !== 'setup') return;

    const wordSetId = searchParams.get('wordSetId') || 'all';
    const filter = searchParams.get('filter') || 'all';
    const order = searchParams.get('order') || 'random';
    const count = parseInt(searchParams.get('count') || '10', 10);

    let filtered = [...words];
    if (wordSetId !== 'all') filtered = filtered.filter(w => w.wordSetId === wordSetId);
    if (filter === 'unlearned') filtered = filtered.filter(w => (getProgress(w.id)?.srsLevel || 0) === 0);
    if (filter === 'learned') filtered = filtered.filter(w => (getProgress(w.id)?.srsLevel || 0) > 0);
    if (filter === 'srs') {
      const dueWordIds = getDueWords(wordSetId !== 'all' ? wordSetId : undefined).map(w => w.id);
      filtered = filtered.filter(w => dueWordIds.includes(w.id));
    }

    if (filtered.length === 0) {
      alert("Không có từ vựng nào phù hợp!");
      router.push('/practice');
      return;
    }

    if (order === 'random') {
      filtered = shuffleArray(filtered);
    }
    
    setCards(filtered.slice(0, count));
    setGameState('playing');
  }, [words, searchParams, router, gameState]);

  const handleResult = (isCorrect: boolean) => {
    const currentWord = cards[currentIndex];
    updateProgress(currentWord.id, isCorrect);
    
    if (isCorrect) setCorrectCount(c => c + 1);
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        finishGame(isCorrect);
      }
    }, 150);
  };

  const finishGame = (lastCorrect: boolean) => {
    const finalCorrect = correctCount + (lastCorrect ? 1 : 0);
    const accuracy = Math.round((finalCorrect / cards.length) * 100);
    const coins = calculateCoins('flashcard', accuracy, cards.length);
    
    addSession({
      mode: 'flashcard',
      wordSetId: searchParams.get('wordSetId') || 'all',
      totalQuestions: cards.length,
      correctCount: finalCorrect,
      accuracy,
      coinsEarned: coins
    });
    
    setGameState('result');
  };

  if (gameState === 'setup') return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (gameState === 'result') {
    const accuracy = Math.round((correctCount / cards.length) * 100);
    const coins = calculateCoins('flashcard', accuracy, cards.length);
    
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
              <p className="text-gray-500 mb-1">Đã nhớ</p>
              <p className="text-2xl font-bold text-gray-800">{correctCount}/{cards.length}</p>
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

  const currentWord = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span>Thẻ {currentIndex + 1}/{cards.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIndex) / cards.length) * 100}%` }} />
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md perspective-1000 h-[400px] mb-8 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={cn("w-full h-full relative preserve-3d transition-transform duration-500", isFlipped && "rotate-y-180")}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-5xl font-black text-gray-800 mb-4">{currentWord.term}</h2>
              <p className="text-xl text-gray-500">/{currentWord.ipa}/</p>
              <p className="text-sm text-gray-400 mt-8 absolute bottom-6">Chạm để lật</p>
            </div>
            
            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-8 text-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">{currentWord.partOfSpeech}</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentWord.meaningVi}</h2>
              {currentWord.exampleEn && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl w-full">
                  <p className="text-gray-600 italic">"{currentWord.exampleEn}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={(e) => { e.stopPropagation(); handleResult(false); }}
            className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-6 h-6" />
            Chưa nhớ
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleResult(true); }}
            className="flex-1 bg-white border-2 border-green-100 text-green-500 hover:bg-green-50 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Check className="w-6 h-6" />
            Đã nhớ
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <FlashcardContent />
    </Suspense>
  );
}
