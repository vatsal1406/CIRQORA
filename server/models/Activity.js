import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true,
    },
    scope: {
      type: Number,
      required: [true, 'Scope is required'],
      enum: [1, 2, 3],
    },
    scope3Category: {
      type: Number,
      default: null,
      validate: {
        validator: function (val) {
          if (this.scope === 3) {
            return val !== null && val !== undefined && val >= 1 && val <= 15;
          }
          return true;
        },
        message: 'scope3Category is required and must be between 1 and 15 when scope is 3',
      },
    },
    material: {
      type: String,
      trim: true,
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.0001, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    emissionFactor: {
      type: Number,
      required: [true, 'Emission factor is required'],
    },
    emissions: {
      type: Number,
      required: [true, 'Emissions (tCO2e) calculation is required'],
    },
    distance: {
      type: Number,
      default: null,
      min: [0, 'Distance must be a non-negative number'],
    },
    materialEmissionFactor: {
      type: Number,
      default: null,
    },
    materialEmissions: {
      type: Number,
      default: null,
    },
    transportEmissionFactor: {
      type: Number,
      default: null,
    },
    transportationEmissions: {
      type: Number,
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Activity', activitySchema);
