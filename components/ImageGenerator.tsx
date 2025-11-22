import React, { useState } from 'react';
import { Scene } from '../types';
import { formatSceneForImagePrompt, generateImageFromScene } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';
import { ImageIcon } from './icons/ImageIcon';

interface ImageGeneratorProps {
  scene: Scene;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ scene }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const imagePrompt = formatSceneForImagePrompt(scene);

  const handleCopy = () => {
    navigator.clipboard.writeText(imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        const url = await generateImageFromScene(scene);
        setImageUrl(url);
    } catch (e: any) {
        setError(e.message || "Đã có lỗi xảy ra khi tạo ảnh.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4 p-4 border-t border-[#b9f2ff]/10 animate-fade-in">
      <div className="mb-4">
        <label className="block text-xs font-anton uppercase tracking-wider text-[#b9f2ff]/60 mb-2">
          Image Generation Prompt
        </label>
        <div className="relative">
          <textarea
            readOnly
            value={imagePrompt}
            className="w-full h-24 bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-3 text-sm text-white/80 resize-none focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-[#1a1a40]/80 rounded-md text-[#b9f2ff] hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-colors"
            title="Sao chép prompt"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
        </div>
        {copied && <p className="text-xs text-green-400 mt-1 text-right">Đã sao chép!</p>}
      </div>

      {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

      {imageUrl ? (
        <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-[#b9f2ff]/20 shadow-lg">
                <img src={imageUrl} alt="Generated Scene" className="w-full h-auto" />
            </div>
            <div className="flex space-x-3">
                 <a 
                    href={imageUrl} 
                    download={`scene-${scene.sceneNumber}.jpg`}
                    className="flex-1 bg-[#1a1a40] border border-[#b9f2ff]/20 rounded-md p-2 text-sm hover:bg-[#b9f2ff]/10 text-center text-[#b9f2ff] transition-colors"
                 >
                    Tải ảnh xuống
                 </a>
                 <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-[#b9f2ff]/10 border border-[#b9f2ff]/20 rounded-md p-2 text-sm hover:bg-[#b9f2ff]/20 text-[#b9f2ff] transition-colors disabled:opacity-50"
                 >
                    Tạo lại
                 </button>
            </div>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#1a1a40] border border-[#b9f2ff]/20 rounded-md p-3 text-sm hover:bg-[#b9f2ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2 group"
        >
          {isGenerating ? (
             <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#b9f2ff]"></div>
                <span>Đang vẽ (Imagen 3)...</span>
             </>
          ) : (
             <>
                <ImageIcon className="w-5 h-5 text-[#b9f2ff] group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[#b9f2ff]">Tạo Hình Ảnh Minh Họa (Imagen 3)</span>
             </>
          )}
        </button>
      )}
    </div>
  );
};