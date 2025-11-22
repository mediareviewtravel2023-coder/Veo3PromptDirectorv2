import React, { useState } from 'react';
import { Scene, RewriteAction } from '../types';
import { SceneCard } from './SceneCard';
import { TypingAnimation } from './TypingAnimation';
import { AddScene } from './AddScene';
import { StopIcon } from './icons/StopIcon';
import { formatSceneForVeoPrompt, formatSceneForImagePrompt } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';
import { VideoIcon } from './icons/VideoIcon';
import { ImageIcon } from './icons/ImageIcon';

interface MainContentProps {
  scenes: Scene[];
  isLoading: boolean;
  error: string | null;
  onRewriteScene: (scene: Scene, action: RewriteAction) => void;
  rewritingScene: number | null;
  onGenerateNextScene: (prompt: string) => void;
  isAddingScene: boolean;
  onUpdateScene: (scene: Scene) => void;
  onCancelGeneration: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ scenes, isLoading, error, onRewriteScene, rewritingScene, onGenerateNextScene, isAddingScene, onUpdateScene, onCancelGeneration }) => {
  const [videoCopied, setVideoCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  const handleCopyAllVideo = () => {
    if (scenes.length === 0) return;
    const allPrompts = scenes.map(scene => formatSceneForVeoPrompt(scene)).join('\n\n');
    navigator.clipboard.writeText(allPrompts);
    setVideoCopied(true);
    setTimeout(() => setVideoCopied(false), 2000);
  };

  const handleCopyAllImage = () => {
    if (scenes.length === 0) return;
    const allPrompts = scenes.map(scene => formatSceneForImagePrompt(scene)).join('\n\n');
    navigator.clipboard.writeText(allPrompts);
    setImageCopied(true);
    setTimeout(() => setImageCopied(false), 2000);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <TypingAnimation text="Đang tạo kịch bản điện ảnh... Đạo diễn AI đang lên ý tưởng cho tầm nhìn của bạn, chia nhỏ các cảnh và đảm bảo tính liên tục..." />
          <div className="mt-6">
            <button
              onClick={onCancelGeneration}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"
            >
              <StopIcon className="w-5 h-5" />
              <span>Dừng Tạo</span>
            </button>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
          <h3 className="text-xl font-orbitron text-red-400 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-300">{error}</p>
        </div>
      );
    }
    
    if (scenes.length > 0) {
      return (
        <>
          <div className="mb-6 flex justify-end gap-3 flex-wrap">
            <button
              onClick={handleCopyAllVideo}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 bg-[#1a1a40]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 border border-[#b9f2ff]/20 shadow-md hover:shadow-[#b9f2ff]/10"
            >
              <VideoIcon className="w-4 h-4" />
              <span>{videoCopied ? 'Đã sao chép Video!' : 'Copy Video Prompts'}</span>
            </button>
             <button
              onClick={handleCopyAllImage}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 bg-[#1a1a40]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 border border-[#b9f2ff]/20 shadow-md hover:shadow-[#b9f2ff]/10"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{imageCopied ? 'Đã sao chép Ảnh!' : 'Copy Image Prompts'}</span>
            </button>
          </div>
          <div className="space-y-6">
            {scenes.map((scene, index) => (
              <SceneCard 
                key={index} 
                scene={scene} 
                onRewriteScene={onRewriteScene}
                isRewriting={rewritingScene === scene.sceneNumber}
                onUpdateScene={onUpdateScene}
              />
            ))}
          </div>
          <AddScene 
            onAddScene={onGenerateNextScene}
            disabled={isAddingScene || isLoading || !!rewritingScene}
          />
        </>
      );
    }

    return (
      <div className="text-center py-20 px-8 border-2 border-dashed border-[#1a1a40] rounded-lg">
        <h2 className="text-3xl font-anton uppercase tracking-wide text-[#b9f2ff]/80">Chào mừng đến với Ghế Đạo diễn</h2>
        <p className="mt-4 text-[#b9f2ff]/60 max-w-xl mx-auto">
          Mô tả ý tưởng video của bạn ở thanh bên để bắt đầu tạo các gợi ý VEO 3 chi tiết, mang tính điện ảnh. Đội ngũ làm phim AI của bạn đang sẵn sàng.
        </p>
      </div>
    );
  };
  
  return (
    <section className="w-full md:w-2/3 lg:w-3/4">
      {renderContent()}
    </section>
  );
};
