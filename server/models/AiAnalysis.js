import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    analysis: {
      type: Object,
      required: true,
    },
    companyTotals: {
      type: Object,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AiAnalysis', aiAnalysisSchema);
