import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="p-4 bg-transparent">
            <div className="max-w-4xl mx-auto flex justify-center items-center text-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} Powered by Westline Techlabs</p>
            </div>
        </footer>
    );
};

export default Footer;