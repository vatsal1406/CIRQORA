import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Supplier from '../models/Supplier.js';
import Company from '../models/Company.js';
import AiAnalysis from '../models/AiAnalysis.js';
import { getAggregatedData } from '../services/aggregationService.js';
import { analyzeCarbonData } from '../services/aiAnalyzer.js';

// @desc    Retrieve most recently stored AI Analysis for a company (NEVER calls Gemini)
// @route   GET /api/ai/analysis?companyId=...
export const getStoredAnalysis = async (req, res, next) => {
  try {
    const { companyId } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId query parameter is required and must be a valid ObjectId',
      });
    }

    const companyObjId = new mongoose.Types.ObjectId(companyId);
    const stored = await AiAnalysis.findOne({ companyId: companyObjId });

    if (!stored) {
      return res.status(200).json({
        success: true,
        hasAnalysis: false,
        message: 'No AI analysis generated for this company yet.',
        data: null,
      });
    }

    const company = await Company.findById(companyObjId).select('name industry location');

    return res.status(200).json({
      success: true,
      hasAnalysis: true,
      data: {
        company: company ? { id: company._id, name: company.name } : { id: companyId, name: 'Selected Company' },
        totals: stored.companyTotals,
        analysis: stored.analysis,
        lastAnalyzed: stored.generatedAt,
        isStale: stored.isStale || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a fresh AI sustainability analysis & recommendations via Gemini (POST strictly)
// @route   POST /api/ai/analyze
export const analyzeCompanyEmissions = async (req, res, next) => {
  try {
    const companyId = req.body.companyId || req.query.companyId;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId is required and must be a valid ObjectId',
      });
    }

    const companyObjId = new mongoose.Types.ObjectId(companyId);

    // 1. Gather calculated carbon accounting metrics from DB
    const aggregatedData = await getAggregatedData(companyId);

    if (aggregatedData.totalActivitiesCount === 0) {
      return res.status(200).json({
        success: true,
        hasEnoughData: false,
        message: 'Not enough carbon activity data to generate an analysis. Add Scope 1, Scope 2, or Scope 3 activities to begin.',
        data: null,
      });
    }

    // 2. Compute supplier comparison metrics for top materials if companyId is present
    const supplierComparisons = [];
    if (aggregatedData.materialEmissions.length > 0) {
      const topMaterials = aggregatedData.materialEmissions.slice(0, 2);
      
      for (const matObj of topMaterials) {
        const matName = matObj.material;
        const activities = await Activity.find({
          companyId: companyObjId,
          $or: [
            { material: new RegExp(`^${matName}$`, 'i') },
            { activityType: new RegExp(`^${matName}$`, 'i') },
          ],
        }).populate('supplierId', 'name cost capacity');

        if (activities.length > 0) {
          const supplierMap = {};
          activities.forEach((act) => {
            if (act.supplierId) {
              const sId = act.supplierId._id.toString();
              if (!supplierMap[sId]) {
                supplierMap[sId] = {
                  supplierId: sId,
                  name: act.supplierId.name,
                  totalQuantity: 0,
                  totalEmissions: 0,
                  unit: act.unit || 'kg',
                };
              }
              supplierMap[sId].totalQuantity += act.quantity || 0;
              supplierMap[sId].totalEmissions += act.emissions || 0;
            }
          });

          const supList = Object.values(supplierMap);
          if (supList.length > 0) {
            supList.forEach((s) => {
              s.intensity = s.totalQuantity > 0 ? (s.totalEmissions * 1000) / s.totalQuantity : 999;
            });
            supList.sort((a, b) => a.intensity - b.intensity);

            const lowestSup = supList[0];
            const highestSup = [...supList].sort((a, b) => b.totalEmissions - a.totalEmissions)[0];

            const candidateAlt = await Supplier.findOne({
              materials: new RegExp(`^${matName}$`, 'i'),
              _id: { $ne: highestSup.supplierId },
            });

            const currentSupplierName = highestSup.name;
            const recommendedSupplierName = (lowestSup.supplierId !== highestSup.supplierId)
              ? lowestSup.name
              : candidateAlt ? candidateAlt.name : lowestSup.name;

            const diffEmissions = Math.max(0, highestSup.totalEmissions * 0.35);

            supplierComparisons.push({
              material: matName,
              currentSupplier: currentSupplierName,
              currentEmissions: Math.round(highestSup.totalEmissions * 1000) / 1000,
              currentIntensity: `${(Math.round(highestSup.intensity * 1000) / 1000).toFixed(3)} kgCO2e/kg`,
              recommendedSupplier: recommendedSupplierName,
              recommendedEmissions: Math.round((highestSup.totalEmissions - diffEmissions) * 1000) / 1000,
              recommendedIntensity: `${(Math.round(highestSup.intensity * 0.65 * 1000) / 1000).toFixed(3)} kgCO2e/kg`,
              difference: Math.round(diffEmissions * 1000) / 1000,
            });
          }
        }
      }
    }

    aggregatedData.supplierComparisons = supplierComparisons;

    // 3. Pass enriched structured metrics to AI Analyzer (calls Gemini)
    const aiAnalysis = await analyzeCarbonData(aggregatedData);

    // 4. Store generated analysis in MongoDB for persistence
    const now = new Date();
    const storedDoc = await AiAnalysis.findOneAndUpdate(
      { companyId: companyObjId },
      {
        companyId: companyObjId,
        analysis: aiAnalysis,
        companyTotals: aggregatedData.totals,
        isStale: false,
        generatedAt: now,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      hasEnoughData: true,
      data: {
        company: aggregatedData.company,
        totals: aggregatedData.totals,
        analysis: aiAnalysis,
        lastAnalyzed: storedDoc.generatedAt,
        isStale: false,
      },
    });
  } catch (error) {
    next(error);
  }
};
