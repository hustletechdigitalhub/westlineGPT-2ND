import React from 'react';
import { AuraSyncSuggestion } from '../types';

interface AuraSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (enhancedPrompt: string) => void;
    suggestion: AuraSyncSuggestion | null;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

const AuraSyncModal: React.FC<AuraSyncModalProps> = ({ isOpen, onClose, onConfirm, suggestion }) => {
    if (!isOpen || !suggestion) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity" onClick={onClose}>
            <div 
                className="bg-black/50 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="h-6 w-6"/>
                </button>
                
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 mb-2" style={{ textShadow: '0 2px 20px #E49E10' }}>
                    AURA SYNC
                </h2>
                <p className="text-center text-slate-300 mb-6 font-light">Enhancing Your Creative Spark...</p>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-400 text-sm mb-2">YOUR PROMPT</h3>
                        <p className="bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 font-light text-sm">
                            {suggestion.original}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary-amber text-sm mb-2">ENHANCED PROMPT</h3>
                         <p className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-100 font-light text-sm whitespace-pre-wrap">
                           {suggestion.enhanced}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-8">
                    <button onClick={onClose}
                        className="bg-transparent border border-slate-600 text-slate-300 font-bold rounded-xl py-2.5 px-6 hover:bg-slate-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-black focus:ring-slate-500"
                    >
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(suggestion.enhanced)}
                        className="bg-primary-amber text-black font-bold rounded-xl py-2.5 px-6 hover:bg-amber-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-black focus:ring-amber-500 transform hover:scale-105 neural-glow-static"
                    >
                        Send to WestlineGPT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuraSyncModal;