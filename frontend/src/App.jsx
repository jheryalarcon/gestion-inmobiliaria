import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelAdmin from './pages/PanelAdmin';
import PanelAgente from './pages/PanelAgente';
import InicioCliente from './pages/InicioCliente';
import RegistrarPropiedad from './pages/RegistrarPropiedad';
import EditarPropiedad from "./pages/EditarPropiedad.jsx";
import PanelPropiedades from './pages/PanelPropiedades';
import DetallePropiedad from './pages/DetallePropiedad';
import Home from './pages/Home';
import Propiedades from './pages/Propiedades'; // Importar el nuevo componente
import MisFavoritos from './pages/MisFavoritos';

import RutaPrivada from './components/RutaPrivada';
import LayoutAdmin from './layouts/LayoutAdmin';
import LayoutAgente from './layouts/LayoutAgente';
import LayoutCliente from './layouts/LayoutCliente';

import { Toaster } from 'sonner';

function App() {
    return (
        <>
            <Toaster richColors position="top-right" />
            <Routes>
                {/* Portal público - Directorio raíz */}
                <Route path="/" element={<Home/>}/>
                <Route path="/propiedades" element={<Propiedades/>}/> {/* Nueva ruta para el listado de propiedades */}
                <Route path="/propiedad/:id" element={<DetallePropiedad/>}/>
                <Route path="/favoritos" element={<MisFavoritos/>}/>
                
                {/* Autenticación */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/registro" element={<Registro/>}/>

                {/* Rutas privadas - Admin */}
                <Route
                    path="/admin"
                    element={
                        <RutaPrivada rolRequerido="admin">
                            <LayoutAdmin/>
                        </RutaPrivada>
                    }
                >
                    <Route index element={<PanelAdmin/>}/>
                    <Route path="registrar-propiedad" element={<RegistrarPropiedad/>}/>
                    <Route path="panel-propiedades" element={<PanelPropiedades/>}/>
                    <Route path="editar-propiedad/:id" element={<EditarPropiedad/>}/>
                </Route>

                {/* Rutas privadas - Agente */}
                <Route
                    path="/agente"
                    element={
                        <RutaPrivada rolRequerido="agente">
                            <LayoutAgente/>
                        </RutaPrivada>
                    }
                >
                    <Route index element={<PanelAgente/>}/>
                    <Route path="registrar-propiedad" element={<RegistrarPropiedad/>}/>
                    <Route path="panel-propiedades" element={<PanelPropiedades/>}/>
                    <Route path="editar-propiedad/:id" element={<EditarPropiedad/>}/>
                </Route>

                {/* Rutas privadas - Cliente */}
                <Route
                    path="/cliente"
                    element={
                        <RutaPrivada rolRequerido="cliente">
                            <LayoutCliente/>
                        </RutaPrivada>
                    }
                >
                    <Route index element={<InicioCliente/>}/>
                </Route>

                {/* Ruta global para editar propiedad (accesible desde cualquier panel) */}
                <Route
                    path="/editar-propiedad/:id"
                    element={
                        <RutaPrivada rolRequerido={['admin', 'agente']}>
                            <EditarPropiedad/>
                        </RutaPrivada>
                    }
                />

                {/* Ruta 404 */}
                <Route path="*" element={<h1 className="text-center mt-10 text-red-600">404 - Página no encontrada</h1>}/>
            </Routes>
        </>
    );
}

export default App;
