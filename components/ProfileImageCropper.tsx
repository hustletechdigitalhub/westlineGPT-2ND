
import React, { useState, useRef, useEffect } from 'react';

interface ProfileImageCropperProps {
    imageSrc: string;
    onCancel: () => void;
    onComplete: (croppedImage: string) => void;
}

const ZoomInIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const ZoomOutIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const CheckIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);

const MASK_SIZE = 250; // The visual size of the crop circle in pixels
const OUTPUT_SIZE = 400; // The resolution of the saved image

const ProfileImageCropper: React.FC<ProfileImageCropperProps> = ({ imageSrc, onCancel, onComplete }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle image load to set smart initial zoom
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            // Calculate a zoom level that covers the mask area comfortably
            // We use 'max' to ensure the image covers the circle completely (aspect fill)
            const scaleToFit = Math.max(MASK_SIZE / naturalWidth, MASK_SIZE / naturalHeight);
            setZoom(scaleToFit);
            // Center the image
            setPosition({ x: 0, y: 0 });
        }
    };

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scroll on mobile
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');
        const img = imgRef.current;

        if (ctx && img) {
            // Fill background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

            // Important: We must map the visual logic (250px container) to the output logic (400px canvas).
            const ratio = OUTPUT_SIZE / MASK_SIZE; // 1.6

            // Move origin to center of canvas
            ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
            
            // Apply User's Transforms (Scaled by Ratio)
            ctx.translate(position.x * ratio, position.y * ratio);
            ctx.scale(zoom * ratio, zoom * ratio);
            
            // Draw Image Centered
            // Since we moved origin to center, drawing at -width/2 centers the image
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onComplete(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md bg-secondary-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Adjust Photo</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white">Cancel</button>
                </div>

                <div 
                    ref={containerRef}
                    className="relative flex-1 bg-black overflow-hidden cursor-move touch-none flex items-center justify-center min-h-[300px]"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                >
                    {/* The Image */}
                    <img 
                        ref={imgRef}
                        src={imageSrc} 
                        alt="Crop target" 
                        onLoad={handleImageLoad}
                        draggable={false}
                        className="max-w-none shrink-0 select-none"
                        style={{ 
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        }} 
                    />

                    {/* The Mask Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div 
                            className="rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                            style={{ width: `${MASK_SIZE}px`, height: `${MASK_SIZE}px` }}
                        ></div>
                    </div>
                </div>

                <div className="p-6 bg-secondary-black space-y-6">
                    {/* Zoom Control */}
                    <div className="flex items-center space-x-4">
                        <ZoomOutIcon />
                        <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.05" 
                            value={zoom} 
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-primary-amber h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomInIcon />
                    </div>

                    <div className="flex space-x-3">
                         <button 
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-primary-amber text-black font-bold hover:bg-amber-400 transition-colors flex items-center justify-center space-x-2"
                        >
                            <CheckIcon />
                            <span>Save Photo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageCropper;
