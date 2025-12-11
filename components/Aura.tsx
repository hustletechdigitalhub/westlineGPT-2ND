
import React from 'react';
import { AuraState, AuraIntensity, ScreenCrackState } from '../types';

interface AuraProps {
    currentAura: AuraState;
    intensity: AuraIntensity;
    reduceMotion: boolean;
    screenCrackEffect: ScreenCrackState | null;
}

const PARTICLE_COUNTS = {
    Rain: { Low: 25, Medium: 60, High: 100 },
    IceDrip: { Low: 15, Medium: 30, High: 50 },
    Lava: { Low: 5, Medium: 12, High: 20 },
    Steam: { Low: 8, Medium: 15, High: 25 },
    Fire: { Low: 20, Medium: 45, High: 70 },
    ScreenCrack: { Low: 1, Medium: 2, High: 3 },
};

const RainEffect: React.FC<{ count: number }> = ({ count }) => (<>{Array.from({ length: count }).map((_, i) => <div key={i} className="raindrop" style={{ left: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random() * 0.5}s`, animationDelay: `${Math.random() * 5}s` }}></div>)}</>);
const IceDripEffect: React.FC<{ count: number }> = ({ count }) => (<>{Array.from({ length: count }).map((_, i) => <div key={i} className="icicle" style={{ left: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 3}s`, animationDelay: `${Math.random() * 7}s` }}></div>)}</>);
const LavaEffect: React.FC<{ count: number }> = ({ count }) => (<>{Array.from({ length: count }).map((_, i) => { const size = 50 + Math.random() * 150; return <div key={i} className="lava-blob" style={{ left: `${Math.random() * 100}%`, width: `${size}px`, height: `${size}px`, animationDuration: `${10 + Math.random() * 15}s`, animationDelay: `${Math.random() * 10}s` }}></div>})}</>);
const SteamEffect: React.FC<{ count: number }> = ({ count }) => (<>{Array.from({ length: count }).map((_, i) => { const size = 150 + Math.random() * 250; const drift = (Math.random() - 0.5) * 200; return <div key={i} className="steam-wisp" style={{ left: `${Math.random() * 100}%`, width: `${size}px`, height: `${size}px`, animationDuration: `${15 + Math.random() * 20}s`, animationDelay: `${Math.random() * 15}s`, '--steam-drift': `${drift}px` } as React.CSSProperties}></div>})}</>);

const FireEffect: React.FC<{ count: number }> = ({ count }) => (<>{Array.from({ length: count }).map((_, i) => {
    const drift = (Math.random() - 0.5) * 50; // -25 to 25
    const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 4}s, ${0.5 + Math.random() * 1}s`,
        animationDelay: `${Math.random() * 5}s`,
        '--ember-drift': `${drift}px`,
    } as React.CSSProperties;
    return <div key={i} className="fire-ember" style={style}></div>;
})}</>);

const LightningBolt: React.FC<{ path: string, delay: number, color: string }> = ({ path, delay, color }) => (
    <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path 
            d={path} 
            className="lightning-path"
            style={{ 
                '--crack-delay': `${delay}s`, 
                stroke: '#FFFFFF', 
                strokeWidth: '3px',
                filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 30px ${color})` 
            } as React.CSSProperties}
        />
    </svg>
);

const ThunderOverlay: React.FC<{ effect: ScreenCrackState; reduceMotion: boolean }> = ({ effect, reduceMotion }) => {
    const { key } = effect;
    // Electric blue/cyan for modern clean look
    const boltColor = '#00BFFF'; 

    // Jagged lightning paths
    const bolts = [
        "M200 0 L150 150 L300 180 L200 400 L400 450 L300 800", // Top left to center bottom
        "M800 0 L750 200 L900 250 L800 500 L950 550 L850 900", // Top right straight down
        "M0 300 L200 350 L150 500 L400 550 L300 800", // Side strike
        "M1000 100 L800 300 L900 400 L700 700" // Top right angle
    ];

    if (reduceMotion) return null;

    return (
        <div key={key} className="lightning-container">
            {bolts.map((path, i) => (
                <LightningBolt key={i} path={path} delay={i * 0.1} color={boltColor} />
            ))}
        </div>
    );
};

const Aura: React.FC<AuraProps> = ({ currentAura, intensity, reduceMotion, screenCrackEffect }) => {
    const renderBaseEffect = () => {
        if (currentAura === 'Off' || reduceMotion) return null;
        switch (currentAura) {
            case 'Rain': return <RainEffect count={PARTICLE_COUNTS.Rain[intensity]} />;
            case 'Ice Drip': return <IceDripEffect count={PARTICLE_COUNTS.IceDrip[intensity]} />;
            case 'Lava': return <LavaEffect count={PARTICLE_COUNTS.Lava[intensity]} />;
            case 'Steam': return <SteamEffect count={PARTICLE_COUNTS.Steam[intensity]} />;
            case 'Fire': return <FireEffect count={PARTICLE_COUNTS.Fire[intensity]} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
            {renderBaseEffect()}
            {screenCrackEffect?.active && (<ThunderOverlay effect={screenCrackEffect} reduceMotion={reduceMotion} />)}
        </div>
    );
};

export default Aura;
