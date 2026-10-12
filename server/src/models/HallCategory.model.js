import mongoose from 'mongoose';

const hallCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    billingType: {
      type: String,
      enum: ['PER_PERSON', 'PER_PLATE', 'PER_GLASS', 'FIXED'],
      default: 'FIXED',
    },
    defaultRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('HallCategory', hallCategorySchema);
