import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
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
                nombre: usuario.nombre,
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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
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

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                name,
                email: emailLimpio,
                password: passwordEncriptada,
                rol: 'cliente',
            },
        });

        // 🔐 Crear el token
        const token = jwt.sign(
            { id: nuevoUsuario.id, rol: nuevoUsuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // ✅ Enviar el token con los datos del usuario
        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            token,
            usuario: {
                id: nuevoUsuario.id,
                name: nuevoUsuario.name,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
};



