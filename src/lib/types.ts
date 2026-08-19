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
  arenaElo?: number;
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

// ──────────────── IELTS Speaking Types ────────────────
export interface SpeakingQuestion {
  id: string;
  text: string;
  part: 1 | 2 | 3;
  suggestedDurationSeconds: number;
  topic: string;
  sampleAnswerBand8?: string;
  collocations?: string[];
  ideaHints?: string[];
}

export interface SpeakingCueCard {
  id: string;
  topic: string;
  title: string;
  bulletPoints: string[];
  prepTimeSeconds: number; // 60s
  speakingTimeSeconds: number; // 120s
  sampleAnswerBand8: string;
  collocations: string[];
  ideaHints: string[];
}

export interface SpeakingQuestionSet {
  id: string;
  title: string;
  topic: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  badge?: string;
  description: string;
  part1Questions: SpeakingQuestion[];
  part2CueCard: SpeakingCueCard;
  part3Questions: SpeakingQuestion[];
  isNew?: boolean;
  createdAt: string;
}

export interface WordPronunciationItem {
  word: string;
  targetWord?: string;
  ipa: string;
  severity: 'none' | 'minor' | 'light' | 'heavy';
  feedback?: string;
  status?: 'correct' | 'mispronounced' | 'omitted' | 'inserted';
}

export interface CriteriaScoreDetail {
  name: 'Fluency & Coherence' | 'Lexical Resource' | 'Grammatical Range & Accuracy' | 'Pronunciation';
  nameVi: string;
  score: number; // 0.0 - 9.0
  feedback: string;
  suggestion: string;
  details: string;
}

export interface InlineCorrectionItem {
  originalText: string;
  correctedText: string;
  insertedPhrases: string[];
  explanation: string;
}

export interface SpeakingAttemptAnswer {
  questionId: string;
  questionText: string;
  part: 1 | 2 | 3;
  audioUrl?: string;
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  speakingRateWpm: number;
  overallBand: number;
  criteriaScores: CriteriaScoreDetail[];
  wordLevelPronunciation: WordPronunciationItem[];
  inlineCorrections: InlineCorrectionItem;
  improvedAnswer: string;
  ideaExpansion: string[];
  vocabularySuggestions: string[];
}

export interface SpeakingAttempt {
  id: string;
  userId: string;
  questionSetId: string;
  questionSetTitle: string;
  topic: string;
  mode: 'full_mock' | 'single_question';
  overallBand: number;
  fluencyBand: number;
  lexicalBand: number;
  grammarBand: number;
  pronunciationBand: number;
  totalDurationSeconds: number;
  answers: SpeakingAttemptAnswer[];
  createdAt: string;
}

export interface SpeakingErrorReport {
  id: string;
  userId: string;
  attemptId: string;
  questionText: string;
  transcript: string;
  scoreReported: number;
  userNote: string;
  createdAt: string;
}

// ──────────────── IELTS Vocab Battle Arena Types ────────────────
export interface BattlePlayer {
  id: string;
  username: string;
  avatar?: string;
  hp: number; // 0 - 100
  score: number;
  combo: number;
  isReady: boolean;
  isHost?: boolean;
  isBot?: boolean;
  streak: number;
}

export interface BattleQuestion {
  roundId: number;
  wordEn: string;
  wordVi: string;
  ipa?: string;
  hint: string;
  hiddenEn: string;
  category?: string;
  timeLimit: number; // seconds
  options?: string[]; // for MCQ/collocations
}

export interface BattleRoundResult {
  roundId: number;
  winnerId?: string;
  winnerName?: string;
  correctAnswer: string;
  explanation?: string;
  players: Record<string, BattlePlayer>;
  damageDealt?: number;
}

export interface BattleGameOver {
  winnerId: string;
  winnerName: string;
  isDraw?: boolean;
  finalPlayers: Record<string, BattlePlayer>;
  coinsGained: number;
  expGained: number;
  roundsPlayed: number;
  totalWordsReviewed: number;
}


