import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      enum: ['ambulance', 'generators', 'towing-vans'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title / description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fuel / Diesel',
        'Maintenance & Repairs',
        'Driver / Operator Salary',
        'Insurance & Taxes',
        'Toll & Travel',
        'Other',
      ],
      default: 'Fuel / Diesel',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Optional reference to a specific vehicle or generator
    assetReference: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI / Online', 'Bank Transfer', 'Cheque'],
      default: 'UPI / Online',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

export default mongoose.model('Expense', expenseSchema);
