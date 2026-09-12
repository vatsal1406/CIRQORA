import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deterministic Backend Validation Rules for Known Activities
 */
export const applyBackendRules = (activityType = '', material = '', description = '') => {
  const text = `${activityType} ${material} ${description}`.toLowerCase();

  // Scope 1: Direct emissions from owned/controlled sources
  if (
    text.includes('diesel') ||
    text.includes('natural_gas') ||
    text.includes('natural gas') ||
    text.includes('gasoline') ||
    text.includes('furnace') ||
    text.includes('generator fuel')
  ) {
    return {
      scope: 1,
      scope3Category: null,
      reason: 'Rule matched: Fuel combustion in company-controlled equipment/facilities is Scope 1.',
      overridden: true,
    };
  }

  // Scope 2: Indirect emissions from purchased energy
  if (
    text.includes('electricity') ||
    text.includes('purchased_electricity') ||
    text.includes('grid_power') ||
    text.includes('steam') ||
    text.includes('chilled water')
  ) {
    return {
      scope: 2,
      scope3Category: null,
      reason: 'Rule matched: Purchased electricity/heating is Scope 2.',
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
  if (text.includes('freight') || text.includes('truck_transport') || text.includes('shipping')) {
    return {
      scope: 3,
      scope3Category: 4,
      reason: 'Rule matched: Freight and transport fall under Scope 3 Category 4.',
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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
