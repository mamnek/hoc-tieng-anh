'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  X,
  Sparkles,
  Loader2,
  Check,
  FileText,
  MessageSquare,
  Award,
  BookOpen,
  Layers,
  Flame,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { SpeakingQuestionSet } from '@/lib/types';

interface AiSpeakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSetId: string) => void;
}

const QUICK_THEMES = [
  { topic: 'Artificial Intelligence & Creative Arts', level: 'Nâng cao', badge: 'Hot Trend', icon: '🤖', desc: 'AI vẽ tranh, sáng tác nhạc và tương lai của nghệ sĩ' },
  { topic: 'Digital Nomad & Remote Work Lifestyle', level: 'Trung cấp', badge: 'Forecast 2026', icon: '💻', desc: 'Lối sống làm việc từ xa khi đi du lịch khắp thế giới' },
  { topic: 'Sustainable Fashion & Eco Wardrobe', level: 'Trung cấp', badge: 'Hot Trend', icon: '🌿', desc: 'Thời trang bền vững, đồ second-hand và rác thải dệt may' },
  { topic: 'Mental Health & Mindfulness in Modern Life', level: 'Nâng cao', badge: 'VIP 8.5+', icon: '🧘', desc: 'Sức khỏe tinh thần, thiền định và chữa lành áp lực' },
  { topic: 'Smart Cities & Future Urban Mobility', level: 'Nâng cao', badge: 'VIP 8.0+', icon: '🏙️', desc: 'Thành phố thông minh, xe điện và hạ tầng xanh' },
  { topic: 'E-commerce & Instant Grocery Delivery', level: 'Cơ bản', badge: 'Popular', icon: '🛒', desc: 'Mua sắm online, giao hàng hỏa tốc và thói quen tiêu dùng' },
  { topic: 'Space Tourism & Commercial Flights', level: 'Nâng cao', badge: 'VIP 8.5+', icon: '🚀', desc: 'Du lịch vũ trụ thương mại và tương lai khám phá hành tinh' },
  { topic: 'Healthy Eating & Plant-based Diets', level: 'Cơ bản', badge: 'Top Pick', icon: '🥗', desc: 'Ăn chay lành mạnh, chế độ ăn thuần thực vật và sức khỏe' },
  { topic: 'Gen Z Culture & Slang Language', level: 'Trung cấp', badge: 'Forecast 2026', icon: '⚡', desc: 'Văn hóa giới trẻ, ngôn ngữ mạng và xu hướng truyền thông' },
  { topic: 'Virtual Reality & Metaverse Gaming', level: 'Trung cấp', badge: 'Hot Trend', icon: '🥽', desc: 'Thế giới ảo Metaverse, kính VR và game nhập vai tương lai' },
  { topic: 'Solo Travel & Cultural Exploration', level: 'Trung cấp', badge: 'Popular', icon: '🎒', desc: 'Du lịch một mình, trải nghiệm văn hóa bản địa và trưởng thành' },
  { topic: 'Lifelong Learning & Skills Reskilling', level: 'Nâng cao', badge: 'VIP 8.0+', icon: '📚', desc: 'Học tập trọn đời, chuyển đổi nghề nghiệp và kỹ năng số' },
];

export default function AiSpeakingModal({ isOpen, onClose, onSuccess }: AiSpeakingModalProps) {
  const { addSpeakingQuestionSet } = useAppStore();

  const [activeTab, setActiveTab] = useState<'custom' | 'quick'>('custom');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'Cơ bản' | 'Trung cấp' | 'Nâng cao'>('Trung cấp');
  const [badge, setBadge] = useState('Forecast 2026');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<Omit<SpeakingQuestionSet, 'id' | 'createdAt'> | null>(null);

  if (!isOpen) return null;

  const handleGenerate = (targetTopic?: string, targetLevel?: 'Cơ bản' | 'Trung cấp' | 'Nâng cao', targetBadge?: string) => {
    const finalTopic = (targetTopic || topic).trim();
    if (!finalTopic) {
      alert('Vui lòng nhập hoặc chọn một chủ đề.');
      return;
    }

    const finalLevel = targetLevel || level;
    const finalBadge = targetBadge || badge;

    setIsGenerating(true);
    setGeneratedSet(null);

    setTimeout(() => {
      const isBeginner = finalLevel === 'Cơ bản';
      const isIntermediate = finalLevel === 'Trung cấp';

      const newSet: Omit<SpeakingQuestionSet, 'id' | 'createdAt'> = {
        title: `${finalTopic} — IELTS Speaking Full Mock Test`,
        topic: finalTopic,
        level: finalLevel,
        badge: finalBadge,
        isNew: true,
        description: `Bộ đề thi IELTS Speaking toàn diện chủ đề ${finalTopic} với đầy đủ 3 phần thi, câu hỏi bám sát xu hướng mới nhất kèm câu trả lời mẫu Band 8.5+ và collocations học thuật.`,
        part1Questions: [
          {
            id: `gen-p1-1`,
            part: 1,
            topic: finalTopic,
            suggestedDurationSeconds: 30,
            text: `How often do you encounter or think about ${finalTopic.toLowerCase()} in your everyday life?`,
            sampleAnswerBand8: `To be completely honest, ${finalTopic.toLowerCase()} plays an indispensable role in my day-to-day life. I find myself constantly interacting with its facets, which not only streamlines my routine but also stimulates my intellectual curiosity.`,
            collocations: ['play an indispensable role', 'day-to-day life', 'streamline my routine', 'intellectual curiosity'],
            ideaHints: ['Frequency (daily/weekly)', 'Personal experiences', 'Positive impact on lifestyle'],
          },
          {
            id: `gen-p1-2`,
            part: 1,
            topic: finalTopic,
            suggestedDurationSeconds: 30,
            text: `Did you have much knowledge or interest in ${finalTopic.toLowerCase()} when you were younger?`,
            sampleAnswerBand8: `Looking back at my formative years, my awareness was rather superficial. However, as technology advanced and society evolved, I developed a much deeper appreciation for its significance in our contemporary world.`,
            collocations: ['formative years', 'rather superficial', 'deeper appreciation', 'contemporary world'],
            ideaHints: ['Childhood perspective vs now', 'What changed your mind', 'Key milestones'],
          },
          {
            id: `gen-p1-3`,
            part: 1,
            topic: finalTopic,
            suggestedDurationSeconds: 30,
            text: `Do people in your country generally have a positive attitude towards ${finalTopic.toLowerCase()}?`,
            sampleAnswerBand8: `Without a doubt, there is immense enthusiasm, particularly among the younger generation. Most people embrace it with open arms, recognizing that it serves as a powerful catalyst for modernization and socioeconomic progress.`,
            collocations: ['without a doubt', 'immense enthusiasm', 'embrace with open arms', 'catalyst for progress'],
            ideaHints: ['General societal attitude', 'Generational differences', 'Economic benefits'],
          },
        ],
        part2CueCard: {
          id: `gen-p2-card`,
          topic: finalTopic,
          title: `Describe an unforgettable experience or important development regarding ${finalTopic.toLowerCase()}`,
          bulletPoints: [
            `What the experience or development is`,
            `When and how you first learned about it`,
            `What specific challenges or exciting aspects were involved`,
            `And explain why this left a lasting impression on your personal growth`,
          ],
          prepTimeSeconds: 60,
          speakingTimeSeconds: 120,
          sampleAnswerBand8: `Today I would like to talk about a truly transformative milestone regarding ${finalTopic.toLowerCase()} that I experienced about a year ago and fundamentally altered my outlook.

At that time, I was actively exploring ways to broaden my intellectual horizons, and this domain immediately captured my attention. I decided to immerse myself fully in understanding its core dynamics, attending interactive workshops and connecting with passionate experts.

What made this journey exceptionally memorable was the profound synergy between theoretical concepts and practical applications. It demanded critical thinking, agility, and the resilience to navigate complex anomalies.

Ultimately, this was a pivotal turning point for me. It not only honed my problem-solving capabilities but also reinforced the philosophy that embracing progressive innovation is essential for long-term personal and professional fulfillment.`,
          collocations: [
            'transformative milestone',
            'fundamentally alter outlook',
            'broaden intellectual horizons',
            'immerse myself fully',
            'profound synergy',
            'pivotal turning point',
            'progressive innovation',
          ],
          ideaHints: [
            'Engaging opening & context',
            'First encounter & motivation',
            'Core breakthroughs & challenges',
            'Profound long-term personal impact',
          ],
        },
        part3Questions: [
          {
            id: `gen-p3-1`,
            part: 3,
            topic: finalTopic,
            suggestedDurationSeconds: 45,
            text: `How might future developments in ${finalTopic.toLowerCase()} transform society over the next decade?`,
            sampleAnswerBand8: `In my view, we are standing on the cusp of a paradigm shift. We will likely witness unprecedented integration across various industries, fostering remarkable efficiency while simultaneously demanding rigorous regulatory frameworks to maintain ethical equilibrium.`,
            collocations: ['on the cusp of a paradigm shift', 'unprecedented integration', 'foster remarkable efficiency', 'ethical equilibrium'],
            ideaHints: ['Future projections', 'Technological synergies', 'Ethical considerations'],
          },
          {
            id: `gen-p3-2`,
            part: 3,
            topic: finalTopic,
            suggestedDurationSeconds: 45,
            text: `What potential drawbacks or inequalities could arise if ${finalTopic.toLowerCase()} is not managed properly?`,
            sampleAnswerBand8: `The most pressing risk is the widening of the digital and socioeconomic divide. If access remains disproportionately concentrated among privileged demographics, it could exacerbate existing systemic inequalities rather than bridging them.`,
            collocations: ['pressing risk', 'socioeconomic divide', 'disproportionately concentrated', 'systemic inequalities'],
            ideaHints: ['Inequality and digital divide', 'Access barriers', 'Policy solutions'],
          },
          {
            id: `gen-p3-3`,
            part: 3,
            topic: finalTopic,
            suggestedDurationSeconds: 45,
            text: `What role should educational institutions play in preparing students for this trend?`,
            sampleAnswerBand8: `Schools and universities must proactively modernize their curricula. Instead of relying solely on rote learning, they should prioritize experiential education, interdisciplinary problem-solving, and continuous digital literacy.`,
            collocations: ['proactively modernize curricula', 'rote learning', 'experiential education', 'digital literacy'],
            ideaHints: ['Curriculum reform', 'Interdisciplinary skills', 'Fostering critical thinkers'],
          },
        ],
      };

      setGeneratedSet(newSet);
      setIsGenerating(false);
    }, 600);
  };

  const handleSaveSet = () => {
    if (!generatedSet) return;
    const newId = addSpeakingQuestionSet(generatedSet);
    if (onSuccess) onSuccess(newId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-[2rem] sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-amber-500/5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                Tạo Bộ Đề Speaking Bằng AI
                <span className="text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  AI
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                Tạo trọn bộ IELTS Speaking Part 1, 2, 3 kèm bài mẫu Band 8.5+
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!generatedSet ? (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === 'custom'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  ✍️ Nhập Chủ Đề Tự Do
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === 'quick'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  ⚡ Chủ Đề Hot Forecast (Chọn nhanh)
                </button>
              </div>

              {activeTab === 'custom' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Chủ đề IELTS Speaking bạn muốn luyện tập:
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="VD: Artificial Intelligence, Solo Traveling, Sustainable Living, Smart Cities..."
                      className="w-full p-3.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Trình độ mục tiêu:
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-bold cursor-pointer"
                      >
                        <option value="Cơ bản">Cơ bản (Band 5.0 - 6.0)</option>
                        <option value="Trung cấp">Trung cấp (Band 6.5 - 7.0)</option>
                        <option value="Nâng cao">Nâng cao (Band 7.5 - 8.5+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Huy hiệu phân loại:
                      </label>
                      <select
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-bold cursor-pointer"
                      >
                        <option value="Forecast 2026">Forecast 2026</option>
                        <option value="Hot Trend">Hot Trend</option>
                        <option value="VIP 8.5+">VIP 8.5+</option>
                        <option value="Real Exam">Real Exam</option>
                        <option value="Cambridge 19">Cambridge 19</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang tạo trọn bộ câu hỏi & bài mẫu Band 8.5+...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Tạo Ngay Bộ Đề Speaking
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Quick Themes Grid */
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Bấm chọn một chủ đề dự đoán để tạo đề tức thì:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {QUICK_THEMES.map((theme, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGenerate(theme.topic, theme.level as any, theme.badge)}
                        disabled={isGenerating}
                        className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary bg-gray-50/70 dark:bg-gray-900/40 hover:bg-primary/5 transition-all text-left group flex items-start gap-3 cursor-pointer disabled:opacity-50"
                      >
                        <span className="text-2xl p-2 rounded-xl bg-white dark:bg-gray-800 shadow-xs group-hover:scale-110 transition-transform">
                          {theme.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                              {theme.topic}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">
                            {theme.desc}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                              {theme.level}
                            </span>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md">
                              {theme.badge}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* PREVIEW GENERATED SPEAKING SET */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <Check className="w-5 h-5 text-emerald-600" />
                  Đã tạo thành công bộ đề Speaking!
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {generatedSet.level}
                  </span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-full">
                    {generatedSet.badge}
                  </span>
                </div>
              </div>

              {/* Set Title & Description */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {generatedSet.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {generatedSet.description}
                </p>
              </div>

              {/* Overview Counts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[11px] font-bold text-gray-500">Part 1</p>
                  <p className="text-base font-black text-primary">{generatedSet.part1Questions.length} câu hỏi</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[11px] font-bold text-gray-500">Part 2 Cue Card</p>
                  <p className="text-base font-black text-amber-600">1 chủ đề 2m</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-[11px] font-bold text-gray-500">Part 3</p>
                  <p className="text-base font-black text-indigo-600">{generatedSet.part3Questions.length} câu thảo luận</p>
                </div>
              </div>

              {/* Part 2 Cue Card Preview */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  ⭐ Part 2 Cue Card Preview:
                </p>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {generatedSet.part2CueCard.title}
                </h4>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-3 list-disc">
                  {generatedSet.part2CueCard.bulletPoints.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Band 8.5 Collocations Preview */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Từ Vựng & Collocations Band 8.5+ Đính Kèm:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedSet.part2CueCard.collocations.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800 shadow-2xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-end gap-3">
          {generatedSet ? (
            <>
              <button
                type="button"
                onClick={() => setGeneratedSet(null)}
                className="px-5 py-2.5 font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Tạo lại đề khác
              </button>
              <button
                type="button"
                onClick={handleSaveSet}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Lưu Vào Danh Sách Bộ Đề
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
