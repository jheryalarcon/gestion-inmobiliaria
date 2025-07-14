import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import propiedadRoutes from './routes/propiedad.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

const app = express();
app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/propiedades', propiedadRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

/*import prisma from './prisma/client.js';
import bcrypt from 'bcrypt';

const crearUsuario = async () => {
    const hash = await bcrypt.hash('123456', 10);

    await prisma.usuario.create({
        data: {
            name: 'Jhery',
            email: 'jhery@email.com',
            password: hash,
            rol: 'admin'
        }
    });

    console.log('Usuario creado');
};

crearUsuario();*/

