import prisma from '../prisma/client.js'

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

    try {
        let propiedades;

        if (usuario.rol === 'admin') {
            propiedades = await prisma.propiedad.findMany({
                where: {
                    estado_publicacion: {
                        not: 'inactiva',
                    },
                },
                include: { imagenes: true },
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
                include: { imagenes: true },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Cliente u otro
            propiedades = [];
        }

        return res.json(propiedades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener propiedades' });
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

        res.json(propiedad);
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
