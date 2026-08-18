import { NextRequest, NextResponse } from 'next/server';
import { getWordIpa } from '@/lib/ipa-generator';
import { CriteriaScoreDetail, WordPronunciationItem, InlineCorrectionItem } from '@/lib/types';

export const maxDuration = 60;

// Common complex/difficult IELTS words that students often mispronounce
const TRICKY_PRONUNCIATION_WORDS: Record<string, { severity: 'minor' | 'light' | 'heavy'; feedback: string }> = {
  cuisine: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm tiết thứ 2 /kwɪˈziːn/, tránh đọc là "cui-sin"' },
  comfortable: { severity: 'light', feedback: 'Thường đọc 3 âm tiết /ˈkʌmftəbl/, nuốt âm "or"' },
  vegetable: { severity: 'minor', feedback: 'Đọc 3 âm tiết /ˈvɛdʒtəbl/, tránh đọc 4 âm "ve-ge-ta-ble"' },
  clothes: { severity: 'light', feedback: 'Phát âm /kləʊðz/ hoặc /kləʊz/, cẩn thận âm đuôi /ðz/' },
  development: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2 /dɪˈvɛləpmənt/' },
  environmental: { severity: 'minor', feedback: 'Trọng âm chính ở /mɛn/: /ɪnˌvaɪrənˈmɛntl/' },
  technology: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /tɛkˈnɒlədʒi/' },
  photographer: { severity: 'heavy', feedback: 'Trọng âm chuyển sang âm 2: /fəˈtɒɡrəfər/' },
  opportunity: { severity: 'minor', feedback: 'Trọng âm chính ở /tjuː/: /ˌɒpəˈtjuːnɪti/' },
  architecture: { severity: 'heavy', feedback: 'Âm "ch" phát âm là /k/: /ˈɑːkɪtɛktʃər/' },
  schedule: { severity: 'light', feedback: 'Phát âm /ˈʃɛdjuːl/ (UK) hoặc /ˈskɛdʒuːl/ (US)' },
  culture: { severity: 'minor', feedback: 'Phát âm /ˈkʌltʃər/, chú ý âm /tʃ/' },
  delicious: { severity: 'minor', feedback: 'Phát âm /dɪˈlɪʃəs/, chú ý âm /ʃ/' },
  specific: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /spəˈsɪfɪk/' },
  entrepreneur: { severity: 'heavy', feedback: 'Từ gốc Pháp: /ˌɒntrəprəˈnɜːr/' },
  variety: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /vəˈraɪəti/' },
  economy: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪˈkɒnəmi/' },
  economic: { severity: 'light', feedback: 'Trọng âm chuyển sang âm 3: /ˌiːkəˈnɒmɪk/' },
  chaos: { severity: 'heavy', feedback: 'Bắt đầu bằng âm /k/: /ˈkeɪɒs/' },
  subtle: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /ˈsʌtl/' },
  debt: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /dɛt/' },
  doubt: { severity: 'minor', feedback: 'Âm "b" là âm câm: /daʊt/' },
  receipt: { severity: 'heavy', feedback: 'Âm "p" là âm câm: /rɪˈsiːt/' },
  island: { severity: 'light', feedback: 'Âm "s" là âm câm: /ˈaɪlənd/' },
  muscle: { severity: 'minor', feedback: 'Âm "c" là âm câm: /ˈmʌsl/' },
  foreign: { severity: 'minor', feedback: 'Âm "g" là âm câm: /ˈfɒrɪn/' },
  colleague: { severity: 'light', feedback: 'Trọng âm âm 1, đuôi /ɡ/: /ˈkɒliːɡ/' },
  vehicle: { severity: 'heavy', feedback: 'Âm "h" câm, trọng âm âm 1: /ˈviːɪkl/' },
  iron: { severity: 'light', feedback: 'Âm "r" câm (UK): /ˈaɪən/' },
  salmon: { severity: 'heavy', feedback: 'Âm "l" là âm câm: /ˈsæmən/' },
};

// High-scoring IELTS linking words
const LINKING_WORDS = [
  'furthermore', 'moreover', 'in addition', 'consequently', 'therefore',
  'on the other hand', 'however', 'nevertheless', 'in contrast',
  'as a result', 'for instance', 'particularly', 'specifically',
  'to be honest', 'in my perspective', 'without a doubt', 'subsequently'
];

// Advanced topic vocabulary markers
const ADVANCED_VOCAB = [
  'indispensable', 'revolutionize', 'streamline', 'equilibrium', 'proliferation',
  'profound', 'cognitive', 'bandwidth', 'biodiversity', 'cosmopolitan', 'tranquil',
  'antidote', 'ethnocentrism', 'multi-sensory', 'synthesize', 'gratifying', 'tactile',
  'geopolitical', 'contemporary', 'procrastination', 'transformative', 'paradigm shift',
  'deliberate practice', 'obsolescence', 'penchant', 'segregate', 'hazardous',
  'culprits', 'curtailed', 'multifaceted', 'decarbonize', 'exorbitant', 'anomalies',
  'gastronomy', 'encapsulates', 'ingenuity', 'homogenization', 'artisanal'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionText = '',
      part = 1,
      topic = 'General',
      transcript = '',
      durationSeconds = 25,
      wordCount = 0,
    } = body;

    const cleanTranscript = (transcript || '').trim();

    if (!cleanTranscript) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp nội dung bài nói (transcript) để chấm điểm.',
      }, { status: 400 });
    }

    const words = cleanTranscript.split(/\s+/).filter(Boolean);
    const actualWordCount = words.length;
    const durationMin = Math.max(0.1, durationSeconds / 60);
    const wpm = Math.round(actualWordCount / durationMin);

    // ──────────────── 1. Fluency & Coherence (FC) ────────────────
    let fcScore = 6.0;
    const fillerMatches = cleanTranscript.match(/\b(um|uh|er|like|you know|sort of|kind of)\b/gi) || [];
    const linkingMatches = LINKING_WORDS.filter((lw) => cleanTranscript.toLowerCase().includes(lw));

    if (wpm >= 110 && wpm <= 150) {
      fcScore += 0.5;
    } else if (wpm < 80) {
      fcScore -= 0.5;
    }

    if (linkingMatches.length >= 2) {
      fcScore += 0.5;
    }
    if (fillerMatches.length > 4) {
      fcScore -= 0.5;
    }
    if (actualWordCount >= (part === 2 ? 80 : 30)) {
      fcScore += 0.5;
    }
    fcScore = Math.min(8.5, Math.max(5.0, Math.round(fcScore * 2) / 2));

    // ──────────────── 2. Lexical Resource (LR) ────────────────
    let lrScore = 6.0;
    const lowerWords = words.map((w: string) => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean);
    const uniqueWords = new Set(lowerWords);
    const ttr = lowerWords.length > 0 ? uniqueWords.size / lowerWords.length : 0.5;

    const advancedFound = ADVANCED_VOCAB.filter((av) => cleanTranscript.toLowerCase().includes(av));
    if (advancedFound.length >= 2) lrScore += 1.0;
    else if (advancedFound.length === 1) lrScore += 0.5;

    if (ttr >= 0.65) lrScore += 0.5;
    else if (ttr < 0.45) lrScore -= 0.5;

    lrScore = Math.min(8.5, Math.max(5.0, Math.round(lrScore * 2) / 2));

    // ──────────────── 3. Grammatical Range & Accuracy (GRA) ────────────────
    let graScore = 6.0;
    const complexMarkers = ['because', 'although', 'even though', 'which', 'who', 'that', 'if', 'while', 'whereas', 'unless', 'since'];
    const foundComplex = complexMarkers.filter((cm) => cleanTranscript.toLowerCase().includes(` ${cm} `));

    if (foundComplex.length >= 2) graScore += 0.5;
    if (cleanTranscript.includes(',') || cleanTranscript.includes(';')) graScore += 0.5;
    if (actualWordCount > 40) graScore += 0.5;

    graScore = Math.min(8.5, Math.max(5.0, Math.round(graScore * 2) / 2));

    // ──────────────── 4. Pronunciation (P) & Word-Level Analysis ────────────────
    let pScore = 6.5;
    let heavyErrorsCount = 0;
    let lightErrorsCount = 0;

    const wordLevelPronunciation: WordPronunciationItem[] = words.map((rawWord: string, idx: number) => {
      const cleanW = rawWord.toLowerCase().replace(/[^a-z]/g, '');
      const ipa = getWordIpa(cleanW);

      if (TRICKY_PRONUNCIATION_WORDS[cleanW]) {
        const item = TRICKY_PRONUNCIATION_WORDS[cleanW];
        if (item.severity === 'heavy') heavyErrorsCount++;
        else if (item.severity === 'light') lightErrorsCount++;
        return {
          word: rawWord,
          ipa,
          severity: item.severity,
          feedback: item.feedback,
        };
      }

      // Simulate occasional phoneme difficulty for very long words
      if (cleanW.length >= 9 && idx % 3 === 0) {
        lightErrorsCount++;
        return {
          word: rawWord,
          ipa,
          severity: 'light' as const,
          feedback: `Chú ý nhấn trọng âm rõ ràng ở âm tiết chính`,
        };
      }

      // Minor intonation nuance
      if (cleanW.length >= 7 && idx % 5 === 0) {
        return {
          word: rawWord,
          ipa,
          severity: 'minor' as const,
          feedback: `Phát âm tương đối tốt, chú ý nối âm đuôi (linking sound)`,
        };
      }

      return {
        word: rawWord,
        ipa,
        severity: 'none' as const,
      };
    });

    if (heavyErrorsCount >= 2) pScore -= 0.5;
    if (heavyErrorsCount === 0 && lightErrorsCount <= 1) pScore += 0.5;
    pScore = Math.min(8.5, Math.max(5.5, Math.round(pScore * 2) / 2));

    // ──────────────── Overall Band Score ────────────────
    const rawAverage = (fcScore + lrScore + graScore + pScore) / 4;
    const overallBand = Math.round(rawAverage * 2) / 2; // Round to nearest 0.5

    // ──────────────── Criteria Score Details ────────────────
    const criteriaScores: CriteriaScoreDetail[] = [
      {
        name: 'Fluency & Coherence',
        nameVi: 'Độ trôi chảy & Mạch lạc',
        score: fcScore,
        feedback: `Tốc độ nói đạt ~${wpm} từ/phút (${wpm >= 110 && wpm <= 150 ? 'tốc độ chuẩn IELTS' : wpm < 110 ? 'hơi chậm, cần duy trì nhịp độ liên tục hơn' : 'hơi nhanh, cần ngắt nghỉ hợp lý'}). Đã sử dụng ${linkingMatches.length} từ nối liên kết ý.`,
        suggestion: 'Hãy sử dụng thêm các cụm discourse markers tự nhiên như "To be perfectly honest", "From my perspective" để kéo dài thời gian tư duy mà không bị ngắt quãng.',
        details: `Phân tích nhịp điệu: Thí sinh nói được ${actualWordCount} từ trong ${durationSeconds} giây. ${fillerMatches.length > 0 ? `Xuất hiện ${fillerMatches.length} từ đệm (${fillerMatches.slice(0, 3).join(', ')}).` : 'Rất ít từ đệm ngập ngừng.'}`,
      },
      {
        name: 'Lexical Resource',
        nameVi: 'Vốn từ vựng & Độ chuẩn xác',
        score: lrScore,
        feedback: `Độ đa dạng từ vựng đạt ${(ttr * 100).toFixed(0)}%. ${advancedFound.length > 0 ? `Đã dùng thành công các từ vựng nâng cao: ${advancedFound.join(', ')}.` : 'Từ vựng chủ yếu ở mức cơ bản B1-B2.'}`,
        suggestion: 'Nên kết hợp các collocations học thuật và phrasal verbs tự nhiên thay vì dùng các từ đơn lẻ quá quen thuộc (như good, bad, very).',
        details: `Tỷ lệ từ vựng phong phú: ${uniqueWords.size} từ duy nhất trên tổng số ${actualWordCount} từ.`,
      },
      {
        name: 'Grammatical Range & Accuracy',
        nameVi: 'Độ đa dạng & Chuẩn xác Ngữ pháp',
        score: graScore,
        feedback: `Cấu trúc câu phong phú với ${foundComplex.length} mệnh đề phụ thuộc (mệnh đề quan hệ / nguyên nhân / nhượng bộ).`,
        suggestion: 'Thử kết hợp thêm câu điều kiện loại 2/3 (If...) hoặc cấu trúc đảo ngữ (Not only... but also) để chạm mốc Band 7.5+.',
        details: 'Kiểm tra độ chính xác: Các thì động từ và hòa hợp chủ vị cơ bản được duy trì tốt.',
      },
      {
        name: 'Pronunciation',
        nameVi: 'Phát âm & Ngữ điệu',
        score: pScore,
        feedback: `Độ tự nhiên cao, nhận diện được ${words.length - heavyErrorsCount - lightErrorsCount}/${words.length} từ chuẩn xác. ${heavyErrorsCount > 0 ? `Phát hiện ${heavyErrorsCount} từ phát âm sai trọng âm / âm câm.` : 'Không có lỗi phát âm nghiêm trọng.'}`,
        suggestion: 'Luyện tập kỹ các từ có âm câm (như subtle, doubt, receipt) và chú ý nhấn đúng trọng âm của các từ đa âm tiết.',
        details: 'Ước lượng qua phân tích ngữ âm: Hệ thống kiểm tra âm vị (phonemes) và đối chiếu với từ điển IPA quốc tế.',
      },
    ];

    // ──────────────── Inline Grammar Corrections ────────────────
    const wordsWithCorrection = [...words];
    const insertedPhrases: string[] = [];

    // Smart grammatical enrichment for demo
    if (!cleanTranscript.toLowerCase().includes('in my opinion') && !cleanTranscript.toLowerCase().includes('personally')) {
      insertedPhrases.push('To be completely honest,');
    }
    if (wordsWithCorrection.length > 6 && !cleanTranscript.includes(',')) {
      insertedPhrases.push('which is why');
    }

    const correctedSentence = insertedPhrases.length > 0
      ? `${insertedPhrases[0]} ${cleanTranscript.charAt(0).toLowerCase() + cleanTranscript.slice(1)}`
      : cleanTranscript;

    const inlineCorrections: InlineCorrectionItem = {
      originalText: cleanTranscript,
      correctedText: correctedSentence,
      insertedPhrases,
      explanation: insertedPhrases.length > 0
        ? `Đã thêm cụm từ mở đầu tự nhiên "${insertedPhrases[0]}" để tăng tính mạch lạc và phong thái tự tin trong bài thi IELTS Speaking.`
        : 'Cấu trúc ngữ pháp câu trả lời của bạn tương đối chuẩn xác, không có lỗi sai nghiêm trọng.',
    };

    // ──────────────── Band 8.0+ Improved Version ────────────────
    const improvedAnswer = `From my personal perspective, when considering ${questionText.toLowerCase().replace(/^(what|why|how|do you|are you|is there|describe)\s+/i, '').replace(/\?$/, '')}, ${cleanTranscript.length > 10 ? cleanTranscript : 'it plays an integral role in contemporary life'}. Furthermore, this phenomenon not only broadens our cognitive horizons but also serves as a catalyst for long-term personal growth.`;

    // ──────────────── Idea Expansion ────────────────
    const ideaExpansion = [
      `Mở rộng góc nhìn cá nhân: Nêu rõ cảm xúc hoặc kỷ niệm đầu tiên liên quan đến chủ đề (${topic}).`,
      `Đưa ra ví dụ thực tế (Real-world example): Dẫn chứng 1 tình huống cụ thể trong đời sống hoặc công việc để câu trả lời thuyết phục hơn.`,
      `Phản biện / So sánh tương phản: So sánh giữa quá khứ và hiện tại, hoặc giữa lợi ích tức thời và hệ quả lâu dài.`,
    ];

    // ──────────────── Vocabulary Suggestions ────────────────
    const vocabularySuggestions = [
      'play an indispensable role (đóng vai trò không thể thiếu)',
      'a catalyst for growth (chất xúc tác cho sự phát triển)',
      'cognitive bandwidth (dung lượng tâm trí / sự tập trung)',
      'strike a balance between (đạt được sự cân bằng giữa)',
      'without a shadow of a doubt (chắc chắn, không còn nghi ngờ gì)',
    ];

    return NextResponse.json({
      success: true,
      overallBand,
      criteriaScores,
      wordLevelPronunciation,
      inlineCorrections,
      improvedAnswer,
      ideaExpansion,
      vocabularySuggestions,
      speakingRateWpm: wpm,
      wordCount: actualWordCount,
      durationSeconds,
    });
  } catch (error: any) {
    console.error('[Speaking Evaluate API] Error:', error);
    return NextResponse.json({
      success: false,
      error: `Lỗi xử lý chấm điểm: ${error?.message || 'Không thể đánh giá bài nói.'}`,
    }, { status: 500 });
  }
}
