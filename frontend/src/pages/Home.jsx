import { useEffect, useState } from 'react';
import NavbarPublica from '../components/NavbarPublica';
import CardPropiedad from '../components/CardPropiedad';
// import FiltroPropiedades from '../components/FiltroPropiedades'; // Descomenta si tienes este componente

export default function Home() {
  const [propiedades, setPropiedades] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Simulación de carga de propiedades (reemplaza con fetch real luego)
  useEffect(() => {
    // Aquí deberías hacer fetch a tu API pública de propiedades
    setTimeout(() => {
      setPropiedades([
        {
          id: 1,
          titulo: 'Casa moderna en Quito',
          ciudad: 'Quito',
          tipo_propiedad: 'casa',
          precio: 120000,
          estado_publicacion: 'disponible',
          imagenes: [],
        },
        {
          id: 2,
          titulo: 'Departamento en Guayaquil',
          ciudad: 'Guayaquil',
          tipo_propiedad: 'departamento',
          precio: 95000,
          estado_publicacion: 'disponible',
          imagenes: [],
        },
      ]);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPublica />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Propiedades disponibles</h1>
        {/* <FiltroPropiedades /> */}
        {mensaje && <p className="text-center text-red-600 mb-4">{mensaje}</p>}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {propiedades.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">Cargando propiedades...</p>
          ) : (
            propiedades.map((prop) => (
              <CardPropiedad key={prop.id} propiedad={prop} />
            ))
          )}
        </div>
      </main>
    </div>
  );
} 