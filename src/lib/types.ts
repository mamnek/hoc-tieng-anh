export interface Word {
  id: string;
  wordSetId: string;
  term: string;
  ipa: string;
  meaningVi: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'phrase';
  exampleEn: string;
  exampleVi: string;
  audioUrl?: string;
}

export interface WordSet {
  id: string;
  name: string;
  category: string;
  examType: 'IELTS' | 'TOEIC' | 'SAT' | 'THPT' | 'Custom';
  isPreset: boolean; // true = system preset, false = user-created
  wordCount: number;
  createdAt: string;
}

export interface UserWordProgress {
  wordId: string;
  srsLevel: number; // 0-5
  nextReviewDate: string; // ISO date string
  isMastered: boolean;
  lastResult: 'correct' | 'incorrect' | null;
  updatedAt: string;
}

export interface PracticeSession {
  id: string;
  mode: GameMode;
  wordSetId: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  coinsEarned: number;
  playedAt: string;
}

export type GameMode = 'flashcard' | 'quiz' | 'matching' | 'typing' | 'listening' | 'mixed';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  streakCount: number;
  lastActiveDate: string; // ISO date
  coins: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  imageUrl: string;
  type: 'theme' | 'avatar' | 'freeze' | 'badge';
  owned?: boolean;
}

export interface GameConfig {
  wordSetId: string;
  filter: 'all' | 'mastered' | 'not-mastered';
  order: 'random' | 'sequential';
  count: number;
}

export interface QuizQuestion {
  word: Word;
  options: string[];
  correctIndex: number;
  type: 'word-to-meaning' | 'meaning-to-word';
}

export interface DailyActivity {
  date: string;
  count: number; // number of words studied
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  wordSetIds: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  requiredNodeId?: string;
}

export interface VideoSegment {
  id: string;
  videoId: string;
  orderIndex: number;
  startTime: number; // seconds
  endTime: number; // seconds
  textEn: string;
  ipa: string;
  translationVi: string;
}

export interface VideoQuizQuestion {
  id: string;
  videoId: string;
  segmentId: string;
  type: 'meaning' | 'vocabulary' | 'fill-in-the-blank';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ShadowingAttempt {
  id: string;
  userId: string;
  segmentId: string;
  audioUrl?: string;
  recognizedText: string;
  accuracyScore: number;
  wordDiffs: { word: string; status: 'correct' | 'incorrect' | 'missing' }[];
  createdAt: string;
}

export interface VideoItem {
  id: string;
  userId?: string;
  sourceType: 'youtube' | 'upload';
  youtubeId?: string;
  videoUrl?: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  category: string;
  level: 'Sơ cấp' | 'Trung cấp' | 'Nâng cao';
  status: 'processing' | 'ready' | 'failed';
  segmentsCount: number;
  completedSegmentsCount: number;
  createdAt: string;
}
