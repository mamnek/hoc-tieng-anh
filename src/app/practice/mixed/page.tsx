'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { shuffleArray, calculateCoins } from '@/lib/utils';
import { Word } from '@/lib/types';
import { Trophy, Coins, X, ArrowRight, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionType = 'quiz' | 'typing' | 'listening';

interface MixedQuestion {
  word: Word;
  type: QuestionType;
  options?: string[];
}

function MixedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { words, updateProgress, addSession } = useAppStore();

  const [questions, setQuestions] = useState<MixedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [score, setScore] = useState(0);
  
  // For typing/listening
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // For quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

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

    const generated = filtered.map(word => {
      const types: QuestionType[] = ['quiz', 'typing', 'listening'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let options;
      if (type === 'quiz') {
        const wrongOptions = words
          .filter(w => w.id !== word.id)
          .map(w => w.meaningVi)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options = shuffleArray([word.meaningVi, ...wrongOptions]);
      }
      
      return { word, type, options };
    });

    setQuestions(generated);
    setGameState('playing');
  }, [words, searchParams, router, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    
    if (currentQ.type === 'typing' || currentQ.type === 'listening') {
      inputRef.current?.focus();
    }
    if (currentQ.type === 'listening') {
      speakWord(currentQ.word.term);
    }
  }, [currentIndex, gameState, questions]);

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;
    if (!input.trim()) return;

    const currentWord = questions[currentIndex].word;
    const isCorrect = input.trim().toLowerCase() === currentWord.term.toLowerCase();
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    updateProgress(currentWord.id, isCorrect);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => advanceNext(), 1500);
  };

  const handleQuizSelect = (option: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const currentWord = questions[currentIndex].word;
    const isCorrect = option === currentWord.meaningVi;
    
    updateProgress(currentWord.id, isCorrect);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => advanceNext(), 1500);
  };

  const advanceNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setInput('');
      setFeedback(null);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const accuracy = Math.round((score / questions.length) * 100);
    const coins = calculateCoins('mixed', accuracy, questions.length);
    
    addSession({
      mode: 'mixed',
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
    const coins = calculateCoins('mixed', accuracy, questions.length);
    
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

  const renderQuiz = () => (
    <>
      <div className="bg-white rounded-3xl p-12 shadow-md text-center w-full min-h-[250px] flex flex-col items-center justify-center mb-8">
        <h2 className="text-5xl font-black text-gray-800 mb-4">{currentQ.word.term}</h2>
        <p className="text-xl text-gray-500 font-medium">/{currentQ.word.ipa}/</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {currentQ.options?.map((opt, idx) => {
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
              onClick={() => handleQuizSelect(opt)}
              disabled={showFeedback}
              className={cn("p-6 rounded-2xl text-lg font-semibold transition-all duration-200 text-left", btnClass)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderTyping = () => (
    <>
      <div className="bg-white rounded-3xl p-12 shadow-md text-center w-full min-h-[200px] flex flex-col items-center justify-center mb-8">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">{currentQ.word.partOfSpeech}</span>
        <h2 className="text-4xl font-bold text-gray-800">{currentQ.word.meaningVi}</h2>
      </div>
      <form onSubmit={handleInputSubmit} className="w-full relative">
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
          autoComplete="off" spellCheck="false"
        />
      </form>
      {feedback === 'wrong' && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl flex flex-col items-center">
          <p className="font-semibold">Sai rồi, đáp án đúng là:</p>
          <p className="text-3xl font-black">{currentQ.word.term}</p>
        </div>
      )}
    </>
  );

  const renderListening = () => (
    <>
      <div className="text-center mb-8">
        <button 
          onClick={() => speakWord(currentQ.word.term)}
          className="w-32 h-32 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto shadow-lg"
        >
          <Volume2 className="w-16 h-16" />
        </button>
      </div>
      <form onSubmit={handleInputSubmit} className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={feedback !== null}
          placeholder="Gõ từ bạn nghe được..."
          className={cn(
            "w-full text-center text-3xl font-bold p-6 rounded-2xl border-4 outline-none transition-colors shadow-sm",
            !feedback ? "border-transparent focus:border-blue-500 bg-white" :
            feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
          )}
          autoComplete="off" spellCheck="false"
        />
      </form>
      {feedback === 'wrong' && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl flex flex-col items-center">
          <p className="font-semibold">Sai rồi, đáp án đúng là:</p>
          <p className="text-3xl font-black">{currentQ.word.term}</p>
          <p className="text-gray-600">Nghĩa: {currentQ.word.meaningVi}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span className="capitalize text-blue-600 font-bold bg-blue-50 px-2 rounded">{currentQ.type}</span>
            <span>Câu {currentIndex + 1}/{questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {currentQ.type === 'quiz' && renderQuiz()}
        {currentQ.type === 'typing' && renderTyping()}
        {currentQ.type === 'listening' && renderListening()}
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

export default function MixedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <MixedContent />
    </Suspense>
  );
}
