import Activity from '../models/Activity.js';
import { validateActivity } from '../utils/validation.js';
import { classifyActivity } from '../services/aiClassifier.js';
import { calculateEmissions } from '../services/carbonEngine.js';

// @desc    Create new Activity with AI Classification & Carbon Engine Calculation
// @route   POST /api/activities
export const createActivity = async (req, res, next) => {
  try {
    // 1. Validate mandatory raw user input
    const { isValid, errors } = validateActivity(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const { companyId, supplierId, activityType, material, quantity, unit, description, date } = req.body;

    // 2. Classify activity into Scope (1, 2, or 3) & Scope 3 Category via AI + Backend Rules
    const classification = await classifyActivity({
      activityType,
      material,
      description,
      quantity,
      unit,
    });

    const scope = classification.scope;
    const scope3Category = scope === 3 ? (classification.scope3Category || 1) : null;

    // 3. Resolve Emission Factor & Calculate CO2e Emissions via Carbon Engine
    const calculation = await calculateEmissions({
      activityType,
      material,
      quantity,
      unit,
    });

    // 4. Save final complete Activity document into MongoDB
    const activity = await Activity.create({
      companyId,
      supplierId: supplierId || null,
      activityType,
      scope,
      scope3Category,
      material: material || null,
      quantity,
      unit,
      emissionFactor: calculation.emissionFactor,
      emissions: calculation.emissions,
      date: date || Date.now(),
    });

    // Populate company and supplier details for response clarity
    const populatedActivity = await Activity.findById(activity._id)
      .populate('companyId', 'name industry')
      .populate('supplierId', 'name location');

    res.status(201).json({
      success: true,
      meta: {
        classificationReason: classification.reason,
        factorSource: calculation.source,
        factorUnit: calculation.factorUnit,
      },
      data: populatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Activities with optional query filters
// @route   GET /api/activities?companyId=...&scope=3&scope3Category=1&supplierId=...&activityType=...&material=...
export const getActivities = async (req, res, next) => {
  try {
    const { companyId, scope, scope3Category, supplierId, activityType, material } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (scope) filter.scope = Number(scope);
    if (scope3Category) filter.scope3Category = Number(scope3Category);
    if (supplierId) filter.supplierId = supplierId;
    if (activityType) filter.activityType = new RegExp(activityType, 'i');
    if (material) filter.material = new RegExp(material, 'i');

    const activities = await Activity.find(filter)
      .populate('companyId', 'name industry')
      .populate('supplierId', 'name location')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Activity by ID
// @route   GET /api/activities/:id
export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('companyId', 'name industry')
      .populate('supplierId', 'name location');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity record not found' });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
