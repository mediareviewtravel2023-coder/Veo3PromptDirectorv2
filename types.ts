export interface Scene {
  sceneNumber: number;
  shortDescription: string;
  videoStyle: string;
  countryContext: string;
  characterDescription: string;
  visuals: string;
  camera: string;
  audio: string;
  sfx: string;
  dialogue: string;
  music: string;
}

export type RewriteAction = 'expand' | 'alternative';

export interface CharacterProfile {
  id: string;
  name: string;
  image: string | null; // Base64 string without data URI prefix
  mimeType: string | null;
  description: string;
}

// This interface now represents the complete state of the sidebar form.
export interface FormInputs {
  description: string;
  country: string;
  languages: string;
  videoStyle: string;
  autoSplit: boolean;
  noSinging: boolean;
  characterProfiles: CharacterProfile[];
  accent: string;
  fullDialogue: boolean;
  noDialogue: boolean;
  durationInMinutes: string;
  sceneCount: string;
  controlMode: 'duration' | 'scenes';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputs: FormInputs;
  scenes: Scene[];
}
