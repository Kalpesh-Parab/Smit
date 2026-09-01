import express from 'express';
import fs from 'fs';
import path from 'path';
import Invoice from '../models/Invoice.model.js';
import { createInvoicePdfBuffer } from '../utils/generateInvoicePdf.js';
import {
  sock,
  isWhatsappConnected,
  latestQrDataUrl,
  connectToWhatsApp,
  sendPDFInvoice,
} from '../services/whatsapp/baileys.service.js';

const router = express.Router();

// 1. Status route with anti-caching headers
router.get('/status', (req, res) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json({
    connected: isWhatsappConnected,
    qrCode: latestQrDataUrl,
  });
});

// 2. Disconnect / Logout route
router.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    const authDir = path.join(process.cwd(), 'baileys_auth_info');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }
    connectToWhatsApp();
    return res.json({
      success: true,
      message: 'Logged out. Ready to pair new device!',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Send Invoice PDF by Invoice ID
router.post('/send-invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }

    if (!invoice.partyPhone) {
      return res
        .status(400)
        .json({ success: false, message: 'Customer phone number is missing' });
    }

    // Generate ~5 KB PDF buffer instantly
    const pdfBuffer = await createInvoicePdfBuffer(invoice);

    const caption = `Dear *${invoice.partyName}*,\n\nPlease find attached your official invoice *#${invoice.invoiceNumber}* from *Smit Office*.\n\n*Total Amount:* ₹${invoice.totalBill}\n*Paid:* ₹${invoice.paidAmount}\n*Balance:* ₹${invoice.remainingAmount}\n\nThank you for your business!`;

    await sendPDFInvoice({
      phone: invoice.partyPhone,
      pdfBuffer,
      fileName: `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`,
      caption,
    });

    res
      .status(200)
      .json({ success: true, message: 'Invoice PDF sent via WhatsApp!' });
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || 'Failed to dispatch invoice',
      });
  }
});

export default router;
