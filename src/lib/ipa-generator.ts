// Real English Word to IPA Phoneme dictionary & Converter

const IPA_DICTIONARY: Record<string, string> = {
  // Common words & pronouns
  i: 'aɪ',
  me: 'miː',
  my: 'maɪ',
  you: 'juː',
  your: 'jɔːr',
  he: 'hiː',
  his: 'hɪz',
  him: 'hɪm',
  she: 'ʃiː',
  her: 'hɜːr',
  it: 'ɪt',
  its: 'ɪts',
  we: 'wiː',
  our: 'ˈaʊər',
  us: 'ʌs',
  they: 'ðeɪ',
  their: 'ðeər',
  them: 'ðɛm',
  this: 'ðɪs',
  that: 'ðæt',
  these: 'ðiːz',
  those: 'ðəʊz',
  a: 'ə',
  an: 'æn',
  the: 'ðə',
  and: 'ænd',
  or: 'ɔːr',
  but: 'bʌt',
  if: 'ɪf',
  because: 'bɪˈkɒz',
  as: 'æz',
  until: 'ənˈtɪl',
  while: 'waɪl',
  of: 'ɒv',
  at: 'æt',
  by: 'baɪ',
  for: 'fɔːr',
  with: 'wɪð',
  about: 'əˈbaʊt',
  against: 'əˈɡɛnst',
  between: 'bɪˈtwiːn',
  into: 'ˈɪntuː',
  through: 'θruː',
  during: 'ˈdjʊərɪŋ',
  before: 'bɪˈfɔːr',
  after: 'ˈɑːftər',
  above: 'əˈbʌv',
  below: 'bɪˈləʊ',
  to: 'tuː',
  from: 'frɒm',
  up: 'ʌp',
  down: 'daʊn',
  in: 'ɪn',
  out: 'aʊt',
  on: 'ɒn',
  off: 'ɒf',
  over: 'ˈəʊvər',
  under: 'ˈʌndər',
  is: 'ɪz',
  am: 'æm',
  are: 'ɑːr',
  was: 'wɒz',
  were: 'wɜːr',
  be: 'biː',
  been: 'biːn',
  being: 'ˈbiːɪŋ',
  have: 'hæv',
  has: 'hæz',
  had: 'hæd',
  do: 'duː',
  does: 'dʌz',
  did: 'dɪd',
  will: 'wɪl',
  would: 'wʊd',
  shall: 'ʃæl',
  should: 'ʃʊd',
  can: 'kæn',
  could: 'kʊd',
  may: 'meɪ',
  might: 'maɪt',
  must: 'mʌst',
  not: 'nɒt',
  no: 'nəʊ',
  yes: 'jɛs',
  what: 'wɒt',
  who: 'huː',
  whom: 'huːm',
  where: 'weər',
  when: 'wɛn',
  why: 'waɪ',
  how: 'haʊ',
  all: 'ɔːl',
  any: 'ˈɛni',
  both: 'bəʊθ',
  each: 'iːʧ',
  few: 'fjuː',
  more: 'mɔːr',
  most: 'məʊst',
  other: 'ˈʌðər',
  some: 'sʌm',
  such: 'sʌʧ',
  than: 'ðæn',
  too: 'tuː',
  very: 'ˈvɛri',
  one: 'wʌn',
  two: 'tuː',
  three: 'θriː',
  four: 'fɔːr',
  five: 'faɪv',
  six: 'sɪks',
  seven: 'ˈsɛvn',
  eight: 'eɪt',
  nine: 'naɪn',
  ten: 'tɛn',

  // Animation / Cartoon / We Bare Bears / Daily conversation words
  bear: 'beər',
  bears: 'beəz',
  grizzly: 'ˈɡrɪzli',
  panda: 'ˈpændə',
  ice: 'aɪs',
  brother: 'ˈbrʌðər',
  brothers: 'ˈbrʌðəz',
  friend: 'frɛnd',
  friends: 'frɛndz',
  origin: 'ˈɒrɪʤɪn',
  origins: 'ˈɒrɪʤɪnz',
  story: 'ˈstɔːri',
  stories: 'ˈstɔːriːz',
  cartoon: 'kɑːˈtuːn',
  network: 'ˈnɛtwɜːk',
  episode: 'ˈɛpɪsəʊd',
  fun: 'fʌn',
  funny: 'ˈfʌni',
  cute: 'kjuːt',
  cool: 'kuːl',
  love: 'lʌv',
  like: 'laɪk',
  help: 'hɛlp',
  food: 'fuːd',
  eat: 'iːt',
  drink: 'drɪŋk',
  play: 'pleɪ',
  run: 'rʌn',
  go: 'ɡəʊ',
  come: 'kʌm',
  see: 'siː',
  look: 'lʊk',
  listen: 'ˈlɪsn',
  speak: 'spiːk',
  say: 'seɪ',
  said: 'sɛd',
  talk: 'tɔːk',
  tell: 'tɛl',
  think: 'θɪŋk',
  thought: 'θɔːt',
  know: 'nəʊ',
  want: 'wɒnt',
  need: 'niːd',
  make: 'meɪk',
  take: 'teɪk',
  find: 'faɪnd',
  give: 'ɡɪv',
  work: 'wɜːk',
  call: 'kɔːl',
  try: 'traɪ',
  ask: 'ɑːsk',
  time: 'taɪm',
  year: 'jɪər',
  people: 'ˈpiːpl',
  way: 'weɪ',
  day: 'deɪ',
  man: 'mæn',
  thing: 'θɪŋ',
  woman: 'ˈwʊmən',
  life: 'laɪf',
  child: 'ʧaɪld',
  children: 'ˈʧɪldrən',
  world: 'wɜːld',
  school: 'skuːl',
  family: 'ˈfæmɪli',
  student: 'ˈstjuːdənt',
  group: 'ɡruːp',
  country: 'ˈkʌntri',
  problem: 'ˈprɒbləm',
  hand: 'hænd',
  part: 'pɑːt',
  place: 'pleɪs',
  case: 'keɪs',
  week: 'wiːk',
  company: 'ˈkʌmpəni',
  system: 'ˈsɪstəm',
  program: 'ˈprəʊɡræm',
  question: 'ˈkwɛsʧən',
  number: 'ˈnʌmbər',
  night: 'naɪt',
  home: 'həʊm',
  water: 'ˈwɔːtər',
  room: 'ruːm',
  mother: 'ˈmʌðər',
  father: 'ˈfɑːðər',
  area: 'ˈeəriə',
  money: 'ˈmʌni',
  book: 'bʊk',
  eye: 'aɪ',
  job: 'ʤɒb',
  word: 'wɜːd',
  business: 'ˈbɪznɪs',
  side: 'saɪd',
  kind: 'kaɪnd',
  head: 'hɛd',
  house: 'haʊs',
  service: 'ˈsɜːvɪs',
  friendship: 'ˈfrɛndʃɪp',
  adventure: 'ədˈvɛnʧər',
  magic: 'ˈmæʤɪk',
  happy: 'ˈhæpi',
  sad: 'sæd',
  big: 'bɪɡ',
  small: 'smɔːl',
  good: 'ɡʊd',
  bad: 'bæd',
  great: 'ɡreɪt',
  little: 'ˈlɪtl',
  long: 'lɒŋ',
  young: 'jʌŋ',
  old: 'əʊld',
  new: 'njuː',
  best: 'bɛst',
  right: 'raɪt',
  wrong: 'rɒŋ',
};

export function getWordIpa(rawWord: string): string {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanWord) return '';

  if (IPA_DICTIONARY[cleanWord]) {
    return `/${IPA_DICTIONARY[cleanWord]}/`;
  }

  // Fallback rule-based IPA generator for unknown words
  const ipa = cleanWord
    .replace(/th/g, 'θ')
    .replace(/sh/g, 'ʃ')
    .replace(/ch/g, 'ʧ')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/ee/g, 'iː')
    .replace(/oo/g, 'uː')
    .replace(/ea/g, 'iː')
    .replace(/ai/g, 'eɪ')
    .replace(/ay/g, 'eɪ')
    .replace(/ou/g, 'aʊ')
    .replace(/ow/g, 'aʊ')
    .replace(/tion/g, 'ʃən')
    .replace(/ing/g, 'ɪŋ')
    .replace(/ed/g, 't');

  return `/${ipa}/`;
}

export function convertSentenceToIpa(sentence: string): string {
  if (!sentence) return '';
  const words = sentence.trim().split(/\s+/);

  const ipaWords = words.map((rawWord) => {
    const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) return rawWord;

    if (IPA_DICTIONARY[cleanWord]) {
      return IPA_DICTIONARY[cleanWord];
    }

    // Fallback rule-based IPA generator for unknown words
    let ipa = cleanWord
      .replace(/th/g, 'θ')
      .replace(/sh/g, 'ʃ')
      .replace(/ch/g, 'ʧ')
      .replace(/ph/g, 'f')
      .replace(/ck/g, 'k')
      .replace(/ee/g, 'iː')
      .replace(/oo/g, 'uː')
      .replace(/ea/g, 'iː')
      .replace(/ai/g, 'eɪ')
      .replace(/ay/g, 'eɪ')
      .replace(/ou/g, 'aʊ')
      .replace(/ow/g, 'aʊ')
      .replace(/tion/g, 'ʃən')
      .replace(/ing/g, 'ɪŋ')
      .replace(/ed/g, 't');

    return `/${ipa}/`;
  });

  return `/${ipaWords.join(' ').replace(/\//g, '')}/`;
}
