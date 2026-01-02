import React from 'react';

function Spinner({
    size = 'md',
    text = 'Cargando...',
    color = 'orange',
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
        white: 'border-white',
        orange: 'border-orange-600'
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
export function PageSpinner({ text = 'Cargando...', size = 'md', color = 'orange' }) {
    return (
        <div className="flex justify-center items-center min-h-[70vh] w-full">
            <Spinner text={text} size={size} color={color} />
        </div>
    );
}

// Componente para botones
export function ButtonSpinner({ size = 'sm', color = 'white' }) {
    return (
        <div className="flex items-center justify-center">
            <div
                className={`animate-spin rounded-full border-b-2 ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} ${color === 'white' ? 'border-white' : 'border-orange-600'}`}
            ></div>
        </div>
    );
}

// Componente para overlays
export function OverlaySpinner({ text = 'Cargando...', show = false }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-300">
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <Spinner text={text} size="lg" color="orange" />
            </div>
        </div>
    );
}

// Exportación por defecto
export default Spinner;
