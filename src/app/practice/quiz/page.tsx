'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { shuffleArray, calculateCoins } from '@/lib/utils';
import { Word } from '@/lib/types';
import { ArrowLeft, Clock, Coins, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QUIZ_TIME_LIMIT } from '@/lib/constants';

type GameState = 'setup' | 'playing' | 'result';

interface QuizQuestion {
  word: Word;
  options: string[];
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, updateProgress, addSession, getProgress, getDueWords } = useAppStore();

  const [gameState, setGameState] = useState<GameState>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

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
      alert("Không có từ vựng nào phù hợp với bộ lọc!");
      router.push('/practice');
      return;
    }

    if (order === 'random') {
      filtered = shuffleArray(filtered);
    }
    
    const selected = filtered.slice(0, count);

    const generated = selected.map(word => {
      const wrongOptions = words
        .filter(w => w.id !== word.id)
        .map(w => w.meaningVi)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      return {
        word,
        options: shuffleArray([word.meaningVi, ...wrongOptions])
      };
    });

    setQuestions(generated);
    setGameState('playing');
  }, [words, searchParams, router, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, selectedAnswer]);

  const handleTimeout = useCallback(() => {
    setSelectedAnswer(''); // empty string means timeout
    const currentQ = questions[currentIndex];
    updateProgress(currentQ.word.id, false);
    setAnswers(prev => [...prev, false]);
    
    setTimeout(() => {
      advanceNext();
    }, 1500);
  }, [questions, currentIndex, updateProgress]);

  const handleSelect = (option: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.word.meaningVi;
    
    if (isCorrect) setScore(s => s + 1);
    
    updateProgress(currentQ.word.id, isCorrect);
    setAnswers(prev => [...prev, isCorrect]);

    setTimeout(() => {
      advanceNext();
    }, 1500);
  };

  const advanceNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setTimeLeft(QUIZ_TIME_LIMIT);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const accuracy = Math.round(((score + (selectedAnswer === questions[currentIndex]?.word.meaningVi ? 1 : 0)) / questions.length) * 100);
    const coins = calculateCoins('quiz', accuracy, questions.length);
    
    addSession({
      mode: 'quiz',
      wordSetId: searchParams.get('wordSetId') || 'all',
      totalQuestions: questions.length,
      correctCount: score + (selectedAnswer === questions[currentIndex]?.word.meaningVi ? 1 : 0),
      accuracy,
      coinsEarned: coins
    });
    
    setGameState('result');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing' && selectedAnswer === null) {
        const key = e.key;
        if (['1', '2', '3', '4'].includes(key)) {
          const idx = parseInt(key) - 1;
          const options = questions[currentIndex]?.options;
          if (options && options[idx]) {
            handleSelect(options[idx]);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedAnswer, currentIndex, questions]);

  if (gameState === 'setup') return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (gameState === 'result') {
    const accuracy = Math.round((score / questions.length) * 100);
    const coins = calculateCoins('quiz', accuracy, questions.length);
    
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
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Chơi lại
            </button>
            <button 
              onClick={() => router.push('/practice')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors"
            >
              Quay về
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span>Câu {currentIndex + 1}/{questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-orange-500 font-bold w-20 justify-end">
          <Clock className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full gap-8">
        <div className="bg-white rounded-3xl p-12 shadow-md text-center w-full min-h-[250px] flex flex-col items-center justify-center">
          <h2 className="text-5xl font-black text-gray-800 mb-4">{currentQ.word.term}</h2>
          <p className="text-xl text-gray-500 font-medium">/{currentQ.word.ipa}/</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQ.options.map((opt, idx) => {
            const isCorrectAnswer = opt === currentQ.word.meaningVi;
            const isSelected = selectedAnswer === opt;
            const showFeedback = selectedAnswer !== null;
            
            let btnClass = "bg-white hover:bg-blue-50 border-2 border-transparent shadow-sm";
            if (showFeedback) {
              if (isCorrectAnswer) btnClass = "bg-green-50 border-green-500 text-green-700";
              else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-700 shake";
              else btnClass = "bg-white opacity-50 cursor-not-allowed";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={showFeedback}
                className={cn(
                  "p-6 rounded-2xl text-lg font-semibold transition-all duration-200 flex items-center gap-4 text-left",
                  btnClass
                )}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        .shake { animation: shake 0.5s; }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <QuizContent />
    </Suspense>
  );
}
