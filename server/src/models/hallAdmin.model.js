import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hallAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'hall_admin',
    },
  },
  { timestamps: true },
);

// Hash password before saving (Promise-based for modern Mongoose)
hallAdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password helper
hallAdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('HallAdmin', hallAdminSchema, 'hall_admins');
