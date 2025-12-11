
import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { galleryService } from '../services/galleryService';

interface LibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    onEditImage: (image: GalleryItem) => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);
const LibraryIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, userEmail, onEditImage }) => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    useEffect(() => {
        if (isOpen) {
            setImages(galleryService.getGallery(userEmail));
            setSelectedImage(null);
        }
    }, [isOpen, userEmail]);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this creation?")) {
            const updated = galleryService.deleteFromGallery(userEmail, id);
            setImages(updated);
            if (selectedImage?.id === id) setSelectedImage(null);
        }
    };

    const handleDownload = (item: GalleryItem) => {
        const link = document.createElement('a');
        link.href = item.data;
        link.download = `westline-library-${item.timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
             <div 
                className="bg-[#0A0A0A] border-t border-x md:border border-white/5 rounded-t-3xl md:rounded-3xl shadow-[0_0_50px_rgba(228,158,16,0.15)] w-full max-w-6xl h-[92vh] md:h-[85vh] flex flex-col relative overflow-hidden transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                 <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 shrink-0">
                    <div className="flex items-center space-x-3">
                         <div className="p-1.5 md:p-2 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-xl border border-white/5">
                            <LibraryIcon className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white tracking-wide">
                                CREATIVE LIBRARY
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-light tracking-widest uppercase">Your Generations</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <CloseIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative flex">
                    {/* Grid View */}
                    <div className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar transition-opacity duration-300 ${selectedImage ? 'opacity-20 pointer-events-none md:opacity-100 md:pointer-events-auto md:w-2/3' : 'w-full'}`}>
                         {images.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <LibraryIcon className="w-16 h-16 text-slate-600 mb-4" />
                                <h3 className="text-xl text-slate-300 font-light">Library Empty</h3>
                                <p className="text-sm text-slate-500 mt-2">Generate some images to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedImage(item)}
                                        className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 ${selectedImage?.id === item.id ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'}`}
                                    >
                                        <img src={item.data} alt="Generated" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <p className="text-xs text-white line-clamp-2">{item.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lightbox / Detail View */}
                    {(selectedImage) && (
                        <div className="absolute inset-0 md:relative md:inset-auto md:w-1/3 bg-black/80 md:bg-[#111] backdrop-blur-xl md:backdrop-blur-none border-l border-white/5 flex flex-col z-20 md:z-auto animate-fade-in-right">
                             <style>{`
                                @keyframes fade-in-right {
                                    from { opacity: 0; transform: translateX(20px); }
                                    to { opacity: 1; transform: translateX(0); }
                                }
                                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out; }
                            `}</style>
                            
                            <div className="p-4 flex justify-between items-center md:hidden">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Detail View</span>
                                <button onClick={() => setSelectedImage(null)} className="text-white bg-white/10 p-1 rounded-full"><CloseIcon className="w-5 h-5"/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-6 bg-black flex-shrink-0">
                                    <img src={selectedImage.data} alt="Detail" className="w-full h-auto object-contain" />
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Prompt</h4>
                                        <p className="text-sm text-slate-200 font-light leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                            {selectedImage.prompt}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Details</h4>
                                        <p className="text-xs text-slate-400">
                                            Created: {new Date(selectedImage.timestamp).toLocaleDateString()} at {new Date(selectedImage.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 border-t border-white/5 bg-[#0A0A0A] space-y-3 shrink-0">
                                <button 
                                    onClick={() => { onEditImage(selectedImage); onClose(); }}
                                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
                                >
                                    <MagicWandIcon className="w-5 h-5" />
                                    <span>Edit Image</span>
                                </button>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => handleDownload(selectedImage)}
                                        className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        <span>Download</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedImage.id)}
                                        className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryModal;
