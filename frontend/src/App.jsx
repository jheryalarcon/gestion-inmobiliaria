import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelAdmin from './pages/PanelAdmin';
import PanelAgente from './pages/PanelAgente';
import InicioCliente from './pages/InicioCliente';
import RegistrarPropiedad from './pages/RegistrarPropiedad';
import EditarPropiedad from "./pages/ EditarPropiedad.jsx";
import PanelPropiedades from './pages/PanelPropiedades';
import DetallePropiedad from './pages/DetallePropiedad';

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
                <Route path="/" element={<Login/>}/>
                <Route path="/registro" element={<Registro/>}/>

                {/* ADMIN */}
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
                </Route>

                {/* AGENTE */}
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
                </Route>

                {/* CLIENTE */}
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

                <Route
                    path="/propiedad/:id"
                    element={
                        <RutaPrivada rolRequerido={['admin', 'agente']}>
                            <DetallePropiedad/>
                        </RutaPrivada>
                    }
                />

                <Route
                    path="/editar-propiedad/:id"
                    element={
                        <RutaPrivada rolRequerido={["admin", "agente"]}>
                            <EditarPropiedad/>
                        </RutaPrivada>
                    }
                />

                <Route path="*"
                       element={<h1 className="text-center mt-10 text-red-600">404 - Página no encontrada</h1>}/>
            </Routes>

        </>
    );
}

export default App;
