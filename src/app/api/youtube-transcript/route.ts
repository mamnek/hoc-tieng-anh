import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { convertSentenceToIpa } from '@/lib/ipa-generator';
import { VideoSegment, VideoQuizQuestion } from '@/lib/types';

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

async function safeTranslateToVietnamese(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) {
      console.log(`[Translate] HTTP ${res.status} for: "${text.slice(0, 50)}..."`);
      return text;
    }
    const rawText = await res.text();
    if (!rawText || !rawText.trim().startsWith('[')) {
      return text;
    }
    const data = JSON.parse(rawText);
    if (data?.[0] && Array.isArray(data[0])) {
      return data[0].map((t: any) => t?.[0] || '').join('');
    }
    return text;
  } catch (err: any) {
    console.log(`[Translate] Error: ${err.message}`);
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body safely
    let body: any = {};
    try {
      const rawBodyText = await req.text();
      if (rawBodyText && rawBodyText.trim()) {
        body = JSON.parse(rawBodyText);
      }
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu gửi lên không đúng định dạng JSON.' },
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

    console.log(`\n========== [YouTube Transcript] Processing video: ${youtubeId} ==========`);

    // ─── PRIMARY METHOD: youtube-transcript npm library ───
    // This library uses InnerTube API (Android client) + web page scraping fallback.
    // It handles consent pages, cookie issues, and HTML entity decoding internally.
    interface RawSeg { start: number; duration: number; text: string }
    let rawSegments: RawSeg[] = [];

    // Attempt 1: English (en)
    const langAttempts = ['en', 'en-US', 'en-GB'];
    for (const lang of langAttempts) {
      if (rawSegments.length > 0) break;
      try {
        console.log(`[Method: youtube-transcript lib] Trying lang="${lang}"...`);
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeId, { lang });
        if (transcript && transcript.length > 0) {
          rawSegments = transcript.map((item) => ({
            start: Math.floor((item.offset || 0) / 1000),
            duration: Math.ceil((item.duration || 3000) / 1000),
            text: decodeHtmlEntities(item.text),
          })).filter((s) => s.text.length > 0);
          console.log(`[Method: youtube-transcript lib] ✓ Success with lang="${lang}": ${rawSegments.length} segments`);
          console.log(`[Method: youtube-transcript lib] First segment: "${rawSegments[0]?.text.slice(0, 80)}..."`);
        }
      } catch (err: any) {
        console.log(`[Method: youtube-transcript lib] ✗ Failed lang="${lang}": ${err.message}`);
      }
    }

    // Attempt 2: No specific language (let library pick default/auto-generated)
    if (rawSegments.length === 0) {
      try {
        console.log(`[Method: youtube-transcript lib] Trying without lang filter (auto/default)...`);
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
        if (transcript && transcript.length > 0) {
          rawSegments = transcript.map((item) => ({
            start: Math.floor((item.offset || 0) / 1000),
            duration: Math.ceil((item.duration || 3000) / 1000),
            text: decodeHtmlEntities(item.text),
          })).filter((s) => s.text.length > 0);
          console.log(`[Method: youtube-transcript lib] ✓ Success (no lang): ${rawSegments.length} segments`);
          console.log(`[Method: youtube-transcript lib] First segment: "${rawSegments[0]?.text.slice(0, 80)}..."`);
        }
      } catch (err: any) {
        console.log(`[Method: youtube-transcript lib] ✗ Failed (no lang): ${err.message}`);
      }
    }

    // ─── FALLBACK: Direct YouTube TimedText XML API ───
    if (rawSegments.length === 0) {
      const timedTextUrls = [
        `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en`,
        `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en&kind=asr`,
        `https://www.youtube.com/api/timedtext?v=${youtubeId}&lang=en-US`,
      ];
      for (const url of timedTextUrls) {
        if (rawSegments.length > 0) break;
        try {
          console.log(`[Method: TimedText XML] Trying: ${url.slice(0, 100)}...`);
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Cookie': 'CONSENT=YES+1',
            },
            cache: 'no-store',
          });
          console.log(`[Method: TimedText XML] HTTP ${res.status}`);
          if (res.ok) {
            const xmlText = await res.text();
            console.log(`[Method: TimedText XML] Response length: ${xmlText.length} chars, starts with: "${xmlText.slice(0, 100)}"`);
            if (xmlText.includes('<text')) {
              const regex = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>(.*?)<\/text>/gi;
              let m;
              while ((m = regex.exec(xmlText)) !== null) {
                const text = decodeHtmlEntities(m[3].replace(/<[^>]*>/g, ''));
                if (text) {
                  rawSegments.push({
                    start: Math.floor(parseFloat(m[1])),
                    duration: Math.ceil(parseFloat(m[2] || '3')),
                    text,
                  });
                }
              }
              console.log(`[Method: TimedText XML] ✓ Parsed ${rawSegments.length} segments`);
            }
          }
        } catch (err: any) {
          console.log(`[Method: TimedText XML] ✗ Error: ${err.message}`);
        }
      }
    }

    // ─── FALLBACK 2: Scrape YouTube HTML with CONSENT cookie ───
    if (rawSegments.length === 0) {
      try {
        console.log(`[Method: HTML Scrape] Fetching youtube.com/watch?v=${youtubeId} with CONSENT cookie...`);
        const ytRes = await fetch(`https://www.youtube.com/watch?v=${youtubeId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+634',
          },
          cache: 'no-store',
        });
        console.log(`[Method: HTML Scrape] HTTP ${ytRes.status}`);

        if (ytRes.ok) {
          const html = await ytRes.text();
          console.log(`[Method: HTML Scrape] HTML length: ${html.length} chars`);

          // Check for consent page
          if (html.includes('consent.youtube.com') || html.includes('consent.google.com')) {
            console.log(`[Method: HTML Scrape] ✗ Got consent/cookie wall page instead of video page`);
          } else {
            const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
            if (match) {
              console.log(`[Method: HTML Scrape] Found ytInitialPlayerResponse`);
              try {
                const pr = JSON.parse(match[1]);
                const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
                console.log(`[Method: HTML Scrape] Found ${tracks.length} caption tracks`);

                const enTrack = tracks.find((t: any) => t.languageCode?.startsWith('en')) || tracks[0];
                if (enTrack?.baseUrl) {
                  console.log(`[Method: HTML Scrape] Fetching caption baseUrl for lang="${enTrack.languageCode}"...`);
                  const capRes = await fetch(enTrack.baseUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                  });
                  if (capRes.ok) {
                    const xmlText = await capRes.text();
                    const regex = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>(.*?)<\/text>/gi;
                    let m;
                    while ((m = regex.exec(xmlText)) !== null) {
                      const text = decodeHtmlEntities(m[3].replace(/<[^>]*>/g, ''));
                      if (text) {
                        rawSegments.push({
                          start: Math.floor(parseFloat(m[1])),
                          duration: Math.ceil(parseFloat(m[2] || '3')),
                          text,
                        });
                      }
                    }
                    console.log(`[Method: HTML Scrape] ✓ Parsed ${rawSegments.length} segments from baseUrl`);
                  }
                }
              } catch (e: any) {
                console.log(`[Method: HTML Scrape] ✗ JSON parse error: ${e.message}`);
              }
            } else {
              console.log(`[Method: HTML Scrape] ✗ ytInitialPlayerResponse not found in HTML`);
            }
          }
        }
      } catch (err: any) {
        console.log(`[Method: HTML Scrape] ✗ Fetch error: ${err.message}`);
      }
    }

    // ─── Final check ───
    console.log(`[Result] Total raw segments: ${rawSegments.length}`);

    if (rawSegments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không thể tải phụ đề tiếng Anh cho video này. Nguyên nhân có thể: (1) Video không có phụ đề tiếng Anh [CC], (2) Phụ đề bị tắt bởi chủ kênh, hoặc (3) YouTube đang chặn truy cập từ máy chủ. Vui lòng thử video YouTube khác có bật CC tiếng Anh.',
        },
        { status: 400 }
      );
    }

    // ─── Merge micro-fragments into natural sentences ───
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

    const targetSegments = mergedSegments.slice(0, 8);
    console.log(`[Result] Merged into ${mergedSegments.length} sentences, using top ${targetSegments.length}`);

    // ─── Translate & generate IPA ───
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

    // ─── Generate Quizzes from real vocabulary ───
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
        question: `Trong lời thoại "#1: ${seg1.textEn.slice(0, 50)}...", từ "${targetWord}" có nghĩa là gì?`,
        options: [
          `Nghĩa đúng của từ "${targetWord}" trong ngữ cảnh`,
          'Từ trái nghĩa không liên quan',
          'Một từ vựng ngẫu nhiên khác',
          'Phương án không chính xác',
        ],
        correctAnswerIndex: 0,
        explanation: `Từ "${targetWord}" xuất hiện trong lời thoại thật của video tại mốc ${seg1.startTime}s.`,
      });

      if (finalSegments.length > 1) {
        const seg2 = finalSegments[1];
        finalQuizzes.push({
          id: `quiz-${youtubeId}-2`,
          videoId: youtubeId,
          segmentId: seg2.id,
          type: 'fill-in-the-blank',
          question: `Điền từ còn thiếu: "${seg2.textEn.replace(targetWord, '_______')}"`,
          options: [targetWord, 'different', 'unknown', 'incorrect'],
          correctAnswerIndex: 0,
          explanation: `Đáp án đúng là "${targetWord}" theo lời thoại thật của video.`,
        });
      }
    }

    console.log(`[Result] ✓ Done! ${finalSegments.length} segments, ${finalQuizzes.length} quizzes`);
    console.log(`========== [YouTube Transcript] Completed ==========\n`);

    return NextResponse.json({
      success: true,
      segments: finalSegments,
      quizzes: finalQuizzes,
    });
  } catch (error: any) {
    console.error(`[YouTube Transcript] Unhandled error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: `Lỗi xử lý máy chủ: ${error?.message || 'Không thể tải phụ đề.'}`,
      },
      { status: 500 }
    );
  }
}
