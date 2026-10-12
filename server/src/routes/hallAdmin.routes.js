import express from 'express';
import {
  registerHallAdmin,
  loginHallAdmin,
} from '../controllers/hallAdmin.controller.js';

const router = express.Router();

// Used via Postman / Insomnia
router.post('/register', registerHallAdmin);

// Used by your Frontend Login component
router.post('/login', loginHallAdmin);

export default router;
