
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { ImageState } from '../types';
import { galleryService } from '../services/galleryService';
import { authService } from '../services/authService';

interface ImageGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageGenerated: (image: ImageState) => void;
    isPremiumUser: boolean;
    usageCount: number;
    onUpgrade: () => void;
}

const CREATIVE_PROMPTS = [
    "A cyberpunk street food vendor in Tokyo, neon lights reflecting on wet pavement, cinematic lighting",
    "A cozy library inside a giant hollow tree, warm lighting, fantasy style, digital art",
    "An astronaut floating in a nebula made of colorful candy, surrealism, high detail",
    "A futuristic eco-city with vertical gardens and solar glass, architectural visualization, 4k",
    "Portrait of a mechanical owl with gears visible, steampunk aesthetic, intricate details",
    "A calm zen garden on Mars, terraformed bubble, red dust outside, lush green inside"
];

const LOADING_PHRASES = [
    "Weaving pixels...",
    "Consulting the Muse...",
    "Dreaming in digital...",
    "Painting with light...",
    "Constructing reality...",
    "Igniting the creative spark..."
];

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const DownloadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const ShareIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>);
const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-amber-500 fill-amber-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>);
const DiceIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>);
const MagicWandIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);
const SettingsIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>);
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M11.05 3.05a.75.75 0 00-1.05-.001l-1.95 1.95a.75.75 0 00.526 1.282h3.9a.75.75 0 00.526-1.282l-1.95-1.95z" /><path fillRule="evenodd" d="M10 2a.75.75 0 01.673.418l1.95 3.9a.75.75 0 01-.526 1.032H7.903a.75.75 0 01-.526-1.032l1.95-3.9A.75.75 0 0110 2zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zM5.106 12.394a.75.75 0 01.002 1.06l-1.15 1.152a.75.75 0 01-1.28-.53V12.75a.75.75 0 01.75-.75h1.678a.75.75 0 01.528.224z" clipRule="evenodd" /><path d="M14.894 12.394a.75.75 0 01.528-.224h1.678a.75.75 0 01.75.75v1.327a.75.75 0 01-1.28.53l-1.15-1.152a.75.75 0 01.002-1.06z" /></svg>);


const WestlineLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
        <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
        <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="var(--brand-indigo)"/>
    </svg>
);


const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ isOpen, onClose, onImageGenerated, isPremiumUser, usageCount, onUpgrade }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<ImageState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    
    // Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [quality, setQuality] = useState('Standard');
    const settingsRef = useRef<HTMLDivElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

    const FREE_LIMIT = 6;
    const isLimitReached = !isPremiumUser && usageCount >= FREE_LIMIT;

    useEffect(() => {
        if (isOpen) {
            setPrompt(CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)]);
            setGeneratedImage(null);
            setError(null);
            setIsLiked(false);
            setAspectRatio('1:1');
            setQuality('Standard');
            setIsSettingsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingTextIndex(prev => (prev + 1) % LOADING_PHRASES.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSettingsOpen &&
                settingsRef.current &&
                !settingsRef.current.contains(event.target as Node) &&
                settingsButtonRef.current &&
                !settingsButtonRef.current.contains(event.target as Node)
            ) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

    const handleGenerate = async () => {
        // Parent App.tsx handles logic for checking/incrementing limit before calling this via handler
        // But we check here for UI state disabling
        if (isLimitReached) {
            onUpgrade();
            return;
        }
        if (!prompt.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setIsLiked(false);
        setIsSettingsOpen(false);

        let finalPrompt = prompt;
        if (quality === 'HD') finalPrompt += ", high detail, high resolution";
        if (quality === 'Ultra') finalPrompt += ", 4k, ultra detailed, hyper realistic, masterpiece";

        const result = await geminiService.generateImage(finalPrompt, aspectRatio);
        
        setIsLoading(false);
        
        if (result) {
            const finalImage = {
                data: `data:${result.mimeType};base64,${result.data}`,
                mimeType: result.mimeType
            };
            setGeneratedImage(finalImage);

            // AUTO-SAVE to Gallery
            const user = authService.getCurrentUser();
            if (user) {
                galleryService.saveToGallery(user.email, {
                    id: Date.now().toString(),
                    data: finalImage.data,
                    mimeType: finalImage.mimeType,
                    prompt: prompt, // Save original prompt
                    timestamp: Date.now()
                });
            }

        } else {
            setError("Failed to generate image. Please try a different prompt.");
        }
    };

    const handleUseImage = () => {
        if (generatedImage) {
            onImageGenerated(generatedImage);
            onClose();
        }
    };
    
    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage.data;
            link.download = `westline-creation-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleShare = async () => {
        if (generatedImage) {
            if (navigator.share) {
                try {
                    const res = await fetch(generatedImage.data);
                    const blob = await res.blob();
                    const file = new File([blob], 'westline-creation.png', { type: 'image/png' });
                    await navigator.share({
                        title: 'My AI Creation',
                        text: `Check out this image I created with WestlineGPT! Prompt: "${prompt}"`,
                        files: [file]
                    });
                } catch (e) {
                    console.error("Share failed", e);
                }
            } else {
                 alert("Sharing is not supported on this device. Image copied to clipboard logic would go here.");
            }
        }
    };

    const randomizePrompt = () => {
        const currentIdx = CREATIVE_PROMPTS.indexOf(prompt);
        let nextIdx = Math.floor(Math.random() * CREATIVE_PROMPTS.length);
        while (nextIdx === currentIdx) {
            nextIdx = Math.floor(Math.random() * CREATIVE_PROMPTS.length);
        }
        setPrompt(CREATIVE_PROMPTS[nextIdx]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
            <div 
                className="bg-[#0A0A0A] border-t border-x md:border border-white/5 rounded-t-3xl md:rounded-3xl shadow-[0_0_50px_rgba(228,158,16,0.15)] w-full max-w-4xl h-[92vh] md:h-[85vh] flex flex-col relative overflow-hidden transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 shrink-0">
                    <div className="flex items-center space-x-3">
                         <div className="p-1.5 md:p-2 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-xl border border-white/5">
                            <SparklesIcon className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white tracking-wide">
                                AI STUDIO
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-light tracking-widest uppercase">
                                {isPremiumUser ? 'Unlimited Access' : `Free Generations: ${usageCount}/${FREE_LIMIT}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <CloseIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-black/50 to-[#050505] overflow-hidden p-4">
                    
                    {generatedImage ? (
                        <div className="relative w-full h-full flex items-center justify-center animate-fade-in-up">
                            <img 
                                src={generatedImage.data} 
                                alt="Generated" 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10" 
                            />
                            
                             {/* Floating Action Bar */}
                            <div className="absolute bottom-4 md:bottom-6 flex items-center space-x-2 md:space-x-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-xl z-20 overflow-x-auto max-w-full">
                                <button onClick={handleDownload} className="p-1 text-slate-300 hover:text-white transition-colors" title="Download">
                                    <DownloadIcon />
                                </button>
                                <button onClick={handleShare} className="p-1 text-slate-300 hover:text-white transition-colors" title="Share">
                                    <ShareIcon />
                                </button>
                                <button onClick={() => setIsLiked(!isLiked)} className="p-1 transition-transform active:scale-90" title="Like">
                                    <HeartIcon filled={isLiked} />
                                </button>
                                <div className="w-px h-4 md:h-6 bg-white/20 mx-1 md:mx-2"></div>
                                <button 
                                    onClick={handleUseImage}
                                    className="text-xs md:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 md:space-x-2 whitespace-nowrap"
                                >
                                    <span>Edit</span>
                                    <MagicWandIcon />
                                </button>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-8">
                                <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Rotating Steam Effect */}
                                    <div className="absolute w-full h-full rounded-full border-2 border-transparent border-t-amber-500/50 animate-spin opacity-50"></div>
                                    <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-transparent border-b-purple-500/50 animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
                                </div>
                                <WestlineLogo className="w-full h-full animate-spin-slow relative z-10 drop-shadow-[0_0_15px_rgba(228,158,16,0.5)]" />
                            </div>
                            <p className="text-base md:text-xl font-light text-slate-200 tracking-widest uppercase animate-pulse text-glow text-center">
                                {LOADING_PHRASES[loadingTextIndex]}
                            </p>
                            <p className="text-[10px] md:text-xs text-slate-500 mt-2 font-mono">Processing Request...</p>
                        </div>
                    ) : (
                         <div className="text-center max-w-md opacity-50 px-4">
                            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                                <SparklesIcon className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
                            </div>
                            <p className="text-sm md:text-base text-slate-400">Enter a prompt below to start dreaming.</p>
                        </div>
                    )}
                    
                     {error && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-xs md:text-sm text-center w-max max-w-full">
                            {error}
                        </div>
                    )}
                </div>

                {/* Input Area (Fixed at Bottom) */}
                <div className="p-4 md:p-6 bg-[#0A0A0A] border-t border-white/5 z-10 shrink-0 pb-6 md:pb-6">
                    <div className="relative flex items-center space-x-2 md:space-x-3">
                         <div className="relative flex-1 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative flex items-center bg-[#111] rounded-xl overflow-visible border border-white/10 focus-within:border-amber-500/50 transition-colors z-20">
                                <div className="relative">
                                    <button 
                                        ref={settingsButtonRef}
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className={`p-3 md:p-4 text-slate-500 transition-colors border-r border-white/5 ${isSettingsOpen ? 'text-amber-400 bg-white/5' : 'hover:text-amber-400'}`}
                                        title="Image Settings"
                                        disabled={isLoading}
                                    >
                                        <SettingsIcon />
                                    </button>
                                    
                                    {isSettingsOpen && (
                                        <div 
                                            ref={settingsRef}
                                            className="absolute bottom-full left-0 mb-3 w-56 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 origin-bottom-left animate-fade-in-up z-50"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                                            <button
                                                                key={ratio}
                                                                onClick={() => setAspectRatio(ratio)}
                                                                className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${aspectRatio === ratio ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                            >
                                                                {ratio}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Output Quality</label>
                                                    <div className="flex flex-col space-y-1">
                                                        {['Standard', 'HD', 'Ultra'].map(q => (
                                                            <button
                                                                key={q}
                                                                onClick={() => setQuality(q)}
                                                                className={`px-3 py-2 rounded-lg text-xs text-left transition-colors ${quality === q ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'}`}
                                                            >
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    placeholder={isLimitReached ? "Upgrade to create..." : "Describe your imagination..."}
                                    className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-600 px-3 py-3 md:px-4 md:py-4 text-sm md:text-base focus:outline-none focus:ring-0"
                                    disabled={isLoading || isLimitReached}
                                />
                                <button 
                                    onClick={randomizePrompt}
                                    className="p-2 md:p-3 text-slate-500 hover:text-amber-400 transition-colors border-l border-white/5"
                                    title="Random Prompt"
                                    disabled={isLoading || isLimitReached}
                                >
                                    <DiceIcon />
                                </button>
                            </div>
                         </div>
                        <button 
                            onClick={generatedImage ? () => setGeneratedImage(null) : handleGenerate}
                            disabled={(!prompt.trim() && !generatedImage && !isLimitReached) || isLoading}
                            className={`px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold tracking-wide text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${generatedImage 
                                ? 'bg-slate-800 text-white hover:bg-slate-700'
                                : isLimitReached 
                                    ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg' 
                                    : 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none whitespace-nowrap`}
                        >
                            {generatedImage ? 'New' : isLoading ? '...' : isLimitReached ? (
                                <span className="flex items-center space-x-1"><CrownIcon className="w-4 h-4"/><span>Upgrade</span></span>
                            ) : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationModal;
