import React from 'react';

export default function NavHeaderContainer({ children, className }) {
    return (
        <header className={`bg-white  px-2 py-4 flex rounded-sm border-b-1 border-gray-300 ${className}`}>
            {children}
        </header>
    );
}
