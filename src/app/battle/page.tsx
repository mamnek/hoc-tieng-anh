'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { BattleClient, DEFAULT_SOCKET_URL, battleSounds } from '@/lib/socket-battle';
import { BattlePlayer, BattleQuestion, BattleRoundResult, BattleGameOver } from '@/lib/types';
import { BattleArenaView } from '@/components/battle/battle-arena-view';
import { BattleResultModal } from '@/components/battle/battle-result-modal';
import {
  Swords,
  Users,
  Trophy,
  Zap,
  Sparkles,
  Flame,
  Settings,
  Copy,
  Check,
  Play,
  RotateCcw,
  BookOpen,
  Volume2,
  Target,
  ArrowRight,
  X,
  Plus,
} from 'lucide-react';

export default function BattlePage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const wordSets = useAppStore((state) => state.wordSets);
  const words = useAppStore((state) => state.words);
  const updateUser = useAppStore((state) => state.updateUser);

  // Screen State
  const [activeTab, setActiveTab] = useState<'lobby' | 'mistakes'>('lobby');
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'in_game' | 'game_over'>('lobby');

  // Lobby Match Settings
  const [playerName, setPlayerName] = useState('');
  const [playMode, setPlayMode] = useState<'single' | 'multi' | 'sync' | 'bot'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'en-vi' | 'vi-en' | 'mixed' | 'collocation'>('en-vi');
  const [vocabTopic, setVocabTopic] = useState<string>('all');
  const [customSetId, setCustomSetId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SOCKET_URL);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Arena States
  const [players, setPlayers] = useState<Record<string, BattlePlayer>>({});
  const [currentQuestion, setCurrentQuestion] = useState<BattleQuestion | null>(null);
  const [roundResult, setRoundResult] = useState<BattleRoundResult | null>(null);
  const [gameOverResult, setGameOverResult] = useState<BattleGameOver | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; senderName: string; emoji: string }[]>([]);

  // Mistakes Notebook
  const [mistakeWords, setMistakeWords] = useState<{ term: string; meaningVi: string }[]>([]);

  const clientRef = useRef<BattleClient | null>(null);

  // Rank Calculation (Starts at 0 ELO for all new users)
  const elo = currentUser?.arenaElo || 0;
  const getRankBadge = (score: number) => {
    if (score < 400) return { name: 'Trứng Nước 🌱', color: 'text-green-400', bg: 'bg-green-950/40 border-green-800' };
    if (score < 800) return { name: 'Đồng 🥉', color: 'text-amber-500', bg: 'bg-amber-950/40 border-amber-800' };
    if (score < 1200) return { name: 'Bạc 🥈', color: 'text-slate-300', bg: 'bg-slate-800 border-slate-600' };
    if (score < 1600) return { name: 'Vàng 🥇', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800' };
    if (score < 2000) return { name: 'Kim Cương 💎', color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800' };
    return { name: 'Cao Thủ 👑', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800' };
  };
  const rankInfo = getRankBadge(elo);

  // Init Player Name
  useEffect(() => {
    if (currentUser?.name && !playerName) {
      setPlayerName(currentUser.name);
    }
  }, [currentUser, playerName]);

  // Initialize Battle Client
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

        if (clientRef.current) {
          setMistakeWords((prev) => [...prev, ...clientRef.current!.getMistakeWords()]);
        }

        if (currentUser) {
          const earnedCoins = gameData.coinsGained || 20;
          const won = gameData.winnerId === 'user';
          const newElo = Math.max(0, (currentUser.arenaElo || 0) + (won ? 25 : 5));
          updateUser({
            coins: (currentUser.coins || 0) + earnedCoins,
            arenaElo: newElo,
          });
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

  // Handler: Start Battle / Create Room
  const handleStartBattle = () => {
    const name = playerName.trim() || currentUser?.name || 'Chiến Binh IELTS';
    const selectedCustomWords = customSetId ? words.filter((w) => w.wordSetId === customSetId) : undefined;

    clientRef.current?.createRoom({
      username: name,
      mode: playMode,
      difficulty: botDifficulty,
      questionType,
      vocabTopic,
      customWords: selectedCustomWords,
      questionCount,
      avatar: currentUser?.avatarUrl,
    });
  };

  // Handler: Join Room
  const handleJoinRoom = () => {
    if (!roomCodeInput.trim()) {
      setStatusMessage('Vui lòng nhập mã phòng 6 số!');
      return;
    }
    const name = playerName.trim() || currentUser?.name || 'Chiến Binh IELTS';
    clientRef.current?.joinRoom(name, roomCodeInput, currentUser?.avatarUrl);
  };

  const handleCopyCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSpeakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      window.speechSynthesis.speak(utt);
    }
  };

  // ──────────────── Render In-Game Arena ────────────────
  if (gameState === 'in_game' && currentQuestion) {
    return (
      <div className="relative min-h-[calc(100vh-5rem)]">
        <BattleArenaView
          players={players}
          currentQuestion={currentQuestion}
          roundResult={roundResult}
          currentUserId="user"
          onAnswerSubmit={(ans: string) => clientRef.current?.submitAnswer(ans, currentQuestion.roundId)}
          onSendEmoji={(em: string) => clientRef.current?.sendEmoji(em)}
          onLeaveRoom={() => {
            clientRef.current?.disconnect();
            setGameState('lobby');
          }}
          roomCode={currentRoomCode}
          floatingEmojis={floatingEmojis}
        />
      </div>
    );
  }

  // ──────────────── Render Game Over ────────────────
  if (gameState === 'game_over' && gameOverResult) {
    return (
      <BattleResultModal
        result={gameOverResult}
        currentUserId="user"
        onPlayAgain={() => {
          setGameState('lobby');
          setGameOverResult(null);
          handleStartBattle();
        }}
        onBackToLobby={() => {
          setGameState('lobby');
          setGameOverResult(null);
        }}
      />
    );
  }

  // ──────────────── Render Waiting Room (Phòng Chờ Đối Kháng) ────────────────
  if (gameState === 'waiting') {
    const playerCount = Object.keys(players).length;

    return (
      <div className="max-w-xl mx-auto space-y-6 py-8 animate-fade-in text-center">
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
            <Users className="w-3.5 h-3.5" /> PHÒNG CHỜ THI ĐẤU 1V1
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mã Phòng Thi Đấu</h2>
            <p className="text-xs text-gray-500">Gửi mã này cho bạn bè để cùng tham gia tranh tài trực tuyến!</p>
            
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="px-6 py-3 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-500 text-purple-600 dark:text-purple-300 font-black text-3xl tracking-widest rounded-2xl">
                {currentRoomCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Sao chép mã phòng"
              >
                {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Player Slots */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
                🧑
              </div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">
                {playerName || 'Bạn (Host)'}
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                ✅ Đã Sẵn Sàng
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F0F23] border border-dashed border-gray-300 dark:border-gray-700 text-center space-y-2 flex flex-col items-center justify-center">
              {playerCount > 1 ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
                    👤
                  </div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    {Object.values(players).find(p => p.id !== 'user')?.username || 'Đối Thủ'}
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                    ✅ Đã Vào Phòng
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-xl animate-pulse">
                    ⏳
                  </div>
                  <div className="text-xs text-gray-400 font-medium">Đang chờ bạn bè vào...</div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => clientRef.current?.startMatch()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> Bắt Đầu Trận Đấu Ngay
            </button>

            <button
              onClick={() => {
                clientRef.current?.disconnect();
                setGameState('lobby');
              }}
              className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs cursor-pointer"
            >
              Hủy Phòng / Quay Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Rank Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Swords className="w-3.5 h-3.5" /> IELTS Vocab Arena
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Đấu Trường Từ Vựng <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Vocab Battle</span>
            </h1>
            <p className="text-purple-200/80 text-sm max-w-xl">
              Thử thách phản xạ từ vựng thời gian thực: Solo với AI Bot, đấu đối kháng 1v1 với bạn bè và Collocations!
            </p>
          </div>

          {/* User Rank Display */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-inner ${rankInfo.bg}`}>
            <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-2xl shadow-md">
              {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="w-10 h-10 rounded-full" /> : '⚔️'}
            </div>
            <div>
              <div className="text-xs text-gray-300">Cấp bậc Arena:</div>
              <div className={`text-lg font-bold ${rankInfo.color}`}>{rankInfo.name}</div>
              <div className="text-xs font-medium text-gray-400">{elo} ELO Điểm Đấu Trường</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center justify-center md:justify-start gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('lobby')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'lobby'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Swords className="w-4 h-4" /> Sảnh Đấu Arena
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'mistakes'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-rose-400" /> Sổ Tay Từ Hay Sai ({mistakeWords.length})
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-between animate-fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ──────────────── TAB 1: SẢNH ĐẤU ARENA ──────────────── */}
      {activeTab === 'lobby' && (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" /> Thiết Lập Trận Đấu
          </h2>

          {/* Player Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tên của bạn:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn (VD: John)"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Play Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Chế độ chơi:
            </label>
            <select
              value={playMode}
              onChange={(e) => setPlayMode(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
            >
              <option value="bot">Solo với AI Bot 🤖</option>
              <option value="single">Chơi Đơn (Tự luyện tập)</option>
              <option value="multi">Chơi Đôi (Nhanh tay nhanh trí - 1v1 PvP)</option>
              <option value="sync">Chơi Đôi (Đồng Bộ So Tài)</option>
            </select>
          </div>

          {/* Bot Difficulty Selector (Only when Bot mode is selected) */}
          {playMode === 'bot' && (
            <div className="space-y-2 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Chọn Cấp Độ Đối Thủ AI:
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'easy', label: '🧒 Học sinh', desc: 'Dễ - Chậm & Hay sai' },
                  { id: 'medium', label: '👨‍🏫 Giáo viên', desc: 'Vừa - Chuẩn xác' },
                  { id: 'hard', label: '🤖 Oxford Bot', desc: 'Khó - Siêu tốc' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setBotDifficulty(diff.id as any)}
                    className={`p-3 rounded-xl text-center border font-bold transition-all text-xs cursor-pointer ${
                      botDifficulty === diff.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white dark:bg-[#1A1A2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                    }`}
                  >
                    <div>{diff.label}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Loại câu hỏi:
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
            >
              <option value="en-vi">Anh ➔ Việt (Đoán nghĩa tiếng Việt)</option>
              <option value="vi-en">Việt ➔ Anh (Viết/Chọn từ tiếng Anh)</option>
              <option value="mixed">Trộn lẫn ngẫu nhiên cả 2 chiều</option>
              <option value="collocation">Điền cụm từ cố định (Collocation Match)</option>
            </select>
          </div>

          {/* Vocab Topic / Custom Set Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Bộ Từ Vựng:
              </label>
              <select
                value={vocabTopic}
                onChange={(e) => setVocabTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
              >
                <option value="all">📚 Mọi chủ đề (Oxford 3000)</option>
                <option value="academic">🎓 Học thuật (Academic Band 6.5+)</option>
                <option value="business">💼 Kinh doanh & Tài chính</option>
                <option value="nature">🌿 Thiên nhiên & Môi trường</option>
                <option value="emotion">🧠 Cảm xúc & Tâm lý</option>
                <option value="daily">☕ Đời sống thường ngày</option>
                {wordSets.filter((s) => !s.isPreset).length > 0 && (
                  <option value="custom">📁 Bộ từ vựng tự tạo của tôi</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Số câu muốn chơi:
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Custom Word Set Picker if custom is chosen */}
          {vocabTopic === 'custom' && (
            <div className="space-y-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Chọn bộ từ của bạn:
              </label>
              <select
                value={customSetId}
                onChange={(e) => setCustomSetId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F0F23] border border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white font-medium outline-none cursor-pointer"
              >
                <option value="">-- Chọn Bộ Từ Vựng --</option>
                {wordSets.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.wordCount} từ)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="pt-2 space-y-4">
            <button
              onClick={handleStartBattle}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-lg shadow-xl shadow-purple-500/25 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" /> {playMode === 'multi' || playMode === 'sync' ? 'Tạo Phòng Thi Đấu' : 'Bắt Đầu Trận Đấu'}
            </button>

            <div className="flex items-center gap-3 text-xs text-gray-400 uppercase tracking-wider font-bold before:flex-1 before:h-px before:bg-gray-200 dark:before:bg-gray-800 after:flex-1 after:h-px after:bg-gray-200 dark:after:bg-gray-800">
              HOẶC THAM GIA PHÒNG BẠN BÈ
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã phòng 6 số (VD: A1B2C3)"
                maxLength={8}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F0F23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold tracking-widest text-center uppercase outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleJoinRoom}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                Vào Phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: SỔ TAY TỪ HAY SAI ──────────────── */}
      {activeTab === 'mistakes' && (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" /> Sổ Tay Từ Vựng Hay Sai ({mistakeWords.length})
              </h2>
              <p className="text-xs text-gray-500">Tự động ghi nhận các từ bạn đã trả lời sai trong trận đấu để ôn luyện lại.</p>
            </div>
          </div>

          {mistakeWords.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              🎉 Bạn chưa có từ vựng nào bị trả lời sai! Hãy tham gia trận đấu để thử sức nhé.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mistakeWords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{item.term}</div>
                    <div className="text-xs text-rose-600 dark:text-rose-400">{item.meaningVi}</div>
                  </div>
                  <button
                    onClick={() => handleSpeakWord(item.term)}
                    className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
