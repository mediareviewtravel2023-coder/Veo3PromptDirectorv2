import React, { useState } from 'react';
import { suggestStoryDetails } from '../services/geminiService';
import { MagicIcon } from './icons/MagicIcon';
import { CharacterManager } from './CharacterManager';
import { CharacterProfile, HistoryItem, FormInputs } from '../types';
import { HistoryPanel } from './HistoryPanel';


interface SidebarProps {
  onGenerate: () => void;
  isLoading: boolean;
  inputs: FormInputs;
  onInputChange: (updates: Partial<FormInputs>) => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

const countries = [
  "Mặc định", "Việt Nam", "Mỹ", "Nhật Bản", "Hàn Quốc", "Trung Quốc", "Anh", "Pháp", "Đức", "Ấn Độ", "Thái Lan", "Úc"
];

const languagesList = [
  "Tiếng Việt", "Tiếng Anh", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Quan Thoại", "Tiếng Pháp", "Tiếng Đức", "Tiếng Tây Ban Nha", "Tiếng Hindi", "Tiếng Thái", "Mặc định", "Không có hội thoại"
];

const accents = ["Mặc định", "Giọng miền Bắc", "Giọng miền Trung", "Giọng miền Nam"];

const suggestionLanguages = ["English", "Vietnamese", "Japanese", "French", "Spanish", "German"];

const videoStyles = [
  "Điện ảnh (Cinematic)",
  "Hoạt hình 3D (3D Animation)",
  "Hoạt hình Anime/Studio Ghibli",
  "Phong cách Tài liệu (Documentary Style)",
  "Phim tài liệu điện ảnh về thời tiền sử (Cinematic Prehistoric Documentary)",
  "Phim ngắn sinh tồn không lời thoại (Wordless Survival Short Film)",
  "Khoa học viễn tưởng (Sci-Fi)",
  "Kinh dị/Giật gân (Horror/Thriller)",
  "Siêu thực/Mơ màng (Surreal/Dreamy)",
  "Hài hước (Comedy)",
  "Lãng mạn (Romantic)",
  "Hành động (Action)",
  "Phong cách Wes Anderson",
  "Video Ca nhạc (Music Video Aesthetic)",
  "Video Du lịch/Vlog (Travel Vlog Style)",
  "Video Phong cách sống (Lifestyle)",
  "Neo-Noir",
  "Cổ điển/Hoài cổ (Vintage/Retro)",
  "Tua nhanh thời gian (Time-lapse)",
  "Chuyển động chậm (Slow-motion)",
  "Video Tối giản (Minimalist)",
  "Video Siêu thực (Hyperrealistic)",
  "ASMR (Autonomous Sensory Meridian Response)"
];

type ControlMode = 'duration' | 'scenes';

export const Sidebar: React.FC<SidebarProps> = ({ 
  onGenerate, 
  isLoading,
  inputs,
  onInputChange,
  history,
  onLoadHistory,
  onDeleteHistory,
  onClearHistory,
}) => {
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionLanguage, setSuggestionLanguage] = useState<string>('Vietnamese');
  const [suggestionDuration, setSuggestionDuration] = useState<string>('');
  const [suggestionIncludesDialogue, setSuggestionIncludesDialogue] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.description.trim()) {
      onGenerate();
    }
  };

  const handleSuggestStory = async () => {
    if (!inputs.description.trim() || isSuggesting) return;
    setIsSuggesting(true);
    try {
        const suggestedStory = await suggestStoryDetails(inputs.description, suggestionLanguage, suggestionDuration, suggestionIncludesDialogue);
        onInputChange({ description: suggestedStory });
    } catch (error) {
        console.error("Failed to get story suggestion:", error);
        alert("Xin lỗi, AI không thể đưa ra gợi ý ngay bây giờ. Vui lòng thử lại.");
    } finally {
        setIsSuggesting(false);
    }
  };
  
  const handleModeChange = (mode: ControlMode) => {
    onInputChange({ 
      controlMode: mode,
      sceneCount: mode === 'duration' ? '' : inputs.sceneCount,
      durationInMinutes: mode === 'scenes' ? '' : inputs.durationInMinutes
    });
  };

  const handleFullDialogueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onInputChange({ fullDialogue: isChecked, noDialogue: isChecked ? false : inputs.noDialogue });
  };

  const handleNoDialogueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onInputChange({ noDialogue: isChecked, fullDialogue: isChecked ? false : inputs.fullDialogue });
  };

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
      <div className="sticky top-24 bg-[#1a1a40]/20 border border-[#b9f2ff]/10 rounded-lg p-6 backdrop-blur-md max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Description */}
          <div>
            <h2 className="text-2xl font-anton uppercase tracking-wide mb-2">Tổng Quan Video</h2>
            <p className="text-sm text-[#b9f2ff]/70 mb-4">
              Mô tả câu chuyện tổng thể hoặc nhập một ý tưởng ngắn gọn.
            </p>
            <div className="relative">
              <textarea
                className="w-full h-32 bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#b9f2ff] focus:border-[#b9f2ff] transition-colors duration-300 resize-y"
                placeholder="VD: Một phi hành gia cô đơn tìm thấy một bông hoa phát sáng trên hành tinh hoang vắng..."
                value={inputs.description}
                onChange={(e) => onInputChange({ description: e.target.value })}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setIsSuggesting(!isSuggesting)}
                className="absolute bottom-3 right-3 p-2 bg-[#1a1a40]/80 rounded-full hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-colors text-[#b9f2ff]"
                title="AI Gợi ý chi tiết câu chuyện"
                disabled={isLoading}
              >
                <MagicIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestion Popup Area */}
            {isSuggesting && (
              <div className="mt-3 p-4 bg-[#1a1a40]/50 border border-[#b9f2ff]/20 rounded-md animate-fade-in">
                <h4 className="text-sm font-bold mb-2 text-[#b9f2ff]">Cài đặt Gợi ý AI</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs mb-1 text-[#b9f2ff]/70">Ngôn ngữ gợi ý</label>
                        <select 
                            value={suggestionLanguage}
                            onChange={(e) => setSuggestionLanguage(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded px-2 py-1 text-xs"
                        >
                            {suggestionLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs mb-1 text-[#b9f2ff]/70">Thời lượng mong muốn (Tùy chọn)</label>
                         <input 
                            type="text"
                            value={suggestionDuration}
                            onChange={(e) => setSuggestionDuration(e.target.value)}
                            placeholder="VD: 2 phút, 30 giây..."
                            className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded px-2 py-1 text-xs"
                        />
                    </div>
                     <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox"
                            id="suggestion-dialogue"
                            checked={suggestionIncludesDialogue}
                            onChange={(e) => setSuggestionIncludesDialogue(e.target.checked)}
                            className="rounded border-[#b9f2ff]/20 bg-[#0d0d0d] text-[#b9f2ff] focus:ring-0"
                        />
                        <label htmlFor="suggestion-dialogue" className="text-xs text-[#b9f2ff]/70">Bao gồm hội thoại mẫu</label>
                    </div>
                    <button
                        type="button"
                        onClick={handleSuggestStory}
                        disabled={!inputs.description.trim()}
                        className="w-full bg-[#b9f2ff]/10 hover:bg-[#b9f2ff]/20 text-[#b9f2ff] text-xs py-2 rounded transition-colors"
                    >
                        Tạo chi tiết câu chuyện
                    </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Settings */}
          <div className="space-y-4 border-t border-[#b9f2ff]/10 pt-4">
            <h3 className="text-base font-anton uppercase tracking-wider text-[#b9f2ff]/80">Cài Đặt Chi Tiết</h3>
            
            {/* Duration Control Mode */}
            <div className="flex items-center space-x-4 mb-2">
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="controlMode"
                   checked={inputs.controlMode === 'duration'}
                   onChange={() => handleModeChange('duration')}
                   className="text-[#b9f2ff] focus:ring-0 bg-transparent border-[#b9f2ff]/40"
                 />
                 <span className={`text-sm ${inputs.controlMode === 'duration' ? 'text-[#b9f2ff]' : 'text-[#b9f2ff]/60'}`}>Theo phút</span>
               </label>
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="controlMode"
                   checked={inputs.controlMode === 'scenes'}
                   onChange={() => handleModeChange('scenes')}
                   className="text-[#b9f2ff] focus:ring-0 bg-transparent border-[#b9f2ff]/40"
                 />
                 <span className={`text-sm ${inputs.controlMode === 'scenes' ? 'text-[#b9f2ff]' : 'text-[#b9f2ff]/60'}`}>Theo số cảnh</span>
               </label>
            </div>

            {inputs.controlMode === 'duration' ? (
                <div>
                    <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Thời lượng ước tính (Phút)</label>
                    <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={inputs.durationInMinutes}
                        onChange={(e) => onInputChange({ durationInMinutes: e.target.value })}
                        className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                        disabled={isLoading}
                    />
                    <p className="text-[10px] text-[#b9f2ff]/40 mt-1">Khoảng 7-8 cảnh mỗi phút.</p>
                </div>
            ) : (
                <div>
                    <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Số lượng cảnh (Chính xác)</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={inputs.sceneCount}
                        onChange={(e) => onInputChange({ sceneCount: e.target.value })}
                        placeholder="VD: 5, 10, 20..."
                        className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                        disabled={isLoading}
                    />
                    <p className="text-[10px] text-[#b9f2ff]/40 mt-1">Mỗi cảnh dài 8 giây.</p>
                </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Phong cách Video</label>
              <select
                value={inputs.videoStyle}
                onChange={(e) => onInputChange({ videoStyle: e.target.value })}
                className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                disabled={isLoading}
              >
                {videoStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Bối cảnh QG</label>
                <select
                  value={inputs.country}
                  onChange={(e) => onInputChange({ country: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                  disabled={isLoading}
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Ngôn ngữ thoại</label>
                <select
                  value={inputs.languages}
                  onChange={(e) => onInputChange({ languages: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                  disabled={isLoading || inputs.noDialogue}
                >
                  {languagesList.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
                <label className="block text-xs uppercase tracking-wider text-[#b9f2ff]/60 mb-1">Giọng Vùng Miền (Accent)</label>
                <select
                    value={inputs.accent}
                    onChange={(e) => onInputChange({ accent: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm"
                    disabled={isLoading || inputs.noDialogue || inputs.languages !== 'Tiếng Việt'}
                >
                    {accents.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* Section: Toggles */}
          <div className="space-y-3 border-t border-[#b9f2ff]/10 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSplit"
                checked={inputs.autoSplit}
                onChange={(e) => onInputChange({ autoSplit: e.target.checked })}
                className="rounded border-[#b9f2ff]/20 bg-[#0d0d0d] text-[#b9f2ff] focus:ring-0 focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="autoSplit" className="text-sm text-[#b9f2ff]/80 select-none cursor-pointer">Tự động phân chia cảnh logic</label>
            </div>
            <div className="flex items-center space-x-2">
               <input
                  type="checkbox"
                  id="noSinging"
                  checked={inputs.noSinging}
                  onChange={(e) => onInputChange({ noSinging: e.target.checked })}
                  className="rounded border-[#b9f2ff]/20 bg-[#0d0d0d] text-[#b9f2ff] focus:ring-0 focus:ring-offset-0"
                  disabled={isLoading}
               />
               <label htmlFor="noSinging" className="text-sm text-[#b9f2ff]/80 select-none cursor-pointer">Cấm hát (Chỉ thoại thường)</label>
            </div>
             <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="fullDialogue"
                    checked={inputs.fullDialogue}
                    onChange={handleFullDialogueChange}
                    className="rounded border-[#b9f2ff]/20 bg-[#0d0d0d] text-[#b9f2ff] focus:ring-0 focus:ring-offset-0"
                    disabled={isLoading || inputs.noDialogue}
                />
                <label htmlFor="fullDialogue" className="text-sm text-[#b9f2ff]/80 select-none cursor-pointer">Chế độ Thoại Nhiều (Full Dialogue)</label>
            </div>
             <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="noDialogue"
                    checked={inputs.noDialogue}
                    onChange={handleNoDialogueChange}
                    className="rounded border-[#b9f2ff]/20 bg-[#0d0d0d] text-[#b9f2ff] focus:ring-0 focus:ring-offset-0"
                    disabled={isLoading}
                />
                <label htmlFor="noDialogue" className="text-sm text-[#b9f2ff]/80 select-none cursor-pointer">Không có hội thoại (Chỉ hình ảnh)</label>
            </div>
          </div>

          {/* Section: Character Manager */}
          <div className="border-t border-[#b9f2ff]/10 pt-4">
            <CharacterManager 
              profiles={inputs.characterProfiles} 
              onProfilesChange={(profiles) => onInputChange({ characterProfiles: profiles })}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !inputs.description.trim()}
              className="w-full bg-[#b9f2ff] text-[#0d0d0d] font-bold text-lg py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(185,242,255,0.3)] hover:shadow-[0_0_25px_rgba(185,242,255,0.5)] hover:bg-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wide font-orbitron"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0d0d0d]"></span>
                  <span>Đang xử lý...</span>
                </span>
              ) : (
                "Tạo Gợi Ý"
              )}
            </button>
          </div>
          
           {/* History Panel - Moved to bottom as requested */}
           <div className="border-t-2 border-[#b9f2ff]/10 pt-6">
            <HistoryPanel 
                history={history}
                onLoad={onLoadHistory}
                onDelete={onDeleteHistory}
                onClear={onClearHistory}
                disabled={isLoading}
            />
          </div>
          
        </form>
      </div>
    </aside>
  );
};
