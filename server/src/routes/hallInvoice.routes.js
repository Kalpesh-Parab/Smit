import express from 'express';
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from '../controllers/hallInvoice.controller.js';

const router = express.Router();

router.route('/').get(getInvoices).post(createInvoice);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

export default router;
