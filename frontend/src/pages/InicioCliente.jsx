import BotonLogout from '../components/BotonLogout';

function InicioCliente() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Bienvenido, cliente</h1>
            <p className="mb-4">Hola, {usuario?.nombre}. Tu rol es: {usuario?.rol}</p>
            <BotonLogout />
        </div>
    );
}

export default InicioCliente;
