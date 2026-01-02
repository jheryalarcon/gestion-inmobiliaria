import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function LayoutAdmin() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleSidebarToggle = (event) => {
            setSidebarOpen(event.detail.isOpen);
            if (event.detail.isMobile !== undefined) {
                setIsMobile(event.detail.isMobile);
            }
        };

        // Escuchar resize para actualizar initial state si no hay eventos
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        window.addEventListener('sidebarToggle', handleSidebarToggle);
        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className={`flex-1 p-6 transition-all duration-500 ease-in-out overflow-y-auto ${isMobile ? 'ml-0' : sidebarOpen ? 'ml-72' : 'ml-20'}`}>
                <Outlet />
            </main>
        </div>
    );
}
