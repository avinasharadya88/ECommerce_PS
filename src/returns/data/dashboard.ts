import type { HighSpikeSku, Marketplace, ReturnCategory, Timeframe } from "../lib/types";

export const SPIKE_ALERTS: HighSpikeSku[] = [
  {
    sku: "APP-XL-BLU-2026",
    productName: "Slim-Fit Linen Blend Oxford Shirt",
    category: "Apparel",
    returnSpikePercent: 180,
    totalReturns: 218,
    primaryDriver: "Sizing discrepancy: 84% cite tight shoulder cut & narrow chest spec.",
    complaintQuote: "Runs way smaller than size chart, fabric tight around shoulders.",
    preventableRate: 85,
    potentialAnnualSavings: 28400,
    badge: "Critical",
    marketplace: "amazon",
  },
  {
    sku: "DEN-32-IND-884",
    productName: "Selvedge Raw Indigo Slim Denim Jeans",
    category: "Apparel",
    returnSpikePercent: 95,
    totalReturns: 142,
    primaryDriver: "Color drift: received denim looks dark charcoal instead of royal indigo.",
    complaintQuote: "Color in listing photos looks royal navy, but received dull dark charcoal.",
    preventableRate: 78,
    potentialAnnualSavings: 16800,
    badge: "Warning",
    marketplace: "amazon",
  },
  {
    sku: "HOM-OAK-TAB-09",
    productName: "Minimalist Solid Oak Coffee Table",
    category: "Home & Furniture",
    returnSpikePercent: 115,
    totalReturns: 96,
    primaryDriver: "Missing assembly hardware: 4 M8 bolts missing & diagram unclear.",
    complaintQuote: "Assembly hardware missing bolts and no tool checklist included.",
    preventableRate: 92,
    potentialAnnualSavings: 22500,
    badge: "Investigate",
    marketplace: "shopify",
  },
];

export const BASE_SIGNAL_COUNTS: Record<Exclude<Marketplace, "all">, Record<ReturnCategory, number>> = {
  amazon: { "Sizing / Fit Discrepancy": 268, "Material Quality Drift": 132, "Misleading Listing Image": 121, "Missing Assembly Spec": 54, "Pricing & Promotion Drift": 45 },
  flipkart: { "Sizing / Fit Discrepancy": 183, "Material Quality Drift": 137, "Misleading Listing Image": 73, "Missing Assembly Spec": 42, "Pricing & Promotion Drift": 25 },
  shopify: { "Sizing / Fit Discrepancy": 105, "Material Quality Drift": 85, "Misleading Listing Image": 47, "Missing Assembly Spec": 74, "Pricing & Promotion Drift": 29 },
};

export const TIMEFRAME_MULTIPLIER: Record<Timeframe, number> = { "7d": 1, "30d": 4.1, "90d": 12.7 };

export const CATEGORY_META: Record<ReturnCategory, { color: string; description: string }> = {
  "Sizing / Fit Discrepancy": { color: "var(--chart-1)", description: "Runs small/large, tight shoulders, incorrect size charts." },
  "Material Quality Drift": { color: "var(--chart-2)", description: "Fabric weight deviation, loose threading, texture complaints." },
  "Misleading Listing Image": { color: "var(--chart-3)", description: "Color mismatch under real lighting, props not included." },
  "Missing Assembly Spec": { color: "var(--chart-4)", description: "Missing dimensions, bolt checklist omission, unclear manuals." },
  "Pricing & Promotion Drift": { color: "var(--chart-5)", description: "Bundle or promotion terms differ from buyer expectations." },
};

export const CHANNEL_META: Record<Exclude<Marketplace, "all">, { label: string; className: string }> = {
  amazon: { label: "Amazon", className: "text-amazon border-amazon/30 bg-amazon/10" },
  flipkart: { label: "Flipkart", className: "text-flipkart border-flipkart/30 bg-flipkart/10" },
  shopify: { label: "Shopify", className: "text-shopify border-shopify/30 bg-shopify/10" },
};

/** Weekly return-volume trend used by the sparkline/area chart. */
export const WEEKLY_TREND = [
  { week: "W1", returns: 1420, prevented: 180 },
  { week: "W2", returns: 1510, prevented: 240 },
  { week: "W3", returns: 1655, prevented: 310 },
  { week: "W4", returns: 1590, prevented: 395 },
  { week: "W5", returns: 1480, prevented: 460 },
  { week: "W6", returns: 1390, prevented: 520 },
  { week: "W7", returns: 1305, prevented: 590 },
  { week: "W8", returns: 1240, prevented: 640 },
];
