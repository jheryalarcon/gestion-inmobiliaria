import BotonLogout from '../components/BotonLogout';

function PanelAgente() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Panel del Agente</h1>
            <p className="mb-4">Hola, {usuario?.email}. Tu rol es: {usuario?.rol}</p>
            <BotonLogout />
        </div>
    );
}

export default PanelAgente;
