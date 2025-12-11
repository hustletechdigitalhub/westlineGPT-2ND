import React from 'react';

const LogoFragment: React.FC<{ index: number }> = ({ index }) => {
    const totalFragments = 12;
    const angle = (index / totalFragments) * 360;
    const radius = 50;
    
    const style: React.CSSProperties = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        backgroundColor: 'var(--primary-amber)',
        borderRadius: '50%',
        opacity: 0,
        transform: `rotate(${angle}deg) translateX(${radius}px) scale(0)`,
        animation: `converge 1.5s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.05}s forwards`,
    };

    return <div style={style}></div>;
};

const SplashScreen: React.FC = () => {
    const fragments = Array.from({ length: 12 });

    return (
        <div className="flex flex-col items-center justify-center h-screen text-white bg-secondary-black">
            <style>{`
                @keyframes converge {
                    50% {
                        opacity: 1;
                        transform: rotate(${180 + Math.random() * 90}deg) translateX(20px) scale(1.5);
                    }
                    100% {
                        opacity: 0;
                        transform: rotate(360deg) translateX(0) scale(0);
                    }
                }
                @keyframes logo-reveal {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .logo-container {
                    animation: logo-reveal 0.8s ease-out 1.5s forwards;
                    opacity: 0;
                }
            `}</style>

            <div className="relative w-24 h-24 flex items-center justify-center">
                {fragments.map((_, i) => <LogoFragment key={i} index={i} />)}
                <div className="logo-container w-24 h-24">
                     <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="var(--primary-amber)"/>
                        <path d="M22 68 L38 32 L46 54 L54 32 L70 68 H60 L54 52 L48 68 H38 L46 48 L40 68 H22 Z" fill="black"/>
                        <path d="M75 26 L78.5 29.5 L82 32 L78.5 34.5 L75 38 L71.5 34.5 L68 32 L71.5 29.5 Z" fill="#4f46e5"/>
                    </svg>
                </div>
            </div>
             <p className="mt-4 text-xl font-semibold text-accent-white/70 logo-container tracking-widest">
                WESTLINE
            </p>
        </div>
    );
};

export default SplashScreen;
