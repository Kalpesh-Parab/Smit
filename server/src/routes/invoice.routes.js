import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoice.controller.js';
import Invoice from '../models/Invoice.model.js';
import { createInvoicePdfBuffer } from '../utils/generateInvoicePdf.js';

const router = Router();

// Stream lightweight vector PDF directly
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }

    const pdfBuffer = await createInvoicePdfBuffer(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Invoice_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/').get(getInvoices).post(createInvoice);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

export default router;
