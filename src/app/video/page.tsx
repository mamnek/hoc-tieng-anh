'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Video as VideoIcon,
  Plus,
  Play,
  Clock,
  Sparkles,
  Search,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  X,
  Layers,
  Award,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoHubPage() {
  const router = useRouter();
  const { videos, addVideo, deleteVideo } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDeleteVideo = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài học video:\n"${title}"?\n\nDữ liệu các câu phụ đề và tiến trình học của video này sẽ được xóa bỏ.`)) {
      deleteVideo(id);
    }
  };

  // Modal State
  const [addMode, setAddMode] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  const processingSteps = [
    'Đang kết nối & tải dữ liệu video...',
    'Đang tách lời thoại theo mốc thời gian...',
    'Đang dịch nghĩa tiếng Việt & tạo phiên âm IPA (toàn bộ video)...',
    'Đang sinh câu hỏi Quiz & lưu bài học...',
    'Hoàn tất!'
  ];

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || vid.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || vid.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let ytId = '';

    if (addMode === 'youtube') {
      const extracted = extractYoutubeId(youtubeUrl);
      if (!extracted) {
        alert('Vui lòng nhập đường dẫn YouTube hợp lệ! (Ví dụ: https://www.youtube.com/watch?v=...)');
        return;
      }
      ytId = extracted;
    } else {
      alert('Tải file video trực tiếp yêu cầu Whisper API Key hoặc file phụ đề đi kèm. Vui lòng sử dụng tab "Dán Link YouTube" có phụ đề tiếng Anh!');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    try {
      // Step 1: Extract real transcript from Client Browser (Bypasses Render cloud IP restrictions)
      setProcessingStep(1);
      let clientSegments: { start: number; duration: number; text: string }[] = [];

      try {
        const timedUrls = [
          `https://www.youtube.com/api/timedtext?v=${ytId}&lang=en`,
          `https://www.youtube.com/api/timedtext?v=${ytId}&lang=en&kind=asr`,
          `https://www.youtube.com/api/timedtext?v=${ytId}&lang=en-US`,
          `https://www.youtube.com/api/timedtext?v=${ytId}&lang=en-US&kind=asr`,
          `https://www.youtube.com/api/timedtext?v=${ytId}&lang=en-GB`,
        ];

        for (const u of timedUrls) {
          try {
            const ttRes = await fetch(u);
            if (ttRes.ok) {
              const xml = await ttRes.text();
              if (xml && xml.includes('<text')) {
                const regex = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>(.*?)<\/text>/gi;
                let m;
                while ((m = regex.exec(xml)) !== null) {
                  const raw = m[3]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/<[^>]*>/g, '')
                    .trim();
                  if (raw) {
                    clientSegments.push({
                      start: Math.floor(parseFloat(m[1])),
                      duration: Math.ceil(parseFloat(m[2] || '3')),
                      text: raw,
                    });
                  }
                }
                if (clientSegments.length > 0) break;
              }
            }
          } catch (_) {}
        }
      } catch (_) {}

      // Step 2: Call backend API with clientSegments
      setProcessingStep(2);
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeId: ytId,
          title: videoTitle.trim() || 'Video YouTube',
          clientSegments: clientSegments.length > 0 ? clientSegments : undefined,
        }),
      });
      const resText = await res.text();
      let data: any = {};
      try {
        if (resText && resText.trim()) {
          data = JSON.parse(resText);
        }
      } catch (err) {
        console.error('JSON Parse Error:', resText);
        setIsProcessing(false);
        alert(`❌ Lỗi máy chủ (Mã: ${res.status}): Phản hồi không đúng định dạng. Vui lòng thử lại!`);
        return;
      }

      if (!res.ok || !data.success) {
        setIsProcessing(false);
        alert(`❌ ${data.error || 'Video này chưa được bật phụ đề tiếng Anh [CC]. Vui lòng thử video khác!'}`);
        return;
      }

      setProcessingStep(3);

      // Save real segments & quizzes into store for this youtubeId
      const newVidId = addVideo({
        sourceType: 'youtube',
        youtubeId: ytId,
        title: videoTitle.trim() || `Video YouTube (${ytId})`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        durationSeconds: data.segments.length > 0 ? data.segments[data.segments.length - 1].endTime : 180,
        category: 'Thực tế',
        level: 'Trung cấp',
        status: 'ready',
        segmentsCount: data.segments.length,
      });

      useAppStore.setState((state) => ({
        videoSegments: {
          ...state.videoSegments,
          [newVidId]: data.segments,
          [ytId]: data.segments,
        },
        videoQuizzes: {
          ...state.videoQuizzes,
          [newVidId]: data.quizzes,
          [ytId]: data.quizzes,
        },
      }));

      setProcessingStep(4);

      // Notify user if video was truncated
      if (data.truncated) {
        const coveredMins = data.segments.length > 0 ? Math.floor(data.segments[data.segments.length - 1].endTime / 60) : 0;
        alert(`⚠️ Video quá dài — đã xử lý ${data.segments.length} câu (tương ứng ~${coveredMins} phút đầu). Tổng phụ đề gốc: ${data.totalMerged || '?'} câu.`);
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowAddModal(false);
        setYoutubeUrl('');
        setVideoTitle('');
        router.push(`/video/${newVidId}`);
      }, 500);
    } catch (error: any) {
      setIsProcessing(false);
      alert(`❌ Lỗi kết nối: ${error?.message || 'Không thể kết nối đến máy chủ.'}`);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl">
              <VideoIcon className="w-8 h-8" />
            </div>
            Học tiếng Anh qua Video
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Luyện kỹ năng Shadowing, Chép chính tả (Dictation) và Trắc nghiệm trên video thực tế
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Thêm video mới
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
            <VideoIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{videos.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Video bài học</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {videos.reduce((acc, v) => acc + (v.completedSegmentsCount || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Câu thoại đã luyện</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Shadowing 85%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Độ chính xác trung bình</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề hoặc chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
          />
        </div>

        {/* Level Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Sơ cấp', label: 'Sơ cấp' },
            { id: 'Trung cấp', label: 'Trung cấp' },
            { id: 'Nâng cao', label: 'Nâng cao' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLevel(tab.id)}
              className={cn(
                'flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer',
                selectedLevel === tab.id
                  ? 'bg-white dark:bg-gray-800 text-primary font-bold shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const progressPercent = video.segmentsCount > 0
            ? Math.round(((video.completedSegmentsCount || 0) / video.segmentsCount) * 100)
            : 0;

          return (
            <div
              key={video.id}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Play Badge */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(video.durationSeconds)}
                </div>

                {/* Level Badge */}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {video.level}
                </div>

                {/* Delete Button on Thumbnail */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteVideo(video.id, video.title);
                  }}
                  title="Xóa video này"
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all hover:scale-110 cursor-pointer z-10 opacity-80 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {video.category}
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>

                {/* Progress Bar */}
                <div className="mt-auto space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>Tiến độ học</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {video.completedSegmentsCount || 0}/{video.segmentsCount} câu ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/video/${video.id}`}
                      className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Học video này
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id, video.title)}
                      title="Xóa video này"
                      className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl border border-red-100 dark:border-red-900/40 transition-all cursor-pointer shadow-sm hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-lg w-full overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <VideoIcon className="w-6 h-6" />
                Thêm Video Mới
              </div>
              <button
                onClick={() => !isProcessing && setShowAddModal(false)}
                disabled={isProcessing}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isProcessing ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Đang xử lý Video AI...</h4>
                  <p className="text-sm text-primary font-medium">{processingSteps[processingStep]}</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                    />
                  </div>

                  <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1 max-w-sm mx-auto">
                    <p className="font-semibold text-primary/80">⏱️ Thời gian đã chạy: {elapsedSeconds} giây</p>
                    <p>Hệ thống đang dịch toàn bộ lời thoại và sinh phiên âm IPA cho cả video. Với video dài (15–20 phút), quá trình xử lý mất khoảng 20–40 giây.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-5">
                  {/* Mode Tabs */}
                  <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setAddMode('youtube')}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                        addMode === 'youtube'
                          ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <LinkIcon className="w-4 h-4" /> Dán Link YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode('upload')}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                        addMode === 'upload'
                          ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <Upload className="w-4 h-4" /> Tải Video Lên
                    </button>
                  </div>

                  {addMode === 'youtube' ? (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                        Đường dẫn YouTube URL*
                      </label>
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Hệ thống sẽ tự động tách phụ đề, tạo phiên âm IPA và dịch tiếng Việt cho từng câu.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                        Chọn file Video từ máy (MP4, MOV - tối đa 20 phút)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700/30">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nhấn để chọn file video</p>
                        <p className="text-xs text-gray-400 mt-1">Dung lượng tối đa 100MB</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                      Tên bài học / Tiêu đề (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Ví dụ: Phỏng vấn xin việc tiếng Anh..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all text-sm cursor-pointer"
                    >
                      Tạo bài học AI
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
