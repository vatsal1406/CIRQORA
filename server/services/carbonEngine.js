import EmissionFactor from '../models/EmissionFactor.js';

// Fallback illustrative emission factors (used if database factor is not pre-populated)
const DEFAULT_FACTORS = {
  // Direct combustion & Energy
  diesel: { factor: 2.68, unit: 'litre', factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
  diesel_consumption: { factor: 2.68, unit: 'litre', factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
  diesel_combustion: { factor: 2.68, unit: 'litre', factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
  natural_gas: { factor: 2.02, unit: 'm3', factorUnit: 'kgCO2e/m3', source: 'DEFRA 2024' },
  purchased_electricity: { factor: 0.70, unit: 'kWh', factorUnit: 'kgCO2e/kWh', source: 'IEA 2024' },
  electricity: { factor: 0.70, unit: 'kWh', factorUnit: 'kgCO2e/kWh', source: 'IEA 2024' },

  // Purchased Materials (Scope 3 Cat 1)
  aluminium: { factor: 1.44, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'IAI 2024' },
  copper: { factor: 4.00, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'ICA 2024' },
  steel: { factor: 1.90, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'WorldSteel 2024' },
  stainless_steel: { factor: 3.20, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'ISSF 2024' },
  plastic: { factor: 2.50, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'PlasticsEurope' },
  glass: { factor: 1.00, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'FEVE 2024' },
  paper: { factor: 1.10, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },
  cardboard: { factor: 0.90, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },
  cement: { factor: 0.70, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'GCCA 2024' },
  concrete: { factor: 0.15, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },
  rubber: { factor: 2.80, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },
  textile: { factor: 5.50, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },
  wood: { factor: 0.45, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'DEFRA 2024' },

  // Freight / Transport (Scope 3 Cat 4 & Cat 9)
  freight_transport: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },
  upstream_transportation: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },
  downstream_transport: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },
  truck_transport: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },

  // Business Travel & Employee Commuting (Scope 3 Cat 6 & Cat 7, passenger-km)
  car: { factor: 0.17, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  taxi: { factor: 0.18, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  bus: { factor: 0.10, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  train: { factor: 0.04, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  motorcycle: { factor: 0.10, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  domestic_flight: { factor: 0.25, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },
  international_flight: { factor: 0.20, unit: 'passenger-km', factorUnit: 'kgCO2e/pkm', source: 'DEFRA 2024' },

  // Waste Streams (Scope 3 Cat 5, kg)
  general_waste: { factor: 0.45, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  plastic_waste: { factor: 0.55, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  paper_waste: { factor: 0.40, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  cardboard_waste: { factor: 0.35, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  metal_waste: { factor: 0.20, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  glass_waste: { factor: 0.30, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  wood_waste: { factor: 0.20, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
  waste: { factor: 0.45, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
};

/**
 * Calculates carbon emissions deterministically.
 * @param {Object} params
 * @param {string} params.activityType
 * @param {string} [params.material]
 * @param {number} params.quantity
 * @param {string} params.unit
 * @returns {Promise<{emissionFactor: number, emissions: number, factorUnit: string, source: string}>}
 */
export const calculateEmissions = async ({ activityType, material, quantity, unit, distance = null }) => {
  let factorDoc = null;

  // Search DB by activityType + material + unit
  if (material) {
    factorDoc = await EmissionFactor.findOne({
      $or: [
        { material: new RegExp(`^${material}$`, 'i') },
        { activityType: new RegExp(`^${activityType}$`, 'i'), material: new RegExp(`^${material}$`, 'i') },
      ],
    });
  }

  // If not found by material, search DB by activityType
  if (!factorDoc) {
    factorDoc = await EmissionFactor.findOne({
      activityType: new RegExp(`^${activityType}$`, 'i'),
    });
  }

  let factorValue;
  let factorUnit = 'kgCO2e/unit';
  let source = 'Reference Database';

  if (factorDoc) {
    factorValue = factorDoc.factor;
    factorUnit = factorDoc.factorUnit || 'kgCO2e/unit';
    source = factorDoc.source || 'Database Reference';
  } else {
    // Check fallback illustrative dictionary
    const key = (material || activityType || '').toLowerCase().replace(/\s+/g, '_');
    const fallback = DEFAULT_FACTORS[key] || DEFAULT_FACTORS[activityType.toLowerCase()] || {
      factor: 1.5,
      factorUnit: 'kgCO2e/unit',
      source: 'Default Illustrative Factor',
    };

    factorValue = fallback.factor;
    factorUnit = fallback.factorUnit;
    source = fallback.source;
  }

  // Perform deterministic arithmetic for primary material/activity emissions
  let materialEmissionsTCO2e = (quantity * factorValue) / 1000;
  if (factorUnit.includes('tCO2e')) {
    materialEmissionsTCO2e = quantity * factorValue;
  }
  const materialEmissions = Math.round(materialEmissionsTCO2e * 10000) / 10000;

  // Calculate Upstream Transportation Emissions (Scope 3 Category 4) if distance is provided
  let transportationEmissions = null;
  let transportEmissionFactor = null;

  if (distance !== null && distance !== undefined && !isNaN(Number(distance)) && Number(distance) >= 0) {
    const distKm = Number(distance);
    // Find transportation factor (freight_transport) from DB or existing DEFAULT_FACTORS
    let transportDoc = await EmissionFactor.findOne({
      activityType: new RegExp('^freight_transport$', 'i'),
    });

    const transportFactorValue = transportDoc ? transportDoc.factor : (DEFAULT_FACTORS.freight_transport?.factor || 0.15);
    transportEmissionFactor = transportFactorValue;

    // Convert quantity to tonnes if expressed in kg (1000 kg = 1 tonne)
    const unitLower = (unit || '').toLowerCase();
    const quantityInTonnes = unitLower.includes('t') && !unitLower.includes('kg') ? quantity : quantity / 1000;
    
    // Tonne-Kilometers (tkm) = quantityInTonnes * distKm
    const tkm = quantityInTonnes * distKm;
    // Transportation emissions in kgCO2e = tkm * transportFactorValue, then convert to tCO2e (/1000)
    const transportTCO2e = (tkm * transportFactorValue) / 1000;
    transportationEmissions = Math.round(transportTCO2e * 10000) / 10000;
  }

  // Total analytical emissions = materialEmissions + (transportationEmissions || 0)
  const totalEmissions = Math.round((materialEmissions + (transportationEmissions || 0)) * 10000) / 10000;

  return {
    emissionFactor: factorValue,
    emissions: totalEmissions,
    materialEmissionFactor: factorValue,
    materialEmissions,
    transportEmissionFactor,
    transportationEmissions,
    factorUnit,
    source,
  };
};
