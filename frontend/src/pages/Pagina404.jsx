import { Link, useNavigate } from 'react-router-dom';
import LayoutPublic from '../components/LayoutPublic';

export default function Pagina404() {
    const navigate = useNavigate();

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Ilustración 404 */}
                    <div className="mb-8">
                        <div className="relative">
                            {/* Círculo de fondo */}
                            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-2xl">
                                {/* Casa con signo de interrogación */}
                                <div className="relative">
                                    <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                    </svg>
                                    {/* Signo de interrogación */}
                                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-xl">?</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Elementos decorativos flotantes */}
                            <div className="absolute top-8 left-8 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-16 right-12 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute bottom-12 left-16 w-5 h-5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
                                404
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
                                ¡Ups! Página no encontrada
                            </h2>
                            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                                La página que buscas no existe o ha sido movida. 
                                Pero no te preocupes, podemos ayudarte a encontrar lo que necesitas.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver atrás
                            </button>
                            
                            <Link
                                to="/"
                                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-500 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Ir al inicio
                            </Link>
                        </div>

                        {/* Enlaces útiles */}
                        <div className="pt-8 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-4">O explora nuestras secciones principales:</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/propiedades"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Propiedades
                                </Link>
                                
                                <Link
                                    to="/favoritos"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Mis Favoritos
                                </Link>
                                
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">
                                ¿Necesitas ayuda? <Link to="/" className="text-blue-600 hover:underline font-medium">Contacta con nosotros</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutPublic>
    );
}
