
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 overflow-y-auto">
            <div className="w-full max-w-[350px] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto text-center transition-all duration-300 my-auto">
                 <div className="glass-pane rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl border border-white/10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
