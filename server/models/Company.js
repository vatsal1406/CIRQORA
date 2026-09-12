import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: 'General Manufacturing',
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Company', companySchema);
