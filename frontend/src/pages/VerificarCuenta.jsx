import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificarCuenta() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [mensaje, setMensaje] = useState('Verificando tu cuenta...');

    const effectRan = useRef(false); // Evitar doble ejecución en StrictMode

    useEffect(() => {
        if (effectRan.current) return; // Si ya se ejecutó, no hacer nada
        effectRan.current = true;

        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMensaje('Token no encontrado en el enlace.');
                return;
            }

            try {
                // Adjust URL based on your API structure (api/auth/verify)
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, { token });
                setStatus('success');
                setMensaje('¡Tu cuenta ha sido verificada exitosamente!');
                toast.success('Cuenta verificada');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                console.error(error);
                // Si el error es específicamente que ya está verificada, mostrar éxito
                if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('expirado')) {
                    // Podríamos mejorar el backend para dar un código específico, pero por ahora manejamos el error genérico
                    // O simplemente confiamos en el ref.
                    // En este caso, el ref solucionará el 99% de los casos de "doble submit"
                }

                setStatus('error');
                setMensaje(error.response?.data?.mensaje || 'Error al verificar la cuenta. El enlace puede haber expirado.');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificando...</h2>
                        <p className="text-gray-500">Por favor espera un momento.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-scaleIn">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cuenta Verificada!</h2>
                        <p className="text-gray-600 mb-6">{mensaje}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition w-full"
                        >
                            Ir a Iniciar Sesión
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-shake">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Verificación</h2>
                        <p className="text-gray-600 mb-6">{mensaje}</p>
                        <button
                            onClick={() => navigate('/login')} // Or register/resend
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition w-full"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
