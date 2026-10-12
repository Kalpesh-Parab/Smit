import HallCategory from '../models/HallCategory.model.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await HallCategory.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, billingType, defaultRate } = req.body;
    const category = await HallCategory.create({
      name,
      billingType,
      defaultRate,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await HallCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await HallCategory.findByIdAndUpdate(id, { isActive: false });
    res.status(200).json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
