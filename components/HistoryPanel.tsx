import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  disabled: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete, onClear, disabled }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filter, setFilter] = useState('');

  if (!history || !Array.isArray(history) || history.length === 0) {
    return null; // Don't render if there's no history or invalid data
  }

  const filteredHistory = history.filter(item =>
    item.inputs?.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
        <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-between items-center p-3 bg-[#0d0d0d]/30 border border-[#b9f2ff]/10 rounded-t-lg"
            aria-expanded={!isCollapsed}
        >
            <div className="flex items-center space-x-2">
                <HistoryIcon className="w-5 h-5 text-[#b9f2ff]/80" />
                <h3 className="text-base font-anton uppercase tracking-wider text-[#b9f2ff]/80">Lịch sử</h3>
            </div>
            {isCollapsed ? <ChevronDownIcon className="w-5 h-5 text-[#b9f2ff]/60" /> : <ChevronUpIcon className="w-5 h-5 text-[#b9f2ff]/60" />}
        </button>
        
        <div className={`transition-all duration-300 ease-in-out grid overflow-hidden bg-[#0d0d0d]/30 border-x border-b border-[#b9f2ff]/10 ${isCollapsed ? 'grid-rows-[0] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
            <div className="min-h-0">
                <div className="p-3 border-b border-[#b9f2ff]/10">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lịch sử..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        disabled={disabled}
                        className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#b9f2ff] focus:border-[#b9f2ff] transition-colors duration-300"
                    />
                </div>
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map(item => {
                            // Safety check to prevent crash if inputs object is missing
                            if (!item.inputs) return null;
                            
                            return (
                                <div key={item.id} className="group flex justify-between items-center p-2 rounded-md bg-[#0d0d0d]/50 hover:bg-[#b9f2ff]/10 transition-colors">
                                    <p className="text-sm text-[#b9f2ff]/80 truncate flex-1 pr-2" title={item.inputs.description}>
                                        {item.inputs.description}
                                    </p>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => onLoad(item)}
                                            disabled={disabled}
                                            title="Tải lại gợi ý này"
                                            className="p-1.5 rounded-full hover:bg-[#b9f2ff] hover:text-[#0d0d0d] disabled:opacity-50"
                                        >
                                            <RefreshCwIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(item.id)}
                                            disabled={disabled}
                                            title="Xóa gợi ý này"
                                            className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                         <p className="text-center text-sm text-[#b9f2ff]/60 py-4">
                            Không tìm thấy kết quả.
                        </p>
                    )}
                </div>
                <div className="p-3 border-t border-[#b9f2ff]/10">
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={disabled}
                        className="w-full text-xs text-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors disabled:opacity-50"
                    >
                        Xóa toàn bộ lịch sử
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};