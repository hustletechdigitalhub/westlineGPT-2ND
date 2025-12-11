
import React from 'react';

interface UploadMenuProps {
    onUpload: () => void;
    onTakePhoto: () => void;
    onGenerateImage: () => void;
    onOpenLibrary: () => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const MagicWandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const LibraryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UploadMenu: React.FC<UploadMenuProps> = ({ onUpload, onTakePhoto, onGenerateImage, onOpenLibrary }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-2 w-48 origin-bottom-left animate-fade-in-up">
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.15s ease-out; }
            `}</style>
            <button onClick={onGenerateImage} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                <MagicWandIcon />
                <span>Generate Image</span>
            </button>
             <button onClick={onOpenLibrary} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                <LibraryIcon />
                <span>Library</span>
            </button>
            <div className="border-t border-white/10 my-1"></div>
            <button onClick={onUpload} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                <UploadIcon />
                <span>Upload Photo</span>
            </button>
            <button onClick={onTakePhoto} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors">
                <CameraIcon />
                <span>Take Photo</span>
            </button>
        </div>
    );
};

export default UploadMenu;
