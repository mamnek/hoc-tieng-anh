'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getWordIpa } from '@/lib/ipa-generator';
import {
  BookOpen,
  Scan,
  Upload,
  FileText,
  Volume2,
  Plus,
  Check,
  Sparkles,
  Trash2,
  Layers,
  ArrowRight,
  BookMarked,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  Type,
  Maximize2,
  Minimize2,
  X,
  FileSearch,
} from 'lucide-react';

interface ReadingCartItem {
  id: string;
  en: string;
  vi: string;
  ipa?: string;
  contextSentence?: string;
}

const SAMPLE_PASSAGES: Record<string, { title: string; level: string; band: string; text: string }> = {
  easy: {
    title: '🍫 Lịch Sử & Nguồn Gốc Sô-cô-la',
    level: 'Cơ bản',
    band: 'Band 5.5 - 6.0',
    text: `The history of chocolate begins in Mesoamerica. Fermented beverages made from chocolate date back to 450 BC. The Aztecs believed that cacao seeds were the gift of Quetzalcoatl, the god of wisdom, and the seeds once had so much value that they were used as a form of currency. Originally prepared only as a drink, chocolate was served bitter, mixed with spices or corn puree. It was believed to have aphrodisiac powers and to give the drinker strength. Today, such drinks are also known as "Chilate" and are made by locals in the South of Mexico. In modern times, sweet chocolate confectionery has become one of the most beloved culinary inventions across the globe.`,
  },
  medium: {
    title: '⚡ Sự Tiến Hóa Của Năng Lượng Tái Tạo',
    level: 'Trung cấp',
    band: 'Band 6.5 - 7.0',
    text: `The future of renewable energy is rapidly evolving as technologies like solar and wind power become more affordable and efficient. Governments worldwide are investing heavily in green infrastructure to combat climate change and reduce carbon emissions. Innovations in battery storage allow electrical grids to store surplus energy, ensuring a continuous supply even when the sun isn't shining or the wind isn't blowing. However, transitioning away from fossil fuels poses significant economic and logistical challenges that require international collaboration and unprecedented technological resilience.`,
  },
  hard: {
    title: '🧠 Tính Mềm Dẻo Não Bộ (Neuroplasticity)',
    level: 'Nâng cao',
    band: 'Band 7.5 - 8.0',
    text: `Neuroplasticity refers to the human brain's remarkable ability to reorganize itself by forming new neural connections throughout biological life. This biological phenomenon allows neurons to compensate for traumatic injuries and neurological diseases, adapting cognitive functions in response to dynamic environmental stimuli. Brain reorganization takes place through mechanisms such as axonal sprouting, wherein undamaged axons sprout new nerve endings to reconnect severed neural circuits. Consequently, cognitive rehabilitation therapies harness this malleability to restore impaired linguistic and motor proficiencies in stroke survivors.`,
  },
  academic: {
    title: '🏛️ Kiến Trúc Đô Thị & Sinh Thái Bền Vững',
    level: 'Học thuật',
    band: 'Band 8.0 - 8.5+',
    text: `Contemporary urban architecture increasingly embraces biophilic design principles to reconcile metropolitan density with ecological equilibrium. By incorporating vertical forests, permeable pavements, and passive thermal ventilation, modern skyscrapers mitigate the urban heat island effect while minimizing aggregate carbon footprints. Furthermore, decentralized wastewater reclamation systems and photovoltaic glass facades enable futuristic superstructures to function as net-zero closed-loop habitats. These progressive infrastructural paradigms substantiate the conviction that sustainable urbanism is indispensable for planetary longevity.`,
  },
};

export default function ReadingPage() {
  const router = useRouter();
  const addWordSet = useAppStore((state) => state.addWordSet);
  const addWords = useAppStore((state) => state.addWords);

  // Passage state
  const [selectedPassageKey, setSelectedPassageKey] = useState<string>('medium');
  const [customText, setCustomText] = useState<string>('');
  const [activeText, setActiveText] = useState<string>(SAMPLE_PASSAGES.medium.text);
  const [inputMode, setInputMode] = useState<'preset' | 'scan' | 'paste'>('preset');

  // OCR state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Translation Popup state
  const [popupData, setPopupData] = useState<{
    word: string;
    vi: string;
    ipa: string;
    loading: boolean;
    x: number;
    y: number;
    show: boolean;
  }>({
    word: '',
    vi: '',
    ipa: '',
    loading: false,
    x: 0,
    y: 0,
    show: false,
  });

  // Reading Cart State
  const [readingCart, setReadingCart] = useState<ReadingCartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [cartSavedSuccess, setCartSavedSuccess] = useState<boolean>(false);

  // Typography settings
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');

  const textContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load selected preset text
  useEffect(() => {
    if (inputMode === 'preset' && SAMPLE_PASSAGES[selectedPassageKey]) {
      setActiveText(SAMPLE_PASSAGES[selectedPassageKey].text);
      setPopupData((prev) => ({ ...prev, show: false }));
    }
  }, [selectedPassageKey, inputMode]);

  // Handle word click translation
  const handleWordClick = async (e: React.MouseEvent, rawWord: string) => {
    const cleanWord = rawWord.trim().replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord || cleanWord.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.min(window.innerWidth - 280, Math.max(16, rect.left));
    const y = rect.bottom + window.scrollY + 8;

    const ipa = getWordIpa(cleanWord.toLowerCase());

    setPopupData({
      word: cleanWord,
      vi: 'Đang tra từ điển...',
      ipa: ipa ? `/${ipa}/` : '',
      loading: true,
      x,
      y,
      show: true,
    });

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(cleanWord)}`
      );
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        setPopupData((prev) => ({
          ...prev,
          vi: data[0][0][0],
          loading: false,
        }));
      } else {
        setPopupData((prev) => ({
          ...prev,
          vi: 'Không tìm thấy nghĩa.',
          loading: false,
        }));
      }
    } catch (_) {
      setPopupData((prev) => ({
        ...prev,
        vi: 'Nghĩa từ vựng chưa tải được.',
        loading: false,
      }));
    }
  };

  // Text-to-Speech
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add word to cart
  const handleAddToCart = () => {
    if (!popupData.word) return;
    const exists = readingCart.some((w) => w.en.toLowerCase() === popupData.word.toLowerCase());
    if (exists) {
      alert('Từ này đã có trong giỏ của bạn rồi!');
      return;
    }

    const newItem: ReadingCartItem = {
      id: Math.random().toString(),
      en: popupData.word,
      vi: popupData.vi,
      ipa: popupData.ipa,
    };

    setReadingCart((prev) => [newItem, ...prev]);
    setPopupData((prev) => ({ ...prev, show: false }));
  };

  // Remove word from cart
  const handleRemoveFromCart = (id: string) => {
    setReadingCart((prev) => prev.filter((w) => w.id !== id));
  };

  // Save Cart as new Word Set in web-ielts Store
  const handleSaveAsWordSet = () => {
    if (readingCart.length === 0) return;

    const passageTitle =
      inputMode === 'preset'
        ? SAMPLE_PASSAGES[selectedPassageKey]?.title || 'Bộ Từ Vựng Luyện Đọc'
        : 'Từ Vựng Trích Xuất Từ Bài Đọc';

    const cleanTitle = passageTitle.replace(/[^\w\s\u00C0-\u1EF9]/gi, '').trim();

    const newSetId = addWordSet({
      name: `${cleanTitle} (${readingCart.length} từ)`,
      category: 'IELTS Reading',
      examType: 'IELTS',
      isPreset: false,
    });

    const newWords = readingCart.map((item) => ({
      wordSetId: newSetId,
      term: item.en,
      meaningVi: item.vi,
      ipa: item.ipa?.replace(/\//g, '') || '',
      partOfSpeech: 'noun' as const,
      exampleEn: `Vocabulary learned from IELTS reading passage: ${item.en}`,
      exampleVi: `Từ vựng trích xuất khi luyện đọc: ${item.en}`,
    }));

    addWords(newWords);
    setCartSavedSuccess(true);
    setTimeout(() => {
      setCartSavedSuccess(false);
      setShowCartDrawer(false);
      router.push(`/words?setId=${newSetId}`);
    }, 1200);
  };

  // OCR Image / Document Scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);

    // TXT file
    if (file.type === 'text/plain') {
      const text = await file.text();
      setActiveText(text);
      setInputMode('scan');
      return;
    }

    // Image OCR
    if (file.type.startsWith('image/')) {
      setIsScanning(true);
      setScanProgress(10);
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        setScanProgress(40);
        const ret = await worker.recognize(file);
        setScanProgress(90);
        await worker.terminate();

        const recognizedText = ret.data.text.trim();
        if (!recognizedText) {
          throw new Error('Không nhận diện được văn bản từ ảnh. Vui lòng chọn ảnh rõ nét hơn.');
        }

        setActiveText(recognizedText);
        setInputMode('scan');
        setIsScanning(false);
      } catch (err: any) {
        setIsScanning(false);
        setScanError(err?.message || 'Có lỗi khi quét ảnh OCR. Vui lòng thử lại.');
      }
      return;
    }

    setScanError('Định dạng file không hỗ trợ. Vui lòng chọn file Ảnh (PNG, JPG, WEBP) hoặc Text (.txt).');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white shadow-xl overflow-hidden border border-purple-500/20">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                IELTS READING & SMART SCAN
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Luyện Đọc & Scan Tài Liệu Thông Minh
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                Chạm vào bất kỳ từ nào để tra nghĩa tức thì, nghe phát âm và gom từ vào giỏ để tạo Flashcard ôn luyện tự động!
              </p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="self-start md:self-auto bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-gray-950 font-black px-5 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer text-sm"
            >
              <BookMarked className="w-4 h-4" />
              <span>Giỏ Từ Vựng ({readingCart.length})</span>
            </button>
          </div>
        </div>

        {/* Source Selector Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setInputMode('preset')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'preset'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Bài Đọc Mẫu IELTS
            </button>

            <button
              onClick={() => {
                setInputMode('scan');
                fileInputRef.current?.click();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'scan'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-amber-500" />
              Scan Ảnh / File TXT
            </button>

            <button
              onClick={() => setInputMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'paste'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Dán Đoạn Văn Bản
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium hidden sm:inline">Cỡ chữ:</span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-750 p-1 rounded-xl">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center font-bold cursor-pointer"
              >
                A-
              </button>
              <span className="px-1.5 font-bold text-gray-700 dark:text-gray-200">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center font-bold cursor-pointer"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Preset Selector if in Preset Mode */}
        {inputMode === 'preset' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {Object.entries(SAMPLE_PASSAGES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedPassageKey(key)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPassageKey === key
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-primary text-primary shadow-xs'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-200'
                }`}
              >
                <span className="text-xs font-bold block truncate">{item.title}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {item.band}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Paste Box if in Paste Mode */}
        {inputMode === 'paste' && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-3 animate-fade-in">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Dán đoạn văn bản bài đọc IELTS bạn muốn luyện tập vào đây:
            </label>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste passage here..."
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-serif leading-relaxed"
            />
            <button
              onClick={() => {
                if (customText.trim()) {
                  setActiveText(customText.trim());
                }
              }}
              className="bg-primary hover:bg-primaryDark text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              Áp Dụng Bài Đọc
            </button>
          </div>
        )}

        {/* OCR Scanning Status Bar */}
        {isScanning && (
          <div className="p-6 bg-purple-900 text-white rounded-3xl shadow-xl text-center space-y-3 animate-pulse border border-purple-400/30">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400" />
            <h3 className="text-lg font-bold">Đang nhận diện ký tự từ ảnh (OCR Scanner)...</h3>
            <p className="text-xs text-purple-200">
              Hệ thống đang trích xuất văn bản tiếng Anh từ tài liệu của bạn ({scanProgress}%)
            </p>
          </div>
        )}

        {/* Scan Error alert */}
        {scanError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl border border-red-200 text-xs font-medium">
            ⚠️ {scanError}
          </div>
        )}

        {/* ──────────────── Interactive Reading Canvas ──────────────── */}
        <div
          ref={textContainerRef}
          className="bg-white dark:bg-gray-850 p-6 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-750 shadow-sm relative leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineSpacing === 'loose' ? '2.4' : lineSpacing === 'relaxed' ? '2.0' : '1.7',
          }}
        >
          {/* Instructions bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-gray-700/60 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Chạm hoặc bấm vào từ bất kỳ để tra nghĩa & nghe phát âm
            </span>
            <span className="text-[11px] font-mono">{activeText.split(/\s+/).filter(Boolean).length} từ</span>
          </div>

          {/* Render Interactive Words */}
          <div className="font-serif text-gray-800 dark:text-gray-100 whitespace-pre-wrap select-text">
            {activeText.split(/(\s+)/).map((segment, idx) => {
              if (segment.trim() === '') {
                return <span key={idx}>{segment}</span>;
              }

              return (
                <span
                  key={idx}
                  onClick={(e) => handleWordClick(e, segment)}
                  className="hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:text-primary rounded-md px-0.5 py-0.5 transition-colors cursor-pointer inline-block"
                >
                  {segment}
                </span>
              );
            })}
          </div>
        </div>

        {/* ──────────────── Translation Floating Popup ──────────────── */}
        {popupData.show && (
          <div
            className="fixed z-50 p-4 bg-gray-950 text-white rounded-2xl shadow-2xl border border-gray-700 w-72 space-y-3 animate-fade-in"
            style={{
              left: `${popupData.x}px`,
              top: `${popupData.y}px`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-amber-300">{popupData.word}</h4>
                  <button
                    onClick={() => handleSpeak(popupData.word)}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {popupData.ipa && (
                  <span className="text-xs text-purple-300 font-mono block">{popupData.ipa}</span>
                )}
              </div>
              <button
                onClick={() => setPopupData((prev) => ({ ...prev, show: false }))}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-gray-100 leading-snug">
              {popupData.loading ? 'Đang dịch...' : popupData.vi}
            </p>

            <button
              onClick={handleAddToCart}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Lưu Vào Giỏ Từ Vựng
            </button>
          </div>
        )}

        {/* ──────────────── Vocabulary Cart Drawer ──────────────── */}
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between border-l border-purple-200 dark:border-purple-900/60 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Giỏ Từ Vựng ({readingCart.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {readingCart.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <FileSearch className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">Giỏ từ vựng đang trống.</p>
                    <p className="text-xs text-gray-400">
                      Hãy chạm vào các từ tiếng Anh trong bài đọc để thêm vào đây nhé!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {readingCart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-900 dark:text-white text-sm">
                              {item.en}
                            </strong>
                            <button
                              onClick={() => handleSpeak(item.en)}
                              className="text-gray-400 hover:text-primary cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 block mt-0.5">
                            {item.vi}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {readingCart.length > 0 && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <button
                    onClick={handleSaveAsWordSet}
                    disabled={cartSavedSuccess}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer text-sm"
                  >
                    {cartSavedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Đã Lưu Thành Bộ Từ! Đang Chuyển Trang...
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        Lưu Thành Bộ Từ Vựng ({readingCart.length} từ)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
