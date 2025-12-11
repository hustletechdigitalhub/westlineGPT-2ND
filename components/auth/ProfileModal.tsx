
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import AuthInput from './AuthInput';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedFields: Partial<User>, closeModal?: boolean) => void;
    onTakePhoto: () => void;
    onUploadPhoto: () => void;
    pendingPicture?: string | null;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M1 8a2 2 0 012-2h.43a2 2 0 001.72-1.086l.7-1.405A2 2 0 017.58 3h4.84a2 2 0 011.72 1.51l.7 1.405A2 2 0 0016.57 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" clipRule="evenodd" /></svg>);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>);
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.59 1.59a.75.75 0 010 1.06zM12 21a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75zM5.106 18.894a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM6.106 5.106a.75.75 0 011.06 0l1.591 1.59a.75.75 0 11-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06z" />
    </svg>
);
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-.949a.75.75 0 01.82.226l.23.23a.75.75 0 01-.225.82a10.463 10.463 0 01-4.752 2.475 10.463 10.463 0 01-4.752-2.475c-2.122-1.226-3.63-3.292-4.14-5.623A9.01 9.01 0 017.05 3.42a.75.75 0 01.819.162l.23.23a.75.75 0 01-.225.82A8.969 8.969 0 009.5 6a8.969 8.969 0 002.475-4.752 10.463 10.463 0 01-2.2-1.226.75.75 0 01-.226-.82l.23-.23z" clipRule="evenodd" />
    </svg>
);


const Avatar: React.FC<{ user: User; className?: string; tempPicture?: string | null }> = ({ user, className = 'w-24 h-24', tempPicture }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.slice(0, 2).toUpperCase();
    };
    
    const picture = tempPicture !== undefined ? tempPicture : user.profilePicture;

    return (
         <div className="relative">
            <div className={`rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`} style={{ background: 'linear-gradient(45deg, var(--primary-amber), var(--brand-purple))' }}>
                {picture ? (
                    <img src={picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <span className={`font-bold ${className.includes('24') ? 'text-4xl' : 'text-sm'}`}>
                        {getInitials(user.name)}
                    </span>
                )}
            </div>
            <div className="absolute -inset-1 rounded-full ring-2 ring-amber-400/50 animate-pulse"></div>
        </div>
    );
};


const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave, onTakePhoto, onUploadPhoto, pendingPicture }) => {
    const [name, setName] = useState(user.name);
    const [theme, setTheme] = useState(user.theme || 'dark');
    const [reduceMotion, setReduceMotion] = useState(user.preferences?.reduceMotion || false);
    const [tempPicture, setTempPicture] = useState<string | null>(null);
    const [isUploadOptionsOpen, setIsUploadOptionsOpen] = useState(false);
    const uploadOptionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setTheme(user.theme || 'dark');
            setReduceMotion(user.preferences?.reduceMotion || false);
            // Use pending picture if available (from parent upload), otherwise user profile
            setTempPicture(pendingPicture || user.profilePicture || null);
            setIsUploadOptionsOpen(false);
        }
    }, [isOpen, user, pendingPicture]);

    useEffect(() => {
        if (!isUploadOptionsOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (uploadOptionsRef.current && !uploadOptionsRef.current.contains(event.target as Node)) {
                setIsUploadOptionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUploadOptionsOpen]);

    const handleSave = () => {
        const updatedFields: Partial<User> = {};
        if (name !== user.name) updatedFields.name = name;
        if (reduceMotion !== user.preferences?.reduceMotion) {
            updatedFields.preferences = { ...user.preferences, reduceMotion };
        }
        if (tempPicture !== user.profilePicture) {
            updatedFields.profilePicture = tempPicture;
        }

        if (Object.keys(updatedFields).length > 0) {
            onSave(updatedFields, true);
        } else {
            onClose();
        }
    };
    
    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        onSave({ theme: newTheme }, false); // Save immediately, don't close modal
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-pane rounded-2xl w-full max-w-md p-6 sm:p-8 relative transform transition-all" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>
                
                <h2 className="text-2xl font-semibold text-center text-accent-white mb-6">My Profile</h2>

                <div className="flex flex-col items-center space-y-6">
                     <div className="relative group w-24 h-24">
                        <Avatar user={user} tempPicture={tempPicture} />
                        <div ref={uploadOptionsRef} className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                             <button 
                                onClick={() => setIsUploadOptionsOpen(prev => !prev)} 
                                className="w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center ring-4 ring-black/50 hover:bg-primary-amber hover:text-black transition-all" 
                                title="Change photo"
                             >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            {isUploadOptionsOpen && (
                                <div className="absolute bottom-full right-full mb-2 mr-2 w-48 glass-pane rounded-xl p-2 origin-bottom-right animate-fade-in-up-sm">
                                    <style>{`
                                        @keyframes fade-in-up-sm {
                                            from { opacity: 0; transform: translateY(5px) scale(0.98); }
                                            to { opacity: 1; transform: translateY(0) scale(1); }
                                        }
                                        .animate-fade-in-up-sm { animation: fade-in-up-sm 0.15s ease-out; }
                                    `}</style>
                                    <button onClick={() => { onUploadPhoto(); setIsUploadOptionsOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                                        <UploadIcon className="w-5 h-5 text-slate-400" />
                                        <span>Upload Photo</span>
                                    </button>
                                    <button onClick={() => { onTakePhoto(); setIsUploadOptionsOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                                        <CameraIcon className="w-5 h-5 text-slate-400" />
                                        <span>Take Photo</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <AuthInput id="profile-name" label="Display Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" error={null} />
                         <div className="text-left w-full">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Email
                            </label>
                            <div className="w-full bg-black/30 border border-white/20 rounded-xl py-2.5 px-4 text-slate-400 text-sm cursor-not-allowed">
                                {user.email}
                            </div>
                        </div>
                    </div>

                     <div className="w-full">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-left">Theme</label>
                        <div className="flex items-center space-x-2 bg-black/30 p-1 rounded-xl">
                            <button onClick={() => handleThemeChange('light')} className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors text-sm ${theme === 'light' ? 'bg-white/20 text-accent-white' : 'hover:bg-white/10 text-slate-300'}`}>
                               <SunIcon className="w-5 h-5"/> <span>Light</span>
                            </button>
                            <button onClick={() => handleThemeChange('dark')} className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors text-sm ${theme === 'dark' ? 'bg-white/20 text-accent-white' : 'hover:bg-white/10 text-slate-300'}`}>
                               <MoonIcon className="w-5 h-5"/> <span>Dark</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="w-full flex items-center justify-between p-2">
                         <label htmlFor="reduceMotionProfile" className="text-sm font-medium text-slate-300">Reduce Motion</label>
                         <button onClick={() => setReduceMotion(!reduceMotion)} className={`relative w-10 h-5 rounded-full transition-colors ${reduceMotion ? 'bg-primary-amber' : 'bg-slate-700'}`}>
                             <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${reduceMotion ? 'translate-x-5' : ''}`}></span>
                         </button>
                    </div>

                    <div className="flex items-center justify-center space-x-4 w-full pt-4">
                         <button onClick={onClose} className="btn-glass px-8 py-2">Cancel</button>
                         <button onClick={handleSave} className="btn-gradient px-8 py-2">
                            Save Changes
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
