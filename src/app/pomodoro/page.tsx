'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Clock, Flame, Play, Pause, RotateCcw, Sparkles, Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import { battleSounds } from '@/lib/socket-battle';

export default function PomodoroPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const updateUser = useAppStore((state) => state.updateUser);

  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(50);
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  // IELTS Vocab Boosters
  const BOOSTERS = [
    { band5: 'important', band7: 'paramount / crucial / indispensable', note: 'Dùng trong Writing Task 2 & Speaking Part 3' },
    { band5: 'big / large', band7: 'substantial / immense / monumental', note: 'Mô tả số liệu, tác động hoặc xu hướng' },
    { band5: 'help / support', band7: 'facilitate / bolster / foster / reinforce', note: 'Thể hiện vai trò hỗ trợ đắc lực' },
    { band5: 'change / improve', band7: 'transform / revolutionize / overhaul', note: 'Biến đổi sâu sắc' },
    { band5: 'bad / dangerous', band7: 'detrimental / catastrophic / hazardous', note: 'Ảnh hưởng tiêu cực' },
    { band5: 'solve / fix', band7: 'alleviate / mitigate / address / resolve', note: 'Giải quyết vấn đề' },
  ];
  const [boosterIndex, setBoosterIndex] = useState(0);

  // History Chart data (last 7 days in minutes)
  const historyData = [
    { day: 'T2', minutes: 45 },
    { day: 'T3', minutes: 60 },
    { day: 'T4', minutes: 30 },
    { day: 'T5', minutes: 75 },
    { day: 'T6', minutes: 50 },
    { day: 'T7', minutes: 90 },
    { day: 'CN', minutes: todayFocusMinutes },
  ];

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        battleSounds.playVictory();
        setTodayFocusMinutes((prev) => prev + workDuration);
        setCompletedSessions((prev) => prev + 1);
        if (currentUser) {
          updateUser({ coins: (currentUser.coins || 0) + 10 });
        }
        setMode('break');
        setTimeLeft(breakDuration * 60);
      } else {
        battleSounds.playCorrect();
        setMode('work');
        setTimeLeft(workDuration * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workDuration, breakDuration, currentUser, updateUser]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
  };

  const handleDurationChange = (newWork: number, newBreak: number) => {
    setWorkDuration(newWork);
    setBreakDuration(newBreak);
    setIsRunning(false);
    setTimeLeft(newWork * 60);
    setMode('work');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = mode === 'work' 
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100 
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> POMODORO FOCUS TIMER
          </div>
          <h1 className="text-3xl md:text-4xl font-black">
            Đồng Hồ Tập Trung & Tăng Tốc Vocab
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-xl">
            Phương pháp quả cà chua 25/5 giúp tối đa hóa khả năng tập trung, ghi nhớ từ vựng lâu hơn và nhận thưởng Xu mỗi phiên hoàn thành!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pomodoro Main Clock */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-6">
            {/* Mode Switcher */}
            <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setMode('work');
                  setTimeLeft(workDuration * 60);
                  setIsRunning(false);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'work'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                🎯 Tập Trung ({workDuration}p)
              </button>
              <button
                onClick={() => {
                  setMode('break');
                  setTimeLeft(breakDuration * 60);
                  setIsRunning(false);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'break'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                ☕ Nghỉ Ngơi ({breakDuration}p)
              </button>
            </div>

            {/* Circular / Large Digital Clock */}
            <div className="relative py-4">
              <div className="text-7xl md:text-8xl font-black font-mono tracking-tight text-gray-900 dark:text-white select-none">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="w-48 h-2 mx-auto mt-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${mode === 'work' ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleStartPause}
                className={`px-8 py-4 rounded-2xl text-white font-black text-lg flex items-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isRunning ? 'Tạm Dừng' : 'Bắt Đầu Tập Trung'}
              </button>

              <button
                onClick={handleReset}
                className="p-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition-all cursor-pointer"
                title="Đặt lại thời gian"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Preset Time Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[
                { w: 25, b: 5, label: 'Chuẩn 25/5' },
                { w: 45, b: 10, label: 'Sâu 45/10' },
                { w: 60, b: 15, label: 'Khắt khe 60/15' },
              ].map((preset) => (
                <button
                  key={preset.w}
                  onClick={() => handleDurationChange(preset.w, preset.b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    workDuration === preset.w
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* IELTS Vocab Booster Interactive Card */}
          <div
            onClick={() => setBoosterIndex((prev) => (prev + 1) % BOOSTERS.length)}
            className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/30 text-left cursor-pointer hover:border-amber-400 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-600 dark:text-amber-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> IELTS VOCAB BOOSTER (Chạm để đổi từ):
              </span>
              <span className="bg-amber-400/20 px-2 py-0.5 rounded-md">Band 5.0 ➔ Band 7.5+</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="line-through text-gray-500 text-sm font-semibold">{BOOSTERS[boosterIndex].band5}</span>
                  <span className="text-purple-500 font-black">➔</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-300">
                    {BOOSTERS[boosterIndex].band7}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">{BOOSTERS[boosterIndex].note}</p>
              </div>
              <span className="text-xs font-bold text-indigo-500 group-hover:underline">Từ tiếp theo ➔</span>
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Stats & History Chart */}
        <div className="space-y-6">
          {/* Daily Stats */}
          <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Thống Kê Hôm Nay
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Tổng Tập Trung</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {todayFocusMinutes} <span className="text-xs font-normal text-gray-500">phút</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Phiên Hoàn Thành</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {completedSessions} <span className="text-xs font-normal text-gray-500">phiên</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day History Chart */}
          <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Lịch Sử 7 Ngày Qua
            </h3>

            <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
              {historyData.map((item, idx) => {
                const maxMins = 100;
                const heightPercent = Math.min(100, Math.max(15, (item.minutes / maxMins) * 100));
                const isToday = idx === historyData.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500">
                      {item.minutes}p
                    </span>
                    <div className="w-full max-w-[28px] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          isToday ? 'bg-indigo-600' : 'bg-purple-400 dark:bg-purple-600/70 group-hover:bg-indigo-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
