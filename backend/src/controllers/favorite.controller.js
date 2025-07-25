import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Añadir propiedad a favoritos
async function addFavorite(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { propiedadId } = req.body;
    // Validar que la propiedad exista
    const propiedad = await prisma.propiedad.findUnique({
      where: { id: propiedadId }
    });
    if (!propiedad) {
      return res.status(404).json({ message: 'La propiedad no existe.' });
    }
    // Verifica si ya existe
    const exists = await prisma.favorito.findUnique({
      where: { usuarioId_propiedadId: { usuarioId, propiedadId } }
    });
    if (exists) {
      return res.status(200).json({ message: 'Ya está en favoritos.' });
    }
    const favorito = await prisma.favorito.create({
      data: { usuarioId, propiedadId }
    });
    res.status(201).json(favorito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Quitar propiedad de favoritos
async function removeFavorite(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { propiedadId } = req.body;
    await prisma.favorito.delete({
      where: { usuarioId_propiedadId: { usuarioId, propiedadId } }
    });
    res.status(200).json({ message: 'Eliminado de favoritos.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Listar favoritos del usuario
async function getFavorites(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      include: { propiedad: true }
    });
    res.status(200).json(favoritos.map(f => f.propiedad));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  addFavorite,
  removeFavorite,
  getFavorites
};
