import Expense from '../models/Expense.model.js';

// @desc    Get expenses (filterable by service)
// @route   GET /api/expenses?service=ambulance
export const getExpenses = async (req, res) => {
  try {
    const { service } = req.query;
    const filter = service ? { service } : {};
    const expenses = await Expense.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    // Calculate total spend
    const totalSpend = expenses.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalSpend,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const {
      service,
      title,
      category,
      amount,
      date,
      assetReference,
      paymentMode,
      notes,
    } = req.body;

    if (!service || !title || amount === undefined || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide service, title, and expense amount',
      });
    }

    const expense = await Expense.create({
      service,
      title: title.trim(),
      category: category || 'Fuel / Diesel',
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      assetReference: assetReference ? assetReference.trim() : '',
      paymentMode: paymentMode || 'UPI / Online',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
