import prisma from '../prisma/client.js'
import imageConfig from '../config/images.js'
import axios from 'axios'

export const crearPropiedad = async (req, res) => {
    const {
        titulo,
        descripcion,
        tipo_propiedad,
        estado_propiedad,
        transaccion,
        precio,
        moneda,
        direccion,
        ciudad,
        provincia,
        codigo_postal,
        latitud,
        longitud,
        area_terreno,
        area_construccion,
        nro_habitaciones,
        nro_banos,
        nro_parqueaderos,
        nro_pisos,
        anio_construccion,
        estado_publicacion,
        agenteId: agenteIdEnviado,
    } = req.body;

    const usuario = req.usuario;
    const archivos = req.files;

    const errores = [];

    if (!titulo?.trim()) errores.push('El título es obligatorio');
    if (!tipo_propiedad) errores.push('El tipo de propiedad es obligatorio');
    if (!estado_propiedad) errores.push('El estado físico de la propiedad es obligatorio');
    if (!transaccion) errores.push('El tipo de transacción es obligatorio');
    if (isNaN(Number(precio)) || Number(precio) <= 0) errores.push('El precio debe ser un número positivo');

    if (!direccion?.trim()) errores.push('La dirección es obligatoria');
    if (!ciudad?.trim()) errores.push('La ciudad es obligatoria');
    if (!provincia) errores.push('La provincia es obligatoria');

    if (isNaN(Number(area_terreno)) || Number(area_terreno) <= 0) {
        errores.push('Área del terreno inválida');
    }

    // VALIDACIONES CONDICIONALES
    if (descripcion !== undefined && descripcion.trim().length === 0) {
        errores.push('Si proporciona una descripción, no puede estar vacía');
    }

    if (area_construccion !== undefined && area_construccion !== '') {
        const val = Number(area_construccion);
        if (isNaN(val) || val < 0) errores.push('Área de construcción inválida');
    }

    if (nro_habitaciones !== undefined && nro_habitaciones !== '') {
        const val = Number(nro_habitaciones);
        if (isNaN(val) || val < 0) errores.push('Número de habitaciones inválido');
    }

    if (nro_banos !== undefined && nro_banos !== '') {
        const val = Number(nro_banos);
        if (isNaN(val) || val < 0) errores.push('Número de baños inválido');
    }

    if (nro_parqueaderos !== undefined && nro_parqueaderos !== '') {
        const val = Number(nro_parqueaderos);
        if (isNaN(val) || val < 0) errores.push('Número de parqueaderos inválido');
    }

    if (nro_pisos !== undefined && nro_pisos !== '') {
        const val = Number(nro_pisos);
        if (isNaN(val) || val < 0) errores.push('Número de pisos inválido');
    }

    if (!archivos || archivos.length === 0) {
        errores.push('Debe subir al menos una imagen');
    }

    // VALIDACIÓN DE AGENTE
    let agenteId;
    if (usuario.rol === 'admin') {
        if (!agenteIdEnviado) {
            errores.push('Debe seleccionar un agente para la propiedad');
        } else {
            agenteId = parseInt(agenteIdEnviado);
        }
    } else if (usuario.rol === 'agente') {
        agenteId = usuario.id;
    } else {
        errores.push('No tiene permisos para registrar propiedades');
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Validación fallida', errores });
    }

    try {
        const propiedad = await prisma.propiedad.create({
            data: {
                titulo,
                descripcion: descripcion?.trim() || null,
                tipo_propiedad,
                estado_propiedad,
                transaccion,
                precio: parseFloat(precio),
                moneda,
                direccion,
                ciudad,
                provincia,
                pais: 'Ecuador',
                codigo_postal: codigo_postal || null,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                area_construccion: area_construccion ? parseFloat(area_construccion) : null,
                nro_habitaciones: nro_habitaciones ? parseInt(nro_habitaciones) : null,
                nro_banos: nro_banos ? parseInt(nro_banos) : null,
                nro_parqueaderos: nro_parqueaderos ? parseInt(nro_parqueaderos) : null,
                nro_pisos: nro_pisos ? parseInt(nro_pisos) : null,
                anio_construccion: anio_construccion ? parseInt(anio_construccion) : null,
                estado_publicacion: estado_publicacion || 'disponible',
                agenteId,
            },
        });

        const imagenes = archivos.map((file) => ({
            url: `/uploads/${file.filename}`,
            propiedadId: propiedad.id,
        }));

        await prisma.imagen.createMany({ data: imagenes });

        res.status(201).json({
            mensaje: 'Propiedad registrada correctamente',
            propiedad,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar la propiedad' });
    }
};

export const obtenerPropiedades = async (req, res) => {
    const usuario = req.usuario;
    const { includeAgente } = req.query; // Nuevo parámetro para incluir info del agente

    try {
        let propiedades;

        if (usuario.rol === 'admin') {
            propiedades = await prisma.propiedad.findMany({
                where: {
                    estado_publicacion: {
                        not: 'inactiva',
                    },
                },
                include: { 
                    imagenes: true,
                    ...(includeAgente === 'true' && {
                        agente: {
                            select: { id: true, name: true, email: true }
                        }
                    })
                },
                orderBy: { createdAt: 'desc' },
            });
        } else if (usuario.rol === 'agente') {
            propiedades = await prisma.propiedad.findMany({
                where: {
                    agenteId: usuario.id,
                    estado_publicacion: {
                        not: 'inactiva',
                    },
                },
                include: { 
                    imagenes: true,
                    ...(includeAgente === 'true' && {
                        agente: {
                            select: { id: true, name: true, email: true }
                        }
                    })
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Cliente u otro
            propiedades = [];
        }

        // 🖼️ Convertir URLs de imágenes a absolutas
        console.log('🔍 Backend - Propiedades antes de procesar:', propiedades);
        const propiedadesProcesadas = imageConfig.procesarImagenes(propiedades);
        console.log('🔍 Backend - Propiedades después de procesar:', propiedadesProcesadas);
        return res.json(propiedadesProcesadas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener propiedades' });
    }
};

// 🏠 NUEVA FUNCIÓN: Obtener propiedades disponibles para negociaciones
// Permite a admin y agente ver todas las propiedades disponibles del sistema
export const obtenerPropiedadesParaNegociaciones = async (req, res) => {
    const usuario = req.usuario;
    const { includeAgente = 'true' } = req.query;

    try {
        // Solo admin y agente pueden acceder
        if (usuario.rol !== 'admin' && usuario.rol !== 'agente') {
            return res.status(403).json({ 
                mensaje: 'Acceso solo para administradores y agentes' 
            });
        }

        // ✅ Obtener SOLO propiedades DISPONIBLES del sistema
        const propiedades = await prisma.propiedad.findMany({
            where: {
                estado_publicacion: 'disponible', // Solo propiedades disponibles
            },
            include: { 
                imagenes: true,
                ...(includeAgente === 'true' && {
                    agente: {
                        select: { id: true, name: true, email: true }
                    }
                })
            },
            orderBy: { createdAt: 'desc' },
        });

        // 🖼️ Convertir URLs de imágenes a absolutas
        console.log('🔍 Backend - Propiedades para negociaciones antes de procesar:', propiedades);
        const propiedadesProcesadas = imageConfig.procesarImagenes(propiedades);
        console.log('🔍 Backend - Propiedades para negociaciones después de procesar:', propiedadesProcesadas);
        return res.json(propiedadesProcesadas);
    } catch (error) {
        console.error('Error al obtener propiedades para negociaciones:', error);
        return res.status(500).json({ 
            mensaje: 'Error al obtener propiedades para negociaciones' 
        });
    }
};

export const obtenerPropiedadPorId = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const propiedad = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) },
            include: {
                imagenes: true,
                agente: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        if (usuario.rol === 'cliente') {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }

        if (usuario.rol === 'agente' && propiedad.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: 'No tiene permiso para ver esta propiedad' });
        }

        // 🖼️ Convertir URLs de imágenes a absolutas
        res.json(imageConfig.procesarImagenes(propiedad));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la propiedad' });
    }
};

export const actualizarPropiedad = async (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        descripcion,
        tipo_propiedad,
        estado_propiedad,
        transaccion,
        precio,
        moneda,
        direccion,
        ciudad,
        provincia,
        codigo_postal,
        latitud,
        longitud,
        area_terreno,
        area_construccion,
        nro_habitaciones,
        nro_banos,
        nro_parqueaderos,
        nro_pisos,
        anio_construccion,
        estado_publicacion,
        agenteId: agenteIdEnviado,
    } = req.body;

    let imagenesAEliminar = req.body.imagenesAEliminar || [];
    if (!Array.isArray(imagenesAEliminar)) {
        imagenesAEliminar = [imagenesAEliminar]; // si solo llega una
    }

    const usuario = req.usuario;
    const archivos = req.files;
    const errores = [];

    // Validación general (igual que crearPropiedad)
    if (!titulo?.trim()) errores.push('El título es obligatorio');
    if (!tipo_propiedad) errores.push('El tipo de propiedad es obligatorio');
    if (!estado_propiedad) errores.push('El estado físico de la propiedad es obligatorio');
    if (!transaccion) errores.push('El tipo de transacción es obligatorio');
    if (isNaN(Number(precio)) || Number(precio) <= 0) errores.push('El precio debe ser un número positivo');
    if (!direccion?.trim()) errores.push('La dirección es obligatoria');
    if (!ciudad?.trim()) errores.push('La ciudad es obligatoria');
    if (!provincia) errores.push('La provincia es obligatoria');
    if (isNaN(Number(area_terreno)) || Number(area_terreno) <= 0) {
        errores.push('Área del terreno inválida');
    }

    // VALIDACIONES CONDICIONALES (solo si se envían)
    if (descripcion !== undefined && descripcion.trim().length === 0) {
        errores.push('Si proporciona una descripción, no puede estar vacía');
    }
    if (area_construccion !== undefined && area_construccion !== '') {
        const val = Number(area_construccion);
        if (isNaN(val) || val < 0) errores.push('Área de construcción inválida');
    }
    if (nro_habitaciones !== undefined && nro_habitaciones !== '') {
        const val = Number(nro_habitaciones);
        if (isNaN(val) || val < 0) errores.push('Número de habitaciones inválido');
    }
    if (nro_banos !== undefined && nro_banos !== '') {
        const val = Number(nro_banos);
        if (isNaN(val) || val < 0) errores.push('Número de baños inválido');
    }
    if (nro_parqueaderos !== undefined && nro_parqueaderos !== '') {
        const val = Number(nro_parqueaderos);
        if (isNaN(val) || val < 0) errores.push('Número de parqueaderos inválido');
    }
    if (nro_pisos !== undefined && nro_pisos !== '') {
        const val = Number(nro_pisos);
        if (isNaN(val) || val < 0) errores.push('Número de pisos inválido');
    }

    // Agente responsable
    let agenteId;
    if (usuario.rol === 'admin') {
        if (!agenteIdEnviado) {
            errores.push('Debe seleccionar un agente responsable');
        } else {
            agenteId = parseInt(agenteIdEnviado);
        }
    } else if (usuario.rol === 'agente') {
        agenteId = usuario.id;
    } else {
        errores.push('No tiene permisos para editar propiedades');
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Errores de validación', errores });
    }

    try {
        // Verifica que exista y que tenga permiso
        const propiedadExistente = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!propiedadExistente) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        if (usuario.rol === 'agente' && propiedadExistente.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: 'No tiene permisos para editar esta propiedad' });
        }

        // Actualiza propiedad
        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: {
                titulo,
                descripcion: descripcion?.trim() || null,
                tipo_propiedad,
                estado_propiedad,
                transaccion,
                precio: parseFloat(precio),
                moneda,
                direccion,
                ciudad,
                provincia,
                pais: 'Ecuador',
                codigo_postal: codigo_postal || null,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                area_construccion: area_construccion ? parseFloat(area_construccion) : null,
                nro_habitaciones: nro_habitaciones ? parseInt(nro_habitaciones) : null,
                nro_banos: nro_banos ? parseInt(nro_banos) : null,
                nro_parqueaderos: nro_parqueaderos ? parseInt(nro_parqueaderos) : null,
                nro_pisos: nro_pisos ? parseInt(nro_pisos) : null,
                anio_construccion: anio_construccion ? parseInt(anio_construccion) : null,
                estado_publicacion: estado_publicacion || 'disponible',
                agenteId,
            },
        });

        if (imagenesAEliminar.length > 0) {
            await prisma.imagen.deleteMany({
                where: {
                    id: {
                        in: imagenesAEliminar.map(Number)
                    },
                    propiedadId: propiedad.id
                }
            });
        }

        // Manejo de nuevas imágenes
        if (archivos && archivos.length > 0) {
            const nuevas = archivos.map((file) => ({
                url: `/uploads/${file.filename}`,
                propiedadId: propiedad.id,
            }));
            await prisma.imagen.createMany({ data: nuevas });
        }

        return res.status(200).json({ mensaje: 'Propiedad actualizada con éxito', propiedad });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al actualizar la propiedad' });
    }
};

export const actualizarEstadoPropiedad = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    const estadosPermitidos = ['disponible', 'vendida', 'arrendada', 'reservada', 'inactiva'];

    console.log('Actualizando estado de propiedad:', { id, nuevoEstado, usuario: req.usuario });

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ mensaje: 'ID de propiedad inválido' });
    }

    // Validar que se proporcione un nuevo estado
    if (!nuevoEstado) {
        return res.status(400).json({ mensaje: 'Nuevo estado es requerido' });
    }

    if (!estadosPermitidos.includes(nuevoEstado)) {
        console.log('Estado no válido:', nuevoEstado);
        return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    try {
        // Verificar que la propiedad existe
        const propiedadExistente = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!propiedadExistente) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: {
                estado_publicacion: nuevoEstado
            }
        });

        console.log('Estado actualizado correctamente:', propiedad.id);
        return res.json({ mensaje: 'Estado actualizado', propiedad });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        return res.status(500).json({ mensaje: 'Error al actualizar el estado' });
    }
};

export const eliminarPropiedad = async (req, res) => {
    const { id } = req.params;

    try {
        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: { estado_publicacion: 'inactiva' }, // Soft delete
        });

        return res.json({ mensaje: 'Propiedad eliminada correctamente', propiedad });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al eliminar la propiedad' });
    }
};

export const obtenerPropiedadesPublicas = async (req, res) => {
    try {
        const {
            tipo_propiedad,
            ciudad,
            minPrecio,
            maxPrecio,
            nro_habitaciones,
            nro_banos,
            area_construccion_min,
            area_construccion_max,
            transaccion,
            sortBy = 'createdAt', // Default sort by creation date
            sortOrder = 'desc',   // Default sort order descending
            limit, // Nuevo parámetro para limitar resultados
        } = req.query;

        const where = {
            estado_publicacion: 'disponible',
        };

        if (tipo_propiedad) {
            where.tipo_propiedad = tipo_propiedad;
        }
        if (ciudad) {
            where.ciudad = {
                contains: ciudad,
                mode: 'insensitive',
            };
        }
        if (minPrecio) {
            where.precio = { ...where.precio,
                gte: parseFloat(minPrecio)
            };
        }
        if (maxPrecio) {
            where.precio = { ...where.precio,
                lte: parseFloat(maxPrecio)
            };
        }
        if (nro_habitaciones) {
            where.nro_habitaciones = {
                gte: parseInt(nro_habitaciones)
            };
        }
        if (nro_banos) {
            where.nro_banos = {
                gte: parseInt(nro_banos)
            };
        }
        if (area_construccion_min) {
            where.area_construccion = { ...where.area_construccion,
                gte: parseFloat(area_construccion_min)
            };
        }
        if (area_construccion_max) {
            where.area_construccion = { ...where.area_construccion,
                lte: parseFloat(area_construccion_max)
            };
        }
        if (transaccion) {
            where.transaccion = transaccion;
        }

        const orderBy = {};
        if (sortBy === 'precio') {
            orderBy.precio = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        const propiedades = await prisma.propiedad.findMany({
            where,
            include: {
                imagenes: true,
                agente: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy,
            ...(limit && { take: parseInt(limit) }), // Aplicar límite si se proporciona
        });

        return res.json(propiedades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener propiedades públicas' });
    }
}

export const obtenerPropiedadPublicaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const propiedad = await prisma.propiedad.findFirst({
            where: { 
                id: parseInt(id),
                estado_publicacion: 'disponible'
            },
            include: {
                imagenes: true,
                agente: {
                    select: { 
                        id: true, 
                        name: true, 
                        email: true 
                    }
                }
            },
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada o no disponible' });
        }

        res.json(propiedad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la propiedad' });
    }
};

// Función añadida: devuelve las últimas N propiedades públicas (por defecto 6)
export const obtenerUltimasPropiedades = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;

        const propiedades = await prisma.propiedad.findMany({
            where: { estado_publicacion: 'disponible' },
            include: { imagenes: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return res.json(propiedades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener las últimas propiedades' });
    }
};

// Función para obtener propiedades relacionadas
export const obtenerPropiedadesRelacionadas = async (req, res) => {
    try {
        const { tipo_propiedad, ciudad, limit = 6, exclude } = req.query;
        
        let whereClause = {
            estado_publicacion: 'disponible'
        };

        // Excluir propiedad específica si se proporciona
        if (exclude) {
            whereClause.id = { not: parseInt(exclude) };
        }

        // Filtrar por tipo de propiedad y ciudad si se proporcionan
        if (tipo_propiedad) {
            whereClause.tipo_propiedad = tipo_propiedad;
        }
        if (ciudad) {
            whereClause.ciudad = { contains: ciudad, mode: 'insensitive' };
        }

        const propiedades = await prisma.propiedad.findMany({
            where: whereClause,
            include: { imagenes: true },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });

        return res.json(propiedades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener propiedades relacionadas' });
    }
};

// Función para calcular distancia entre dos propiedades usando KNN
const calcularDistancia = (propiedad1, propiedad2) => {
    let distancia = 0;
    
    // Normalizar precios (asumiendo rango 0-1000000)
    const precioMax = 1000000;
    const distanciaPrecio = Math.abs(propiedad1.precio - propiedad2.precio) / precioMax;
    distancia += distanciaPrecio * 0.3; // 30% peso al precio
    
    // Tipo de propiedad (0 si es igual, 1 si es diferente)
    const distanciaTipo = propiedad1.tipo_propiedad === propiedad2.tipo_propiedad ? 0 : 1;
    distancia += distanciaTipo * 0.25; // 25% peso al tipo
    
    // Ciudad (0 si es igual, 1 si es diferente)
    const distanciaCiudad = propiedad1.ciudad === propiedad2.ciudad ? 0 : 1;
    distancia += distanciaCiudad * 0.2; // 20% peso a la ciudad
    
    // Número de habitaciones (normalizado)
    const habitacionesMax = 10;
    const distanciaHabitaciones = Math.abs(
        (propiedad1.nro_habitaciones || 0) - (propiedad2.nro_habitaciones || 0)
    ) / habitacionesMax;
    distancia += distanciaHabitaciones * 0.1; // 10% peso a habitaciones
    
    // Número de baños (normalizado)
    const banosMax = 5;
    const distanciaBanos = Math.abs(
        (propiedad1.nro_banos || 0) - (propiedad2.nro_banos || 0)
    ) / banosMax;
    distancia += distanciaBanos * 0.1; // 10% peso a baños
    
    // Área construida (normalizada)
    const areaMax = 1000;
    const distanciaArea = Math.abs(
        (propiedad1.area_construccion || 0) - (propiedad2.area_construccion || 0)
    ) / areaMax;
    distancia += distanciaArea * 0.05; // 5% peso al área
    
    return distancia;
};

// Función para obtener recomendaciones usando algoritmo KNN con Python/scikit-learn
export const obtenerRecomendaciones = async (req, res) => {
    try {
        const usuario = req.usuario;
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        const k = req.query.k ? parseInt(req.query.k) : 3; // k=3 por defecto

        // Obtener favoritos del usuario
        const favoritos = await prisma.favorito.findMany({
            where: { usuarioId: usuario.id },
            include: {
                propiedad: {
                    include: { imagenes: true }
                }
            }
        });

        if (favoritos.length === 0) {
            return res.status(200).json({
                recomendaciones: [],
                mensaje: "Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero",
                tieneFavoritos: false,
                algoritmo: "KNN (scikit-learn)"
            });
        }

        // Obtener todas las propiedades disponibles
        const todasLasPropiedades = await prisma.propiedad.findMany({
            where: {
                estado_publicacion: 'disponible'
            },
            include: { imagenes: true }
        });

        if (todasLasPropiedades.length === 0) {
            return res.status(200).json({
                recomendaciones: [],
                mensaje: "No hay propiedades disponibles para recomendarte",
                tieneFavoritos: true,
                algoritmo: "KNN (scikit-learn)"
            });
        }

        // Preparar datos para el servicio Python
        const favoritosData = favoritos.map(fav => ({
            id: fav.propiedad.id,
            precio: fav.propiedad.precio,
            tipo_propiedad: fav.propiedad.tipo_propiedad,
            ciudad: fav.propiedad.ciudad,
            nro_habitaciones: fav.propiedad.nro_habitaciones,
            nro_banos: fav.propiedad.nro_banos,
            area_construccion: fav.propiedad.area_construccion,
            area_terreno: fav.propiedad.area_terreno,
            nro_parqueaderos: fav.propiedad.nro_parqueaderos
        }));

        const propiedadesDisponiblesData = todasLasPropiedades.map(prop => ({
            id: prop.id,
            precio: prop.precio,
            tipo_propiedad: prop.tipo_propiedad,
            ciudad: prop.ciudad,
            nro_habitaciones: prop.nro_habitaciones,
            nro_banos: prop.nro_banos,
            area_construccion: prop.area_construccion,
            area_terreno: prop.area_terreno,
            nro_parqueaderos: prop.nro_parqueaderos
        }));

        // Llamar al servicio Python
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
        
        try {
            const response = await axios.post(`${pythonServiceUrl}/recomendaciones`, {
                favoritos: favoritosData,
                propiedades_disponibles: propiedadesDisponiblesData,
                k: k,
                limit: limit
            }, {
                timeout: 10000, // 10 segundos timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // El servicio Python devuelve IDs de propiedades recomendadas
            const recomendacionesIds = response.data.recomendaciones.map(rec => rec.id_original);
            
            // Obtener datos completos de las propiedades recomendadas
            const recomendacionesCompletas = todasLasPropiedades.filter(prop => 
                recomendacionesIds.includes(prop.id)
            );

            // Ordenar según el orden de recomendaciones del Python
            const recomendacionesOrdenadas = [];
            recomendacionesIds.forEach(id => {
                const prop = recomendacionesCompletas.find(p => p.id === id);
                if (prop) {
                    recomendacionesOrdenadas.push(prop);
                }
            });

            return res.status(200).json({
                recomendaciones: recomendacionesOrdenadas,
                mensaje: response.data.mensaje,
                tieneFavoritos: response.data.tieneFavoritos,
                totalFavoritos: response.data.totalFavoritos,
                algoritmo: response.data.algoritmo,
                k: response.data.k,
                metricas: response.data.metricas
            });

        } catch (pythonError) {
            console.error('Error al comunicarse con servicio Python:', pythonError.message);
            
            // Fallback al algoritmo JavaScript si Python falla
            console.log('🔄 Usando algoritmo JavaScript como fallback...');
            return await obtenerRecomendacionesFallback(req, res, favoritos, todasLasPropiedades, k, limit);
        }

    } catch (error) {
        console.error('Error en algoritmo KNN:', error);
        return res.status(500).json({ 
            mensaje: 'Error al obtener recomendaciones',
            error: error.message,
            algoritmo: "KNN (scikit-learn)"
        });
    }
};

// Función fallback usando algoritmo JavaScript
const obtenerRecomendacionesFallback = async (req, res, favoritos, todasLasPropiedades, k, limit) => {
    try {
        const idsFavoritas = favoritos.map(fav => fav.propiedad.id);
        const propiedadesDisponibles = todasLasPropiedades.filter(prop => 
            !idsFavoritas.includes(prop.id)
        );

        if (propiedadesDisponibles.length === 0) {
            return res.status(200).json({
                recomendaciones: [],
                mensaje: "No hay más propiedades disponibles para recomendarte",
                tieneFavoritos: true,
                algoritmo: "KNN (JavaScript - Fallback)"
            });
        }

        // Aplicar algoritmo KNN JavaScript
        const recomendacionesMap = new Map();

        favoritos.forEach(favorito => {
            const propiedadFavorita = favorito.propiedad;
            const distancias = [];

            propiedadesDisponibles.forEach(propiedad => {
                const distancia = calcularDistancia(propiedadFavorita, propiedad);
                distancias.push({
                    propiedad,
                    distancia
                });
            });

            distancias.sort((a, b) => a.distancia - b.distancia);
            const kMasCercanas = distancias.slice(0, k);

            kMasCercanas.forEach(item => {
                if (!recomendacionesMap.has(item.propiedad.id)) {
                    recomendacionesMap.set(item.propiedad.id, item.propiedad);
                }
            });
        });

        const recomendacionesFinales = Array.from(recomendacionesMap.values())
            .slice(0, limit);

        return res.status(200).json({
            recomendaciones: recomendacionesFinales,
            mensaje: recomendacionesFinales.length > 0 
                ? `Encontramos ${recomendacionesFinales.length} propiedades que te pueden interesar (Fallback)`
                : "No encontramos propiedades similares a tus favoritas",
            tieneFavoritos: true,
            totalFavoritos: favoritos.length,
            algoritmo: "KNN (JavaScript - Fallback)",
            k: k
        });

    } catch (error) {
        console.error('Error en fallback:', error);
        return res.status(500).json({ 
            mensaje: 'Error al obtener recomendaciones (fallback)',
            error: error.message,
            algoritmo: "KNN (JavaScript - Fallback)"
        });
    }
};
