import HallInvoice from '../models/HallInvoice.model.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await HallInvoice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const count = await HallInvoice.countDocuments();
    const invoiceNumber = `WH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const { customer, eventDetails, items, billing, internalCosting } =
      req.body;

    const subTotal = (items || []).reduce(
      (acc, item) => acc + Number(item.rate || 0) * Number(item.quantity || 1),
      0,
    );
    const advance = Number(billing?.advancePaid) || 0;
    const balance = Math.max(0, subTotal - advance);

    const cateringCost = Number(internalCosting?.cateringExpense) || 0;
    const maintenance = Number(internalCosting?.hallMaintenance) || 0;
    const workerSal = Number(internalCosting?.workerSalary) || 0;
    const netProfit = subTotal - (cateringCost + maintenance + workerSal);

    const invoice = await HallInvoice.create({
      invoiceNumber,
      customer,
      eventDetails,
      items: (items || []).map((i) => ({
        ...i,
        total: Number(i.rate || 0) * Number(i.quantity || 1),
      })),
      billing: {
        subTotal,
        advancePaid: advance,
        balanceDue: balance,
        paymentStatus:
          balance === 0 ? 'PAID' : advance > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      },
      internalCosting: {
        cateringExpense: cateringCost,
        hallMaintenance: maintenance,
        workerSalary: workerSal,
        netProfit,
      },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
