
import React, { useState, useRef, useEffect } from 'react';
import { AuraState, AuraIntensity, User, Conversation, VoiceOption, LearningLevel } from '../types';
import { geminiService } from '../services/geminiService';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onDeleteConversation: (id: string) => void;
    onPinConversation: (id: string) => void;
    onRenameConversation: (id: string, title: string) => void;
    onClearHistory: () => void;

    currentAura: AuraState;
    onAuraChange: (aura: AuraState) => void;
    intensity: AuraIntensity;
    onIntensityChange: (intensity: AuraIntensity) => void;
    reduceMotion: boolean;
    onReduceMotionChange: (reduce: boolean) => void;
    onVoiceChange: (voice: VoiceOption) => void;
    
    learningLevel: LearningLevel;
    onLevelChange: (level: LearningLevel) => void;
    
    onAboutClick: () => void;
    onPremiumClick: () => void;
    onTriggerImpact: () => void;
    onContactClick: () => void;
    onProfileClick: () => void;
    
    isMenuOpen: boolean;
    onMenuToggle: () => void;
    
    isLevelMenuOpen: boolean;
    onLevelMenuToggle: () => void;
}

const WestlineIcon: React.FC = () => (
     <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
        <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
        <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="var(--brand-indigo)"/>
    </svg>
);
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M11.05 3.05a.75.75 0 00-1.05-.001l-1.95 1.95a.75.75 0 00.526 1.282h3.9a.75.75 0 00.526-1.282l-1.95-1.95z" /><path fillRule="evenodd" d="M10 2a.75.75 0 01.673.418l1.95 3.9a.75.75 0 01-.526 1.032H7.903a.75.75 0 01-.526-1.032l1.95-3.9A.75.75 0 0110 2zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zM5.106 12.394a.75.75 0 01.002 1.06l-1.15 1.152a.75.75 0 01-1.28-.53V12.75a.75.75 0 01.75-.75h1.678a.75.75 0 01.528.224z" clipRule="evenodd" /><path d="M14.894 12.394a.75.75 0 01.528-.224h1.678a.75.75 0 01.75.75v1.327a.75.75 0 01-1.28.53l-1.15-1.152a.75.75 0 01.002-1.06z" /></svg>);
const InfoIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>);
const SparklesIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const ImpactIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>);
const ContactIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CheckIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const SettingsIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>);
const PinIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <span 
        role="img" 
        aria-label="pin" 
        className="text-sm select-none transition-all duration-200 inline-block"
        style={{ 
            opacity: filled ? 1 : 0.4, 
            filter: filled ? 'none' : 'grayscale(100%)' 
        }}
    >
        📌
    </span>
);
const PlayIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>);
const EditIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>);
const SearchIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>);


// New Icons for Levels
const LevelAdjustIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

const SproutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22v-8" />
        <path d="M5 20a7 7 0 0 1 7-10 7 7 0 0 1 7 10" />
        <path d="M12 22a2 2 0 0 1 2-2" />
        <path d="M12 22a2 2 0 0 0-2-2" />
    </svg>
);

const ToolsIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

const RocketIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

const GearIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
);

const StarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        <line x1="2" x2="22" y1="22" y2="22" />
    </svg>
);


const AURA_CONFIG = {
    'Off': { icon: '🚫', label: 'Default', premium: false },
    'Rain': { icon: '💧', label: 'Rain', premium: false },
    'Ice Drip': { icon: '❄️', label: 'Ice Drip', premium: false },
    'Fire': { icon: '🔥', label: 'Fire', premium: true },
    'Lava': { icon: '🌋', label: 'Lava', premium: true },
    'Steam': { icon: '☁️', label: 'Steam', premium: true },
};

const VOICE_OPTIONS: VoiceOption[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

// Define Level Configuration
const LEVEL_CONFIG: Record<LearningLevel, { label: string; desc: string; Icon: React.FC<{className?: string}>; premium: boolean }> = {
    'Absolute Beginner': { 
        label: 'Absolute Beginner', 
        desc: 'New to digital skills? Start here with step-by-step introductions.', 
        Icon: SproutIcon,
        premium: false
    },
    'Beginner Builder': { 
        label: 'Beginner Builder', 
        desc: 'Understand basics? Practice simple tools and small tasks.', 
        Icon: ToolsIcon,
        premium: false
    },
    'Creator': { 
        label: 'Creator', 
        desc: 'Ready to build real projects and creative identity?', 
        Icon: RocketIcon,
        premium: true
    },
    'Pro Practitioner': { 
        label: 'Pro Practitioner', 
        desc: 'Advanced workflows, efficiency, and high-level polish.', 
        Icon: GearIcon,
        premium: true
    },
    'Mentor & Launch': { 
        label: 'Mentor & Launch', 
        desc: 'Expert level. Teach, lead, and launch professional portfolios.', 
        Icon: StarIcon,
        premium: true
    }
};

const LEVELS_GREETINGS = [
    "Choose your level and I’ll customize the experience for you.",
    "Where are you on your creative journey?",
    "Select your skill level to get started.",
    "Let's tailor the learning experience for you."
];

const HamburgerButton: React.FC<{ isOpen: boolean; onClick: () => void }> = ({ isOpen, onClick }) => (
    <button onClick={onClick} className="relative w-8 h-8 focus:outline-none z-50" aria-label="Toggle menu">
        <div className={`absolute w-6 h-0.5 bg-amber-400 transform transition-all duration-300 ${isOpen ? 'rotate-45' : '-translate-y-2'}`} style={{ left: '4px', top: '15px' }}></div>
        <div className={`absolute w-6 h-0.5 bg-amber-400 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ left: '4px', top: '15px' }}></div>
        <div className={`absolute w-6 h-0.5 bg-amber-400 transform transition-all duration-300 ${isOpen ? '-rotate-45' : 'translate-y-2'}`} style={{ left: '4px', top: '15px' }}></div>
    </button>
);

const Avatar: React.FC<{ user: User; className?: string }> = ({ user, className = 'w-10 h-10' }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.slice(0, 2).toUpperCase();
    };

    return (
        <div className="relative">
            <div className={`rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`} style={{ background: 'linear-gradient(45deg, var(--primary-amber), var(--brand-purple))' }}>
                {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white font-bold text-sm">
                        {getInitials(user.name)}
                    </span>
                )}
            </div>
            <div className="absolute -inset-0.5 rounded-full ring-2 ring-amber-400/50 animate-pulse"></div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = (props) => {
    const { user, isMenuOpen, onMenuToggle, isLevelMenuOpen, onLevelMenuToggle, onRenameConversation } = props;
    const [isAuraOpen, setIsAuraOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [levelGreeting, setLevelGreeting] = useState(LEVELS_GREETINGS[0]);
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const levelMenuRef = useRef<HTMLDivElement>(null);
    
    // Chat History Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen && menuWrapperRef.current && !menuWrapperRef.current.contains(event.target as Node)) {
                onMenuToggle();
            }
            if (isLevelMenuOpen && levelMenuRef.current && !levelMenuRef.current.contains(event.target as Node)) {
                onLevelMenuToggle();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen, onMenuToggle, isLevelMenuOpen, onLevelMenuToggle]);

    useEffect(() => {
        if(isLevelMenuOpen) {
            const randomGreeting = LEVELS_GREETINGS[Math.floor(Math.random() * LEVELS_GREETINGS.length)];
            setLevelGreeting(randomGreeting);
        }
    }, [isLevelMenuOpen]);

    const playVoicePreview = async (voice: VoiceOption, e: React.MouseEvent) => {
        e.stopPropagation();
        await geminiService.generateSpeech(`Hello, I am ${voice}.`, voice);
    }
    
    // Sort conversations: Pinned first, then by timestamp descending
    const sortedConversations = [...props.conversations].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return b.timestamp - a.timestamp;
        }
        return a.isPinned ? -1 : 1;
    });
    
    // Filter conversations based on search
    const filteredConversations = sortedConversations.filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesMessage = c.messages.some(m => m.text.toLowerCase().includes(query));
        return matchesTitle || matchesMessage;
    });

    const startEditing = (convo: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingConvoId(convo.id);
        setEditTitle(convo.title);
    };

    const saveEditing = (e: React.MouseEvent | React.FormEvent) => {
        e.stopPropagation();
        if (editingConvoId && onRenameConversation) {
            onRenameConversation(editingConvoId, editTitle);
        }
        setEditingConvoId(null);
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingConvoId(null);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 p-4">
             <div className="max-w-4xl mx-auto flex justify-between items-center glass-pane p-2 px-4 rounded-2xl relative">
                
                <div className="flex items-center space-x-3">
                    {/* Collapsible Learning Level Selector */}
                    <div ref={levelMenuRef} className="relative">
                        <button 
                            onClick={onLevelMenuToggle}
                            className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center mr-2 border ${isLevelMenuOpen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Select Learning Level"
                        >
                            <LevelAdjustIcon />
                        </button>
                        
                        {isLevelMenuOpen && (
                            <div className="absolute top-full left-0 mt-4 w-80 md:w-96 glass-pane rounded-2xl p-4 z-50 animate-fade-in-down shadow-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
                                <div className="text-sm text-gray-200 px-2 py-2 font-semibold tracking-wide mb-2 leading-relaxed">
                                    {levelGreeting}
                                </div>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                    {(Object.keys(LEVEL_CONFIG) as LearningLevel[]).map(level => {
                                        const config = LEVEL_CONFIG[level];
                                        const isSelected = props.learningLevel === level;
                                        const isLocked = config.premium && !user?.isPremium;
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => {
                                                    if(isLocked) {
                                                        props.onPremiumClick();
                                                        onLevelMenuToggle();
                                                    } else {
                                                        props.onLevelChange(level);
                                                        onLevelMenuToggle();
                                                    }
                                                }}
                                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative border-2 ${isSelected ? 'bg-amber-900/10 border-amber-500 shadow-[0_0_15px_rgba(228,158,16,0.15)]' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'}`}>
                                                        <config.Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>{config.label}</span>
                                                            {isSelected && <CheckIcon />}
                                                            {isLocked && !isSelected && <LockIcon className="h-4 w-4 text-amber-500" />}
                                                        </div>
                                                        <p className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>{config.desc}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <WestlineIcon />
                    <h1 className="text-2xl md:text-3xl font-bold text-accent-white tracking-wider">WestlineGPT</h1>
                </div>
                
                <div ref={menuWrapperRef} className="relative">
                    <HamburgerButton isOpen={isMenuOpen} onClick={onMenuToggle} />
                    
                    {isMenuOpen && (
                        <div 
                            className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto glass-pane rounded-2xl p-4 text-gray-200 flex flex-col space-y-2 origin-top-right animate-fade-in-down no-scrollbar shadow-2xl z-50 bg-[#0A0A0A]/95"
                            style={{ overscrollBehavior: 'contain' }}
                        >
                            {user && (
                                <>
                                    <button onClick={props.onProfileClick} className="flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors w-full group">
                                        <Avatar user={user} />
                                        <div className="flex-1 truncate">
                                            <p className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate text-sm">{user.name}</p>
                                            <p className="text-xs text-white/70 truncate">{user.email}</p>
                                        </div>
                                    </button>
                                    <div className="border-t border-white/10 my-2"></div>
                                </>
                            )}
                            
                            {/* Search Bar */}
                             <div className="px-1 mb-2">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search chats..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                                    />
                                    <div className="absolute left-3 top-2.5 text-white/30">
                                        <SearchIcon />
                                    </div>
                                </div>
                            </div>

                            {/* Chat History Section */}
                            <div className="space-y-1 pr-1 -mr-1 max-h-64 overflow-y-auto no-scrollbar">
                               {filteredConversations.length > 0 ? (
                                   filteredConversations.map(convo => (
                                       <div key={convo.id} className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors group ${props.activeConversationId === convo.id ? 'bg-amber-500/20 text-amber-200' : 'hover:bg-white/10 text-white/80'}`}>
                                           
                                           {editingConvoId === convo.id ? (
                                               <div className="flex-1 flex items-center space-x-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                                   <input 
                                                       type="text" 
                                                       value={editTitle} 
                                                       onChange={(e) => setEditTitle(e.target.value)}
                                                       className="flex-1 bg-black/50 border border-amber-500/50 rounded px-2 py-1 text-white text-xs focus:outline-none"
                                                       autoFocus
                                                       onKeyDown={(e) => {
                                                           if(e.key === 'Enter') saveEditing(e);
                                                           if(e.key === 'Escape') cancelEditing(e as any);
                                                       }}
                                                   />
                                                   <button onClick={saveEditing} className="text-green-400 hover:text-green-300"><CheckIcon /></button>
                                                   <button onClick={cancelEditing} className="text-red-400 hover:text-red-300"><CloseIcon className="w-4 h-4" /></button>
                                               </div>
                                           ) : (
                                               <button onClick={() => props.onSelectConversation(convo.id)} className="flex items-center truncate flex-1 space-x-2 text-left">
                                                   {convo.isPinned && <PinIcon filled={true} />}
                                                   <span className="truncate">{convo.title}</span>
                                               </button>
                                           )}

                                           <div className="flex items-center opacity-100 transition-opacity">
                                                {!editingConvoId && (
                                                    <button onClick={(e) => startEditing(convo, e)} className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white ml-1 transition-colors" title="Rename">
                                                        <EditIcon />
                                                    </button>
                                                )}
                                               <button onClick={(e) => { e.stopPropagation(); props.onPinConversation(convo.id); }} className={`p-1 rounded-full hover:bg-white/10 ml-1 transition-opacity ${convo.isPinned ? 'opacity-100' : 'text-white/40 hover:text-white'}`} title={convo.isPinned ? "Unpin" : "Pin"}>
                                                   <PinIcon filled={convo.isPinned} />
                                               </button>
                                               <button onClick={(e) => { e.stopPropagation(); props.onDeleteConversation(convo.id); }} className="p-1 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 ml-1 transition-colors" title="Delete">
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                               </button>
                                           </div>
                                       </div>
                                   ))
                               ) : (
                                   <div className="text-xs text-white/40 text-center py-4 italic">{searchQuery ? 'No matching chats' : 'No recent chats'}</div>
                               )}
                            </div>

                            <div className="border-t border-white/10 my-2"></div>
                            
                            {/* Actions */}
                            <button onClick={props.onNewChat} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"><span>➕</span><span>New Chat</span></button>
                            <button onClick={props.onClearHistory} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"><span>🗑️</span><span>Clear All Chats</span></button>

                             <div className="border-t border-white/10 my-2"></div>

                            {/* Aura Menu */}
                            <div className="w-full text-left">
                                <button onClick={() => setIsAuraOpen(!isAuraOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                                    <div className="flex items-center space-x-3"><SparklesIcon /><span>Aura</span></div>
                                    <ChevronDownIcon className={`transition-transform duration-300 ${isAuraOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isAuraOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="pl-4 space-y-3 pt-2 pb-2">
                                            {(Object.keys(AURA_CONFIG) as AuraState[]).map(aura => {
                                                const config = AURA_CONFIG[aura];
                                                const isPremiumLocked = config.premium && !user?.isPremium;
                                                return (
                                                    <button key={aura} onClick={() => isPremiumLocked ? props.onPremiumClick() : props.onAuraChange(aura)} className="w-full text-left flex items-center justify-between text-sm transition-colors rounded-md p-2 hover:bg-white/10 disabled:opacity-50 text-white/80 hover:text-white" disabled={props.currentAura === aura}>
                                                        <div className="flex items-center space-x-3">
                                                            <span>{config.icon}</span>
                                                            <span>{config.label}</span>
                                                            {isPremiumLocked && <CrownIcon className="h-4 w-4 text-amber-400"/>}
                                                        </div>
                                                        {props.currentAura === aura && <CheckIcon />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Settings Menu */}
                            <div className="w-full text-left">
                                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                                    <div className="flex items-center space-x-3"><SettingsIcon /><span>Settings</span></div>
                                    <ChevronDownIcon className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isSettingsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="pl-4 space-y-4 pt-2 pb-2">
                                            
                                            {/* Intensity */}
                                            <div>
                                                <div className="text-xs text-white/50 px-2 mb-2 font-semibold">Effect Intensity</div>
                                                <div className="bg-white/5 p-1 rounded-lg flex items-center justify-between text-xs">
                                                    {(['Low', 'Medium', 'High'] as AuraIntensity[]).map(level => (
                                                        <button key={level} onClick={() => props.onIntensityChange(level)} className={`px-3 py-1 rounded-md transition-colors ${props.intensity === level ? 'bg-amber-500/30 text-amber-200' : 'text-white/70 hover:bg-white/10'}`}>{level}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Voice Selection */}
                                            <div>
                                                <div className="text-xs text-white/50 px-2 mb-2 font-semibold">Voice Selection</div>
                                                <div className="flex flex-col gap-1 bg-white/5 p-1 rounded-lg max-h-40 overflow-y-auto no-scrollbar">
                                                    {VOICE_OPTIONS.map(voice => {
                                                        const isSelected = user?.preferences?.voice === voice;
                                                        return (
                                                            <div 
                                                                key={voice} 
                                                                className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors ${isSelected ? 'text-black' : 'hover:bg-white/10 text-white/80'}`}
                                                                style={isSelected ? { backgroundColor: 'var(--primary-amber)' } : undefined}
                                                            >
                                                                <button 
                                                                    onClick={() => props.onVoiceChange(voice)} 
                                                                    className="flex-1 text-left text-xs font-medium"
                                                                >
                                                                    {voice}
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => playVoicePreview(voice, e)}
                                                                    className={`p-1 rounded-full ${isSelected ? 'text-black hover:bg-black/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                                                                    title="Preview Voice"
                                                                >
                                                                    <PlayIcon />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Reduce Motion */}
                                            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                 <label htmlFor="reduceMotion" className="text-sm text-white/80">Reduce Motion</label>
                                                 <button onClick={() => props.onReduceMotionChange(!props.reduceMotion)} className={`relative w-10 h-5 rounded-full transition-colors ${props.reduceMotion ? 'bg-primary-amber' : 'bg-slate-700'}`}>
                                                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${props.reduceMotion ? 'translate-x-5' : ''}`}></span>
                                                 </button>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="border-t border-white/10 my-2"></div>
                             
                             {/* Other Actions */}
                             <button onClick={props.onTriggerImpact} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"><ImpactIcon/><span>Trigger Impact</span></button>
                             {user?.isPremium ? (
                                <button onClick={props.onPremiumClick} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors text-amber-400">
                                    <CrownIcon className="w-5 h-5"/>
                                    <span>PRO Plan Active</span>
                                </button>
                             ) : (
                                <button onClick={props.onPremiumClick} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-200 border border-amber-500/30 hover:border-amber-500/50">
                                    <CrownIcon className="w-5 h-5"/>
                                    <span>Subscribe to PRO</span>
                                </button>
                             )}
                             
                             <button onClick={props.onContactClick} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"><ContactIcon/><span>Contact Us</span></button>
                             <button onClick={props.onAboutClick} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"><InfoIcon /><span>About</span></button>
                             <button onClick={props.onLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 font-semibold transition-colors">
                                 Log out
                             </button>

                        </div>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
            `}</style>
        </header>
    );
};

export default Header;
