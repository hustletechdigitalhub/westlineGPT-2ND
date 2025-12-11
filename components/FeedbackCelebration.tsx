import React from 'react';

const EMOJIS = ['🎉', '✨', '👍', '🚀', '💛'];

const FeedbackCelebration: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max pointer-events-none z-20">
            {/* Pop-up message */}
            <div className="animate-popup bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                Thanks for the feedback!
            </div>
            
            {/* Scattered Emojis */}
            {EMOJIS.map((emoji, index) => {
                const endX = Math.random() * 100 - 50; // -50 to 50
                const endY = -(Math.random() * 80 + 40); // -40 to -120
                const rotation = Math.random() * 360 - 180; // -180 to 180
                const endScale = Math.random() * 0.5 + 0.8; // 0.8 to 1.3
                
                return (
                    <span
                        key={index}
                        className="animate-emoji-burst text-lg"
                        style={{
                            '--emoji-transform-end': `translate(${endX}px, ${endY}px) rotate(${rotation}deg) scale(${endScale})`,
                            animationDelay: `${index * 0.05}s`,
                        } as React.CSSProperties}
                    >
                        {emoji}
                    </span>
                );
            })}
        </div>
    );
};

export default FeedbackCelebration;
