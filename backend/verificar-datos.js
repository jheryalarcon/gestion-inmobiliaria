#!/usr/bin/env node

/**
 * 🔍 Script para verificar datos en la base de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarDatos() {
    try {
        console.log('🔍 Verificando datos en la base de datos...\n');

        // Verificar propiedades
        const propiedades = await prisma.propiedad.findMany({
            include: {
                imagenes: true,
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        console.log(`📊 Total de propiedades: ${propiedades.length}`);
        
        if (propiedades.length > 0) {
            console.log('\n🏠 Propiedades encontradas:');
            propiedades.forEach((prop, index) => {
                console.log(`\n${index + 1}. ${prop.titulo}`);
                console.log(`   ID: ${prop.id}`);
                console.log(`   Estado: ${prop.estado_publicacion}`);
                console.log(`   Precio: $${prop.precio}`);
                console.log(`   Ciudad: ${prop.ciudad}`);
                console.log(`   Agente: ${prop.agente?.name || 'Sin agente'}`);
                console.log(`   Imágenes: ${prop.imagenes.length}`);
            });
        } else {
            console.log('❌ No se encontraron propiedades en la base de datos');
        }

        // Verificar propiedades públicas (disponibles)
        const propiedadesPublicas = await prisma.propiedad.findMany({
            where: {
                estado_publicacion: 'disponible'
            },
            include: {
                imagenes: true,
                agente: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        console.log(`\n🌐 Propiedades públicas (disponibles): ${propiedadesPublicas.length}`);
        
        if (propiedadesPublicas.length > 0) {
            console.log('\n✅ Propiedades que deberían aparecer en el frontend:');
            propiedadesPublicas.forEach((prop, index) => {
                console.log(`\n${index + 1}. ${prop.titulo}`);
                console.log(`   ID: ${prop.id}`);
                console.log(`   Precio: $${prop.precio}`);
                console.log(`   Ciudad: ${prop.ciudad}`);
                console.log(`   Imágenes: ${prop.imagenes.length}`);
            });
        } else {
            console.log('❌ No hay propiedades públicas disponibles');
        }

        // Verificar usuarios
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                rol: true
            }
        });

        console.log(`\n👥 Total de usuarios: ${usuarios.length}`);
        if (usuarios.length > 0) {
            console.log('\n👤 Usuarios:');
            usuarios.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.rol}) - ${user.email}`);
            });
        }

        // Verificar imágenes
        const imagenes = await prisma.imagen.findMany();
        console.log(`\n🖼️ Total de imágenes: ${imagenes.length}`);

    } catch (error) {
        console.error('❌ Error al verificar datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar verificación
verificarDatos();
