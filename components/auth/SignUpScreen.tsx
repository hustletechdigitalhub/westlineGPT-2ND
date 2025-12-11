
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import AuthInput from './AuthInput';
import { AuthState, User, AuthProvider } from '../../types';
import { authService } from '../../services/authService';

const WestlineIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
        <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
        <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="var(--brand-indigo)"/>
    </svg>
);

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

interface SignUpScreenProps {
    onSignUpSuccess: (user: User) => void;
    onNavigate: (screen: Extract<AuthState, 'login'>) => void;
    onSocialLogin: (provider: AuthProvider) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUpSuccess, onNavigate, onSocialLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
        } else if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
        } else if (password.length < 6) {
            setError('Password must be at least 6 characters.');
        } else if (password !== confirmPassword) {
            setError('Passwords do not match.');
        } else {
            setIsLoading(true);
            setTimeout(() => { // Simulate network delay
                const newUser = authService.signUp(name, email, password);
                setIsLoading(false);
                if (newUser) {
                    onSignUpSuccess(newUser);
                } else {
                    setError('An account with this email already exists.');
                }
            }, 1000);
            return;
        }

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    return (
        <AuthLayout>
            <div className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 animate-float">
                <WestlineIcon />
            </div>

            <h1 className="text-xl md:text-3xl font-bold text-accent-white mb-1 tracking-tight" style={{textShadow: "0 2px 4px rgba(0,0,0,0.5)"}}>Create Account</h1>
            <p className="text-slate-400 mb-4 md:mb-8 font-light text-xs md:text-base">Join Westline and unlock your potential.</p>
            
            <form onSubmit={handleSubmit} className={`space-y-2 md:space-y-4 ${isShaking ? 'animate-shake' : ''}`}>
                <AuthInput id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adam Alhassan" error={null} />
                <AuthInput id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" error={null} />
                <AuthInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={null} />
                <AuthInput id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" error={null} />
                
                {error && <p className="text-red-400 text-xs md:text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-gradient py-2 md:py-3 text-sm md:text-base"
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="flex items-center my-3 md:my-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 md:mx-4 text-slate-500 text-[10px] md:text-sm">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
                onClick={() => onSocialLogin('Google')}
                className="w-full flex items-center justify-center space-x-2 md:space-x-3 btn-glass py-2 md:py-2.5 text-xs md:text-base"
            >
                <GoogleIcon />
                <span>Continue with Google</span>
            </button>

            <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-slate-400">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="font-medium text-primary-amber hover:text-amber-400 transition-colors opacity-100">
                    Login
                </button>
            </p>
        </AuthLayout>
    );
};

export default SignUpScreen;
