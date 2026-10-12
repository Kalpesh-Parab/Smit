import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'HallCategory' },
  name: { type: String, required: true },
  billingType: { type: String, default: 'FIXED' },
  rate: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  total: { type: Number, required: true, default: 0 },
});

const hallInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    eventDetails: {
      programName: { type: String, required: true },
      date: { type: Date, required: true },
      timeSlot: { type: String, default: 'Full Day' },
    },
    items: [lineItemSchema],
    billing: {
      subTotal: { type: Number, required: true, default: 0 },
      advancePaid: { type: Number, required: true, default: 0 },
      balanceDue: { type: Number, required: true, default: 0 },
      paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'],
        default: 'PARTIALLY_PAID',
      },
    },
    internalCosting: {
      cateringExpense: { type: Number, default: 0 },
      hallMaintenance: { type: Number, default: 0 },
      workerSalary: { type: Number, default: 0 },
      netProfit: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model('HallInvoice', hallInvoiceSchema);
