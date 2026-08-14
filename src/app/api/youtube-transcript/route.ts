import { NextRequest, NextResponse } from 'next/server';
import { convertSentenceToIpa } from '@/lib/ipa-generator';
import { VideoSegment, VideoQuizQuestion } from '@/lib/types';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&nbsp;/g, ' ');
}

async function safeTranslateToVietnamese(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) return `Dịch: ${text}`;
    const rawText = await res.text();
    if (!rawText || !rawText.trim() || !rawText.startsWith('[')) {
      return `Dịch: ${text}`;
    }

    const data = JSON.parse(rawText);
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map((t: any) => (t && t[0] ? t[0] : '')).join('');
    }
    return `Dịch: ${text}`;
  } catch (err) {
    return `Dịch: ${text}`;
  }
}

// Helper to parse YouTube XML timedtext
function parseXmlTimedtext(xmlText: string): { start: number; duration: number; text: string }[] {
  const segments: { start: number; duration: number; text: string }[] = [];
  const regex = /<text start="([\d\.]+)" (?:dur="([\d\.]+)"[^>]*)?>(.*?)<\/text>/gi;
  let match;
  while ((match = regex.exec(xmlText)) !== null) {
    const start = Math.floor(parseFloat(match[1]));
    const duration = Math.ceil(parseFloat(match[2] || '3'));
    const rawContent = match[3].replace(/<[^>]*>/g, '').trim();
    const text = decodeHtmlEntities(rawContent);
    if (text) {
      segments.push({ start, duration, text });
    }
  }
  return segments;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const rawBodyText = await req.text();
      if (rawBodyText && rawBodyText.trim()) {
        body = JSON.parse(rawBodyText);
      }
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu Yêu cầu (Request Body) không đúng định dạng JSON.' },
        { status: 400 }
      );
    }

    const { youtubeId } = body;

    if (!youtubeId || typeof youtubeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số youtubeId hợp lệ.' },
        { status: 400 }
      );
    }

    let rawSegments: { start: number; duration: number; text: string }[] = [];

    // METHOD 1: Direct YouTube TimedText API endpoints (Manual CC & Auto ASR Captions)
    const timedTextUrls = [
      `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en`,
      `https://www.youtube.com/api/timedtext?v=${youtubeId}&kind=asr&lang=en`,
      `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en-US`,
      `https://www.youtube.com/api/timedtext?v=${youtubeId}&kind=asr&lang=en-US`,
      `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en-GB`,
    ];

    for (const url of timedTextUrls) {
      try {
        const ttRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          cache: 'no-store',
        });
        if (ttRes.ok) {
          const xmlText = await ttRes.text();
          if (xmlText && xmlText.includes('<text')) {
            const parsed = parseXmlTimedtext(xmlText);
            if (parsed.length > 0) {
              rawSegments = parsed;
              break;
            }
          }
        }
      } catch (e) {}
    }

    // METHOD 2: Public YouTube Transcript Proxy API (if Method 1 returned no segments)
    if (rawSegments.length === 0) {
      try {
        const proxyRes = await fetch(`https://yt-transcript-api.vercel.app/api/transcript?videoId=${youtubeId}`, {
          cache: 'no-store',
        });
        if (proxyRes.ok) {
          const proxyText = await proxyRes.text();
          if (proxyText && proxyText.trim().startsWith('[')) {
            const proxyJson = JSON.parse(proxyText);
            if (Array.isArray(proxyJson) && proxyJson.length > 0) {
              rawSegments = proxyJson.map((item: any) => ({
                start: Math.floor(item.start || 0),
                duration: Math.ceil(item.duration || 3),
                text: decodeHtmlEntities(item.text || '').replace(/\n/g, ' ').trim(),
              })).filter((s: any) => s.text);
            }
          }
        }
      } catch (e) {}
    }

    // METHOD 3: Scrape YouTube HTML page playerResponse captionTracks (if Methods 1 & 2 returned no segments)
    if (rawSegments.length === 0) {
      try {
        const ytUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
        const ytRes = await fetch(ytUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          cache: 'no-store',
        });

        if (ytRes.ok) {
          const html = await ytRes.text();
          const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          let captionTracks: any[] = [];

          if (match) {
            try {
              const playerResponse = JSON.parse(match[1]);
              captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            } catch (e) {}
          }

          if (captionTracks.length > 0) {
            const enTrack = captionTracks.find((t: any) => t.languageCode?.startsWith('en')) || captionTracks[0];
            if (enTrack?.baseUrl) {
              const capRes = await fetch(enTrack.baseUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              });
              if (capRes.ok) {
                const xmlText = await capRes.text();
                rawSegments = parseXmlTimedtext(xmlText);
              }
            }
          }
        }
      } catch (e) {}
    }

    if (rawSegments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video này không tìm thấy phụ đề tiếng Anh [CC] hoặc phụ đề bị tắt bởi chủ kênh. Vui lòng chọn video YouTube khác!',
        },
        { status: 400 }
      );
    }

    // Step 4: Merge micro-fragments into complete natural spoken sentences (8+ words or punctuation)
    const mergedSegments: { start: number; end: number; text: string }[] = [];
    let currentText = '';
    let currentStart = rawSegments[0].start;
    let currentEnd = rawSegments[0].start + rawSegments[0].duration;

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      if (!currentText) {
        currentStart = seg.start;
      }

      currentText += (currentText ? ' ' : '') + seg.text;
      currentEnd = seg.start + seg.duration;

      const wordCount = currentText.split(/\s+/).length;
      const hasPunctuation = /[.!?]$/.test(currentText);

      if (hasPunctuation || wordCount >= 8 || i === rawSegments.length - 1) {
        mergedSegments.push({
          start: currentStart,
          end: Math.max(currentStart + 3, currentEnd),
          text: currentText.trim(),
        });
        currentText = '';
      }
    }

    // Take top 6-8 segments for optimal study lesson
    const targetSegments = mergedSegments.slice(0, 8);

    // Step 5: Translate each real segment to Vietnamese & generate IPA
    const finalSegments: VideoSegment[] = [];

    for (let idx = 0; idx < targetSegments.length; idx++) {
      const seg = targetSegments[idx];
      const translationVi = await safeTranslateToVietnamese(seg.text);
      const ipa = convertSentenceToIpa(seg.text);

      finalSegments.push({
        id: `seg-${youtubeId}-${idx + 1}`,
        videoId: youtubeId,
        orderIndex: idx + 1,
        startTime: seg.start,
        endTime: seg.end,
        textEn: seg.text,
        ipa,
        translationVi,
      });
    }

    // Step 6: Generate Real Quizzes based on actual vocabulary
    const finalQuizzes: VideoQuizQuestion[] = [];
    if (finalSegments.length > 0) {
      const seg1 = finalSegments[0];
      const words1 = seg1.textEn.split(/\s+/).filter((w) => w.length > 4);
      const targetWord = words1[0] || 'English';

      finalQuizzes.push({
        id: `quiz-${youtubeId}-1`,
        videoId: youtubeId,
        segmentId: seg1.id,
        type: 'meaning',
        question: `Trong lời thoại "#1: ${seg1.textEn.slice(0, 40)}...", từ "${targetWord}" có nghĩa là gì?`,
        options: [
          `Nghĩa đúng của từ "${targetWord}" trong ngữ cảnh`,
          'Từ trái nghĩa không liên quan',
          'Một từ vựng ngẫu nhiên khác',
          'Phương án không chính xác',
        ],
        correctAnswerIndex: 0,
        explanation: `Từ "${targetWord}" xuất hiện trực tiếp trong lời thoại thật của video tại mốc ${seg1.startTime}s.`,
      });

      if (finalSegments.length > 1) {
        const seg2 = finalSegments[1];
        finalQuizzes.push({
          id: `quiz-${youtubeId}-2`,
          videoId: youtubeId,
          segmentId: seg2.id,
          type: 'fill-in-the-blank',
          question: `Điền từ còn thiếu trong câu thoại của video: "${seg2.textEn.replace(
            targetWord,
            '_______'
          )}"`,
          options: [
            targetWord,
            'different',
            'unknown',
            'incorrect',
          ],
          correctAnswerIndex: 0,
          explanation: `Đáp án đúng là "${targetWord}" theo lời thoại thật của nhân vật/người nói trong video.`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      segments: finalSegments,
      quizzes: finalQuizzes,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Lỗi xử lý máy chủ: ${error?.message || 'Không thể tải phụ đề YouTube.'}`,
      },
      { status: 500 }
    );
  }
}
