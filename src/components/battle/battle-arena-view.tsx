'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BattlePlayer, BattleQuestion, BattleRoundResult } from '@/lib/types';
import { battleSounds } from '@/lib/socket-battle';
import {
  Flame,
  Swords,
  Clock,
  Send,
  Sparkles,
  Zap,
  Volume2,
  Smile,
  LogOut,
} from 'lucide-react';

interface BattleArenaViewProps {
  roomCode: string;
  players: Record<string, BattlePlayer>;
  currentQuestion: BattleQuestion | null;
  roundResult: BattleRoundResult | null;
  currentUserId: string;
  onAnswerSubmit: (answer: string) => void;
  onSendEmoji: (emoji: string) => void;
  onLeaveRoom: () => void;
  floatingEmojis: { id: string; senderName: string; emoji: string }[];
}

export function BattleArenaView({
  roomCode,
  players,
  currentQuestion,
  roundResult,
  currentUserId,
  onAnswerSubmit,
  onSendEmoji,
  onLeaveRoom,
  floatingEmojis,
}: BattleArenaViewProps) {
  const [inputAnswer, setInputAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const playerKeys = Object.keys(players);
  const userKey = playerKeys.find((k) => k === currentUserId) || playerKeys[0] || 'user';
  const opponentKey = playerKeys.find((k) => k !== userKey) || playerKeys[1] || 'bot';

  const userPlayer: BattlePlayer = players[userKey] || {
    id: userKey,
    username: 'Bạn',
    hp: 100,
    score: 0,
    combo: 0,
    isReady: true,
    streak: 0,
  };

  const opponentPlayer: BattlePlayer = players[opponentKey] || {
    id: opponentKey,
    username: 'Đối Thủ',
    avatar: '🤖',
    hp: 100,
    score: 0,
    combo: 0,
    isReady: true,
    isBot: true,
    streak: 0,
  };

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion) return;
    setInputAnswer('');
    setTimeLeft(currentQuestion.timeLimit || 10);
    inputRef.current?.focus();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        if (prev <= 4) battleSounds.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion?.roundId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim() || !currentQuestion) return;
    onAnswerSubmit(inputAnswer.trim());
    setInputAnswer('');
  };

  const handleOptionClick = (optionText: string) => {
    if (!currentQuestion) return;
    onAnswerSubmit(optionText);
  };

  const handlePlayTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const emojiList = ['🔥', '⚡', '😎', '💀', '🏆', '👏', '😱', '🎯'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative">
      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 text-white px-3 py-1.5 rounded-full shadow-2xl animate-bounce text-sm font-bold border border-white/20"
          >
            <span>{item.senderName}:</span>
            <span className="text-2xl">{item.emoji}</span>
          </div>
        ))}
      </div>

      {/* Top Header: Room Code & Leave button */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 dark:bg-purple-950/60 text-primary font-bold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <Swords className="w-3.5 h-3.5" />
            PHÒNG: <strong>{roomCode}</strong>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Hiệp {currentQuestion?.roundId || 1}
          </span>
        </div>

        <button
          onClick={onLeaveRoom}
          className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-bold flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Rời trận
        </button>
      </div>

      {/* ──────────────── 1v1 Players Status Bar ──────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-r from-purple-900/90 via-indigo-950/90 to-purple-950/90 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/10 hidden sm:block" />

        {/* User (Player 1) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{userPlayer.avatar || '👤'}</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-purple-200 block truncate max-w-[120px]">
                  {userPlayer.username} (Bạn)
                </span>
                <span className="text-xs text-purple-300 font-semibold">
                  {userPlayer.score} Điểm
                </span>
              </div>
            </div>

            {userPlayer.combo > 1 && (
              <div className="flex items-center gap-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400/30 animate-pulse">
                <Flame className="w-3 h-3 text-amber-400" />
                x{userPlayer.combo}
              </div>
            )}
          </div>

          {/* HP Bar Player 1 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-400">HP {userPlayer.hp}/100</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${userPlayer.hp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Opponent / Bot (Player 2) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{opponentPlayer.avatar || '🤖'}</span>
              <div>
                <span className="font-bold text-sm sm:text-base text-pink-200 block truncate max-w-[120px]">
                  {opponentPlayer.username}
                </span>
                <span className="text-xs text-pink-300 font-semibold">
                  {opponentPlayer.score} Điểm
                </span>
              </div>
            </div>

            {opponentPlayer.combo > 1 && (
              <div className="flex items-center gap-0.5 bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full border border-red-400/30 animate-pulse">
                <Flame className="w-3 h-3 text-red-400" />
                x{opponentPlayer.combo}
              </div>
            )}
          </div>

          {/* HP Bar Player 2 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-pink-400">HP {opponentPlayer.hp}/100</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${opponentPlayer.hp}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── Main Question Card ──────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Timer Badge */}
        <div className="flex items-center justify-center">
          <div
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-sm transition-all ${
              timeLeft <= 3
                ? 'bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/30'
                : 'bg-purple-100 dark:bg-purple-950/60 text-primary border border-purple-200 dark:border-purple-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            00:0{timeLeft}s
          </div>
        </div>

        {/* Vietnamese Meaning Prompt */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Dịch từ này sang tiếng Anh:
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {currentQuestion?.wordVi || 'Đang tải câu hỏi...'}
          </h2>

          {/* Word Length Hint */}
          {currentQuestion?.hiddenEn && (
            <p className="text-lg sm:text-2xl font-mono tracking-widest text-primary font-bold pt-1">
              {currentQuestion.hiddenEn}
            </p>
          )}

          {/* Context Hint */}
          {currentQuestion?.hint && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto italic pt-2">
              💡 {currentQuestion.hint}
            </p>
          )}
        </div>

        {/* Previous Round Feedback if available */}
        {roundResult && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm flex items-center justify-between px-4 animate-fade-in">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Đáp án vòng trước: <strong className="text-primary">{roundResult.correctAnswer}</strong>
            </span>
            <button
              onClick={() => handlePlayTTS(roundResult.correctAnswer.split(' ')[0])}
              className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Nghe phát âm
            </button>
          </div>
        )}

        {/* Multiple Choice Options (If applicable) */}
        {currentQuestion?.options && currentQuestion.options.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className="bg-gray-50 hover:bg-purple-50 dark:bg-gray-750 dark:hover:bg-purple-950/50 text-gray-800 dark:text-gray-200 hover:text-primary font-bold py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 transition-all cursor-pointer text-sm shadow-xs"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Box */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto pt-2">
          <input
            ref={inputRef}
            type="text"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            placeholder="Gõ từ tiếng Anh rồi nhấn Enter..."
            className="flex-1 px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-inner text-center sm:text-left text-base"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Emoji Reaction Wheel */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Smile className="w-3.5 h-3.5" /> Thả biểu cảm:
          </span>
          <div className="flex items-center gap-1.5">
            {emojiList.map((em, idx) => (
              <button
                key={idx}
                onClick={() => onSendEmoji(em)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:scale-125 transition-all flex items-center justify-center text-base cursor-pointer shadow-xs"
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
