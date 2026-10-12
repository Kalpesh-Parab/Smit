import express from 'express';
import {
  getInvoices,
  createInvoice,
} from '../controllers/hallInvoice.controller.js';

const router = express.Router();

router.route('/').get(getInvoices).post(createInvoice);

export default router;
