import React from 'react';

interface HeaderProps {
    title?: string;
    secondTitle?: string;
}

const Header: React.FC<HeaderProps> = ({title = '📅 Weekly Shift Planner', secondTitle = 'Welcome to V-Shop'}) => {
    return (
        <header className="w-full p-6 bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto flex flex-row gap-8 font-bold text-gray-800 items-end">
                <h1 className="text-4xl flex items-center">
                    {title}
                </h1>
                <h2 className="text-2xl text-gray-500">
                    {secondTitle}
                </h2>
            </div>
        </header>
    );
};

export default Header;
