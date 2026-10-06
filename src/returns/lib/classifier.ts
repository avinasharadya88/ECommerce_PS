import type { ReturnCategory, Priority } from './types';

export interface ClassificationResult {
  category: ReturnCategory;
  confidenceScore: number;
  priority: Priority;
  suggestedFix: string;
  rootCauseAnalysis: string;
}

export function classifyCustomerFeedback(feedback: string, sku: string): ClassificationResult {
  const text = feedback.toLowerCase();

  // 1. Sizing / Fit Discrepancy
  if (
    text.includes('small') ||
    text.includes('tight') ||
    text.includes('large') ||
    text.includes('fit') ||
    text.includes('size') ||
    text.includes('sizing') ||
    text.includes('shoulders') ||
    text.includes('chest') ||
    text.includes('waist') ||
    text.includes('inseam')
  ) {
    const isSmall = text.includes('small') || text.includes('tight') || text.includes('short');
    return {
      category: 'Sizing / Fit Discrepancy',
      confidenceScore: 0.94,
      priority: 'P1',
      rootCauseAnalysis: `Customer fit complaints indicate measurement discrepancy: "${feedback}"`,
      suggestedFix: isSmall
        ? `Update listing spec for SKU ${sku}: Add prominent banner 'Runs 1 size small. Recommend ordering 1 size up.' Adjust chest & shoulder dimensions in sizing table by -1.5 inches.`
        : `Update listing spec for SKU ${sku}: Add prominent fit note 'Relaxed/oversized cut. For standard fit, order 1 size down.' Update dimensional sizing guide table.`,
    };
  }

  // 2. Material Quality Drift
  if (
    text.includes('material') ||
    text.includes('fabric') ||
    text.includes('see-through') ||
    text.includes('sheer') ||
    text.includes('gsm') ||
    text.includes('cheap') ||
    text.includes('thin') ||
    text.includes('tear') ||
    text.includes('stitch') ||
    text.includes('cotton') ||
    text.includes('synthetic')
  ) {
    return {
      category: 'Material Quality Drift',
      confidenceScore: 0.91,
      priority: 'P2',
      rootCauseAnalysis: `Customer reported fabric weight/texture deviation from listing copy: "${feedback}"`,
      suggestedFix: `Update bullet point 2 for SKU ${sku}: Accurately specify fabric weight (GSM) and blend percentage. Flag supplier batch inspection with QC team to audit fabric weight tolerance.`,
    };
  }

  // 3. Misleading Listing Image
  if (
    text.includes('color') ||
    text.includes('colour') ||
    text.includes('shade') ||
    text.includes('picture') ||
    text.includes('photo') ||
    text.includes('image') ||
    text.includes('look like') ||
    text.includes('shiny') ||
    text.includes('matte') ||
    text.includes('darker') ||
    text.includes('lighter')
  ) {
    return {
      category: 'Misleading Listing Image',
      confidenceScore: 0.89,
      priority: 'P2',
      rootCauseAnalysis: `Studio lighting in current hero photos skews real product color/finish: "${feedback}"`,
      suggestedFix: `Replace hero carousel image 1 & 3 for SKU ${sku} with daylight unedited color-calibrated photos. Add callout in description: 'Actual shade may vary slightly under indoor fluorescent lighting.'`,
    };
  }

  // 4. Missing Assembly / Dimension Spec
  if (
    text.includes('bolt') ||
    text.includes('screw') ||
    text.includes('tool') ||
    text.includes('hardware') ||
    text.includes('assemble') ||
    text.includes('manual') ||
    text.includes('instruction') ||
    text.includes('dimension') ||
    text.includes('height') ||
    text.includes('width') ||
    text.includes('table') ||
    text.includes('parts')
  ) {
    return {
      category: 'Missing Assembly Spec',
      confidenceScore: 0.93,
      priority: 'P3',
      rootCauseAnalysis: `Missing hardware spec checklist or unclear diagram: "${feedback}"`,
      suggestedFix: `Upload revised PDF assembly guide v2.1 for SKU ${sku} with complete hardware parts checklist. Add note: 'Requires standard Allen Wrench & Hex Key (Included)'. Update exact L x W x H dimensions in specifications.`,
    };
  }

  // 5. Pricing & Promotion Drift / General
  return {
    category: 'Pricing & Promotion Drift',
    confidenceScore: 0.82,
    priority: 'P3',
    rootCauseAnalysis: `Customer expectations diverged on bundle inclusion or pricing parity: "${feedback}"`,
    suggestedFix: `Audit pricing and promotional discount bullets for SKU ${sku}. Ensure bundled accessories and promotion terms are explicitly highlighted in the top 3 bullet points.`,
  };
}
