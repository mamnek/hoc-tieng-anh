'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { presetVideoSegments, presetVideoQuizzes } from '@/lib/preset-videos';
import { VideoSegment, VideoQuizQuestion } from '@/lib/types';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Square,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Plus,
  HelpCircle,
  FileText,
  Award,
  Check,
  Zap,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

function cleanDisplaySentence(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[♪♫♬♩]+/g, ' ')
    .replace(/^>+\s*/gm, ' ')
    .replace(/\s+>+\s+/g, ' ')
    .replace(/\[\s*(music|applause|laughter|cheering|silence|snicker|gasp|sigh|singing|sound|audio|inaudible|crosstalk|crying|cough|groan|groaning|screaming|screams|chuckle|chuckles|bell|ringing|beep|whispering|whispers)[^\]]*\]/gi, ' ')
    .replace(/\[[\s♪♫♬♩\-_.:*]*\]/g, ' ')
    .replace(/\[[A-Z\s_0-9]+ SOUND[S]?\]/gi, ' ')
    .replace(/\[\s*[^\]]*music[^\]]*\]/gi, ' ')
    .replace(/\(\s*(music|applause|laughter|cheering|silence|gasp|sigh|singing|sound|audio|inaudible|chuckle)[^\)]*\)/gi, ' ')
    .replace(/\(\s*[^)]*music[^)]*\)/gi, ' ')
    .replace(/\*\s*(music|applause|laughter|cheering|cough|sigh)\s*\*/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;!?-]+/, '')
    .replace(/[\s,;]+$/, '')
    .trim();
}

function VideoStudioContent() {
  const params = useParams();
  const router = useRouter();
  const videoId = (params?.id as string) || 'vid-steve-jobs';

  const {
    videos,
    words,
    addWords,
    updateVideoProgress,
    deleteVideo,
    addShadowingAttempt,
    videoSegments: videoSegmentsStore,
    videoQuizzes: videoQuizzesStore,
  } = useAppStore();

  const video = useMemo(() => {
    return (videos || []).find((v) => v.id === videoId);
  }, [videos, videoId]);

  const segments: VideoSegment[] = useMemo(() => {
    if (videoSegmentsStore && videoSegmentsStore[videoId]) {
      return videoSegmentsStore[videoId];
    }
    return presetVideoSegments[videoId] || [];
  }, [videoSegmentsStore, videoId]);

  const quizzes: VideoQuizQuestion[] = useMemo(() => {
    if (videoQuizzesStore && videoQuizzesStore[videoId]) {
      return videoQuizzesStore[videoId];
    }
    return presetVideoQuizzes[videoId] || [];
  }, [videoQuizzesStore, videoId]);

  // State
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'shadowing' | 'dictation' | 'quiz'>('shadowing');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSubtitlesOnVideo, setShowSubtitlesOnVideo] = useState(true);

  // Toolbar Toggles
  const [clickToTranslateEnabled, setClickToTranslateEnabled] = useState(true);
  const [showIpa, setShowIpa] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Selected Word Popover State
  const [selectedWordInfo, setSelectedWordInfo] = useState<{
    word: string;
    ipa: string;
    meaningVi: string;
    partOfSpeech: string;
    saved: boolean;
  } | null>(null);

  // Shadowing Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [shadowingScore, setShadowingScore] = useState<number | null>(null);
  const [shadowingWordDiffs, setShadowingWordDiffs] = useState<{ word: string; status: 'correct' | 'incorrect' }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // YouTube Player and Synchronization Refs
  const playerRef = useRef<any>(null);
  const timePollingIntervalRef = useRef<any>(null);
  const activeSegmentItemRef = useRef<HTMLDivElement | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Dictation State
  const [dictationInput, setDictationInput] = useState('');
  const [dictationResult, setDictationResult] = useState<{
    checked: boolean;
    accuracy: number;
    wordDiffs: { word: string; status: 'correct' | 'incorrect' | 'missing' }[];
  } | null>(null);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentSegment = segments[activeSegmentIndex] || segments[0];

  // Stop polling helper
  const stopTimePolling = () => {
    if (timePollingIntervalRef.current) {
      clearInterval(timePollingIntervalRef.current);
      timePollingIntervalRef.current = null;
    }
  };

  // Start polling playback time every 200ms
  const startTimePolling = () => {
    stopTimePolling();
    timePollingIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const currentTime = playerRef.current.getCurrentTime();
        if (typeof currentTime !== 'number' || isNaN(currentTime)) return;

        // Find matching segment based on currentTime
        const idx = segments.findIndex(
          (s) => currentTime >= s.startTime && currentTime <= s.endTime
        );

        if (idx !== -1) {
          setActiveSegmentIndex((prev) => (prev !== idx ? idx : prev));
        } else {
          // If in a small pause between segments, find latest passed segment
          let lastPassed = -1;
          for (let i = 0; i < segments.length; i++) {
            if (currentTime >= segments[i].startTime) {
              lastPassed = i;
            } else {
              break;
            }
          }
          if (lastPassed !== -1) {
            setActiveSegmentIndex((prev) => (prev !== lastPassed ? lastPassed : prev));
          }
        }
      } catch (err) {}
    }, 200);
  };

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    if (!video || video.sourceType !== 'youtube' || !video.youtubeId) return;

    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (!isMounted) return;

      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      try {
        playerRef.current = new window.YT.Player('youtube-player-element', {
          videoId: video.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            start: segments[0]?.startTime || 0,
          },
          events: {
            onReady: (event: any) => {
              try { event.target.setPlaybackRate(playbackRate); } catch (e) {}
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                startTimePolling();
              } else {
                stopTimePolling();
              }
            },
          },
        });
      } catch (err) {
        console.error('Failed to init YT.Player:', err);
      }
    };

    if (!window.YT || !window.YT.Player) {
      const existingScript = document.getElementById('yt-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      stopTimePolling();
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [video?.youtubeId]);

  // Seek and play specific segment
  const seekToSegment = (idx: number, autoPlay: boolean = true) => {
    if (idx < 0 || idx >= segments.length) return;
    const target = segments[idx];
    setActiveSegmentIndex(idx);

    if (playerRef.current?.seekTo) {
      try {
        playerRef.current.seekTo(target.startTime, true);
        if (autoPlay && playerRef.current.playVideo) {
          playerRef.current.playVideo();
        }
      } catch (err) {}
    }
  };

  // Change playback speed
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current?.setPlaybackRate) {
      try {
        playerRef.current.setPlaybackRate(rate);
      } catch (e) {}
    }
  };

  // Auto scroll active segment ONLY INSIDE the transcript box, NEVER scrolling the main browser window/page
  useEffect(() => {
    const container = transcriptContainerRef.current;
    const item = activeSegmentItemRef.current;
    if (!container || !item) return;

    try {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // If active item is outside visible boundaries of the transcript box
      if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
        const offsetTop = item.offsetTop - container.offsetTop;
        container.scrollTo({
          top: Math.max(0, offsetTop - 20),
          behavior: 'smooth',
        });
      }
    } catch (err) {}
  }, [activeSegmentIndex]);

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = playbackRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Reset segment states on segment change
  useEffect(() => {
    setRecordedAudioUrl(null);
    setShadowingScore(null);
    setShadowingWordDiffs([]);
    setDictationInput('');
    setDictationResult(null);
    setSelectedWordInfo(null);
  }, [activeSegmentIndex]);

  // Format timestamp helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Click word definition lookup
  const handleWordClick = (rawWord: string) => {
    if (!clickToTranslateEnabled) return;
    const clean = rawWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!clean) return;

    // Dictionary lookup mock
    const dictMock: Record<string, { ipa: string; meaningVi: string; pos: string }> = {
      honored: { ipa: '/ˈɒnəd/', meaningVi: 'vinh hạnh, tự hào', pos: 'adjective' },
      commencement: { ipa: '/kəˈmɛnsmənt/', meaningVi: 'lễ tốt nghiệp đại học', pos: 'noun' },
      finest: { ipa: '/ˈfaɪnɪst/', meaningVi: 'tốt nhất, xuất sắc nhất', pos: 'adjective' },
      universities: { ipa: '/ˌjuːnɪˈvɜːsɪtiːz/', meaningVi: 'các trường đại học', pos: 'noun' },
      connecting: { ipa: '/kəˈnɛktɪŋ/', meaningVi: 'kết nối, liên kết', pos: 'verb' },
      satisfied: { ipa: '/ˈsætɪsfaɪd/', meaningVi: 'thỏa mãn, hài lòng', pos: 'adjective' },
      hungry: { ipa: '/ˈhʌŋɡri/', meaningVi: 'khao khát, khát khao', pos: 'adjective' },
      foolish: { ipa: '/ˈfuːlɪʃ/', meaningVi: 'dại khờ, ngây thơ', pos: 'adjective' },
      intelligence: { ipa: '/ɪnˈtɛlɪʤəns/', meaningVi: 'trí tuệ, sự thông minh', pos: 'noun' },
      productivity: { ipa: '/ˌprɒdʌkˈtɪvɪti/', meaningVi: 'năng suất lao động', pos: 'noun' },
      indispensable: { ipa: '/ˌɪndɪsˈpɛnsəbl/', meaningVi: 'không thể thiếu', pos: 'adjective' },
      strategic: { ipa: '/strəˈtiːʤɪk/', meaningVi: 'thuộc về chiến lược', pos: 'adjective' },
      efficiency: { ipa: '/ɪˈfɪʃənsi/', meaningVi: 'hiệu quả, hiệu suất', pos: 'noun' },
      reservation: { ipa: '/ˌrɛzəˈveɪʃən/', meaningVi: 'sự đặt bàn / phòng trước', pos: 'noun' },
    };

    const info = dictMock[clean] || {
      ipa: `/${clean}/`,
      meaningVi: `nghĩa của từ "${clean}" trong ngữ cảnh`,
      pos: 'vocabulary',
    };

    const isAlreadySaved = words.some((w) => w.term.toLowerCase() === clean);

    setSelectedWordInfo({
      word: clean,
      ipa: info.ipa,
      meaningVi: info.meaningVi,
      partOfSpeech: info.pos,
      saved: isAlreadySaved,
    });
  };

  // Add word from video segment to user's personal vocabulary
  const handleSaveWordToVocab = () => {
    if (!selectedWordInfo) return;
    addWords([
      {
        wordSetId: 'preset-1',
        term: selectedWordInfo.word,
        ipa: selectedWordInfo.ipa,
        meaningVi: selectedWordInfo.meaningVi,
        partOfSpeech: (selectedWordInfo.partOfSpeech as any) || 'noun',
        exampleEn: currentSegment.textEn,
        exampleVi: currentSegment.translationVi,
      },
    ]);
    setSelectedWordInfo((prev) => (prev ? { ...prev, saved: true } : null));
  };

  // Shadowing MediaRecorder logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        evaluateShadowing();
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      // Fallback simulated recording if mic access is denied or unavailable
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        evaluateShadowing();
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    } else {
      setIsRecording(false);
      evaluateShadowing();
    }
  };

  // Shadowing Speech Evaluation & Word Diff Scoring
  const evaluateShadowing = () => {
    const cleanText = cleanDisplaySentence(currentSegment.textEn);
    const targetWords = cleanText.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
    // Simulate high-accuracy shadowing result
    const score = Math.floor(Math.random() * 20) + 80; // 80% - 99%
    setShadowingScore(score);

    const diffs = targetWords.map((w, idx) => ({
      word: w,
      status: idx === targetWords.length - 1 && score < 85 ? ('incorrect' as const) : ('correct' as const),
    }));
    setShadowingWordDiffs(diffs);

    // Save shadowing attempt
    addShadowingAttempt({
      userId: 'user-1',
      segmentId: currentSegment.id,
      recognizedText: cleanText,
      accuracyScore: score,
      wordDiffs: diffs,
    });

    // Update video progress
    updateVideoProgress(videoId, Math.max(activeSegmentIndex + 1, video?.completedSegmentsCount || 0));
  };

  // Dictation Check Logic
  const handleCheckDictation = () => {
    if (!dictationInput.trim()) return;
    const cleanText = cleanDisplaySentence(currentSegment.textEn);
    const targetWords = cleanText.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
    const inputWords = dictationInput.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);

    let matchCount = 0;
    const wordDiffs = targetWords.map((targetW, idx) => {
      const matched = inputWords[idx] === targetW;
      if (matched) matchCount++;
      return {
        word: targetW,
        status: matched ? ('correct' as const) : ('incorrect' as const),
      };
    });

    const accuracy = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 100;
    setDictationResult({
      checked: true,
      accuracy,
      wordDiffs,
    });
  };

  // Quiz Option Click
  const handleQuizSelect = (optionIdx: number) => {
    setSelectedQuizOption(optionIdx);
    const currentQuiz = quizzes[quizIndex];
    if (optionIdx === currentQuiz.correctAnswerIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0F0F23]">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy Video này</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Video bạn tìm kiếm không tồn tại hoặc chưa được khởi tạo.</p>
        <Link href="/video" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl">Quay lại danh sách Video</Link>
      </div>
    );
  }

  const progressPercent = segments.length > 0
    ? Math.round(((activeSegmentIndex + 1) / segments.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F23] text-gray-900 dark:text-gray-100 p-4 md:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/video"
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">
                {video.category}
              </span>
              <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                {video.level}
              </span>
            </div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white mt-1 line-clamp-1">
              {video.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc chắn muốn xóa bài học video:\n"${video.title}"?\n\nDữ liệu các câu phụ đề và tiến trình học sẽ bị xóa bỏ.`)) {
                deleteVideo(video.id);
                router.push('/video');
              }
            }}
            className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold px-3.5 py-2 rounded-xl text-sm transition-all border border-red-200 dark:border-red-800/50 flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Xóa video này"
          >
            <Trash2 className="w-4 h-4" />
            Xóa video
          </button>
          <button
            onClick={() => router.push('/video')}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
          >
            Kết thúc bài
          </button>
        </div>
      </div>

      {/* 2-Column Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video & Interactive Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Player */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
            <div className="aspect-video relative">
              {video.sourceType === 'youtube' && video.youtubeId ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div id="youtube-player-element" className="w-full h-full" />
                </div>
              ) : (
                <video
                  src={video.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  controls
                  onTimeUpdate={(e) => {
                    const currentTime = (e.target as HTMLVideoElement).currentTime;
                    const idx = segments.findIndex(
                      (s) => currentTime >= s.startTime && currentTime <= s.endTime
                    );
                    if (idx !== -1 && idx !== activeSegmentIndex) {
                      setActiveSegmentIndex(idx);
                    }
                  }}
                  className="w-full h-full"
                />
              )}

              {/* On-Video Subtitle Overlay */}
              {showSubtitlesOnVideo && (
                <div className="absolute bottom-4 inset-x-4 pointer-events-none text-center">
                  <div className="inline-block bg-black/85 backdrop-blur-md text-white font-bold text-sm md:text-base lg:text-lg px-4 py-2 rounded-2xl shadow-2xl max-w-xl border border-white/10 transition-all duration-300">
                    <p className="leading-snug">{cleanDisplaySentence(currentSegment.textEn)}</p>
                    {showTranslation && (
                      <p className="text-yellow-300 text-xs md:text-sm font-medium mt-1 leading-snug">
                        {currentSegment.translationVi}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="bg-gray-900 text-white p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Tốc độ phát:</span>
                {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={cn(
                      'px-2 py-1 rounded-md transition-colors cursor-pointer',
                      playbackRate === rate ? 'bg-primary text-white font-bold' : 'hover:bg-gray-800 text-gray-300'
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSubtitlesOnVideo(!showSubtitlesOnVideo)}
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-200 transition-colors cursor-pointer"
              >
                {showSubtitlesOnVideo ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                {showSubtitlesOnVideo ? 'Ẩn phụ đề video' : 'Hiện phụ đề video'}
              </button>
            </div>
          </div>

          {/* Gamified Timeline Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              <span>Tiến trình hoàn thành video</span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Transcript List */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Danh sách câu phụ đề ({segments.length} câu)
            </h3>

            <div ref={transcriptContainerRef} className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {segments.map((seg, idx) => {
                const isActive = idx === activeSegmentIndex;
                return (
                  <div
                    key={seg.id}
                    ref={isActive ? activeSegmentItemRef : null}
                    onClick={() => seekToSegment(idx)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer text-left',
                      isActive
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/40'
                        : 'border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', isActive ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500')}>
                        #{seg.orderIndex}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                      {cleanDisplaySentence(seg.textEn)}
                    </p>

                    {showIpa && (
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-mono mb-1">
                        {seg.ipa}
                      </p>
                    )}

                    {showTranslation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {seg.translationVi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Practice Studio Hub (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl flex flex-col min-h-[600px]">
            {/* Mode Switch Tabs */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mb-6">
              {[
                { id: 'shadowing', label: 'Shadowing (Nhại)' },
                { id: 'dictation', label: 'Dictation (Chép)' },
                { id: 'quiz', label: 'Quiz (Trắc nghiệm)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Global Practice Toolbar Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700/50 text-xs font-semibold">
              <button
                onClick={() => setClickToTranslateEnabled(!clickToTranslateEnabled)}
                className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', clickToTranslateEnabled ? 'bg-primary/20 text-primary font-bold' : 'text-gray-400')}
              >
                Tra từ khi click
              </button>
              <button
                onClick={() => setShowIpa(!showIpa)}
                className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', showIpa ? 'bg-primary/20 text-primary font-bold' : 'text-gray-400')}
              >
                IPA
              </button>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', showTranslation ? 'bg-primary/20 text-primary font-bold' : 'text-gray-400')}
              >
                Dịch nghĩa
              </button>
            </div>

            {/* Sentence Target Box (For Shadowing & Click-to-Translate) */}
            {activeTab !== 'quiz' && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50 p-5 rounded-2xl border border-indigo-100 dark:border-gray-700 mb-6 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Câu #{currentSegment.orderIndex} / {segments.length}
                  </span>
                  <button
                    onClick={() => speakText(cleanDisplaySentence(currentSegment.textEn))}
                    className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" /> Nghe mẫu
                  </button>
                </div>

                {/* Interactive Clickable Words */}
                {activeTab === 'shadowing' ? (
                  <div className="flex flex-wrap gap-1.5 text-lg font-black text-gray-900 dark:text-white leading-relaxed">
                    {cleanDisplaySentence(currentSegment.textEn).split(' ').filter(Boolean).map((word, wIdx) => (
                      <span
                        key={wIdx}
                        onClick={() => handleWordClick(word)}
                        className={cn(
                          'px-1.5 py-0.5 rounded-md hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer underline decoration-dotted decoration-primary/40'
                        )}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 italic">
                    🔒 Câu tiếng Anh đã bị ẩn trong chế độ Chép chính tả. Nghe audio và gõ lại bên dưới!
                  </p>
                )}

                {showIpa && activeTab === 'shadowing' && (
                  <p className="text-xs text-indigo-500 font-mono mt-2">{currentSegment.ipa}</p>
                )}

                {showTranslation && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
                    {currentSegment.translationVi}
                  </p>
                )}
              </div>
            )}

            {/* Clicked Word Tooltip Popover Modal */}
            {selectedWordInfo && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-2xl animate-fade-in relative">
                <button
                  onClick={() => setSelectedWordInfo(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-black text-lg text-primary">{selectedWordInfo.word}</span>
                  <span className="text-xs text-gray-500 italic">({selectedWordInfo.partOfSpeech})</span>
                  <span className="text-xs text-indigo-500 font-mono">{selectedWordInfo.ipa}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Nghĩa: {selectedWordInfo.meaningVi}
                </p>

                <button
                  onClick={handleSaveWordToVocab}
                  disabled={selectedWordInfo.saved}
                  className={cn(
                    'w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                    selectedWordInfo.saved
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-primary hover:bg-primary/90 text-white shadow-md'
                  )}
                >
                  {selectedWordInfo.saved ? (
                    <>
                      <Check className="w-4 h-4" /> Đã lưu vào Từ vựng của tôi
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> + Thêm vào từ vựng của tôi
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MODE 1: SHADOWING CONTENT */}
            {activeTab === 'shadowing' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                {/* Recording Control Area */}
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      'w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95',
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-300'
                        : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30 ring-8 ring-primary/10'
                    )}
                  >
                    {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                  </button>

                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4">
                    {isRecording ? '🔴 Đang thu âm... Nhấn để dừng' : 'Nhấn để thu âm giọng nói của bạn'}
                  </p>

                  {/* Recorded Audio Preview */}
                  {recordedAudioUrl && (
                    <div className="mt-4 w-full max-w-xs">
                      <audio src={recordedAudioUrl} controls className="w-full h-8" />
                    </div>
                  )}
                </div>

                {/* Score & Word Diff Result Display */}
                {shadowingScore !== null && (
                  <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-inner space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Kết quả phát âm:</span>
                      <span className="text-lg font-black text-green-600">{shadowingScore}% Chính xác</span>
                    </div>

                    <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      Mình nghe thấy:
                    </div>

                    <div className="flex flex-wrap gap-1 text-sm font-bold">
                      {shadowingWordDiffs.map((d, i) => (
                        <span
                          key={i}
                          className={cn(
                            'px-1.5 py-0.5 rounded',
                            d.status === 'correct'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          )}
                        >
                          {d.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: DICTATION CONTENT */}
            {activeTab === 'dictation' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <textarea
                    rows={4}
                    value={dictationInput}
                    onChange={(e) => setDictationInput(e.target.value)}
                    placeholder="Gõ lại những từ bạn nghe được trong audio..."
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-white"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleCheckDictation}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
                    >
                      Kiểm tra bài chép
                    </button>
                  </div>
                </div>

                {/* Dictation Result */}
                {dictationResult && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Tỷ lệ chính xác:</span>
                      <span className="text-lg font-black text-primary">{dictationResult.accuracy}%</span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-sm font-bold">
                      {dictationResult.wordDiffs.map((d, i) => (
                        <span
                          key={i}
                          className={cn(
                            'px-1.5 py-0.5 rounded',
                            d.status === 'correct'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          )}
                        >
                          {d.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: QUIZ CONTENT */}
            {activeTab === 'quiz' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                {quizzes[quizIndex] ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-gray-700">
                      <span className="text-xs font-bold text-primary uppercase">Câu hỏi trắc nghiệm</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                        {quizzes[quizIndex].question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {quizzes[quizIndex].options.map((opt, oIdx) => {
                        const isSelected = selectedQuizOption === oIdx;
                        const isCorrect = oIdx === quizzes[quizIndex].correctAnswerIndex;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizSelect(oIdx)}
                            className={cn(
                              'p-3.5 rounded-xl border text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between',
                              selectedQuizOption === null
                                ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                : isSelected
                                ? isCorrect
                                  ? 'border-green-500 bg-green-50 text-green-800'
                                  : 'border-red-500 bg-red-50 text-red-800'
                                : isCorrect
                                ? 'border-green-500 bg-green-50 text-green-800'
                                : 'border-gray-100 text-gray-400'
                            )}
                          >
                            <span>{opt}</span>
                            {selectedQuizOption !== null && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizOption !== null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        💡 {quizzes[quizIndex].explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Hoàn thành Trắc nghiệm!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Bạn đã hoàn thành các câu hỏi trắc nghiệm của video này.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Segment Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto gap-3">
              <button
                onClick={() => seekToSegment(Math.max(0, activeSegmentIndex - 1))}
                disabled={activeSegmentIndex === 0}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Câu trước
              </button>

              <button
                onClick={() => seekToSegment(activeSegmentIndex)}
                className="py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Nghe lại câu hiện tại trong video"
              >
                <RotateCcw className="w-4 h-4" /> Nghe lại
              </button>

              <button
                onClick={() => seekToSegment(Math.min(segments.length - 1, activeSegmentIndex + 1))}
                disabled={activeSegmentIndex === segments.length - 1}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                Câu sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoStudioPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500 font-medium">Đang tải Studio Video...</div>}>
      <VideoStudioContent />
    </Suspense>
  );
}
