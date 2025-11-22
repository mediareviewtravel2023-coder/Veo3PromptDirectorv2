import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="py-4 px-8 border-b border-[#1a1a40] bg-[#0d0d0d]/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="text-3xl font-bold font-anton tracking-widest uppercase">
            VEO 3 <span className="text-white">Prompt Director</span>
            </div>
            <div className="hidden md:block text-sm font-light uppercase tracking-widest text-[#b9f2ff]/70 border-l border-[#b9f2ff]/20 pl-4">
            Viết Kịch Bản. Đạo Diễn AI.
            </div>
        </div>
        
        <button 
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-[#b9f2ff]/10 text-[#b9f2ff]/70 hover:text-[#b9f2ff] transition-all duration-300"
            title="Cài đặt API Key"
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};