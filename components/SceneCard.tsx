import React, { useState, useEffect } from 'react';
import { Scene, RewriteAction } from '../types';
import { translateScene, formatSceneForVeoPrompt } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';
import { MagicIcon } from './icons/MagicIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { VeoGenerator } from './VeoGenerator';
import { ImageGenerator } from './ImageGenerator';
import { VideoIcon } from './icons/VideoIcon';
import { ImageIcon } from './icons/ImageIcon';

interface SceneCardProps {
  scene: Scene;
  onRewriteScene: (scene: Scene, action: RewriteAction) => void;
  isRewriting: boolean;
  onUpdateScene: (scene: Scene) => void;
}

const translationLanguages = ["English", "Vietnamese", "Japanese", "French", "Spanish", "German", "Korean", "Mandarin Chinese"];

const keyMap: { [key: string]: string } = {
  shortDescription: 'Short Description',
  videoStyle: 'Video Style',
  countryContext: 'Country Context',
  characterDescription: 'Character Description',
  visuals: 'Visuals',
  camera: 'Camera',
  audio: 'Audio',
  sfx: 'Sound Effects (SFX)',
  dialogue: 'Dialogue',
  music: 'Music',
};

type GenTab = 'video' | 'image';

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onRewriteScene, isRewriting, onUpdateScene }) => {
  const [copied, setCopied] = useState(false);
  const [translatedScene, setTranslatedScene] = useState<Scene | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [activeTab, setActiveTab] = useState<GenTab>('video');

  useEffect(() => {
    setEditedScene(scene);
  }, [scene]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedScene(scene);
  };

  const handleSave = () => {
    onUpdateScene(editedScene);
    setIsEditing(false);
  };

  const handleInputChange = (key: keyof Scene, value: string | number) => {
    setEditedScene(prev => ({ ...prev, [key]: value }));
  };

  const displayScene = translatedScene || scene;

  const handleCopy = () => {
    // The prompt for VEO should be in English. We use the original scene data
    // to construct it, as the translated scene would have non-English descriptions.
    // The dialogue language from the original scene is preserved.
    const promptText = formatSceneForVeoPrompt(scene);
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTranslate = async () => {
    if (isTranslating) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
        const result = await translateScene(scene, targetLanguage);
        setTranslatedScene(result);
    } catch (e: any) {
        setTranslationError(e.message || "Dịch thất bại.");
    } finally {
        setIsTranslating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-[#1a1a40]/30 border border-[#b9f2ff]/20 rounded-xl shadow-lg p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-orbitron text-white">Editing Scene {scene.sceneNumber}</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(editedScene)
            .filter(([key]) => key !== 'sceneNumber')
            .map(([key, value]) => {
              const formattedKey = keyMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              return (
                <div key={key}>
                  <label htmlFor={`${key}-${scene.sceneNumber}`} className="font-anton text-[#b9f2ff]/80 uppercase tracking-wider text-xs">{formattedKey}</label>
                  <textarea
                    id={`${key}-${scene.sceneNumber}`}
                    value={value.toString()}
                    onChange={(e) => handleInputChange(key as keyof Scene, e.target.value)}
                    className="w-full min-h-[80px] bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#b9f2ff] focus:border-[#b9f2ff] transition-colors duration-300 resize-y mt-1"
                  />
                </div>
              );
            })}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={handleCancel} className="px-6 py-2 rounded-lg text-sm font-semibold text-[#b9f2ff]/80 bg-transparent border border-[#b9f2ff]/20 hover:bg-[#b9f2ff]/10 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-8 py-2 rounded-lg text-sm font-bold bg-[#b9f2ff] text-[#0d0d0d] hover:bg-white transition-all duration-300 transform hover:scale-105">
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a40]/30 border border-[#b9f2ff]/10 rounded-xl shadow-lg animate-fade-in backdrop-blur-sm transition-all duration-300 hover:shadow-[#b9f2ff]/10 relative">
      {(isRewriting || isTranslating) && (
        <div className="absolute inset-0 bg-[#0d0d0d]/70 flex items-center justify-center z-20 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b9f2ff] mx-auto"></div>
              <p className="mt-4 text-lg">{isRewriting ? 'Rewriting scene...' : 'Translating...'}</p>
            </div>
        </div>
      )}
      <div className={`transition-opacity duration-300 ${(isRewriting || isTranslating) ? 'opacity-30' : 'opacity-100'}`}>
        <div className="flex justify-between items-start mb-4 gap-2 flex-wrap p-6 pb-0">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex-1 flex items-center gap-3 group text-left min-w-0">
            <div className="flex items-baseline gap-3 min-w-0">
               <h3 className="font-anton text-xl uppercase text-white group-hover:text-[#b9f2ff] transition-colors flex-shrink-0">
                 Scene {displayScene.sceneNumber}
               </h3>
               {displayScene.shortDescription && (
                 <p className="font-anton uppercase text-sm text-[#b9f2ff]/70 group-hover:text-[#b9f2ff] transition-colors truncate">
                   - {displayScene.shortDescription}
                 </p>
               )}
            </div>
            <div className="ml-auto flex-shrink-0">
              {isCollapsed ? <ChevronDownIcon className="w-5 h-5 text-[#b9f2ff]/60 group-hover:text-[#b9f2ff] transition-colors" /> : <ChevronUpIcon className="w-5 h-5 text-[#b9f2ff]/60 group-hover:text-[#b9f2ff] transition-colors" />}
            </div>
          </button>
          <div className="flex items-center space-x-2 flex-wrap">
             {/* Translation Controls */}
            {translatedScene ? (
                <button onClick={() => setTranslatedScene(null)} className="p-2 text-sm rounded-md text-[#b9f2ff]/80 bg-[#0d0d0d]/50 hover:bg-[#b9f2ff]/20 transition-colors">
                    Show Original
                </button>
            ) : (
                <div className="flex items-center space-x-1">
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="bg-[#0d0d0d]/80 border border-[#b9f2ff]/20 rounded-md p-2 text-xs h-9"
                    >
                        {translationLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <button
                        onClick={handleTranslate}
                        className="p-2 rounded-full text-[#b9f2ff]/70 bg-[#0d0d0d]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 group"
                        title={`Translate to ${targetLanguage}`}
                    >
                        <TranslateIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
            <button
                onClick={() => onRewriteScene(scene, 'alternative')}
                className="p-2 rounded-full text-[#b9f2ff]/70 bg-[#0d0d0d]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 group"
                title="Generate alternative scene"
            >
                <MagicIcon className="w-5 h-5" />
            </button>
            <button
                onClick={handleEdit}
                className="p-2 rounded-full text-[#b9f2ff]/70 bg-[#0d0d0d]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 group"
                title="Edit & Expand Scene"
            >
                <ExpandIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 bg-[#0d0d0d]/50 hover:bg-[#b9f2ff] hover:text-[#0d0d0d] transition-all duration-300 group relative shadow-md hover:shadow-lg hover:shadow-[#b9f2ff]/20"
            >
              <CopyIcon className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#b9f2ff] to-transparent opacity-0 group-hover:opacity-75 transition-opacity duration-300 blur-md"></div>
            </button>
          </div>
        </div>
        
        <div 
          className={`transition-all duration-500 ease-in-out grid overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}
        >
            <div className="p-6 pt-4">
                {/* Tabs for switching between Video and Image prompts */}
                <div className="flex items-center justify-center border-b border-[#b9f2ff]/10 mb-6">
                    <button 
                        onClick={() => setActiveTab('video')}
                        className={`flex-1 py-3 text-sm font-orbitron uppercase tracking-wide flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'video' ? 'bg-[#b9f2ff]/10 text-[#b9f2ff] border-b-2 border-[#b9f2ff]' : 'text-[#b9f2ff]/50 hover:text-[#b9f2ff]/80 hover:bg-[#b9f2ff]/5'}`}
                    >
                        <VideoIcon className="w-4 h-4" />
                        <span>Video Prompt (VEO 3)</span>
                    </button>
                    <div className="w-[1px] h-6 bg-[#b9f2ff]/10"></div>
                    <button 
                        onClick={() => setActiveTab('image')}
                        className={`flex-1 py-3 text-sm font-orbitron uppercase tracking-wide flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'image' ? 'bg-[#b9f2ff]/10 text-[#b9f2ff] border-b-2 border-[#b9f2ff]' : 'text-[#b9f2ff]/50 hover:text-[#b9f2ff]/80 hover:bg-[#b9f2ff]/5'}`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Image Prompt (Imagen 3)</span>
                    </button>
                </div>

                {/* Content for Video Tab */}
                {activeTab === 'video' && (
                    <div className="animate-fade-in">
                        {translationError && (
                            <p className="text-red-400 text-sm mb-4 text-center">{translationError}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
                            {Object.entries(displayScene)
                                .filter(([key]) => key !== 'sceneNumber' && key !== 'shortDescription')
                                .map(([key, value]) => {
                                const formattedKey = keyMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                                return (
                                    <div key={key} className="border-l-2 border-[#b9f2ff]/30 pl-3">
                                    <p className="font-anton text-[#b9f2ff]/80 uppercase tracking-wider text-xs">{formattedKey}</p>
                                    <p className="text-white/90 whitespace-pre-wrap">{value.toString()}</p>
                                    </div>
                                );
                                })}
                        </div>
                        <VeoGenerator scene={scene} />
                    </div>
                )}

                {/* Content for Image Tab */}
                {activeTab === 'image' && (
                    <div className="animate-fade-in">
                         <ImageGenerator scene={scene} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
