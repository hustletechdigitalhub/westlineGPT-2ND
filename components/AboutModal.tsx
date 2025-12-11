import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

const WestlineIcon: React.FC = () => (
    <div className="w-16 h-16 mx-auto mb-4">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
            <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
            <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="var(--brand-indigo)"/>
        </svg>
    </div>
);

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity" onClick={onClose}>
            <div className="glass-pane rounded-2xl w-full max-w-md p-8 relative transform transition-all"
                onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="h-6 w-6"/>
                </button>
                
                <div className="text-center">
                    <WestlineIcon />
                    <h2 className="text-3xl font-semibold text-accent-white mb-2 tracking-wider">
                        WestlineGPT
                    </h2>
                    <p className="text-primary-amber font-semibold mb-4 text-lg">Your Smart Creative Partner</p>
                    <p className="text-slate-300 font-light leading-relaxed">
                        An AI-powered assistant designed to support students, creators, and digital learners in the Westline Techlabs ecosystem — helping them learn digital skills, explore AI tools, and get creative project guidance.
                    </p>
                </div>

                <div className="text-center mt-8">
                    <button onClick={onClose}
                        className="btn-gradient px-8"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;