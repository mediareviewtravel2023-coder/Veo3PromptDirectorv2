import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { SettingsModal } from './components/SettingsModal';
import { Scene, RewriteAction, FormInputs, HistoryItem } from './types';
import { generateCinematicPrompts, rewriteScene, generateNextScene } from './services/geminiService';

const HISTORY_KEY = 'veo-prompt-director-history';
const MAX_HISTORY_ITEMS = 20;

// Default values from Sidebar's original state
const initialSidebarInputs: FormInputs = {
  description: '',
  country: 'Việt Nam',
  languages: 'Tiếng Việt',
  videoStyle: 'Điện ảnh (Cinematic)',
  autoSplit: true,
  noSinging: false,
  characterProfiles: [],
  accent: 'Mặc định',
  fullDialogue: false,
  noDialogue: false,
  durationInMinutes: '1',
  sceneCount: '',
  controlMode: 'duration',
};

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rewritingScene, setRewritingScene] = useState<number | null>(null);
  const [isAddingScene, setIsAddingScene] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const generationCancelledRef = useRef(false);
  
  const [sidebarInputs, setSidebarInputs] = useState<FormInputs>(initialSidebarInputs);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          // Strict validation to ensure history is an array
          if (Array.isArray(parsedHistory)) {
             // Filter out any corrupted items that might cause a crash
             const validHistory = parsedHistory.filter((item: any) => 
                item && 
                typeof item === 'object' && 
                item.inputs && 
                typeof item.inputs === 'object' &&
                item.id
             );
             
             if (validHistory.length !== parsedHistory.length) {
                 console.warn("Found and removed corrupted history items.");
                 // Update storage with cleaned list
                 localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory));
             }
             
            setHistory(validHistory);
          } else {
            // If format is wrong, reset it to prevent crash
            console.warn("History data was corrupted (not an array), resetting.");
            localStorage.removeItem(HISTORY_KEY);
            setHistory([]);
          }
        } catch (parseError) {
          console.warn("Failed to parse history JSON, resetting history.", parseError);
          localStorage.removeItem(HISTORY_KEY);
          setHistory([]);
        }
      }
    } catch (e) {
      console.error("Failed to access localStorage:", e);
    }
  }, []);

  const saveHistory = useCallback((inputs: FormInputs, generatedScenes: Scene[]) => {
    if (!inputs.description.trim() || generatedScenes.length === 0) return;

    setHistory(prevHistory => {
      const existingEntry = prevHistory.find(item => item.inputs.description === inputs.description);
      let newHistory: HistoryItem[];

      if (existingEntry) {
        // Update existing entry and move to top
        const updatedEntry = { ...existingEntry, inputs, scenes: generatedScenes, timestamp: Date.now() };
        const otherEntries = prevHistory.filter(item => item.id !== existingEntry.id);
        newHistory = [updatedEntry, ...otherEntries];
      } else {
        // Add new entry
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          inputs,
          scenes: generatedScenes,
          timestamp: Date.now(),
        };
        newHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      }
      
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save history to localStorage", e);
      }
      return newHistory;
    });
  }, []);

  const handleLoadHistory = useCallback((item: HistoryItem) => {
    setSidebarInputs(item.inputs);
    setScenes(item.scenes);
    setError(null);
  }, []);
  
  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử không?")) {
      setHistory([]);
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const handleInputChange = useCallback((updates: Partial<FormInputs>) => {
    setSidebarInputs(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = useCallback(async () => {
    generationCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setScenes([]);

    const currentInputs = { ...sidebarInputs };
    
    // Logic moved from Sidebar's handleSubmit
    let finalDuration = '';
    let finalSceneCount = currentInputs.sceneCount;
    const minutes = parseFloat(currentInputs.durationInMinutes);
    const finalLanguages = currentInputs.noDialogue ? "Không có hội thoại" : currentInputs.languages;

    if (currentInputs.controlMode === 'duration' && !isNaN(minutes) && minutes > 0) {
      finalDuration = `${currentInputs.durationInMinutes} phút`;
      finalSceneCount = Math.round(minutes * 7.5).toString();
    }
    
    const generationArgs = {
        description: currentInputs.description,
        duration: finalDuration,
        autoSplit: currentInputs.autoSplit,
        country: currentInputs.country,
        languages: finalLanguages,
        videoStyle: currentInputs.videoStyle,
        noSinging: currentInputs.noSinging,
        characterProfiles: currentInputs.characterProfiles,
        accent: currentInputs.accent,
        fullDialogue: currentInputs.fullDialogue,
        sceneCount: finalSceneCount
    };

    try {
      const generatedScenes = await generateCinematicPrompts(generationArgs);
      if (!generationCancelledRef.current) {
        setScenes(generatedScenes);
        saveHistory(currentInputs, generatedScenes);
      }
    } catch (e: any) {
      if (!generationCancelledRef.current) {
        setError(`${e.message}`);
        if (e.message.includes("API Key")) {
            setIsSettingsOpen(true);
        }
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sidebarInputs, saveHistory]);
  
  const handleCancelGeneration = useCallback(() => {
    generationCancelledRef.current = true;
    setIsLoading(false);
    setError("Quá trình tạo đã được dừng lại.");
    setScenes([]);
  }, []);

  const handleRewrite = useCallback(async (sceneToRewrite: Scene, action: RewriteAction) => {
    setRewritingScene(sceneToRewrite.sceneNumber);
    setError(null);
    try {
      const newScene = await rewriteScene(sceneToRewrite, action, sidebarInputs, scenes);
      const updatedScenes = scenes.map(s => s.sceneNumber === newScene.sceneNumber ? newScene : s);
      setScenes(updatedScenes);
      saveHistory(sidebarInputs, updatedScenes);
    } catch (e: any) {
      setError(`${e.message}`);
      if (e.message.includes("API Key")) {
        setIsSettingsOpen(true);
      }
      console.error(e);
    } finally {
      setRewritingScene(null);
    }
  }, [sidebarInputs, scenes, saveHistory]);

  const handleGenerateNextScene = useCallback(async (prompt: string) => {
    if (scenes.length === 0) {
        setError("Không thể tạo cảnh tiếp theo khi chưa có bối cảnh ban đầu.");
        return;
    }
    setIsAddingScene(true);
    setError(null);
    try {
        const newScene = await generateNextScene(prompt, scenes, sidebarInputs);
        const updatedScenes = [...scenes, newScene];
        setScenes(updatedScenes);
        saveHistory(sidebarInputs, updatedScenes);
    } catch (e: any) {
        setError(`${e.message}`);
        if (e.message.includes("API Key")) {
            setIsSettingsOpen(true);
        }
        console.error(e);
    } finally {
        setIsAddingScene(false);
    }
  }, [sidebarInputs, scenes, saveHistory]);

  const handleUpdateScene = useCallback((updatedScene: Scene) => {
    const updatedScenes = scenes.map(s => s.sceneNumber === updatedScene.sceneNumber ? updatedScene : s)
    setScenes(updatedScenes);
    saveHistory(sidebarInputs, updatedScenes);
  }, [scenes, sidebarInputs, saveHistory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-[#b9f2ff]">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <main className="flex-grow flex flex-col md:flex-row container mx-auto px-4 py-8 gap-8">
        <Sidebar 
          onGenerate={handleGenerate} 
          isLoading={isLoading || isAddingScene}
          inputs={sidebarInputs}
          onInputChange={handleInputChange}
          history={history}
          onLoadHistory={handleLoadHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
        />
        <MainContent
          scenes={scenes}
          isLoading={isLoading}
          error={error}
          onRewriteScene={handleRewrite}
          rewritingScene={rewritingScene}
          onGenerateNextScene={handleGenerateNextScene}
          isAddingScene={isAddingScene}
          onUpdateScene={handleUpdateScene}
          onCancelGeneration={handleCancelGeneration}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;