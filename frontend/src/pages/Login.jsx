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

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verPassword, setVerPassword] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState({});
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const usuario = jwtDecode(token);
                if (usuario.rol === 'admin') return navigate('/admin');
                if (usuario.rol === 'agente') return navigate('/agente');
                if (usuario.rol === 'cliente') return navigate('/cliente');
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
            const respuesta = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password,
            });

            const { token, usuario } = respuesta.data;

            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            if (usuario.rol === 'admin') navigate('/admin');
            else if (usuario.rol === 'agente') navigate('/agente');
            else navigate('/cliente');
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
        }
    };

    if (checkingAuth) return <div className="text-center mt-10">Cargando...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Iniciar Sesión</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Correo */}
                    <div className="relative">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                                errores.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
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
                            className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 ${
                                errores.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
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
                        {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
                    </div>

                    {/* Mensaje global de error */}
                    {mensaje && (
                        <div className="text-sm text-center text-red-600 font-medium">{mensaje}</div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow-md transition duration-200 font-semibold"
                    >
                        Ingresar
                    </button>
                </form>

                {/* No tiene cuenta */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    ¿No tienes una cuenta?{' '}
                    <Link
                        to="/registro"
                        className="text-blue-600 font-medium hover:underline transition duration-150"
                    >
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
