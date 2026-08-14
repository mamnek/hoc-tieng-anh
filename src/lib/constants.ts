export const COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  
  streak: '#F97316',
  streakLight: '#FDBA74',
  
  coin: '#EAB308',
  coinLight: '#FDE047',
  
  mastered: '#22C55E',
  masteredLight: '#86EFAC',
  
  total: '#3B82F6',
  totalLight: '#93C5FD',
  
  matching: '#A29BFE',
  quiz: '#F97316',
  listening: '#14B8A6',
  mixed: '#EC4899',
  typing: '#3B82F6',
  flashcard: '#6C5CE7',
  
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

export const GAME_MODES = [
  {
    id: 'flashcard' as const,
    name: 'Flashcard',
    description: 'Lật thẻ học từ vựng',
    icon: 'Layers',
    coins: 5,
    color: COLORS.flashcard,
    bgGradient: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'quiz' as const,
    name: 'Trắc nghiệm',
    description: 'Chọn đáp án đúng',
    icon: 'CircleHelp',
    coins: 10,
    color: COLORS.quiz,
    bgGradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'matching' as const,
    name: 'Nối từ với nghĩa',
    description: 'Ghép đôi từ vựng và nghĩa',
    icon: 'Link',
    coins: 10,
    color: COLORS.matching,
    bgGradient: 'from-violet-600 to-purple-700',
  },
  {
    id: 'typing' as const,
    name: 'Gõ từ vựng',
    description: 'Nhìn nghĩa và gõ từ tiếng Anh',
    icon: 'Keyboard',
    coins: 10,
    color: COLORS.typing,
    bgGradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'listening' as const,
    name: 'Nghe viết',
    description: 'Nghe phát âm và viết từ',
    icon: 'Headphones',
    coins: 15,
    color: COLORS.listening,
    bgGradient: 'from-teal-600 to-emerald-600',
    hot: true,
  },
  {
    id: 'mixed' as const,
    name: 'Tổng hợp',
    description: 'Random trộn tất cả các dạng trên',
    icon: 'Shuffle',
    coins: 20,
    color: COLORS.mixed,
    bgGradient: 'from-pink-600 to-rose-700',
  },
];

export const NAV_ITEMS = [
  { path: '/', label: 'Trang chủ', icon: 'Home' },
  { path: '/video', label: 'Học qua Video', icon: 'Video' },
  { path: '/word-sets', label: 'Bộ từ vựng', icon: 'FolderOpen' },
  { path: '/words', label: 'Từ vựng', icon: 'BookOpen' },
  { path: '/practice', label: 'Game phản xạ', icon: 'Gamepad2' },
  { path: '/shop', label: 'Cửa hàng', icon: 'ShoppingBag' },
  { path: '/leaderboard', label: 'Xếp hạng', icon: 'Trophy' },
  { path: '/roadmap', label: 'Lộ trình học', icon: 'Map' },
];

export const EXAM_TYPES = ['IELTS', 'TOEIC', 'SAT', 'THPT', 'Custom'] as const;

export const PART_OF_SPEECH_OPTIONS = [
  { value: 'noun', label: 'Danh từ' },
  { value: 'verb', label: 'Động từ' },
  { value: 'adjective', label: 'Tính từ' },
  { value: 'adverb', label: 'Trạng từ' },
  { value: 'preposition', label: 'Giới từ' },
  { value: 'conjunction', label: 'Liên từ' },
  { value: 'pronoun', label: 'Đại từ' },
  { value: 'phrase', label: 'Cụm từ' },
];

export const QUIZ_TIME_LIMIT = 25; // seconds per question
export const WORDS_PER_PAGE = 20;
