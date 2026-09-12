import mongoose from 'mongoose';

const emissionFactorSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true,
      index: true,
    },
    material: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    factor: {
      type: Number,
      required: [true, 'Factor value is required'],
    },
    factorUnit: {
      type: String,
      required: [true, 'Factor unit is required'],
      default: 'kgCO2e/unit',
    },
    source: {
      type: String,
      default: 'DEFRA / GHG Protocol (Demo Reference)',
    },
    version: {
      type: String,
      default: '2024.1',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('EmissionFactor', emissionFactorSchema);
