import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import AuthInput from './AuthInput';
import { AuthState } from '../../types';

const WestlineIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
        <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
        <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="var(--brand-indigo)"/>
    </svg>
);

interface ForgotPasswordScreenProps {
    onNavigate: (screen: Extract<AuthState, 'login'>) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
        }
    };

    return (
        <AuthLayout>
             <div className="w-16 h-16 mx-auto mb-4 animate-float">
                <WestlineIcon />
            </div>

            <h1 className="text-3xl font-bold text-accent-white mb-1 tracking-tight" style={{textShadow: "0 2px 4px rgba(0,0,0,0.5)"}}>Forgot Password</h1>
            <p className="text-slate-300 mb-8 font-light">Enter your email to get a reset link.</p>

            {submitted ? (
                <div className="text-center">
                    <p className="text-slate-200 mb-4">
                        If an account with that email exists, we've sent a password reset link to it. Please check your inbox.
                    </p>
                    <button onClick={() => onNavigate('login')} className="font-medium text-primary-amber hover:text-amber-400 transition-colors">
                        &larr; Back to Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthInput
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        error={null}
                    />
                    <button
                        type="submit"
                        className="w-full btn-gradient"
                    >
                        Send Reset Link
                    </button>
                     <p className="mt-6 text-center text-sm">
                        <button onClick={() => onNavigate('login')} className="font-medium text-primary-amber hover:text-amber-400 transition-colors">
                            &larr; Back to Login
                        </button>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
};

export default ForgotPasswordScreen;