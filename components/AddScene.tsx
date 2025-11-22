import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface AddSceneProps {
  onAddScene: (prompt: string) => void;
  disabled: boolean;
}

export const AddScene: React.FC<AddSceneProps> = ({ onAddScene, disabled }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onAddScene(prompt);
      setPrompt(''); // Clear after submitting
    }
  };

  return (
    <div className="mt-8 p-6 bg-[#1a1a40]/30 border-t-2 border-dashed border-[#b9f2ff]/20 rounded-b-xl animate-fade-in">
      <h3 className="text-xl font-anton uppercase tracking-wider text-white mb-3">Tạo Cảnh Tiếp Theo</h3>
      <p className="text-sm text-[#b9f2ff]/70 mb-4">
        Mô tả những gì bạn muốn xảy ra tiếp theo. AI sẽ tạo ra một cảnh mới đồng bộ với câu chuyện hiện tại.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="VD: Nhân vật chính bất ngờ gặp lại người bạn cũ trong quán cà phê..."
          className="w-full h-24 min-h-[96px] bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#b9f2ff] focus:border-[#b9f2ff] transition-colors duration-300 resize-y"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className="w-full bg-[#b9f2ff] text-[#0d0d0d] font-bold py-3 px-4 rounded-lg hover:bg-white disabled:bg-[#b9f2ff]/30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {disabled ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0d0d0d]"></div>
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5" />
              <span>Thêm cảnh mới</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};