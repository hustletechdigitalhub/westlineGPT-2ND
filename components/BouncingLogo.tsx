import React from 'react';

const WestlineIcon: React.FC = () => (
    <div className="w-10 h-10">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="aiIconGradientBounce" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="var(--primary-amber, #E49E10)"/>
            <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
            <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="url(#aiIconGradientBounce)"/>
        </svg>
    </div>
);

const BouncingLogo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 opacity-80">
            <div className="animate-bounce">
                <WestlineIcon />
            </div>
        </div>
    );
};

export default BouncingLogo;
