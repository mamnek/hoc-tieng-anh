import { io, Socket } from 'socket.io-client';
import { BattlePlayer, BattleQuestion, BattleRoundResult, BattleGameOver } from './types';
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

  playDefeat() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.15, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
    } catch (_) {}
  }
}

export const battleSounds = new BattleSoundEffects();

// ──────────────── Fuzzy Matching String Helper ────────────────
export function removeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function checkVocabAnswer(userInput: string, correctAnswer: string): boolean {
  const u = removeAccents(userInput.trim().toLowerCase());
  const c = removeAccents(correctAnswer.trim().toLowerCase());
  if (u === c) return true;

  // Keyword match
  if (u.length >= 3 && (c.includes(u) || u.includes(c))) return true;

  // Simple character similarity
  let matches = 0;
  for (let i = 0; i < Math.min(u.length, c.length); i++) {
    if (u[i] === c[i]) matches++;
  }
  const ratio = (matches * 2) / (u.length + c.length);
  return ratio >= 0.8;
}

// ──────────────── Battle Socket Client & Local Engine ────────────────
export type BattleEventListener = {
  onRoomUpdate?: (roomData: { roomCode: string; players: Record<string, BattlePlayer>; isStarted: boolean }) => void;
  onNextWord?: (question: BattleQuestion) => void;
  onRoundResult?: (result: BattleRoundResult) => void;
  onGameOver?: (gameOverData: BattleGameOver) => void;
  onReceiveEmoji?: (data: { senderId: string; senderName: string; emoji: string }) => void;
  onError?: (errorMsg: string) => void;
};

export class BattleClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private listeners: BattleEventListener = {};
  private isLocalMode: boolean = false;
  private localTimer: any = null;
  private currentRound: number = 0;
  private localRoomCode: string = '';
  private localPlayers: Record<string, BattlePlayer> = {};
  private localQuestions: BattleQuestion[] = [];
  private botDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

  constructor(serverUrl: string = DEFAULT_SOCKET_URL) {
    this.serverUrl = serverUrl;
  }

  setListeners(listeners: BattleEventListener) {
    this.listeners = listeners;
  }

  // Connect to Render Socket Server with fallback to offline local AI Bot
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 6000,
          reconnectionAttempts: 2,
        });

        this.socket.on('connect', () => {
          this.isLocalMode = false;
          this.bindSocketEvents();
          resolve(true);
        });

        this.socket.on('connect_error', () => {
          console.warn('[Battle Arena] Server connection timed out. Falling back to local offline AI Bot engine.');
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

  // Create or Start Battle (Supports Bot / PvP)
  createRoom(username: string, mode: 'bot' | 'pvp', difficulty: 'easy' | 'medium' | 'hard' = 'medium', avatar?: string) {
    if (this.socket && this.socket.connected && !this.isLocalMode && mode === 'pvp') {
      this.socket.emit('create_room', {
        username,
        mode,
        difficulty,
      });
      return;
    }

    // Local / Bot Engine Execution
    this.isLocalMode = true;
    this.botDifficulty = difficulty;
    this.localRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const botName = difficulty === 'hard' ? 'AI IELTS Master' : difficulty === 'medium' ? 'AI Bot Challenger' : 'AI Rookie Bot';

    this.localPlayers = {
      user: {
        id: 'user',
        username,
        avatar: avatar || '👤',
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
        avatar: '🤖',
        hp: 100,
        score: 0,
        combo: 0,
        isReady: true,
        isBot: true,
        streak: 0,
      },
    };

    // Load rich vocabulary set for battle
    this.prepareLocalQuestions();
    this.currentRound = 0;

    this.listeners.onRoomUpdate?.({
      roomCode: this.localRoomCode,
      players: this.localPlayers,
      isStarted: true,
    });

    // Start round 1 in 1.5s
    setTimeout(() => {
      this.startNextLocalRound();
    }, 1500);
  }

  joinRoom(username: string, roomCode: string, avatar?: string) {
    if (this.socket && this.socket.connected && !this.isLocalMode) {
      this.socket.emit('join_room', { username, room_code: roomCode.trim().toUpperCase() });
      return;
    }

    this.listeners.onError?.('Không thể kết nối đến phòng trực tuyến lúc này. Vui lòng thử chế độ Đấu với AI Bot.');
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

    // Local Bot Battle Logic
    if (roundId !== this.currentRound) return;
    const q = this.localQuestions[this.currentRound - 1];
    if (!q) return;

    if (this.localTimer) clearTimeout(this.localTimer);

    const isCorrect = checkVocabAnswer(answer, q.wordEn) || checkVocabAnswer(answer, q.wordVi);

    if (isCorrect) {
      battleSounds.playCorrect();
      this.localPlayers.user.score += 100 + this.localPlayers.user.combo * 20;
      this.localPlayers.user.combo += 1;
      this.localPlayers.bot.hp = Math.max(0, this.localPlayers.bot.hp - (20 + this.localPlayers.user.combo * 5));

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

    // Broadcast locally
    this.listeners.onReceiveEmoji?.({
      senderId: 'user',
      senderName: this.localPlayers.user?.username || 'Bạn',
      emoji,
    });

    // Bot reacts with a counter emoji occasionally
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

  private prepareLocalQuestions() {
    const allWords = presetWords || [];
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);

    this.localQuestions = shuffled.slice(0, 10).map((w, idx) => {
      const term = w.term || '';
      const hidden = term
        .split('')
        .map((char: string, cIdx: number) => (cIdx === 0 || cIdx === term.length - 1 ? char : '_'))
        .join(' ');

      return {
        roundId: idx + 1,
        wordEn: term,
        wordVi: w.meaningVi,
        ipa: w.ipa,
        hint: w.exampleEn || `Định nghĩa: ${w.meaningVi}`,
        hiddenEn: hidden,
        timeLimit: 10,
        options: [term, ...shuffled.filter((item) => item.term !== term).slice(0, 3).map((item) => item.term)].sort(
          () => Math.random() - 0.5
        ),
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

    // Bot Response Simulator
    const botDelay =
      this.botDifficulty === 'hard'
        ? Math.random() * 3000 + 2500 // 2.5s - 5.5s
        : this.botDifficulty === 'medium'
        ? Math.random() * 4000 + 4000 // 4s - 8s
        : Math.random() * 4000 + 7000; // 7s - 11s

    const botWillAnswerCorrect =
      this.botDifficulty === 'hard' ? Math.random() < 0.85 : this.botDifficulty === 'medium' ? Math.random() < 0.65 : Math.random() < 0.45;

    this.localTimer = setTimeout(() => {
      if (botWillAnswerCorrect) {
        battleSounds.playDamage();
        this.localPlayers.bot.score += 100;
        this.localPlayers.bot.combo += 1;
        this.localPlayers.user.hp = Math.max(0, this.localPlayers.user.hp - 20);
        this.listeners.onRoundResult?.({
          roundId: this.currentRound,
          winnerId: 'bot',
          winnerName: this.localPlayers.bot.username,
          correctAnswer: `${q.wordEn} (${q.wordVi})`,
          players: { ...this.localPlayers },
          damageDealt: 20,
        });
      } else {
        // Time out round
        this.listeners.onRoundResult?.({
          roundId: this.currentRound,
          winnerId: undefined,
          winnerName: undefined,
          correctAnswer: `${q.wordEn} (${q.wordVi})`,
          players: { ...this.localPlayers },
        });
      }
      this.checkGameOverOrNext();
    }, botDelay);
  }

  private checkGameOverOrNext() {
    if (this.localPlayers.user.hp <= 0 || this.localPlayers.bot.hp <= 0 || this.currentRound >= this.localQuestions.length) {
      setTimeout(() => this.finishLocalGame(), 2000);
    } else {
      setTimeout(() => this.startNextLocalRound(), 2500);
    }
  }

  private finishLocalGame() {
    if (this.localTimer) clearTimeout(this.localTimer);
    const userHp = this.localPlayers.user.hp;
    const botHp = this.localPlayers.bot.hp;
    const userWon = userHp > botHp || (userHp === botHp && this.localPlayers.user.score >= this.localPlayers.bot.score);

    if (userWon) {
      battleSounds.playVictory();
    } else {
      battleSounds.playDefeat();
    }

    this.listeners.onGameOver?.({
      winnerId: userWon ? 'user' : 'bot',
      winnerName: userWon ? this.localPlayers.user.username : this.localPlayers.bot.username,
      isDraw: userHp === botHp && this.localPlayers.user.score === this.localPlayers.bot.score,
      finalPlayers: { ...this.localPlayers },
      coinsGained: userWon ? 50 : 15,
      expGained: userWon ? 100 : 35,
      roundsPlayed: this.currentRound,
      totalWordsReviewed: this.currentRound,
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
