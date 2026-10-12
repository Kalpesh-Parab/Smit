import HallAdmin from '../models/hallAdmin.model.js';
import jwt from 'jsonwebtoken';

// 1. One-time registration via Postman / Insomnia
export const registerHallAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    const existingAdmin = await HallAdmin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Hall Admin already exists with this email',
        });
    }

    const newAdmin = await HallAdmin.create({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Hall Admin registered successfully',
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error('Error registering Hall Admin:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Login handler for frontend
export const loginHallAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    const admin = await HallAdmin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'hall_secret_fallback_key',
      { expiresIn: '7d' },
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error during Hall Admin login:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
