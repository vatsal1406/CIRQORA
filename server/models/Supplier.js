import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    materials: [
      {
        type: String,
        trim: true,
      },
    ],
    cost: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Supplier', supplierSchema);
