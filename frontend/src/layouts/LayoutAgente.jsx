import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function LayoutAgente() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const handleSidebarToggle = (event) => {
            setSidebarOpen(event.detail.isOpen);
        };

        window.addEventListener('sidebarToggle', handleSidebarToggle);
        return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className={`flex-1 p-6 transition-all duration-500 ease-in-out overflow-y-auto`}>
                <Outlet />
            </main>
        </div>
    );
}