import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/solid';
import { jwtDecode } from 'jwt-decode';
import LayoutPublic from '../components/LayoutPublic';
import { PageSpinner, ButtonSpinner } from '../components/Spinner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verPassword, setVerPassword] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState({});
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const usuario = jwtDecode(token);
                if (usuario.rol === 'admin') return navigate('/admin/panel-propiedades');
                if (usuario.rol === 'agente') return navigate('/agente/panel-propiedades');
                if (usuario.rol === 'cliente') return navigate('/');
            } catch (e) {
                // Token inválido, no hacer nada
            }
        }
        setCheckingAuth(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setErrores({});

        const nuevosErrores = {};

        if (!email.trim()) nuevosErrores.email = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nuevosErrores.email = 'Correo inválido';

        if (!password.trim()) nuevosErrores.password = 'La contraseña es obligatoria';

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        try {
            setCargando(true);
            const respuesta = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
                email,
                password,
            });

            const { token, usuario } = respuesta.data;

            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            // Disparar evento para actualizar navbar
            window.dispatchEvent(new Event('authChange'));

            if (usuario.rol === 'admin') navigate('/admin/panel-propiedades');
            else if (usuario.rol === 'agente') navigate('/agente/panel-propiedades');
            else if (usuario.rol === 'cliente') navigate('/');
            else navigate('/');
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    if (checkingAuth) return <PageSpinner text="Cargando..." />;

    return (
        <LayoutPublic>
            <div className="min-h-screen flex items-start pt-16 sm:pt-24 justify-center bg-slate-50 px-4 pb-12">
                <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-lg border border-slate-100">
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src="/logo-rectangular.jpg"
                            alt="PropTech Hub"
                            className="h-16 w-auto object-contain mb-4"
                        />
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                            Bienvenido de nuevo
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 text-center">
                            Ingresa a tu cuenta para gestionar tus propiedades
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Correo */}
                        <div className="relative">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            {errores.email && <p className="text-xs text-red-600 mt-1">{errores.email}</p>}
                        </div>

                        {/* Contraseña con icono para mostrar/ocultar */}
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type={verPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setVerPassword(!verPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {verPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                            {errores.password && <p className="text-xs text-red-600 mt-1 font-medium">{errores.password}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Link to="/olvide-password" className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Mensaje global de error */}
                        {mensaje && (
                            <div className="text-sm text-center text-red-600 font-medium">{mensaje}</div>
                        )}

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg shadow-md shadow-slate-200 transition-all duration-200 font-semibold text-base flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        >
                            {cargando ? (
                                <>
                                    <ButtonSpinner />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <span>Iniciar Sesión</span>
                            )}
                        </button>
                    </form>

                    {/* No tiene cuenta */}
                    <p className="text-center text-sm text-slate-500 mt-8">
                        ¿No tienes una cuenta?{' '}
                        <Link
                            to="/registro"
                            className="text-orange-600 font-bold hover:text-orange-700 transition duration-150"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </LayoutPublic>
    );
}
