import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import propiedadRoutes from './routes/propiedad.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import negociacionRoutes from './routes/negociacion.routes.js';
import seguimientoRoutes from './routes/seguimiento.routes.js';
import notaInternaRoutes from './routes/notaInterna.routes.js';
import archivoNegociacionRoutes from './routes/archivoNegociacion.routes.js';
import agentesRoutes from './routes/agentes.routes.js';
import documentoRoutes from './routes/documento.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import interaccionRoutes from './routes/interaccion.routes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Obtener orígenes permitidos desde el entorno
const urlsPermitidas = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean); // Filtrar falsos/indefinidos

// Configuración de CORS más específica
app.use(cors({
    origin: urlsPermitidas,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// app.use(morgan('dev')) // Comentado para limpiar la consola
app.use(express.json());
// Servir archivos estáticos desde la carpeta uploads con ruta absoluta
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/propiedades', propiedadRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/favoritos', favoriteRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/negociaciones', negociacionRoutes);
app.use('/api/seguimientos', seguimientoRoutes);
app.use('/api/notas-internas', notaInternaRoutes);
app.use('/api/archivos-negociacion', archivoNegociacionRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interacciones', interaccionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

