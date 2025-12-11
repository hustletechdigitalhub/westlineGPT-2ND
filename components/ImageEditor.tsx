
import React, { useState } from 'react';
import { ImageState } from '../types';

interface ImageEditorProps {
    originalImage: ImageState;
    editedImage: ImageState | null;
    onClose: () => void;
    onEdit: (prompt: string) => void;
    isLoading: boolean;
    feedback: 'like' | 'dislike' | null;
    onFeedback: (feedback: 'like' | 'dislike') => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const DownloadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const LikeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.563 8H12V4a2 2 0 00-2-2c-1.11 0-2 1.119-2 2.5V9.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 00-.293.707z" /></svg>);
const DislikeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.058 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.438 12H8v4a2 2 0 002 2c1.11 0 2-1.119 2-2.5V10.414a1 1 0 01.293-.707l2.414-2.414a1 1 0 00.293.707z" /></svg>);

const ImageEditor: React.FC<ImageEditorProps> = ({ originalImage, editedImage, onClose, onEdit, isLoading, feedback, onFeedback }) => {
    const [prompt, setPrompt] = useState('');
    const imageToShow = editedImage || originalImage;

    const handleEditClick = () => {
        if (prompt.trim()) {
            onEdit(prompt);
        }
    };
    
    const handleDownload = () => {
        if (editedImage) {
            const link = document.createElement('a');
            link.href = editedImage.data;
            const fileExtension = editedImage.mimeType.split('/')[1] || 'png';
            link.download = `westline-edit-${Date.now()}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-secondary-black border border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
                    <CloseIcon className="h-6 w-6" />
                </button>
                
                <h2 className="text-2xl font-semibold text-center text-accent-white mb-4 flex-shrink-0">
                    Edit Image
                </h2>

                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                    {/* Image Preview */}
                    <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden relative">
                        <img src={imageToShow.data} alt="Preview" className="max-w-full max-h-full object-contain" />
                        {isLoading && <LoadingSpinner />}
                        {editedImage && !isLoading && (
                            <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1 flex items-center space-x-1">
                                <button onClick={handleDownload} title="Download Image" className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <DownloadIcon />
                                </button>
                                <button onClick={() => onFeedback('like')} title="Like" className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <LikeIcon className={feedback === 'like' ? 'text-amber-400' : ''} />
                                </button>
                                <button onClick={() => onFeedback('dislike')} title="Dislike" className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <DislikeIcon className={feedback === 'dislike' ? 'text-amber-400' : ''} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-72 flex flex-col gap-4 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-primary-amber">Instructions</h3>
                        <p className="text-sm text-slate-300 font-light">
                            Describe what you want to change, add, or remove. Be specific!
                        </p>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'add a futuristic city in the background' or 'make the sky purple'"
                            className="flex-1 bg-black/30 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 resize-none"
                            rows={5}
                            disabled={isLoading}
                        />
                         <button
                            onClick={handleEditClick}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full bg-[#E49E10] text-black font-bold rounded-xl py-3 hover:bg-amber-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-black focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 neural-glow-static"
                        >
                            {isLoading ? 'Applying Edit...' : 'Apply Edit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
