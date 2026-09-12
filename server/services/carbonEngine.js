import EmissionFactor from '../models/EmissionFactor.js';

// Fallback illustrative emission factors (used if database factor is not pre-populated)
const DEFAULT_FACTORS = {
  diesel: { factor: 2.68, unit: 'litre', factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
  diesel_consumption: { factor: 2.68, unit: 'litre', factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
  natural_gas: { factor: 2.02, unit: 'm3', factorUnit: 'kgCO2e/m3', source: 'DEFRA 2024' },
  purchased_electricity: { factor: 0.70, unit: 'kWh', factorUnit: 'kgCO2e/kWh', source: 'IEA 2024' },
  electricity: { factor: 0.70, unit: 'kWh', factorUnit: 'kgCO2e/kWh', source: 'IEA 2024' },
  aluminium: { factor: 1.44, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'IAI 2024' },
  plastic: { factor: 2.50, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'PlasticsEurope' },
  copper: { factor: 3.81, unit: 'kg', factorUnit: 'kgCO2e/kg', source: 'ICA 2024' },
  freight_transport: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },
  truck_transport: { factor: 0.15, unit: 'tkm', factorUnit: 'kgCO2e/tkm', source: 'GLEC 2024' },
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
export const calculateEmissions = async ({ activityType, material, quantity, unit }) => {
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

  // Perform deterministic arithmetic
  // If factor is expressed in kgCO2e, divide by 1000 to return tCO2e
  let emissionsTCO2e = (quantity * factorValue) / 1000;

  if (factorUnit.includes('tCO2e')) {
    emissionsTCO2e = quantity * factorValue;
  }

  // Round to 4 decimal places for precision & readability
  const emissions = Math.round(emissionsTCO2e * 10000) / 10000;

  return {
    emissionFactor: factorValue,
    emissions,
    factorUnit,
    source,
  };
};
