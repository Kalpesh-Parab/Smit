import { Router } from 'express';
import { getGoogleContacts } from '../controllers/contacts.controller.js';

const router = Router();
router.get('/', getGoogleContacts);

export default router;
