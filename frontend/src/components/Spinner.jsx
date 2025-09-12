import React from 'react';

function Spinner({ 
    size = 'md', 
    text = 'Cargando...', 
    color = 'blue',
    className = '' 
}) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        green: 'border-green-600',
        red: 'border-red-600',
        purple: 'border-purple-600',
        gray: 'border-gray-600',
        white: 'border-white'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div 
                className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} mb-4`}
            ></div>
            {text && (
                <p className={`text-gray-600 ${textSizeClasses[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );
}

// Componente específico para páginas completas
export function PageSpinner({ text = 'Cargando...', size = 'md', color = 'blue' }) {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-center items-center h-64">
                <Spinner text={text} size={size} color={color} />
            </div>
        </div>
    );
}

// Componente para botones
export function ButtonSpinner({ size = 'sm', color = 'white' }) {
    return (
        <div className="flex items-center justify-center">
            <div 
                className={`animate-spin rounded-full border-b-2 ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} ${color === 'white' ? 'border-white' : 'border-blue-600'}`}
            ></div>
        </div>
    );
}

// Componente para overlays
export function OverlaySpinner({ text = 'Cargando...', show = false }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl">
                <Spinner text={text} size="lg" color="blue" />
            </div>
        </div>
    );
}

// Exportación por defecto
export default Spinner;
