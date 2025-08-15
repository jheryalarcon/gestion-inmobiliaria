import { Link } from 'react-router-dom';

export default function NavbarPublica() {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo o nombre del sitio */}
          <Link to="/" className="text-2xl font-bold text-blue-700 tracking-tight">
            MiInmobiliaria
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white transition"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="px-4 py-2 rounded text-white bg-blue-700 hover:bg-blue-800 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 