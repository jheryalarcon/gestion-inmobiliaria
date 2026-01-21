import { Trash2, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function FormNegocio({
    datos,
    handleChange,
    errores,
    usuario,
    agentes,
    clientes, // Recibimos la lista completa
    busquedaCliente,
    setBusquedaCliente,
    filtrarClientes,
    agregarPropietario,
    handleRemovePropietario,
    handlePropietarioChange
}) {
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const searchRef = useRef(null);
    const [duracionMeses, setDuracionMeses] = useState('');

    const [mostrarAgentes, setMostrarAgentes] = useState(false);
    const [busquedaAgente, setBusquedaAgente] = useState('');
    const agentRef = useRef(null);

    // Derived state for Agent Search
    // Si no estamos buscando, y hay un agente seleccionado, mostrar su nombre.
    // Si estamos buscando, mostrar el texto de búsqueda.
    const getAgenteInputValue = () => {
        if (mostrarAgentes) return busquedaAgente; // Mientras busca/escribe
        if (datos.agenteId) {
            const selected = agentes.find(a => a.id === parseInt(datos.agenteId));
            return selected ? (selected.name || selected.email) : '';
        }
        return '';
    };

    const agentesFiltrados = agentes.filter(agente => {
        const term = busquedaAgente.toLowerCase();
        const name = (agente.name || '').toLowerCase();
        const email = (agente.email || '').toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    const clientesAMostrar = mostrarTodos
        ? clientes.slice(0, 10)
        : filtrarClientes();

    // Click Outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cliente Search
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setMostrarTodos(false);
            }
            // Agente Search
            if (agentRef.current && !agentRef.current.contains(event.target)) {
                setMostrarAgentes(false);
                // Si cierra sin seleccionar y había texto, limpiar búsqueda para mostrar el seleccionado real (o vacío)
                setBusquedaAgente('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        setBusquedaCliente(e.target.value);
        setMostrarTodos(false);
    };

    const handleDuracionChange = (e) => {
        const meses = e.target.value;
        setDuracionMeses(meses);

        if (!meses || isNaN(meses)) return;

        // Base: Captación o Hoy
        // Nota: new Date('YYYY-MM-DD') es UTC, new Date() es Local. toISOString() normaliza.
        const fechaBase = datos.fecha_captacion ? new Date(datos.fecha_captacion) : new Date();

        // Sumar meses
        fechaBase.setMonth(fechaBase.getMonth() + parseInt(meses));

        handleChange({
            target: {
                name: 'fecha_fin_contrato',
                value: fechaBase.toISOString().split('T')[0]
            }
        });
    };

    const handleCaptacionChange = (e) => {
        handleChange(e); // Actualizar captación

        // Si hay duración establecida, recalcular fin
        if (duracionMeses && !isNaN(duracionMeses) && e.target.value) {
            const fechaBase = new Date(e.target.value);
            fechaBase.setMonth(fechaBase.getMonth() + parseInt(duracionMeses));

            handleChange({
                target: {
                    name: 'fecha_fin_contrato',
                    value: fechaBase.toISOString().split('T')[0]
                }
            });
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                    Información del Negocio (Privado)
                </h3>
            </div>

            <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex gap-3">
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-600">
                        Esta información es <strong>confidencial</strong> y solo visible para agentes.
                        Útil para gestionar el contrato y la relación con el propietario.
                    </p>
                </div>

                {/* SECCIÓN 1: PROPIETARIOS */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        1. Propietarios
                    </h4>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                        {/* Buscador */}
                        <div className="mb-6 relative" ref={searchRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar y agregar propietario <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre, email o cédula... (Doble clic para ver todos)"
                                value={busquedaCliente}
                                onChange={handleSearchChange}
                                onDoubleClick={() => setMostrarTodos(true)}
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition text-sm ${errores.propietarios ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {(busquedaCliente || mostrarTodos) && (
                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                    {clientesAMostrar.length > 0 ? (
                                        clientesAMostrar.map(cliente => (
                                            <div
                                                key={cliente.id}
                                                onClick={() => {
                                                    agregarPropietario(cliente);
                                                    setMostrarTodos(false);
                                                }}
                                                className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 group transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-gray-800 group-hover:text-orange-700 transition">{cliente.nombre}</p>
                                                    {cliente.cedula && <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">CI: {cliente.cedula}</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{cliente.email}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 text-sm text-center">No se encontraron clientes</div>
                                    )}
                                </div>
                            )}
                            {errores.propietarios && (
                                <p className="text-red-600 text-sm font-medium mt-2 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                                    <span className="text-lg">❌</span> {errores.propietarios}
                                </p>
                            )}
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Propietario</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">% Part.</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Principal</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {datos.propietarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic text-sm">
                                                No hay propietarios asignados.
                                            </td>
                                        </tr>
                                    ) : (
                                        datos.propietarios.map((p, idx) => (
                                            <tr key={p.clienteId || idx} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 text-sm">{p.nombre}</div>
                                                    <div className="text-xs text-gray-500">{p.email}</div>
                                                    {p.cedula && <div className="text-[10px] text-gray-400 mt-0.5">CI: {p.cedula}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500 shadow-sm">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={p.porcentaje}
                                                            onChange={(e) => handlePropietarioChange(idx, 'porcentaje', e.target.value)}
                                                            className="w-full text-right text-sm outline-none bg-transparent"
                                                            placeholder="0"
                                                        />
                                                        <span className="ml-1 text-gray-400 text-xs">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name="propietario_principal"
                                                        checked={p.es_principal}
                                                        onChange={() => handlePropietarioChange(idx, 'es_principal', true)}
                                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer border-gray-300"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePropietario(idx)}
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                                        title="Eliminar propietario"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex justify-end items-center gap-2 text-sm">
                            <span className="text-gray-500">Total Participación:</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${Math.round(datos.propietarios.reduce((acc, curr) => acc + parseFloat(curr.porcentaje || 0), 0)) === 100
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'}`}>
                                {datos.propietarios.reduce((acc, curr) => acc + parseFloat(curr.porcentaje || 0), 0).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: DATOS FINANCIEROS */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        2. Datos Financieros
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* PRECIO (Obligatorio) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {datos.transaccion === 'alquiler' ? 'Precio Alquiler' : 'Precio Venta'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={datos.precio}
                                    onChange={handleChange}
                                    className={`w-full pl-8 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition text-gray-900 font-medium ${errores.precio ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errores.precio && <p className="text-red-600 text-xs mt-1">{errores.precio}</p>}
                        </div>

                        {/* PRECIO MÍNIMO */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Mínimo (Piso)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    name="precio_minimo"
                                    value={datos.precio_minimo}
                                    onChange={handleChange}
                                    className="w-full pl-8 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Solo visible internamente.</p>
                        </div>

                        {/* GARANTÍA (Solo Alquiler) */}
                        {datos.transaccion === 'alquiler' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor de Garantía <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                                    <input
                                        type="number"
                                        name="valor_garantia"
                                        value={datos.valor_garantia}
                                        onChange={handleChange}
                                        className={`w-full pl-8 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.valor_garantia ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errores.valor_garantia && <p className="text-red-600 text-xs mt-1">{errores.valor_garantia}</p>}
                            </div>
                        )}

                        {/* COMISIÓN */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Comisión Pactada <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="comision"
                                    value={datos.comision}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.comision ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder={datos.tipo_comision === 'porcentaje' ? 'Ej: 3' : 'Ej: 3000'}
                                />
                                <select
                                    name="tipo_comision"
                                    value={datos.tipo_comision}
                                    onChange={handleChange}
                                    className="w-24 border border-gray-300 rounded-lg px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 font-medium"
                                >
                                    <option value="porcentaje">%</option>
                                    <option value="fijo">$USD</option>
                                </select>
                            </div>

                            <div className="flex items-center mt-2 gap-2">
                                <input
                                    type="checkbox"
                                    name="mas_iva"
                                    id="mas_iva"
                                    checked={datos.mas_iva || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="mas_iva" className="text-xs text-gray-600 cursor-pointer select-none">
                                    Más IVA (15%)
                                </label>
                            </div>

                            <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                {datos.precio && datos.comision ? (() => {
                                    const subtotal = datos.tipo_comision === 'porcentaje'
                                        ? (datos.precio * datos.comision) / 100
                                        : parseFloat(datos.comision);

                                    const iva = datos.mas_iva ? subtotal * 0.15 : 0;
                                    const total = subtotal + iva;

                                    return (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                                            </div>
                                            {datos.mas_iva && (
                                                <div className="flex justify-between text-gray-400">
                                                    <span>+ IVA (15%):</span>
                                                    <span>${iva.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-0.5 font-bold text-gray-700">
                                                <span>Total a Facturar:</span>
                                                <span className="text-green-600">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <span className="italic">Ingrese precio y comisión para calcular total.</span>
                                )}
                            </div>
                            {errores.comision && <p className="text-red-600 text-xs mt-1">{errores.comision}</p>}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: GESTIÓN Y CONTRATO */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        3. Gestión y Contrato
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* COLUMNA IZQUIERDA: CONTRATO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Contrato <span className="text-red-500">*</span></label>
                                <select
                                    name="tipo_contrato"
                                    value={datos.tipo_contrato}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.tipo_contrato ? 'border-red-300' : 'border-gray-300'}`}
                                >
                                    <option value="" disabled hidden>Seleccionar tipo...</option>
                                    <option value="exclusividad">Exclusividad</option>
                                    <option value="no_exclusivo">No Exclusivo (Abierto)</option>
                                </select>
                                {errores.tipo_contrato && <p className="text-red-600 text-xs mt-1">{errores.tipo_contrato}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Captación <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="fecha_captacion"
                                    value={datos.fecha_captacion ? datos.fecha_captacion.split('T')[0] : ''}
                                    onChange={handleCaptacionChange}
                                    className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition text-sm ${errores.fecha_captacion ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errores.fecha_captacion && <p className="text-red-600 text-[10px] mt-1">{errores.fecha_captacion}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Vencimiento {datos.tipo_contrato && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin_contrato"
                                    value={datos.fecha_fin_contrato ? datos.fecha_fin_contrato.split('T')[0] : ''}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setDuracionMeses('');
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition text-sm ${errores.fecha_fin_contrato ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errores.fecha_fin_contrato && <p className="text-red-600 text-[10px] mt-1">{errores.fecha_fin_contrato}</p>}
                            </div>

                            <div className="col-span-2 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500">¿Duración en meses?</span>
                                <input
                                    type="number"
                                    placeholder="#"
                                    value={duracionMeses}
                                    onChange={handleDuracionChange}
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:ring-1 focus:ring-orange-500"
                                />
                                <span className="text-[10px] text-gray-400 italic">Auto-calcula vencimiento</span>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: AGENTE (Solo Admin) */}
                        {/* COLUMNA DERECHA: AGENTE (Solo visible en Creación - oculto en Edición para no confundir) */}
                        {!datos.id && (
                            <div className="border-l border-gray-100 pl-8">
                                {/* Mostrar Selector SOLO si es Admin Y es Creación (No tiene ID) */}
                                {usuario?.rol === 'admin' && !datos.id ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Agente Responsable <span className="text-red-500">*</span></label>
                                        <p className="text-xs text-gray-500 mb-2">Quien gestionará los leads y visitas de esta propiedad.</p>

                                        <div className="relative" ref={agentRef}>
                                            <input
                                                type="text"
                                                placeholder="Buscar agente..."
                                                value={getAgenteInputValue()}
                                                onChange={(e) => {
                                                    setBusquedaAgente(e.target.value);
                                                    setMostrarAgentes(true);
                                                }}
                                                onClick={() => {
                                                    setMostrarAgentes(true);
                                                    // Si ya hay uno seleccionado, permitir buscar:
                                                    if (datos.agenteId) {
                                                        const selected = agentes.find(a => a.id === parseInt(datos.agenteId));
                                                        setBusquedaAgente(selected ? selected.name : '');
                                                    }
                                                }}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.agenteId ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                            {errores.agenteId && <p className="text-red-600 text-xs mt-1">{errores.agenteId}</p>}

                                            {mostrarAgentes && (
                                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                                    {agentesFiltrados.length > 0 ? (
                                                        agentesFiltrados.map(agente => (
                                                            <div
                                                                key={agente.id}
                                                                onClick={() => {
                                                                    handleChange({ target: { name: 'agenteId', value: agente.id } });
                                                                    setMostrarAgentes(false);
                                                                    setBusquedaAgente('');
                                                                }}
                                                                className={`px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 group transition-colors ${parseInt(datos.agenteId) === agente.id ? 'bg-orange-50' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <p className={`font-semibold text-sm ${usuario?.id === agente.id ? 'text-orange-700' : 'text-gray-800'}`}>
                                                                        {agente.name}
                                                                        {usuario?.id === agente.id && <span className="ml-1 text-xs font-normal text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">(Tú)</span>}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-0.5">{agente.email}</p>
                                                                <div className="flex gap-1 mt-1">
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${usuario?.id === agente.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        {agente.rol}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-gray-500 text-sm text-center">No se encontraron agentes</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-center items-center text-gray-400 text-sm italic bg-gray-50 rounded-lg p-4">
                                        <p>Propiedad asignada a:</p>
                                        <p className="font-semibold text-gray-600">
                                            {datos.agenteId
                                                ? (agentes.find(a => a.id == datos.agenteId) || datos.agente || { name: 'Desconocido' }).name
                                                : (usuario.nombre || usuario.email)
                                            }
                                        </p>
                                        <span className="text-xs text-orange-400 mt-1 not-italic border border-orange-200 px-2 py-0.5 rounded-full bg-orange-50">
                                            {datos.id ? 'No editable' : 'Asignación Automática'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
