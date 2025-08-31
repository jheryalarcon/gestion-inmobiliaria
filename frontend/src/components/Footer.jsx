import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo y descripción */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">MiInmobiliaria</h3>
                        <p className="text-gray-300 mb-4">
                            Tu socio de confianza para encontrar la propiedad perfecta. 
                            Ofrecemos una amplia selección de propiedades en las mejores ubicaciones.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <span className="sr-only">Facebook</span>
                                📘
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <span className="sr-only">Instagram</span>
                                📷
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <span className="sr-only">WhatsApp</span>
                                📱
                            </a>
                        </div>
                    </div>

                    {/* Enlaces rápidos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Enlaces rápidos</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-white transition">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/propiedades" className="text-gray-300 hover:text-white transition">
                                    Propiedades
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-300 hover:text-white transition">
                                    Iniciar sesión
                                </Link>
                            </li>
                            <li>
                                <Link to="/registro" className="text-gray-300 hover:text-white transition">
                                    Registrarse
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>📍 Quito, Ecuador</li>
                            <li>📞 +593 2 123 4567</li>
                            <li>✉️ info@miinmobiliaria.com</li>
                            <li>🕒 Lun - Vie: 9:00 - 18:00</li>
                        </ul>
                    </div>
                </div>

                {/* Línea divisoria */}
                <div className="border-t border-gray-700 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 MiInmobiliaria. Todos los derechos reservados.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                                Política de privacidad
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                                Términos de servicio
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

