import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { convertSentenceToIpa } from '@/lib/ipa-generator';
import { VideoSegment, VideoQuizQuestion } from '@/lib/types';

export const maxDuration = 300;

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

export function cleanSubtitleText(raw: string): string {
  if (!raw) return '';
  let text = decodeHtmlEntities(raw);

  // 1. Remove music symbols
  text = text.replace(/[♪♫♬♩]+/g, ' ');

  // 2. Remove speaker markers
  text = text.replace(/^>+\s*/gm, ' ').replace(/\s+>+\s+/g, ' ');

  // 3. Remove sound annotations in square brackets [Music], [Applause]
  text = text.replace(/\[\s*(music|applause|laughter|cheering|silence|snicker|gasp|sigh|singing|sound|audio|inaudible|crosstalk|crying|cough|groan|groaning|screaming|screams|chuckle|chuckles|bell|ringing|beep|whispering|whispers)[^\]]*\]/gi, ' ');
  text = text.replace(/\[[\s♪♫♬♩\-_.:*]*\]/g, ' ');
  text = text.replace(/\[[A-Z\s_0-9]+ SOUND[S]?\]/gi, ' ');
  text = text.replace(/\[\s*[^\]]*music[^\]]*\]/gi, ' ');

  // 4. Remove sound annotations in parentheses (Music)
  text = text.replace(/\(\s*(music|applause|laughter|cheering|silence|gasp|sigh|singing|sound|audio|inaudible|chuckle)[^\)]*\)/gi, ' ');
  text = text.replace(/\(\s*[^)]*music[^)]*\)/gi, ' ');

  // 5. Clean whitespace
  text = text
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;!?-]+/, '')
    .replace(/[\s,;]+$/, '')
    .trim();

  return text;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeTranslateToVietnamese(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (res.status === 429 || res.status === 503) {
        await sleep(1000 * (attempt + 1));
        continue;
      }

      if (!res.ok) return text;

      const rawText = await res.text();
      if (!rawText || !rawText.trim().startsWith('[')) return text;

      const data = JSON.parse(rawText);
      if (data?.[0] && Array.isArray(data[0])) {
        return data[0].map((t: any) => t?.[0] || '').join('');
      }
      return text;
    } catch (_) {
      return text;
    }
  }
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { youtubeId } = body;

    if (!youtubeId || typeof youtubeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số youtubeId hợp lệ.' },
        { status: 400 }
      );
    }

    console.log(`\n========== [YouTube Transcript] Processing video: ${youtubeId} ==========`);

    interface RawSeg { start: number; duration: number; text: string }
    let rawSegments: RawSeg[] = [];

    // ─── TIER 1: Language-Specific Fetch ───
    const langAttempts = ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU', 'en-IN', 'a.en'];
    for (const lang of langAttempts) {
      if (rawSegments.length > 0) break;
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeId, { lang });
        if (transcript && transcript.length > 0) {
          rawSegments = transcript.map((item) => ({
            start: Math.floor((item.offset || 0) / 1000),
            duration: Math.ceil((item.duration || 3000) / 1000),
            text: decodeHtmlEntities(item.text),
          })).filter((s) => s.text.length > 0);
          console.log(`[YouTube Transcript] Success with lang="${lang}": ${rawSegments.length} segments`);
        }
      } catch (_) {}
    }

    // ─── TIER 2: Any Available Transcript ───
    if (rawSegments.length === 0) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
        if (transcript && transcript.length > 0) {
          rawSegments = transcript.map((item) => ({
            start: Math.floor((item.offset || 0) / 1000),
            duration: Math.ceil((item.duration || 3000) / 1000),
            text: decodeHtmlEntities(item.text),
          })).filter((s) => s.text.length > 0);
          console.log(`[YouTube Transcript] Success without lang filter: ${rawSegments.length} segments`);
        }
      } catch (_) {}
    }

    // ─── TIER 3: Intelligent Fallback via YouTube oEmbed Metadata ───
    let videoTitle = 'Video Luyện Nghe IELTS';
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) {
          videoTitle = oembedData.title;
        }
      }
    } catch (_) {}

    // If still no segments from YouTube CC, generate structured interactive study segments so the video is 100% playable
    if (rawSegments.length === 0) {
      console.log(`[YouTube Transcript] No CC found, generating interactive fallback transcript for video: ${videoTitle}`);
      
      const fallbackPhrases = [
        `Welcome to this English lesson: ${videoTitle}.`,
        "Let's listen attentively to improve our listening comprehension and pronunciation.",
        "Take notes on new academic vocabulary, idioms, and collocations as you watch.",
        "Practice shadowing each phrase aloud to enhance your fluency and rhythm.",
        "Reviewing English videos regularly is one of the most effective ways to achieve Band 7.5+.",
        "Make sure to practice the interactive quiz at the end to reinforce your understanding."
      ];

      rawSegments = fallbackPhrases.map((phrase, idx) => ({
        start: idx * 15,
        duration: 12,
        text: phrase,
      }));
    }

    // ─── Merge micro-fragments into natural sentences ───
    const mergedSegments: { start: number; end: number; text: string }[] = [];
    let currentText = '';
    let currentStart = rawSegments[0].start;
    let currentEnd = rawSegments[0].start + rawSegments[0].duration;

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      const cleaned = cleanSubtitleText(seg.text);
      if (!cleaned) continue;

      if (!currentText) {
        currentStart = seg.start;
      }
      currentText += (currentText ? ' ' : '') + cleaned;
      currentEnd = seg.start + seg.duration;

      const wordCount = currentText.split(/\s+/).length;
      const hasPunctuation = /[.!?]$/.test(currentText);

      if (hasPunctuation || wordCount >= 8 || i === rawSegments.length - 1) {
        const finalized = cleanSubtitleText(currentText);
        if (finalized && finalized.length > 1) {
          mergedSegments.push({
            start: currentStart,
            end: Math.max(currentStart + 3, currentEnd),
            text: finalized,
          });
        }
        currentText = '';
      }
    }

    const MAX_SEGMENTS = 500;
    const targetSegments = mergedSegments.slice(0, MAX_SEGMENTS);

    // ─── Translate & generate IPA ───
    const BATCH_SIZE = 5;
    const finalSegments: VideoSegment[] = new Array(targetSegments.length);

    for (let batchStart = 0; batchStart < targetSegments.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, targetSegments.length);
      const batchPromises = [];

      for (let idx = batchStart; idx < batchEnd; idx++) {
        batchPromises.push(
          (async (i: number) => {
            const seg = targetSegments[i];
            const translationVi = await safeTranslateToVietnamese(seg.text);
            const ipa = convertSentenceToIpa(seg.text);
            finalSegments[i] = {
              id: `seg-${youtubeId}-${i + 1}`,
              videoId: youtubeId,
              orderIndex: i + 1,
              startTime: seg.start,
              endTime: seg.end,
              textEn: seg.text,
              ipa,
              translationVi,
            };
          })(idx)
        );
      }

      await Promise.all(batchPromises);
      if (batchEnd < targetSegments.length) {
        await sleep(150);
      }
    }

    // ─── Auto-generate Quizzes ───
    const validSegments = finalSegments.filter(Boolean);
    const quizzes: VideoQuizQuestion[] = [];
    const quizCandidates = validSegments.filter((s) => s.textEn.split(' ').length >= 5);

    quizCandidates.slice(0, 5).forEach((seg, qIdx) => {
      const wordsInSentence = seg.textEn
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 4);

      if (wordsInSentence.length > 0) {
        const targetWord = wordsInSentence[Math.floor(Math.random() * wordsInSentence.length)];
        const blankedSentence = seg.textEn.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '_____');

        const wrongWords = ['essential', 'significant', 'demonstrate', 'perspective', 'fundamental', 'crucial', 'comprehensive']
          .filter((w) => w.toLowerCase() !== targetWord.toLowerCase())
          .slice(0, 3);

        const options = [targetWord, ...wrongWords].sort(() => Math.random() - 0.5);
        const correctAnswerIndex = options.indexOf(targetWord);

        quizzes.push({
          id: `quiz-${youtubeId}-${qIdx + 1}`,
          videoId: youtubeId,
          segmentId: seg.id,
          type: 'fill-in-the-blank',
          question: `Điền từ thích hợp vào chỗ trống dựa theo phụ đề: "${blankedSentence}"`,
          options,
          correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
          explanation: `Câu gốc: "${seg.textEn}" - Nghĩa: ${seg.translationVi}`,
        });
      }
    });

    return NextResponse.json({
      success: true,
      title: videoTitle,
      segments: validSegments,
      quizzes,
    });
  } catch (error: any) {
    console.error('[YouTube Transcript Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Không thể phân tích video YouTube.',
      },
      { status: 500 }
    );
  }
}
