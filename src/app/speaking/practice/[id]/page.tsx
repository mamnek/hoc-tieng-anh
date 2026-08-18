'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  SpeakingQuestion,
  SpeakingCueCard,
  SpeakingAttemptAnswer,
  SpeakingQuestionSet
} from '@/lib/types';
import { SpeakingResultView } from '@/components/speaking/speaking-result-view';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Award,
  BookOpen,
  VolumeX,
  Volume1
} from 'lucide-react';

// Wrap in Suspense for Next.js App Router useSearchParams
export default function SpeakingPracticePageWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <SpeakingPracticeRoom />
    </Suspense>
  );
}

function SpeakingPracticeRoom() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const setId = params.id as string;
  const mode = (searchParams.get('mode') as 'full_mock' | 'single_question') || 'full_mock';
  const targetPart = searchParams.get('part') ? parseInt(searchParams.get('part') || '1', 10) : 1;
  const targetQuestionId = searchParams.get('questionId');

  const { speakingQuestionSets, addSpeakingAttempt, currentUser } = useAppStore();

  const questionSet: SpeakingQuestionSet | undefined = useMemo(() => {
    return (speakingQuestionSets || []).find((s) => s.id === setId);
  }, [speakingQuestionSets, setId]);

  // Build the list of items to practice based on mode
  const practiceItems = useMemo(() => {
    if (!questionSet) return [];

    if (mode === 'single_question') {
      if (targetPart === 1) {
        const found = questionSet.part1Questions.find((q) => q.id === targetQuestionId);
        return [found || questionSet.part1Questions[0]];
      } else if (targetPart === 2) {
        return [questionSet.part2CueCard];
      } else {
        const found = questionSet.part3Questions.find((q) => q.id === targetQuestionId);
        return [found || questionSet.part3Questions[0]];
      }
    }

    // Full Mock Test: Part 1 (all) -> Part 2 (cue card) -> Part 3 (all)
    return [
      ...questionSet.part1Questions,
      questionSet.part2CueCard,
      ...questionSet.part3Questions,
    ];
  }, [questionSet, mode, targetPart, targetQuestionId]);

  // Practice State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPrepTime, setIsPrepTime] = useState(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(60);
  const [prepNotes, setPrepNotes] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [secondsLimit, setSecondsLimit] = useState(30);

  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Store completed answers in this session
  const [attemptAnswers, setAttemptAnswers] = useState<SpeakingAttemptAnswer[]>([]);
  const [currentResult, setCurrentResult] = useState<SpeakingAttemptAnswer | null>(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  // MediaRecorder & Speech Recognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const currentItem = practiceItems[currentIndex];
  const isCueCard = currentItem && 'bulletPoints' in currentItem;

  // Initialize countdown limit when current question changes
  useEffect(() => {
    if (!currentItem) return;

    if (isCueCard) {
      // Cue card: 60s prep, then 120s speak
      setIsPrepTime(true);
      setPrepSecondsLeft(60);
      setSecondsLimit(120);
    } else {
      setIsPrepTime(false);
      setSecondsLimit(currentItem.suggestedDurationSeconds || 30);
    }

    setRecordingSeconds(0);
    setTranscript('');
    setCurrentResult(null);
  }, [currentIndex, currentItem, isCueCard]);

  // Timer: 1-Minute Prep Countdown for Part 2
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPrepTime && prepSecondsLeft > 0) {
      interval = setInterval(() => {
        setPrepSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPrepTime(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPrepTime, prepSecondsLeft]);

  // Timer: Recording Speaking Duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= secondsLimit) {
            // Auto stop when time limit reached
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, secondsLimit]);

  // Speak question automatically with TTS on load
  const handlePlayQuestionTTS = () => {
    if (!currentItem) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = 'text' in currentItem ? currentItem.text : currentItem.title;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Voice Recording + Speech-to-Text
  const handleStartRecording = async () => {
    setIsPrepTime(false);
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscript('');
    audioChunksRef.current = [];

    // 1. Setup MediaRecorder for voice audio
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(250);
      }
    } catch (err) {
      console.warn('Microphone access error:', err);
    }

    // 2. Setup Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullTranscript.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition start failed:', e);
      }
    }
  };

  // Stop Recording and Evaluate
  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    // Generate local audio URL from blob
    setTimeout(() => {
      let audioUrl = '';
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(audioBlob);
      }

      handleEvaluateAnswer(audioUrl);
    }, 400);
  };

  // Call Backend Evaluation API
  const handleEvaluateAnswer = async (audioUrl?: string) => {
    if (!currentItem) return;
    setIsEvaluating(true);

    const questionText = 'text' in currentItem ? currentItem.text : currentItem.title;
    const partNumber = ('part' in currentItem ? currentItem.part : 2) as 1 | 2 | 3;
    const finalTranscript = transcript.trim() || 'Well, to be honest, I think this is an interesting topic and I would like to share my thoughts on it.';
    const finalDuration = Math.max(5, recordingSeconds);

    try {
      const res = await fetch('/api/speaking-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          part: partNumber,
          topic: questionSet?.topic || 'General',
          transcript: finalTranscript,
          durationSeconds: finalDuration,
          wordCount: finalTranscript.split(/\s+/).filter(Boolean).length,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const answerResult: SpeakingAttemptAnswer = {
          questionId: currentItem.id,
          questionText,
          part: partNumber,
          audioUrl: audioUrl || '',
          transcript: finalTranscript,
          durationSeconds: finalDuration,
          wordCount: data.wordCount,
          speakingRateWpm: data.speakingRateWpm,
          overallBand: data.overallBand,
          criteriaScores: data.criteriaScores,
          wordLevelPronunciation: data.wordLevelPronunciation,
          inlineCorrections: data.inlineCorrections,
          improvedAnswer: data.improvedAnswer,
          ideaExpansion: data.ideaExpansion,
          vocabularySuggestions: data.vocabularySuggestions,
        };

        setCurrentResult(answerResult);
        setAttemptAnswers((prev) => [...prev, answerResult]);
      } else {
        alert(data.error || 'Lỗi khi chấm điểm bài nói.');
      }
    } catch (err: any) {
      console.error('Evaluation API error:', err);
      alert('Không thể kết nối với máy chủ chấm điểm.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next Question or Finish Test
  const handleNextQuestion = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishTest();
    }
  };

  // Finish Test & Save to Zustand Store
  const handleFinishTest = () => {
    if (!questionSet) return;

    const allAnswers = currentResult
      ? [...attemptAnswers.filter((a) => a.questionId !== currentResult.questionId), currentResult]
      : attemptAnswers;

    if (allAnswers.length === 0) {
      router.push('/speaking');
      return;
    }

    const avgBand = allAnswers.reduce((acc, a) => acc + a.overallBand, 0) / allAnswers.length;
    const roundBand = Math.round(avgBand * 2) / 2;

    const fcBand = Math.round((allAnswers.reduce((acc, a) => acc + (a.criteriaScores[0]?.score || 6), 0) / allAnswers.length) * 2) / 2;
    const lrBand = Math.round((allAnswers.reduce((acc, a) => acc + (a.criteriaScores[1]?.score || 6), 0) / allAnswers.length) * 2) / 2;
    const graBand = Math.round((allAnswers.reduce((acc, a) => acc + (a.criteriaScores[2]?.score || 6), 0) / allAnswers.length) * 2) / 2;
    const pBand = Math.round((allAnswers.reduce((acc, a) => acc + (a.criteriaScores[3]?.score || 6.5), 0) / allAnswers.length) * 2) / 2;

    addSpeakingAttempt({
      userId: currentUser?.id || 'guest',
      questionSetId: questionSet.id,
      questionSetTitle: questionSet.title,
      topic: questionSet.topic,
      mode,
      overallBand: roundBand,
      fluencyBand: fcBand,
      lexicalBand: lrBand,
      grammarBand: graBand,
      pronunciationBand: pBand,
      totalDurationSeconds: allAnswers.reduce((acc, a) => acc + a.durationSeconds, 0),
      answers: allAnswers,
    });

    setIsTestCompleted(true);
  };

  if (!questionSet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy bộ đề thi</h2>
        <Link href="/speaking" className="text-primary font-bold hover:underline">
          Quay lại danh sách bộ đề
        </Link>
      </div>
    );
  }

  // ──────────────── FINAL TEST COMPLETED SUMMARY VIEW ────────────────
  if (isTestCompleted) {
    const finalAvg = attemptAnswers.length > 0
      ? (attemptAnswers.reduce((acc, a) => acc + a.overallBand, 0) / attemptAnswers.length).toFixed(1)
      : '6.5';

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in text-center">
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-primary rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-amber-400 text-gray-950 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-white/20 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
              Hoàn Thành Bài Thi Thử IELTS Speaking
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Chúc Mừng Bạn Đã Hoàn Thành!
            </h1>
            <p className="text-white/80 text-sm max-w-lg mx-auto">
              Bạn đã hoàn thành trọn vẹn bài thi mô phỏng "{questionSet.title}".
            </p>
          </div>

          {/* Big Band Score Box */}
          <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <div className="text-center">
              <span className="text-xs text-white/70 block uppercase tracking-wider font-bold">Band Tổng Kết</span>
              <span className="text-5xl sm:text-6xl font-black text-amber-300 drop-shadow-lg">{finalAvg}</span>
              <span className="text-xs text-white/80 block mt-1">/ 9.0 IELTS Scale</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setIsTestCompleted(false);
                setCurrentIndex(0);
                setAttemptAnswers([]);
                setCurrentResult(null);
              }}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Thi lại bài này
            </button>

            <Link
              href="/speaking"
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-black px-8 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer text-sm flex items-center gap-2"
            >
              Xem danh sách bộ đề khác
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── IF SHOWING RESULT VIEW FOR CURRENT QUESTION ────────────────
  if (currentResult && currentItem) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/speaking')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bộ đề
          </button>

          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Tiến độ: Câu {currentIndex + 1} / {practiceItems.length}
          </span>
        </div>

        <SpeakingResultView
          answer={currentResult}
          question={currentItem}
          onRetry={() => {
            setCurrentResult(null);
            setRecordingSeconds(0);
            setTranscript('');
          }}
          onNext={currentIndex < practiceItems.length - 1 ? handleNextQuestion : undefined}
          isLastQuestion={currentIndex === practiceItems.length - 1}
          onFinish={handleFinishTest}
        />
      </div>
    );
  }

  // ──────────────── EXAM ROOM INTERACTIVE RECORDING VIEW ────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.push('/speaking')}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Rời phòng thi
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
            {isCueCard ? 'Part 2: Cue Card' : `Part ${('part' in currentItem ? currentItem.part : 1)}`}
          </span>
          <span className="text-xs font-bold text-gray-500">
            Câu {currentIndex + 1}/{practiceItems.length}
          </span>
        </div>
      </div>

      {/* QUESTION DISPLAY AREA */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 relative overflow-hidden">
        {/* Cue Card UI (Part 2) */}
        {isCueCard ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                IELTS Speaking Part 2 • Cue Card
              </div>

              <button
                onClick={handlePlayQuestionTTS}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-full transition-colors cursor-pointer"
                title="Nghe đề bài"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                {currentItem.title}
              </h2>

              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                You should say:
              </p>

              <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                {currentItem.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1-Minute Prep Countdown & Notepad for Part 2 */}
            {isPrepTime && (
              <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Thời Gian Chuẩn Bị: <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{prepSecondsLeft}s</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsPrepTime(false);
                      handleStartRecording();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Bỏ qua chuẩn bị & Bắt đầu nói ngay
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  placeholder="Khung ghi chú nhanh (Notepad): Ghi nhanh từ khóa, ý tưởng của bạn tại đây..."
                  className="w-full p-3 text-xs bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none"
                />
              </div>
            )}
          </div>
        ) : (
          /* Part 1 / Part 3 Question UI */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                {'topic' in currentItem ? currentItem.topic : 'General'}
              </span>

              <button
                onClick={handlePlayQuestionTTS}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-full transition-colors cursor-pointer"
                title="Nghe câu hỏi bản xứ"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-snug">
              {'text' in currentItem ? currentItem.text : ''}
            </h2>
          </div>
        )}

        {/* Live Recognized Speech Transcript Box */}
        {(isRecording || transcript) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Văn bản giọng nói nhận diện trực tiếp:
              </span>
              <span>{transcript.split(/\s+/).filter(Boolean).length} từ</span>
            </div>
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium italic min-h-[40px]">
              "{transcript || 'Đang lắng nghe giọng nói của bạn...'}"
            </p>
          </div>
        )}
      </div>

      {/* RECORDING STUDIO CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <Clock className="w-4 h-4" />
            Thời gian trả lời:
          </div>
          <div className={`text-4xl sm:text-5xl font-black font-mono transition-colors ${
            recordingSeconds >= secondsLimit - 5 ? 'text-red-500 animate-pulse' : isRecording ? 'text-primary' : 'text-gray-400'
          }`}>
            {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')} / {Math.floor(secondsLimit / 60)}:{(secondsLimit % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Recording Button with Sound Wave Visualizer */}
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <>
              <div className="absolute w-32 h-32 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-red-500/30 animate-pulse" />
            </>
          )}

          {isEvaluating ? (
            <div className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-[10px] font-bold mt-1">Đang chấm</span>
            </div>
          ) : isRecording ? (
            <button
              onClick={handleStopRecording}
              className="relative z-10 w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <Square className="w-8 h-8 fill-current" />
              <span className="text-[10px] font-black uppercase mt-1">Dừng & Chấm</span>
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              className="relative z-10 w-24 h-24 rounded-full bg-primary hover:bg-primary/90 text-white flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <Mic className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase mt-1">Bắt đầu nói</span>
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {isRecording
            ? '🎙️ Đang ghi âm... Hãy tự tin nói bằng tiếng Anh, hệ thống sẽ tự động chấm điểm khi bạn bấm Dừng.'
            : 'Bấm nút micro để bắt đầu ghi âm câu trả lời của bạn.'}
        </p>

        {/* Action Skip / Next */}
        {!isRecording && !isEvaluating && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleNextQuestion}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold cursor-pointer underline"
            >
              Bỏ qua câu này
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
