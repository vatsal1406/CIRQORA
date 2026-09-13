import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Supplier from '../models/Supplier.js';
import EmissionFactor from '../models/EmissionFactor.js';
import { calculateEmissions } from '../services/carbonEngine.js';

/**
 * @desc    Get available options for simulation (current suppliers for company vs alternative suppliers)
 * @route   GET /api/simulations/options?companyId=...&material=Aluminium
 */
export const getSimulationOptions = async (req, res, next) => {
  try {
    const { companyId, material } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId query parameter is required and must be a valid ObjectId',
      });
    }

    const companyObjId = new mongoose.Types.ObjectId(companyId);
    const selectedMaterial = material ? material.trim() : 'Aluminium';

    // 1. Find distinct supplier IDs that the active company has purchased this material from
    const activityQuery = {
      companyId: companyObjId,
      supplierId: { $ne: null },
      $or: [
        { material: new RegExp(`^${selectedMaterial}$`, 'i') },
        { activityType: new RegExp(`^${selectedMaterial}$`, 'i') },
      ],
    };

    const currentSupplierIds = await Activity.distinct('supplierId', activityQuery);

    // Fetch current suppliers
    const currentSuppliers = await Supplier.find({ _id: { $in: currentSupplierIds } }).select('name materials cost capacity');

    // 2. Find all registered suppliers in MongoDB that offer this material (candidate alternative suppliers)
    const alternativeSuppliers = await Supplier.find({
      materials: new RegExp(`^${selectedMaterial}$`, 'i'),
    }).select('name materials cost capacity');

    // Calculate total purchased quantity and average distance for each current supplier
    const currentSupplierDetails = await Promise.all(
      currentSuppliers.map(async (sup) => {
        const supplierActivities = await Activity.find({
          companyId: companyObjId,
          supplierId: sup._id,
          $or: [
            { material: new RegExp(`^${selectedMaterial}$`, 'i') },
            { activityType: new RegExp(`^${selectedMaterial}$`, 'i') },
          ],
        });

        const totalQuantity = supplierActivities.reduce((acc, a) => acc + (a.quantity || 0), 0);
        const unit = supplierActivities[0]?.unit || 'kg';
        const totalDistance = supplierActivities.reduce((acc, a) => acc + (a.distance || 0), 0);
        const avgDistance = supplierActivities.length > 0 ? Math.round(totalDistance / supplierActivities.length) : 0;

        return {
          supplierId: sup._id,
          supplierName: sup.name,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          unit,
          avgDistance,
          activityCount: supplierActivities.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      material: selectedMaterial,
      currentSuppliers: currentSupplierDetails,
      alternativeSuppliers: alternativeSuppliers.map((s) => ({
        supplierId: s._id,
        supplierName: s.name,
        materials: s.materials,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate hypothetical carbon reduction scenario
 * @route   POST /api/simulations/carbon-reduction
 */
export const calculateCarbonReduction = async (req, res, next) => {
  try {
    const {
      companyId,
      scenarioType, // 'supplier-switch' | 'distance-reduction' | 'material-change'
      material = 'Aluminium',
      currentSupplierId,
      alternativeSupplierId,
      switchPercentage = 30,
      distanceReductionPercentage = 20,
      alternativeMaterial,
      quantityOverride,
    } = req.body;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'companyId is required and must be a valid ObjectId',
      });
    }

    const companyObjId = new mongoose.Types.ObjectId(companyId);

    // ----------------------------------------------------
    // SCENARIO 1: SWITCH SUPPLIER
    // ----------------------------------------------------
    if (scenarioType === 'supplier-switch') {
      if (!currentSupplierId || !alternativeSupplierId) {
        return res.status(400).json({
          success: false,
          message: 'currentSupplierId and alternativeSupplierId are required for supplier-switch scenario',
        });
      }

      const currentSupplier = await Supplier.findById(currentSupplierId);
      const alternativeSupplier = await Supplier.findById(alternativeSupplierId);

      if (!currentSupplier || !alternativeSupplier) {
        return res.status(404).json({
          success: false,
          message: 'One or both specified suppliers were not found in database',
        });
      }

      // Fetch actual activities for current supplier
      const activities = await Activity.find({
        companyId: companyObjId,
        supplierId: currentSupplierId,
        $or: [
          { material: new RegExp(`^${material.trim()}$`, 'i') },
          { activityType: new RegExp(`^${material.trim()}$`, 'i') },
        ],
      });

      if (!activities || activities.length === 0) {
        return res.status(200).json({
          success: true,
          hasEnoughData: false,
          message: `No active purchase activities found for ${currentSupplier.name} supplying ${material}`,
        });
      }

      const totalQuantity = activities.reduce((acc, a) => acc + (a.quantity || 0), 0);
      const primaryUnit = activities[0]?.unit || 'kg';
      const totalDistance = activities.reduce((acc, a) => acc + (a.distance || 0), 0);
      const avgDistance = activities.length > 0 ? totalDistance / activities.length : 0;

      if (totalQuantity <= 0) {
        return res.status(200).json({
          success: true,
          hasEnoughData: false,
          message: `Insufficient quantity data to simulate supplier switch`,
        });
      }

      // 1. Calculate Current Emissions (Baseline)
      const currentEmissionsCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: totalQuantity,
        unit: primaryUnit,
        distance: avgDistance > 0 ? avgDistance : null,
      });

      const currentMaterialEmissions = currentEmissionsCalc.materialEmissions;
      const currentTransportEmissions = currentEmissionsCalc.transportationEmissions || 0;
      const currentTotalEmissions = currentEmissionsCalc.emissions;

      // 2. Calculate Projected Emissions after switching P% of purchases
      const pRatio = Math.min(100, Math.max(0, Number(switchPercentage))) / 100;
      const remainingQty = totalQuantity * (1 - pRatio);
      const switchedQty = totalQuantity * pRatio;

      // Remaining current supplier calculation
      const remainingCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: remainingQty,
        unit: primaryUnit,
        distance: avgDistance > 0 ? avgDistance : null,
      });

      // Switched alternative supplier calculation (assuming alternative supplier location/distance estimate or standard transport)
      const switchedCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: switchedQty,
        unit: primaryUnit,
        distance: avgDistance > 0 ? avgDistance : null,
      });

      const projectedMaterialEmissions = remainingCalc.materialEmissions + switchedCalc.materialEmissions;
      const projectedTransportEmissions =
        (remainingCalc.transportationEmissions || 0) + (switchedCalc.transportationEmissions || 0);
      const projectedTotalEmissions = remainingCalc.emissions + switchedCalc.emissions;

      const absoluteReduction = currentTotalEmissions - projectedTotalEmissions;
      const percentageReduction =
        currentTotalEmissions > 0 ? (absoluteReduction / currentTotalEmissions) * 100 : 0;

      // Carbon Intensity Calculation
      const currentIntensity =
        primaryUnit.toLowerCase() === 'kg'
          ? (currentTotalEmissions * 1000) / totalQuantity
          : currentTotalEmissions / totalQuantity;
      const projectedIntensity =
        primaryUnit.toLowerCase() === 'kg'
          ? (projectedTotalEmissions * 1000) / totalQuantity
          : projectedTotalEmissions / totalQuantity;

      // Recommendation logic
      const isRecommended = absoluteReduction > 0.001;
      const isHigher = absoluteReduction < -0.001;

      let recommendationMessage = '';
      if (isRecommended) {
        recommendationMessage = `Switching ${switchPercentage}% of ${material} purchases to ${alternativeSupplier.name} could reduce emissions by ${Math.round(absoluteReduction * 1000) / 1000} tCO2e (${Math.round(percentageReduction * 10) / 10}%).`;
      } else if (isHigher) {
        recommendationMessage = `Higher Carbon Scenario: Switching to ${alternativeSupplier.name} would increase projected emissions by ${Math.round(Math.abs(absoluteReduction) * 1000) / 1000} tCO2e.`;
      } else {
        recommendationMessage = `This supplier switch produces no significant change in calculated carbon emissions.`;
      }

      return res.status(200).json({
        success: true,
        hasEnoughData: true,
        data: {
          scenarioType,
          material,
          currentSupplierName: currentSupplier.name,
          alternativeSupplierName: alternativeSupplier.name,
          switchPercentage,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          unit: primaryUnit,
          current: {
            materialEmissions: Math.round(currentMaterialEmissions * 1000) / 1000,
            transportationEmissions: Math.round(currentTransportEmissions * 1000) / 1000,
            totalEmissions: Math.round(currentTotalEmissions * 1000) / 1000,
            intensity: Math.round(currentIntensity * 1000) / 1000,
            intensityFormatted: `${(Math.round(currentIntensity * 1000) / 1000).toFixed(3)} kgCO2e/kg`,
          },
          projected: {
            materialEmissions: Math.round(projectedMaterialEmissions * 1000) / 1000,
            transportationEmissions: Math.round(projectedTransportEmissions * 1000) / 1000,
            totalEmissions: Math.round(projectedTotalEmissions * 1000) / 1000,
            intensity: Math.round(projectedIntensity * 1000) / 1000,
            intensityFormatted: `${(Math.round(projectedIntensity * 1000) / 1000).toFixed(3)} kgCO2e/kg`,
          },
          reduction: {
            absolute: Math.round(absoluteReduction * 1000) / 1000,
            percentage: Math.round(percentageReduction * 10) / 10,
            materialReduction: Math.round((currentMaterialEmissions - projectedMaterialEmissions) * 1000) / 1000,
            transportReduction: Math.round((currentTransportEmissions - projectedTransportEmissions) * 1000) / 1000,
          },
          recommendation: {
            isRecommended,
            isHigher,
            message: recommendationMessage,
          },
        },
      });
    }

    // ----------------------------------------------------
    // SCENARIO 2: REDUCE TRANSPORTATION DISTANCE
    // ----------------------------------------------------
    if (scenarioType === 'distance-reduction') {
      const activities = await Activity.find({
        companyId: companyObjId,
        $or: [
          { material: new RegExp(`^${material.trim()}$`, 'i') },
          { activityType: new RegExp(`^${material.trim()}$`, 'i') },
        ],
      });

      if (!activities || activities.length === 0) {
        return res.status(200).json({
          success: true,
          hasEnoughData: false,
          message: `No recorded purchase activities found for ${material} to simulate distance reduction`,
        });
      }

      const totalQuantity = activities.reduce((acc, a) => acc + (a.quantity || 0), 0);
      const primaryUnit = activities[0]?.unit || 'kg';
      const totalDistance = activities.reduce((acc, a) => acc + (a.distance || 0), 0);
      const currentAvgDistance = activities.length > 0 ? totalDistance / activities.length : 0;

      if (currentAvgDistance <= 0) {
        return res.status(200).json({
          success: true,
          hasEnoughData: false,
          message: `Transportation distance data is currently unrecorded for ${material}`,
        });
      }

      const distRedRatio = Math.min(100, Math.max(0, Number(distanceReductionPercentage))) / 100;
      const projectedDistance = currentAvgDistance * (1 - distRedRatio);

      // Current Baseline
      const currentCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: totalQuantity,
        unit: primaryUnit,
        distance: currentAvgDistance,
      });

      // Projected
      const projectedCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: totalQuantity,
        unit: primaryUnit,
        distance: projectedDistance,
      });

      const currentTotalEmissions = currentCalc.emissions;
      const projectedTotalEmissions = projectedCalc.emissions;
      const absoluteReduction = currentTotalEmissions - projectedTotalEmissions;
      const percentageReduction =
        currentTotalEmissions > 0 ? (absoluteReduction / currentTotalEmissions) * 100 : 0;

      return res.status(200).json({
        success: true,
        hasEnoughData: true,
        data: {
          scenarioType,
          material,
          currentDistance: Math.round(currentAvgDistance),
          projectedDistance: Math.round(projectedDistance),
          distanceReductionPercentage,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          unit: primaryUnit,
          current: {
            materialEmissions: Math.round(currentCalc.materialEmissions * 1000) / 1000,
            transportationEmissions: Math.round((currentCalc.transportationEmissions || 0) * 1000) / 1000,
            totalEmissions: Math.round(currentTotalEmissions * 1000) / 1000,
          },
          projected: {
            materialEmissions: Math.round(projectedCalc.materialEmissions * 1000) / 1000,
            transportationEmissions: Math.round((projectedCalc.transportationEmissions || 0) * 1000) / 1000,
            totalEmissions: Math.round(projectedTotalEmissions * 1000) / 1000,
          },
          reduction: {
            absolute: Math.round(absoluteReduction * 1000) / 1000,
            percentage: Math.round(percentageReduction * 10) / 10,
            transportReduction: Math.round(((currentCalc.transportationEmissions || 0) - (projectedCalc.transportationEmissions || 0)) * 1000) / 1000,
          },
          recommendation: {
            isRecommended: absoluteReduction > 0.001,
            isHigher: false,
            message: `Reducing transport distance by ${distanceReductionPercentage}% could lower total supply-chain emissions by ${Math.round(absoluteReduction * 1000) / 1000} tCO2e.`,
          },
        },
      });
    }

    // ----------------------------------------------------
    // SCENARIO 3: CHANGE MATERIAL
    // ----------------------------------------------------
    if (scenarioType === 'material-change') {
      if (!alternativeMaterial) {
        return res.status(400).json({
          success: false,
          message: 'alternativeMaterial is required for material-change scenario',
        });
      }

      // Check if verified factor exists for alternativeMaterial
      const altFactorDoc = await EmissionFactor.findOne({
        $or: [
          { material: new RegExp(`^${alternativeMaterial.trim()}$`, 'i') },
          { activityType: new RegExp(`^${alternativeMaterial.trim()}$`, 'i') },
        ],
      });

      // Find company activities for current material
      const activities = await Activity.find({
        companyId: companyObjId,
        $or: [
          { material: new RegExp(`^${material.trim()}$`, 'i') },
          { activityType: new RegExp(`^${material.trim()}$`, 'i') },
        ],
      });

      const totalQuantity = quantityOverride ? Number(quantityOverride) : activities.reduce((acc, a) => acc + (a.quantity || 0), 0);
      const primaryUnit = activities[0]?.unit || 'kg';

      if (totalQuantity <= 0) {
        return res.status(200).json({
          success: true,
          hasEnoughData: false,
          message: `No quantity records available to simulate material substitution for ${material}`,
        });
      }

      // Current Baseline
      const currentCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material,
        quantity: totalQuantity,
        unit: primaryUnit,
      });

      // Projected
      const projectedCalc = await calculateEmissions({
        activityType: 'Purchased Material',
        material: alternativeMaterial,
        quantity: totalQuantity,
        unit: primaryUnit,
      });

      const currentTotalEmissions = currentCalc.emissions;
      const projectedTotalEmissions = projectedCalc.emissions;
      const absoluteReduction = currentTotalEmissions - projectedTotalEmissions;
      const percentageReduction =
        currentTotalEmissions > 0 ? (absoluteReduction / currentTotalEmissions) * 100 : 0;

      const isRecommended = absoluteReduction > 0.001;
      const isHigher = absoluteReduction < -0.001;

      return res.status(200).json({
        success: true,
        hasEnoughData: true,
        data: {
          scenarioType,
          currentMaterial: material,
          alternativeMaterial,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          unit: primaryUnit,
          current: {
            materialEmissions: Math.round(currentCalc.materialEmissions * 1000) / 1000,
            totalEmissions: Math.round(currentTotalEmissions * 1000) / 1000,
          },
          projected: {
            materialEmissions: Math.round(projectedCalc.materialEmissions * 1000) / 1000,
            totalEmissions: Math.round(projectedTotalEmissions * 1000) / 1000,
          },
          reduction: {
            absolute: Math.round(absoluteReduction * 1000) / 1000,
            percentage: Math.round(percentageReduction * 10) / 10,
          },
          recommendation: {
            isRecommended,
            isHigher,
            message: isRecommended
              ? `Substituting ${material} with ${alternativeMaterial} could reduce emissions by ${Math.round(absoluteReduction * 1000) / 1000} tCO2e (${Math.round(percentageReduction * 10) / 10}%).`
              : isHigher
              ? `Higher Carbon Scenario: Substituting ${material} with ${alternativeMaterial} would increase emissions by ${Math.round(Math.abs(absoluteReduction) * 1000) / 1000} tCO2e.`
              : `Material change produces no significant carbon impact difference.`,
          },
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid scenarioType provided. Expected: supplier-switch, distance-reduction, or material-change',
    });
  } catch (error) {
    next(error);
  }
};
