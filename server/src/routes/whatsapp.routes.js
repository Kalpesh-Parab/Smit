import express from 'express';
import fs from 'fs';
import path from 'path';
import Invoice from '../models/Invoice.model.js';
import Expense from '../models/Expense.model.js';
import Ambulance from '../models/Ambulance.model.js';
import Generator from '../models/Generator.model.js';
import TowingVan from '../models/TowingVan.model.js';
import { createInvoicePdfBuffer } from '../utils/generateInvoicePdf.js';
import { createReportPdfBuffer } from '../utils/generateReportPdf.js';
import {
  sock,
  getWhatsappStatus,
  connectToWhatsApp,
  sendPDFInvoice,
} from '../services/whatsapp/baileys.service.js';

const router = express.Router();

const EXPENSE_CATEGORIES = [
  'Fuel / Diesel',
  'Maintenance & Repairs',
  'Driver / Operator Salary',
  'Insurance & Taxes',
  'Toll & Travel',
  'Other',
];

// 1. Status route with anti-caching headers
router.get('/status', (req, res) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const status = getWhatsappStatus();
  res.json(status);
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
    console.error('[WhatsApp Send Invoice Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch invoice',
    });
  }
});

// 4. Send Filtered Analytics & Executive Report PDF
router.post('/send-report', async (req, res) => {
  try {
    const {
      recipientPhone,
      service,
      filterType = 'this-month',
      month,
      year,
      singleDate,
      startDate,
      endDate,
      periodLabel,
    } = req.body;

    if (!recipientPhone) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Recipient phone number is required',
        });
    }

    const now = new Date();
    let dateQuery = {};

    if (filterType === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      dateQuery = { date: { $gte: start, $lte: end } };
    } else if (filterType === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      dateQuery = { date: { $gte: start, $lte: end } };
    } else if (filterType === 'single-day' && singleDate) {
      const start = new Date(singleDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(singleDate);
      end.setHours(23, 59, 59, 999);
      dateQuery = { date: { $gte: start, $lte: end } };
    } else if (
      filterType === 'custom-month' &&
      month !== undefined &&
      year !== undefined
    ) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      dateQuery = { date: { $gte: start, $lte: end } };
    } else if (filterType === 'custom-range' && startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    const baseFilter = service ? { service, ...dateQuery } : { ...dateQuery };

    const [invoices, expenses, ambulances, generators, towingVans] =
      await Promise.all([
        Invoice.find(baseFilter),
        Expense.find(baseFilter),
        Ambulance.countDocuments(),
        Generator.countDocuments(),
        TowingVan.countDocuments(),
      ]);

    const totalBilled = invoices.reduce(
      (sum, inv) => sum + (inv.totalBill || 0),
      0,
    );
    const totalCollected = invoices.reduce(
      (sum, inv) => sum + (inv.paidAmount || 0),
      0,
    );
    const totalPending = invoices.reduce(
      (sum, inv) => sum + (inv.remainingAmount || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0,
    );
    const netProfit = totalCollected - totalExpenses;

    const fuelExpense = expenses
      .filter((exp) => exp.category === 'Fuel / Diesel')
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const categoryBreakdown = EXPENSE_CATEGORIES.map((cat) => {
      const total = expenses
        .filter((exp) => exp.category === cat)
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return { category: cat, amount: total };
    }).sort((a, b) => b.amount - a.amount);

    const serviceBreakdown = {
      ambulance: {
        billed: invoices
          .filter((i) => i.service === 'ambulance')
          .reduce((s, i) => s + (i.totalBill || 0), 0),
        expenses: expenses
          .filter((e) => e.service === 'ambulance')
          .reduce((s, e) => s + (e.amount || 0), 0),
        count: invoices.filter((i) => i.service === 'ambulance').length,
      },
      generators: {
        billed: invoices
          .filter((i) => i.service === 'generators')
          .reduce((s, i) => s + (i.totalBill || 0), 0),
        expenses: expenses
          .filter((e) => e.service === 'generators')
          .reduce((s, e) => s + (e.amount || 0), 0),
        count: invoices.filter((i) => i.service === 'generators').length,
      },
      'towing-vans': {
        billed: invoices
          .filter((i) => i.service === 'towing-vans')
          .reduce((s, i) => s + (i.totalBill || 0), 0),
        expenses: expenses
          .filter((e) => e.service === 'towing-vans')
          .reduce((s, e) => s + (e.amount || 0), 0),
        count: invoices.filter((i) => i.service === 'towing-vans').length,
      },
    };

    const analyticsData = {
      totalBilled,
      totalCollected,
      totalPending,
      totalExpenses,
      fuelExpense,
      netProfit,
      categoryBreakdown,
      serviceBreakdown,
    };

    const reportTitle = service
      ? `${service.replace('-', ' ')} Service Report`
      : 'Operations & Financial Report';

    const pdfBuffer = await createReportPdfBuffer({
      reportTitle,
      periodLabel: periodLabel || 'Current Active Period',
      analyticsData,
      serviceName: service,
    });

    const caption = `📊 *Smit Office - ${reportTitle}*\n🗓️ *Period:* ${periodLabel || 'Active Filter'}\n\n• *Collected:* ₹${totalCollected.toLocaleString('en-IN')}\n• *Pending:* ₹${totalPending.toLocaleString('en-IN')}\n• *Fuel Exp:* ₹${fuelExpense.toLocaleString('en-IN')}\n• *Total Exp:* ₹${totalExpenses.toLocaleString('en-IN')}\n• *Net Profit:* ₹${netProfit.toLocaleString('en-IN')}\n\n_Please find attached the detailed PDF audit report._`;

    await sendPDFInvoice({
      phone: recipientPhone,
      pdfBuffer,
      fileName: `Report_${service || 'Dashboard'}_${Date.now()}.pdf`,
      caption,
    });

    res
      .status(200)
      .json({ success: true, message: 'Executive Report sent to WhatsApp!' });
  } catch (error) {
    console.error('[Send Report Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch report',
    });
  }
});

export default router;
