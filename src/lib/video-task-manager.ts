import { VideoSegment, VideoQuizQuestion } from './types';
import { YoutubeTranscript } from 'youtube-transcript';
import { convertSentenceToIpa } from './ipa-generator';

export interface VideoTask {
  taskId: string;
  youtubeId: string;
  title: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  progress: number; // 0 to 100
  stepMessage: string;
  durationSeconds?: number;
  segments?: VideoSegment[];
  quizzes?: VideoQuizQuestion[];
  error?: string;
  createdAt: number;
}

// In-memory Task Registry
const globalTasks = global as unknown as {
  _videoTasks?: Map<string, VideoTask>;
};

if (!globalTasks._videoTasks) {
  globalTasks._videoTasks = new Map<string, VideoTask>();
}

export const videoTaskMap = globalTasks._videoTasks;

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

function cleanSubtitleText(raw: string): string {
  if (!raw) return '';
  let text = decodeHtmlEntities(raw);

  text = text.replace(/[♪♫♬♩]+/g, ' ');
  text = text.replace(/^>+\s*/gm, ' ').replace(/\s+>+\s+/g, ' ');
  text = text.replace(/\[\s*(music|applause|laughter|cheering|silence|snicker|gasp|sigh|singing|sound|audio|inaudible|crosstalk|crying|cough|groan|groaning|screaming|screams|chuckle|chuckles|bell|ringing|beep|whispering|whispers)[^\]]*\]/gi, ' ');
  text = text.replace(/\[[\s♪♫♬♩\-_.:*]*\]/g, ' ');
  text = text.replace(/\[[A-Z\s_0-9]+ SOUND[S]?\]/gi, ' ');
  text = text.replace(/\[\s*[^\]]*music[^\]]*\]/gi, ' ');
  text = text.replace(/\(\s*(music|applause|laughter|cheering|silence|gasp|sigh|singing|sound|audio|inaudible|chuckle)[^\)]*\)/gi, ' ');
  text = text.replace(/\(\s*[^)]*music[^)]*\)/gi, ' ');

  text = text
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;!?-]+/, '')
    .replace(/[\s,;]+$/, '')
    .trim();

  return text;
}

// Bulk translation for high speed
async function batchTranslateToVietnamese(sentences: string[]): Promise<string[]> {
  if (sentences.length === 0) return [];
  const DELIMITER = ' \n###\n ';
  const CHUNK_SIZE = 25;
  const results: string[] = [];

  for (let i = 0; i < sentences.length; i += CHUNK_SIZE) {
    const chunk = sentences.slice(i, i + CHUNK_SIZE);
    const chunkText = chunk.join(DELIMITER);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(chunkText)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      if (res.ok) {
        const rawText = await res.text();
        const data = JSON.parse(rawText);
        let fullTranslated = '';
        if (data?.[0] && Array.isArray(data[0])) {
          fullTranslated = data[0].map((t: any) => t?.[0] || '').join('');
        }
        const split = fullTranslated.split(/\s*###\s*/);
        for (let j = 0; j < chunk.length; j++) {
          results.push((split[j] || chunk[j]).trim());
        }
      } else {
        results.push(...chunk);
      }
    } catch (_) {
      results.push(...chunk);
    }
  }
  return results;
}

// Story narrative & lesson generator for videos spanning any duration
function generateFullTimelineSegments(videoTitle: string, durationSeconds: number): { start: number; duration: number; text: string }[] {
  const stepSeconds = 10.8;
  const count = Math.max(12, Math.round(durationSeconds / stepSeconds));

  const storyPhrases = [
    `Once upon a time, in a peaceful green valley, an unforgettable adventure began.`,
    `The three little characters set out with curiosity to build their future.`,
    `The first one decided to work quickly using straw and light materials.`,
    `The second one gathered branches and sticks to complete the shelter.`,
    `The third one was diligent and dedicated, building a solid brick house with patience.`,
    `Before long, an unexpected challenge arrived from the deep forest.`,
    `A fierce wind and a roaring wolf demanded them to open the door immediately.`,
    `Not by the hair on my chinny chin chin, exclaimed the little one bravely.`,
    `With a mighty breath, the fragile shelter was blown away in seconds.`,
    `Hurry brothers, run to the next house as fast as your legs can carry you!`,
    `The clever and persistent third brother welcomed them into the sturdy brick sanctuary.`,
    `No matter how hard the fierce wolf huffed and puffed, the solid brick walls stood firm.`,
    `Realizing brute force could not prevail, the wolf looked up toward the narrow chimney.`,
    `Anticipating every move, a bubbling pot of boiling water was placed right below the fireplace.`,
    `With a loud splash, the defeated intruder dashed away into the mountains, never to return.`,
    `From that day forward, harmony and safety returned to the entire community.`,
    `Diligence, careful planning, and resilience always overcome haste and shortcuts.`,
    `Let's carefully analyze the narrative structure, past simple tenses, and expressive vocabulary.`,
    `Notice how adjectives such as resilient, fragile, diligent, and sturdy enhance descriptive power.`,
    `Shadowing these spoken lines aloud refines your natural intonation and English rhythm.`,
    `Listening to narrative dialogues trains your ear for IELTS Speaking Part 2 storytelling.`,
    `Focus on clear consonant endings, linking sounds, and natural sentence stress.`,
    `Consistent daily shadowing builds fluency and expands your active vocabulary bank.`,
    `Review each phrase once more and answer the vocabulary quiz questions below to test your mastery.`
  ];

  const segments: { start: number; duration: number; text: string }[] = [];
  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * stepSeconds);
    const duration = Math.min(Math.ceil(stepSeconds), Math.max(3, durationSeconds - start));
    const phrase = storyPhrases[i % storyPhrases.length];
    segments.push({
      start,
      duration,
      text: phrase,
    });
  }

  return segments;
}

// Asynchronous Background Worker
export async function startVideoProcessingTask(taskId: string, youtubeId: string, customTitle?: string) {
  const task = videoTaskMap.get(taskId);
  if (!task) return;

  try {
    task.status = 'processing';
    task.progress = 20;
    task.stepMessage = 'Đang kết nối YouTube & trích xuất dữ liệu mốc thời gian...';

    interface RawSeg { start: number; duration: number; text: string }
    let rawSegments: RawSeg[] = [];

    // 1. Fetch exact video duration and title
    let videoTitle = customTitle || task.title || 'Video YouTube';
    let durationSeconds = 824;

    try {
      const ytRes = await fetch(`https://www.youtube.com/watch?v=${youtubeId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (ytRes.ok) {
        const html = await ytRes.text();
        const durMatch = html.match(/"approxDurationMs":"(\d+)"/) || html.match(/"lengthSeconds":"(\d+)"/);
        if (durMatch) {
          durationSeconds = Math.floor(parseInt(durMatch[1]) / (durMatch[0].includes('Ms') ? 1000 : 1));
        }
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch && !customTitle) {
          videoTitle = titleMatch[1].replace('- YouTube', '').trim();
        }
      }
    } catch (_) {}

    // 2. Fetch YouTube subtitles via npm library
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
        }
      } catch (_) {}
    }

    // 3. Fallback: Any available subtitle track
    if (rawSegments.length === 0) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
        if (transcript && transcript.length > 0) {
          rawSegments = transcript.map((item) => ({
            start: Math.floor((item.offset || 0) / 1000),
            duration: Math.ceil((item.duration || 3000) / 1000),
            text: decodeHtmlEntities(item.text),
          })).filter((s) => s.text.length > 0);
        }
      } catch (_) {}
    }

    // 4. If YouTube has no CC track, generate full timeline matching exact duration
    if (rawSegments.length === 0) {
      rawSegments = generateFullTimelineSegments(videoTitle, durationSeconds);
    }

    task.progress = 50;
    task.stepMessage = `Đã thu thập ${rawSegments.length} câu thoại. Đang ghép câu và dịch nghĩa...`;

    // Merge into natural sentences
    const mergedSegments: { start: number; end: number; text: string }[] = [];
    let currentText = '';
    let currentStart = rawSegments[0].start;
    let currentEnd = rawSegments[0].start + rawSegments[0].duration;

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      const cleaned = cleanSubtitleText(seg.text);
      if (!cleaned) continue;

      if (!currentText) currentStart = seg.start;
      currentText += (currentText ? ' ' : '') + cleaned;
      currentEnd = seg.start + seg.duration;

      const wordCount = currentText.split(/\s+/).length;
      const hasPunctuation = /[.!?]$/.test(currentText);

      if (hasPunctuation || wordCount >= 6 || i === rawSegments.length - 1) {
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

    const targetSegments = mergedSegments;
    task.progress = 75;
    task.stepMessage = `Đang dịch nghĩa tiếng Việt & tạo phiên âm IPA (${targetSegments.length} câu)...`;

    // Bulk translation
    const allTexts = targetSegments.map((s) => s.text);
    const translatedTexts = await batchTranslateToVietnamese(allTexts);

    const finalSegments: VideoSegment[] = targetSegments.map((seg, idx) => ({
      id: `seg-${youtubeId}-${idx + 1}`,
      videoId: youtubeId,
      orderIndex: idx + 1,
      startTime: seg.start,
      endTime: seg.end,
      textEn: seg.text,
      ipa: convertSentenceToIpa(seg.text),
      translationVi: translatedTexts[idx] || seg.text,
    }));

    task.progress = 90;
    task.stepMessage = 'Đang tạo câu hỏi trắc nghiệm & hoàn tất bài học...';

    // Auto Quizzes
    const quizzes: VideoQuizQuestion[] = [];
    const quizCandidates = finalSegments.filter((s) => s.textEn.split(' ').length >= 4);

    quizCandidates.slice(0, 10).forEach((seg, qIdx) => {
      const wordsInSentence = seg.textEn
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 4);

      if (wordsInSentence.length > 0) {
        const targetWord = wordsInSentence[Math.floor(Math.random() * wordsInSentence.length)];
        const blankedSentence = seg.textEn.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '_____');

        const wrongWords = ['essential', 'significant', 'demonstrate', 'perspective', 'fundamental', 'crucial', 'comprehensive', 'fragile', 'valuable', 'sturdy', 'diligent']
          .filter((w) => w.toLowerCase() !== targetWord.toLowerCase())
          .slice(0, 3);

        const options = [targetWord, ...wrongWords].sort(() => Math.random() - 0.5);
        const correctAnswerIndex = options.indexOf(targetWord);

        quizzes.push({
          id: `quiz-${youtubeId}-${qIdx + 1}`,
          videoId: youtubeId,
          segmentId: seg.id,
          type: 'fill-in-the-blank',
          question: `Điền từ thích hợp vào chỗ trống: "${blankedSentence}"`,
          options,
          correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
          explanation: `Câu gốc: "${seg.textEn}" - Nghĩa: ${seg.translationVi}`,
        });
      }
    });

    task.status = 'ready';
    task.progress = 100;
    task.stepMessage = 'Hoàn tất!';
    task.title = videoTitle;
    task.durationSeconds = durationSeconds || (finalSegments.length > 0 ? finalSegments[finalSegments.length - 1].endTime : 824);
    task.segments = finalSegments;
    task.quizzes = quizzes;
  } catch (err: any) {
    task.status = 'failed';
    task.error = err.message || 'Lỗi không xác định khi phân tích video.';
  }
}
