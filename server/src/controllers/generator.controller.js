import Generator from '../models/Generator.model.js';

// @desc    Get all generators
// @route   GET /api/generators
export const getGenerators = async (req, res) => {
  try {
    const generators = await Generator.find().sort({
      capacityKva: 1,
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, count: generators.length, data: generators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single generator
// @route   GET /api/generators/:id
export const getGeneratorById = async (req, res) => {
  try {
    const generator = await Generator.findById(req.params.id);
    if (!generator) {
      return res
        .status(404)
        .json({ success: false, message: 'Generator not found' });
    }
    res.status(200).json({ success: true, data: generator });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new generator
// @route   POST /api/generators
export const createGenerator = async (req, res) => {
  try {
    const { identifier, capacityKva, make, mountedOn, notes } = req.body;

    if (!identifier || capacityKva === undefined || capacityKva === '') {
      return res.status(400).json({
        success: false,
        message:
          'Please provide both Generator Identifier / Nickname and Capacity (kVA)',
      });
    }

    const existing = await Generator.findOne({
      identifier: { $regex: new RegExp(`^${identifier.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A generator named "${identifier}" already exists`,
      });
    }

    const generator = await Generator.create({
      identifier: identifier.trim(),
      capacityKva: Number(capacityKva),
      make: make ? make.trim() : '',
      mountedOn: mountedOn ? mountedOn.trim() : '',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({ success: true, data: generator });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update generator
// @route   PUT /api/generators/:id
export const updateGenerator = async (req, res) => {
  try {
    const { identifier, capacityKva, make, mountedOn, notes } = req.body;

    const generator = await Generator.findByIdAndUpdate(
      req.params.id,
      {
        ...(identifier && { identifier: identifier.trim() }),
        ...(capacityKva !== undefined && { capacityKva: Number(capacityKva) }),
        ...(make !== undefined && { make: make.trim() }),
        ...(mountedOn !== undefined && { mountedOn: mountedOn.trim() }),
        ...(notes !== undefined && { notes: notes.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!generator) {
      return res
        .status(404)
        .json({ success: false, message: 'Generator not found' });
    }

    res.status(200).json({ success: true, data: generator });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete generator
// @route   DELETE /api/generators/:id
export const deleteGenerator = async (req, res) => {
  try {
    const generator = await Generator.findByIdAndDelete(req.params.id);
    if (!generator) {
      return res
        .status(404)
        .json({ success: false, message: 'Generator not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Generator deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
