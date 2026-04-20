import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import LayoutPublic from '../components/LayoutPublic';
import { PageSpinner, ButtonSpinner } from '../components/Spinner';

export default function Registro() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState({});
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [cargando, setCargando] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);

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

    const handleRegistro = async (e) => {
        e.preventDefault();
        setMensaje('');
        setErrores({});

        const nuevosErrores = {};

        if (!name.trim()) nuevosErrores.name = 'El nombre es obligatorio';
        if (!email.trim()) nuevosErrores.email = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nuevosErrores.email = 'Correo inválido';
        // Validar teléfono solo si se proporciona (opcional)
        if (telefono.trim() && !/^[0-9]{10}$/.test(telefono.replace(/\s/g, ''))) {
            nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos';
        }
        if (!password.trim()) nuevosErrores.password = 'La contraseña es obligatoria';
        else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            nuevosErrores.password = 'Debe tener 8 caracteres, al menos una mayúscula y un número';
        }

        if (password !== confirmPassword) {
            nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
        }
        if (!confirmPassword.trim()) {
            nuevosErrores.confirmPassword = 'La confirmación es obligatoria';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        try {
            setCargando(true);
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                telefono: telefono.trim() || undefined, // Enviar undefined si está vacío
            });

            const { token, usuario, requireVerification } = res.data;

            if (requireVerification) {
                setRegistroExitoso(true);
                toast.success('¡Registro exitoso!', {
                    duration: 5000,
                    description: 'Hemos enviado un enlace de verificación a tu correo. Por favor revísalo para activar tu cuenta.'
                });
                // Redirigir al login después de unos segundos
                setTimeout(() => {
                    navigate('/login');
                }, 4000);
                return;
            }

            if (token && usuario) {
                localStorage.setItem('token', token); // Guarda el token
                localStorage.setItem('usuario', JSON.stringify(usuario)); // Guarda los datos del usuario

                // No disparamos 'authChange' aquí para evitar el flash del OverlaySpinner
                // La redirección se encargará de actualizar el estado en la nueva página

                setRegistroExitoso(true);

                toast.success('¡Cuenta creada exitosamente!', {
                    duration: 3000,
                    description: 'Serás redirigido al inicio en unos segundos...'
                });
                setTimeout(() => {
                    navigate('/'); // Redirige al inicio
                }, 2000);
            } else {
                setMensaje('Registro exitoso, pero no se pudo iniciar sesión automáticamente');
                setCargando(false);
            }
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || 'Error al registrar');
            setCargando(false);
        }

    };

    if (checkingAuth) return <PageSpinner text="Cargando..." />;

    return (
        <LayoutPublic>
            <div className="min-h-screen flex items-start pt-8 sm:pt-12 justify-center bg-slate-50 px-4 pb-12">
                <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100">
                    <div className="flex flex-col items-center mb-4">
                        <img
                            src="/logo-rectangular.png"
                            alt="PropTech Hub"
                            className="h-14 w-auto object-contain mb-3"
                        />
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                            Crear Cuenta
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 text-center">
                            Únete hoy y encuentra tu propiedad ideal
                        </p>
                    </div>

                    <form onSubmit={handleRegistro} className="space-y-3">
                        {/* Nombre */}
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.nombre ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            {errores.name && <p className="text-xs text-red-600 mt-1">{errores.name}</p>}
                        </div>

                        {/* Correo */}
                        <div className="relative">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            {errores.email && <p className="text-xs text-red-600 mt-1">{errores.email}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="relative">
                            <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.telefono ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            {errores.telefono && <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>}

                        </div>

                        {/* Contraseña */}
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                            {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${errores.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                            {errores.confirmPassword && <p className="text-xs text-red-600 mt-1">{errores.confirmPassword}</p>}
                        </div>

                        {/* Mensaje de error global */}
                        {mensaje && (
                            <div className="text-sm text-center text-red-600 font-medium">{mensaje}</div>
                        )}

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg shadow-md shadow-slate-200 transition-all duration-200 font-semibold text-base flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        >
                            {registroExitoso ? (
                                <>
                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                    <span>¡Cuenta Creada! Redirigiendo...</span>
                                </>
                            ) : cargando ? (
                                <>
                                    <ButtonSpinner />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                <span>Registrarse</span>
                            )}
                        </button>
                    </form>

                    {/* Ya tiene cuenta */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-slate-900 font-bold hover:underline transition duration-150"
                        >
                            Inicia Sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </LayoutPublic>
    );
}
