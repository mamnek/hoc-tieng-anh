import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Word,
  WordSet,
  UserWordProgress,
  PracticeSession,
  User,
  ChatMessage,
  ShopItem,
  DailyActivity,
  GameMode,
  VideoItem,
  VideoSegment,
  VideoQuizQuestion,
  ShadowingAttempt,
  SpeakingQuestionSet,
  SpeakingAttempt,
  SpeakingErrorReport,
} from './types';
import { presetWordSets, presetWords } from './preset-data';
import { presetVideos, presetVideoSegments, presetVideoQuizzes } from './preset-videos';
import { presetSpeakingSets } from './preset-speaking';
import { calculateNextReview } from './srs';
import { generateId } from './utils';

interface AppState {
  // Auth & User
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  user: User; // For backwards compatibility
  registerUser: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logoutUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  syncCloudData: () => Promise<void>;

  // Word Sets
  wordSets: WordSet[];
  addWordSet: (set: Omit<WordSet, 'id' | 'createdAt' | 'wordCount'>) => string;
  deleteWordSet: (id: string) => void;
  copyPresetWordSet: (presetId: string) => void;

  // Words
  words: Word[];
  addWords: (words: Omit<Word, 'id'>[]) => void;
  updateWord: (id: string, updates: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  getWordsBySet: (setId: string) => Word[];

  // SRS Progress
  progress: UserWordProgress[];
  getProgress: (wordId: string) => UserWordProgress | undefined;
  updateProgress: (wordId: string, isCorrect: boolean) => void;
  toggleMastered: (wordId: string) => void;
  getDueWords: (setId?: string) => Word[];

  // Practice Sessions
  sessions: PracticeSession[];
  addSession: (session: Omit<PracticeSession, 'id' | 'playedAt'>) => void;

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (content: string) => void;

  // Shop
  shopItems: ShopItem[];
  purchaseItem: (itemId: string) => boolean;

  // Daily Activity
  dailyActivities: DailyActivity[];
  recordActivity: () => void;

  // Streak
  checkAndUpdateStreak: () => void;

  // Videos
  videos: VideoItem[];
  videoSegments: Record<string, VideoSegment[]>;
  videoQuizzes: Record<string, VideoQuizQuestion[]>;
  addVideo: (video: Omit<VideoItem, 'id' | 'createdAt' | 'completedSegmentsCount'>) => string;
  updateVideoProgress: (videoId: string, completedCount: number) => void;
  deleteVideo: (videoId: string) => void;
  shadowingAttempts: ShadowingAttempt[];
  addShadowingAttempt: (attempt: Omit<ShadowingAttempt, 'id' | 'createdAt'>) => void;

  // IELTS Speaking
  speakingQuestionSets: SpeakingQuestionSet[];
  speakingAttempts: SpeakingAttempt[];
  speakingErrorReports: SpeakingErrorReport[];
  addSpeakingQuestionSet: (set: Omit<SpeakingQuestionSet, 'id' | 'createdAt'>) => string;
  deleteSpeakingQuestionSet: (id: string) => void;
  addSpeakingAttempt: (attempt: Omit<SpeakingAttempt, 'id' | 'createdAt'>) => string;
  addSpeakingErrorReport: (report: Omit<SpeakingErrorReport, 'id' | 'createdAt'>) => void;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Stats
  getMasteredCount: () => number;
  getNotMasteredCount: () => number;
  getTotalWords: () => number;
  getProgressPercent: () => number;
}

const defaultUser: User = {
  id: 'user-guest',
  name: 'Học viên',
  email: 'hocvien@gmail.com',
  password: '123',
  avatarUrl: '',
  streakCount: 1,
  lastActiveDate: new Date().toISOString(),
  coins: 50,
  createdAt: new Date().toISOString(),
};

const defaultShopItems: ShopItem[] = [
  {
    id: 'shop-1',
    name: 'Đóng băng Streak',
    description: 'Bảo vệ chuỗi ngày học khi bạn lỡ 1 ngày không học',
    priceCoins: 50,
    imageUrl: '❄️',
    type: 'freeze',
  },
  {
    id: 'shop-2',
    name: 'Theme Hoàng hôn',
    description: 'Giao diện màu cam ấm áp cho ứng dụng',
    priceCoins: 100,
    imageUrl: '🌅',
    type: 'theme',
  },
  {
    id: 'shop-3',
    name: 'Theme Đại dương',
    description: 'Giao diện xanh dương mát mẻ',
    priceCoins: 100,
    imageUrl: '🌊',
    type: 'theme',
  },
  {
    id: 'shop-4',
    name: 'Avatar Sư tử',
    description: 'Khung avatar hình sư tử dũng mãnh',
    priceCoins: 75,
    imageUrl: '🦁',
    type: 'avatar',
  },
  {
    id: 'shop-5',
    name: 'Avatar Phượng hoàng',
    description: 'Khung avatar phượng hoàng rực lửa',
    priceCoins: 75,
    imageUrl: '🔥',
    type: 'avatar',
  },
  {
    id: 'shop-6',
    name: 'Huy hiệu Vàng',
    description: 'Huy hiệu vàng bên cạnh tên của bạn',
    priceCoins: 200,
    imageUrl: '🏅',
    type: 'badge',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth & User State
      users: [defaultUser],
      currentUser: defaultUser,
      isAuthenticated: true,
      user: defaultUser,

      registerUser: async (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Try Cloud Register via MongoDB
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email: normalizedEmail, password }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            const user: User = data.user;
            set((state) => ({
              users: [...state.users.filter((u) => u.email.toLowerCase() !== normalizedEmail), user],
              currentUser: user,
              isAuthenticated: true,
              user,
            }));
            return { success: true };
          } else if (data.error) {
            return { success: false, error: data.error };
          }
        } catch (_) {
          // Fallback to local storage if offline
        }

        // Local fallback
        const existing = get().users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
          return { success: false, error: 'Email này đã được đăng ký tài khoản!' };
        }

        const newUser: User = {
          id: generateId(),
          name: name.trim(),
          email: normalizedEmail,
          password: password || '',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          streakCount: 1,
          lastActiveDate: new Date().toISOString(),
          coins: 50,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
          user: newUser,
        }));

        return { success: true };
      },

      loginUser: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Try Cloud Login via MongoDB
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail, password }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            const user: User = data.user;
            const updates: any = {
              currentUser: user,
              isAuthenticated: true,
              user,
              users: [...get().users.filter((u) => u.email.toLowerCase() !== normalizedEmail), user],
            };

            // Restore cloud data if available
            if (data.cloudData) {
              if (data.cloudData.progress && data.cloudData.progress.length > 0) {
                updates.progress = data.cloudData.progress;
              }
              if (data.cloudData.wordSets && data.cloudData.wordSets.length > 0) {
                updates.wordSets = data.cloudData.wordSets;
              }
              if (data.cloudData.words && data.cloudData.words.length > 0) {
                updates.words = data.cloudData.words;
              }
              if (data.cloudData.sessions && data.cloudData.sessions.length > 0) {
                updates.sessions = data.cloudData.sessions;
              }
            }

            set(updates);
            return { success: true };
          } else if (data.error) {
            return { success: false, error: data.error };
          }
        } catch (_) {
          // Fallback to local storage
        }

        // Local fallback
        const found = get().users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!found) {
          return { success: false, error: 'Email hoặc mật khẩu không chính xác!' };
        }

        if (password && found.password && found.password !== password) {
          return { success: false, error: 'Mật khẩu không chính xác!' };
        }

        set({
          currentUser: found,
          isAuthenticated: true,
          user: found,
        });

        return { success: true };
      },

      logoutUser: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          user: defaultUser,
        });
      },

      updateUser: (updates) => {
        set((state) => {
          const target = state.currentUser || state.user;
          const updatedUser = { ...target, ...updates };
          return {
            currentUser: state.currentUser ? updatedUser : null,
            user: updatedUser,
            users: state.currentUser
              ? state.users.map((u) => (u.id === state.currentUser?.id ? updatedUser : u))
              : state.users,
          };
        });

        // Trigger background sync to MongoDB
        setTimeout(() => {
          get().syncCloudData();
        }, 500);
      },

      syncCloudData: async () => {
        const state = get();
        const user = state.currentUser;
        if (!user || !user.id || user.id === 'user-guest') return;

        try {
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userUpdates: {
                coins: user.coins,
                streakCount: user.streakCount,
                lastActiveDate: user.lastActiveDate,
                avatarUrl: user.avatarUrl,
              },
              progress: state.progress,
              wordSets: state.wordSets.filter((s) => !s.isPreset),
              words: state.words.filter((w) => state.wordSets.some((s) => s.id === w.wordSetId && !s.isPreset)),
              sessions: state.sessions.slice(-50),
              speakingAttempts: state.speakingAttempts.slice(-20),
            }),
          });
        } catch (_) {
          // Ignore background sync errors
        }
      },

      // Word Sets
      wordSets: presetWordSets.map((s) => ({
        ...s,
        wordCount: presetWords.filter((w) => w.wordSetId === s.id).length,
      })),
      addWordSet: (wordSetData) => {
        const id = generateId();
        const newSet: WordSet = {
          ...wordSetData,
          id,
          wordCount: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ wordSets: [...state.wordSets, newSet] }));
        return id;
      },
      deleteWordSet: (id) =>
        set((state) => ({
          wordSets: state.wordSets.filter((s) => s.id !== id),
          words: state.words.filter((w) => w.wordSetId !== id),
        })),
      copyPresetWordSet: (presetId) => {
        const state = get();
        const presetSet = presetWordSets.find((s) => s.id === presetId);
        if (!presetSet) return;

        const newSetId = generateId();
        const newSet: WordSet = {
          ...presetSet,
          id: newSetId,
          isPreset: false,
          createdAt: new Date().toISOString(),
        };

        const presetSetWords = presetWords.filter(
          (w) => w.wordSetId === presetId
        );
        const newWords: Word[] = presetSetWords.map((w) => ({
          ...w,
          id: generateId(),
          wordSetId: newSetId,
        }));

        set((state) => ({
          wordSets: [...state.wordSets, newSet],
          words: [...state.words, ...newWords],
        }));
      },

      // Words
      words: [...presetWords],
      addWords: (newWords) => {
        const wordsWithIds: Word[] = newWords.map((w) => ({
          ...w,
          id: generateId(),
        }));
        set((state) => {
          const updatedWords = [...state.words, ...wordsWithIds];
          const wordSets = state.wordSets.map((ws) => ({
            ...ws,
            wordCount: updatedWords.filter((w) => w.wordSetId === ws.id).length,
          }));
          return { words: updatedWords, wordSets };
        });
      },
      updateWord: (id, updates) =>
        set((state) => ({
          words: state.words.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      deleteWord: (id) =>
        set((state) => {
          const updatedWords = state.words.filter((w) => w.id !== id);
          const wordSets = state.wordSets.map((ws) => ({
            ...ws,
            wordCount: updatedWords.filter((w) => w.wordSetId === ws.id).length,
          }));
          return {
            words: updatedWords,
            wordSets,
            progress: state.progress.filter((p) => p.wordId !== id),
          };
        }),
      getWordsBySet: (setId) => get().words.filter((w) => w.wordSetId === setId),

      // SRS Progress
      progress: [],
      getProgress: (wordId) =>
        get().progress.find((p) => p.wordId === wordId),
      updateProgress: (wordId, isCorrect) => {
        const state = get();
        const existing = state.progress.find((p) => p.wordId === wordId);
        const currentLevel = existing?.srsLevel ?? 0;
        const { newLevel, nextReviewDate } = calculateNextReview(
          currentLevel,
          isCorrect
        );

        const updatedProgress: UserWordProgress = {
          wordId,
          srsLevel: newLevel,
          nextReviewDate: nextReviewDate.toISOString(),
          isMastered: newLevel >= 4,
          lastResult: isCorrect ? 'correct' : 'incorrect',
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          progress: existing
            ? state.progress.map((p) =>
                p.wordId === wordId ? updatedProgress : p
              )
            : [...state.progress, updatedProgress],
        }));
      },
      toggleMastered: (wordId) => {
        const state = get();
        const existing = state.progress.find((p) => p.wordId === wordId);
        if (existing) {
          set((state) => ({
            progress: state.progress.map((p) =>
              p.wordId === wordId
                ? { ...p, isMastered: !p.isMastered, updatedAt: new Date().toISOString() }
                : p
            ),
          }));
        } else {
          set((state) => ({
            progress: [
              ...state.progress,
              {
                wordId,
                srsLevel: 0,
                nextReviewDate: new Date().toISOString(),
                isMastered: true,
                lastResult: null,
                updatedAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },
      getDueWords: (setId) => {
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let targetWords = state.words;
        if (setId) {
          targetWords = targetWords.filter((w) => w.wordSetId === setId);
        }

        return targetWords.filter((word) => {
          const prog = state.progress.find((p) => p.wordId === word.id);
          if (!prog) return true;
          const reviewDate = new Date(prog.nextReviewDate);
          reviewDate.setHours(0, 0, 0, 0);
          return reviewDate <= today;
        });
      },

      // Practice Sessions
      sessions: [],
      addSession: (sessionData) => {
        const session: PracticeSession = {
          ...sessionData,
          id: generateId(),
          playedAt: new Date().toISOString(),
        };
        const coinsEarned = sessionData.coinsEarned;

        set((state) => {
          const activeUser = state.currentUser || state.user;
          const updatedUser = {
            ...activeUser,
            coins: activeUser.coins + coinsEarned,
          };
          return {
            sessions: [session, ...state.sessions].slice(0, 50),
            currentUser: state.currentUser ? updatedUser : null,
            user: updatedUser,
            users: state.currentUser
              ? state.users.map((u) => (u.id === state.currentUser?.id ? updatedUser : u))
              : state.users,
          };
        });

        get().recordActivity();
        get().checkAndUpdateStreak();
      },

      // Chat Messages
      chatMessages: [
        {
          id: 'msg-1',
          userId: 'user-bot',
          userName: 'VocabBot',
          userAvatar: '🤖',
          content: 'Chào mừng đến với cộng đồng học từ vựng! 🎉',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg-2',
          userId: 'user-2',
          userName: 'Minh Anh',
          userAvatar: '👩',
          content: 'Mọi người ơi, hôm nay mình đã học được 50 từ mới!',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'msg-3',
          userId: 'user-3',
          userName: 'Đức Huy',
          userAvatar: '👨',
          content: 'Có ai đang ôn IELTS không? Cùng nhau nào 💪',
          createdAt: new Date(Date.now() - 900000).toISOString(),
        },
      ],
      addChatMessage: (content) => {
        const state = get();
        const activeUser = state.currentUser || state.user;
        const msg: ChatMessage = {
          id: generateId(),
          userId: activeUser.id,
          userName: activeUser.name,
          userAvatar: activeUser.avatarUrl || '😊',
          content,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, msg],
        }));
      },

      // Shop
      shopItems: defaultShopItems,
      purchaseItem: (itemId) => {
        const state = get();
        const activeUser = state.currentUser || state.user;
        const item = state.shopItems.find((i) => i.id === itemId);
        if (!item || activeUser.coins < item.priceCoins || item.owned)
          return false;

        const updatedUser = {
          ...activeUser,
          coins: activeUser.coins - item.priceCoins,
        };

        set((state) => ({
          currentUser: state.currentUser ? updatedUser : null,
          user: updatedUser,
          users: state.currentUser
            ? state.users.map((u) => (u.id === state.currentUser?.id ? updatedUser : u))
            : state.users,
          shopItems: state.shopItems.map((i) =>
            i.id === itemId ? { ...i, owned: true } : i
          ),
        }));
        return true;
      },

      // Daily Activity
      dailyActivities: [],
      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const existing = state.dailyActivities.find(
            (a) => a.date === today
          );
          if (existing) {
            return {
              dailyActivities: state.dailyActivities.map((a) =>
                a.date === today ? { ...a, count: a.count + 1 } : a
              ),
            };
          }
          return {
            dailyActivities: [
              ...state.dailyActivities,
              { date: today, count: 1 },
            ],
          };
        });
      },

      // Streak
      checkAndUpdateStreak: () => {
        const state = get();
        const activeUser = state.currentUser || state.user;
        if (!activeUser) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActive = new Date(activeUser.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today.getTime() - lastActive.getTime()) / 86400000
        );

        if (diffDays === 0) return;

        let newStreak = activeUser.streakCount;
        if (diffDays === 1) {
          newStreak = activeUser.streakCount + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }

        const updatedUser = {
          ...activeUser,
          streakCount: newStreak,
          lastActiveDate: today.toISOString(),
        };

        set((state) => ({
          currentUser: state.currentUser ? updatedUser : null,
          user: updatedUser,
          users: state.currentUser
            ? state.users.map((u) => (u.id === state.currentUser?.id ? updatedUser : u))
            : state.users,
        }));
      },

      // Videos
      videos: [...presetVideos],
      videoSegments: { ...presetVideoSegments },
      videoQuizzes: { ...presetVideoQuizzes },
      addVideo: (videoData) => {
        const id = generateId();
        const newVideo: VideoItem = {
          ...videoData,
          id,
          completedSegmentsCount: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          videos: [newVideo, ...state.videos],
        }));
        return id;
      },
      updateVideoProgress: (videoId, completedCount) => {
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === videoId ? { ...v, completedSegmentsCount: completedCount } : v
          ),
        }));
      },
      deleteVideo: (videoId) => {
        set((state) => {
          const newVideos = (state.videos || []).filter((v) => v.id !== videoId);
          const newSegments = { ...(state.videoSegments || {}) };
          delete newSegments[videoId];
          const newQuizzes = { ...(state.videoQuizzes || {}) };
          delete newQuizzes[videoId];
          return {
            videos: newVideos,
            videoSegments: newSegments,
            videoQuizzes: newQuizzes,
          };
        });
      },

      shadowingAttempts: [],
      addShadowingAttempt: (attemptData) => {
        const attempt: ShadowingAttempt = {
          ...attemptData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          shadowingAttempts: [attempt, ...state.shadowingAttempts],
        }));
      },

      // IELTS Speaking
      speakingQuestionSets: [...presetSpeakingSets],
      speakingAttempts: [],
      speakingErrorReports: [],
      addSpeakingQuestionSet: (setData) => {
        const id = `speaking-set-custom-${generateId()}`;
        const newSet: SpeakingQuestionSet = {
          ...setData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          speakingQuestionSets: [newSet, ...(state.speakingQuestionSets || [])],
        }));
        return id;
      },
      deleteSpeakingQuestionSet: (id: string) => {
        set((state) => ({
          speakingQuestionSets: (state.speakingQuestionSets || []).filter((s) => s.id !== id),
        }));
      },
      addSpeakingAttempt: (attemptData) => {
        const id = generateId();
        const newAttempt: SpeakingAttempt = {
          ...attemptData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const earnedCoins = attemptData.mode === 'full_mock' ? 30 : 10;
          const currentUser = state.currentUser
            ? { ...state.currentUser, coins: (state.currentUser.coins || 0) + earnedCoins }
            : null;
          const updatedUsers = state.currentUser && currentUser
            ? state.users.map((u) => (u.id === currentUser.id ? currentUser : u))
            : state.users;
          return {
            speakingAttempts: [newAttempt, ...(state.speakingAttempts || [])],
            currentUser,
            user: currentUser || state.user,
            users: updatedUsers,
          };
        });
        get().checkAndUpdateStreak();
        get().recordActivity();
        return id;
      },
      addSpeakingErrorReport: (reportData) => {
        const report: SpeakingErrorReport = {
          ...reportData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          speakingErrorReports: [report, ...(state.speakingErrorReports || [])],
        }));
      },

      // Dark Mode
      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Stats
      getMasteredCount: () =>
        get().progress.filter((p) => p.isMastered).length,
      getNotMasteredCount: () => {
        const state = get();
        return (
          state.words.length -
          state.progress.filter((p) => p.isMastered).length
        );
      },
      getTotalWords: () => get().words.length,
      getProgressPercent: () => {
        const state = get();
        if (state.words.length === 0) return 0;
        return Math.round(
          (state.progress.filter((p) => p.isMastered).length /
            state.words.length) *
            100
        );
      },
    }),
    {
      name: 'vocab-app-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure preset words are present in state.words
          const existingWordIds = new Set((state.words || []).map((w) => w.id));
          const missingPresetWords = presetWords.filter((pw) => !existingWordIds.has(pw.id));
          
          if (missingPresetWords.length > 0) {
            state.words = [...(state.words || []), ...missingPresetWords];
          }

          // Ensure preset word sets exist
          const existingSetIds = new Set((state.wordSets || []).map((s) => s.id));
          const missingPresetSets = presetWordSets.filter((ps) => !existingSetIds.has(ps.id));

          if (missingPresetSets.length > 0) {
            state.wordSets = [...(state.wordSets || []), ...missingPresetSets];
          }

          // Ensure preset videos exist
          const existingVidIds = new Set((state.videos || []).map((v) => v.id));
          const missingPresetVids = presetVideos.filter((pv) => !existingVidIds.has(pv.id));

          if (missingPresetVids.length > 0) {
            state.videos = [...(state.videos || []), ...missingPresetVids];
          }

          // Ensure preset video segments exist
          const existingSegments = state.videoSegments || {};
          let updatedSegments = { ...existingSegments };
          Object.keys(presetVideoSegments).forEach((pid) => {
            if (!updatedSegments[pid]) {
              updatedSegments[pid] = presetVideoSegments[pid];
            }
          });
          state.videoSegments = updatedSegments;

          // Ensure preset video quizzes exist
          const existingQuizzes = state.videoQuizzes || {};
          let updatedQuizzes = { ...existingQuizzes };
          Object.keys(presetVideoQuizzes).forEach((pid) => {
            if (!updatedQuizzes[pid]) {
              updatedQuizzes[pid] = presetVideoQuizzes[pid];
            }
          });
          state.videoQuizzes = updatedQuizzes;

          // Ensure speaking question sets exist
          const existingSpeakingIds = new Set((state.speakingQuestionSets || []).map((s) => s.id));
          const missingSpeakingSets = presetSpeakingSets.filter((ps) => !existingSpeakingIds.has(ps.id));
          if (missingSpeakingSets.length > 0) {
            state.speakingQuestionSets = [...(state.speakingQuestionSets || []), ...missingSpeakingSets];
          }

          // Ensure default user is authenticated if empty
          if (!state.currentUser) {
            state.currentUser = defaultUser;
            state.user = defaultUser;
            state.isAuthenticated = true;
          }
          if (!state.users || state.users.length === 0) {
            state.users = [defaultUser];
          }

          // Recalculate word counts for all sets
          state.wordSets = state.wordSets.map((ws) => ({
            ...ws,
            wordCount: state.words.filter((w) => w.wordSetId === ws.id).length,
          }));
        }
      },
    }
  )
);
