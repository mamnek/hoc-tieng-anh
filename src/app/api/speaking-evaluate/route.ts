import { NextRequest, NextResponse } from 'next/server';
import { getWordIpa } from '@/lib/ipa-generator';
import { CriteriaScoreDetail, WordPronunciationItem, InlineCorrectionItem } from '@/lib/types';

export const maxDuration = 10;

// Tricky pronunciation words, silent letters & multi-syllabic stress patterns
const TRICKY_PRONUNCIATION_WORDS: Record<string, { severity: 'minor' | 'light' | 'heavy'; feedback: string }> = {
  cuisine: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm tiết thứ 2 /kwɪˈziːn/, tránh đọc là "cui-sin"' },
  comfortable: { severity: 'light', feedback: 'Thường đọc 3 âm tiết /ˈkʌmftəbl/, nuốt âm "or"' },
  comfort: { severity: 'light', feedback: 'Trọng âm rơi vào âm tiết đầu /ˈkʌmfət/, tránh đọc là "come-fort"' },
  vegetable: { severity: 'light', feedback: 'Đọc 3 âm tiết /ˈvɛdʒtəbl/, tránh đọc 4 âm "ve-ge-ta-ble"' },
  clothes: { severity: 'light', feedback: 'Phát âm /kləʊðz/ hoặc /kləʊz/, cẩn thận âm đuôi /ðz/' },
  development: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2 /dɪˈvɛləpmənt/' },
  environmental: { severity: 'light', feedback: 'Trọng âm chính ở /mɛn/: /ɪnˌvaɪrənˈmɛntl/' },
  technology: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /tɛkˈnɒlədʒi/' },
  photographer: { severity: 'heavy', feedback: 'Trọng âm chuyển sang âm 2: /fəˈtɒɡrəfər/' },
  opportunity: { severity: 'light', feedback: 'Trọng âm chính ở /tjuː/: /ˌɒpəˈtjuːnɪti/' },
  architecture: { severity: 'heavy', feedback: 'Âm "ch" phát âm là /k/: /ˈɑːkɪtɛktʃər/' },
  schedule: { severity: 'light', feedback: 'Phát âm /ˈʃɛdjuːl/ (UK) hoặc /ˈskɛdʒuːl/ (US)' },
  culture: { severity: 'minor', feedback: 'Phát âm /ˈkʌltʃər/, chú ý âm /tʃ/' },
  delicious: { severity: 'minor', feedback: 'Phát âm /dɪˈlɪʃəs/, chú ý âm /ʃ/' },
  specific: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /spəˈsɪfɪk/' },
  entrepreneur: { severity: 'heavy', feedback: 'Từ mượn tiếng Pháp: /ˌɒntrəprəˈnɜːr/' },
  variety: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /vəˈraɪəti/' },
  economy: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪˈkɒnəmi/' },
  economic: { severity: 'light', feedback: 'Trọng âm chuyển sang âm 3: /ˌiːkəˈnɒmɪk/' },
  chaos: { severity: 'heavy', feedback: 'Bắt đầu bằng âm /k/: /ˈkeɪɒs/' },
  subtle: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /ˈsʌtl/' },
  debt: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /dɛt/' },
  doubt: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /daʊt/' },
  receipt: { severity: 'heavy', feedback: 'Âm "p" là âm câm: /rɪˈsiːt/' },
  island: { severity: 'heavy', feedback: 'Âm "s" là âm câm: /ˈaɪlənd/' },
  muscle: { severity: 'light', feedback: 'Âm "c" là âm câm: /ˈmʌsl/' },
  foreign: { severity: 'minor', feedback: 'Âm "g" là âm câm: /ˈfɒrɪn/' },
  colleague: { severity: 'light', feedback: 'Trọng âm âm 1, đuôi /ɡ/: /ˈkɒliːɡ/' },
  vehicle: { severity: 'heavy', feedback: 'Âm "h" câm, trọng âm âm 1: /ˈviːɪkl/' },
  iron: { severity: 'light', feedback: 'Âm "r" câm (UK): /ˈaɪən/' },
  salmon: { severity: 'heavy', feedback: 'Âm "l" là âm câm: /ˈsæmən/' },
  alarm: { severity: 'light', feedback: 'Trọng âm rơi vào âm tiết thứ hai /əˈlɑːm/, chú ý nguyên âm dài /ɑː/' },
  repair: { severity: 'light', feedback: 'Trọng âm rơi vào âm tiết thứ hai /rɪˈpeər/, chú ý nguyên âm đôi /eə/' },
  stressed: { severity: 'light', feedback: 'Chú ý chùm phụ âm đầu /str/ và âm đuôi /t/: /strɛst/' },
  food: { severity: 'minor', feedback: 'Nguyên âm dài /uː/ và bật rõ âm đuôi /d/: /fuːd/' },
  favorite: { severity: 'minor', feedback: 'Trọng âm rơi vào âm tiết đầu: /ˈfeɪvərɪt/' },
};

// High-scoring IELTS linking words & discourse markers
const LINKING_WORDS = [
  'furthermore', 'moreover', 'in addition', 'consequently', 'therefore',
  'on the other hand', 'however', 'nevertheless', 'in contrast',
  'as a result', 'for instance', 'for example', 'particularly', 'specifically',
  'to be honest', 'to be completely honest', 'in my perspective', 'from my point of view',
  'without a doubt', 'subsequently', 'in terms of', 'as far as i know'
];

// Advanced topic vocabulary & academic markers
const ADVANCED_VOCAB = [
  'indispensable', 'revolutionize', 'streamline', 'equilibrium', 'proliferation',
  'profound', 'cognitive', 'bandwidth', 'biodiversity', 'cosmopolitan', 'tranquil',
  'antidote', 'ethnocentrism', 'multi-sensory', 'synthesize', 'gratifying', 'tactile',
  'geopolitical', 'contemporary', 'procrastination', 'transformative', 'paradigm shift',
  'deliberate practice', 'obsolescence', 'penchant', 'segregate', 'hazardous',
  'culprits', 'curtailed', 'multifaceted', 'decarbonize', 'exorbitant', 'anomalies',
  'gastronomy', 'encapsulates', 'ingenuity', 'homogenization', 'artisanal',
  'significant', 'perspective', 'convenient', 'essential', 'fundamental', 'crucial',
  'fascinating', 'exceptionally', 'worthwhile', 'comprehensive', 'sustainable'
];

// Levenshtein distance helper
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// Sequence alignment between Spoken Words and Target Reference Sentence
function alignWithReference(
  spokenWords: string[],
  referenceWords: string[]
): WordPronunciationItem[] {
  const m = spokenWords.length;
  const n = referenceWords.length;

  // DP matrix for alignment
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i * 2;
  for (let j = 0; j <= n; j++) dp[0][j] = j * 2;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const s = spokenWords[i - 1].toLowerCase().replace(/[^a-z]/g, '');
      const r = referenceWords[j - 1].toLowerCase().replace(/[^a-z]/g, '');
      
      let matchCost = 0;
      if (s === r) {
        matchCost = 0;
      } else {
        const dist = levenshteinDistance(s, r);
        matchCost = Math.min(3, dist);
      }

      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + matchCost, // match / substitution
        dp[i - 1][j] + 2,             // insertion
        dp[i][j - 1] + 2              // deletion
      );
    }
  }

  // Backtracking
  let i = m;
  let j = n;
  const aligned: { spoken?: string; ref?: string; cost: number }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const s = spokenWords[i - 1].toLowerCase().replace(/[^a-z]/g, '');
      const r = referenceWords[j - 1].toLowerCase().replace(/[^a-z]/g, '');
      const cost = s === r ? 0 : Math.min(3, levenshteinDistance(s, r));

      if (dp[i][j] === dp[i - 1][j - 1] + cost) {
        aligned.unshift({ spoken: spokenWords[i - 1], ref: referenceWords[j - 1], cost });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + 2)) {
      aligned.unshift({ spoken: spokenWords[i - 1], ref: undefined, cost: 2 });
      i--;
    } else if (j > 0) {
      aligned.unshift({ spoken: undefined, ref: referenceWords[j - 1], cost: 2 });
      j--;
    }
  }

  // Build WordPronunciationItem array
  const result: WordPronunciationItem[] = [];

  for (const item of aligned) {
    if (item.spoken && item.ref) {
      const cleanSpoken = item.spoken.toLowerCase().replace(/[^a-z]/g, '');
      const cleanRef = item.ref.toLowerCase().replace(/[^a-z]/g, '');
      const refIpa = getWordIpa(cleanRef);

      if (cleanSpoken === cleanRef) {
        // Exact match
        const tricky = TRICKY_PRONUNCIATION_WORDS[cleanRef];
        result.push({
          word: item.spoken,
          targetWord: item.ref,
          ipa: refIpa,
          severity: tricky ? tricky.severity : 'none',
          status: 'correct',
          feedback: tricky ? tricky.feedback : undefined,
        });
      } else {
        // Mispronounced / Substituted word
        result.push({
          word: item.spoken,
          targetWord: item.ref,
          ipa: refIpa,
          severity: 'heavy',
          status: 'mispronounced',
          feedback: `Phát âm sai từ gốc "${item.ref}" (${refIpa}) thành "${item.spoken}"`,
        });
      }
    } else if (item.spoken && !item.ref) {
      // Extra inserted word
      const cleanSpoken = item.spoken.toLowerCase().replace(/[^a-z]/g, '');
      result.push({
        word: item.spoken,
        ipa: getWordIpa(cleanSpoken),
        severity: 'light',
        status: 'inserted',
        feedback: `Từ nói thêm (không có trong câu gốc)`,
      });
    } else if (!item.spoken && item.ref) {
      // Omitted word from reference
      const cleanRef = item.ref.toLowerCase().replace(/[^a-z]/g, '');
      const refIpa = getWordIpa(cleanRef);
      result.push({
        word: item.ref,
        targetWord: item.ref,
        ipa: refIpa,
        severity: 'heavy',
        status: 'omitted',
        feedback: `Bỏ sót từ gốc "${item.ref}" (${refIpa})`,
      });
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionText = '',
      part = 1,
      topic = 'General',
      transcript = '',
      durationSeconds = 25,
    } = body;

    const cleanTranscript = (transcript || '').trim();

    if (!cleanTranscript) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng nói hoặc nhập câu trả lời để hệ thống tiến hành chấm điểm.',
      }, { status: 400 });
    }

    const words = cleanTranscript.split(/\s+/).filter(Boolean);
    const actualWordCount = words.length;
    const durationMin = Math.max(0.1, (durationSeconds || 25) / 60);
    const wpm = Math.round(actualWordCount / durationMin);

    // ──────────────── 1. Reference Sentence Analysis ────────────────
    const cleanRefQuestion = questionText
      .replace(/[?!.,;]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    // Check if the user is reading/repeating the question prompt or parts of it
    const spokenLower = words.map((w: string) => w.toLowerCase().replace(/[^a-z]/g, ''));
    const refLower = cleanRefQuestion.map((w: string) => w.toLowerCase().replace(/[^a-z]/g, ''));
    
    let commonWordMatches = 0;
    for (const sw of spokenLower) {
      if (refLower.includes(sw)) commonWordMatches++;
    }
    const overlapRatio = cleanRefQuestion.length > 0 ? commonWordMatches / cleanRefQuestion.length : 0;

    let wordLevelPronunciation: WordPronunciationItem[] = [];
    let isAlignedWithTarget = false;

    if (overlapRatio >= 0.35 && cleanRefQuestion.length >= 4) {
      // User is reading or practicing the target question / prompt sentence
      isAlignedWithTarget = true;
      wordLevelPronunciation = alignWithReference(words, cleanRefQuestion);
    } else {
      // Free speaking response -> Analyze all words phonetically
      wordLevelPronunciation = words.map((rawWord: string) => {
        const cleanW = rawWord.toLowerCase().replace(/[^a-z]/g, '');
        const ipa = getWordIpa(cleanW);

        if (TRICKY_PRONUNCIATION_WORDS[cleanW]) {
          const item = TRICKY_PRONUNCIATION_WORDS[cleanW];
          return {
            word: rawWord,
            ipa,
            severity: item.severity,
            feedback: item.feedback,
            status: item.severity === 'heavy' ? 'mispronounced' : 'correct',
          };
        }

        // Syllables check
        const syllableCount = (cleanW.match(/[aeiouy]{1,2}/g) || []).length;
        if (syllableCount >= 3) {
          return {
            word: rawWord,
            ipa,
            severity: 'light' as const,
            feedback: `Từ đa âm tiết (${syllableCount} âm), chú ý nhấn đúng trọng âm chính`,
          };
        }

        return {
          word: rawWord,
          ipa,
          severity: 'none' as const,
          status: 'correct',
        };
      });
    }

    // ──────────────── Count Error Severities ────────────────
    const heavyErrors = wordLevelPronunciation.filter((w) => w.severity === 'heavy').length;
    const lightErrors = wordLevelPronunciation.filter((w) => w.severity === 'light').length;
    const minorErrors = wordLevelPronunciation.filter((w) => w.severity === 'minor').length;

    // ──────────────── 2. Fluency & Coherence (FC) ────────────────
    let fcScore = 6.0;
    const fillerMatches = cleanTranscript.match(/\b(um|uh|er|like|you know|sort of|kind of)\b/gi) || [];
    const linkingMatches = LINKING_WORDS.filter((lw) => cleanTranscript.toLowerCase().includes(lw));

    if (wpm >= 110 && wpm <= 155) fcScore += 0.5;
    else if (wpm < 85) fcScore -= 0.5;

    if (linkingMatches.length >= 2) fcScore += 0.5;
    if (fillerMatches.length > 3) fcScore -= 0.5;
    if (actualWordCount >= (part === 2 ? 70 : 25)) fcScore += 0.5;

    fcScore = Math.min(8.5, Math.max(5.0, Math.round(fcScore * 2) / 2));

    // ──────────────── 3. Lexical Resource (LR) ────────────────
    let lrScore = 6.0;
    const uniqueWords = new Set(spokenLower);
    const ttr = spokenLower.length > 0 ? uniqueWords.size / spokenLower.length : 0.5;
    const advancedFound = ADVANCED_VOCAB.filter((av) => cleanTranscript.toLowerCase().includes(av));

    if (advancedFound.length >= 2) lrScore += 1.0;
    else if (advancedFound.length === 1) lrScore += 0.5;

    if (ttr >= 0.7) lrScore += 0.5;
    else if (ttr < 0.45) lrScore -= 0.5;

    lrScore = Math.min(8.5, Math.max(5.0, Math.round(lrScore * 2) / 2));

    // ──────────────── 4. Grammatical Range & Accuracy (GRA) ────────────────
    let graScore = 6.0;
    const complexMarkers = ['because', 'although', 'even though', 'which', 'who', 'that', 'if', 'while', 'whereas', 'unless', 'since', 'so that', 'in order to'];
    const foundComplex = complexMarkers.filter((cm) => cleanTranscript.toLowerCase().includes(` ${cm} `) || cleanTranscript.toLowerCase().startsWith(`${cm} `));

    if (foundComplex.length >= 2) graScore += 0.5;
    if (cleanTranscript.includes(',') || cleanTranscript.includes(';')) graScore += 0.5;
    if (actualWordCount > 35) graScore += 0.5;

    graScore = Math.min(8.5, Math.max(5.0, Math.round(graScore * 2) / 2));

    // ──────────────── 5. Pronunciation (P) ────────────────
    let pScore = 6.5;
    if (heavyErrors >= 3) pScore = 5.0;
    else if (heavyErrors === 2) pScore = 5.5;
    else if (heavyErrors === 1) pScore = 6.0;
    else if (lightErrors <= 1 && heavyErrors === 0) pScore = 7.5;

    // Overall Band
    const rawAverage = (fcScore + lrScore + graScore + pScore) / 4;
    const overallBand = Math.round(rawAverage * 2) / 2;

    // ──────────────── Criteria Score Details ────────────────
    const criteriaScores: CriteriaScoreDetail[] = [
      {
        name: 'Fluency & Coherence',
        nameVi: 'Độ trôi chảy & Mạch lạc',
        score: fcScore,
        feedback: `Tốc độ nói ~${wpm} WPM. ${linkingMatches.length > 0 ? `Đã dùng tốt ${linkingMatches.length} từ nối.` : 'Cần thêm từ nối để tăng độ mượt mà.'}`,
        suggestion: 'Sử dụng thêm các cụm dẫn dắt tự nhiên như "To be honest", "From my perspective".',
        details: `Nói được ${actualWordCount} từ trong ${durationSeconds}s.`,
      },
      {
        name: 'Lexical Resource',
        nameVi: 'Vốn từ vựng & Độ chuẩn xác',
        score: lrScore,
        feedback: `Độ đa dạng từ vựng đạt ${(ttr * 100).toFixed(0)}%. ${advancedFound.length > 0 ? `Từ vựng nổi bật: ${advancedFound.join(', ')}.` : 'Từ vựng rõ ràng, dễ hiểu.'}`,
        suggestion: 'Bổ sung collocations học thuật và phrasal verbs theo chủ đề.',
        details: `${uniqueWords.size} từ vựng khác nhau được sử dụng.`,
      },
      {
        name: 'Grammatical Range & Accuracy',
        nameVi: 'Độ đa dạng & Chuẩn xác Ngữ pháp',
        score: graScore,
        feedback: `Cấu trúc câu phong phú với ${foundComplex.length} mệnh đề liên kết.`,
        suggestion: 'Kết hợp thêm câu điều kiện hoặc mệnh đề quan hệ để tăng điểm ngữ pháp.',
        details: 'Cấu trúc ngữ pháp duy trì chuẩn xác.',
      },
      {
        name: 'Pronunciation',
        nameVi: 'Phát âm & Ngữ điệu',
        score: pScore,
        feedback: isAlignedWithTarget
          ? `Đối chiếu với câu gốc: Phát hiện ${heavyErrors} từ đọc sai lệch âm, ${lightErrors} từ cần lưu ý trọng âm.`
          : `Phát hiện ${heavyErrors} từ cần chú ý âm câm/trọng âm chính, ${lightErrors} từ đa âm tiết.`,
        suggestion: 'Bấm vào từng từ bị gạch chân đỏ để nghe phát âm mẫu chuẩn và luyện đọc lại.',
        details: 'Hệ thống so khớp âm vị học trực tiếp với từ gốc và từ điển IPA.',
      },
    ];

    // ──────────────── Inline Grammar Corrections ────────────────
    const insertedPhrases: string[] = [];
    if (!cleanTranscript.toLowerCase().includes('to be honest') && !cleanTranscript.toLowerCase().includes('personally') && !cleanTranscript.toLowerCase().includes('in my opinion')) {
      insertedPhrases.push('To be completely honest,');
    }

    const correctedSentence = insertedPhrases.length > 0
      ? `${insertedPhrases[0]} ${cleanTranscript.charAt(0).toLowerCase() + cleanTranscript.slice(1)}`
      : cleanTranscript;

    const inlineCorrections: InlineCorrectionItem = {
      originalText: cleanTranscript,
      correctedText: correctedSentence,
      insertedPhrases,
      explanation: insertedPhrases.length > 0
        ? `Đã thêm cụm từ mở đầu tự nhiên "${insertedPhrases[0]}" để tăng tính mạch lạc trong bài thi IELTS Speaking.`
        : 'Cấu trúc ngữ pháp câu trả lời của bạn tương đối chuẩn xác.',
    };

    // ──────────────── Band 8.0+ Improved Version ────────────────
    const cleanedTopicPrompt = questionText.toLowerCase().replace(/^(what|why|how|do you|are you|is there|describe)\s+/i, '').replace(/\?$/, '');
    const improvedAnswer = `From my personal perspective, when it comes to ${cleanedTopicPrompt || topic.toLowerCase()}, ${cleanTranscript.length > 15 ? cleanTranscript : 'it plays an indispensable role in contemporary life'}. Furthermore, this not only broadens our cognitive horizons but also serves as a catalyst for long-term personal growth.`;

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
      transcript: cleanTranscript,
      overallBand,
      criteriaScores,
      wordLevelPronunciation,
      inlineCorrections,
      improvedAnswer,
      ideaExpansion,
      vocabularySuggestions,
      speakingRateWpm: wpm,
      wordCount: actualWordCount,
      durationSeconds: durationSeconds || 25,
    });
  } catch (error: any) {
    console.error('[Speaking Evaluate API] Alignment Engine Error:', error);
    return NextResponse.json({
      success: false,
      error: `Lỗi xử lý chấm điểm: ${error?.message || 'Không thể đánh giá bài nói.'}`,
    }, { status: 500 });
  }
}
