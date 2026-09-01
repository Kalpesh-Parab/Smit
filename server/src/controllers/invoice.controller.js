import Invoice from '../models/Invoice.model.js';

// @desc    Get invoices (filterable by service query)
// @route   GET /api/invoices?service=ambulance
export const getInvoices = async (req, res) => {
  try {
    const { service } = req.query;
    const filter = service ? { service } : {};
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    console.error('[Get Invoices Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error('[Get Invoice By ID Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @desc    Create new invoice
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
  try {
    const {
      service,
      partyName,
      partyPhone,
      date,
      serviceDetails,
      totalBill,
      paidAmount,
      notes,
    } = req.body;

    if (
      !service ||
      !partyName ||
      !partyPhone ||
      totalBill === undefined ||
      totalBill === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service, party details, and total bill',
      });
    }

    // Find the latest invoice sorted by createdAt
    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (latestInvoice && latestInvoice.invoiceNumber) {
      // Matches clean format like "INV-001" or numeric suffix
      const match = latestInvoice.invoiceNumber.match(/^INV-(\d+)$/i);
      if (match) {
        const lastSeq = parseInt(match[1], 10);
        if (!isNaN(lastSeq) && lastSeq < 5000) {
          // Ignores any previous random 4-digit artifacts
          nextNumber = lastSeq + 1;
        } else {
          // If previous had legacy random numbers, count total valid records
          const count = await Invoice.countDocuments();
          nextNumber = count + 1;
        }
      } else {
        const count = await Invoice.countDocuments();
        nextNumber = count + 1;
      }
    }

    // Format as INV-001, INV-002, INV-003...
    const invoiceNumber = `INV-${String(nextNumber).padStart(3, '0')}`;

    const newInvoice = new Invoice({
      invoiceNumber,
      service,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      date: date ? new Date(date) : new Date(),
      serviceDetails: serviceDetails || {},
      totalBill: Number(totalBill) || 0,
      paidAmount: Number(paidAmount) || 0,
      notes: notes || '',
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json({ success: true, data: savedInvoice });
  } catch (error) {
    console.error('[Create Invoice Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    const {
      partyName,
      partyPhone,
      date,
      serviceDetails,
      totalBill,
      paidAmount,
      notes,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }

    if (partyName) invoice.partyName = partyName.trim();
    if (partyPhone) invoice.partyPhone = partyPhone.trim();
    if (date) invoice.date = new Date(date);
    if (serviceDetails) invoice.serviceDetails = serviceDetails;
    if (totalBill !== undefined && totalBill !== '')
      invoice.totalBill = Number(totalBill);
    if (paidAmount !== undefined && paidAmount !== '')
      invoice.paidAmount = Number(paidAmount);
    if (notes !== undefined) invoice.notes = notes;

    const updatedInvoice = await invoice.save();
    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error('[Update Invoice Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('[Delete Invoice Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
