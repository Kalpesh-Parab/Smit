import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    service: {
      type: String,
      required: true,
      enum: ['ambulance', 'generators', 'towing-vans'],
      index: true,
    },
    partyName: {
      type: String,
      required: [true, 'Party / Customer name is required'],
      trim: true,
    },
    partyPhone: {
      type: String,
      required: [true, 'Contact / WhatsApp number is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Allows flexible dynamic JSON objects for any service
    serviceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Financial details
    totalBill: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

// Auto-calculate remaining amount & payment status
invoiceSchema.pre('save', function () {
  const total = Number(this.totalBill) || 0;
  const paid = Number(this.paidAmount) || 0;
  this.remainingAmount = Math.max(0, total - paid);

  if (this.remainingAmount === 0 && total > 0) {
    this.paymentStatus = 'paid';
  } else if (paid > 0 && this.remainingAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'unpaid';
  }
});

export default mongoose.model('Invoice', invoiceSchema);
