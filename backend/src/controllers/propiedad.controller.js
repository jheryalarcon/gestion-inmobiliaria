import prisma from '../prisma/client.js'
import imageConfig from '../config/images.js'
import axios from 'axios'
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js'

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
        sector,
        referencia,
        latitud,
        longitud,
        area_terreno,
        unidad_area_terreno,
        area_construccion,
        unidad_area_construccion,
        nro_habitaciones,
        nro_banos,
        nro_parqueaderos,
        nro_pisos,
        anio_construccion,
        estado_publicacion,
        agenteId: agenteIdEnviado,
        // Campos de Captación
        // Campos de Captación
        propietarioId,
        comision,
        tipo_comision,
        precio_minimo,
        tipo_contrato,
        fecha_fin_contrato,
        fecha_captacion,
        // Nuevo campo
        uso_propiedad,
        // Características Físicas
        orientacion,
        // Amenities
        tiene_balcon,
        tiene_terraza,
        tiene_patio,
        tiene_bodega,
        tiene_area_bbq,
        tiene_piscina,
        tiene_ascensor,
        tiene_seguridad,
        tiene_areas_comunales,
        tiene_gas_centralizado,
        tiene_lavanderia,
        tiene_cisterna,
        amoblado,
        propietarios
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

    if (agenteId) {
        const agenteExistente = await prisma.usuario.findUnique({
            where: { id: agenteId }
        });
        if (!agenteExistente || !agenteExistente.activo) {
            errores.push('El agente seleccionado no existe o no está activo');
        } else if (agenteExistente.rol !== 'agente' && agenteExistente.rol !== 'admin') {
            errores.push('El usuario seleccionado no tiene permisos de agente o admin');
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Validación fallida', errores });
    }

    try {
        // Generar Código Interno
        const prefixMap = {
            casa: 'CAS',
            departamento: 'DEP',
            suite: 'SUI',
            local_comercial: 'LOC',
            oficina: 'OFI',
            bodega_galpon: 'BOD',
            edificio: 'EDI',
            terreno: 'TER',
            finca: 'FIN',
            quinta: 'QUI'
        };
        const prefix = prefixMap[tipo_propiedad] || 'PRO';

        // Contamos cuántas propiedades de este tipo existen para generar el secuencial
        // Nota: Esto puede tener race conditions en alta concurrencia, pero sirve para este MVP.
        // Para producción crítica se recomendaría una tabla de secuencias separada o transacciones.
        const count = await prisma.propiedad.count({
            where: { tipo_propiedad }
        });
        const sequence = (count + 1).toString().padStart(4, '0'); // CAS-0001
        const codigo_interno = `${prefix}-${sequence}`;

        const propiedad = await prisma.propiedad.create({
            data: {
                codigo_interno,
                uso_propiedad: uso_propiedad || null, // Opcional por ahora
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
                sector: sector?.trim() || null,
                referencia: referencia?.trim() || null,
                codigo_postal: codigo_postal || null,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                unidad_area_terreno: unidad_area_terreno || 'm2',
                area_construccion: area_construccion ? parseFloat(area_construccion) : null,
                unidad_area_construccion: unidad_area_construccion || 'm2',
                nro_habitaciones: nro_habitaciones ? parseInt(nro_habitaciones) : null,
                nro_banos: nro_banos ? parseInt(nro_banos) : null,
                nro_parqueaderos: nro_parqueaderos ? parseInt(nro_parqueaderos) : null,
                nro_pisos: nro_pisos ? parseInt(nro_pisos) : null,
                anio_construccion: anio_construccion ? parseInt(anio_construccion) : null,
                estado_publicacion: 'disponible', // 🔒 Siempre nace disponible (Anti-Fraude)
                agenteId,
                // Nuevos campos de captación
                // propietarioId: PROPIETARIO PRINCIPAL (Legacy o derivado)
                propietarioId: null, // Se asignará si hay propietarios
                comision: comision ? parseFloat(comision) : null,
                tipo_comision: tipo_comision || 'porcentaje',
                precio_minimo: precio_minimo ? parseFloat(precio_minimo) : null,
                tipo_contrato: tipo_contrato || null,
                fecha_fin_contrato: fecha_fin_contrato ? new Date(fecha_fin_contrato) : null,
                fecha_captacion: fecha_captacion ? new Date(fecha_captacion) : undefined, // Usa default(now) si no viene
                // Características Físicas
                orientacion: orientacion || null,
                // Amenities
                tiene_balcon: tiene_balcon === 'true' || tiene_balcon === true,
                tiene_terraza: tiene_terraza === 'true' || tiene_terraza === true,
                tiene_patio: tiene_patio === 'true' || tiene_patio === true,
                tiene_bodega: tiene_bodega === 'true' || tiene_bodega === true,
                tiene_area_bbq: tiene_area_bbq === 'true' || tiene_area_bbq === true,
                tiene_piscina: tiene_piscina === 'true' || tiene_piscina === true,
                tiene_ascensor: tiene_ascensor === 'true' || tiene_ascensor === true,
                tiene_seguridad: tiene_seguridad === 'true' || tiene_seguridad === true,
                tiene_areas_comunales: tiene_areas_comunales === 'true' || tiene_areas_comunales === true,
                tiene_gas_centralizado: tiene_gas_centralizado === 'true' || tiene_gas_centralizado === true,
                tiene_lavanderia: tiene_lavanderia === 'true' || tiene_lavanderia === true,
                tiene_cisterna: tiene_cisterna === 'true' || tiene_cisterna === true,
                amoblado: amoblado === 'true' || amoblado === true
            }
        });

        // PROCESAR PROPIETARIOS
        if (propietarios) {
            console.log('👥 Procesando propietarios en creación:', propietarios, 'Tipo:', typeof propietarios);
            try {
                // Si viene como string JSON, parsearlo
                const propietariosArray = typeof propietarios === 'string' ? JSON.parse(propietarios) : propietarios;
                console.log('✅ Array de propietarios parseado:', propietariosArray);

                if (Array.isArray(propietariosArray) && propietariosArray.length > 0) {
                    // Crear registros en PropiedadPropietario
                    const propietariosData = propietariosArray.map(p => ({
                        propiedadId: propiedad.id,
                        clienteId: parseInt(p.clienteId),
                        porcentaje: parseFloat(p.porcentaje || 0),
                        es_principal: p.es_principal === true || p.es_principal === 'true'
                    }));
                    console.log('💾 Guardando propietarios en DB:', propietariosData);

                    await prisma.propiedadPropietario.createMany({
                        data: propietariosData
                    });

                    // Actualizar el propietarioId legacy con el principal (o el primero)
                    const principal = propietariosArray.find(p => p.es_principal) || propietariosArray[0];
                    if (principal) {
                        await prisma.propiedad.update({
                            where: { id: propiedad.id },
                            data: { propietarioId: parseInt(principal.clienteId) }
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Error CRÍTICO procesando propietarios:', error);
                // REVERTIR PROPIEDAD SI FALLAN LOS PROPIETARIOS (Idealmente usar transactions, pero por ahora lanzamos error)
                // Borrar la propiedad creada para no dejar basura
                await prisma.propiedad.delete({ where: { id: propiedad.id } });

                return res.status(500).json({
                    mensaje: 'Error al registrar propietarios. La propiedad no se creó.',
                    error: error.message
                });
            }
        } else if (propietarioId) {
            // FALLBACK para propiedad simple (Legacy)
            await prisma.propiedadPropietario.create({
                data: {
                    propiedadId: propiedad.id,
                    clienteId: parseInt(propietarioId),
                    porcentaje: 100,
                    es_principal: true
                }
            });
            await prisma.propiedad.update({
                where: { id: propiedad.id },
                data: { propietarioId: parseInt(propietarioId) }
            });
        }


        const uploadPromises = archivos.map(file => uploadToCloudinary(file.buffer, 'propiedades'));
        const uploadResults = await Promise.all(uploadPromises);

        const imagenes = uploadResults.map(result => ({
            url: result.secure_url,
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
    const {
        includeAgente,
        page = 1,
        limit = 9,
        agenteId,
        search,
        ubicacion, // Nueva variable para búsqueda de ubicación
        transaccion,
        estado,
        tipo,
        ciudad,
        precioMin,
        precioMax,
        habitaciones,
        banos,
        areaMin,
        areaMax,
        orden,
        // Nuevos filtros avanzados
        areaTerrenoMin,
        areaTerrenoMax,
        areaConstruccionMin,
        areaConstruccionMax,
        parqueaderos,
        pisos,
        anioMin,
        estadoFisico,
        sector,
        // Filtros de Amenidades
        tiene_piscina,
        tiene_seguridad,
        tiene_ascensor,
        tiene_area_bbq,
        tiene_terraza,
        tiene_balcon,
        tiene_patio,
        tiene_bodega,
        tiene_areas_comunales,
        tiene_gas_centralizado,
        tiene_cisterna,
        tiene_lavanderia,
        amoblado,
        // Filtros de Fecha
        fechaDesde,
        fechaHasta
    } = req.query;

    try {
        if (usuario.rol !== 'admin' && usuario.rol !== 'agente') {
            return res.json({ data: [], meta: { total: 0, page: 1, lastPage: 1 } });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Construir filtro
        const where = {
            estado_publicacion: { not: 'inactiva' },
            ...(agenteId && { agenteId: parseInt(agenteId) })
        };

        // Filtros adicionales globales
        // Filtros adicionales globales
        if (search) {
            const searchOr = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                { codigo_interno: { contains: search, mode: 'insensitive' } },
                // Buscar por nombre de propietario
                {
                    propietarios: {
                        some: {
                            cliente: {
                                nombre: { contains: search, mode: 'insensitive' }
                            }
                        }
                    }
                }
            ];

            // Si ya existe un AND (raro aquÃ), lo preservamos, sino inicializamos
            if (where.AND) {
                if (Array.isArray(where.AND)) where.AND.push({ OR: searchOr });
                else where.AND = [where.AND, { OR: searchOr }];
            } else {
                where.AND = [{ OR: searchOr }];
            }
        }

        if (ubicacion) {
            const ubicacionOr = [
                { direccion: { contains: ubicacion, mode: 'insensitive' } },
                { sector: { contains: ubicacion, mode: 'insensitive' } },
                { ciudad: { contains: ubicacion, mode: 'insensitive' } },
                { provincia: { contains: ubicacion, mode: 'insensitive' } },
                { referencia: { contains: ubicacion, mode: 'insensitive' } }
            ];

            if (where.AND) {
                if (Array.isArray(where.AND)) where.AND.push({ OR: ubicacionOr });
                else where.AND = [where.AND, { OR: ubicacionOr }];
            } else {
                where.AND = [{ OR: ubicacionOr }];
            }
        }

        if (transaccion) where.transaccion = transaccion;
        if (estado) where.estado_publicacion = estado;
        if (tipo) where.tipo_propiedad = tipo;
        if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' };
        if (sector) where.sector = { contains: sector, mode: 'insensitive' };

        if (precioMin || precioMax) {
            where.precio = {};
            if (precioMin) where.precio.gte = parseFloat(precioMin);
            if (precioMax) where.precio.lte = parseFloat(precioMax);
        }

        // --- FILTROS AVANZADOS ---
        if (habitaciones) {
            where.nro_habitaciones = { gte: parseInt(habitaciones) };
        }

        if (banos) {
            where.nro_banos = { gte: parseInt(banos) };
        }

        // Área Construcción (Reemplaza/Mejora areaMin/Max genérico)
        if (areaConstruccionMin || areaConstruccionMax) {
            where.area_construccion = {};
            if (areaConstruccionMin) where.area_construccion.gte = parseFloat(areaConstruccionMin);
            if (areaConstruccionMax) where.area_construccion.lte = parseFloat(areaConstruccionMax);
        } else if (areaMin || areaMax) { // Fallback compatibilidad
            where.area_construccion = {};
            if (areaMin) where.area_construccion.gte = parseFloat(areaMin);
            if (areaMax) where.area_construccion.lte = parseFloat(areaMax);
        }

        // Área Terreno
        if (areaTerrenoMin || areaTerrenoMax) {
            where.area_terreno = {};
            if (areaTerrenoMin) where.area_terreno.gte = parseFloat(areaTerrenoMin);
            if (areaTerrenoMax) where.area_terreno.lte = parseFloat(areaTerrenoMax);
        }

        // Parqueaderos
        if (parqueaderos) {
            where.nro_parqueaderos = { gte: parseInt(parqueaderos) };
        }

        // Pisos
        if (pisos) {
            where.nro_pisos = { gte: parseInt(pisos) };
        }

        // Año de construcción
        if (anioMin) {
            where.anio_construccion = { gte: parseInt(anioMin) };
        }

        // Estado Físico (Nueva, Usada...)
        if (estadoFisico) {
            where.estado_propiedad = estadoFisico;
        }

        // --- FILTROS DE AMENIDADES ---
        if (tiene_piscina === 'true') where.tiene_piscina = true;
        if (tiene_seguridad === 'true') where.tiene_seguridad = true;
        if (tiene_ascensor === 'true') where.tiene_ascensor = true;
        if (tiene_area_bbq === 'true') where.tiene_area_bbq = true;
        if (tiene_terraza === 'true') where.tiene_terraza = true;
        if (tiene_balcon === 'true') where.tiene_balcon = true;
        if (tiene_patio === 'true') where.tiene_patio = true;
        if (tiene_bodega === 'true') where.tiene_bodega = true;
        if (tiene_areas_comunales === 'true') where.tiene_areas_comunales = true;
        if (tiene_gas_centralizado === 'true') where.tiene_gas_centralizado = true;
        if (tiene_cisterna === 'true') where.tiene_cisterna = true;
        if (tiene_lavanderia === 'true') where.tiene_lavanderia = true;
        if (amoblado === 'true') where.amoblado = true;
        if (tiene_balcon === 'true') where.tiene_balcon = true;
        if (tiene_patio === 'true') where.tiene_patio = true;
        if (tiene_bodega === 'true') where.tiene_bodega = true;
        if (tiene_areas_comunales === 'true') where.tiene_areas_comunales = true;
        if (tiene_gas_centralizado === 'true') where.tiene_gas_centralizado = true;
        if (tiene_cisterna === 'true') where.tiene_cisterna = true;
        if (tiene_lavanderia === 'true') where.tiene_lavanderia = true;
        if (amoblado === 'true') where.amoblado = true;

        // --- FILTROS POR FECHA DE CAPTACIÓN/CREACIÓN ---
        if (fechaDesde || fechaHasta) {
            where.createdAt = {};
            if (fechaDesde) {
                // Inicio del día
                where.createdAt.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                // Final del día (aprox)
                const dateHasta = new Date(fechaHasta);
                dateHasta.setHours(23, 59, 59, 999);
                where.createdAt.lte = dateHasta;
            }
        }

        // --- ORDENAMIENTO ---
        // Usamos un array de ordenamiento para garantizar estabilidad (stable sort)
        // El criterio secundario siempre será fecha de creación descendente (o ID)
        let orderBy = [{ createdAt: 'desc' }];

        if (orden === 'precio_asc') {
            orderBy = [{ precio: 'asc' }, { createdAt: 'desc' }];
        } else if (orden === 'precio_desc') {
            orderBy = [{ precio: 'desc' }, { createdAt: 'desc' }];
        } else if (orden === 'antiguas') {
            orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
        } else if (orden === 'titulo_asc') {
            orderBy = [{ titulo: 'asc' }, { createdAt: 'desc' }];
        } else if (orden === 'titulo_desc') {
            orderBy = [{ titulo: 'desc' }, { createdAt: 'desc' }];
        }

        // 1. Contar total de propiedades que coinciden
        const total = await prisma.propiedad.count({ where });

        // 2. Obtener propiedades paginadas
        const propiedades = await prisma.propiedad.findMany({
            where,
            include: {
                imagenes: {
                    take: 1,
                    select: { url: true } // Solo URL de la portada
                },
                propietarios: {
                    include: {
                        cliente: {
                            select: { id: true, nombre: true }
                        }
                    },
                    where: { es_principal: true },
                    take: 1
                },
                negociaciones: {
                    where: { activo: true },
                    select: { id: true, etapa: true }
                },
                ...(includeAgente === 'true' && {
                    agente: {
                        select: { id: true, name: true, email: true }
                    }
                })
            },
            orderBy,
            skip,
            take: limitNum
        });

        // 🖼️ Convertir URLs de imágenes a absolutas
        const propiedadesProcesadas = imageConfig.procesarImagenes(propiedades);

        return res.json({
            data: propiedadesProcesadas,
            meta: {
                total,
                page: pageNum,
                lastPage: Math.ceil(total / limitNum)
            }
        });
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
                // ⚡ OPTIMIZACIÓN: Solo traer la primera imagen (thumbnail) para el selector
                // Esto reduce drásticamente el peso de la respuesta JSON
                imagenes: {
                    take: 1,
                    select: { url: true }
                },
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
                propietarios: {
                    include: { cliente: true }
                },
                negociaciones: {
                    where: { activo: true },
                    select: { id: true, etapa: true }
                },
                documentos: true
            },
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        if (usuario.rol === 'cliente') {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }

        // if (usuario.rol === 'agente' && propiedad.agenteId !== usuario.id) {
        //     return res.status(403).json({ mensaje: 'No tiene permiso para ver esta propiedad' });
        // }

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
        sector,
        referencia,
        latitud,
        longitud,
        area_terreno,
        unidad_area_terreno,
        area_construccion,
        unidad_area_construccion,
        nro_habitaciones,
        nro_banos,
        nro_parqueaderos,
        nro_pisos,
        anio_construccion,
        estado_publicacion,
        agenteId: agenteIdEnviado,
        // Campos de Captación
        propietarioId,
        comision,
        tipo_comision,
        precio_minimo,
        tipo_contrato,
        fecha_fin_contrato,
        fecha_captacion,
        uso_propiedad,
        // Características Físicas
        orientacion,
        // Amenities
        tiene_balcon,
        tiene_terraza,
        tiene_patio,
        tiene_bodega,
        tiene_area_bbq,
        tiene_piscina,
        tiene_ascensor,
        tiene_seguridad,
        tiene_areas_comunales,
        tiene_gas_centralizado,
        tiene_lavanderia,
        tiene_cisterna,
        amoblado,
        valor_garantia // ADDED
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

    if (agenteId) {
        const agenteExistente = await prisma.usuario.findUnique({
            where: { id: agenteId }
        });
        if (!agenteExistente || !agenteExistente.activo) {
            errores.push('El agente seleccionado no existe o no está activo');
        } else if (agenteExistente.rol !== 'agente' && agenteExistente.rol !== 'admin') {
            errores.push('El usuario seleccionado no tiene permisos de agente o admin');
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Errores de validación', errores });
    }

    // ⛔ BLINDAJE LÓGICO: Prevenir "Ventas Fantasma"
    // No permitir cambiar manualmente a estados Transaccionales (Vendida, Reservada, Arrendada)
    // Estos estados SOLO deben ser alcanzados a través de una Negociación finalizada.
    const estadosRestringidos = ['vendida', 'reservada', 'arrendada'];
    if (estado_publicacion && estadosRestringidos.includes(estado_publicacion)) {
        return res.status(400).json({
            mensaje: `⛔ OPERACIÓN RECHAZADA: No se puede cambiar manualmente el estado a "${estado_publicacion}".\n` +
                `📉 Esto generaría una venta sin registrar comisiones ni cliente.\n` +
                `👉 Por favor vaya al módulo de Negociaciones y cierre el trato correctamente.`
        });
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
                sector: sector?.trim() || null,
                referencia: referencia?.trim() || null,
                codigo_postal: codigo_postal || null,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                unidad_area_terreno: unidad_area_terreno || undefined,
                area_construccion: area_construccion ? parseFloat(area_construccion) : null,
                unidad_area_construccion: unidad_area_construccion || undefined,
                nro_habitaciones: nro_habitaciones ? parseInt(nro_habitaciones) : null,
                nro_banos: nro_banos ? parseInt(nro_banos) : null,
                nro_parqueaderos: nro_parqueaderos ? parseInt(nro_parqueaderos) : null,
                nro_pisos: nro_pisos ? parseInt(nro_pisos) : null,
                anio_construccion: anio_construccion ? parseInt(anio_construccion) : null,
                estado_publicacion: estado_publicacion || propiedadExistente.estado_publicacion, // 🛡️ Mantiene el estado actual si no se envía uno nuevo

                estado_publicacion: estado_publicacion || propiedadExistente.estado_publicacion, // 🛡️ Mantiene el estado actual si no se envía uno nuevo

                // agente: { connect: { id: parseInt(agenteId) } }, // ⛔ REMOVED: Tesis decision (No reasignación)

                usuarioActualizador: { connect: { id: usuario.id } },
                usuarioActualizador: { connect: { id: usuario.id } },
                // Nuevos campos de captación
                ...(propietarioId ? { propietario: { connect: { id: parseInt(propietarioId) } } } : { propietario: { disconnect: true } }),
                comision: comision ? parseFloat(comision) : null,
                tipo_comision: tipo_comision || 'porcentaje',
                precio_minimo: precio_minimo ? parseFloat(precio_minimo) : null,
                tipo_contrato: tipo_contrato || null,
                fecha_fin_contrato: fecha_fin_contrato ? new Date(fecha_fin_contrato) : null,
                fecha_captacion: fecha_captacion ? new Date(fecha_captacion) : undefined,
                uso_propiedad: uso_propiedad || undefined,
                // Características Físicas
                orientacion: orientacion || null,
                // Amenities
                tiene_balcon: tiene_balcon === 'true' || tiene_balcon === true,
                tiene_terraza: tiene_terraza === 'true' || tiene_terraza === true,
                tiene_patio: tiene_patio === 'true' || tiene_patio === true,
                tiene_bodega: tiene_bodega === 'true' || tiene_bodega === true,
                tiene_area_bbq: tiene_area_bbq === 'true' || tiene_area_bbq === true,
                tiene_piscina: tiene_piscina === 'true' || tiene_piscina === true,
                tiene_ascensor: tiene_ascensor === 'true' || tiene_ascensor === true,
                tiene_seguridad: tiene_seguridad === 'true' || tiene_seguridad === true,
                tiene_areas_comunales: tiene_areas_comunales === 'true' || tiene_areas_comunales === true,
                tiene_gas_centralizado: tiene_gas_centralizado === 'true' || tiene_gas_centralizado === true,
                tiene_lavanderia: tiene_lavanderia === 'true' || tiene_lavanderia === true,
                tiene_cisterna: tiene_cisterna === 'true' || tiene_cisterna === true,
                amoblado: amoblado === 'true' || amoblado === true,
                valor_garantia: valor_garantia ? parseFloat(valor_garantia) : null // ADDED
            },
        });

        // ✅ ACTUALIZAR PROPIETARIOS (Si se envían)
        if (req.body.propietarios) {
            try {
                const propietariosArray = typeof req.body.propietarios === 'string'
                    ? JSON.parse(req.body.propietarios)
                    : req.body.propietarios;

                if (Array.isArray(propietariosArray)) {
                    // 1. Eliminar relaciones anteriores
                    await prisma.propiedadPropietario.deleteMany({
                        where: { propiedadId: propiedad.id }
                    });

                    // 2. Crear nuevas relaciones
                    const propietariosData = propietariosArray.map(p => ({
                        propiedadId: propiedad.id,
                        clienteId: parseInt(p.clienteId),
                        porcentaje: parseFloat(p.porcentaje || 0),
                        es_principal: p.es_principal === true || p.es_principal === 'true'
                    }));

                    await prisma.propiedadPropietario.createMany({
                        data: propietariosData
                    });

                    // 3. Update legacy ID (opcional pero recomendado)
                    const principal = propietariosArray.find(p => p.es_principal) || propietariosArray[0];
                    if (principal) {
                        await prisma.propiedad.update({
                            where: { id: propiedad.id },
                            data: { propietarioId: parseInt(principal.clienteId) }
                        });
                    }
                }
            } catch (error) {
                console.error('Error al actualizar propietarios:', error);
            }
        }

        if (imagenesAEliminar.length > 0) {
            const imagenesABorrar = await prisma.imagen.findMany({
                where: {
                    id: { in: imagenesAEliminar.map(Number) },
                    propiedadId: propiedad.id
                }
            });

            const deletePromises = imagenesABorrar.map(img => {
                const publicId = extractPublicId(img.url);
                if (publicId) return deleteFromCloudinary(publicId);
                return Promise.resolve();
            });
            await Promise.all(deletePromises);

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
            const uploadPromises = archivos.map(file => uploadToCloudinary(file.buffer, 'propiedades'));
            const uploadResults = await Promise.all(uploadPromises);

            const nuevas = uploadResults.map(result => ({
                url: result.secure_url,
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
    const usuario = req.usuario;

    // BLINDAJE: Solo permitir estados administrativos.
    // 'vendida', 'reservada', 'arrendada' se gestionan EXCLUSIVAMENTE vía Negociación.
    const estadosPermitidos = ['disponible', 'inactiva'];

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
        return res.status(400).json({
            mensaje: `Estado no válido para asignación manual. Los estados "${nuevoEstado}" deben gestionarse desde Negociaciones.`
        });
    }

    try {
        // Verificar que la propiedad existe
        const propiedadExistente = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!propiedadExistente) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        // ⛔ SEGURIDAD: Solo el Agente Captador (Dueño) o Admin pueden cambiar el estado
        if (usuario.rol === 'agente' && propiedadExistente.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: '⛔ No tienes permisos para modificar el estado de esta propiedad.' });
        }

        // 🛡️ REGLA: No desactivar si tiene negociaciones EN CIERRE (Contrato activo)
        if (nuevoEstado === 'inactiva') {
            const negociacionesEnCierre = await prisma.negociacion.count({
                where: {
                    propiedadId: parseInt(id),
                    activo: true,
                    etapa: 'cierre' // ⛔ SOLO bloqueamos si está en proceso de firma/reserva
                }
            });

            if (negociacionesEnCierre > 0) {
                return res.status(400).json({
                    mensaje: `⛔ No se puede desactivar la propiedad. Hay una negociación en etapa de CIERRE (Reserva activa).`
                });
            }
        }


        // 🛡️ REGLA: No forzar a 'disponible' si está 'reservada'/'vendida' por una negociación vigente
        // Evita desincronización (Negociación en Cierre vs Propiedad Disponible)
        if (nuevoEstado === 'disponible' && ['reservada', 'vendida', 'arrendada'].includes(propiedadExistente.estado_publicacion)) {
            const negociacionesBloqueantes = await prisma.negociacion.count({
                where: {
                    propiedadId: parseInt(id),
                    activo: true,
                    etapa: { in: ['cierre', 'finalizada'] } // Etapas que justifican el bloqueo
                }
            });

            if (negociacionesBloqueantes > 0) {
                return res.status(400).json({
                    mensaje: `⛔ No se puede marcar como disponible. Hay una negociación en Cierre/Finalizada que bloquea la propiedad.`
                });
            }
        }

        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: {
                estado_publicacion: nuevoEstado,
                updatedBy: req.usuario.id,
                fecha_desactivacion: nuevoEstado === 'inactiva' ? new Date() : null,
                desactivado_por: nuevoEstado === 'inactiva' ? req.usuario.id : null
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
    const usuario = req.usuario;

    try {
        // Verificar que la propiedad existe
        const propiedadExistente = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!propiedadExistente) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        // ⛔ SEGURIDAD: Solo el Agente Captador (Dueño) o Admin pueden desactivar
        if (usuario.rol === 'agente' && propiedadExistente.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: '⛔ No tienes permisos para desactivar esta propiedad.' });
        }

        // 🛡️ REGLA: No desactivar si tiene negociaciones EN CIERRE (Contrato activo)
        const negociacionesEnCierre = await prisma.negociacion.count({
            where: {
                propiedadId: parseInt(id),
                activo: true,
                etapa: 'cierre' // ⛔ SOLO bloqueamos si está en proceso de firma/reserva
            }
        });

        if (negociacionesEnCierre > 0) {
            return res.status(400).json({
                mensaje: `⛔ No se puede desactivar la propiedad. Hay una negociación en etapa de CIERRE (Reserva activa).`
            });
        }

        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: {
                estado_publicacion: 'inactiva',
                updatedBy: req.usuario.id,
                fecha_desactivacion: new Date(),
                desactivado_por: req.usuario.id
            }, // Soft delete
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
            area_terreno_min,
            area_terreno_max,
            nro_pisos,
            parqueaderos,
            anioMin,
            estadoFisico,
            transaccion,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limit,
            // Amenities
            tiene_piscina,
            tiene_seguridad,
            tiene_ascensor,
            tiene_area_bbq,
            tiene_terraza,
            tiene_balcon,
            tiene_patio,
            tiene_bodega,
            tiene_areas_comunales,
            tiene_gas_centralizado,
            tiene_cisterna,
            tiene_lavanderia,
            amoblado
        } = req.query;

        const where = {
            estado_publicacion: 'disponible',
        };

        // Búsqueda de Texto General
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { direccion: { contains: search, mode: 'insensitive' } },
                { codigo_interno: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filtros Básicos
        if (tipo_propiedad) where.tipo_propiedad = tipo_propiedad;
        if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' };
        if (transaccion) where.transaccion = transaccion;
        if (estadoFisico) where.estado_propiedad = estadoFisico;

        // Rangos Numéricos
        if (minPrecio || maxPrecio) {
            where.precio = {};
            if (minPrecio) where.precio.gte = parseFloat(minPrecio);
            if (maxPrecio) where.precio.lte = parseFloat(maxPrecio);
        }

        if (area_construccion_min || area_construccion_max) {
            where.area_construccion = {};
            if (area_construccion_min) where.area_construccion.gte = parseFloat(area_construccion_min);
            if (area_construccion_max) where.area_construccion.lte = parseFloat(area_construccion_max);
        }

        if (area_terreno_min || area_terreno_max) {
            where.area_terreno = {};
            if (area_terreno_min) where.area_terreno.gte = parseFloat(area_terreno_min);
            if (area_terreno_max) where.area_terreno.lte = parseFloat(area_terreno_max);
        }

        if (nro_habitaciones) where.nro_habitaciones = { gte: parseInt(nro_habitaciones) };
        if (nro_banos) where.nro_banos = { gte: parseInt(nro_banos) };
        if (parqueaderos) where.nro_parqueaderos = { gte: parseInt(parqueaderos) };
        if (nro_pisos) where.nro_pisos = { gte: parseInt(nro_pisos) };
        if (anioMin) where.anio_construccion = { gte: parseInt(anioMin) };

        // Filtros de Amenidades
        if (tiene_piscina === 'true') where.tiene_piscina = true;
        if (tiene_seguridad === 'true') where.tiene_seguridad = true;
        if (tiene_ascensor === 'true') where.tiene_ascensor = true;
        if (tiene_area_bbq === 'true') where.tiene_area_bbq = true;
        if (tiene_terraza === 'true') where.tiene_terraza = true;
        if (tiene_balcon === 'true') where.tiene_balcon = true;
        if (tiene_patio === 'true') where.tiene_patio = true;
        if (tiene_bodega === 'true') where.tiene_bodega = true;
        if (tiene_areas_comunales === 'true') where.tiene_areas_comunales = true;
        if (tiene_gas_centralizado === 'true') where.tiene_gas_centralizado = true;
        if (tiene_cisterna === 'true') where.tiene_cisterna = true;
        if (tiene_lavanderia === 'true') where.tiene_lavanderia = true;
        if (amoblado === 'true') where.amoblado = true;

        // Ordenamiento
        const orderBy = {};
        if (sortBy === 'precio') {
            orderBy.precio = sortOrder;
        } else if (sortBy === 'titulo') {
            orderBy.titulo = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        const propiedades = await prisma.propiedad.findMany({
            where,
            include: {
                imagenes: {
                    take: 1,
                    select: { url: true }
                },
                agente: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy,
            ...(limit && { take: parseInt(limit) }),
        });

        return res.json(propiedades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener propiedades públicas' });
    }
};

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
            include: {
                imagenes: {
                    take: 1,
                    select: { url: true }
                }
            },
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
            include: {
                imagenes: {
                    take: 1,
                    select: { url: true }
                }
            },
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

// Función para obtener recomendaciones con Python
export const obtenerRecomendaciones = async (req, res) => {
    try {
        const usuario = req.usuario;
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;

        // 1. Obtener favoritos del usuario
        const favoritos = await prisma.favorito.findMany({
            where: { usuarioId: usuario.id },
            include: {
                propiedad: { include: { imagenes: true } }
            }
        });

        // 2. Obtener todas las interacciones del usuario (VISTA, FAVORITO, CONTACTO)
        const interacciones = await prisma.interaccionUsuario.findMany({
            where: { usuarioId: usuario.id }
        });

        const tieneInteracciones = interacciones.length > 0 || favoritos.length > 0;
        if (!tieneInteracciones) {
            return res.status(200).json({
                recomendaciones: [],
                mensaje: "Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero",
                tieneFavoritos: false,
                algoritmo: "SVD (Basado en Contenido)"
            });
        }

        // 3. Obtener todas las propiedades disponibles
        const todasLasPropiedades = await prisma.propiedad.findMany({
            where: { estado_publicacion: 'disponible' },
            include: { imagenes: { take: 1, select: { url: true } } }
        });

        if (todasLasPropiedades.length === 0) {
            return res.status(200).json({
                recomendaciones: [],
                mensaje: "No hay propiedades disponibles para recomendarte",
                tieneFavoritos: true,
                algoritmo: "SVD (Basado en Contenido)"
            });
        }

        // 4. Consolidar pesos por propiedad (suma de VISTA+FAVORITO+CONTACTO)
        const pesosPorPropiedad = {};
        interacciones.forEach(inter => {
            const pid = inter.propiedadId;
            pesosPorPropiedad[pid] = (pesosPorPropiedad[pid] || 0) + inter.valor_peso;
        });
        // Incluir favoritos que aún no estén registrados en interacciones
        favoritos.forEach(fav => {
            if (!pesosPorPropiedad[fav.propiedadId]) {
                pesosPorPropiedad[fav.propiedadId] = 5;
            }
        });
        const interaccionesConsolidadas = Object.entries(pesosPorPropiedad).map(([propiedadId, peso_total]) => ({
            propiedadId: parseInt(propiedadId),
            peso_total
        }));

        // 5. Preparar features ricas de propiedades para el SVD
        const propiedadesDisponiblesData = todasLasPropiedades.map(prop => ({
            id: prop.id,
            precio: parseFloat(prop.precio),
            tipo_propiedad: prop.tipo_propiedad,
            transaccion: prop.transaccion,
            ciudad: prop.ciudad,
            provincia: prop.provincia,
            nro_habitaciones: prop.nro_habitaciones || 0,
            nro_banos: prop.nro_banos || 0,
            nro_parqueaderos: prop.nro_parqueaderos || 0,
            area_construccion: parseFloat(prop.area_construccion || 0),
            area_terreno: parseFloat(prop.area_terreno || 0),
            tiene_balcon: prop.tiene_balcon,
            tiene_terraza: prop.tiene_terraza,
            tiene_patio: prop.tiene_patio,
            tiene_piscina: prop.tiene_piscina,
            tiene_bodega: prop.tiene_bodega,
            tiene_area_bbq: prop.tiene_area_bbq,
            tiene_ascensor: prop.tiene_ascensor,
            tiene_seguridad: prop.tiene_seguridad,
            tiene_areas_comunales: prop.tiene_areas_comunales,
            amoblado: prop.amoblado
        }));

        // 6. Llamar al servicio Python con el modelo SVD
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

        try {
            const response = await axios.post(`${pythonServiceUrl}/recomendaciones`, {
                usuario_id: usuario.id,
                interacciones: interaccionesConsolidadas,
                propiedades_disponibles: propiedadesDisponiblesData,
                limit: limit
            }, {
                timeout: 15000,
                headers: { 'Content-Type': 'application/json' }
            });

            // Python devuelve lista de IDs ordenados por score
            const recomendacionesIds = response.data.recomendaciones.map(rec => rec.id);

            // Recuperar objetos completos manteniendo el orden del ranking
            const recomendacionesOrdenadas = [];
            recomendacionesIds.forEach(id => {
                const prop = todasLasPropiedades.find(p => p.id === id);
                if (prop) recomendacionesOrdenadas.push(prop);
            });

            return res.status(200).json({
                recomendaciones: recomendacionesOrdenadas,
                mensaje: response.data.mensaje,
                tieneFavoritos: true,
                totalFavoritos: favoritos.length,
                algoritmo: response.data.algoritmo,
                metricas: response.data.metricas
            });

        } catch (pythonError) {
            console.error('Error al comunicarse con servicio Python:', pythonError.message);
            console.log('Usando algoritmo JavaScript como fallback...');
            return await obtenerRecomendacionesFallback(req, res, favoritos, todasLasPropiedades, 3, limit);
        }

    } catch (error) {
        console.error('Error en recomendaciones:', error);
        return res.status(500).json({
            mensaje: 'Error al obtener recomendaciones',
            error: error.message,
            algoritmo: "SVD (Basado en Contenido)"
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

export const obtenerCodigoPreview = async (req, res) => {
    const { tipo } = req.query;

    if (!tipo) {
        return res.status(400).json({ mensaje: 'Tipo de propiedad requerido' });
    }

    try {
        const prefixMap = {
            casa: 'CAS',
            departamento: 'DEP',
            suite: 'SUI',
            local_comercial: 'LOC',
            oficina: 'OFI',
            bodega_galpon: 'BOD',
            edificio: 'EDI',
            terreno: 'TER',
            finca: 'FIN',
            quinta: 'QUI'
        };
        const prefix = prefixMap[tipo] || 'PRO';

        const count = await prisma.propiedad.count({
            where: { tipo_propiedad: tipo }
        });
        const sequence = (count + 1).toString().padStart(4, '0'); // CAS-0001
        const codigo_interno = `${prefix}-${sequence}`;

        res.json({ codigo: codigo_interno });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al generar código preview' });
    }
};

// Función para obtener metadata para filtros administrativos (Active properties only)
export const obtenerMetadataFiltros = async (req, res) => {
    try {
        const usuario = req.usuario;

        // Solo admin y agentes pueden ver esto
        if (usuario.rol !== 'admin' && usuario.rol !== 'agente') {
            return res.status(403).json({ mensaje: 'No tiene permisos' });
        }

        // Obtener valores únicos de TODAS las propiedades activas (no solo disponibles)
        // Esto permite filtrar por propiedades vendidas/reservadas antiguas
        const propiedades = await prisma.propiedad.findMany({
            where: {
                estado_publicacion: { not: 'inactiva' }
            },
            select: {
                tipo_propiedad: true,
                transaccion: true,
                ciudad: true
            }
        });

        // Extraer valores únicos usando Set
        const tipos = [...new Set(propiedades.map(p => p.tipo_propiedad))].sort();
        const transacciones = [...new Set(propiedades.map(p => p.transaccion))].sort();
        const ciudades = [...new Set(propiedades.map(p => p.ciudad))].sort();

        res.json({
            tipos,
            transacciones,
            ciudades
        });

    } catch (error) {
        console.error('Error al obtener metadata de filtros:', error);
        res.status(500).json({ mensaje: 'Error al obtener filtros' });
    }
};
