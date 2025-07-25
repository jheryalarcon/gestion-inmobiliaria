import express from 'express';
import favoriteController from '../controllers/favorite.controller.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

// Añadir a favoritos
router.post('/', verificarToken, favoriteController.addFavorite);
// Quitar de favoritos
router.delete('/', verificarToken, favoriteController.removeFavorite);
// Listar favoritos
router.get('/', verificarToken, favoriteController.getFavorites);

export default router;
