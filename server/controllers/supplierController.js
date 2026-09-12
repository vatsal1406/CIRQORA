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

    const { companyId, name, location, materials, cost, capacity } = req.body;

    const supplier = await Supplier.create({
      companyId,
      name,
      location,
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

// @desc    Get all Suppliers
// @route   GET /api/suppliers?companyId=...
export const getSuppliers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.companyId && mongoose.Types.ObjectId.isValid(req.query.companyId)) {
      filter.companyId = req.query.companyId;
    }

    const suppliers = await Supplier.find(filter).populate('companyId', 'name').sort({ createdAt: -1 });
    res.status(200).json({
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
    const supplier = await Supplier.findById(req.params.id).populate('companyId', 'name');
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Suppliers for a particular material
// @route   GET /api/suppliers/compare?material=Aluminium&companyId=...
export const compareSuppliers = async (req, res, next) => {
  try {
    const { material, companyId } = req.query;
    if (!material) {
      return res.status(400).json({ success: false, message: 'material query parameter is required for comparison' });
    }

    const supplierFilter = {
      materials: new RegExp(`^${material}$`, 'i'),
    };
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      supplierFilter.companyId = companyId;
    }

    // Find all suppliers supplying this material
    const suppliers = await Supplier.find(supplierFilter).populate('companyId', 'name');

    // Gather actual calculated activity emissions for each supplier
    const comparisonResults = await Promise.all(
      suppliers.map(async (supplier) => {
        const activityFilter = {
          supplierId: supplier._id,
          $or: [
            { material: new RegExp(`^${material}$`, 'i') },
            { activityType: new RegExp(`^${material}$`, 'i') },
          ],
        };

        const activities = await Activity.find(activityFilter);
        const totalEmissions = activities.reduce((acc, act) => acc + (act.emissions || 0), 0);
        const totalQuantity = activities.reduce((acc, act) => acc + (act.quantity || 0), 0);

        return {
          supplierId: supplier._id,
          supplierName: supplier.name,
          companyName: supplier.companyId ? supplier.companyId.name : 'N/A',
          location: supplier.location,
          material,
          cost: supplier.cost,
          capacity: supplier.capacity,
          activityCount: activities.length,
          totalQuantity,
          totalEmissions: Math.round(totalEmissions * 1000) / 1000, // tCO2e
          averageEmissionFactor: totalQuantity > 0 ? Math.round((totalEmissions * 1000 / totalQuantity) * 1000) / 1000 : 0,
        };
      })
    );

    // Sort by total calculated emissions ascending (lowest emissions first)
    comparisonResults.sort((a, b) => a.totalEmissions - b.totalEmissions);

    res.status(200).json({
      success: true,
      material,
      count: comparisonResults.length,
      data: comparisonResults,
    });
  } catch (error) {
    next(error);
  }
};
