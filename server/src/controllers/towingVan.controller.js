import TowingVan from '../models/TowingVan.model.js';

// @desc    Get all towing vans
// @route   GET /api/towing-vans
export const getTowingVans = async (req, res) => {
  try {
    const vans = await TowingVan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vans.length, data: vans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single towing van by ID
// @route   GET /api/towing-vans/:id
export const getTowingVanById = async (req, res) => {
  try {
    const van = await TowingVan.findById(req.params.id);
    if (!van) {
      return res
        .status(404)
        .json({ success: false, message: 'Towing van not found' });
    }
    res.status(200).json({ success: true, data: van });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new towing van
// @route   POST /api/towing-vans
export const createTowingVan = async (req, res) => {
  try {
    const { vehicleNo, vehicleModel } = req.body;

    if (!vehicleNo || !vehicleModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both vehicle number and vehicle model',
      });
    }

    const existingVehicle = await TowingVan.findOne({
      vehicleNo: vehicleNo.trim().toUpperCase(),
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: 'A towing van with this vehicle number already exists',
      });
    }

    const towingVan = await TowingVan.create({
      vehicleNo: vehicleNo.trim().toUpperCase(),
      vehicleModel: vehicleModel.trim(),
    });

    res.status(201).json({ success: true, data: towingVan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update towing van
// @route   PUT /api/towing-vans/:id
export const updateTowingVan = async (req, res) => {
  try {
    const { vehicleNo, vehicleModel } = req.body;

    const towingVan = await TowingVan.findByIdAndUpdate(
      req.params.id,
      {
        ...(vehicleNo && { vehicleNo: vehicleNo.trim().toUpperCase() }),
        ...(vehicleModel && { vehicleModel: vehicleModel.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!towingVan) {
      return res
        .status(404)
        .json({ success: false, message: 'Towing van not found' });
    }

    res.status(200).json({ success: true, data: towingVan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete towing van
// @route   DELETE /api/towing-vans/:id
export const deleteTowingVan = async (req, res) => {
  try {
    const towingVan = await TowingVan.findByIdAndDelete(req.params.id);
    if (!towingVan) {
      return res
        .status(404)
        .json({ success: false, message: 'Towing van not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Towing van deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
