'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SpeakingQuestionSet } from '@/lib/types';
import {
  Mic,
  Sparkles,
  Award,
  Clock,
  Search,
  Flame,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Play,
  Volume2,
  BookOpen,
  Filter,
  TrendingUp,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SpeakingHubPage() {
  const router = useRouter();
  const { speakingQuestionSets, speakingAttempts, currentUser } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'sets' | 'history'>('sets');

  // Selected set for "Luyện theo câu" question picker modal
  const [questionPickerSet, setQuestionPickerSet] = useState<SpeakingQuestionSet | null>(null);

  // Filter question sets
  const filteredSets = (speakingQuestionSets || []).filter((set) => {
    const matchSearch =
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = selectedLevel === 'all' || set.level === selectedLevel;
    const matchBadge = selectedBadge === 'all' || (set.badge && set.badge.toLowerCase().includes(selectedBadge.toLowerCase()));
    return matchSearch && matchLevel && matchBadge;
  });

  // Calculate user stats
  const totalAttempts = speakingAttempts?.length || 0;
  const averageBand = totalAttempts > 0
    ? (speakingAttempts.reduce((acc, a) => acc + a.overallBand, 0) / totalAttempts).toFixed(1)
    : '0.0';
  const highestBand = totalAttempts > 0
    ? Math.max(...speakingAttempts.map((a) => a.overallBand)).toFixed(1)
    : '0.0';

  // Prepare chart data for history
  const historyChartData = [...(speakingAttempts || [])]
    .reverse()
    .slice(-10)
    .map((att, idx) => ({
      index: `#${idx + 1}`,
      date: new Date(att.createdAt).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
      band: att.overallBand,
      topic: att.topic,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              IELTS Speaking Virtual Examiner • Chuẩn 4 Tiêu Chí
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Luyện Nói IELTS Speaking AI
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Mô phỏng 100% phòng thi thật với giám khảo bản xứ. Chấm điểm chi tiết 4 tiêu chí (Fluency, Lexical, Grammar, Pronunciation), phân tích phát âm từng từ với phiên âm IPA.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block">{averageBand}</span>
              <span className="text-[11px] text-white/80 font-medium">Band Trung Bình</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 block">{highestBand}</span>
              <span className="text-[11px] text-white/80 font-medium">Band Cao Nhất</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">{totalAttempts}</span>
              <span className="text-[11px] text-white/80 font-medium">Lượt Thi Đã Làm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Bộ đề vs Lịch sử thi) */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('sets')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sets'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          Ngân Hàng Bộ Đề IELTS ({filteredSets.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Lịch Sử & Tiến Bộ ({speakingAttempts?.length || 0})
        </button>
      </div>

      {/* TAB 1: BỘ ĐỀ THI */}
      {activeTab === 'sets' && (
        <div className="space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm chủ đề, bộ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* Level & Badge Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl text-xs font-semibold">
                {[
                  { id: 'all', label: 'Tất cả cấp độ' },
                  { id: 'Cơ bản', label: 'Cơ bản' },
                  { id: 'Trung cấp', label: 'Trung cấp' },
                  { id: 'Nâng cao', label: 'Nâng cao' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedLevel === lvl.id
                        ? 'bg-white dark:bg-gray-800 text-primary font-bold shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl text-xs font-semibold">
                {[
                  { id: 'all', label: 'Tất cả đề' },
                  { id: 'Forecast', label: 'Dự đoán (Forecast)' },
                  { id: 'Hot', label: 'Hot 🔥' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBadge(bg.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedBadge === bg.id
                        ? 'bg-white dark:bg-gray-800 text-primary font-bold shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Sets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set) => {
              const totalQuestions = (set.part1Questions?.length || 0) + 1 + (set.part3Questions?.length || 0);

              return (
                <div
                  key={set.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group justify-between"
                >
                  <div className="space-y-4">
                    {/* Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                        {set.topic}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {set.badge && (
                          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                            set.badge.includes('Hot')
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400'
                              : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                          }`}>
                            {set.badge}
                          </span>
                        )}
                        <span className="text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                          {set.level}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {set.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        {set.description}
                      </p>
                    </div>

                    {/* Parts Breakdown Box */}
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>• Part 1: Phỏng vấn ngắn</span>
                        <strong className="text-gray-900 dark:text-white">{set.part1Questions.length} câu</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Part 2: Cue Card (1m prep + 2m speak)</span>
                        <strong className="text-gray-900 dark:text-white">1 đề</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Part 3: Thảo luận chuyên sâu</span>
                        <strong className="text-gray-900 dark:text-white">{set.part3Questions.length} câu</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
                    <Link
                      href={`/speaking/practice/${set.id}?mode=full_mock`}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Thi thử (3 Parts)
                    </Link>

                    <button
                      onClick={() => setQuestionPickerSet(set)}
                      className="bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold px-3.5 py-3 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
                      title="Luyện từng câu đơn"
                    >
                      Luyện theo câu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LỊCH SỬ THI & BIỂU ĐỒ TIẾN BỘ */}
      {activeTab === 'history' && (
        <div className="space-y-8 animate-fade-in">
          {/* Band Score Trend Chart */}
          {historyChartData.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Biểu Đồ Tiến Bộ Band Điểm Qua Các Lần Thi
                  </h3>
                </div>
                <span className="text-xs text-gray-500">10 lượt thi gần nhất</span>
              </div>

              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis domain={[4.0, 9.0]} ticks={[4.0, 5.0, 6.0, 7.0, 8.0, 9.0]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold">{data.topic}</p>
                              <p className="text-amber-300 font-black text-sm">Band: {data.band.toFixed(1)}/9.0</p>
                              <p className="text-gray-400">Ngày: {data.date}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="band"
                      stroke="#6C5CE7"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#6C5CE7', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Past Attempts List */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Danh Sách Lượt Thi Đã Hoàn Thành
            </h3>

            {(!speakingAttempts || speakingAttempts.length === 0) ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
                <Mic className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">Bạn chưa thực hiện bài thi IELTS Speaking nào.</p>
                <button
                  onClick={() => setActiveTab('sets')}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Bắt đầu bài thi đầu tiên
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {speakingAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                          {attempt.topic}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(attempt.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white">
                        {attempt.questionSetTitle}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {attempt.mode === 'full_mock' ? 'Thi thử đầy đủ 3 Part' : 'Luyện theo câu đơn'} • Đã trả lời {attempt.answers?.length || 1} câu
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Band Điểm</span>
                        <span className="text-2xl font-black text-amber-500">
                          {attempt.overallBand.toFixed(1)}
                        </span>
                      </div>

                      <Link
                        href={`/speaking/practice/${attempt.questionSetId}?mode=full_mock`}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white p-2.5 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Thi lại
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Question Picker for "Luyện Theo Câu" */}
      {questionPickerSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-100 dark:border-gray-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">
                  {questionPickerSet.topic}
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Chọn câu hỏi để luyện tập
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Bộ đề: {questionPickerSet.title}
                </p>
              </div>

              <button
                onClick={() => setQuestionPickerSet(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Part 1 Questions */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Part 1 — Phỏng Vấn Ngắn (20-30s)
              </h4>
              <div className="space-y-2">
                {questionPickerSet.part1Questions.map((q, idx) => (
                  <Link
                    key={q.id}
                    href={`/speaking/practice/${questionPickerSet.id}?mode=single_question&part=1&questionId=${q.id}`}
                    className="p-3.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:border-primary/40 rounded-2xl border border-gray-200/70 dark:border-gray-600 flex items-center justify-between group transition-all"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                      #{idx + 1}. {q.text}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Part 2 Cue Card */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Part 2 — Cue Card (1m chuẩn bị + 2m nói)
              </h4>
              <Link
                href={`/speaking/practice/${questionPickerSet.id}?mode=single_question&part=2`}
                className="p-4 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/70 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 block">
                    {questionPickerSet.part2CueCard.title}
                  </span>
                  <span className="text-[11px] text-amber-800 dark:text-amber-400 mt-1 block">
                    Bao gồm 4 gợi ý điểm cần đề cập + khung ghi chú
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Part 3 Questions */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Part 3 — Thảo Luận Chuyên Sâu (30-45s)
              </h4>
              <div className="space-y-2">
                {questionPickerSet.part3Questions.map((q, idx) => (
                  <Link
                    key={q.id}
                    href={`/speaking/practice/${questionPickerSet.id}?mode=single_question&part=3&questionId=${q.id}`}
                    className="p-3.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:border-primary/40 rounded-2xl border border-gray-200/70 dark:border-gray-600 flex items-center justify-between group transition-all"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                      #{idx + 1}. {q.text}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
