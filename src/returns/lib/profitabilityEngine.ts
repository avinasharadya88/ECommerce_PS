import type { ProfitabilityParams, ProfitabilityBreakdown } from './types';

export const DEFAULT_PROFITABILITY_PARAMS: ProfitabilityParams = {
  annualReturnsCount: 120000,
  avgItemPrice: 65,
  reverseLogisticsShippingCost: 7.5,
  inspectionAndRestockingCost: 4.5,
  preventionRate: 24, // 24% returns prevented via AI catalog fixes
  exchangeConversionRate: 36, // 36% of remaining choose exchange over refund
  exchangeBonusCreditRate: 10, // 10% bonus credit offered for choosing exchange
  grossProfitMargin: 48, // 48% retail gross margin
  keepItItemValueThreshold: 22, // items under $22 eligible for Keep-It
  keepItRefundPercentage: 60, // 60% instant store credit refund
  recommerceRecoveryRate: 58, // 58% recovery through certified open-box / recommerce
};

/**
 * Calculates the exact financial transformation of e-commerce returns
 * from pure balance-sheet loss to protected margin & profitable recommerce.
 */
export function calculateProfitability(params: ProfitabilityParams): ProfitabilityBreakdown {
  const {
    annualReturnsCount,
    avgItemPrice,
    reverseLogisticsShippingCost,
    inspectionAndRestockingCost,
    preventionRate,
    exchangeConversionRate,
    exchangeBonusCreditRate,
    grossProfitMargin,
    keepItItemValueThreshold,
    keepItRefundPercentage,
    recommerceRecoveryRate,
  } = params;

  // Processing cost per physical return (shipping + warehouse inspection/restock)
  const unitHandlingCost = reverseLogisticsShippingCost + inspectionAndRestockingCost;

  // Under traditional returns:
  // 1. Loss of shipping + handling
  // 2. Liquidated item loss (typically recovers only ~15% of value, so 85% is lost)
  // 3. Loss of retail gross margin
  const traditionalSalvageRate = 0.15;
  const traditionalUnitLoss =
    unitHandlingCost + avgItemPrice * (1 - traditionalSalvageRate) + avgItemPrice * (grossProfitMargin / 100);

  const baselineTotalLoss = Math.round(annualReturnsCount * traditionalUnitLoss);

  // 1. Lever 1: Return Prevention via Catalog Fixes
  const preventedUnits = Math.round(annualReturnsCount * (preventionRate / 100));
  // Every prevented return completely eliminates handling cost, preserves full margin, and eliminates product write-down
  const savingsPerPreventedUnit =
    unitHandlingCost + avgItemPrice * (grossProfitMargin / 100) + avgItemPrice * (1 - traditionalSalvageRate);
  const preventionSavings = Math.round(preventedUnits * savingsPerPreventedUnit);

  const returnsAfterPrevention = annualReturnsCount - preventedUnits;

  // 2. Lever 2: Exchange-over-Refund Incentive
  // Converts refund cash drain into retained repeat sales with a small incentive bonus
  const eligibleExchangeUnits = Math.round(returnsAfterPrevention * 0.70); // ~70% are returnable/eligible items
  const exchangedUnits = Math.round(eligibleExchangeUnits * (exchangeConversionRate / 100));

  // Gross margin retained minus bonus incentive cost
  const netRetainedMarginPercent = Math.max(0, grossProfitMargin - exchangeBonusCreditRate) / 100;
  const exchangeRetainedMargin = Math.round(exchangedUnits * (avgItemPrice * netRetainedMarginPercent));

  const remainingReturns = returnsAfterPrevention - exchangedUnits;

  // 3. Lever 3: Smart Keep-It / Micro-Refund Policy
  // For items below threshold, reverse logistics shipping ($7.50) + inspection ($4.50) exceeds item residual value.
  // Letting the customer keep the item saves the full unitHandlingCost ($12) minus difference in refund.
  const lowValueItemRatio = Math.min(
    0.55,
    Math.max(0.08, (keepItItemValueThreshold / Math.max(avgItemPrice, 1)) * 0.5)
  );
  const keepItUnits = Math.round(remainingReturns * lowValueItemRatio);
  // Incremental value vs a standard return: logistics avoided + revenue retained
  // after the partial refund, less the 15% liquidation recovery forgone.
  const savedValuePerKeepIt = Math.max(
    0,
    unitHandlingCost +
      avgItemPrice * (1 - keepItRefundPercentage / 100) -
      avgItemPrice * traditionalSalvageRate
  );
  const keepItLogisticsSaved = Math.round(keepItUnits * savedValuePerKeepIt);

  const physicalReturnsToProcess = Math.max(0, remainingReturns - keepItUnits);

  // 4. Lever 4: Automated Grade & Recommerce / Open-Box Resale
  // Instead of bulk liquidation at 15%, AI automated grading routes units to Grade A/B certified resale at e.g. 58%
  const recommerceUnits = Math.round(physicalReturnsToProcess * 0.85); // 85% can be graded/resold
  const recoveryDeltaRate = Math.max(0, recommerceRecoveryRate / 100 - traditionalSalvageRate);
  const recommerceResaleRecovered = Math.round(recommerceUnits * (avgItemPrice * recoveryDeltaRate));

  // Total Net Turnaround Gain = sum of all 4 optimization pillars
  const netTurnaroundGain =
    preventionSavings + exchangeRetainedMargin + keepItLogisticsSaved + recommerceResaleRecovered;

  const newOptimizedOutcome = baselineTotalLoss - netTurnaroundGain;
  const netTurnaroundPercentage = baselineTotalLoss > 0
    ? Math.round((netTurnaroundGain / baselineTotalLoss) * 100)
    : 0;

  return {
    baselineTotalLoss,
    preventionSavings,
    exchangeRetainedMargin,
    keepItLogisticsSaved,
    recommerceResaleRecovered,
    newOptimizedOutcome,
    netTurnaroundGain,
    netTurnaroundPercentage,
    preventedUnits,
    exchangedUnits,
    keepItUnits,
    recommerceUnits,
  };
}
