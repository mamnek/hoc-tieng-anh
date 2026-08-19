'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { BattleClient, DEFAULT_SOCKET_URL } from '@/lib/socket-battle';
import { BattlePlayer, BattleQuestion, BattleRoundResult, BattleGameOver } from '@/lib/types';
import { BattleArenaView } from '@/components/battle/battle-arena-view';
import { BattleResultModal } from '@/components/battle/battle-result-modal';
import {
  Swords,
  Bot,
  Users,
  Trophy,
  Zap,
  Sparkles,
  Flame,
  ShieldAlert,
  Settings,
  Copy,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function BattlePage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const updateUser = useAppStore((state) => state.updateUser);

  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'in_game' | 'game_over'>('lobby');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SOCKET_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // In-Game States
  const [players, setPlayers] = useState<Record<string, BattlePlayer>>({});
  const [currentQuestion, setCurrentQuestion] = useState<BattleQuestion | null>(null);
  const [roundResult, setRoundResult] = useState<BattleRoundResult | null>(null);
  const [gameOverResult, setGameOverResult] = useState<BattleGameOver | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; senderName: string; emoji: string }[]>([]);

  const clientRef = useRef<BattleClient | null>(null);

  useEffect(() => {
    const client = new BattleClient(serverUrl);
    clientRef.current = client;

    client.setListeners({
      onRoomUpdate: (data) => {
        setCurrentRoomCode(data.roomCode);
        setPlayers(data.players);
        if (data.isStarted) {
          setGameState('in_game');
        } else {
          setGameState('waiting');
        }
      },
      onNextWord: (q) => {
        setCurrentQuestion(q);
        setRoundResult(null);
      },
      onRoundResult: (res) => {
        setRoundResult(res);
        setPlayers(res.players);
      },
      onGameOver: (gameData) => {
        setGameOverResult(gameData);
        setGameState('game_over');

        // Add coins & stats to current user
        if (gameData.coinsGained && currentUser) {
          updateUser({ coins: (currentUser.coins || 0) + gameData.coinsGained });
        }
      },
      onReceiveEmoji: (emData) => {
        const id = Math.random().toString();
        setFloatingEmojis((prev) => [...prev, { id, senderName: emData.senderName, emoji: emData.emoji }]);
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
        }, 2500);
      },
      onError: (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(null), 5000);
      },
    });

    return () => {
      client.disconnect();
    };
  }, [serverUrl, currentUser, updateUser]);

  // Handlers
  const handleStartBotBattle = () => {
    const username = currentUser?.name || 'Chiến Binh IELTS';
    clientRef.current?.createRoom(username, 'bot', selectedDifficulty, currentUser?.avatarUrl);
  };

  const handleCreatePvPRoom = () => {
    const username = currentUser?.name || 'Chiến Binh IELTS';
    clientRef.current?.createRoom(username, 'pvp', 'medium', currentUser?.avatarUrl);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    const username = currentUser?.name || 'Chiến Binh IELTS';
    clientRef.current?.joinRoom(username, roomCodeInput.trim().toUpperCase(), currentUser?.avatarUrl);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion) return;
    clientRef.current?.submitAnswer(answer, currentQuestion.roundId);
  };

  const handleSendEmoji = (emoji: string) => {
    clientRef.current?.sendEmoji(emoji);
  };

  const handleLeaveRoom = () => {
    clientRef.current?.disconnect();
    setGameState('lobby');
    setCurrentQuestion(null);
    setRoundResult(null);
    setGameOverResult(null);
  };

  const handleCopyRoomCode = () => {
    if (!currentRoomCode) return;
    navigator.clipboard.writeText(currentRoomCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Status Alert */}
        {statusMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900 flex items-center gap-2 text-sm animate-fade-in font-medium">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ──────────────── 1. LOBBY SCREEN ──────────────── */}
        {gameState === 'lobby' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Banner */}
            <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white shadow-2xl overflow-hidden border border-purple-500/20">
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
                  <Flame className="w-4 h-4 text-amber-400" />
                  ĐẤU TRƯỜNG TỪ VỰNG IELTS 1v1 REALTIME
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Thách Đấu Từ Vựng <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                    IELTS Vocab Battle
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-medium">
                  So tài phản xạ từ vựng IELTS trong 10 giây! Gõ nhanh, trả lời chuẩn để hạ gục thanh máu đối thủ, tích lũy chuỗi combo và leo bảng vàng!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    +50 Xu / Trận thắng
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10">
                    <Zap className="w-4 h-4 text-primaryLight" />
                    +100 EXP Thăng cấp
                  </div>
                </div>
              </div>
            </div>

            {/* 2 Main Battle Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mode A: PvBot (Đấu với AI Bot) */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-6 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Đấu Với AI Bot
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Luyện tập solo nhanh chóng không cần đợi người chơi khác
                      </p>
                    </div>
                  </div>

                  {/* Difficulty selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Chọn cấp độ đối thủ AI:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedDifficulty('easy')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedDifficulty === 'easy'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                            : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        🟢 Tân Thủ
                      </button>
                      <button
                        onClick={() => setSelectedDifficulty('medium')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedDifficulty === 'medium'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs'
                            : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        🟡 Thách Đấu
                      </button>
                      <button
                        onClick={() => setSelectedDifficulty('hard')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedDifficulty === 'hard'
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-primary text-primary shadow-xs'
                            : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        🔴 Cao Thủ
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartBotBattle}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Bắt Đầu Trận Đấu Bot
                </button>
              </div>

              {/* Mode B: 1v1 PvP Online (Đấu với Bạn Bè) */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-6 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Đấu Bạn Bè (1v1 PvP)
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tạo phòng riêng hoặc nhập mã để thách đấu trực tuyến
                      </p>
                    </div>
                  </div>

                  {/* Join Room Form */}
                  <form onSubmit={handleJoinRoom} className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Tham gia phòng có sẵn:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value)}
                        placeholder="Nhập mã phòng (VD: AB12CD)"
                        maxLength={8}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono font-bold uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        className="bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all cursor-pointer"
                      >
                        Vào
                      </button>
                    </div>
                  </form>
                </div>

                <button
                  onClick={handleCreatePvPRoom}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Swords className="w-5 h-5" />
                  Tạo Phòng Đấu Mới
                </button>
              </div>
            </div>

            {/* Server Settings Accordion */}
            <div className="pt-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5 font-semibold mx-auto cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Cấu hình máy chủ WebSocket Render
              </button>

              {showSettings && (
                <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-md mx-auto space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    URL Server Socket.IO (Render / Local):
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                  <p className="text-[11px] text-gray-400">
                    Mặc định: <code>https://ielts-vocab-battle.onrender.com</code>. Khi server chưa thức dậy, hệ thống sẽ tự động chuyển sang chế độ AI Bot tích hợp mà không bị gián đoạn.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────── 2. WAITING ROOM SCREEN ──────────────── */}
        {gameState === 'waiting' && (
          <div className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/40 rounded-3xl p-8 max-w-md mx-auto shadow-xl text-center space-y-6 animate-fade-in">
            <div className="inline-flex p-4 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-primary">
              <Users className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Phòng Đấu Trực Tuyến
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gửi mã phòng này cho bạn bè để cùng tham gia thi đấu
              </p>
            </div>

            {/* Room Code Box */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-purple-200 dark:border-purple-900 flex items-center justify-between px-6">
              <span className="font-mono text-2xl font-black tracking-widest text-primary">
                {currentRoomCode}
              </span>
              <button
                onClick={handleCopyRoomCode}
                className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>

            {/* Players list */}
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Danh sách đấu thủ ({Object.keys(players).length}/2):
              </span>
              <div className="space-y-1.5">
                {Object.values(players).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{p.avatar || '👤'}</span>
                      <strong className="text-gray-900 dark:text-white">{p.username}</strong>
                      {p.isHost && (
                        <span className="text-[10px] bg-purple-100 text-primary font-bold px-2 py-0.5 rounded-full">
                          Chủ phòng
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-500 font-bold">Đã sẵn sàng</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="text-xs text-gray-500 hover:text-red-500 font-bold block mx-auto cursor-pointer"
            >
              Hủy và về sảnh
            </button>
          </div>
        )}

        {/* ──────────────── 3. ACTIVE 1v1 BATTLE ARENA ──────────────── */}
        {gameState === 'in_game' && (
          <BattleArenaView
            roomCode={currentRoomCode}
            players={players}
            currentQuestion={currentQuestion}
            roundResult={roundResult}
            currentUserId={currentUser?.id || 'user'}
            onAnswerSubmit={handleAnswerSubmit}
            onSendEmoji={handleSendEmoji}
            onLeaveRoom={handleLeaveRoom}
            floatingEmojis={floatingEmojis}
          />
        )}

        {/* ──────────────── 4. GAME OVER MODAL ──────────────── */}
        {gameState === 'game_over' && gameOverResult && (
          <BattleResultModal
            result={gameOverResult}
            currentUserId={currentUser?.id || 'user'}
            onPlayAgain={() => {
              setGameState('lobby');
              handleStartBotBattle();
            }}
            onBackToLobby={() => {
              setGameState('lobby');
              setGameOverResult(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
