#!/usr/bin/env node

/**
 * 🔧 Script de Configuración de Variables de Entorno
 * 
 * Este script ayuda a configurar el archivo .env para el backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración por defecto
const defaultEnv = {
    DATABASE_URL: "postgresql://postgres:password@localhost:5432/inmobiliaria_db",
    JWT_SECRET: "mi_clave_secreta_jwt_super_segura_2024_inmobiliaria",
    BACKEND_URL: "http://localhost:3000",
    PYTHON_SERVICE_URL: "http://localhost:5001",
    NODE_ENV: "development",
    PORT: "3000"
};

// Función para generar JWT secret seguro
function generateJWTSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Función para crear el archivo .env
function createEnvFile() {
    const envPath = path.join(__dirname, '.env');
    
    // Verificar si ya existe
    if (fs.existsSync(envPath)) {
        console.log('⚠️  El archivo .env ya existe.');
        console.log('¿Deseas sobrescribirlo? (y/N)');
        
        // En un entorno interactivo, podrías usar readline
        // Por ahora, simplemente creamos un backup
        const backupPath = path.join(__dirname, '.env.backup');
        fs.copyFileSync(envPath, backupPath);
        console.log(`📁 Backup creado en: ${backupPath}`);
    }
    
    // Generar JWT secret único
    const jwtSecret = generateJWTSecret();
    
    // Crear contenido del archivo .env
    const envContent = `# 🔧 Variables de Entorno para Backend Inmobiliaria
# Generado automáticamente el ${new Date().toISOString()}

# 🗄️ Base de Datos
# IMPORTANTE: Actualiza con tus credenciales reales
DATABASE_URL="${defaultEnv.DATABASE_URL}"

# 🔐 Autenticación JWT
# Clave secreta generada automáticamente
JWT_SECRET="${jwtSecret}"

# 🌐 URLs de Servicios
BACKEND_URL="${defaultEnv.BACKEND_URL}"
PYTHON_SERVICE_URL="${defaultEnv.PYTHON_SERVICE_URL}"

# 🚀 Configuración del Servidor
NODE_ENV="${defaultEnv.NODE_ENV}"
PORT="${defaultEnv.PORT}"
`;

    // Escribir el archivo
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente!');
    console.log(`📁 Ubicación: ${envPath}`);
    
    return envPath;
}

// Función para verificar la configuración
function verifyConfiguration() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ El archivo .env no existe.');
        return false;
    }
    
    // Leer y verificar variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'BACKEND_URL'];
    
    let allPresent = true;
    requiredVars.forEach(varName => {
        if (!envContent.includes(varName)) {
            console.log(`❌ Variable ${varName} no encontrada`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Todas las variables requeridas están presentes');
    }
    
    return allPresent;
}

// Función para mostrar instrucciones
function showInstructions() {
    console.log(`
🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

📋 PASOS SIGUIENTES:

1. 🗄️  CONFIGURAR BASE DE DATOS:
   - Instalar PostgreSQL
   - Crear base de datos: inmobiliaria_db
   - Actualizar DATABASE_URL en .env

2. 🚀 EJECUTAR MIGRACIONES:
   npx prisma db push
   npx prisma generate

3. ▶️  INICIAR BACKEND:
   npm run dev

4. 🧪 PROBAR ENDPOINT:
   curl http://localhost:3000/api/propiedades/publicas?limit=6

📚 DOCUMENTACIÓN:
   Ver archivo: CONFIGURACION_ENV.md
`);
}

// Función principal
function main() {
    console.log('🔧 Configurando variables de entorno para Backend Inmobiliaria...\n');
    
    try {
        // Crear archivo .env
        const envPath = createEnvFile();
        
        // Verificar configuración
        console.log('\n🔍 Verificando configuración...');
        const isValid = verifyConfiguration();
        
        if (isValid) {
            console.log('\n✅ Configuración completada exitosamente!');
        } else {
            console.log('\n⚠️  Configuración incompleta. Revisa el archivo .env');
        }
        
        // Mostrar instrucciones
        showInstructions();
        
    } catch (error) {
        console.error('❌ Error durante la configuración:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createEnvFile, verifyConfiguration, generateJWTSecret };
