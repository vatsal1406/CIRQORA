import { getAggregatedData } from '../services/aggregationService.js';

// @desc    Get aggregated dashboard emissions metrics for a company
// @route   GET /api/dashboard?companyId=...
export const getDashboardData = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    const aggregated = await getAggregatedData(companyId);

    res.status(200).json({
      success: true,
      data: aggregated,
    });
  } catch (error) {
    next(error);
  }
};
