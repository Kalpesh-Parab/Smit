import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema(
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

export default mongoose.model('Ambulance', ambulanceSchema);
