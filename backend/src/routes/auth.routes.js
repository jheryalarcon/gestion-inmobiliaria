import { Router } from 'express';
import { login, register, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
