export type Marketplace = 'all' | 'amazon' | 'flipkart' | 'shopify';

export type Timeframe = '7d' | '30d' | '90d';

export type ReturnCategory =
  | 'Sizing / Fit Discrepancy'
  | 'Material Quality Drift'
  | 'Misleading Listing Image'
  | 'Missing Assembly Spec'
  | 'Pricing & Promotion Drift';

export type Priority = 'P1' | 'P2' | 'P3';

export type TicketTarget = 'linear' | 'jira';

export type ReturnStatus = 'Pending' | 'Pushed to Linear' | 'Pushed to Jira' | 'Dismissed';

export interface ReturnLog {
  id: string;
  sku: string;
  productName: string;
  customerFeedback: string;
  category: ReturnCategory;
  originalListingCopy: string;
  suggestedFix: string;
  confidenceScore: number;
  priority: Priority;
  status: ReturnStatus;
  timestamp: string;
  marketplace: 'amazon' | 'flipkart' | 'shopify';
  itemValue: number;
  returnCost: number;
  customerIntent: 'refund' | 'exchange' | 'keep_discount';
  resolutionMode: 'prevented' | 'exchanged' | 'recommerce' | 'keep_item' | 'standard_return';
  ticketUrl?: string;
  ticketIdentifier?: string;
}

export interface HighSpikeSku {
  sku: string;
  productName: string;
  category: string;
  returnSpikePercent: number;
  totalReturns: number;
  primaryDriver: string;
  complaintQuote: string;
  preventableRate: number;
  potentialAnnualSavings: number;
  badge: 'Critical' | 'Warning' | 'Investigate';
  marketplace: 'amazon' | 'flipkart' | 'shopify';
}

export interface ProfitabilityParams {
  annualReturnsCount: number;
  avgItemPrice: number;
  reverseLogisticsShippingCost: number;
  inspectionAndRestockingCost: number;
  // Lever 1: Return Prevention via Catalog Fixes
  preventionRate: number; // e.g. 22%
  // Lever 2: Exchange-over-Refund Incentives (+bonus credit)
  exchangeConversionRate: number; // e.g. 35%
  exchangeBonusCreditRate: number; // e.g. 10%
  grossProfitMargin: number; // e.g. 50%
  // Lever 3: Smart Keep-it / Micro-refund Arbitrage
  keepItItemValueThreshold: number; // e.g. $25
  keepItRefundPercentage: number; // e.g. 60%
  // Lever 4: Automated Grade & Recommerce / Open-Box Resale
  recommerceRecoveryRate: number; // e.g. 55% of original price
}

export interface ProfitabilityBreakdown {
  baselineTotalLoss: number;
  preventionSavings: number;
  exchangeRetainedMargin: number;
  keepItLogisticsSaved: number;
  recommerceResaleRecovered: number;
  newOptimizedOutcome: number;
  netTurnaroundGain: number;
  netTurnaroundPercentage: number;
  preventedUnits: number;
  exchangedUnits: number;
  keepItUnits: number;
  recommerceUnits: number;
}
