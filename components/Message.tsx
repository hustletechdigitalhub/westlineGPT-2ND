
import React, { useState, useRef } from 'react';
import { Message, VoiceOption } from '../types';
import FeedbackCelebration from './FeedbackCelebration';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
    message: Message;
    onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
    voice?: VoiceOption;
}

const CopyIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const ShareIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>);
const LikeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.563 8H12V4a2 2 0 00-2-2c-1.11 0-2 1.119-2 2.5V9.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 00-.293.707z" /></svg>);
const DislikeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.058 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.438 12H8v4a2 2 0 002 2c1.11 0 2-1.119 2-2.5V10.414a1 1 0 01.293-.707l2.414-2.414a1 1 0 00.293.707z" /></svg>);
const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button onClick={onClick} aria-label={ariaLabel}
        className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
        {children}
    </button>
);

const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
    </div>
);


const MessageComponent: React.FC<MessageProps> = ({ message, onFeedback, voice = 'Puck' }) => {
    const isBot = message.sender === 'bot';
    const [isCopied, setIsCopied] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Cache the audio buffer locally so re-playing is instant
    const audioCacheRef = useRef<AudioBuffer | undefined>(undefined);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'WestlineGPT Response', text: message.text, })
            .catch(error => console.log('Error sharing:', error));
        } else {
            handleCopy();
            alert('Share feature not supported in your browser. Content copied to clipboard.');
        }
    };

    const handleLikeClick = () => {
        if (message.feedback !== 'like') {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
        }
        onFeedback(message.id, 'like');
    };
    
    const handlePlayAudio = async () => {
        // Stop logic: If already playing, stop and reset state.
        if (isPlaying) {
            geminiService.stopAudio();
            setIsPlaying(false);
            return;
        }

        // Play logic
        if (!message.text) return;
        
        setIsPlaying(true);
        
        // Use cached buffer if available for instant playback
        const buffer = await geminiService.generateSpeech(
            message.text, 
            voice as VoiceOption, 
            audioCacheRef.current, 
            () => setIsPlaying(false) // On ended callback
        );
        
        if (buffer) {
            audioCacheRef.current = buffer;
        } else {
            // If fetching failed
            setIsPlaying(false);
        }
    };

    if (!isBot) {
        return (
            <div className="flex items-start gap-3 my-6 justify-end">
                <div className="max-w-[85%] lg:max-w-2xl px-6 py-5 rounded-2xl glass-pane rounded-br-none shadow-sm" style={{'--glass-bg': 'rgba(228, 158, 16, 0.2)', '--glass-border': 'rgba(228, 158, 16, 0.3)'} as React.CSSProperties}>
                    <p className="text-sm whitespace-pre-wrap font-light text-slate-100">{message.text}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex my-6 justify-start">
             <div className="flex flex-col w-full max-w-[90%] lg:max-w-3xl">
                <div className="px-6 py-5 rounded-2xl glass-pane rounded-tl-none shadow-sm" style={{'--glass-bg': 'rgba(79, 70, 229, 0.1)', '--glass-border': 'rgba(79, 70, 229, 0.2)'} as React.CSSProperties}>
                    {!message.isFinal && message.text.length === 0 ? (
                        <ThinkingIndicator />
                    ) : (
                        <>
                            {message.text && (
                                <div className="text-sm font-light text-slate-200 markdown-content">
                                    <ReactMarkdown
                                        components={{
                                            p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                                            ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                                            ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>,
                                            li: ({children}) => <li className="mb-1 leading-relaxed pl-1">{children}</li>,
                                            h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-primary-amber mt-2 border-b border-white/10 pb-2">{children}</h1>,
                                            h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-primary-amber mt-4">{children}</h2>,
                                            h3: ({children}) => <h3 className="text-md font-semibold mb-3 text-indigo-300 mt-3">{children}</h3>,
                                            strong: ({children}) => <strong className="font-bold text-primary-amber">{children}</strong>,
                                            em: ({children}) => <em className="italic text-slate-300">{children}</em>,
                                            blockquote: ({children}) => <blockquote className="border-l-4 border-amber-500/50 pl-4 italic my-4 text-slate-400 bg-black/20 py-3 pr-2 rounded-r-lg">{children}</blockquote>,
                                            code: ({children, inline, className}) => {
                                                if (inline) {
                                                    return <code className="bg-black/30 rounded px-1.5 py-0.5 text-xs font-mono text-amber-200 border border-white/5">{children}</code>;
                                                }
                                                return (
                                                    <div className="bg-[#1e1e1e] rounded-lg p-4 my-4 overflow-x-auto border border-white/10 shadow-inner">
                                                        <code className="text-xs font-mono block leading-relaxed" style={{ color: '#d1d5db' }}>{String(children)}</code>
                                                    </div>
                                                );
                                            },
                                            a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 hover:underline transition-colors">{children}</a>,
                                            hr: () => <hr className="border-white/10 my-6" />
                                        }}
                                    >
                                        {String(message.text || "")}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {message.image && (
                                <div className={`mt-4 ${!message.text ? 'mt-0' : ''}`}>
                                    <img 
                                        src={message.image.data} 
                                        alt="WestlineGPT Generated Content" 
                                        className="rounded-lg max-w-sm h-auto bg-black/20 p-1 ring-1 ring-white/10 shadow-lg"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {message.isFinal && (
                    <div className="flex items-center space-x-2 mt-2 px-1">
                         <ActionButton onClick={handlePlayAudio} aria-label={isPlaying ? "Stop audio" : "Play audio"}>
                            {isPlaying ? (
                                <PauseIcon className="text-amber-400" />
                            ) : (
                                <SpeakerIcon className="" />
                            )}
                        </ActionButton>
                        <ActionButton onClick={handleCopy} aria-label="Copy message">
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </ActionButton>
                        {navigator.share && (
                            <ActionButton onClick={handleShare} aria-label="Share message">
                                <ShareIcon />
                            </ActionButton>
                        )}
                        <div className="relative">
                            <ActionButton onClick={handleLikeClick} aria-label="Like response">
                                <LikeIcon className={message.feedback === 'like' ? 'text-amber-400' : 'text-slate-400'}/>
                            </ActionButton>
                            <FeedbackCelebration show={showCelebration} />
                        </div>
                        <ActionButton onClick={() => onFeedback(message.id, 'dislike')} aria-label="Dislike response">
                            <DislikeIcon className={message.feedback === 'dislike' ? 'text-amber-400' : 'text-slate-400'}/>
                        </ActionButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageComponent;
