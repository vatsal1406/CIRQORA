import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are a senior enterprise ESG and supply-chain sustainability analyst.

Analyze ONLY the verified corporate carbon accounting data provided in the payload.

Your output MUST be a single, strictly formatted JSON object matching this schema EXACTLY:
{
  "summary": "Concise 1 to 3 sentence overview summarizing primary scope breakdown, top material/supplier hotspots, and key decarbonization opportunity.",

  "snapshot": {
    "largestScope": "Scope 1 | Scope 2 | Scope 3",
    "largestScope3Category": "Category name or N/A",
    "largestHotspot": "Material or Supplier name with emissions"
  },

  "hotspots": [
    {
      "name": "Name of material, supplier, or activity",
      "type": "material | supplier | activity | scope | scope3Category | transportation",
      "emissions": 0.0,
      "contributionPercent": 0.0,
      "reason": "Specific reason why this is a hotspot based on actual data"
    }
  ],

  "drivers": [
    {
      "hotspot": "Name of hotspot",
      "reason": "Specific driver explanation (e.g. high purchase volume, high carbon intensity factor, transportation distance)"
    }
  ],

  "recommendations": [
    {
      "type": "supplier_switch | material_change | transportation | activity | other",
      "priority": "High | Medium | Low",
      "title": "Short title of recommendation (e.g. Switch Aluminium Sourcing)",
      "current": {
        "supplier": "Current supplier name or null",
        "material": "Current material name or null",
        "emissions": 0.0,
        "carbonIntensity": "Formatted intensity string e.g. 1.900 kgCO2e/kg or null"
      },
      "recommended": {
        "supplier": "Recommended alternative supplier name or null",
        "material": "Recommended alternative material name or null",
        "emissions": 0.0,
        "carbonIntensity": "Formatted intensity string e.g. 1.100 kgCO2e/kg or null"
      },
      "action": "Specific, concrete action statement (e.g. Switch Aluminium purchases from Supplier A to Supplier B)",
      "reason": "Specific rationale tied to verified carbon intensity or emission factor data",
      "impact": {
        "reduction": 0.0,
        "percentage": 0.0
      }
    }
  ],

  "supplierRecommendations": [
    {
      "currentSupplier": "Current supplier name",
      "recommendedSupplier": "Recommended lower-carbon supplier name",
      "material": "Material name",
      "currentEmissions": 0.0,
      "recommendedEmissions": 0.0,
      "difference": 0.0,
      "reason": "Specific rationale based on carbon intensity difference"
    }
  ],

  "materialRecommendations": [
    {
      "currentMaterial": "Current material",
      "alternativeMaterial": "Alternative material",
      "currentFactor": "Factor string",
      "alternativeFactor": "Factor string",
      "reason": "Consider evaluating alternative material for lower upstream carbon impact where technically feasible"
    }
  ],

  "transportationOpportunities": [
    {
      "activity": "Activity or material name",
      "currentDistance": "Distance string",
      "reason": "Specific transportation impact driver explanation"
    }
  ],

  "potentialImpact": {
    "currentEmissions": 0.0,
    "potentialReduction": null,
    "projectedEmissions": null,
    "percentageReduction": null
  },

  "priorityPlan": [
    {
      "rank": 1,
      "title": "Action title",
      "reason": "Why this action is ranked at this priority"
    }
  ],

  "topPriority": {
    "action": "Single most important recommended decision/action",
    "reason": "Clear explanation of why this decision yields the highest immediate carbon reduction"
  }
}

STRICT RULES:
1. Rely ONLY on the provided backend data. Never invent fake emission factors, missing suppliers, or fake numbers.
2. Provide specific, data-backed recommendations (e.g., 'Switch Aluminium purchases from Supplier X to Supplier Y') whenever supplier comparison data is present in payload.
3. If potential reduction numbers cannot be calculated from data, set potentialReduction and percentageReduction in potentialImpact to null.
4. Do NOT wrap output in markdown syntax or extra text. Return strictly valid JSON matching the schema.`;

/**
 * Generates structured fallback insights if AI API is missing or fails.
 */
const generateFallbackInsights = (aggregatedData, reasonMessage) => {
  const total = aggregatedData.totals?.total || 0;
  const scope1 = aggregatedData.totals?.scope1 || 0;
  const scope2 = aggregatedData.totals?.scope2 || 0;
  const scope3 = aggregatedData.totals?.scope3 || 0;
  const companyName = aggregatedData.company?.name || 'the company';

  const topMat = aggregatedData.materialEmissions?.[0];
  const topSup = aggregatedData.supplierEmissions?.[0];
  const topAct = aggregatedData.activityEmissions?.[0];

  let largestScope = 'Scope 3';
  if (scope1 >= scope2 && scope1 >= scope3) largestScope = 'Scope 1';
  else if (scope2 >= scope1 && scope2 >= scope3) largestScope = 'Scope 2';

  const scope3CatName = aggregatedData.scope3Categories?.[0]?.name || 'Purchased Goods & Services';

  const hotspots = [];
  if (topMat) {
    const pct = total > 0 ? Math.round((topMat.emissions / total) * 1000) / 10 : 0;
    hotspots.push({
      name: topMat.material,
      type: 'material',
      emissions: topMat.emissions,
      contributionPercent: pct,
      reason: `Largest material carbon contributor (${pct}% of total emissions).`,
    });
  }
  if (topSup) {
    const pct = total > 0 ? Math.round((topSup.totalEmissions / total) * 1000) / 10 : 0;
    hotspots.push({
      name: topSup.name,
      type: 'supplier',
      emissions: topSup.totalEmissions,
      contributionPercent: pct,
      reason: `Highest total calculated supplier emissions (${pct}% of footprint).`,
    });
  }
  if (topAct && (!topMat || topAct.activityType !== topMat.material)) {
    const pct = total > 0 ? Math.round((topAct.emissions / total) * 1000) / 10 : 0;
    hotspots.push({
      name: topAct.activityType,
      type: 'activity',
      emissions: topAct.emissions,
      contributionPercent: pct,
      reason: `Primary activity type contributor.`,
    });
  }

  const drivers = [];
  if (topMat) {
    drivers.push({
      hotspot: topMat.material,
      reason: `High purchase volume combined with upstream Category 1 material emission factor.`,
    });
  }
  if (topSup) {
    drivers.push({
      hotspot: topSup.name,
      reason: `High supplier activity concentration representing ${topSup.totalEmissions} tCO2e of total supply-chain footprint.`,
    });
  }

  const recommendations = [];
  const supplierRecs = [];
  const comp = aggregatedData.supplierComparisons?.[0];

  if (comp && comp.recommendedSupplier && comp.currentSupplier) {
    const diff = Math.max(0, comp.currentEmissions - comp.recommendedEmissions);
    const pct = comp.currentEmissions > 0 ? Math.round((diff / comp.currentEmissions) * 1000) / 10 : 0;

    recommendations.push({
      type: 'supplier_switch',
      priority: 'High',
      title: `Switch ${comp.material} Sourcing`,
      current: {
        supplier: comp.currentSupplier,
        material: comp.material,
        emissions: comp.currentEmissions,
        carbonIntensity: comp.currentIntensity || 'N/A',
      },
      recommended: {
        supplier: comp.recommendedSupplier,
        material: comp.material,
        emissions: comp.recommendedEmissions,
        carbonIntensity: comp.recommendedIntensity || 'N/A',
      },
      action: `Switch ${comp.material} procurement from ${comp.currentSupplier} to ${comp.recommendedSupplier}.`,
      reason: `${comp.recommendedSupplier} demonstrates lower observed carbon intensity for ${comp.material} sourcing activities.`,
      impact: {
        reduction: Math.round(diff * 1000) / 1000,
        percentage: pct,
      },
    });

    supplierRecs.push({
      currentSupplier: comp.currentSupplier,
      recommendedSupplier: comp.recommendedSupplier,
      material: comp.material,
      currentEmissions: comp.currentEmissions,
      recommendedEmissions: comp.recommendedEmissions,
      difference: Math.round(diff * 1000) / 1000,
      reason: `Lower carbon intensity observed for ${comp.material} sourcing activities.`,
    });
  } else if (topMat) {
    recommendations.push({
      type: 'supplier_switch',
      priority: 'High',
      title: `Optimize ${topMat.material} Supplier Sourcing`,
      current: { supplier: topSup?.name || 'Current Suppliers', material: topMat.material, emissions: topMat.emissions, carbonIntensity: null },
      recommended: { supplier: 'Lower-Carbon Candidate Supplier', material: topMat.material, emissions: null, carbonIntensity: null },
      action: `Prioritize lower-carbon verified suppliers for ${topMat.material} procurement.`,
      reason: `${topMat.material} represents the largest material footprint (${topMat.emissions} tCO2e).`,
      impact: { reduction: null, percentage: null },
    });
  }

  if (scope2 > 0) {
    recommendations.push({
      type: 'activity',
      priority: 'Medium',
      title: 'Transition Electricity to Renewable PPAs',
      current: { supplier: 'Utility Provider', material: 'Electricity', emissions: scope2, carbonIntensity: null },
      recommended: { supplier: 'Renewable Energy PPA', material: 'Green Electricity', emissions: 0, carbonIntensity: '0 kgCO2e/kWh' },
      action: 'Procure renewable energy certificates or solar PPAs to eliminate Scope 2 location-based emissions.',
      reason: `Scope 2 electricity accounts for ${scope2} tCO2e of total emissions.`,
      impact: { reduction: scope2, percentage: total > 0 ? Math.round((scope2 / total) * 1000) / 10 : 0 },
    });
  }

  const priorityPlan = recommendations.map((r, i) => ({
    rank: i + 1,
    title: r.title,
    reason: r.reason,
  }));

  const topPriorityAction = comp && comp.recommendedSupplier
    ? {
        action: `Switch ${comp.material} sourcing from ${comp.currentSupplier} to ${comp.recommendedSupplier}.`,
        reason: `This decision yields the highest verified carbon reduction (${Math.round((comp.currentEmissions - comp.recommendedEmissions) * 1000) / 1000} tCO2e) based on supplier comparison data.`,
      }
    : topMat
    ? {
        action: `Optimize ${topMat.material} sourcing across supply chain.`,
        reason: `${topMat.material} is the primary material contributor to ${companyName}'s footprint (${topMat.emissions} tCO2e).`,
      }
    : {
        action: 'Record purchase activity metrics.',
        reason: 'Complete purchase activity data is required to identify primary decarbonization opportunities.',
      };

  return {
    summary: `Scope 3 is the primary contributor to ${companyName}'s carbon footprint (${total} tCO2e total). Sourcing optimization presents the strongest near-term reduction opportunity. ${reasonMessage}`,
    snapshot: {
      totalEmissions: total,
      scope1,
      scope2,
      scope3,
      largestScope,
      largestScope3Category: scope3CatName,
      activeSuppliers: aggregatedData.supplierEmissions?.length || 0,
    },
    hotspots: hotspots.slice(0, 5),
    drivers: drivers.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    supplierRecommendations: supplierRecs,
    materialRecommendations: topMat
      ? [
          {
            currentMaterial: topMat.material,
            alternativeMaterial: topMat.material === 'Aluminium' ? 'Recycled Aluminium' : 'Lower-Carbon Alternative',
            currentFactor: 'Standard Factor',
            alternativeFactor: 'Recycled Factor',
            reason: `Consider evaluating recycled or lower-carbon inputs for ${topMat.material} where technically feasible.`,
          },
        ]
      : [],
    transportationOpportunities: aggregatedData.scope3Categories?.some((c) => c.category === 4)
      ? [
          {
            activity: 'Upstream Freight Transport',
            currentDistance: 'Varies',
            reason: 'Transportation contributes to Scope 3 Category 4 emissions. Route optimization can reduce transport carbon impact.',
          },
        ]
      : [],
    potentialImpact: {
      currentEmissions: total,
      potentialReduction: comp ? Math.round((comp.currentEmissions - comp.recommendedEmissions) * 1000) / 1000 : null,
      projectedEmissions: comp ? Math.round((total - (comp.currentEmissions - comp.recommendedEmissions)) * 1000) / 1000 : null,
      percentageReduction: comp && total > 0 ? Math.round(((comp.currentEmissions - comp.recommendedEmissions) / total) * 1000) / 10 : null,
    },
    priorityPlan,
    topPriority: topPriorityAction,
    isAiFallback: true,
  };
};

/**
 * Analyzes aggregated carbon data using Google Generative AI API.
 */
export const analyzeCarbonData = async (aggregatedData) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your_ai_api_key_here') {
    return generateFallbackInsights(aggregatedData, 'Note: AI API Key not configured. Returning calculated backend rule analysis.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-3.5-flash or gemini-1.5-flash with fallback
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
    } catch (e) {
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
    }

    const userPayload = {
      companyName: aggregatedData.company?.name || 'Selected Company',
      totals: aggregatedData.totals,
      scope3Categories: aggregatedData.scope3Categories,
      topSuppliers: aggregatedData.supplierEmissions.slice(0, 5),
      topMaterials: aggregatedData.materialEmissions.slice(0, 5),
      topActivities: aggregatedData.activityEmissions.slice(0, 5),
      hotspots: aggregatedData.hotspots,
      supplierComparisons: aggregatedData.supplierComparisons || [],
    };

    const prompt = `${SYSTEM_PROMPT}

Carbon Data Payload:
${JSON.stringify(userPayload, null, 2)}`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    // Merge fallback fields if missing from AI response to guarantee 100% complete schema
    const fallback = generateFallbackInsights(aggregatedData, '');

    return {
      summary: parsed.summary || fallback.summary,
      snapshot: parsed.snapshot || fallback.snapshot,
      hotspots: Array.isArray(parsed.hotspots) && parsed.hotspots.length > 0 ? parsed.hotspots : fallback.hotspots,
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers : fallback.drivers,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : fallback.recommendations,
      supplierRecommendations: Array.isArray(parsed.supplierRecommendations) ? parsed.supplierRecommendations : fallback.supplierRecommendations,
      materialRecommendations: Array.isArray(parsed.materialRecommendations) ? parsed.materialRecommendations : fallback.materialRecommendations,
      transportationOpportunities: Array.isArray(parsed.transportationOpportunities) ? parsed.transportationOpportunities : fallback.transportationOpportunities,
      potentialImpact: parsed.potentialImpact || fallback.potentialImpact,
      priorityPlan: Array.isArray(parsed.priorityPlan) && parsed.priorityPlan.length > 0 ? parsed.priorityPlan : fallback.priorityPlan,
      topPriority: parsed.topPriority || fallback.topPriority,
      isAiFallback: false,
    };
  } catch (error) {
    console.error('[aiAnalyzer] Error calling AI API:', error.message);
    return generateFallbackInsights(aggregatedData, `AI service encountered an error (${error.message}). Returning calculated backend analysis.`);
  }
};
