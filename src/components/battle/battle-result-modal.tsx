'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BattleGameOver } from '@/lib/types';
import { Trophy, Coins, Zap, RotateCcw, ArrowRight, Skull, Award } from 'lucide-react';

interface BattleResultModalProps {
  result: BattleGameOver;
  currentUserId: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function BattleResultModal({
  result,
  currentUserId,
  onPlayAgain,
  onBackToLobby,
}: BattleResultModalProps) {
  const isWinner = result.winnerId === currentUserId;
  const isDraw = result.isDraw;

  useEffect(() => {
    if (isWinner) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-900/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow Header */}
        <div
          className={`absolute top-0 left-0 right-0 h-32 opacity-20 -z-10 ${
            isWinner
              ? 'bg-gradient-to-b from-amber-400 to-transparent'
              : isDraw
              ? 'bg-gradient-to-b from-blue-500 to-transparent'
              : 'bg-gradient-to-b from-red-500 to-transparent'
          }`}
        />

        {/* Icon & Title */}
        <div className="space-y-2 pt-2">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/60 dark:to-indigo-950/60 shadow-inner">
            {isWinner ? (
              <Trophy className="w-14 h-14 text-amber-500 animate-bounce" />
            ) : isDraw ? (
              <Award className="w-14 h-14 text-blue-500" />
            ) : (
              <Skull className="w-14 h-14 text-red-500 animate-pulse" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isWinner ? 'CHIẾN THẮNG TUYỆT ĐỐI!' : isDraw ? 'TRẬN ĐẤU BẤT PHÂN THẮNG BẠI!' : 'BẠN ĐÃ THUA TRẬN!'}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isWinner
              ? `Xuất sắc hạ gục đối thủ sau ${result.roundsPlayed} hiệp đấu!`
              : isDraw
              ? 'Hai đấu thủ ngang tài ngang sức!'
              : 'Đừng nản chí! Luyện thêm từ vựng để phục thù.'}
          </p>
        </div>

        {/* Reward Badges */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-black text-amber-600 dark:text-amber-400 text-base">
              +{result.coinsGained} Xu
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200/50">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-black text-primary text-base">
              +{result.expGained} EXP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Đấu Lại Trận Này
          </button>
          <button
            onClick={onBackToLobby}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            Về Sảnh
          </button>
        </div>
      </div>
    </div>
  );
}
