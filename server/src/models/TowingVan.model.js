import mongoose from 'mongoose';

const towingVanSchema = new mongoose.Schema(
  {
    vehicleNo: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleModel: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('TowingVan', towingVanSchema);
