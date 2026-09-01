import Ambulance from '../models/Ambulance.model.js';

// @desc    Get all ambulances
// @route   GET /api/ambulances
export const getAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: ambulances.length, data: ambulances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ambulance by ID
// @route   GET /api/ambulances/:id
export const getAmbulanceById = async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      return res
        .status(404)
        .json({ success: false, message: 'Ambulance not found' });
    }
    res.status(200).json({ success: true, data: ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new ambulance
// @route   POST /api/ambulances
export const createAmbulance = async (req, res) => {
  try {
    const { vehicleNo, vehicleModel } = req.body;

    if (!vehicleNo || !vehicleModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both vehicle number and vehicle model',
      });
    }

    const existingVehicle = await Ambulance.findOne({
      vehicleNo: vehicleNo.trim().toUpperCase(),
    });
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: 'A vehicle with this vehicle number already exists',
      });
    }

    const ambulance = await Ambulance.create({
      vehicleNo: vehicleNo.trim().toUpperCase(),
      vehicleModel: vehicleModel.trim(),
    });

    res.status(201).json({ success: true, data: ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ambulance
// @route   PUT /api/ambulances/:id
export const updateAmbulance = async (req, res) => {
  try {
    const { vehicleNo, vehicleModel } = req.body;

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      {
        ...(vehicleNo && { vehicleNo: vehicleNo.trim().toUpperCase() }),
        ...(vehicleModel && { vehicleModel: vehicleModel.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!ambulance) {
      return res
        .status(404)
        .json({ success: false, message: 'Ambulance not found' });
    }

    res.status(200).json({ success: true, data: ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ambulance
// @route   DELETE /api/ambulances/:id
export const deleteAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndDelete(req.params.id);
    if (!ambulance) {
      return res
        .status(404)
        .json({ success: false, message: 'Ambulance not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Ambulance deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
