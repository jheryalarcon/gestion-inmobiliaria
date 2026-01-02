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
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: emailLimpio },
        });

        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        const verificacionToken = crypto.randomBytes(32).toString('hex');

        const nuevoUsuario = await prisma.usuario.create({
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

        // Enviar correo de verificación
        await sendVerificationEmail(nuevoUsuario.email, verificacionToken);

        // Crear el token (JWT) - Opcional: Podríamos no enviarlo si queremos obligar a login
        // Pero para UX fluida, a veces se permite login temporal o limitado.
        // En este caso, NO enviamos token de sesión, forzamos verificación.

        res.status(201).json({
            mensaje: 'Usuario registrado. Por favor revisa tu correo para verificar tu cuenta.',
            requireVerification: true
        });
    } catch (error) {
        console.error(error);
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

    if (password.length < 6) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
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



