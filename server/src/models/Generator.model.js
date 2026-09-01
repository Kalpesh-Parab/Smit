import mongoose from 'mongoose';

const generatorSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, 'Generator nickname or identifier is required'],
      unique: true,
      trim: true,
    },
    capacityKva: {
      type: Number,
      required: [true, 'Capacity in kVA is required'],
    },
    make: {
      type: String,
      trim: true,
      default: '',
    },
    mountedOn: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

export default mongoose.model('Generator', generatorSchema);
