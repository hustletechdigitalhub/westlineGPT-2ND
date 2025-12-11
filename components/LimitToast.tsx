
import React, { useEffect } from 'react';

interface LimitToastProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    renewalTime: string;
    actionType: 'Generate' | 'Edit';
}

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>);

const LimitToast: React.FC<LimitToastProps> = ({ isOpen, onClose, onUpgrade, renewalTime, actionType }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => onClose(), 8000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md p-2 z-50">
            <div className="animate-toast bg-[#1a1a1a] border border-red-500/30 rounded-2xl shadow-2xl p-4 flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <ClockIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-100">{actionType} Limit Reached</h4>
                        <p className="text-xs text-red-200/70">Resets exactly at <span className="font-mono font-bold text-red-100">{renewalTime}</span></p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Need more?</span>
                    <button 
                        onClick={onUpgrade}
                        className="text-xs font-bold text-primary-amber hover:text-amber-300 transition-colors flex items-center space-x-1"
                    >
                        <span>Upgrade for Unlimited</span>
                        <span>&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitToast;
