import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js';

dotenv.config();

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Correo electrónico o contraseña incorrectos' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Correo electrónico o contraseña incorrectos' });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                mensaje: 'Tu cuenta está inactiva, contacta al administrador'
            });
        }

        if (!usuario.verificado) {
            return res.status(403).json({
                mensaje: 'Por favor verifica tu correo electrónico para iniciar sesión'
            });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                name: usuario.name,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

export const register = async (req, res) => {
    const { name, email, password, telefono } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ mensaje: 'Los campos nombre, email y contraseña son obligatorios' });
    }

    // Validar fortaleza de la contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
        });
    }

    const emailLimpio = email.trim().toLowerCase();

    try {
        // Usamos una transacción para asegurar la integridad de datos
        // (Crear Usuario + Vincular/Crear Cliente)
        const resultadoFinal = await prisma.$transaction(async (tx) => {

            const usuarioExistente = await tx.usuario.findUnique({
                where: { email: emailLimpio },
            });

            if (usuarioExistente) {
                throw new Error('EMAIL_EXISTS');
            }

            const passwordEncriptada = await bcrypt.hash(password, 10);
            const verificacionToken = crypto.randomBytes(32).toString('hex');

            // 1. Crear el USUARIO (Login)
            const nuevoUsuario = await tx.usuario.create({
                data: {
                    name,
                    email: emailLimpio,
                    password: passwordEncriptada,
                    telefono: telefono || null,
                    rol: 'cliente',
                    verificado: false,
                    token_verificacion: verificacionToken,
                    token_verificacion_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
                },
            });

            // 2. BUSCAR si ya existe un CLIENTE en el CRM (Identidad Unificada)
            const clienteExistente = await tx.cliente.findFirst({
                where: { email: emailLimpio }
            });

            if (clienteExistente) {
                // CASO A: El cliente ya existía (creado por un agente)
                // Lo vinculamos al nuevo usuario para que vea su historia
                console.log(`🔗 Vinculando Usuario ${nuevoUsuario.id} con Cliente existente ${clienteExistente.id}`);
                await tx.cliente.update({
                    where: { id: clienteExistente.id },
                    data: {
                        // Solo actualizamos si no tiene usuario asignado, o forzamos la asignación
                        // Aquí asumimos que el email manda.
                        // Opcional: Podríamos validar si clienteExistente.usuarioId ya existe (conflicto raro)
                    }
                });

                // NOTA: Prisma no permite actualizar campos que no están en el modelo si "usuarioId" no es FK directa en Cliente.
                // Revisando schema: Cliente NO tiene campo "usuarioId" explícito en la definición que vi,
                // PERO Usuario tiene "clientes Cliente[]".
                // Esto implica que la FK suele estar en el lado id del modelo "many" o una tabla intermedia.
                // Un momento... Schema: "clientes Cliente[]" en Usuario. "agente Usuario? @relation..." en Cliente.
                // ¡ESPERA! El esquema indica Cliente.agenteId (Relación Agente -> Cliente).
                // ¿Dónde se guarda la relación Usuario (Portal) -> Cliente (CRM)?
                // Schema Line 36: `clientes Cliente[]`.
                // Schema Line 323: `agente Usuario? @relation...` -> Esto es el AGENTE responsable.

                // ⚠️ CRÍTICO: Parece que el esquema NO TIENE una relación explícita Usuario(tipo cliente) <-> Cliente(CRM).
                // El modelo "Usuario" tiene Rol='cliente', pero "Cliente" es otra tabla para el CRM.
                // Si no hay FK, no podemos vincularlos a nivel de BD.

                // REVISIÓN RÁPIDA: ¿Cómo sabe el sistema que el usuario logueado es el cliente X?
                // Actualmente NO LO SABE. Por eso están desconectados.

                // SOLUCIÓN: Necesitamos agregar esa conexión o usar el email como puente lógico.
                // Si modifico el schema ahora es arriesgado y costoso (migraciones).

                // ALTERNATIVA SEGURA LÓGICA:
                // El sistema buscará por EMAIL.
                // Si el frontend pide "Mis Negociaciones", el backend buscará Cliente donde email = usuario.email.

                // PERO... Espera. Si no hay FK, no necesito hacer update en DB.
                // Simplemente ambos registros existen con el mismo email.
                // La "Vinculación" es implícita por el correo electrónico.

                // ENTONCES: ¿Cuál era el problema?
                // Si ya existe un cliente con ese email, crear otro "Cliente" (tabla CRM) duplicaría la data si el registro lo hiciera.
                // Pero "register" hoy SOLO crea Usuario. No crea Cliente.

                // AJUSTE DE ESTRATEGIA:
                // Para que el CRM vea al nuevo usuario web como un "Cliente", DEBEMOS crearle una ficha de Cliente si no existe.
                // Y si sí existe, NO hacemos nada (ya tiene ficha).

                // Entonces:
                // Si clienteExistente -> NO HACEMOS NADA (Ya existe en CRM, el email coincide, todo OK).
                // Si !clienteExistente -> CREAMOS ficha en Cliente (Para que los agentes lo vean en "Nuevos Prospectos").
            } else {
                // CASO B: Es un usuario totalmente nuevo
                // Creamos su ficha de Cliente en el CRM para que los agentes lo vean.
                console.log(`✨ Creando ficha de Cliente CRM para nuevo Usuario ${nuevoUsuario.id}`);
                await tx.cliente.create({
                    data: {
                        nombre: name,
                        email: emailLimpio,
                        telefono: telefono || 'Sin teléfono',
                        tipo_cliente: 'prospecto', // Nace como prospecto
                        observaciones: 'Registrado desde el Portal Web',
                        activo: true
                        // No asignamos agenteId todavía (o asignamos uno por defecto/admin)
                    }
                });
            }

            return nuevoUsuario;
        });

        // Enviar correo de verificación
        await sendVerificationEmail(resultadoFinal.email, resultadoFinal.token_verificacion);

        res.status(201).json({
            mensaje: 'Usuario registrado. Por favor revisa tu correo para verificar tu cuenta.',
            requireVerification: true
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'EMAIL_EXISTS') {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ mensaje: 'Token de verificación requerido' });
    }

    try {
        const usuario = await prisma.usuario.findFirst({
            where: { token_verificacion: token }
        });

        if (!usuario) {
            return res.status(400).json({ mensaje: 'Token inválido' });
        }

        if (usuario.token_verificacion_expiracion && new Date() > usuario.token_verificacion_expiracion) {
            return res.status(400).json({ mensaje: 'El enlace de verificación ha expirado. Por favor solicita uno nuevo.' });
        }

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                verificado: true,
                token_verificacion: null
            }
        });

        res.json({ mensaje: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al verificar la cuenta' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ mensaje: 'El email es obligatorio' });
    }

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            // No revelamos si existe o no por seguridad
            return res.json({ mensaje: 'Si el correo existe, recibirás las instrucciones.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await prisma.usuario.update({
            where: { email },
            data: {
                token_recuperacion: token,
                token_recuperacion_expiracion: expiracion
            }
        });

        await sendPasswordResetEmail(email, token);

        res.json({ mensaje: 'Si el correo existe, recibirás las instrucciones.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ mensaje: 'La contraseña es obligatoria' });
    }

    // Validar fortaleza de la contraseña (consistente con el registro)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
        });
    }

    try {
        const usuario = await prisma.usuario.findFirst({
            where: { token_recuperacion: token }
        });

        if (!usuario) {
            return res.status(400).json({ mensaje: 'Token inválido' });
        }

        if (usuario.token_recuperacion_expiracion && new Date() > usuario.token_recuperacion_expiracion) {
            return res.status(400).json({ mensaje: 'El token ha expirado. Solicita uno nuevo.' });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                password: passwordEncriptada,
                token_recuperacion: null,
                token_recuperacion_expiracion: null
            }
        });

        res.json({ mensaje: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al restablecer la contraseña' });
    }
};



