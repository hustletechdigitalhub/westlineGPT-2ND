
import React, { useState } from 'react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: (code: string) => boolean;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>);
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>);

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUnlock }) => {
    const [view, setView] = useState<'plans' | 'code'>('plans');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleUnlockClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            const success = onUnlock(accessCode);
            setIsLoading(false);
            if (success) {
                setAccessCode('');
                setError('');
                setView('plans');
            } else {
                setError('Invalid access code. Please try again.');
            }
        }, 1000);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setAccessCode(e.target.value);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity" onClick={onClose}>
            <div className={`rounded-2xl w-full ${view === 'plans' ? 'max-w-4xl' : 'max-w-md'} relative transform transition-all duration-300`}
                onClick={(e) => e.stopPropagation()}>
                
                {view === 'plans' ? (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute -top-12 right-0 md:-right-8 text-slate-400 hover:text-white transition-colors">
                            <CloseIcon className="h-8 w-8"/>
                        </button>

                        {/* Basic Plan */}
                        <div className="flex-1 bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-200 mb-2">Basic</h3>
                            <div className="text-3xl font-bold text-white mb-6">Free</div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start space-x-3 text-slate-300 text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-slate-500 shrink-0" />
                                    <span>6 Image Gens & Edits / 6hrs</span>
                                </li>
                                <li className="flex items-start space-x-3 text-slate-300 text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-slate-500 shrink-0" />
                                    <span>Basic Levels (Beginner)</span>
                                </li>
                                <li className="flex items-start space-x-3 text-slate-300 text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-slate-500 shrink-0" />
                                    <span>Standard Chat Support</span>
                                </li>
                                <li className="flex items-start space-x-3 text-slate-500 text-sm">
                                    <LockIcon className="h-5 w-5 shrink-0" />
                                    <span>Advanced Levels Locked</span>
                                </li>
                                <li className="flex items-start space-x-3 text-slate-500 text-sm">
                                    <LockIcon className="h-5 w-5 shrink-0" />
                                    <span>Premium Auras Locked</span>
                                </li>
                            </ul>
                            <button disabled className="w-full py-3 rounded-xl border border-white/10 text-slate-400 font-semibold cursor-default">
                                Current Plan
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="flex-1 bg-gradient-to-br from-slate-900 to-black border border-amber-500/50 rounded-2xl p-6 md:p-8 flex flex-col relative shadow-[0_0_40px_rgba(228,158,16,0.15)] transform scale-105 z-10">
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">RECOMMENDED</div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2">Pro</h3>
                            <div className="text-3xl font-bold text-white mb-6">Premium</div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start space-x-3 text-white text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-amber-400 shrink-0" />
                                    <span>Unlimited Image Generation</span>
                                </li>
                                <li className="flex items-start space-x-3 text-white text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-amber-400 shrink-0" />
                                    <span>Unlock All Levels & Mentor Mode</span>
                                </li>
                                <li className="flex items-start space-x-3 text-white text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-amber-400 shrink-0" />
                                    <span>All Auras (Fire, Lava, Neon)</span>
                                </li>
                                <li className="flex items-start space-x-3 text-white text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-amber-400 shrink-0" />
                                    <span>Priority Mentor Access</span>
                                </li>
                                 <li className="flex items-start space-x-3 text-white text-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-amber-400 shrink-0" />
                                    <span>Advanced AI Tools</span>
                                </li>
                            </ul>
                            <button 
                                onClick={() => setView('code')}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-1"
                            >
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Unlock Pro Access</h2>
                            <p className="text-slate-400 text-sm">Enter your access code to activate your premium subscription.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showCode ? "text" : "password"}
                                    value={accessCode} 
                                    onChange={handleInputChange}
                                    placeholder="Enter Access Code"
                                    className="w-full text-center bg-black/50 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowCode(!showCode)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                                >
                                    {showCode ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center animate-shake">{error}</p>}
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setView('plans')}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleUnlockClick}
                                    disabled={!accessCode || isLoading}
                                    className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Activating...' : 'Activate'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                             <a href="#" className="text-xs text-slate-500 hover:text-amber-400 underline">Where do I get a code?</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumModal;
