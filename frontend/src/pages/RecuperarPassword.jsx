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
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        setMensajeExito('');

        const nuevosErrores = {};

        if (!email.trim()) {
            nuevosErrores.email = 'El correo es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevosErrores.email = 'Ingresa un correo válido';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        setCargando(true);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
            setMensajeExito(data.mensaje);
            setEmail('');
        } catch (error) {
            setErrores({ global: error.response?.data?.mensaje || 'Hubo un error al enviar la solicitud' });
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
                            src="/logo-rectangular.png"
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

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        {/* Correo */}
                        <div className="relative">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="email"
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                                    errores.email
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                                }`}
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errores.email && <p className="text-xs text-red-600 mt-1 font-medium">{errores.email}</p>}
                        </div>

                        {/* Mensaje de éxito */}
                        {mensajeExito && (
                            <div className="text-sm text-center text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                {mensajeExito}
                            </div>
                        )}

                        {/* Error global API */}
                        {errores.global && (
                            <div className="text-sm text-center text-red-600 font-medium">{errores.global}</div>
                        )}

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
