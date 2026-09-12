import { getAggregatedData } from '../services/aggregationService.js';
import { analyzeCarbonData } from '../services/aiAnalyzer.js';

// @desc    Generate AI sustainability analysis & recommendations
// @route   POST /api/ai/analyze
export const analyzeCompanyEmissions = async (req, res, next) => {
  try {
    const companyId = req.body.companyId || req.query.companyId;

    // 1. Gather calculated carbon accounting metrics from DB
    const aggregatedData = await getAggregatedData(companyId);

    if (aggregatedData.totalActivitiesCount === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: 'No carbon activities recorded yet for this company. Add Scope 1, Scope 2, or Scope 3 activities to generate AI insights.',
          majorHotspots: [],
          supplierRecommendations: [],
          reductionOpportunities: [],
          circularSourcingSuggestions: [],
          isAiFallback: false,
        },
      });
    }

    // 2. Pass structured metrics to AI Analyzer
    const aiAnalysis = await analyzeCarbonData(aggregatedData);

    res.status(200).json({
      success: true,
      data: {
        company: aggregatedData.company,
        totals: aggregatedData.totals,
        analysis: aiAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};
