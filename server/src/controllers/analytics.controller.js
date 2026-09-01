import Invoice from '../models/Invoice.model.js';
import Expense from '../models/Expense.model.js';
import Ambulance from '../models/Ambulance.model.js';
import Generator from '../models/Generator.model.js';
import TowingVan from '../models/TowingVan.model.js';

const EXPENSE_CATEGORIES = [
  'Fuel / Diesel',
  'Maintenance & Repairs',
  'Driver / Operator Salary',
  'Insurance & Taxes',
  'Toll & Travel',
  'Other',
];

export const getAnalytics = async (req, res) => {
  try {
    const {
      service,
      filterType = 'this-month',
      month,
      year,
      singleDate,
      startDate,
      endDate,
    } = req.query;
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
      return {
        category: cat,
        amount: total,
      };
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

    res.status(200).json({
      success: true,
      data: {
        totalBilled,
        totalCollected,
        totalPending,
        totalExpenses,
        fuelExpense,
        netProfit,
        invoiceCount: invoices.length,
        expenseCount: expenses.length,
        categoryBreakdown,
        fleetSummary: {
          ambulances,
          generators,
          towingVans,
        },
        serviceBreakdown,
        recentInvoices: invoices.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
