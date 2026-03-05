import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import LayoutPublic from '../components/LayoutPublic';
import { ButtonSpinner } from '../components/Spinner';

export default function RecuperarPassword() {
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('El correo es obligatorio');
            return;
        }

        setCargando(true);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
            toast.success('Envío exitoso', {
                description: data.mensaje
            });
            setEmail('');
        } catch (error) {
            toast.error('Error', {
                description: error.response?.data?.mensaje || 'Hubo un error al enviar la solicitud'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <LayoutPublic>
            <div className="min-h-screen flex items-start pt-8 sm:pt-12 justify-center bg-slate-50 px-4 pb-12">
                <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100">
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src="/logo-rectangular.jpg"
                            alt="PropTech Hub"
                            className="h-14 w-auto object-contain mb-3"
                        />
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                            Recuperar Contraseña
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 text-center">
                            Ingresa tu email y te enviaremos las instrucciones
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Correo */}
                        <div className="relative">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm border-slate-200"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg shadow-md shadow-slate-200 transition-all duration-200 font-semibold text-base flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            >
                                {cargando ? <ButtonSpinner /> : 'Enviar Instrucciones'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                Volver a Iniciar Sesión
                            </Link>
                            <Link to="/registro" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                                Crear Cuenta
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </LayoutPublic>
    );
}
