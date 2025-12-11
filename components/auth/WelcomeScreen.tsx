
import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import { AuthState } from '../../types';

interface WelcomeScreenProps {
    onNavigate: (screen: Extract<AuthState, 'login' | 'signup'>) => void;
    onSocialLogin: (provider: 'Google') => void;
}

const SparkleIcon: React.FC = () => (
    <div className="relative w-20 h-20 md:w-24 md:h-24">
        <div className="absolute inset-0 bg-[#E49E10] rounded-full opacity-70 blur-xl animate-pulse"></div>
        <div className="absolute inset-2 bg-slate-800 rounded-full"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-white animate-pulse">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.75.75l.044 1.546a.75.75 0 01-1.498.06l-.044-1.546A.75.75 0 019 4.5zM12.75 7.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM15 15a.75.75 0 01.75-.75l1.546.044a.75.75 0 01.06 1.498l-1.546-.044A.75.75 0 0115 15zM16.5 9a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM19.03 12.97a.75.75 0 00-1.06-1.06l-1.062 1.061a.75.75 0 001.06 1.06l1.062-1.061zM12 12a.75.75 0 01-.75-.75V9a.75.75 0 011.5 0v2.25A.75.75 0 0112 12zM12.97 4.97a.75.75 0 001.06 1.06l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06zM7.5 12.75a.75.75 0 00-1.5 0h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 001.5 0zM4.97 19.03a.75.75 0 001.06-1.06l-1.06-1.062a.75.75 0 00-1.06 1.06l1.06 1.062z" clipRule="evenodd" />
        </svg>
    </div>
);

const SENTENCES = [
    "Welcome to WestlineGPT.",
    "Your creative intelligence begins here.",
    "Learn. Create. Earn — The Smart Way.",
    "Powered by Westline Techlabs."
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const i = loopNum % SENTENCES.length;
            const fullText = SENTENCES[i];

            setText(isDeleting 
                ? fullText.substring(0, text.length - 1) 
                : fullText.substring(0, text.length + 1)
            );
            
            // INCREASED VIBRATION DURATION
            // Short bursts (20-30ms) are much more perceptible than 3-5ms
            if (navigator.vibrate) {
                // If text changed
                navigator.vibrate(isDeleting ? 15 : 25);
            }

            // Typing Speed Logic
            setTypingSpeed(isDeleting ? 30 : 50 + Math.random() * 50);

            if (!isDeleting && text === fullText) {
                // Finished sentence, pause before deleting
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                // Finished deleting, move to next sentence
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center text-center">
                 <div className="animate-float mb-6 md:mb-8">
                    <SparkleIcon />
                </div>

                {/* Animated Typewriter Header */}
                <div className="h-24 md:h-28 flex items-center justify-center mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-accent-white leading-tight tracking-tight" style={{textShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
                        {text}
                        <span className="cursor-rainbow inline-block w-1 h-[1em] ml-1 align-middle rounded-full"></span>
                    </h1>
                </div>
                
                <p className="text-slate-300 mb-8 md:mb-10 font-light max-w-xs text-sm md:text-base leading-relaxed opacity-0 animate-[fade-in-up_1s_ease-out_1s_forwards]">
                    The ultimate AI companion for modern learners and creative entrepreneurs.
                </p>

                <button
                    onClick={() => onNavigate('signup')}
                    className="w-full btn-glow-white flex items-center justify-center space-x-2 group hover:!bg-[#E49E10] hover:!border-[#E49E10] hover:text-black transition-all duration-300 py-3.5 text-base font-semibold"
                >
                    <span>Get started</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </button>

                 <p className="mt-6 md:mt-8 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="font-semibold text-primary-amber hover:text-amber-300 transition-colors">
                        Login
                    </button>
                </p>
                <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AuthLayout>
    );
};

export default WelcomeScreen;
