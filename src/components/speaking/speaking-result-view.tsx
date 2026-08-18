'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SpeakingAttemptAnswer,
  SpeakingQuestion,
  SpeakingCueCard
} from '@/lib/types';
import { useAppStore } from '@/lib/store';
import {
  Award,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Share2,
  ArrowRight,
  Flame,
  Check,
  BookOpen,
  Lightbulb,
  Headphones,
  Flag,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface SpeakingResultViewProps {
  answer: SpeakingAttemptAnswer;
  question: SpeakingQuestion | (SpeakingCueCard & { text?: string; part?: number });
  onRetry: () => void;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onFinish?: () => void;
}

export function SpeakingResultView({
  answer,
  question,
  onRetry,
  onNext,
  isLastQuestion = false,
  onFinish,
}: SpeakingResultViewProps) {
  const { addSpeakingErrorReport, currentUser } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ai_support' | 'golden_board'>('ai_support');
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(answer.durationSeconds || 1);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);

  // Error Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Prepare chart data for 4 criteria
  const radarData = (answer.criteriaScores || []).map((cs) => ({
    criterion: cs.name.replace(' & ', ' & \n'),
    score: cs.score,
    fullMark: 9,
  }));

  const barData = (answer.criteriaScores || []).map((cs) => ({
    name: cs.name.split(' ')[0],
    fullName: cs.name,
    score: cs.score,
  }));

  // Toggle expanded criteria
  const toggleCriterion = (name: string) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Handle Play/Pause recorded voice
  const handleTogglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.warn('Audio play failed:', e);
      });
    }
  };

  // Handle Question Text-to-Speech
  const handlePlayQuestionTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const questionText = 'text' in question ? question.text : question.title;
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Share copy
  const handleShare = () => {
    const questionText = ('text' in question ? question.text : question.title) || '';
    const shareText = `🎙️ Kết quả luyện nói IELTS Speaking của tôi:\n• Đề bài: ${questionText}\n• Điểm Band: ${answer.overallBand}/9.0\n• Tốc độ nói: ${answer.speakingRateWpm} từ/phút\nLuyện thi IELTS thông minh tại VocabMaster!`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Handle Submit Error Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNote.trim()) return;

    addSpeakingErrorReport({
      userId: currentUser?.id || 'guest',
      attemptId: answer.questionId,
      questionText: ('text' in question ? question.text : question.title) || '',
      transcript: answer.transcript,
      scoreReported: answer.overallBand,
      userNote: reportNote.trim(),
    });

    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportNote('');
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Audio element for recorded voice */}
      {answer.audioUrl && (
        <audio
          ref={audioRef}
          src={answer.audioUrl}
          onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || answer.durationSeconds)}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Top Banner: Question & Overall Band Score */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Part {answer.part} • IELTS Speaking
              </span>
              <button
                onClick={handlePlayQuestionTTS}
                className="bg-white/15 hover:bg-white/25 text-white p-1.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold px-2.5 cursor-pointer"
                title="Nghe câu hỏi bản xứ"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Nghe câu hỏi
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {'text' in question ? question.text : question.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-1">
              <span>⏱️ Thời lượng: <strong>{answer.durationSeconds}s</strong></span>
              <span>💬 Số từ: <strong>{answer.wordCount} từ</strong></span>
              <span>⚡ Tốc độ nói: <strong>{answer.speakingRateWpm} WPM</strong> ({answer.speakingRateWpm >= 110 && answer.speakingRateWpm <= 150 ? 'Chuẩn tự nhiên' : 'Cần điều chỉnh'})</span>
            </div>
          </div>

          {/* Overall Band Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-inner">
            <div className="text-center">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider block">Band Điểm</span>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 drop-shadow-md">
                {answer.overallBand.toFixed(1)}
              </div>
              <span className="text-[11px] text-white/70 block mt-0.5">
                {answer.overallBand >= 8.0 ? 'Xuất sắc (C2)' : answer.overallBand >= 7.0 ? 'Tốt (C1)' : answer.overallBand >= 6.0 ? 'Khá (B2)' : 'Cơ bản (B1)'}
              </span>
            </div>

            <div className="h-12 w-[1px] bg-white/20" />

            <button
              onClick={() => setShowReportModal(true)}
              className="text-white/70 hover:text-white flex flex-col items-center gap-1 text-[11px] hover:scale-105 transition-all cursor-pointer"
              title="Báo lỗi AI chấm sai"
            >
              <Flag className="w-4 h-4 text-amber-300" />
              Báo lỗi
            </button>
          </div>
        </div>

        {/* Action Toolbar on Header */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetry}
              className="bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Luyện lại câu này
            </button>
            <button
              onClick={handleShare}
              className="bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              {copiedShare ? 'Đã copy kết quả!' : 'Chia sẻ'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onNext && !isLastQuestion && (
              <button
                onClick={onNext}
                className="bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                Câu tiếp theo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onFinish && (
              <button
                onClick={onFinish}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Tổng kết bài thi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2 Main Tabs: "AI Hỗ Trợ" vs "Bảng Vàng" */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('ai_support')}
          className={`px-5 py-3 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai_support'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Hỗ Trợ (Phân tích chi tiết)
        </button>

        <button
          onClick={() => setActiveTab('golden_board')}
          className={`px-5 py-3 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'golden_board'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          Bảng Vàng (Bài mẫu Band 8.5+)
        </button>
      </div>

      {/* TAB 1: AI HỖ TRỢ */}
      {activeTab === 'ai_support' && (
        <div className="space-y-8">
          {/* Audio Player Bar if audio recorded */}
          {answer.audioUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlayAudio}
                  className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Bản ghi âm giọng nói của bạn</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {Math.floor(audioCurrentTime)}s / {Math.floor(audioDuration)}s
                  </p>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex-1 w-full flex items-center gap-2">
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden relative">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${(audioCurrentTime / Math.max(1, audioDuration)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Detailed Word-Level Pronunciation Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Phân Tích Phát Âm Từng Từ (Word-level Pronunciation)
                </h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Đối chiếu âm vị & phiên âm chuẩn IPA quốc tế
              </span>
            </div>

            {/* Interactive Word Cloud with Underlines & IPA */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 leading-loose flex flex-wrap gap-x-2.5 gap-y-4 text-base sm:text-lg">
              {answer.wordLevelPronunciation.map((item, idx) => {
                const isHeavy = item.severity === 'heavy';
                const isLight = item.severity === 'light';
                const isMinor = item.severity === 'minor';

                return (
                  <span
                    key={idx}
                    className="inline-flex flex-col items-center group relative cursor-pointer"
                    title={item.feedback || `IPA: ${item.ipa}`}
                  >
                    <span
                      className={`font-semibold transition-colors ${
                        isHeavy
                          ? 'text-red-600 dark:text-red-400 underline decoration-red-500 decoration-2 underline-offset-4 bg-red-50 dark:bg-red-950/30 px-1 rounded'
                          : isLight
                          ? 'text-amber-600 dark:text-amber-400 underline decoration-amber-500 decoration-2 underline-offset-4 bg-amber-50 dark:bg-amber-950/30 px-1 rounded'
                          : isMinor
                          ? 'text-gray-600 dark:text-gray-300 underline decoration-gray-400 decoration-1 underline-offset-4'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.word}
                    </span>

                    {/* IPA phonetic display for erroneous words */}
                    {(isHeavy || isLight || isMinor) && item.ipa && (
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5 tracking-tight">
                        {item.ipa}
                      </span>
                    )}

                    {/* Tooltip feedback on hover */}
                    {item.feedback && (
                      <span className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-48 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl text-center pointer-events-none">
                        {item.feedback}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Severity Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <span className="font-bold text-gray-500 dark:text-gray-400">Chú thích mức độ:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Lỗi nặng (Trọng âm / Âm câm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Lỗi nhẹ (Phụ âm / Nguyên âm đôi)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Lỗi phụ (Ngữ điệu / Nối âm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Phát âm chuẩn xác</span>
              </div>
            </div>
          </div>

          {/* Section 2: Inline Grammar & Syntax Corrections */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sửa Lỗi & Tối Ưu Cấu Trúc Ngữ Pháp (Inline Corrections)
              </h3>
            </div>

            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              {answer.inlineCorrections.insertedPhrases && answer.inlineCorrections.insertedPhrases.length > 0 ? (
                <span>
                  <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-lg font-bold mr-1">
                    +{answer.inlineCorrections.insertedPhrases[0]}
                  </span>
                  {answer.transcript}
                </span>
              ) : (
                <span>{answer.inlineCorrections.correctedText}</span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
              💡 {answer.inlineCorrections.explanation}
            </p>
          </div>

          {/* Section 3: 4 IELTS Criteria Breakdown & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 4 Criteria Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Chi Tiết 4 Tiêu Chí Chấm Thi IELTS
              </h3>

              {(answer.criteriaScores || []).map((cs) => {
                const isExpanded = expandedCriteria[cs.name];
                const scoreColor = cs.score >= 7.5 ? 'text-emerald-600 dark:text-emerald-400' : cs.score >= 6.5 ? 'text-primary' : 'text-amber-600 dark:text-amber-400';

                return (
                  <div
                    key={cs.name}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                          {cs.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cs.nameVi}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-black ${scoreColor}`}>
                          {cs.score.toFixed(1)}
                        </span>
                        <button
                          onClick={() => toggleCriterion(cs.name)}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {cs.feedback}
                    </p>

                    {/* Expandable in-depth details */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl space-y-2 text-xs border border-gray-100 dark:border-gray-800 animate-fade-in">
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Phân tích chuyên sâu:</strong> {cs.details}
                        </p>
                        <p className="text-primary font-medium">
                          <strong>Gợi ý cải thiện:</strong> {cs.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Radar Chart Visualization (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2 text-center">
                Biểu Đồ Năng Lực 4 Tiêu Chí (IELTS Radar)
              </h4>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="criterion" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 9]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Radar name="Band Score" dataKey="score" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-around text-center text-xs">
                <div>
                  <span className="text-gray-400 block">FC (Trôi chảy)</span>
                  <strong className="text-gray-900 dark:text-white">{answer.criteriaScores[0]?.score || 6.0}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">LR (Từ vựng)</span>
                  <strong className="text-gray-900 dark:text-white">{answer.criteriaScores[1]?.score || 6.0}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">GRA (Ngữ pháp)</span>
                  <strong className="text-gray-900 dark:text-white">{answer.criteriaScores[2]?.score || 6.0}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">P (Phát âm)</span>
                  <strong className="text-gray-900 dark:text-white">{answer.criteriaScores[3]?.score || 6.5}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: AI Rewritten Band 8.0+ Sentence & Shadowing Action */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-pink-950/20 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Cải Thiện Cả Câu (Phiên Bản Band 8.0+)
                </h3>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(answer.improvedAnswer);
                  setCopiedImproved(true);
                  setTimeout(() => setCopiedImproved(false), 2000);
                }}
                className="text-xs bg-white dark:bg-gray-800 text-primary font-bold px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all cursor-pointer self-start sm:self-auto"
              >
                {copiedImproved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <BookOpen className="w-3.5 h-3.5" />}
                {copiedImproved ? 'Đã copy câu mẫu!' : 'Copy câu Band 8.0+'}
              </button>
            </div>

            <p className="text-base sm:text-lg text-gray-800 dark:text-gray-100 leading-relaxed font-medium bg-white/70 dark:bg-gray-800/70 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              "{answer.improvedAnswer}"
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(answer.improvedAnswer);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Nghe đọc câu Band 8.0+
              </button>
            </div>
          </div>

          {/* Section 5: Idea Expansion & Topic Collocations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Idea Expansion */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-gray-900 dark:text-white">Mở Rộng Ý Tưởng (Idea Expansion)</h4>
              </div>

              <ul className="space-y-3">
                {answer.ideaExpansion.map((idea, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vocabulary & Collocations Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-gray-900 dark:text-white">Từ Vựng & Collocations Đắt Giá</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {answer.vocabularySuggestions.map((vocab, idx) => (
                  <span
                    key={idx}
                    className="bg-primary/10 text-primary dark:text-primary-light text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/20"
                  >
                    {vocab}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢNG VÀNG (SAMPLE ANSWERS BAND 8.5+) */}
      {activeTab === 'golden_board' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bài Trả Lời Mẫu Xuất Sắc (Band 8.5+ Native Speaker)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Phỏng vấn thực tế từ cựu giám khảo IELTS & Native Speakers
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const sampleText = ('sampleAnswerBand8' in question ? question.sampleAnswerBand8 : '') || answer.improvedAnswer;
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(sampleText);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Nghe đọc bài mẫu
              </button>
            </div>

            {/* Sample Answer Box */}
            <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
              {('sampleAnswerBand8' in question ? question.sampleAnswerBand8 : '') || answer.improvedAnswer}
            </div>

            {/* Collocations in Sample Answer */}
            {'collocations' in question && question.collocations && question.collocations.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Cụm từ Collocations nổi bật trong bài mẫu:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {question.collocations.map((colloc, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800"
                    >
                      ★ {colloc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full border border-gray-100 dark:border-gray-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Flag className="w-5 h-5 text-amber-500" />
                Báo Lỗi AI Chấm Điểm
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-sm font-bold animate-fade-in">
                ✓ Cảm ơn bạn! Báo cáo đã được gửi tới đội ngũ chuyên môn IELTS để kiểm định lại.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Nếu bạn thấy AI nhận diện sai phát âm hoặc chấm điểm chưa phù hợp với bài nói của bạn, hãy để lại ghi chú chi tiết:
                </p>

                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Từ 'cuisine' tôi phát âm đúng nhưng AI nhận nhầm là lỗi nặng..."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
