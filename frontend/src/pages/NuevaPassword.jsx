import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import LayoutPublic from '../components/LayoutPublic';
import { ButtonSpinner } from '../components/Spinner';

export default function NuevaPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [tokenValido, setTokenValido] = useState(true);
    const [mensajeExito, setMensajeExito] = useState(false);

    const [searchParams] = useSearchParams();
    const params = useParams();
    const navigate = useNavigate();
    const token = params.token || searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setTokenValido(false);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            toast.error('La contraseña es obligatoria');
            return;
        }
        if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            toast.error('Debe tener al menos 8 caracteres, una mayúscula y un número');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setCargando(true);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password/${token}`, { password });

            setMensajeExito(true);
            toast.success('Contraseña restablecida');

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            toast.error('Error', {
                description: error.response?.data?.mensaje || 'Hubo un error al guardar la contraseña'
            });
        } finally {
            setCargando(false);
        }
    };

    if (!tokenValido) {
        return (
            <LayoutPublic>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                    <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
                        <h1 className="text-2xl font-bold text-slate-900">Token no válido</h1>
                        <p className="mt-2 text-slate-500 text-sm">Este enlace no es válido o ha expirado.</p>
                        <Link to="/olvide-password" class="mt-4 inline-block text-orange-600 hover:text-orange-700 font-bold text-sm">Volver a intentar</Link>
                    </div>
                </div>
            </LayoutPublic>
        )
    }

    return (
        <LayoutPublic>
            <div className="min-h-screen flex items-start pt-8 sm:pt-12 justify-center bg-slate-50 px-4 pb-12">
                <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100">
                    {mensajeExito ? (
                        <div className="text-center animate-fadeIn flex flex-col items-center">
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900">¡Contraseña Guardada!</h2>
                            <p className="mt-2 text-slate-500 text-sm">Tu contraseña ha sido actualizada correctamente.</p>
                            <Link to="/login" className="mt-6 w-full py-2.5 px-4 rounded-lg text-white bg-slate-900 hover:bg-black font-semibold text-base transition-all">
                                Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src="/logo-rectangular.png"
                                    alt="PropTech Hub"
                                    className="h-14 w-auto object-contain mb-3"
                                />
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                                    Restablecer Contraseña
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 text-center">
                                    Ingresa tu nueva contraseña
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm border-slate-200"
                                            placeholder="Nueva Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm border-slate-200"
                                            placeholder="Confirmar Contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={cargando}
                                        className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg shadow-md shadow-slate-200 transition-all duration-200 font-semibold text-base flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                    >
                                        {cargando ? <ButtonSpinner /> : 'Guardar Nueva Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </LayoutPublic>
    );
}
