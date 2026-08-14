import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { convertSentenceToIpa } from '@/lib/ipa-generator';
import { VideoSegment, VideoQuizQuestion } from '@/lib/types';

// Allow up to 300s for long videos (Vercel Pro). Hobby plan caps at 60s.
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

  // 1. Remove music symbols (♪, ♫, ♬, ♩)
  text = text.replace(/[♪♫♬♩]+/g, ' ');

  // 2. Remove speaker transition markers like ">>", ">>>", "> "
  text = text.replace(/^>+\s*/gm, ' ').replace(/\s+>+\s+/g, ' ');

  // 3. Remove sound annotations in square brackets: [Music], [Applause], [Laughter], [RINGING SOUND]...
  text = text.replace(/\[\s*(music|applause|laughter|cheering|silence|snicker|gasp|sigh|singing|sound|audio|inaudible|crosstalk|crying|cough|groan|groaning|screaming|screams|chuckle|chuckles|bell|ringing|beep|whispering|whispers)[^\]]*\]/gi, ' ');
  text = text.replace(/\[[\s♪♫♬♩\-_.:*]*\]/g, ' ');
  text = text.replace(/\[[A-Z\s_0-9]+ SOUND[S]?\]/gi, ' ');
  text = text.replace(/\[\s*[^\]]*music[^\]]*\]/gi, ' ');

  // 4. Remove sound annotations in parentheses: (Music), (Applause), (Laughter)...
  text = text.replace(/\(\s*(music|applause|laughter|cheering|silence|gasp|sigh|singing|sound|audio|inaudible|chuckle)[^\)]*\)/gi, ' ');
  text = text.replace(/\(\s*[^)]*music[^)]*\)/gi, ' ');

  // 5. Remove asterisks cues: *laughter*, *music*, *applause*
  text = text.replace(/\*\s*(music|applause|laughter|cheering|cough|sigh)\s*\*/gi, ' ');

  // 6. Clean up excessive whitespace, double spaces, leading/trailing punctuation
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

// Track fallback count globally per request
let translateFallbackCount = 0;

async function safeTranslateToVietnamese(text: string): Promise<string> {
  const MAX_RETRIES = 2;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (res.status === 429 || res.status === 503) {
        // Rate-limited or overloaded — backoff and retry
        const delayMs = 1000 * (attempt + 1); // 1s, 2s, 3s
        console.log(`[Translate] Rate-limited (HTTP ${res.status}), retry ${attempt + 1}/${MAX_RETRIES} after ${delayMs}ms`);
        await sleep(delayMs);
        continue;
      }

      if (!res.ok) {
        console.log(`[Translate] HTTP ${res.status} for: "${text.slice(0, 50)}..."`);
        translateFallbackCount++;
        return text;
      }

      const rawText = await res.text();
      if (!rawText || !rawText.trim().startsWith('[')) {
        translateFallbackCount++;
        return text;
      }

      const data = JSON.parse(rawText);
      if (data?.[0] && Array.isArray(data[0])) {
        return data[0].map((t: any) => t?.[0] || '').join('');
      }
      translateFallbackCount++;
      return text;
    } catch (err: any) {
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      console.log(`[Translate] Error after ${MAX_RETRIES + 1} attempts: ${err.message}`);
      translateFallbackCount++;
      return text;
    }
  }
  translateFallbackCount++;
  return text;
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

    // ─── Merge micro-fragments into natural sentences (filtering music/sound cues) ───
    const mergedSegments: { start: number; end: number; text: string }[] = [];
    let currentText = '';
    let currentStart = rawSegments[0].start;
    let currentEnd = rawSegments[0].start + rawSegments[0].duration;

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      const cleaned = cleanSubtitleText(seg.text);
      if (!cleaned) continue; // Skip pure music / sound cues like [Music], [Applause], ♪

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

    // ─── Apply safety cap (1000 sentences max) with user notification ───
    const MAX_SEGMENTS = 1000;
    let wasTruncated = false;
    let targetSegments = mergedSegments;
    if (mergedSegments.length > MAX_SEGMENTS) {
      targetSegments = mergedSegments.slice(0, MAX_SEGMENTS);
      wasTruncated = true;
      const lastSeg = targetSegments[targetSegments.length - 1];
      const coveredMinutes = Math.floor(lastSeg.end / 60);
      console.log(`[Result] Video cực dài: ${mergedSegments.length} câu, cắt còn ${MAX_SEGMENTS} câu (~${coveredMinutes} phút đầu)`);
    }
    console.log(`[Result] Merged into ${mergedSegments.length} sentences, processing ${targetSegments.length}`);

    // ─── Translate & generate IPA (batch parallel, 5 concurrent + delay between batches) ───
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 200; // 200ms delay between batches to avoid rate-limit
    const finalSegments: VideoSegment[] = new Array(targetSegments.length);
    const startTime = Date.now();
    translateFallbackCount = 0; // Reset counter for this request

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

      // Log progress every 50 segments
      if (batchEnd % 50 === 0 || batchEnd === targetSegments.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Progress] Translated ${batchEnd}/${targetSegments.length} segments (${elapsed}s elapsed, ${translateFallbackCount} fallbacks)`);
      }

      // Small delay between batches to avoid Google Translate rate-limit
      if (batchEnd < targetSegments.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    const processingMs = Date.now() - startTime;
    console.log(`[Result] Translated ${finalSegments.length} segments in ${(processingMs / 1000).toFixed(1)}s (${translateFallbackCount} fallbacks)`);

    // ─── Generate Quizzes spread across the full video ───
    const finalQuizzes: VideoQuizQuestion[] = [];
    if (finalSegments.length > 0) {
      // Pick up to 6 quiz positions spread evenly across the video
      const quizCount = Math.min(6, finalSegments.length);
      const step = Math.max(1, Math.floor(finalSegments.length / quizCount));
      const quizIndices: number[] = [];
      for (let i = 0; i < finalSegments.length && quizIndices.length < quizCount; i += step) {
        quizIndices.push(i);
      }

      for (let qi = 0; qi < quizIndices.length; qi++) {
        const seg = finalSegments[quizIndices[qi]];
        const words = seg.textEn.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, '').length > 4);
        if (words.length === 0) continue;
        const targetWord = words[Math.floor(Math.random() * Math.min(words.length, 5))];
        const cleanWord = targetWord.replace(/[^a-zA-Z]/g, '');

        if (qi % 2 === 0) {
          finalQuizzes.push({
            id: `quiz-${youtubeId}-${qi + 1}`,
            videoId: youtubeId,
            segmentId: seg.id,
            type: 'meaning',
            question: `Tại mốc ${Math.floor(seg.startTime / 60)}:${String(seg.startTime % 60).padStart(2, '0')}, câu "${seg.textEn.slice(0, 60)}..." — từ "${cleanWord}" có nghĩa là gì?`,
            options: [
              `Nghĩa đúng của từ "${cleanWord}" trong ngữ cảnh`,
              'Từ trái nghĩa không liên quan',
              'Một từ vựng ngẫu nhiên khác',
              'Phương án không chính xác',
            ],
            correctAnswerIndex: 0,
            explanation: `Từ "${cleanWord}" xuất hiện trong lời thoại thật tại mốc ${Math.floor(seg.startTime / 60)}:${String(seg.startTime % 60).padStart(2, '0')}.`,
          });
        } else {
          const blankedText = seg.textEn.replace(targetWord, '_______');
          finalQuizzes.push({
            id: `quiz-${youtubeId}-${qi + 1}`,
            videoId: youtubeId,
            segmentId: seg.id,
            type: 'fill-in-the-blank',
            question: `Điền từ còn thiếu (mốc ${Math.floor(seg.startTime / 60)}:${String(seg.startTime % 60).padStart(2, '0')}): "${blankedText.slice(0, 80)}..."`,
            options: [cleanWord, 'different', 'unknown', 'incorrect'],
            correctAnswerIndex: 0,
            explanation: `Đáp án đúng là "${cleanWord}" theo lời thoại thật của video.`,
          });
        }
      }
    }

    console.log(`[Result] ✓ Done! ${finalSegments.length} segments, ${finalQuizzes.length} quizzes, ${(processingMs / 1000).toFixed(1)}s`);
    console.log(`========== [YouTube Transcript] Completed ==========\n`);

    return NextResponse.json({
      success: true,
      segments: finalSegments,
      quizzes: finalQuizzes,
      truncated: wasTruncated,
      totalMerged: mergedSegments.length,
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
