import {
  sendPDFInvoice,
  getWhatsAppStatus,
} from '../services/whatsapp/baileys.service.js';

export const getStatus = async (req, res) => {
  try {
    const status = getWhatsAppStatus();
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendInvoice = async (req, res) => {
  try {
    const { phone, partyName, invoiceNumber } = req.body;
    const file = req.file;

    if (!phone || !file) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and PDF invoice file are required.',
      });
    }

    const caption = `Dear ${partyName},\n\nPlease find attached your official invoice *#${invoiceNumber}* from *Smit Office*.\n\nThank you for your business!`;

    await sendPDFInvoice({
      phone,
      pdfBuffer: file.buffer,
      fileName: `${invoiceNumber}.pdf`,
      caption,
    });

    res
      .status(200)
      .json({ success: true, message: 'Invoice PDF sent via WhatsApp!' });
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
