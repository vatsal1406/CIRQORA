import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are a corporate sustainability and supply-chain carbon analyst.

Analyze only the structured carbon accounting data provided in the prompt.

Your tasks:
1. Identify major carbon hotspots.
2. Highlight highest-impact suppliers and activity types.
3. Compare suppliers for identical materials if applicable and recommend lower-carbon options.
4. Suggest concrete carbon reduction opportunities.
5. Provide circular sourcing / decarbonization suggestions.
6. Note any trade-offs or missing constraints (such as cost, quality, capacity, or distance when not provided).

RULES:
- Use the calculated emissions provided by the backend as authoritative.
- Do NOT recalculate or invent emissions values.
- Do NOT invent cost, quality, capacity, distance, or material properties if they are not present in the payload. If not provided, explicitly state that those parameters were unavailable.
- Clearly distinguish between calculated facts, AI interpretations, and recommendations.
- Return output ONLY as valid structured JSON matching the requested schema.`;

/**
 * Generates fallback insights if AI API is missing or fails.
 */
const generateFallbackInsights = (aggregatedData, reasonMessage) => {
  const hotspots = [];
  if (aggregatedData.hotspots.highestEmissionSupplier) {
    hotspots.push({
      type: 'supplier',
      name: aggregatedData.hotspots.highestEmissionSupplier.name,
      emissions: aggregatedData.hotspots.highestEmissionSupplier.totalEmissions,
      reason: 'Highest total calculated supplier emissions.',
    });
  }
  if (aggregatedData.hotspots.highestEmissionActivity) {
    hotspots.push({
      type: 'activity',
      name: aggregatedData.hotspots.highestEmissionActivity.activityType,
      emissions: aggregatedData.hotspots.highestEmissionActivity.emissions,
      reason: 'Highest calculated emission activity type.',
    });
  }

  return {
    summary: `Company total emissions are ${aggregatedData.totals.total} tCO2e (Scope 1: ${aggregatedData.totals.scope1}, Scope 2: ${aggregatedData.totals.scope2}, Scope 3: ${aggregatedData.totals.scope3}). ${reasonMessage}`,
    majorHotspots: hotspots,
    supplierRecommendations: aggregatedData.supplierEmissions.slice(0, 3).map((s) => ({
      supplier: s.name,
      recommendation: `Track and engage with ${s.name} on primary carbon data.`,
      reason: `Calculated emissions: ${s.totalEmissions} tCO2e.`,
      tradeoffs: ['Cost and capacity constraints were not supplied in the dataset.'],
    })),
    reductionOpportunities: [
      {
        area: 'Scope 2 Energy Efficiency',
        recommendation: 'Transition purchased electricity to renewable power purchase agreements (PPAs).',
        reason: `Scope 2 accounts for ${aggregatedData.totals.scope2} tCO2e.`,
      },
      {
        area: 'Scope 3 Supply Chain Sourcing',
        recommendation: 'Incentivize lower-carbon material sourcing among top tier-1 suppliers.',
        reason: `Scope 3 accounts for ${aggregatedData.totals.scope3} tCO2e.`,
      },
    ],
    circularSourcingSuggestions: [
      {
        suggestion: 'Increase recycled content ratio in raw material procurement.',
        reason: 'Recycled input materials significantly reduce upstream Category 1 Scope 3 emissions.',
      },
    ],
    isAiFallback: true,
  };
};

/**
 * Analyzes aggregated carbon data using Google Generative AI API.
 */
export const analyzeCarbonData = async (aggregatedData) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your_ai_api_key_here') {
    return generateFallbackInsights(aggregatedData, 'Note: AI API Key not configured. Returning rule-based analytical summary.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const userPayload = {
      company: aggregatedData.company,
      totals: aggregatedData.totals,
      scope3Categories: aggregatedData.scope3Categories,
      suppliers: aggregatedData.supplierEmissions,
      materials: aggregatedData.materialEmissions,
      activities: aggregatedData.activityEmissions,
      hotspots: aggregatedData.hotspots,
    };

    const prompt = `${SYSTEM_PROMPT}

Data Payload:
${JSON.stringify(userPayload, null, 2)}

Return JSON matching this exact structure:
{
  "summary": "High-level summary of emissions profile",
  "majorHotspots": [
    { "type": "supplier|activity|material", "name": "...", "emissions": 0.0, "reason": "..." }
  ],
  "supplierRecommendations": [
    { "supplier": "...", "recommendation": "...", "reason": "...", "tradeoffs": ["..."] }
  ],
  "reductionOpportunities": [
    { "area": "...", "recommendation": "...", "reason": "..." }
  ],
  "circularSourcingSuggestions": [
    { "suggestion": "...", "reason": "..." }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return {
      ...parsed,
      isAiFallback: false,
    };
  } catch (error) {
    console.error('[aiAnalyzer] Error calling AI API:', error.message);
    return generateFallbackInsights(aggregatedData, `AI service encountered an error (${error.message}). Returning calculated backend summary.`);
  }
};
