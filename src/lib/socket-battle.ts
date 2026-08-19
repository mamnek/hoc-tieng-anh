import { io, Socket } from 'socket.io-client';
import { BattlePlayer, BattleQuestion, BattleRoundResult, BattleGameOver, Word } from './types';
import { presetWords, presetWordSets } from './preset-data';

// Default Render Backend URL (Configurable via ENV or Settings)
export const DEFAULT_SOCKET_URL = process.env.NEXT_PUBLIC_ARENA_SOCKET_URL || 'https://ielts-vocab-battle.onrender.com';

// ──────────────── Web Audio API Synthesizer (Zero-asset sound effects) ────────────────
class BattleSoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playDamage() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }

  playVictory() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (_) {}
  }
}

export const battleSounds = new BattleSoundEffects();

// Collocations Sample Database for Collocation Match Mode
export const IELTS_COLLOCATIONS = [
  { term: 'vital role', meaningVi: 'vai trò thiết yếu', sentence: 'Education plays a _____ in modern society.', options: ['vital role', 'heavy role', 'main role', 'high role'] },
  { term: 'heavy traffic', meaningVi: 'giao thông đông đúc', sentence: 'I arrived late due to _____ during rush hour.', options: ['heavy traffic', 'crowded traffic', 'strong traffic', 'thick traffic'] },
  { term: 'make a decision', meaningVi: 'đưa ra quyết định', sentence: 'He had to _____ quickly under high pressure.', options: ['make a decision', 'do a decision', 'take a deciding', 'build a decision'] },
  { term: 'broaden horizons', meaningVi: 'mở rộng tầm nhìn', sentence: 'Travelling abroad helps students _____ significantly.', options: ['broaden horizons', 'widen horizons', 'open visions', 'expand skies'] },
  { term: 'pressing issue', meaningVi: 'vấn đề cấp bách', sentence: 'Global warming is currently a _____ for humanity.', options: ['pressing issue', 'pushing issue', 'squeezing problem', 'heavy topic'] },
  { term: 'bridge the gap', meaningVi: 'thu hẹp khoảng cách', sentence: 'Technology can help _____ between rich and poor.', options: ['bridge the gap', 'close the road', 'cut the distance', 'fix the hole'] },
  { term: 'pose a threat', meaningVi: 'gây ra mối đe dọa', sentence: 'Pollution continues to _____ to marine ecosystems.', options: ['pose a threat', 'give a threat', 'bring a danger', 'make a hazard'] },
  { term: 'take into account', meaningVi: 'xem xét, tính đến', sentence: 'We must _____ all environmental factors.', options: ['take into account', 'bring to account', 'hold into mind', 'keep to count'] },
  { term: 'profound impact', meaningVi: 'tác động sâu sắc', sentence: 'Artificial intelligence has had a _____ on work.', options: ['profound impact', 'deep collision', 'high pressure', 'strong hit'] },
  { term: 'pay attention to', meaningVi: 'chú ý đến', sentence: 'Students should _____ pronunciation when speaking.', options: ['pay attention to', 'give attention on', 'take care of', 'hold ear to'] },
];

export interface BattleRoomConfig {
  username: string;
  mode: 'single' | 'multi' | 'sync' | 'bot';
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'en-vi' | 'vi-en' | 'mixed' | 'collocation';
  vocabTopic?: string;
  customWords?: Word[];
  questionCount?: number;
  avatar?: string;
}

export interface BattleClientListeners {
  onRoomUpdate?: (data: { roomCode: string; players: Record<string, BattlePlayer>; isStarted: boolean; config?: any }) => void;
  onNextWord?: (question: BattleQuestion) => void;
  onRoundResult?: (result: BattleRoundResult) => void;
  onGameOver?: (data: BattleGameOver) => void;
  onReceiveEmoji?: (data: { senderId: string; senderName: string; emoji: string }) => void;
  onError?: (error: string) => void;
}

// ──────────────── Unified Battle Client (Online Socket + Offline AI Engine) ────────────────
export class BattleClient {
  private socket: Socket | null = null;
  private listeners: BattleClientListeners = {};
  private serverUrl: string;
  private isLocalMode = true;

  // Local AI / Offline Game Simulation State
  private localRoomCode = '';
  private localPlayers: Record<string, BattlePlayer> = {};
  private localQuestions: BattleQuestion[] = [];
  private currentRound = 0;
  private botDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private currentConfig: BattleRoomConfig | null = null;
  private localTimer: any = null;
  private mistakeWords: { term: string; meaningVi: string }[] = [];

  constructor(serverUrl: string = DEFAULT_SOCKET_URL) {
    this.serverUrl = serverUrl;
  }

  setListeners(listeners: BattleClientListeners) {
    this.listeners = listeners;
  }

  // Connect to Remote Socket.IO Server if available
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 4000,
          reconnectionAttempts: 2,
        });

        this.socket.on('connect', () => {
          this.isLocalMode = false;
          this.bindSocketEvents();
          resolve(true);
        });

        this.socket.on('connect_error', () => {
          this.isLocalMode = true;
          resolve(false);
        });
      } catch (err) {
        this.isLocalMode = true;
        resolve(false);
      }
    });
  }

  private bindSocketEvents() {
    if (!this.socket) return;

    this.socket.on('room_update', (data: any) => {
      this.listeners.onRoomUpdate?.({
        roomCode: data.room_code || data.roomCode,
        players: data.players || {},
        isStarted: !!data.game_started,
        config: data.config,
      });
    });

    this.socket.on('next_word', (data: any) => {
      this.listeners.onNextWord?.({
        roundId: data.round_id || 1,
        wordEn: data.word_en || '',
        wordVi: data.word_vi || '',
        ipa: data.ipa || '',
        hint: data.sentence || data.hint || '',
        hiddenEn: data.word_en_hidden || '',
        timeLimit: data.time_limit || 12,
        options: data.options,
      });
    });

    this.socket.on('round_result', (data: any) => {
      this.listeners.onRoundResult?.({
        roundId: data.round_id || 1,
        winnerId: data.winner_id,
        winnerName: data.winner_name,
        correctAnswer: data.correct_answer || '',
        players: data.players || {},
        damageDealt: data.damage || 25,
      });
    });

    this.socket.on('game_over', (data: any) => {
      this.listeners.onGameOver?.({
        winnerId: data.winner_id || '',
        winnerName: data.winner_name || 'Player',
        isDraw: !!data.is_draw,
        finalPlayers: data.final_players || {},
        coinsGained: data.coins_gained || 30,
        expGained: data.exp_gained || 50,
        roundsPlayed: data.rounds_played || 5,
        totalWordsReviewed: data.words_count || 5,
      });
    });

    this.socket.on('receive_emoji', (data: any) => {
      this.listeners.onReceiveEmoji?.({
        senderId: data.sender_id || '',
        senderName: data.sender_name || '',
        emoji: data.emoji || '🔥',
      });
    });

    this.socket.on('error', (err: any) => {
      this.listeners.onError?.(typeof err === 'string' ? err : err?.message || 'Có lỗi xảy ra.');
    });
  }

  // Create Room with Full Config
  createRoom(config: BattleRoomConfig) {
    this.currentConfig = config;
    const { username, mode, difficulty = 'medium', avatar } = config;

    if (this.socket && this.socket.connected && !this.isLocalMode && (mode === 'multi' || mode === 'sync')) {
      this.socket.emit('create_room', {
        username,
        mode,
        difficulty,
        question_type: config.questionType || 'en-vi',
        topic: config.vocabTopic || 'all',
        question_count: config.questionCount || 10,
      });
      return;
    }

    // Local / Bot Engine
    this.isLocalMode = true;
    this.botDifficulty = difficulty;
    this.localRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const botName = difficulty === 'hard' ? '🤖 Oxford Bot' : difficulty === 'medium' ? '👨‍🏫 Giáo viên IELTS' : '🧒 Học sinh';

    if (mode === 'single') {
      this.localPlayers = {
        user: {
          id: 'user',
          username,
          avatar: avatar || '🧑',
          hp: 100,
          score: 0,
          combo: 0,
          isReady: true,
          isHost: true,
          streak: 0,
        },
      };
      this.prepareLocalQuestions(config);
      this.currentRound = 0;
      this.listeners.onRoomUpdate?.({
        roomCode: this.localRoomCode,
        players: this.localPlayers,
        isStarted: true,
        config,
      });
      setTimeout(() => this.startNextLocalRound(), 1200);
    } else if (mode === 'bot') {
      this.localPlayers = {
        user: {
          id: 'user',
          username,
          avatar: avatar || '🧑',
          hp: 100,
          score: 0,
          combo: 0,
          isReady: true,
          isHost: true,
          streak: 0,
        },
        bot: {
          id: 'bot',
          username: botName,
          avatar: difficulty === 'hard' ? '🤖' : difficulty === 'medium' ? '👨‍🏫' : '🧒',
          hp: 100,
          score: 0,
          combo: 0,
          isReady: true,
          isBot: true,
          streak: 0,
        },
      };
      this.prepareLocalQuestions(config);
      this.currentRound = 0;
      this.listeners.onRoomUpdate?.({
        roomCode: this.localRoomCode,
        players: this.localPlayers,
        isStarted: true,
        config,
      });
      setTimeout(() => this.startNextLocalRound(), 1200);
    } else {
      // Multiplayer 1v1 PvP / Sync Mode: Enter Waiting Room State!
      this.localPlayers = {
        user: {
          id: 'user',
          username,
          avatar: avatar || '🧑',
          hp: 100,
          score: 0,
          combo: 0,
          isReady: true,
          isHost: true,
          streak: 0,
        },
      };
      this.prepareLocalQuestions(config);
      this.currentRound = 0;
      this.listeners.onRoomUpdate?.({
        roomCode: this.localRoomCode,
        players: this.localPlayers,
        isStarted: false,
        config,
      });
    }
  }

  // Host starts match in multiplayer
  startMatch() {
    if (this.socket && this.socket.connected && !this.isLocalMode) {
      this.socket.emit('start_game', { room_code: this.localRoomCode });
      return;
    }

    // If only host is in room and starts, add a friendly AI Opponent as player 2
    if (!this.localPlayers.bot && !this.localPlayers.guest) {
      this.localPlayers.bot = {
        id: 'bot',
        username: '🤖 Đối Thủ AI',
        avatar: '🤖',
        hp: 100,
        score: 0,
        combo: 0,
        isReady: true,
        isBot: true,
        streak: 0,
      };
    }

    this.listeners.onRoomUpdate?.({
      roomCode: this.localRoomCode,
      players: this.localPlayers,
      isStarted: true,
      config: this.currentConfig,
    });

    setTimeout(() => {
      this.startNextLocalRound();
    }, 1000);
  }

  joinRoom(username: string, roomCode: string, avatar?: string) {
    if (this.socket && this.socket.connected && !this.isLocalMode) {
      this.socket.emit('join_room', { username, room_code: roomCode.trim().toUpperCase() });
      return;
    }

    // If local room code matches current active room
    if (roomCode.trim().toUpperCase() === this.localRoomCode) {
      this.localPlayers['guest'] = {
        id: 'guest',
        username: username || 'Khách Mời',
        avatar: avatar || '👤',
        hp: 100,
        score: 0,
        combo: 0,
        isReady: true,
        streak: 0,
      };
      this.listeners.onRoomUpdate?.({
        roomCode: this.localRoomCode,
        players: this.localPlayers,
        isStarted: true,
      });
      return;
    }

    this.listeners.onError?.('Không tìm thấy mã phòng hoặc máy chủ trực tuyến đang tải. Đang chuyển sang Đấu với AI Bot...');
    this.createRoom({ username, mode: 'bot', difficulty: 'medium' });
  }

  submitAnswer(answer: string, roundId: number) {
    if (this.socket && this.socket.connected && !this.isLocalMode) {
      this.socket.emit('submit_answer', {
        room_code: this.localRoomCode,
        answer,
        round_id: roundId,
      });
      return;
    }

    // Local Bot / Solo Battle Logic
    if (roundId !== this.currentRound) return;
    const q = this.localQuestions[this.currentRound - 1];
    if (!q) return;

    if (this.localTimer) clearTimeout(this.localTimer);

    const isCorrect = checkVocabAnswer(answer, q.wordEn) || checkVocabAnswer(answer, q.wordVi);

    if (isCorrect) {
      battleSounds.playCorrect();
      this.localPlayers.user.score += 100 + this.localPlayers.user.combo * 20;
      this.localPlayers.user.combo += 1;
      
      if (this.localPlayers.bot) {
        this.localPlayers.bot.hp = Math.max(0, this.localPlayers.bot.hp - (20 + this.localPlayers.user.combo * 5));
      }

      this.listeners.onRoundResult?.({
        roundId,
        winnerId: 'user',
        winnerName: this.localPlayers.user.username,
        correctAnswer: `${q.wordEn} (${q.wordVi})`,
        players: { ...this.localPlayers },
        damageDealt: 20 + this.localPlayers.user.combo * 5,
      });
    } else {
      battleSounds.playDamage();
      this.localPlayers.user.combo = 0;
      this.localPlayers.user.hp = Math.max(0, this.localPlayers.user.hp - 15);
      this.mistakeWords.push({ term: q.wordEn, meaningVi: q.wordVi });

      this.listeners.onRoundResult?.({
        roundId,
        winnerId: undefined,
        winnerName: undefined,
        correctAnswer: `${q.wordEn} (${q.wordVi})`,
        players: { ...this.localPlayers },
        damageDealt: 15,
      });
    }

    this.checkGameOverOrNext();
  }

  sendEmoji(emoji: string) {
    if (this.socket && this.socket.connected && !this.isLocalMode) {
      this.socket.emit('send_emoji', { room_code: this.localRoomCode, emoji });
      return;
    }

    this.listeners.onReceiveEmoji?.({
      senderId: 'user',
      senderName: this.localPlayers.user?.username || 'Bạn',
      emoji,
    });

    if (this.localPlayers.bot) {
      setTimeout(() => {
        const botEmojis = ['😎', '🔥', '⚡', '🤖', '💪', '🏆'];
        const randomBotEmoji = botEmojis[Math.floor(Math.random() * botEmojis.length)];
        this.listeners.onReceiveEmoji?.({
          senderId: 'bot',
          senderName: this.localPlayers.bot?.username || 'Bot',
          emoji: randomBotEmoji,
        });
      }, 1200);
    }
  }

  getMistakeWords() {
    return this.mistakeWords;
  }

  private prepareLocalQuestions(config?: BattleRoomConfig) {
    const count = Math.min(30, Math.max(5, config?.questionCount || 10));
    const qType = config?.questionType || 'en-vi';

    // If Collocation Mode
    if (qType === 'collocation') {
      const shuffledCollocations = [...IELTS_COLLOCATIONS].sort(() => Math.random() - 0.5);
      this.localQuestions = shuffledCollocations.slice(0, count).map((col, idx) => ({
        roundId: idx + 1,
        wordEn: col.term,
        wordVi: col.meaningVi,
        ipa: '',
        hint: col.sentence,
        hiddenEn: col.sentence,
        timeLimit: 12,
        options: col.options,
      }));
      return;
    }

    // Vocabulary based
    let pool: Word[] = [];
    if (config?.customWords && config.customWords.length > 0) {
      pool = config.customWords;
    } else {
      const topic = config?.vocabTopic || 'all';
      if (topic === 'all' || !topic) {
        pool = presetWords;
      } else {
        const matchedSet = presetWordSets.find((s) => s.id.toLowerCase().includes(topic.toLowerCase()));
        if (matchedSet) {
          pool = presetWords.filter((w) => w.wordSetId === matchedSet.id);
        }
        if (pool.length === 0) pool = presetWords;
      }
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.localQuestions = shuffled.slice(0, count).map((w, idx) => {
      const term = w.term || '';
      const hidden = term
        .split('')
        .map((char: string, cIdx: number) => (cIdx === 0 || cIdx === term.length - 1 ? char : '_'))
        .join(' ');

      // Options generation
      const isViEn = qType === 'vi-en' || (qType === 'mixed' && idx % 2 === 1);
      let options: string[] = [];

      if (isViEn) {
        // Options are English terms
        const wrong = shuffled.filter((item) => item.term !== term).slice(0, 3).map((item) => item.term);
        options = [term, ...wrong].sort(() => Math.random() - 0.5);
      } else {
        // Options are Vietnamese meanings
        const wrong = shuffled.filter((item) => item.meaningVi !== w.meaningVi).slice(0, 3).map((item) => item.meaningVi);
        options = [w.meaningVi, ...wrong].sort(() => Math.random() - 0.5);
      }

      return {
        roundId: idx + 1,
        wordEn: isViEn ? w.meaningVi : term, // Prompt
        wordVi: isViEn ? term : w.meaningVi, // Target answer
        ipa: w.ipa || '',
        hint: w.exampleEn || `Nghĩa: ${w.meaningVi}`,
        hiddenEn: isViEn ? '' : hidden,
        timeLimit: 12,
        options,
      };
    });
  }

  private startNextLocalRound() {
    if (this.currentRound >= this.localQuestions.length) {
      this.finishLocalGame();
      return;
    }

    this.currentRound += 1;
    const q = this.localQuestions[this.currentRound - 1];

    this.listeners.onNextWord?.(q);

    // Bot Response Simulator (if playing vs Bot)
    if (this.localPlayers.bot) {
      const botDelay =
        this.botDifficulty === 'hard'
          ? 3500 + Math.random() * 2500 // 3.5s - 6s
          : this.botDifficulty === 'medium'
          ? 5000 + Math.random() * 3500 // 5s - 8.5s
          : 7500 + Math.random() * 4000; // 7.5s - 11.5s

      const botAccuracy = this.botDifficulty === 'hard' ? 0.95 : this.botDifficulty === 'medium' ? 0.75 : 0.5;

      this.localTimer = setTimeout(() => {
        if (Math.random() < botAccuracy) {
          battleSounds.playDamage();
          this.localPlayers.bot.score += 100 + this.localPlayers.bot.combo * 20;
          this.localPlayers.bot.combo += 1;
          this.localPlayers.user.hp = Math.max(0, this.localPlayers.user.hp - (20 + this.localPlayers.bot.combo * 5));

          this.listeners.onRoundResult?.({
            roundId: this.currentRound,
            winnerId: 'bot',
            winnerName: this.localPlayers.bot.username,
            correctAnswer: `${q.wordEn} (${q.wordVi})`,
            players: { ...this.localPlayers },
            damageDealt: 20 + this.localPlayers.bot.combo * 5,
          });
        } else {
          this.localPlayers.bot.combo = 0;
        }

        this.checkGameOverOrNext();
      }, botDelay);
    }
  }

  private checkGameOverOrNext() {
    const userDead = this.localPlayers.user.hp <= 0;
    const botDead = this.localPlayers.bot && this.localPlayers.bot.hp <= 0;

    if (userDead || botDead || this.currentRound >= this.localQuestions.length) {
      setTimeout(() => this.finishLocalGame(), 1500);
    } else {
      setTimeout(() => this.startNextLocalRound(), 2500);
    }
  }

  private finishLocalGame() {
    if (this.localTimer) clearTimeout(this.localTimer);

    const user = this.localPlayers.user;
    const bot = this.localPlayers.bot;
    let winnerId = 'user';
    let winnerName = user.username;
    let isDraw = false;

    if (bot) {
      if (user.hp <= 0 && bot.hp > 0) {
        winnerId = 'bot';
        winnerName = bot.username;
      } else if (bot.hp <= 0 && user.hp > 0) {
        winnerId = 'user';
        winnerName = user.username;
      } else if (user.score < bot.score) {
        winnerId = 'bot';
        winnerName = bot.username;
      } else if (user.score === bot.score) {
        isDraw = true;
      }
    }

    if (winnerId === 'user') {
      battleSounds.playVictory();
    }

    this.listeners.onGameOver?.({
      winnerId: isDraw ? 'draw' : winnerId,
      winnerName: isDraw ? 'Hòa Trận' : winnerName,
      isDraw,
      finalPlayers: { ...this.localPlayers },
      coinsGained: winnerId === 'user' ? 40 : 15,
      expGained: winnerId === 'user' ? 80 : 30,
      roundsPlayed: this.currentRound,
      totalWordsReviewed: this.localQuestions.length,
    });
  }

  disconnect() {
    if (this.localTimer) clearTimeout(this.localTimer);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Helper clean string compare
function checkVocabAnswer(input: string, target: string): boolean {
  if (!input || !target) return false;
  const cleanInput = input.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');
  const cleanTarget = target.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');
  
  if (cleanInput === cleanTarget) return true;
  
  // Partial meaning match (e.g. "sự quan trọng" in "quan trọng")
  const targetSubstrings = cleanTarget.split(/[,;/]/).map(s => s.trim());
  return targetSubstrings.some(sub => sub === cleanInput || (cleanInput.length >= 3 && sub.includes(cleanInput)));
}
