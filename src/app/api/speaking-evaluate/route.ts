import { NextRequest, NextResponse } from 'next/server';
import { getWordIpa } from '@/lib/ipa-generator';
import { CriteriaScoreDetail, WordPronunciationItem, InlineCorrectionItem } from '@/lib/types';

export const maxDuration = 10;

// Tricky pronunciation words, silent letters & multi-syllabic stress patterns (180+ core IELTS words)
const TRICKY_PRONUNCIATION_WORDS: Record<string, { severity: 'minor' | 'light' | 'heavy'; feedback: string }> = {
  // Silent Letters & French/Classical Loanwords
  subtle: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /ˈsʌtl/' },
  debt: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /dɛt/' },
  doubt: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /daʊt/' },
  receipt: { severity: 'heavy', feedback: 'Âm "p" là âm câm: /rɪˈsiːt/' },
  island: { severity: 'heavy', feedback: 'Âm "s" là âm câm: /ˈaɪlənd/' },
  aisle: { severity: 'heavy', feedback: 'Âm "s" là âm câm: /aɪl/' },
  muscle: { severity: 'light', feedback: 'Âm "c" là âm câm: /ˈmʌsl/' },
  foreign: { severity: 'minor', feedback: 'Âm "g" là âm câm: /ˈfɒrɪn/' },
  vehicle: { severity: 'heavy', feedback: 'Âm "h" câm, trọng âm âm 1: /ˈviːɪkl/' },
  iron: { severity: 'light', feedback: 'Âm "r" câm (UK): /ˈaɪən/' },
  salmon: { severity: 'heavy', feedback: 'Âm "l" là âm câm: /ˈsæmən/' },
  climb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /klaɪm/' },
  thumb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /θʌm/' },
  plumber: { severity: 'heavy', feedback: 'Âm "b" là âm câm: /ˈplʌmər/' },
  comb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /kəʊm/' },
  bomb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /bɒm/' },
  tomb: { severity: 'heavy', feedback: 'Âm "b" câm, nguyên âm /uː/: /tuːm/' },
  womb: { severity: 'heavy', feedback: 'Âm "b" câm, nguyên âm /uː/: /wuːm/' },
  numb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /nʌm/' },
  crumb: { severity: 'heavy', feedback: 'Âm "b" cuối là âm câm: /krʌm/' },
  listen: { severity: 'light', feedback: 'Âm "t" là âm câm: /ˈlɪsn/' },
  castle: { severity: 'light', feedback: 'Âm "t" là âm câm: /ˈkɑːsl/' },
  fasten: { severity: 'light', feedback: 'Âm "t" là âm câm: /ˈfɑːsn/' },
  whistle: { severity: 'light', feedback: 'Âm "t" là âm câm: /ˈwɪsl/' },
  sword: { severity: 'heavy', feedback: 'Âm "w" là âm câm: /sɔːd/' },
  answer: { severity: 'light', feedback: 'Âm "w" là âm câm: /ˈɑːnsər/' },
  whole: { severity: 'light', feedback: 'Âm "w" câm, bắt đầu bằng /h/: /həʊl/' },
  half: { severity: 'light', feedback: 'Âm "l" là âm câm: /hɑːf/' },
  calm: { severity: 'light', feedback: 'Âm "l" là âm câm: /kɑːm/' },
  palm: { severity: 'light', feedback: 'Âm "l" là âm câm: /pɑːm/' },
  autumn: { severity: 'light', feedback: 'Âm "n" cuối là âm câm: /ˈɔːtəm/' },
  column: { severity: 'light', feedback: 'Âm "n" cuối là âm câm: /ˈkɒləm/' },
  damn: { severity: 'light', feedback: 'Âm "n" cuối là âm câm: /dæm/' },
  hymn: { severity: 'light', feedback: 'Âm "n" cuối là âm câm: /hɪm/' },
  ballet: { severity: 'heavy', feedback: 'Âm "t" cuối là câm: /ˈbæleɪ/' },
  debris: { severity: 'heavy', feedback: 'Âm "s" cuối là câm: /ˈdeɪbriː/' },
  bourgeoisie: { severity: 'heavy', feedback: 'Từ mượn tiếng Pháp: /ˌbʊəʒwɑːˈziː/' },
  chassis: { severity: 'heavy', feedback: 'Âm "s" cuối là câm: /ˈʃæsi/' },
  corps: { severity: 'heavy', feedback: 'Âm "p" và "s" đều câm: /kɔːr/' },
  rendezvous: { severity: 'heavy', feedback: 'Âm "z" và "s" đều câm: /ˈrɒndeɪvuː/' },
  faux: { severity: 'heavy', feedback: 'Âm "x" là âm câm: /fəʊ/' },
  psychology: { severity: 'heavy', feedback: 'Âm "p" đầu là âm câm: /saɪˈkɒlədʒi/' },
  psychiatrist: { severity: 'heavy', feedback: 'Âm "p" đầu là câm, trọng âm âm 2: /saɪˈkaɪətrɪst/' },
  pneumonia: { severity: 'heavy', feedback: 'Âm "p" đầu là âm câm: /njuːˈməʊniə/' },
  knee: { severity: 'light', feedback: 'Âm "k" đầu là âm câm: /niː/' },
  knife: { severity: 'light', feedback: 'Âm "k" đầu là âm câm: /naɪf/' },
  knight: { severity: 'light', feedback: 'Âm "k" đầu và "gh" đều câm: /naɪt/' },
  knit: { severity: 'light', feedback: 'Âm "k" đầu là âm câm: /nɪt/' },
  knowledge: { severity: 'light', feedback: 'Âm "k" câm, nguyên âm ngắn: /ˈnɒlɪdʒ/' },
  knock: { severity: 'light', feedback: 'Âm "k" đầu là âm câm: /nɒk/' },
  knot: { severity: 'light', feedback: 'Âm "k" đầu là âm câm: /nɒt/' },
  wrap: { severity: 'light', feedback: 'Âm "w" đầu là âm câm: /ræp/' },
  wrist: { severity: 'light', feedback: 'Âm "w" đầu là âm câm: /rɪst/' },
  write: { severity: 'light', feedback: 'Âm "w" đầu là âm câm: /raɪt/' },
  wrong: { severity: 'light', feedback: 'Âm "w" đầu là âm câm: /rɒŋ/' },
  yacht: { severity: 'heavy', feedback: 'Âm "ch" câm: /jɒt/' },
  quinoa: { severity: 'heavy', feedback: 'Phát âm là /ˈkiːnwɑː/, tránh đọc "kwi-no-a"' },
  croissant: { severity: 'heavy', feedback: 'Từ mượn tiếng Pháp: /ˈkrwʌsɒ̃/ hoặc /ˈkrwɑːsɒ̃/' },
  facade: { severity: 'heavy', feedback: 'Âm "c" phát âm là /s/: /fəˈsɑːd/' },
  niche: { severity: 'light', feedback: 'Phát âm /niːʃ/ hoặc /nɪtʃ/' },
  chic: { severity: 'heavy', feedback: 'Âm "ch" phát âm là /ʃ/: /ʃiːk/' },
  cliche: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm cuối: /ˈkliːʃeɪ/' },
  bureaucracy: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /bjʊəˈrɒkrəsi/' },
  regime: { severity: 'heavy', feedback: 'Âm "g" phát âm là /ʒ/: /reɪˈʒiːm/' },
  suite: { severity: 'heavy', feedback: 'Phát âm giống "sweet": /swiːt/' },
  monk: { severity: 'light', feedback: 'Nguyên âm ngắn /ʌ/: /mʌŋk/' },
  gauge: { severity: 'heavy', feedback: 'Phát âm là /ɡeɪdʒ/, không phải "gowj"' },
  choir: { severity: 'heavy', feedback: 'Bắt đầu bằng /kw/: /ˈkwaɪər/' },
  asthma: { severity: 'heavy', feedback: 'Âm "th" là âm câm: /ˈæsmə/' },
  isthmus: { severity: 'heavy', feedback: 'Âm "th" là âm câm: /ˈɪsməs/' },
  bury: { severity: 'heavy', feedback: 'Phát âm giống "berry": /ˈbɛri/' },
  busy: { severity: 'light', feedback: 'Phát âm là /ˈbɪzi/' },
  business: { severity: 'light', feedback: 'Đọc 2 âm tiết /ˈbɪznɪs/' },
  colonel: { severity: 'heavy', feedback: 'Phát âm giống "kernel": /ˈkɜːnl/' },
  draught: { severity: 'heavy', feedback: 'Phát âm giống "draft": /drɑːft/' },
  lieutenant: { severity: 'heavy', feedback: 'Phát âm /lɛfˈtɛnənt/ (UK) hoặc /luːˈtɛnənt/ (US)' },
  hyperbole: { severity: 'heavy', feedback: 'Đọc 4 âm tiết, trọng âm âm 2: /haɪˈpɜːbəli/' },
  epitome: { severity: 'heavy', feedback: 'Đọc 4 âm tiết, trọng âm âm 2: /ɪˈpɪtəmi/' },
  genre: { severity: 'heavy', feedback: 'Bắt đầu bằng âm /ʒ/: /ˈʒɒnrə/' },
  lingerie: { severity: 'heavy', feedback: 'Từ mượn tiếng Pháp: /ˈlɒnʒəri/' },
  hierarchy: { severity: 'heavy', feedback: 'Phát âm /ˈhaɪərɑːki/, âm "ch" là /k/' },
  mischievous: { severity: 'heavy', feedback: 'Trọng âm âm 1, 3 âm tiết: /ˈmɪstʃɪvəs/' },
  chaos: { severity: 'heavy', feedback: 'Bắt đầu bằng âm /k/: /ˈkeɪɒs/' },

  // Stress Shift & Tricky Vowels in IELTS
  cuisine: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm tiết thứ 2: /kwɪˈziːn/' },
  comfortable: { severity: 'light', feedback: 'Thường đọc 3 âm tiết /ˈkʌmftəbl/, nuốt âm "or"' },
  comfort: { severity: 'light', feedback: 'Trọng âm rơi vào âm tiết đầu: /ˈkʌmfət/' },
  vegetable: { severity: 'light', feedback: 'Đọc 3 âm tiết /ˈvɛdʒtəbl/, tránh đọc 4 âm' },
  chocolate: { severity: 'light', feedback: 'Đọc 2 âm tiết /ˈtʃɒklət/, tránh đọc 3 âm' },
  camera: { severity: 'minor', feedback: 'Đọc 2 hoặc 3 âm tiết gọn: /ˈkæmrə/ hoặc /ˈkæmərə/' },
  restaurant: { severity: 'light', feedback: 'Đọc 2 hoặc 3 âm tiết /ˈrɛstrɒnt/, nuốt âm giữa' },
  temperature: { severity: 'light', feedback: 'Đọc 3 hoặc 4 âm tiết /ˈtɛmprətʃər/' },
  average: { severity: 'minor', feedback: 'Đọc 2 âm tiết /ˈævərɪdʒ/ hoặc /ˈævrɪdʒ/' },
  interesting: { severity: 'light', feedback: 'Trọng âm âm đầu /ˈɪntrəstɪŋ/, nuốt âm "e"' },
  different: { severity: 'minor', feedback: 'Đọc 2 âm tiết /ˈdɪfrənt/, tránh kéo dài "di-fe-rent"' },
  history: { severity: 'minor', feedback: 'Đọc 2 âm tiết /ˈhɪstri/' },
  memory: { severity: 'minor', feedback: 'Đọc 2 hoặc 3 âm tiết /ˈmɛməri/' },
  every: { severity: 'minor', feedback: 'Đọc 2 âm tiết /ˈɛvri/' },
  family: { severity: 'minor', feedback: 'Đọc 2 hoặc 3 âm tiết /ˈfæmɪli/' },
  beverage: { severity: 'light', feedback: 'Đọc 3 âm tiết /ˈbɛvərɪdʒ/, chú ý âm đuôi /dʒ/' },
  favorite: { severity: 'minor', feedback: 'Trọng âm rơi vào âm tiết đầu: /ˈfeɪvərɪt/' },
  delicious: { severity: 'minor', feedback: 'Phát âm /dɪˈlɪʃəs/, chú ý âm /ʃ/' },
  culture: { severity: 'minor', feedback: 'Phát âm /ˈkʌltʃər/, chú ý âm /tʃ/' },
  schedule: { severity: 'light', feedback: 'Phát âm /ˈʃɛdjuːl/ (UK) hoặc /ˈskɛdʒuːl/ (US)' },
  specific: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /spəˈsɪfɪk/' },
  entrepreneur: { severity: 'heavy', feedback: 'Từ mượn tiếng Pháp, trọng âm âm cuối: /ˌɒntrəprəˈnɜːr/' },
  variety: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /vəˈraɪəti/' },
  various: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈveəriəs/' },
  vary: { severity: 'minor', feedback: 'Phát âm là /ˈveəri/' },
  economy: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪˈkɒnəmi/' },
  economic: { severity: 'light', feedback: 'Trọng âm chuyển sang âm 3: /ˌiːkəˈnɒmɪk/' },
  economical: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌiːkəˈnɒmɪkl/' },
  economist: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪˈkɒnəmɪst/' },
  photographer: { severity: 'heavy', feedback: 'Trọng âm chuyển sang âm 2: /fəˈtɒɡrəfər/' },
  photography: { severity: 'heavy', feedback: 'Trọng âm chuyển sang âm 2: /fəˈtɒɡrəfi/' },
  photographic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌfəʊtəˈɡræfɪk/' },
  development: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /dɪˈvɛləpmənt/' },
  environmental: { severity: 'light', feedback: 'Trọng âm chính ở âm 4: /ɪnˌvaɪrənˈmɛntl/' },
  environment: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪnˈvaɪrənmənt/' },
  technology: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /tɛkˈnɒlədʒi/' },
  technological: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌtɛknəˈlɒdʒɪkl/' },
  opportunity: { severity: 'light', feedback: 'Trọng âm chính ở /tjuː/: /ˌɒpəˈtjuːnɪti/' },
  architecture: { severity: 'heavy', feedback: 'Âm "ch" phát âm là /k/: /ˈɑːkɪtɛktʃər/' },
  architect: { severity: 'heavy', feedback: 'Âm "ch" là /k/, trọng âm âm 1: /ˈɑːkɪtɛkt/' },
  architectural: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌɑːkɪˈtɛktʃərəl/' },
  alarm: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2 /əˈlɑːm/, nguyên âm dài /ɑː/' },
  repair: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2 /rɪˈpeər/, nguyên âm đôi /eə/' },
  stressed: { severity: 'light', feedback: 'Chú ý chùm phụ âm /str/ và âm đuôi /t/: /strɛst/' },
  food: { severity: 'minor', feedback: 'Nguyên âm dài /uː/ và bật rõ âm đuôi /d/: /fuːd/' },
  colleague: { severity: 'light', feedback: 'Trọng âm âm 1, đuôi /ɡ/: /ˈkɒliːɡ/' },
  colleagues: { severity: 'light', feedback: 'Phát âm là /ˈkɒliːɡz/' },
  clothes: { severity: 'light', feedback: 'Phát âm /kləʊðz/ hoặc /kləʊz/, cẩn thận âm đuôi' },
  breath: { severity: 'light', feedback: 'Danh từ: nguyên âm ngắn /ɛ/, âm đuôi vô thanh /θ/: /brɛθ/' },
  breathe: { severity: 'light', feedback: 'Động từ: nguyên âm dài /iː/, âm đuôi hữu thanh /ð/: /briːð/' },
  cloth: { severity: 'light', feedback: 'Danh từ: nguyên âm /ɒ/, âm đuôi /θ/: /klɒθ/' },
  clothe: { severity: 'light', feedback: 'Động từ: nguyên âm /əʊ/, âm đuôi /ð/: /kləʊð/' },
  southern: { severity: 'light', feedback: 'Nguyên âm ngắn /ʌ/: /ˈsʌðən/' },
  northern: { severity: 'light', feedback: 'Nguyên âm dài /ɔː/: /ˈnɔːðən/' },
  athlete: { severity: 'light', feedback: 'Đọc 2 âm tiết /ˈæθliːt/, tránh đọc "ath-e-lete"' },
  athletic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /æθˈlɛtɪk/' },
  mischief: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 1: /ˈmɪstʃɪf/' },
  prejudice: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 1: /ˈprɛdʒʊdɪs/' },
  catastrophe: { severity: 'heavy', feedback: 'Đọc 4 âm tiết, trọng âm âm 2: /kəˈtæstrəfi/' },
  recipe: { severity: 'heavy', feedback: 'Đọc 3 âm tiết, trọng âm âm 1: /ˈrɛsɪpi/' },
  anemone: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /əˈnɛməni/' },
  synonym: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈsɪnənɪm/' },
  antonym: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈæntənɪm/' },
  anecdote: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈænɪkdəʊt/' },
  irony: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈaɪrəni/' },
  ironic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /aɪˈrɒnɪk/' },
  phenomenon: { severity: 'heavy', feedback: 'Số ít, trọng âm âm 2: /fəˈnɒmɪnən/' },
  phenomena: { severity: 'heavy', feedback: 'Số nhiều, trọng âm âm 2: /fəˈnɒmɪnə/' },
  criterion: { severity: 'light', feedback: 'Số ít, trọng âm âm 2: /kraɪˈtɪəriən/' },
  criteria: { severity: 'light', feedback: 'Số nhiều, trọng âm âm 2: /kraɪˈtɪəriə/' },
  analysis: { severity: 'heavy', feedback: 'Danh từ số ít, trọng âm âm 2: /əˈnæləsɪs/' },
  analyses: { severity: 'heavy', feedback: 'Danh từ số nhiều: /əˈnæləsiːz/' },
  analyze: { severity: 'light', feedback: 'Động từ, trọng âm rơi vào âm 1: /ˈænəlaɪz/' },
  hypothesis: { severity: 'heavy', feedback: 'Số ít, trọng âm rơi vào âm 2: /haɪˈpɒθɪsɪs/' },
  hypotheses: { severity: 'heavy', feedback: 'Số nhiều: /haɪˈpɒθɪsiːz/' },
  oasis: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /əʊˈeɪsɪs/' },
  crisis: { severity: 'light', feedback: 'Số ít: /ˈkraɪsɪs/' },
  crises: { severity: 'light', feedback: 'Số nhiều: /ˈkraɪsiːz/' },

  // Key IELTS Academic Vocabulary
  sustainable: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /səˈsteɪnəbl/' },
  sustainability: { severity: 'light', feedback: 'Trọng âm chính ở /bɪl/: /səˌsteɪnəˈbɪlɪti/' },
  biodiversity: { severity: 'light', feedback: 'Trọng âm chính rơi vào /vɜː/: /ˌbaɪəʊdaɪˈvɜːsɪti/' },
  indispensable: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌɪndɪˈspɛnsəbl/' },
  revolutionize: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˌrɛvəˈluːʃənaɪz/' },
  streamline: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈstriːmlaɪn/' },
  equilibrium: { severity: 'heavy', feedback: 'Trọng âm chính ở âm 3 /lɪb/: /ˌiːkwɪˈlɪbriəm/' },
  proliferation: { severity: 'heavy', feedback: 'Trọng âm chính ở /reɪ/: /prəˌlɪfəˈreɪʃn/' },
  profound: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /prəˈfaʊnd/' },
  cognitive: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈkɒɡnɪtɪv/' },
  bandwidth: { severity: 'minor', feedback: 'Phát âm là /ˈbændwɪdθ/' },
  cosmopolitan: { severity: 'light', feedback: 'Trọng âm chính ở âm 3: /ˌkɒzməˈpɒlɪtən/' },
  tranquil: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈtræŋkwɪl/' },
  antidote: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈæntɪdəʊt/' },
  ethnocentrism: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 3: /ˌɛθnəʊˈsɛntrɪzəm/' },
  synthesize: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈsɪnθɪsaɪz/' },
  gratifying: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈɡrætɪfaɪɪŋ/' },
  tactile: { severity: 'minor', feedback: 'Phát âm /ˈtæktaɪl/ hoặc /ˈtæktl/' },
  geopolitical: { severity: 'light', feedback: 'Trọng âm chính ở /lɪt/: /ˌdʒiːəʊpəˈlɪtɪkl/' },
  contemporary: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /kənˈtɛmpərəri/' },
  procrastination: { severity: 'light', feedback: 'Trọng âm chính ở /neɪ/: /prəˌkræstɪˈneɪʃn/' },
  transformative: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /trænsˈfɔːmətɪv/' },
  obsolescence: { severity: 'heavy', feedback: 'Trọng âm chính ở /sɛns/: /ˌɒbsəˈlɛsns/' },
  penchant: { severity: 'heavy', feedback: 'Phát âm /ˈpɒ̃ʃɒ̃/ hoặc /ˈpɛntʃənt/' },
  segregate: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈsɛɡrɪɡeɪt/' },
  hazardous: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈhæzədəs/' },
  culprit: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈkʌlprɪt/' },
  culprits: { severity: 'minor', feedback: 'Phát âm /ˈkʌlprɪts/' },
  curtail: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /kɜːˈteɪl/' },
  curtailed: { severity: 'light', feedback: 'Phát âm /kɜːˈteɪld/' },
  multifaceted: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌmʌltɪˈfæsɪtɪd/' },
  decarbonize: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /diːˈkɑːbənaɪz/' },
  exorbitant: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɪɡˈzɔːbɪtənt/' },
  anomaly: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /əˈnɒməli/' },
  anomalies: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /əˈnɒməlɪz/' },
  gastronomy: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɡæˈstrɒnəmi/' },
  encapsulate: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪnˈkæpsjuleɪt/' },
  encapsulates: { severity: 'light', feedback: 'Phát âm /ɪnˈkæpsjuleɪts/' },
  ingenuity: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 3: /ˌɪndʒɪˈnjuːɪti/' },
  homogenization: { severity: 'heavy', feedback: 'Trọng âm chính ở /zeɪ/: /həˌmɒdʒənaɪˈzeɪʃn/' },
  artisanal: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɑːˈtɪzənl/' },
  significant: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /sɪɡˈnɪfɪkənt/' },
  perspective: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /pəˈspɛktɪv/' },
  convenient: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /kənˈviːniənt/' },
  essential: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /ɪˈsɛnʃl/' },
  fundamental: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌfʌndəˈmɛntl/' },
  crucial: { severity: 'minor', feedback: 'Phát âm /ˈkruːʃl/, âm "c" là /ʃ/' },
  fascinating: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈfæsɪneɪtɪŋ/' },
  exceptionally: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪkˈsɛpʃənəli/' },
  worthwhile: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 2: /ˌwɜːθˈwaɪl/' },
  comprehensive: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌkɒmprɪˈhɛnsɪv/' },
  infrastructure: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈɪnfrəstrʌktʃər/' },
  deteriorate: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /dɪˈtɪəriəreɪt/' },
  exacerbate: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɪɡˈzæsəbeɪt/' },
  prioritize: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /praɪˈɒrɪtaɪz/' },
  collaborate: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /kəˈlæbəreɪt/' },
  fluctuate: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈflʌktʃueɪt/' },
  ubiquitous: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /juːˈbɪkwɪtəs/' },
  unprecedented: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ʌnˈprɛsɪdɛntɪd/' },
  pragmatic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /præɡˈmætɪk/' },
  resilient: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /rɪˈzɪliənt/' },
  vulnerable: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 1: /ˈvʌlnərəbl/' },
  lucrative: { severity: 'light', feedback: 'Trọng âm rơi vào âm 1: /ˈluːkrətɪv/' },
  inevitable: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɪnˈɛvɪtəbl/' },
  meticulous: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /mɪˈtɪkjʊləs/' },
  enthusiastic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 4: /ɪnˌθjuːziˈæstɪk/' },
  enthusiasm: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪnˈθjuːziæzəm/' },
  academic: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌækəˈdɛmɪk/' },
  academy: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /əˈkædəmi/' },
  competence: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈkɒmpɪtəns/' },
  competent: { severity: 'minor', feedback: 'Trọng âm rơi vào âm 1: /ˈkɒmpɪtənt/' },
  initiative: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 2: /ɪˈnɪʃətɪv/' },
  initiate: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /ɪˈnɪʃieɪt/' },
  prevalent: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 1: /ˈprɛvələnt/' },
  prevalence: { severity: 'heavy', feedback: 'Trọng âm rơi vào âm 1: /ˈprɛvələns/' },
  substantial: { severity: 'light', feedback: 'Trọng âm rơi vào âm 2: /səbˈstænʃl/' },
  substantially: { severity: 'light', feedback: 'Phát âm là /səbˈstænʃəli/' },
  deterioration: { severity: 'heavy', feedback: 'Trọng âm chính ở /reɪ/: /dɪˌtɪəriəˈreɪʃn/' },
  globalization: { severity: 'light', feedback: 'Trọng âm chính ở /zeɪ/: /ˌɡləʊbəlaɪˈzeɪʃn/' },
  urbanization: { severity: 'light', feedback: 'Trọng âm chính ở /zeɪ/: /ˌɜːbənaɪˈzeɪʃn/' },
  digitization: { severity: 'light', feedback: 'Trọng âm chính ở /zeɪ/: /ˌdɪdʒɪtaɪˈzeɪʃn/' },
  commercialization: { severity: 'light', feedback: 'Trọng âm chính ở /zeɪ/: /kəˌmɜːʃəlaɪˈzeɪʃn/' },
  individualism: { severity: 'light', feedback: 'Trọng âm rơi vào âm 3: /ˌɪndɪˈvɪdʒuəlɪzəm/' },
  accessibility: { severity: 'light', feedback: 'Trọng âm chính ở /bɪl/: /əkˌsɛsəˈbɪlɪti/' },
  reliability: { severity: 'light', feedback: 'Trọng âm chính ở /bɪl/: /rɪˌlaɪəˈbɪlɪti/' },
  versatility: { severity: 'light', feedback: 'Trọng âm chính ở /tɪl/: /ˌvɜːsəˈtɪlɪti/' },
  authenticity: { severity: 'heavy', feedback: 'Trọng âm chính ở /tɪs/: /ˌɔːθɛnˈtɪsɪti/' },
  spontaneity: { severity: 'heavy', feedback: 'Trọng âm chính ở /neɪ/: /ˌspɒntəˈneɪɪti/' },
  simultaneity: { severity: 'heavy', feedback: 'Trọng âm chính ở /neɪ/: /ˌsɪmʊltəˈneɪɪti/' },
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

// Topic-based idea expansion & vocabulary suggestions
function getTopicSuggestions(topic: string, questionText: string) {
  const combined = `${topic} ${questionText}`.toLowerCase();

  if (/\b(tech|technology|computer|phone|smartphone|internet|ai|robot|digital|app|software|online|device|social media|cyber|virtual)\b/.test(combined)) {
    return {
      category: 'Công nghệ & Đời sống số (Technology & AI)',
      ideas: [
        'Đánh giá tác động hai chiều (Dual impact): Nêu cả tiện ích vượt trội (tiết kiệm thời gian, kết nối toàn cầu) và mặt trái (giảm tương tác trực tiếp, phụ thuộc màn hình).',
        'Dẫn chứng công nghệ cụ thể (Specific Tech Trend): Đề cập đến AI (trí tuệ nhân tạo), tự động hóa hoặc điện toán đám mây trong học tập và công việc hàng ngày.',
        'Dự báo tương lai (Future Outlook): Bày tỏ quan điểm về xu hướng số hóa trong 5-10 năm tới và cách con người cần chủ động thích ứng.',
      ],
      vocabularies: [
        'technological advancement (tiến bộ vượt bậc về công nghệ)',
        'streamline daily workflow (tối ưu hóa quy trình làm việc)',
        'digital transformation (chuyển đổi số toàn diện)',
        'double-edged sword (con dao hai lưỡi - vừa lợi vừa hại)',
        'algorithm-driven platform (nền tảng vận hành bởi thuật toán)',
      ],
    };
  }

  if (/\b(work|job|career|profession|office|company|colleague|colleagues|salary|employment|business|workplace|boss|promotion|occupation|freelance)\b/.test(combined)) {
    return {
      category: 'Công việc & Sự nghiệp (Work & Career)',
      ideas: [
        'Cân bằng công việc & cuộc sống (Work-life balance): Phân tích tầm quan trọng của việc tái tạo năng lượng để duy trì năng suất lao động bền vững.',
        'Kỹ năng mềm & Thích ứng nghề nghiệp: Nhấn mạnh kỹ năng giao tiếp, giải quyết vấn đề và thích nghi trong môi trường làm việc biến động.',
        'Động lực & Thăng tiến (Career Progression): Chia sẻ mục tiêu nghề nghiệp dài hạn và cơ hội học hỏi từ những người đi trước giàu kinh nghiệm.',
      ],
      vocabularies: [
        'climb the corporate ladder (thăng tiến từng bước trong sự nghiệp)',
        'work-life equilibrium (sự cân bằng giữa công việc và đời sống)',
        'high-pressure environment (môi trường làm việc áp lực cao)',
        'lucrative career path (con đường sự nghiệp đem lại thu nhập tốt)',
        'foster teamwork and collaboration (thúc đẩy tinh thần làm việc nhóm)',
      ],
    };
  }

  if (/\b(education|study|school|university|college|student|students|teacher|teachers|course|learn|academic|subject|major|exam|degree|lecture|curriculum)\b/.test(combined)) {
    return {
      category: 'Giáo dục & Học tập (Education & Study)',
      ideas: [
        'Phương pháp học tập chủ động (Active Learning): So sánh giữa việc học vẹt truyền thống và học qua dự án thực tế kết hợp tư duy phản biện.',
        'Tác động của công nghệ vào giáo dục: Phân tích các khóa học trực tuyến (E-learning) và kho tài nguyên số mở rộng cơ hội học tập bình đẳng.',
        'Phát triển toàn diện (Holistic Development): Nhấn mạnh trường học không chỉ truyền thụ kiến thức mà còn rèn luyện nhân cách và kỹ năng sống.',
      ],
      vocabularies: [
        'pursue higher education (theo đuổi bậc học chuyên sâu hơn)',
        'nurture critical thinking skills (nuôi dưỡng tư duy phản biện)',
        'well-rounded curriculum (chương trình giảng dạy toàn diện)',
        'academic excellence (thành tích học thuật xuất sắc)',
        'autonomous learning (khả năng tự học độc lập)',
      ],
    };
  }

  if (/\b(environment|nature|pollution|climate|weather|green|animal|animals|plant|plants|recycle|sustainable|eco|carbon|warming|planet|waste|forest)\b/.test(combined)) {
    return {
      category: 'Môi trường & Thiên nhiên (Environment & Nature)',
      ideas: [
        'Trách nhiệm cá nhân vs Chính sách vĩ mô: Phân tích hành động nhỏ của người dân (phân loại rác, tiết kiệm điện) song hành cùng luật bảo vệ môi trường.',
        'Chuyển đổi năng lượng xanh: Đề xuất thay thế nhiên liệu hóa thạch bằng năng lượng tái tạo (mặt trời, gió) để giảm thiểu biến đổi khí hậu.',
        'Bảo tồn đa dạng sinh học: Nhấn mạnh sự cần thiết của việc bảo vệ môi trường sống tự nhiên cho các loài động thực vật quý hiếm.',
      ],
      vocabularies: [
        'carbon footprint reduction (giảm thiểu dấu chân carbon)',
        'sustainable practices (các thói quen thực hành bền vững)',
        'alleviate environmental degradation (giảm thiểu suy thoái môi trường)',
        'renewable energy sources (các nguồn năng lượng tái tạo)',
        'biodiversity preservation (bảo tồn đa dạng sinh học)',
      ],
    };
  }

  if (/\b(travel|trip|tourism|tourist|tourists|holiday|vacation|country|city|cities|place|visit|destination|journey|flight|hotel|explore|sightseeing)\b/.test(combined)) {
    return {
      category: 'Du lịch & Khám phá (Travel & Tourism)',
      ideas: [
        'Mở rộng nhân sinh quan (Broaden Horizons): Giải thích việc đi du lịch giúp trải nghiệm phong tục tập quán mới và xóa bỏ định kiến văn hóa.',
        'Du lịch sinh thái có trách nhiệm (Eco-tourism): Nhắc đến xu hướng du lịch tôn trọng môi trường địa phương và hỗ trợ kinh tế cộng đồng bản địa.',
        'Trải nghiệm cá nhân sâu sắc: Kể lại một kỷ niệm ấn tượng về ẩm thực, cảnh quan thiên nhiên hoặc lòng hiếu khách của người dân địa phương.',
      ],
      vocabularies: [
        'broaden one\'s geographical and cultural horizons (mở rộng hiểu biết văn hóa và địa lý)',
        'off the beaten track (những địa điểm hoang sơ, ít du khách)',
        'immerse oneself in the local culture (hòa mình trọn vẹn vào văn hóa bản xứ)',
        'breathtaking landscape (cảnh quan thiên nhiên ngoạn mục)',
        'hospitality of local residents (sự nồng hậu của người dân địa phương)',
      ],
    };
  }

  if (/\b(family|friend|friends|relationship|relationships|parent|parents|child|children|relative|neighbor|people|generation|bond|mother|father|sibling)\b/.test(combined)) {
    return {
      category: 'Gia đình & Mối quan hệ (Family & Friends)',
      ideas: [
        'Sự gắn kết & Kỷ niệm ấm áp (Family Bonding): Nhấn mạnh tầm quan trọng của các bữa cơm gia đình hoặc buổi gặp gỡ cuối tuần trong việc thắt chặt tình thân.',
        'Thu hẹp khoảng cách thế hệ (Generation Gap): Phân tích cách lắng nghe và tôn trọng sự khác biệt giữa các thế hệ trong gia đình.',
        'Chỗ dựa tinh thần (Emotional Anchor): Khẳng định gia đình và bạn bè thân thiết là nguồn động viên lớn nhất mỗi khi gặp khó khăn, thử thách.',
      ],
      vocabularies: [
        'tight-knit family bond (mối quan hệ gia đình gắn bó bền chặt)',
        'bridge the generation gap (thu hẹp khoảng cách thế hệ)',
        'reliable support system (hệ thống hỗ trợ / chỗ dựa đáng tin cậy)',
        'cherish memorable moments (trân trọng những khoảnh khắc đáng nhớ)',
        'unconditional love and guidance (tình yêu thương và sự dìu dắt vô điều kiện)',
      ],
    };
  }

  if (/\b(health|fitness|sport|sports|exercise|diet|food|cooking|habit|sleep|mental|lifestyle|wellness|gym|running|nutrition|stress)\b/.test(combined)) {
    return {
      category: 'Sức khỏe & Lối sống (Health & Lifestyle)',
      ideas: [
        'Sức khỏe thể chất song hành cùng tinh thần: Nhấn mạnh việc tập thể dục giúp giải phóng endorphin, giảm căng thẳng và nâng cao sự tỉnh táo.',
        'Chế độ dinh dưỡng cân bằng: Khuyên duy trì chế độ ăn giàu rau xanh, hạn chế đồ ăn nhanh chế biến sẵn để phòng ngừa bệnh mãn tính.',
        'Xây dựng thói quen kiên trì: Phân tích tầm quan trọng của việc duy trì thời gian biểu ngủ đủ giấc và tập luyện đều đặn mỗi ngày.',
      ],
      vocabularies: [
        'maintain physical and psychological well-being (duy trì sức khỏe thể chất và tinh thần)',
        'nutritious and balanced diet (chế độ ăn uống dinh dưỡng và cân bằng)',
        'sedentary lifestyle (lối sống thụ động, ngồi nhiều)',
        'boost the immune system (tăng cường hệ thống miễn dịch)',
        'relieve chronic stress (giải tỏa căng thẳng kéo dài)',
      ],
    };
  }

  if (/\b(art|music|culture|movie|movies|film|book|books|reading|entertainment|museum|festival|tradition|hobby|history|heritage|song)\b/.test(combined)) {
    return {
      category: 'Nghệ thuật, Âm nhạc & Văn hóa (Art & Culture)',
      ideas: [
        'Giá trị tinh thần & Cảm xúc: Mô tả âm nhạc/nghệ thuật như một liệu pháp tinh thần giúp thư giãn tâm trí và nuôi dưỡng cảm xúc tích cực.',
        'Bảo tồn di sản văn hóa truyền thống: Nhấn mạnh thế hệ trẻ cần tiếp nối và phát huy các lễ hội, phong tục đặc sắc của dân tộc.',
        'Giao lưu văn hóa toàn cầu: Phân tích cách phim ảnh, âm nhạc và văn học giúp kết nối các nền văn hóa đa dạng trên khắp thế giới.',
      ],
      vocabularies: [
        'cultural heritage preservation (bảo tồn di sản văn hóa)',
        'a therapeutic form of escapism (phương pháp giải trí chữa lành tâm hồn)',
        'evoke deep emotions (gợi lên những cảm xúc sâu lắng)',
        'artistic expression (sự biểu đạt mang tính nghệ thuật)',
        'cross-cultural understanding (sự thấu hiểu liên văn hóa)',
      ],
    };
  }

  // Default General Category
  return {
    category: 'Chủ đề Tổng quát (General Topic)',
    ideas: [
      `Mở rộng góc nhìn cá nhân: Nêu rõ cảm xúc hoặc kỷ niệm đầu tiên liên quan đến chủ đề (${topic}).`,
      'Đưa ra ví dụ thực tế (Real-world example): Dẫn chứng 1 tình huống cụ thể trong đời sống hoặc công việc để câu trả lời thuyết phục hơn.',
      'Phản biện / So sánh tương phản: So sánh giữa quá khứ và hiện tại, hoặc giữa lợi ích tức thời và hệ quả lâu dài.',
    ],
    vocabularies: [
      'play an indispensable role (đóng vai trò không thể thiếu)',
      'a catalyst for personal growth (chất xúc tác cho sự phát triển bản thân)',
      'cognitive bandwidth (dung lượng tâm trí / sự tập trung)',
      'strike a balance between (đạt được sự cân bằng giữa)',
      'without a shadow of a doubt (chắc chắn, không còn nghi ngờ gì)',
    ],
  };
}

// Basic grammar & orthography normalizer for local sentence improvement
function sanitizeAndRefineSentence(text: string): string {
  let s = text.trim();
  if (!s) return s;

  // 1. Fix capitalization of isolated 'i' and common contractions
  s = s.replace(/\bi\b/g, 'I');
  s = s.replace(/\bi'm\b/gi, "I'm");
  s = s.replace(/\bi've\b/gi, "I've");
  s = s.replace(/\bi'll\b/gi, "I'll");
  s = s.replace(/\bi'd\b/gi, "I'd");

  // 2. Fix missing apostrophes in common negative contractions
  s = s.replace(/\bdont\b/gi, "don't");
  s = s.replace(/\bdoesnt\b/gi, "doesn't");
  s = s.replace(/\bcant\b/gi, "can't");
  s = s.replace(/\bwont\b/gi, "won't");
  s = s.replace(/\bisnt\b/gi, "isn't");
  s = s.replace(/\barent\b/gi, "aren't");
  s = s.replace(/\bwasnt\b/gi, "wasn't");
  s = s.replace(/\bwerent\b/gi, "weren't");
  s = s.replace(/\bhavent\b/gi, "haven't");
  s = s.replace(/\bhasnt\b/gi, "hasn't");

  // 3. Fix simple article errors: 'a' before common vowel words
  s = s.replace(/\ba\s+(apple|orange|egg|idea|opportunity|issue|event|environment|important|interesting|essential|unbelievable|unusual)\b/gi, 'an $1');

  // 4. Clean spacing & punctuation
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/\s+([.,!?;:])/g, '$1');

  // 5. Capitalize first letter
  s = s.charAt(0).toUpperCase() + s.slice(1);

  return s;
}

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
        const dist = levenshteinDistance(cleanSpoken, cleanRef);
        const isMinorDiff = dist <= 2;
        result.push({
          word: item.spoken,
          targetWord: item.ref,
          ipa: refIpa,
          severity: isMinorDiff ? 'light' : 'heavy',
          status: 'mispronounced',
          feedback: isMinorDiff
            ? `Phát âm lệch nhẹ so với từ gốc "${item.ref}" (${refIpa}) thành "${item.spoken}"`
            : `Phát âm sai từ gốc "${item.ref}" (${refIpa}) thành "${item.spoken}"`,
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
    const spokenLower = words.map((w: string) => w.toLowerCase().replace(/[^a-z]/g, ''));
    const actualWordCount = words.length;
    const durationMin = Math.max(0.1, (durationSeconds || 25) / 60);
    const wpm = Math.round(actualWordCount / durationMin);

    // ──────────────── 1. Reference Sentence Analysis & Alignment ────────────────
    const cleanRefQuestion = questionText
      .replace(/&/g, ' and ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((w: string) => w.trim())
      .filter(Boolean);

    let wordLevelPronunciation: WordPronunciationItem[] = [];
    let isAlignedWithTarget = false;

    if (cleanRefQuestion.length >= 2) {
      // Compare spoken transcript against target reference question / sentence
      isAlignedWithTarget = true;
      wordLevelPronunciation = alignWithReference(words, cleanRefQuestion);
    } else {
      // Standalone free speaking without reference sentence
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

        return {
          word: rawWord,
          ipa,
          severity: 'none' as const,
          status: 'correct',
        };
      });
    }

    // ──────────────── 1. Pronunciation (P) Evaluation ────────────────
    const heavyErrors = wordLevelPronunciation.filter((w) => w.severity === 'heavy').length;
    const lightErrors = wordLevelPronunciation.filter((w) => w.severity === 'light').length;
    const minorErrors = wordLevelPronunciation.filter((w) => w.severity === 'minor').length;
    const correctWords = wordLevelPronunciation.filter((w) => w.status === 'correct').length;
    const totalAssessedWords = Math.max(1, wordLevelPronunciation.length);

    let pScore = 6.0;
    const refCount = cleanRefQuestion.length;
    const matchRatio = refCount > 0 ? correctWords / refCount : 0;
    const severeCount = wordLevelPronunciation.filter(
      (w) => w.status === 'omitted' || (w.status === 'mispronounced' && w.severity === 'heavy')
    ).length;
    const severeRatio = refCount > 0 ? severeCount / refCount : 0;

    if (actualWordCount <= 2) {
      // 1-2 words only (e.g. "okay") -> Examiner gives Band 1.0 - 1.5
      pScore = 1.5;
    } else if (actualWordCount <= 5) {
      // 3-5 words only -> Band 2.5 - 3.0
      pScore = matchRatio >= 0.6 ? 4.5 : 2.5;
    } else if (isAlignedWithTarget && refCount > 0 && (matchRatio >= 0.35 || actualWordCount < 12)) {
      // Reading / Shadowing target sentence
      if (matchRatio >= 0.90 && severeRatio === 0) pScore = 8.5;
      else if (matchRatio >= 0.80 && severeRatio <= 0.15) pScore = 7.5;
      else if (matchRatio >= 0.65 && severeRatio <= 0.30) pScore = 6.5;
      else if (matchRatio >= 0.50 && severeRatio <= 0.45) pScore = 5.5;
      else if (matchRatio >= 0.30 && severeRatio <= 0.65) pScore = 4.5;
      else pScore = 3.5;
    } else {
      // Free speaking response (answering question with candidate's own sentences)
      if (actualWordCount < 12) {
        pScore = 4.0;
      } else {
        const errorRatio = (heavyErrors * 2 + lightErrors) / totalAssessedWords;
        if (errorRatio <= 0.05 && actualWordCount >= 20) pScore = 8.0;
        else if (errorRatio <= 0.12 && actualWordCount >= 15) pScore = 7.0;
        else if (errorRatio <= 0.22) pScore = 6.0;
        else if (errorRatio <= 0.40) pScore = 5.0;
        else pScore = 4.0;
      }
    }
    pScore = Math.min(9.0, Math.max(1.0, Math.round(pScore * 2) / 2));

    // ──────────────── 2. Fluency & Coherence (FC) ────────────────
    let fcScore = 6.0;
    const fillerMatches = cleanTranscript.match(/\b(um|uh|er|like|you know|sort of|kind of)\b/gi) || [];
    const linkingMatches = LINKING_WORDS.filter((lw) => cleanTranscript.toLowerCase().includes(lw));

    if (actualWordCount <= 2) {
      fcScore = 1.0;
    } else if (actualWordCount <= 6) {
      fcScore = 2.5;
    } else if (actualWordCount <= 14) {
      fcScore = 4.0;
      if (wpm >= 90 && wpm <= 160) fcScore += 0.5;
    } else {
      fcScore = 5.5;
      if (wpm >= 105 && wpm <= 160) fcScore += 0.5;
      else if (wpm < 70) fcScore -= 0.5;

      if (linkingMatches.length >= 2) fcScore += 1.0;
      else if (linkingMatches.length === 1) fcScore += 0.5;

      if (fillerMatches.length > 4) fcScore -= 0.5;
      if (actualWordCount >= (part === 2 ? 80 : 30)) fcScore += 0.5;
    }
    fcScore = Math.min(9.0, Math.max(1.0, Math.round(fcScore * 2) / 2));

    // ──────────────── 3. Lexical Resource (LR) ────────────────
    let lrScore = 6.0;
    const uniqueWords = new Set(spokenLower);
    const ttr = spokenLower.length > 0 ? uniqueWords.size / spokenLower.length : 0.5;
    const advancedFound = ADVANCED_VOCAB.filter((av) => cleanTranscript.toLowerCase().includes(av));

    if (actualWordCount <= 2) {
      lrScore = 1.0;
    } else if (actualWordCount <= 6) {
      lrScore = 2.5;
    } else if (actualWordCount <= 14) {
      lrScore = 4.0;
      if (advancedFound.length >= 1) lrScore += 0.5;
    } else {
      lrScore = 5.5;
      if (advancedFound.length >= 3) lrScore += 1.5;
      else if (advancedFound.length === 2) lrScore += 1.0;
      else if (advancedFound.length === 1) lrScore += 0.5;

      if (ttr >= 0.70 && actualWordCount >= 25) lrScore += 0.5;
      else if (ttr < 0.40) lrScore -= 0.5;
    }
    lrScore = Math.min(9.0, Math.max(1.0, Math.round(lrScore * 2) / 2));

    // ──────────────── 4. Grammatical Range & Accuracy (GRA) ────────────────
    let graScore = 6.0;
    const complexMarkers = ['because', 'although', 'even though', 'which', 'who', 'that', 'if', 'while', 'whereas', 'unless', 'since', 'so that', 'in order to'];
    const foundComplex = complexMarkers.filter((cm) => cleanTranscript.toLowerCase().includes(` ${cm} `) || cleanTranscript.toLowerCase().startsWith(`${cm} `));

    if (actualWordCount <= 2) {
      graScore = 1.0;
    } else if (actualWordCount <= 6) {
      graScore = 2.5;
    } else if (actualWordCount <= 14) {
      graScore = 4.0;
      if (foundComplex.length >= 1) graScore += 0.5;
    } else {
      graScore = 5.5;
      if (foundComplex.length >= 2) graScore += 1.0;
      else if (foundComplex.length === 1) graScore += 0.5;

      if (cleanTranscript.includes(',') || cleanTranscript.includes(';')) graScore += 0.5;
      if (actualWordCount >= 35) graScore += 0.5;
    }
    graScore = Math.min(9.0, Math.max(1.0, Math.round(graScore * 2) / 2));

    // ──────────────── Overall Band Calculation (Official IELTS Rounding) ────────────────
    const rawAverage = (fcScore + lrScore + graScore + pScore) / 4;
    const decimal = rawAverage - Math.floor(rawAverage);
    let overallBand = Math.floor(rawAverage);
    if (decimal >= 0.75) {
      overallBand = Math.ceil(rawAverage);
    } else if (decimal >= 0.25) {
      overallBand = Math.floor(rawAverage) + 0.5;
    } else {
      overallBand = Math.floor(rawAverage);
    }
    overallBand = Math.min(9.0, Math.max(1.0, overallBand));

    // ──────────────── Criteria Score Details ────────────────
    const criteriaScores: CriteriaScoreDetail[] = [
      {
        name: 'Fluency & Coherence',
        nameVi: 'Độ trôi chảy & Mạch lạc',
        score: fcScore,
        feedback: actualWordCount <= 2
          ? `Câu trả lời quá ngắn (${actualWordCount} từ), chưa đủ để hình thành mạch nói.`
          : actualWordCount < 15
          ? `Tốc độ ~${wpm} WPM. Câu trả lời còn ngắn (${actualWordCount} từ), cần phát triển ý dài hơn.`
          : `Tốc độ nói ~${wpm} WPM. ${linkingMatches.length > 0 ? `Đã dùng tốt ${linkingMatches.length} từ nối.` : 'Cần bổ sung thêm từ nối để tăng độ mượt mà.'}`,
        suggestion: actualWordCount < 15
          ? 'Nói tối thiểu 2-3 câu hoàn chỉnh cho mỗi câu hỏi Part 1.'
          : 'Sử dụng thêm các cụm dẫn dắt tự nhiên như "To be honest", "From my perspective".',
        details: `Nói được ${actualWordCount} từ trong ${durationSeconds}s (~${wpm} WPM).`,
      },
      {
        name: 'Lexical Resource',
        nameVi: 'Vốn từ vựng & Độ chuẩn xác',
        score: lrScore,
        feedback: actualWordCount <= 2
          ? `Chỉ có ${actualWordCount} từ — chưa thể hiện được vốn từ vựng.`
          : actualWordCount < 20
          ? `Câu trả lời còn ngắn (${actualWordCount} từ), từ vựng còn ở mức rất cơ bản.`
          : `Độ đa dạng từ vựng đạt ${(ttr * 100).toFixed(0)}%. ${advancedFound.length > 0 ? `Từ vựng nổi bật: ${advancedFound.join(', ')}.` : 'Từ vựng rõ ràng, dễ hiểu.'}`,
        suggestion: actualWordCount < 20
          ? 'Mở rộng câu trả lời bằng cách dùng tính từ miêu tả và danh từ cụ thể.'
          : 'Bổ sung collocations học thuật và phrasal verbs theo chủ đề.',
        details: `${uniqueWords.size} từ vựng khác nhau được sử dụng.`,
      },
      {
        name: 'Grammatical Range & Accuracy',
        nameVi: 'Độ đa dạng & Chuẩn xác Ngữ pháp',
        score: graScore,
        feedback: actualWordCount <= 2
          ? `Chưa có cấu trúc câu hoàn chỉnh.`
          : foundComplex.length === 0
          ? 'Câu trả lời chủ yếu dùng cấu trúc câu đơn giản, chưa có mệnh đề liên kết. Nên bổ sung các từ như "because", "which", "although" để tăng điểm.'
          : foundComplex.length === 1
          ? `Đã bắt đầu sử dụng mệnh đề liên kết ("${foundComplex[0]}"), tiếp tục phát huy.`
          : `Cấu trúc câu khá phong phú với ${foundComplex.length} mệnh đề liên kết (${foundComplex.join(', ')}).`,
        suggestion: 'Kết hợp thêm câu điều kiện hoặc mệnh đề quan hệ để tăng điểm ngữ pháp.',
        details: actualWordCount < 10 ? 'Cần cấu trúc câu đầy đủ S + V + O.' : 'Cấu trúc ngữ pháp duy trì chuẩn xác.',
      },
      {
        name: 'Pronunciation',
        nameVi: 'Phát âm & Ngữ điệu',
        score: pScore,
        feedback: isAlignedWithTarget
          ? (correctWords === 0 && wordLevelPronunciation.length > 0
              ? `Đối chiếu với câu gốc: Bỏ sót hoặc đọc sai phần lớn câu gốc (${heavyErrors} từ sai/bỏ sót).`
              : `Đối chiếu với câu gốc: Đọc chuẩn ${correctWords}/${cleanRefQuestion.length} từ, phát hiện ${heavyErrors} từ sai/bỏ sót, ${lightErrors} từ cần lưu ý.`)
          : (actualWordCount <= 2
              ? `Chưa đủ dữ liệu âm vị học để đánh giá phát âm.`
              : `Phát hiện ${heavyErrors} từ cần chú ý âm câm/trọng âm chính, ${lightErrors + minorErrors} từ cần lưu ý.`),
        suggestion: 'Bấm vào từng từ bị gạch chân đỏ để nghe phát âm mẫu chuẩn và luyện đọc lại.',
        details: 'Hệ thống so khớp âm vị học trực tiếp với từ gốc và từ điển IPA.',
      },
    ];

    // ──────────────── Inline Corrections & Text Normalization ────────────────
    const refinedTranscript = sanitizeAndRefineSentence(cleanTranscript);
    const insertedPhrases: string[] = [];
    if (
      !cleanTranscript.toLowerCase().includes('to be honest') &&
      !cleanTranscript.toLowerCase().includes('personally') &&
      !cleanTranscript.toLowerCase().includes('in my opinion') &&
      !cleanTranscript.toLowerCase().includes('from my perspective')
    ) {
      insertedPhrases.push('To be completely honest,');
    }

    const formatLeadingText = (s: string) =>
      s.startsWith('I ') || s.startsWith("I'") || s === 'I'
        ? s
        : s.charAt(0).toLowerCase() + s.slice(1);

    const correctedSentence = insertedPhrases.length > 0
      ? `${insertedPhrases[0]} ${formatLeadingText(refinedTranscript)}`
      : refinedTranscript;

    const inlineCorrections: InlineCorrectionItem = {
      originalText: cleanTranscript,
      correctedText: correctedSentence,
      insertedPhrases,
      explanation: insertedPhrases.length > 0
        ? `Đã chuẩn hóa chính tả/ngữ pháp cơ bản và bổ sung cụm từ dẫn dắt tự nhiên "${insertedPhrases[0]}" để tăng tính mạch lạc cho bài thi Speaking.`
        : 'Cấu trúc câu trả lời của bạn tương đối rõ ràng và chuẩn xác.',
    };

    // ──────────────── Band 8.0+ Sentence Expansion (Mở rộng & Nâng cấp cấu trúc câu) ────────────────
    let cleanedTopicPrompt = questionText
      .toLowerCase()
      .replace(/^(what|why|how|do you like|do you prefer|do you enjoy|do you think|do you have|do you|are you|is there|describe)\s+/i, '')
      .replace(/\?$/, '')
      .trim();

    if (cleanedTopicPrompt.startsWith('like ')) {
      cleanedTopicPrompt = cleanedTopicPrompt.slice(5).trim();
    }

    const topicClean = (cleanedTopicPrompt || topic || 'this topic').toLowerCase();
    const embeddedTranscript = refinedTranscript.replace(/[.!?]+$/, '');

    const improvedAnswer = `From my personal perspective, when it comes to ${topicClean}, ${embeddedTranscript.length > 15 ? formatLeadingText(embeddedTranscript) : 'it plays an indispensable role in modern society'}. Furthermore, this not only broadens our cognitive horizons but also serves as a catalyst for long-term personal and intellectual development.`;

    // ──────────────── Topic-Specific Idea Expansion & Vocabulary Suggestions ────────────────
    const topicData = getTopicSuggestions(topic, questionText);
    const ideaExpansion = topicData.ideas;
    const vocabularySuggestions = topicData.vocabularies;

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
