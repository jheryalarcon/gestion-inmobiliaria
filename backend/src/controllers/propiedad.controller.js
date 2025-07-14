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
    if (!descripcion?.trim()) errores.push('La descripción es obligatoria');
    if (!tipo_propiedad) errores.push('El tipo de propiedad es obligatorio');
    if (!estado_propiedad) errores.push('El estado físico de la propiedad es obligatorio');
    if (!transaccion) errores.push('El tipo de transacción es obligatorio');
    if (isNaN(Number(precio)) || Number(precio) <= 0) errores.push('El precio es obligatorio y debe ser un número positivo');

    if (!direccion?.trim()) errores.push('La dirección es obligatoria');
    if (!ciudad?.trim()) errores.push('La ciudad es obligatoria');
    if (!provincia) errores.push('La provincia es obligatoria');

    if (isNaN(Number(area_terreno)) || Number(area_terreno) <= 0)
        errores.push('Área del terreno inválida');
    if (isNaN(Number(area_construccion)) || Number(area_construccion) <= 0)
        errores.push('Área de construcción inválida');

    if (isNaN(Number(nro_habitaciones)) || Number(nro_habitaciones) <= 0)
        errores.push('Número de habitaciones inválido');
    if (isNaN(Number(nro_banos)) || Number(nro_banos) <= 0)
        errores.push('Número de baños inválido');
    if (isNaN(Number(nro_parqueaderos)) || Number(nro_parqueaderos) < 0)
        errores.push('Número de parqueaderos inválido');
    if (isNaN(Number(nro_pisos)) || Number(nro_pisos) <= 0)
        errores.push('Número de pisos inválido');

    if (!archivos || archivos.length === 0) {
        errores.push('Debe subir al menos una imagen');
    }

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
                descripcion,
                tipo_propiedad,
                estado_propiedad,
                transaccion,
                precio: parseFloat(precio),
                moneda,
                direccion,
                ciudad,
                provincia,
                pais: 'Ecuador',
                codigo_postal,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                area_construccion: parseFloat(area_construccion),
                nro_habitaciones: parseInt(nro_habitaciones),
                nro_banos: parseInt(nro_banos),
                nro_parqueaderos: parseInt(nro_parqueaderos),
                nro_pisos: parseInt(nro_pisos),
                anio_construccion: anio_construccion ? parseInt(anio_construccion) : null,
                estado_publicacion: estado_publicacion || 'disponible',
                agenteId,
            },
        });

        const imagenes = archivos.map((file) => ({
            url: `/uploads/${file.filename}`,
            propiedadId: propiedad.id,
        }));

        await prisma.imagen.createMany({data: imagenes});

        res.status(201).json({
            mensaje: 'Propiedad registrada correctamente',
            propiedad,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({mensaje: 'Error al registrar la propiedad'});
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

    // Validación general
    if (!titulo?.trim()) errores.push('El título es obligatorio');
    if (!tipo_propiedad) errores.push('Debe seleccionar un tipo de propiedad');
    if (!estado_propiedad) errores.push('Debe seleccionar estado físico');
    if (!transaccion) errores.push('Debe seleccionar tipo de transacción');
    if (!precio || isNaN(precio)) errores.push('El precio debe ser un número válido');
    if (!direccion?.trim()) errores.push('La dirección es obligatoria');
    if (!ciudad?.trim()) errores.push('La ciudad es obligatoria');
    if (!provincia) errores.push('La provincia es obligatoria');
    if (!area_terreno || isNaN(area_terreno)) errores.push('Área del terreno inválida');
    if (!area_construccion || isNaN(area_construccion)) errores.push('Área de construcción inválida');
    if (!nro_habitaciones || isNaN(nro_habitaciones)) errores.push('Número de habitaciones inválido');
    if (!nro_banos || isNaN(nro_banos)) errores.push('Número de baños inválido');
    if (!nro_parqueaderos || isNaN(nro_parqueaderos)) errores.push('Número de parqueaderos inválido');
    if (!nro_pisos || isNaN(nro_pisos)) errores.push('Número de pisos inválido');

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
                descripcion,
                tipo_propiedad,
                estado_propiedad,
                transaccion,
                precio: parseFloat(precio),
                moneda,
                direccion,
                ciudad,
                provincia,
                pais: 'Ecuador',
                codigo_postal,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                area_terreno: parseFloat(area_terreno),
                area_construccion: parseFloat(area_construccion),
                nro_habitaciones: parseInt(nro_habitaciones),
                nro_banos: parseInt(nro_banos),
                nro_parqueaderos: parseInt(nro_parqueaderos),
                nro_pisos: parseInt(nro_pisos),
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

    if (!estadosPermitidos.includes(nuevoEstado)) {
        return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    try {
        const propiedad = await prisma.propiedad.update({
            where: { id: parseInt(id) },
            data: {
                estado_publicacion: nuevoEstado
            }
        });

        return res.json({ mensaje: 'Estado actualizado', propiedad });
    } catch (error) {
        console.error(error);
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
