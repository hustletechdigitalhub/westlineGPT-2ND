
import React, { useState, useRef, useEffect } from 'react';
import { Message, AuraState, AuraSuggestion, AuraSyncSuggestion, LearningLevel } from '../types';
import MessageComponent from './Message';
import QuickButtons from './QuickButtons';
import BouncingLogo from './BouncingLogo';
import { geminiService } from '../services/geminiService';
import AuraSuggestionToast from './AuraSuggestionToast';
import AuraSyncModal from './AuraSyncModal';

interface ChatWindowProps {
    currentAura: AuraState;
    isPremiumUser: boolean;
    learningLevel: LearningLevel;
    onAuraSuggestion: (suggestion: AuraSuggestion) => void;
    triggerScreenCrack: () => void;
}

const INITIAL_QUICK_PROMPTS = [
    'Suggest a creative project for social media',
    'What are some good color palettes for a tech brand?',
    'Explain what a motion graphic is',
    'How can I monetize my design skills?',
];

const ChatWindow: React.FC<ChatWindowProps> = ({ currentAura, isPremiumUser, learningLevel, onAuraSuggestion, triggerScreenCrack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [auraSyncSuggestion, setAuraSyncSuggestion] = useState<AuraSyncSuggestion | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);
    
    const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m));
        if(feedback === 'dislike') {
            triggerScreenCrack();
        }
    };

    const handleSend = async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: prompt, sender: 'user', isFinal: true, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Check for Aura Suggestion
        const suggestion = geminiService.analyzeForAuraSuggestion(prompt, currentAura);
        if (suggestion) {
            onAuraSuggestion(suggestion);
        }

        // Check for Aura Sync
        if (currentAura !== 'Off' && isPremiumUser) {
            const syncSuggestion = await geminiService.getAuraSyncSuggestion(prompt, currentAura);
            if (syncSuggestion) {
                setAuraSyncSuggestion(syncSuggestion);
                setIsLoading(false); // Stop loading to let user decide
                return;
            }
        }
        
        await processRequest(prompt);
    };
    
    const processRequest = async (prompt: string) => {
        setIsLoading(true);
        const botMessageId = (Date.now() + 1).toString();
        let botMessage: Message = { id: botMessageId, text: '', sender: 'bot', isFinal: false, timestamp: Date.now() };
        setMessages(prev => [...prev, botMessage]);

        const history = messages.map(m => ({
            // FIX: Cast role to the correct type to resolve TS error
            role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: m.text }]
        }));

        try {
            const stream = geminiService.streamResponse(prompt, history, currentAura, isPremiumUser, learningLevel);
            for await (const chunk of stream) {
                setMessages(prev =>
                    prev.map(m => (m.id === botMessageId ? { ...m, text: m.text + chunk } : m))
                );
            }
        } catch (error) {
            console.error(error);
             setMessages(prev =>
                prev.map(m => (m.id === botMessageId ? { ...m, text: "Sorry, something went wrong." } : m))
            );
        } finally {
            setIsLoading(false);
            setMessages(prev =>
                prev.map(m => (m.id === botMessageId ? { ...m, isFinal: true } : m))
            );
        }
    };
    
    const handleAuraSyncConfirm = (enhancedPrompt: string) => {
        // Remove the original user message
        setMessages(prev => prev.slice(0, -1));
        setAuraSyncSuggestion(null);
        // Add new user message with enhanced prompt and process it
        const userMessage: Message = { id: Date.now().toString(), text: enhancedPrompt, sender: 'user', isFinal: true, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        processRequest(enhancedPrompt);
    };

    const handleAuraSyncClose = () => {
        // If user cancels, proceed with the original prompt
        const originalPrompt = auraSyncSuggestion?.original;
        setAuraSyncSuggestion(null);
        if (originalPrompt) {
            processRequest(originalPrompt);
        }
    };
    
    const handleQuickButtonClick = (text: string) => {
        setInput(text);
        textareaRef.current?.focus();
    };


    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
                {messages.map(msg => (
                    <MessageComponent key={msg.id} message={msg} onFeedback={handleFeedback} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 my-4 justify-start animate-fade-in-up">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(228,158,16,0.2)]">
                            <BouncingLogo />
                        </div>
                        {/* Bubble */}
                        <div className="flex flex-col">
                            <div className="px-6 py-4 rounded-2xl rounded-tl-none glass-pane relative overflow-hidden group" style={{'--glass-border': 'rgba(228, 158, 16, 0.3)', background: 'linear-gradient(135deg, rgba(20,20,25,0.8), rgba(40,40,45,0.4))'} as React.CSSProperties}>
                                 {/* Shimmer overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

                                <div className="flex items-center space-x-4 relative z-10">
                                    {/* Neural Wave Animation */}
                                    <div className="flex items-center space-x-1 h-8">
                                        <div className="w-1.5 bg-amber-500/80 rounded-full animate-wave [animation-delay:-0.4s]"></div>
                                        <div className="w-1.5 bg-amber-400/90 rounded-full animate-wave [animation-delay:-0.2s]"></div>
                                        <div className="w-1.5 bg-amber-300 rounded-full animate-wave [animation-delay:0s]"></div>
                                        <div className="w-1.5 bg-amber-400/90 rounded-full animate-wave [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 bg-amber-500/80 rounded-full animate-wave [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-sm font-light text-amber-100/80 tracking-widest uppercase text-xs">Processing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="w-full max-w-4xl mx-auto p-4 pt-0">
                {messages.length === 0 && !isLoading && (
                    <QuickButtons prompts={INITIAL_QUICK_PROMPTS} onQuickButtonClick={handleQuickButtonClick} />
                )}
                <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-2 flex items-end space-x-2 neural-glow-subtle focus-within:neural-glow-amber">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(input);
                            }
                        }}
                        placeholder="Ask me anything about creative tech..."
                        className="flex-1 bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none resize-none max-h-48 p-2 text-sm font-light"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={isLoading || !input.trim()}
                        className="w-9 h-9 flex items-center justify-center bg-primary-amber rounded-xl text-black transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-110"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </div>
            <AuraSyncModal isOpen={!!auraSyncSuggestion} onClose={handleAuraSyncClose} onConfirm={handleAuraSyncConfirm} suggestion={auraSyncSuggestion} />
        </div>
    );
};

export default ChatWindow;
