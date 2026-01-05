import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelAdmin from './pages/PanelAdmin';
import PanelAgente from './pages/PanelAgente';
import RegistrarPropiedad from './pages/RegistrarPropiedad';
import EditarPropiedad from "./pages/EditarPropiedad.jsx";
import PanelPropiedades from './pages/PanelPropiedades';
import DetallePropiedad from './pages/DetallePropiedad';
import DetallePropiedadAdmin from './pages/DetallePropiedadAdmin';
import Home from './pages/Home';
import Propiedades from './pages/Propiedades'; // Importar el nuevo componente
import MisFavoritos from './pages/MisFavoritos';
import VerificarCuenta from './pages/VerificarCuenta';


import RecuperarPassword from './pages/RecuperarPassword';
import NuevaPassword from './pages/NuevaPassword';


import RegistrarCliente from './pages/RegistrarCliente';
import EditarCliente from './pages/EditarCliente';
import PanelNegociaciones from './pages/PanelNegociaciones';
import PanelClientes from './pages/PanelClientes';
import RegistrarAgente from './pages/RegistrarAgente';
import EditarAgente from './pages/EditarAgente';
import PanelAgentes from './pages/PanelAgentes';
import Pagina404 from './pages/Pagina404';


import RutaPrivada from './components/RutaPrivada';
import LayoutAdmin from './layouts/LayoutAdmin';
import LayoutAgente from './layouts/LayoutAgente';

import { Toaster } from 'sonner';

// Layout raíz para incluir el Toaster y el Outlet
const RootLayout = () => {
    return (
        <>
            <Toaster
                richColors
                position="top-right"
                expand={false}
                closeButton={true}
                duration={4000}
                maxVisibleToasts={3}
                toastOptions={{
                    style: {
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                }}
            />
            <Outlet />
        </>
    );
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<RootLayout />}>
            {/* Portal público - Directorio raíz */}
            <Route path="/" element={<Home />} />
            <Route path="/propiedades" element={<Propiedades />} /> {/* Nueva ruta para el listado de propiedades */}
            <Route path="/propiedad/:id" element={<DetallePropiedad />} />
            <Route path="/favoritos" element={<MisFavoritos />} />

            {/* Autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificar" element={<VerificarCuenta />} />
            <Route path="/olvide-password" element={<RecuperarPassword />} />
            <Route path="/olvide-password/:token" element={<NuevaPassword />} />
            <Route path="/restablecer-password" element={<NuevaPassword />} />

            {/* Rutas privadas - Admin */}
            <Route
                path="/admin"
                element={
                    <RutaPrivada rolRequerido="admin">
                        <LayoutAdmin />
                    </RutaPrivada>
                }
            >
                <Route index element={<Navigate to="panel-propiedades" replace />} />
                <Route path="registrar-propiedad" element={<RegistrarPropiedad />} />
                <Route path="panel-propiedades" element={<PanelPropiedades />} />
                <Route path="propiedad/:id" element={<DetallePropiedadAdmin />} />
                <Route path="editar-propiedad/:id" element={<EditarPropiedad />} />
                <Route path="registrar-cliente" element={<RegistrarCliente />} />
                <Route path="editar-cliente/:id" element={<EditarCliente />} />
                <Route path="panel-clientes" element={<PanelClientes />} />
                <Route path="panel-negociaciones" element={<PanelNegociaciones />} />
                <Route path="registrar-agente" element={<RegistrarAgente />} />
                <Route path="editar-agente/:id" element={<EditarAgente />} />
                <Route path="panel-agentes" element={<PanelAgentes />} />
            </Route>

            {/* Rutas privadas - Agente */}
            <Route
                path="/agente"
                element={
                    <RutaPrivada rolRequerido="agente">
                        <LayoutAgente />
                    </RutaPrivada>
                }
            >
                <Route index element={<Navigate to="panel-propiedades" replace />} />
                <Route path="registrar-propiedad" element={<RegistrarPropiedad />} />
                <Route path="panel-propiedades" element={<PanelPropiedades />} />
                <Route path="propiedad/:id" element={<DetallePropiedadAdmin />} />
                <Route path="editar-propiedad/:id" element={<EditarPropiedad />} />
                <Route path="registrar-cliente" element={<RegistrarCliente />} />
                <Route path="editar-cliente/:id" element={<EditarCliente />} />
                <Route path="panel-clientes" element={<PanelClientes />} />
                <Route path="panel-negociaciones" element={<PanelNegociaciones />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<Pagina404 />} />
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
