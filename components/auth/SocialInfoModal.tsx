import React, { useState, useEffect } from 'react';
import AuthInput from './AuthInput';

interface SocialInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, email: string) => void;
    initialName: string;
    initialEmail: string;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

const SocialInfoModal: React.FC<SocialInfoModalProps> = ({ isOpen, onClose, onConfirm, initialName, initialEmail }) => {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if(isOpen) {
            setName(initialName);
            setEmail(initialEmail);
            setError('');
        }
    }, [isOpen, initialName, initialEmail]);

    const handleSubmit = () => {
        setError('');
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        onConfirm(name, email);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-black/50 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-sm p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="h-6 w-6"/>
                </button>
                
                <h2 className="text-2xl font-semibold text-center text-accent-white mb-2">
                    Confirm Your Details
                </h2>
                <p className="text-center text-slate-400 mb-6 text-sm">One last step to get you started.</p>
                
                <div className="space-y-4 text-left">
                     <AuthInput
                        id="social-name"
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        error={null}
                    />
                     <AuthInput
                        id="social-email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        error={null}
                    />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>

                <div className="mt-6">
                    <button onClick={handleSubmit}
                        className="w-full font-semibold bg-transparent border border-amber-500 text-white rounded-xl py-3 hover:bg-amber-500 hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-black focus:ring-amber-500"
                    >
                        Confirm & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialInfoModal;