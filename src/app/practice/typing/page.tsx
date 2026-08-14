'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { shuffleArray, calculateCoins } from '@/lib/utils';
import { Word } from '@/lib/types';
import { Trophy, Coins, X, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function TypingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, updateProgress, addSession } = useAppStore();

  const [questions, setQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameState !== 'setup') return;

    const count = parseInt(searchParams.get('count') || '10', 10);
    let filtered = shuffleArray([...words]).slice(0, count);

    if (filtered.length === 0) {
      alert("Không đủ từ vựng!");
      router.push('/practice');
      return;
    }

    setQuestions(filtered);
    setGameState('playing');
  }, [words, searchParams, router, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !feedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, gameState, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;
    if (!input.trim()) return;

    const currentWord = questions[currentIndex];
    const isCorrect = input.trim().toLowerCase() === currentWord.term.toLowerCase();
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    updateProgress(currentWord.id, isCorrect);
    
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      advanceNext();
    }, 1500);
  };

  const advanceNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setInput('');
      setFeedback(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const accuracy = Math.round((score / questions.length) * 100);
    const coins = calculateCoins('typing', accuracy, questions.length);
    
    addSession({
      mode: 'typing',
      wordSetId: searchParams.get('wordSetId') || 'all',
      totalQuestions: questions.length,
      correctCount: score,
      accuracy,
      coinsEarned: coins
    });
    
    setGameState('result');
  };

  if (gameState === 'setup') return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (gameState === 'result') {
    const accuracy = Math.round((score / questions.length) * 100);
    const coins = calculateCoins('typing', accuracy, questions.length);
    
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
              <p className="text-gray-500 mb-1">Đúng</p>
              <p className="text-2xl font-bold text-gray-800">{score}/{questions.length}</p>
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

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span>Từ {currentIndex + 1}/{questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full gap-8">
        <div className="bg-white rounded-3xl p-12 shadow-md text-center w-full min-h-[200px] flex flex-col items-center justify-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">{currentQ.partOfSpeech}</span>
          <h2 className="text-4xl font-bold text-gray-800">{currentQ.meaningVi}</h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={feedback !== null}
            placeholder="Gõ từ tiếng Anh..."
            className={cn(
              "w-full text-center text-3xl font-bold p-6 rounded-2xl border-4 outline-none transition-colors shadow-sm",
              !feedback ? "border-transparent focus:border-blue-500 bg-white" :
              feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
            )}
            autoComplete="off"
            spellCheck="false"
          />
          {!feedback && (
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </form>

        {feedback === 'wrong' && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <p className="font-semibold flex items-center gap-2"><XCircle className="w-5 h-5"/> Sai rồi, đáp án đúng là:</p>
            <p className="text-3xl font-black">{currentQ.term}</p>
          </div>
        )}
        
        {feedback === 'correct' && (
          <div className="text-green-600 flex items-center gap-2 font-bold text-xl animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-8 h-8" /> Chính xác!
          </div>
        )}
      </div>
    </div>
  );
}

export default function TypingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <TypingContent />
    </Suspense>
  );
}
