import React from 'react';

const CREATIVE_EMOJIS = ['🚀', '🎨', '💡', '✨'];

interface QuickButtonsProps {
    prompts: string[];
    onQuickButtonClick: (text: string) => void;
}

const QuickButtons: React.FC<QuickButtonsProps> = ({ prompts, onQuickButtonClick }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-2">
            {prompts.map((text, index) => (
                <button
                    key={index}
                    onClick={() => onQuickButtonClick(text)}
                    className="p-4 glass-pane rounded-xl hover:bg-white/5 transition-all duration-300 text-left text-sm flex items-start space-x-3 transform hover:-translate-y-1"
                    style={{'--glass-bg': 'rgba(255,255,255,0.05)'} as React.CSSProperties}
                >
                    <span className="text-lg mt-0.5">{CREATIVE_EMOJIS[index % CREATIVE_EMOJIS.length]}</span>
                    <span className="flex-1 text-slate-200">{text}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickButtons;