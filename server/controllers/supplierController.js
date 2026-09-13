import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import Activity from '../models/Activity.js';
import { validateSupplier } from '../utils/validation.js';

// @desc    Create new Supplier
// @route   POST /api/suppliers
export const createSupplier = async (req, res, next) => {
  try {
    const { isValid, errors } = validateSupplier(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const { name, materials, cost, capacity } = req.body;

    const supplier = await Supplier.create({
      name,
      materials: Array.isArray(materials) ? materials : materials ? [materials] : [],
      cost,
      capacity,
    });

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Suppliers (filtered by active company's activities or all if explicitly requested)
// @route   GET /api/suppliers?companyId=...&all=true
export const getSuppliers = async (req, res, next) => {
  try {
    const { companyId, all } = req.query;

    // Return all registered suppliers if all=true is requested (e.g. for dropdown when adding new activities)
    if (all === 'true' || all === '1') {
      const suppliers = await Supplier.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: suppliers.length,
        data: suppliers,
      });
    }

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId query parameter is required and must be a valid ObjectId',
      });
    }

    const supplierIds = await Activity.distinct('supplierId', {
      companyId: new mongoose.Types.ObjectId(companyId),
      supplierId: { $ne: null },
    });

    if (!supplierIds || supplierIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const suppliers = await Supplier.find({
      _id: { $in: supplierIds },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Supplier by ID
// @route   GET /api/suppliers/:id
export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Suppliers for a particular material (restricted to active company's activities)
// @route   GET /api/suppliers/compare?companyId=...&material=Aluminium
export const compareSuppliers = async (req, res, next) => {
  try {
    const { material, companyId } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId query parameter is required and must be a valid ObjectId',
      });
    }

    if (!material) {
      return res.status(400).json({
        success: false,
        message: 'material query parameter is required for comparison',
      });
    }

    const trimmedMaterial = material.trim();
    const companyObjId = new mongoose.Types.ObjectId(companyId);

    // Find distinct supplierIds from activities belonging to this company for this material
    const activityQuery = {
      companyId: companyObjId,
      supplierId: { $ne: null },
      $or: [
        { material: new RegExp(`^${trimmedMaterial}$`, 'i') },
        { activityType: new RegExp(`^${trimmedMaterial}$`, 'i') },
      ],
    };

    const supplierIds = await Activity.distinct('supplierId', activityQuery);

    if (!supplierIds || supplierIds.length === 0) {
      return res.status(200).json({
        success: true,
        material: trimmedMaterial,
        count: 0,
        data: [],
        recommendedSupplier: null,
        hasEnoughData: false,
        message: `Your company has no recorded purchases of ${trimmedMaterial} from suppliers yet.`,
      });
    }

    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });

    // Gather actual calculated activity emissions and metrics for each matching supplier
    const rawResults = await Promise.all(
      suppliers.map(async (supplier) => {
        const supplierActivities = await Activity.find({
          companyId: companyObjId,
          supplierId: supplier._id,
          $or: [
            { material: new RegExp(`^${trimmedMaterial}$`, 'i') },
            { activityType: new RegExp(`^${trimmedMaterial}$`, 'i') },
          ],
        });

        const totalQuantity = supplierActivities.reduce(
          (acc, act) => acc + (act.quantity || 0),
          0
        );

        const primaryUnit = supplierActivities[0]?.unit || 'kg';

        const materialEmissions = supplierActivities.reduce(
          (acc, act) =>
            acc +
            (act.materialEmissions !== undefined && act.materialEmissions !== null
              ? act.materialEmissions
              : act.emissions || 0),
          0
        );

        const transportationEmissions = supplierActivities.reduce(
          (acc, act) => acc + (act.transportationEmissions || 0),
          0
        );

        const hasTransportationData = supplierActivities.some(
          (act) => (act.distance || 0) > 0 || (act.transportationEmissions || 0) > 0
        );

        const totalSupplyChainImpact = materialEmissions + transportationEmissions;

        // Calculate Carbon Intensity (kgCO2e per kg or normalized unit)
        // Note: materialEmissions and totalSupplyChainImpact are stored in tCO2e (tonnes CO2e)
        let carbonIntensityVal = null;
        let carbonIntensityFormatted = 'N/A';

        if (totalQuantity > 0) {
          const unitLower = (primaryUnit || '').toLowerCase();
          if (unitLower === 'kg' || unitLower === 'kilogram' || unitLower === 'kilograms') {
            // Convert tCO2e to kgCO2e (multiply by 1000) then divide by kg
            carbonIntensityVal = (totalSupplyChainImpact * 1000) / totalQuantity;
            carbonIntensityFormatted = `${(Math.round(carbonIntensityVal * 1000) / 1000).toFixed(3)} kgCO2e/kg`;
          } else if (unitLower === 'tonne' || unitLower === 'tonnes' || unitLower === 't') {
            carbonIntensityVal = totalSupplyChainImpact / totalQuantity;
            carbonIntensityFormatted = `${(Math.round(carbonIntensityVal * 1000) / 1000).toFixed(3)} tCO2e/t`;
          } else {
            carbonIntensityVal = (totalSupplyChainImpact * 1000) / totalQuantity;
            carbonIntensityFormatted = `${(Math.round(carbonIntensityVal * 1000) / 1000).toFixed(3)} kgCO2e/${primaryUnit}`;
          }
        }

        return {
          supplierId: supplier._id,
          supplierName: supplier.name,
          material: trimmedMaterial,
          cost: supplier.cost,
          capacity: supplier.capacity,
          activityCount: supplierActivities.length,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          unit: primaryUnit,
          materialEmissions: Math.round(materialEmissions * 1000) / 1000,
          transportationEmissions: Math.round(transportationEmissions * 1000) / 1000,
          hasTransportationData,
          totalSupplyChainImpact: Math.round(totalSupplyChainImpact * 1000) / 1000,
          totalEmissions: Math.round(totalSupplyChainImpact * 1000) / 1000,
          carbonIntensity: carbonIntensityVal !== null ? Math.round(carbonIntensityVal * 1000) / 1000 : null,
          carbonIntensityFormatted,
        };
      })
    );

    // Sort by carbonIntensity ascending if available; fallback to totalSupplyChainImpact ascending
    rawResults.sort((a, b) => {
      if (a.carbonIntensity !== null && b.carbonIntensity !== null) {
        return a.carbonIntensity - b.carbonIntensity;
      }
      if (a.carbonIntensity !== null) return -1;
      if (b.carbonIntensity !== null) return 1;
      return a.totalSupplyChainImpact - b.totalSupplyChainImpact;
    });

    // Check if we have valid data for an honest recommendation
    const topSupplier = rawResults[0];
    const hasEnoughData =
      rawResults.length > 0 &&
      topSupplier &&
      topSupplier.totalQuantity > 0 &&
      topSupplier.carbonIntensity !== null;

    const comparisonResults = rawResults.map((item, index) => ({
      ...item,
      efficiencyRank: index + 1,
      isRecommended: hasEnoughData && index === 0,
    }));

    const recommendedSupplier = hasEnoughData
      ? {
          supplierId: topSupplier.supplierId,
          supplierName: topSupplier.supplierName,
          carbonIntensity: topSupplier.carbonIntensity,
          carbonIntensityFormatted: topSupplier.carbonIntensityFormatted,
          materialEmissions: topSupplier.materialEmissions,
          transportationEmissions: topSupplier.transportationEmissions,
          hasTransportationData: topSupplier.hasTransportationData,
          totalSupplyChainImpact: topSupplier.totalSupplyChainImpact,
          totalQuantity: topSupplier.totalQuantity,
          unit: topSupplier.unit,
          recommendationReason: `Lowest carbon intensity for ${trimmedMaterial} among suppliers used by your company (${topSupplier.carbonIntensityFormatted}).`,
        }
      : null;

    res.status(200).json({
      success: true,
      material: trimmedMaterial,
      count: comparisonResults.length,
      hasEnoughData,
      recommendedSupplier,
      data: comparisonResults,
    });
  } catch (error) {
    next(error);
  }
};