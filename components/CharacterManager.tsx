
import React, { useRef } from 'react';
import { CharacterProfile } from '../types';
import { UserIcon } from './icons/UserIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ImageIcon } from './icons/ImageIcon';


interface CharacterManagerProps {
  profiles: CharacterProfile[];
  onProfilesChange: (profiles: CharacterProfile[]) => void;
  disabled: boolean;
}

const blobToBase64 = (blob: Blob): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (!data || !mimeType) {
                 reject(new Error("Failed to parse data URL."));
                 return;
            }
            resolve({ data, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


export const CharacterManager: React.FC<CharacterManagerProps> = ({ profiles, onProfilesChange, disabled }) => {
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const addProfile = () => {
        onProfilesChange([...profiles, { id: Date.now().toString(), name: '', image: null, mimeType: null, description: '' }]);
    };

    const removeProfile = (id: string) => {
        onProfilesChange(profiles.filter(p => p.id !== id));
    };

    const updateProfile = (id: string, updatedProfile: Partial<CharacterProfile>) => {
        onProfilesChange(profiles.map(p => p.id === id ? { ...p, ...updatedProfile } : p));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await blobToBase64(file);
                updateProfile(id, { image: data, mimeType });
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-anton uppercase tracking-wider text-[#b9f2ff]/80 mb-2">Nhân vật (Tùy chọn)</h3>
                <p className="text-xs text-[#b9f2ff]/60 mb-3">
                    Tải lên hình ảnh và/hoặc thêm mô tả cho nhân vật để AI tạo ra các chi tiết hình ảnh nhất quán và chính xác.
                </p>
                <div className="space-y-3">
                    {profiles.map((profile, index) => (
                        <div key={profile.id} className="flex items-start space-x-3 bg-[#0d0d0d]/40 p-3 rounded-lg border border-[#b9f2ff]/10">
                            <div className="flex-shrink-0 w-20 h-20">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                    ref={el => { fileInputRefs.current[index] = el; }}
                                    onChange={(e) => handleImageChange(e, profile.id)}
                                    disabled={disabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRefs.current[index]?.click()}
                                    disabled={disabled}
                                    className="w-full h-full rounded-md border-2 border-dashed border-[#b9f2ff]/30 hover:border-[#b9f2ff] flex items-center justify-center text-[#b9f2ff]/60 hover:text-[#b9f2ff] transition-colors bg-cover bg-center"
                                    style={{ backgroundImage: profile.image ? `url(data:${profile.mimeType};base64,${profile.image})` : 'none' }}
                                >
                                    {!profile.image && <ImageIcon className="w-8 h-8" />}
                                </button>
                            </div>

                            <div className="flex-grow space-y-2">
                                <label htmlFor={`character-name-${profile.id}`} className="sr-only">Tên nhân vật</label>
                                <div className="relative">
                                     <UserIcon className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-[#b9f2ff]/50" />
                                    <input
                                        type="text"
                                        id={`character-name-${profile.id}`}
                                        placeholder="Nhập tên nhân vật..."
                                        value={profile.name}
                                        onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                                        disabled={disabled}
                                        className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md py-2 pl-9 pr-3 text-sm"
                                    />
                                </div>
                                 <textarea
                                    id={`character-desc-${profile.id}`}
                                    placeholder="Mô tả nhân vật (VD: 25 tuổi, tóc ngắn, mặc áo khoác da...)"
                                    value={profile.description}
                                    onChange={(e) => updateProfile(profile.id, { description: e.target.value })}
                                    disabled={disabled}
                                    rows={3}
                                    className="w-full bg-[#0d0d0d] border border-[#b9f2ff]/20 rounded-md p-2 text-sm resize-y"
                                />
                            </div>
                             <button
                                type="button"
                                onClick={() => removeProfile(profile.id)}
                                disabled={disabled}
                                className="p-2 text-[#b9f2ff]/60 hover:text-red-400 disabled:opacity-50 transition-colors self-start"
                                title="Xóa nhân vật"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <button
                type="button"
                onClick={addProfile}
                disabled={disabled}
                className="w-full text-sm bg-[#1a1a40] border border-[#b9f2ff]/20 rounded-md p-2 hover:bg-[#b9f2ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
                + Thêm nhân vật
            </button>
        </div>
    );
};
