'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { PART_OF_SPEECH_OPTIONS } from '@/lib/constants';

interface AiWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MockWord {
  id: string;
  term: string;
  ipa: string;
  meaningVi: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleVi: string;
  selected: boolean;
}

const MOCK_DATA = [
  { term: 'destination', ipa: '/ˌdes.tɪˈneɪ.ʃən/', meaningVi: 'điểm đến', partOfSpeech: 'noun', exampleEn: 'Paris is a popular tourist destination.', exampleVi: 'Paris là một điểm đến du lịch phổ biến.' },
  { term: 'itinerary', ipa: '/aɪˈtɪn.ə.rər.i/', meaningVi: 'lịch trình', partOfSpeech: 'noun', exampleEn: 'We planned a detailed itinerary for our trip.', exampleVi: 'Chúng tôi đã lên một lịch trình chi tiết cho chuyến đi.' },
  { term: 'accommodate', ipa: '/əˈkɒm.ə.deɪt/', meaningVi: 'cung cấp chỗ ở', partOfSpeech: 'verb', exampleEn: 'The hotel can accommodate up to 500 guests.', exampleVi: 'Khách sạn có thể cung cấp chỗ ở cho tối đa 500 khách.' },
  { term: 'breathtaking', ipa: '/ˈbreθˌteɪ.kɪŋ/', meaningVi: 'ngoạn mục, hấp dẫn', partOfSpeech: 'adj', exampleEn: 'The view from the mountain top was breathtaking.', exampleVi: 'Phong cảnh từ đỉnh núi thật ngoạn mục.' },
  { term: 'embark', ipa: '/ɪmˈbɑːk/', meaningVi: 'lên tàu, bắt đầu', partOfSpeech: 'verb', exampleEn: 'We embarked on a journey across Europe.', exampleVi: 'Chúng tôi bắt đầu một hành trình xuyên Châu Âu.' },
  { term: 'souvenir', ipa: '/ˌsuː.vənˈɪər/', meaningVi: 'quà lưu niệm', partOfSpeech: 'noun', exampleEn: 'I bought a keychain as a souvenir.', exampleVi: 'Tôi đã mua một móc khóa làm quà lưu niệm.' },
  { term: 'picturesque', ipa: '/ˌpɪk.tʃərˈesk/', meaningVi: 'đẹp như tranh vẽ', partOfSpeech: 'adj', exampleEn: 'It was a picturesque little village.', exampleVi: 'Đó là một ngôi làng nhỏ đẹp như tranh vẽ.' },
  { term: 'wander', ipa: '/ˈwɒn.dər/', meaningVi: 'đi lang thang', partOfSpeech: 'verb', exampleEn: 'We wandered around the old town for hours.', exampleVi: 'Chúng tôi đi lang thang quanh khu phố cổ hàng giờ.' },
  { term: 'authentic', ipa: '/ɔːˈθen.tɪk/', meaningVi: 'đích thực, chính gốc', partOfSpeech: 'adj', exampleEn: 'We enjoyed some authentic Italian food.', exampleVi: 'Chúng tôi đã thưởng thức một số món ăn Ý chính gốc.' },
  { term: 'tranquil', ipa: '/ˈtræŋ.kwɪl/', meaningVi: 'yên tĩnh, thanh bình', partOfSpeech: 'adj', exampleEn: 'The lake was completely tranquil early in the morning.', exampleVi: 'Mặt hồ hoàn toàn yên tĩnh vào sáng sớm.' },
  { term: 'bustling', ipa: '/ˈbʌs.lɪŋ/', meaningVi: 'nhộn nhịp, hối hả', partOfSpeech: 'adj', exampleEn: 'New York is a bustling city.', exampleVi: 'New York là một thành phố nhộn nhịp.' },
  { term: 'excursion', ipa: '/ɪkˈskɜː.ʃən/', meaningVi: 'chuyến tham quan, dã ngoại', partOfSpeech: 'noun', exampleEn: 'We went on a brief excursion to the coast.', exampleVi: 'Chúng tôi đã có một chuyến tham quan ngắn đến bờ biển.' },
  { term: 'vibrant', ipa: '/ˈvaɪ.brənt/', meaningVi: 'sôi động, rực rỡ', partOfSpeech: 'adj', exampleEn: 'The market was vibrant and full of life.', exampleVi: 'Khu chợ rất sôi động và tràn đầy sức sống.' },
  { term: 'scenic', ipa: '/ˈsiː.nɪk/', meaningVi: 'có cảnh đẹp', partOfSpeech: 'adj', exampleEn: 'We took the scenic route along the coast.', exampleVi: 'Chúng tôi đã đi theo con đường có cảnh đẹp dọc theo bờ biển.' },
  { term: 'memorable', ipa: '/ˈmem.ər.ə.bəl/', meaningVi: 'đáng nhớ', partOfSpeech: 'adj', exampleEn: 'It was a truly memorable vacation.', exampleVi: 'Đó thực sự là một kỳ nghỉ đáng nhớ.' }
];

export default function AiWordModal({ isOpen, onClose }: AiWordModalProps) {
  const { wordSets, addWordSet, addWords } = useAppStore();
  const userWordSets = wordSets.filter(set => !set.isPreset);
  
  const [activeTab, setActiveTab] = useState<'topic' | 'reading'>('topic');
  
  // Tab 1 state
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(10);
  
  // Tab 2 state
  const [readingText, setReadingText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  
  // Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<MockWord[] | null>(null);
  
  // Save state
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [newSetName, setNewSetName] = useState('');
  const [isCreatingSet, setIsCreatingSet] = useState(false);

  if (!isOpen) return null;

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim().toLowerCase();
      if (!selectedChips.includes(text)) {
        setSelectedChips([...selectedChips, text]);
      }
    }
  };

  const generateWords = () => {
    setIsGenerating(true);
    setResults(null);
    
    // Mock API delay
    setTimeout(() => {
      const count = activeTab === 'topic' ? Math.min(wordCount, 15) : Math.max(selectedChips.length, 5);
      const generated = MOCK_DATA.slice(0, count).map(w => ({
        ...w,
        id: generateId(),
        selected: true
      }));
      setResults(generated);
      setIsGenerating(false);
    }, 1500);
  };

  const toggleWordSelection = (id: string) => {
    if (results) {
      setResults(results.map(w => w.id === id ? { ...w, selected: !w.selected } : w));
    }
  };

  const toggleAll = (select: boolean) => {
    if (results) {
      setResults(results.map(w => ({ ...w, selected: select })));
    }
  };

  const handleSave = () => {
    if (!results) return;
    
    const selectedWords = results.filter(w => w.selected);
    if (selectedWords.length === 0) {
      alert('Vui lòng chọn ít nhất 1 từ.');
      return;
    }

    let finalSetId = selectedSetId;
    
    if (isCreatingSet && newSetName.trim()) {
      finalSetId = addWordSet({
        name: newSetName.trim(),
        category: 'Custom',
        examType: 'Custom',
        isPreset: false
      });
    }

    if (!finalSetId) {
      alert('Vui lòng chọn hoặc tạo một bộ từ vựng.');
      return;
    }

    addWords(selectedWords.map(word => ({
      wordSetId: finalSetId,
      term: word.term,
      ipa: word.ipa,
      meaningVi: word.meaningVi,
      partOfSpeech: word.partOfSpeech as any,
      exampleEn: word.exampleEn,
      exampleVi: word.exampleVi
    })));

    handleClose();
  };

  const handleClose = () => {
    setTopic('');
    setWordCount(10);
    setReadingText('');
    setSelectedChips([]);
    setResults(null);
    setIsGenerating(false);
    onClose();
  };

  const getPosColor = (pos: string) => {
    const posColors: Record<string, string> = { noun: 'bg-blue-100 text-blue-800', verb: 'bg-green-100 text-green-800', adjective: 'bg-orange-100 text-orange-800', adverb: 'bg-purple-100 text-purple-800', preposition: 'bg-gray-100 text-gray-800', conjunction: 'bg-gray-100 text-gray-800', pronoun: 'bg-teal-100 text-teal-800', phrase: 'bg-pink-100 text-pink-800' };
    return posColors[pos] || 'bg-gray-100 text-gray-800';
  };
  
  const getPosLabel = (pos: string) => {
    const posOption = PART_OF_SPEECH_OPTIONS.find((p) => p.value === pos);
    return posOption?.label || pos;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header & Tabs */}
        <div className="px-6 pt-6 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              Thêm từ vựng với AI
            </h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!results && !isGenerating && (
            <div className="flex space-x-8">
              <button
                className={cn(
                  "pb-3 font-medium text-sm transition-colors border-b-2",
                  activeTab === 'topic' 
                    ? "border-purple-600 text-purple-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab('topic')}
              >
                Nhập chủ đề
              </button>
              <button
                className={cn(
                  "pb-3 font-medium text-sm transition-colors border-b-2",
                  activeTab === 'reading' 
                    ? "border-purple-600 text-purple-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab('reading')}
              >
                Đọc hiểu
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
              <p className="text-lg font-medium text-slate-700">AI đang tạo từ vựng...</p>
              <p className="text-sm mt-2">Vui lòng đợi trong giây lát</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Kết quả ({results.length} từ)</h3>
                <div className="space-x-4 text-sm">
                  <button onClick={() => toggleAll(true)} className="text-primary hover:underline">Chọn tất cả</button>
                  <button onClick={() => toggleAll(false)} className="text-slate-500 hover:underline">Bỏ chọn tất cả</button>
                </div>
              </div>
              
              <div className="space-y-3">
                {results.map((word) => (
                  <div 
                    key={word.id} 
                    className={cn(
                      "p-4 border rounded-xl flex gap-4 transition-colors cursor-pointer",
                      word.selected ? "border-purple-200 bg-purple-50/50" : "border-slate-100 hover:border-slate-200"
                    )}
                    onClick={() => toggleWordSelection(word.id)}
                  >
                    <div className="mt-1">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        word.selected ? "bg-purple-600 border-purple-600" : "border-slate-300"
                      )}>
                        {word.selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-slate-900 text-lg">{word.term}</span>
                        <span className="text-slate-500 text-sm">{word.ipa}</span>
                        <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", getPosColor(word.partOfSpeech))}>
                          {getPosLabel(word.partOfSpeech)}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium mb-2">{word.meaningVi}</p>
                      <div className="bg-white/60 p-3 rounded-lg text-sm">
                        <p className="text-slate-800 mb-1">{word.exampleEn}</p>
                        <p className="text-slate-500 italic">{word.exampleVi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Lưu vào bộ từ vựng</label>
                {!isCreatingSet ? (
                  <div className="flex items-center space-x-3">
                    <select 
                      className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      value={selectedSetId}
                      onChange={(e) => setSelectedSetId(e.target.value)}
                    >
                      <option value="" disabled>Chọn bộ từ vựng</option>
                      {userWordSets.map(set => (
                        <option key={set.id} value={set.id}>{set.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setIsCreatingSet(true)}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      + Tạo bộ mới
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <input 
                      type="text" 
                      placeholder="Nhập tên bộ từ vựng mới..."
                      className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                    />
                    <button 
                      onClick={() => { setIsCreatingSet(false); setNewSetName(''); }}
                      className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'topic' ? (
            <div className="space-y-6 max-w-xl mx-auto py-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nhập chủ đề bạn muốn học
                </label>
                <input
                  type="text"
                  placeholder="VD: Kinh doanh, Du lịch, Công nghệ..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số lượng từ (tối đa 30)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dán đoạn văn tiếng Anh vào đây
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Bôi đen (select) từ/cụm từ bạn muốn học trong văn bản dưới đây
                </p>
                <textarea
                  className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800 resize-none"
                  placeholder="Paste your English text here..."
                  value={readingText}
                  onChange={(e) => setReadingText(e.target.value)}
                  onMouseUp={handleTextSelect}
                />
              </div>
              
              {selectedChips.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-800 mb-3">Từ đã chọn ({selectedChips.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChips.map((chip, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white text-purple-700 border border-purple-200 shadow-sm">
                        {chip}
                        <button 
                          onClick={() => setSelectedChips(selectedChips.filter((_, i) => i !== index))}
                          className="ml-2 text-purple-400 hover:text-purple-600 focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
          {!results ? (
            <button
              onClick={generateWords}
              disabled={isGenerating || (activeTab === 'topic' && !topic.trim()) || (activeTab === 'reading' && selectedChips.length === 0)}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Tạo từ vựng với AI
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setResults(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Trở lại
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
              >
                Lưu {results.filter(w => w.selected).length} từ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
