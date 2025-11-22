import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from '../types';
import { generateVideoFromScene } from '../services/geminiService';
import { VideoIcon } from './icons/VideoIcon';

interface VeoGeneratorProps {
  scene: Scene;
}

const loadingMessages = [
    "Đạo diễn AI đang thiết lập cảnh quay...",
    "Máy quay đang chạy... Ghi hình!",
    "Hiệu ứng hình ảnh đang được áp dụng...",
    "Đang render các khung hình...",
    "Âm thanh đang được đồng bộ hóa...",
    "Quá trình này có thể mất vài phút, xin hãy kiên nhẫn.",
    "Sắp xong rồi, đang hoàn thiện những chi tiết cuối cùng...",
];

export const VeoGenerator: React.FC<VeoGeneratorProps> = ({ scene }) => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const checkApiKey = useCallback(async () => {
    setIsCheckingApiKey(true);
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    } catch (e) {
      console.error("Error checking for API key:", e);
      setApiKeySelected(false);
    } finally {
      setIsCheckingApiKey(false);
    }
  }, []);

  useEffect(() => {
    if ((window as any).aistudio) {
        checkApiKey();
    } else {
        const interval = setInterval(() => {
            if ((window as any).aistudio) {
                checkApiKey();
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }
  }, [checkApiKey]);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
        interval = window.setInterval(() => {
            setLoadingMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // Assume success and optimistically update UI
      setApiKeySelected(true);
      setError(null);
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Không thể mở hộp thoại chọn API key.");
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    try {
      const url = await generateVideoFromScene(scene);
      setVideoUrl(url);
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi không xác định trong quá trình tạo video.");
      if (e.message && e.message.includes("API key is invalid")) {
        setApiKeySelected(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (videoUrl) {
    return (
        <div className="mt-4 p-4 border-t border-[#b9f2ff]/10">
            <h4 className="text-lg font-orbitron mb-2">Video đã tạo</h4>
            <video controls src={videoUrl} className="w-full rounded-lg" />
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 text-sm bg-transparent border border-[#b9f2ff]/30 rounded-md p-2 hover:bg-[#b9f2ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
            >
                <VideoIcon className="w-4 h-4" />
                <span>Tạo lại Video</span>
            </button>
        </div>
    );
  }

  if (isGenerating) {
    return (
        <div className="mt-4 p-4 text-center border-t border-[#b9f2ff]/10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b9f2ff] mx-auto mb-3"></div>
            <p className="text-sm text-[#b9f2ff]/80 transition-opacity duration-500">{loadingMessage}</p>
        </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 border-t border-[#b9f2ff]/10">
      {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
      
      {isCheckingApiKey ? (
        <div className="text-center text-sm text-[#b9f2ff]/60">Đang kiểm tra API key...</div>
      ) : apiKeySelected ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#1a1a40] border border-[#b9f2ff]/20 rounded-md p-2 text-sm hover:bg-[#b9f2ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <VideoIcon className="w-5 h-5" />
          <span>Tạo Video với VEO 3.1 Fast</span>
        </button>
      ) : (
        <div className="text-center">
            <button
                onClick={handleSelectKey}
                className="w-full bg-[#b9f2ff] text-[#0d0d0d] font-bold py-2 px-4 rounded-lg hover:bg-white transition-colors duration-300"
            >
                Chọn API Key để tạo Video
            </button>
            <p className="text-xs text-[#b9f2ff]/60 mt-2">
                Việc tạo video yêu cầu API key của riêng bạn.
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:text-white"
                >
                    Tìm hiểu về thanh toán
                </a>.
            </p>
        </div>
      )}
    </div>
  );
};
