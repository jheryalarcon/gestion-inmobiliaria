/**
 * Script de migración única: cifra las notas internas que están en texto plano.
 * Ejecutar UNA SOLA VEZ, después de desplegar el cambio en notaInterna.controller.js.
 *
 * Uso:
 *   node scripts/migrar-notas-cifrado.js
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

const prisma = new PrismaClient();

function getKey() {
    const keyHex = process.env.NOTES_ENCRYPTION_KEY;
    if (!keyHex) throw new Error('NOTES_ENCRYPTION_KEY no está definida en .env');
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) throw new Error('NOTES_ENCRYPTION_KEY debe ser 64 caracteres hex');
    return key;
}

function cifrar(texto) {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${cifrado.toString('hex')}`;
}

function estaCifrado(texto) {
    const partes = texto.split(':');
    if (partes.length !== 3) return false;
    return partes[0].length === 32 && /^[0-9a-f]+$/i.test(partes[0]);
}

async function migrar() {
    console.log('🔍 Leyendo notas internas de la base de datos...');
    const todasLasNotas = await prisma.notaInterna.findMany();

    console.log(`📋 Total de notas encontradas: ${todasLasNotas.length}`);

    const notasEnPlano = todasLasNotas.filter(n => !estaCifrado(n.contenido));
    const notasYaCifradas = todasLasNotas.length - notasEnPlano.length;

    console.log(`✅ Ya cifradas: ${notasYaCifradas}`);
    console.log(`⚠️  En texto plano (a migrar): ${notasEnPlano.length}`);

    if (notasEnPlano.length === 0) {
        console.log('\n🎉 No hay notas que migrar. Todo está cifrado.');
        return;
    }

    let migradas = 0;
    let errores = 0;

    for (const nota of notasEnPlano) {
        try {
            const contenidoCifrado = cifrar(nota.contenido);
            await prisma.notaInterna.update({
                where: { id: nota.id },
                data: { contenido: contenidoCifrado }
            });
            migradas++;
            process.stdout.write(`\r🔐 Migrando... ${migradas}/${notasEnPlano.length}`);
        } catch (err) {
            errores++;
            console.error(`\n❌ Error migrando nota ID ${nota.id}:`, err.message);
        }
    }

    console.log(`\n\n📊 Resultado:`);
    console.log(`   ✅ Migradas exitosamente: ${migradas}`);
    if (errores > 0) {
        console.log(`   ❌ Con error:            ${errores}`);
    }
    console.log('\n🔒 Migración completada. Las notas antiguas ahora están cifradas.');
}

migrar()
    .catch(err => {
        console.error('❌ Error crítico:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
