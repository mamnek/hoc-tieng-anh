'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PART_OF_SPEECH_OPTIONS } from '@/lib/constants';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddWordModal({ isOpen, onClose }: AddWordModalProps) {
  const { wordSets, addWordSet, addWords } = useAppStore();
  const userWordSets = wordSets.filter(set => !set.isPreset);
  
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [newSetName, setNewSetName] = useState('');
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  
  const [rows, setRows] = useState([
    { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
    { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
    { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
  ]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows([...rows, { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: string, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.term.trim() !== '' && r.meaningVi.trim() !== '');
    
    if (validRows.length === 0) {
      alert('Vui lòng điền ít nhất một từ vựng hợp lệ (có từ vựng và nghĩa).');
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

    addWords(validRows.map(row => ({
      wordSetId: finalSetId,
      term: row.term.trim(),
      ipa: row.ipa.trim(),
      meaningVi: row.meaningVi.trim(),
      partOfSpeech: row.partOfSpeech as any,
      exampleEn: row.exampleEn.trim(),
      exampleVi: row.exampleVi.trim()
    })));

    onClose();
    // reset form
    setRows([
      { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
      { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
      { id: generateId(), term: '', ipa: '', meaningVi: '', partOfSpeech: 'noun', exampleEn: '', exampleVi: '' },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Thêm từ vựng mới</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Bộ từ vựng</label>
            {!isCreatingSet ? (
              <div className="flex items-center space-x-3">
                <select 
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap font-medium"
                >
                  + Tạo bộ mới
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <input 
                  type="text" 
                  placeholder="Nhập tên bộ từ vựng mới..."
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  autoFocus
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-medium text-slate-500 border-b border-slate-100">
                  <th className="pb-3 w-48">Từ vựng *</th>
                  <th className="pb-3 w-32">Phát âm IPA</th>
                  <th className="pb-3 w-48">Nghĩa *</th>
                  <th className="pb-3 w-32">Loại từ</th>
                  <th className="pb-3 w-48">Ví dụ EN</th>
                  <th className="pb-3 w-48">Ví dụ VI</th>
                  <th className="pb-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-50 group">
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        placeholder="VD: destination"
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={row.term}
                        onChange={(e) => updateRow(row.id, 'term', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        placeholder="/ˌdes.tɪˈneɪ.ʃən/"
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={row.ipa}
                        onChange={(e) => updateRow(row.id, 'ipa', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        placeholder="Điểm đến"
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={row.meaningVi}
                        onChange={(e) => updateRow(row.id, 'meaningVi', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                        value={row.partOfSpeech}
                        onChange={(e) => updateRow(row.id, 'partOfSpeech', e.target.value)}
                      >
                        {PART_OF_SPEECH_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        placeholder="Ex: Paris is..."
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={row.exampleEn}
                        onChange={(e) => updateRow(row.id, 'exampleEn', e.target.value)}
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        placeholder="VD: Paris là..."
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={row.exampleVi}
                        onChange={(e) => updateRow(row.id, 'exampleVi', e.target.value)}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length === 1}
                        className="p-2 text-slate-300 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={handleAddRow}
            className="flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm dòng
          </button>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
          >
            Lưu từ vựng
          </button>
        </div>
      </div>
    </div>
  );
}
