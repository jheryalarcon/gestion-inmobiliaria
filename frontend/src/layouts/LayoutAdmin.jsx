import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export default function LayoutAdmin() {
    return (
        <>
            <Navbar />
            <div className="p-6">
                <Outlet />
            </div>
        </>
    );
}
