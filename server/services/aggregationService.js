import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Supplier from '../models/Supplier.js';
import Company from '../models/Company.js';

const SCOPE_3_CATEGORY_NAMES = {
  1: 'Purchased Goods & Services',
  2: 'Capital Goods',
  3: 'Fuel & Energy Related Activities',
  4: 'Upstream Transportation & Distribution',
  5: 'Waste Generated in Operations',
  6: 'Business Travel',
  7: 'Employee Commuting',
  8: 'Upstream Leased Assets',
  9: 'Downstream Transportation & Distribution',
  10: 'Processing of Sold Products',
  11: 'Use of Sold Products',
  12: 'End-of-Life Treatment of Sold Products',
  13: 'Downstream Leased Assets',
  14: 'Franchises',
  15: 'Investments',
};

export const getAggregatedData = async (companyId) => {
  const filter = {};
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    filter.companyId = new mongoose.Types.ObjectId(companyId);
  }

  // Fetch company details
  let company = null;
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    company = await Company.findById(companyId).select('name industry location');
  }

  // Retrieve all matching activities
  const activities = await Activity.find(filter).populate('supplierId', 'name location materials cost capacity');

  let totalEmissions = 0;
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;

  const scope3Map = {};
  const supplierMap = {};
  const materialMap = {};
  const activityMap = {};

  activities.forEach((act) => {
    const em = act.emissions || 0;
    totalEmissions += em;

    // Scope breakdown
    if (act.scope === 1) scope1 += em;
    else if (act.scope === 2) scope2 += em;
    else if (act.scope === 3) {
      scope3 += em;
      const catNum = act.scope3Category || 1;
      if (!scope3Map[catNum]) {
        scope3Map[catNum] = {
          category: catNum,
          name: SCOPE_3_CATEGORY_NAMES[catNum] || `Category ${catNum}`,
          emissions: 0,
        };
      }
      scope3Map[catNum].emissions += em;
    }

    // Supplier breakdown
    if (act.supplierId) {
      const sId = act.supplierId._id.toString();
      const sName = act.supplierId.name || 'Unknown Supplier';
      if (!supplierMap[sId]) {
        supplierMap[sId] = {
          supplierId: sId,
          supplierName: sName,
          totalEmissions: 0,
          materialEmissionsMap: {},
          cost: act.supplierId.cost || 0,
          capacity: act.supplierId.capacity || 0,
          location: act.supplierId.location || '',
        };
      }
      supplierMap[sId].totalEmissions += em;

      const matName = act.material || act.activityType || 'General';
      if (!supplierMap[sId].materialEmissionsMap[matName]) {
        supplierMap[sId].materialEmissionsMap[matName] = 0;
      }
      supplierMap[sId].materialEmissionsMap[matName] += em;
    }

    // Material breakdown
    if (act.material) {
      const mat = act.material;
      if (!materialMap[mat]) materialMap[mat] = 0;
      materialMap[mat] += em;
    }

    // Activity type breakdown
    const actType = act.activityType;
    if (!activityMap[actType]) activityMap[actType] = 0;
    activityMap[actType] += em;
  });

  // Format Scope 3 categories
  const scope3Categories = Object.values(scope3Map)
    .map((item) => ({ ...item, emissions: Math.round(item.emissions * 1000) / 1000 }))
    .sort((a, b) => b.emissions - a.emissions);

  // Format Supplier emissions array
  const supplierEmissions = Object.values(supplierMap)
    .map((s) => ({
      supplierId: s.supplierId,
      name: s.supplierName,
      totalEmissions: Math.round(s.totalEmissions * 1000) / 1000,
      cost: s.cost,
      capacity: s.capacity,
      location: s.location,
      materials: Object.keys(s.materialEmissionsMap).map((m) => ({
        material: m,
        emissions: Math.round(s.materialEmissionsMap[m] * 1000) / 1000,
      })),
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmissions);

  // Format Material emissions array
  const materialEmissions = Object.keys(materialMap)
    .map((m) => ({
      material: m,
      emissions: Math.round(materialMap[m] * 1000) / 1000,
    }))
    .sort((a, b) => b.emissions - a.emissions);

  // Format Activity emissions array
  const activityEmissions = Object.keys(activityMap)
    .map((a) => ({
      activityType: a,
      emissions: Math.round(activityMap[a] * 1000) / 1000,
    }))
    .sort((a, b) => b.emissions - a.emissions);

  // Hotspots
  const topSupplierHotspot = supplierEmissions[0] || null;
  const topActivityHotspot = activityEmissions[0] || null;

  return {
    company: company
      ? { id: company._id, name: company.name, industry: company.industry, location: company.location }
      : { id: companyId || 'all', name: 'All Companies' },
    totals: {
      total: Math.round(totalEmissions * 1000) / 1000,
      scope1: Math.round(scope1 * 1000) / 1000,
      scope2: Math.round(scope2 * 1000) / 1000,
      scope3: Math.round(scope3 * 1000) / 1000,
    },
    scope3Categories,
    supplierEmissions,
    materialEmissions,
    activityEmissions,
    hotspots: {
      highestEmissionSupplier: topSupplierHotspot,
      highestEmissionActivity: topActivityHotspot,
    },
    totalActivitiesCount: activities.length,
  };
};
