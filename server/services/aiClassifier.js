import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deterministic Backend Validation Rules for Known Activities
 */
export const applyBackendRules = (activityType = '', material = '', description = '') => {
  const typeNorm = (activityType || '').toLowerCase().replace(/[\_\s]+/g, '');
  const text = `${activityType} ${material} ${description}`.toLowerCase();

  // 1. Direct Activity Type Match Rules
  if (typeNorm === 'purchasedmaterial') {
    return {
      scope: 3,
      scope3Category: 1,
      reason: 'Rule matched: Purchased Material activities fall under Scope 3 Category 1.',
      overridden: true,
    };
  }

  if (typeNorm === 'freighttransport' || typeNorm === 'upstreamtransportation') {
    return {
      scope: 3,
      scope3Category: 4,
      reason: 'Rule matched: Upstream Freight/Transportation falls under Scope 3 Category 4.',
      overridden: true,
    };
  }

  if (typeNorm === 'downstreamtransport') {
    return {
      scope: 3,
      scope3Category: 9,
      reason: 'Rule matched: Downstream Transportation falls under Scope 3 Category 9.',
      overridden: true,
    };
  }

  if (typeNorm === 'wastedisposal' || typeNorm === 'waste') {
    return {
      scope: 3,
      scope3Category: 5,
      reason: 'Rule matched: Waste disposal activities fall under Scope 3 Category 5.',
      overridden: true,
    };
  }

  if (typeNorm === 'businesstravel') {
    return {
      scope: 3,
      scope3Category: 6,
      reason: 'Rule matched: Business travel activities fall under Scope 3 Category 6.',
      overridden: true,
    };
  }

  if (typeNorm === 'employeecommuting') {
    return {
      scope: 3,
      scope3Category: 7,
      reason: 'Rule matched: Employee commuting activities fall under Scope 3 Category 7.',
      overridden: true,
    };
  }

  if (typeNorm === 'electricity' || typeNorm === 'purchasedelectricity') {
    return {
      scope: 2,
      scope3Category: null,
      reason: 'Rule matched: Purchased electricity is Scope 2.',
      overridden: true,
    };
  }

  if (typeNorm === 'dieselcombustion' || typeNorm === 'dieselconsumption' || typeNorm === 'naturalgas') {
    return {
      scope: 1,
      scope3Category: null,
      reason: 'Rule matched: Direct fuel combustion is Scope 1.',
      overridden: true,
    };
  }

  // Scope 3 Category 1: Purchased Goods and Services
  if (
    text.includes('purchased_material') ||
    text.includes('raw material') ||
    text.includes('aluminium') ||
    text.includes('aluminum') ||
    text.includes('plastic') ||
    text.includes('copper') ||
    text.includes('steel') ||
    text.includes('paper')
  ) {
    return {
      scope: 3,
      scope3Category: 1,
      reason: 'Rule matched: Purchased goods and raw materials fall under Scope 3 Category 1.',
      overridden: true,
    };
  }

  // Scope 3 Category 4: Upstream Transportation & Distribution
  if (text.includes('freight') || text.includes('upstream_transportation') || text.includes('truck_transport')) {
    return {
      scope: 3,
      scope3Category: 4,
      reason: 'Rule matched: Upstream freight/transport falls under Scope 3 Category 4.',
      overridden: true,
    };
  }

  // Scope 3 Category 9: Downstream Transportation & Distribution
  if (text.includes('downstream_transport') || text.includes('downstream transport') || text.includes('distribution')) {
    return {
      scope: 3,
      scope3Category: 9,
      reason: 'Rule matched: Downstream product distribution falls under Scope 3 Category 9.',
      overridden: true,
    };
  }

  // Scope 3 Category 5: Waste generated in operations
  if (text.includes('waste') || text.includes('disposal')) {
    return {
      scope: 3,
      scope3Category: 5,
      reason: 'Rule matched: Waste disposal falls under Scope 3 Category 5.',
      overridden: true,
    };
  }

  // Scope 3 Category 6: Business Travel
  if (text.includes('business_travel') || text.includes('business travel') || text.includes('flight') || text.includes('taxi')) {
    return {
      scope: 3,
      scope3Category: 6,
      reason: 'Rule matched: Business travel falls under Scope 3 Category 6.',
      overridden: true,
    };
  }

  // Scope 3 Category 7: Employee Commuting
  if (text.includes('employee_commuting') || text.includes('employee commuting') || text.includes('commute')) {
    return {
      scope: 3,
      scope3Category: 7,
      reason: 'Rule matched: Employee commuting falls under Scope 3 Category 7.',
      overridden: true,
    };
  }

  return null;
};

/**
 * AI Classifier service using Google Generative AI with fallback rules.
 */
export const classifyActivity = async ({ activityType, material, description, quantity, unit }) => {
  // 1. Check deterministic backend rules first
  const ruleResult = applyBackendRules(activityType, material, description);
  if (ruleResult) {
    return ruleResult;
  }

  // 2. If AI key is provided, query Gemini API for natural-language classification
  const apiKey = process.env.AI_API_KEY;
  if (apiKey && apiKey !== 'your_ai_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      const prompt = `You are a GHG Protocol Carbon Accounting Expert. Classify the following corporate activity into Scope 1, Scope 2, or Scope 3 (and Scope 3 Category from 1 to 15 if Scope 3).
Activity Type: "${activityType}"
Material: "${material || 'N/A'}"
Description: "${description || 'N/A'}"
Quantity: ${quantity} ${unit}

Return STRICT JSON only matching this format:
{
  "scope": 1 | 2 | 3,
  "scope3Category": number | null,
  "reason": "short explanation"
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.scope && [1, 2, 3].includes(Number(parsed.scope))) {
        const scope = Number(parsed.scope);
        const scope3Category = scope === 3 ? (Number(parsed.scope3Category) || 1) : null;
        return {
          scope,
          scope3Category,
          reason: parsed.reason || 'AI classified according to GHG Protocol.',
          overridden: false,
        };
      }
    } catch (err) {
      console.warn('[aiClassifier] AI API call failed or timed out. Falling back to default rules.', err.message);
    }
  }

  // 3. Fallback default classification if AI API unavailable or rule not matched
  return {
    scope: 3,
    scope3Category: 1,
    reason: 'Default fallback classification applied (Scope 3 Category 1).',
    overridden: false,
  };
};
