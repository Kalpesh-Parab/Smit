import { Router } from 'express';
import { googleLogin, getCurrentUser, logout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', googleLogin);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;