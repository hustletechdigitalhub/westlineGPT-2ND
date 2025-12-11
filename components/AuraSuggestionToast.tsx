import React, { useEffect } from 'react';
import { AuraSuggestion } from '../types';

interface AuraSuggestionToastProps {
    suggestion: AuraSuggestion | null;
    onAccept: () => void;
    onDismiss: () => void;
    isPremiumUser: boolean;
}

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M11.05 3.05a.75.75 0 00-1.05-.001l-1.95 1.95a.75.75 0 00.526 1.282h3.9a.75.75 0 00.526-1.282l-1.95-1.95z" /><path fillRule="evenodd" d="M10 2a.75.75 0 01.673.418l1.95 3.9a.75.75 0 01-.526 1.032H7.903a.75.75 0 01-.526-1.032l1.95-3.9A.75.75 0 0110 2zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zM5.106 12.394a.75.75 0 01.002 1.06l-1.15 1.152a.75.75 0 01-1.28-.53V12.75a.75.75 0 01.75-.75h1.678a.75.75 0 01.528.224z" clipRule="evenodd" /><path d="M14.894 12.394a.75.75 0 01.528-.224h1.678a.75.75 0 01.75.75v1.327a.75.75 0 01-1.28.53l-1.15-1.152a.75.75 0 01.002-1.06z" /></svg>);

const AuraSuggestionToast: React.FC<AuraSuggestionToastProps> = ({ suggestion, onAccept, onDismiss, isPremiumUser }) => {
    useEffect(() => {
        if (suggestion) {
            const timer = setTimeout(() => onDismiss(), 8000);
            return () => clearTimeout(timer);
        }
    }, [suggestion, onDismiss]);

    if (!suggestion) return null;

    const showPremiumIndicator = suggestion.isPremium && !isPremiumUser;

    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg p-2 z-40">
            <div className="animate-toast bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 flex items-center justify-between space-x-4">
                <div className="flex-shrink-0 text-xl">💡</div>
                <div className="flex-grow text-sm text-slate-200 font-light">
                    <p>
                        {suggestion.reason}{' '}
                        <span className="font-semibold text-primary-amber">
                            Try the {suggestion.aura} Aura?
                        </span>
                        {showPremiumIndicator && (
                           <span className="inline-flex items-center space-x-1 ml-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full align-middle">
                               <CrownIcon className="h-3 w-3" />
                               <span>Premium</span>
                           </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                        onClick={onAccept}
                        className="px-3 py-1 text-xs font-semibold bg-primary-amber text-black rounded-lg hover:bg-amber-400 transition-colors"
                    >
                        {showPremiumIndicator ? 'Unlock' : 'Switch'}
                    </button>
                    <button onClick={onDismiss} className="p-1 text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuraSuggestionToast;
