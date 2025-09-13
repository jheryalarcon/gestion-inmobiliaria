import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from  '@heroicons/react/24/solid';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import LayoutPublic from '../components/LayoutPublic';

export default function Registro() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
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
        else if (password.length < 6) nuevosErrores.password = 'Debe tener al menos 6 carácteres';

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        try {
            const res = await axios.post('http://localhost:3000/api/auth/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                telefono: telefono.trim() || undefined, // Enviar undefined si está vacío
            });

            const { token, usuario } = res.data;

            if (token && usuario) {
                localStorage.setItem('token', token); // Guarda el token
                localStorage.setItem('usuario', JSON.stringify(usuario)); // Guarda los datos del usuario
                
                // Disparar evento para actualizar otros componentes
                window.dispatchEvent(new Event('authChange'));
                
                toast.success('¡Cuenta creada exitosamente!', { 
                    duration: 3000,
                    description: 'Serás redirigido al inicio en unos segundos...'
                });
                setTimeout(() => {
                    navigate('/'); // Redirige al inicio
                }, 2000);
            } else {
                setMensaje('Registro exitoso, pero no se pudo iniciar sesión automáticamente');
            }
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || 'Error al registrar');
        }

    };

    if (checkingAuth) return <div className="text-center mt-10">Cargando...</div>;

    return (
        <LayoutPublic>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4 py-12">
                <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Crear Cuenta</h2>

                    <form onSubmit={handleRegistro} className="space-y-4">
                        {/* Nombre */}
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                                    errores.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errores.name && <p className="text-xs text-red-600 mt-1">{errores.name}</p>}
                        </div>

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

                        {/* Teléfono */}
                        <div className="relative">
                            <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                                    errores.telefono ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errores.telefono && <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>}
                            
                        </div>

                        {/* Contraseña */}
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                                    errores.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
                        </div>

                        {/* Mensaje de error global */}
                        {mensaje && (
                            <div className="text-sm text-center text-red-600 font-medium">{mensaje}</div>
                        )}

                        {/* Botón */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow-md transition duration-200 font-semibold"
                        >
                            Registrarse
                        </button>
                    </form>

                    {/* Ya tiene cuenta */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-blue-600 font-medium hover:underline transition duration-150"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </LayoutPublic>
    );
}
