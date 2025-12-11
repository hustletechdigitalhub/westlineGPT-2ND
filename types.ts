
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isFinal: boolean;
  feedback?: 'like' | 'dislike' | null;
  timestamp: number;
  image?: ImageState;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  isPinned?: boolean;
}

export interface ImageState {
    data: string; // base64 data URL
    mimeType: string;
}

export interface GalleryItem {
    id: string;
    data: string;
    mimeType: string;
    prompt: string;
    timestamp: number;
}

export type AuraState = 'Off' | 'Rain' | 'Ice Drip' | 'Lava' | 'Steam' | 'Fire';
export type AuraIntensity = 'Low' | 'Medium' | 'High';
export type VoiceOption = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
export type LearningLevel = 'Absolute Beginner' | 'Beginner Builder' | 'Creator' | 'Pro Practitioner' | 'Mentor & Launch';

export interface AuraSuggestion {
  aura: AuraState;
  reason: string;
  isPremium: boolean;
}

export interface ScreenCrackState {
    key: number;
    active: boolean;
    baseAura: AuraState;
    intensity: AuraIntensity;
}

export interface AuraSyncSuggestion {
    original: string;
    enhanced: string;
}

export interface User {
    id:string;
    name: string;
    email: string;
    isPremium: boolean;
    imageGenerationCount: number;
    imageEditCount: number; // New: Track edits separately
    usageWindowStart: number; // New: Timestamp for 6-hour window start
    profilePicture?: string | null;
    theme?: 'dark' | 'light';
    preferences?: {
        reduceMotion: boolean;
        voice?: VoiceOption;
        learningLevel?: LearningLevel;
    };
}

export type AuthState = 'splash' | 'welcome' | 'login' | 'signup' | 'forgotPassword' | 'authenticated';
export type AuthProvider = 'Google';
