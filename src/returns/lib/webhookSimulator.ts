import type { ReturnLog } from './types';
import { classifyCustomerFeedback } from './classifier';

export const SAMPLE_RETURN_LOGS: ReturnLog[] = [
  {
    id: 'RET-8902',
    sku: 'APP-XL-BLU-2026',
    productName: 'Slim-Fit Linen Blend Oxford Shirt',
    customerFeedback: 'Item runs way smaller than size chart. Fabric is very tight around shoulders and chest.',
    category: 'Sizing / Fit Discrepancy',
    originalListingCopy: 'Tailored regular cut. Fits true to standard US men sizing. 100% fine woven linen blend.',
    suggestedFix: "Add prominent banner: 'Runs 1 size small. Recommend ordering 1 size up.' Adjust chest & shoulder dimensions in sizing guide by -1.5 inches.",
    confidenceScore: 0.948,
    priority: 'P1',
    status: 'Pending',
    timestamp: '10 mins ago',
    marketplace: 'amazon',
    itemValue: 74,
    returnCost: 12.5,
    customerIntent: 'exchange',
    resolutionMode: 'exchanged',
  },
  {
    id: 'RET-8898',
    sku: 'TSH-M-BLK-1002',
    productName: 'Heavyweight Premium Crewneck Tee',
    customerFeedback: 'White version is partially see-through in sunlight. Not 240 GSM as advertised in listing.',
    category: 'Material Quality Drift',
    originalListingCopy: 'Ultra-dense 240 GSM heavyweight combed cotton. Completely opaque in all lighting.',
    suggestedFix: "Update bullet point 2: 'Lightweight breathable weave (180 GSM).' Flag supplier batch #B-402 for fabric weight compliance audit.",
    confidenceScore: 0.912,
    priority: 'P2',
    status: 'Pending',
    timestamp: '42 mins ago',
    marketplace: 'flipkart',
    itemValue: 32,
    returnCost: 11.0,
    customerIntent: 'keep_discount',
    resolutionMode: 'keep_item',
  },
  {
    id: 'RET-8874',
    sku: 'HOM-OAK-TAB-09',
    productName: 'Minimalist Solid Oak Coffee Table',
    customerFeedback: 'Assembly hardware was missing 4 M8 bolts. Diagram did not list tool requirements or clear leg alignment.',
    category: 'Missing Assembly Spec',
    originalListingCopy: 'Tool-free 10-minute setup. Includes all structural hardware for living room installation.',
    suggestedFix: "Upload revised PDF assembly guide v2.1 with complete hardware checklist. Add notice: 'Requires Allen Wrench (Included) & Hex Key'.",
    confidenceScore: 0.935,
    priority: 'P3',
    status: 'Pushed to Linear',
    timestamp: '2 hours ago',
    marketplace: 'shopify',
    itemValue: 240,
    returnCost: 38.0,
    customerIntent: 'refund',
    resolutionMode: 'recommerce',
    ticketUrl: 'https://linear.app/marketplace-eng/issue/ENG-CAT-418',
    ticketIdentifier: 'ENG-CAT-418',
  },
  {
    id: 'RET-8861',
    sku: 'DEN-32-IND-884',
    productName: 'Selvedge Raw Indigo Slim Denim Jeans',
    customerFeedback: 'Color in listing photos looks deep royal navy, but received denim is dull dark grey-black with strange chemical odor.',
    category: 'Misleading Listing Image',
    originalListingCopy: 'Brilliant deep indigo wash captured under daylight. Pre-shrunk with organic plant-based wash.',
    suggestedFix: 'Replace hero studio photos with true-color natural light photography. State note: Raw indigo appears deeper charcoal indoors before first wash.',
    confidenceScore: 0.895,
    priority: 'P2',
    status: 'Pending',
    timestamp: '3 hours ago',
    marketplace: 'amazon',
    itemValue: 115,
    returnCost: 14.5,
    customerIntent: 'exchange',
    resolutionMode: 'exchanged',
  },
  {
    id: 'RET-8849',
    sku: 'KID-BLK-TOY-101',
    productName: 'Magnetic Building Tiles 100-Piece Set',
    customerFeedback: 'Tiles were smaller than expected and magnets feel weak when building towers over 3 stories tall.',
    category: 'Missing Assembly Spec',
    originalListingCopy: 'Giant builder edition. Mega strength neodymium magnets for towering castles.',
    suggestedFix: "Clarify individual tile dimensions: '3 inch x 3 inch squares'. Add stability notice: 'Base stabilization tiles recommended for builds exceeding 36 inches'.",
    confidenceScore: 0.88,
    priority: 'P3',
    status: 'Pending',
    timestamp: '5 hours ago',
    marketplace: 'flipkart',
    itemValue: 45,
    returnCost: 10.0,
    customerIntent: 'keep_discount',
    resolutionMode: 'keep_item',
  },
];

export const MOCK_NEW_FEEDBACK_POOL = [
  {
    sku: 'APP-M-GRN-304',
    productName: 'Merino Wool Ribbed Turtleneck Sweater',
    feedback: 'Shoulders fit okay but sleeves are 3 inches too short and wrists are extremely tight.',
    marketplace: 'shopify' as const,
    itemValue: 88,
  },
  {
    sku: 'KTC-SS-POT-55',
    productName: 'Tri-Ply Stainless Steel 6-Qt Sauté Pan',
    feedback: 'Handle gets burning hot on gas stove. Listing stated stay-cool ergonomic handle design.',
    marketplace: 'amazon' as const,
    itemValue: 69,
  },
  {
    sku: 'SHF-WAL-FLT-12',
    productName: 'Floating Walnut Wall Shelf 2-Pack',
    feedback: 'Drywall anchors snapped immediately during installation. Weight rating claims 40 lbs but barely holds 10 lbs.',
    marketplace: 'flipkart' as const,
    itemValue: 42,
  },
  {
    sku: 'ELE-ANC-PRO-9',
    productName: 'Wireless Active Noise Cancelling Earbuds',
    feedback: 'Ear tips are made of cheap silicone that irritates skin. Battery only lasts 3 hours instead of advertised 8 hours.',
    marketplace: 'amazon' as const,
    itemValue: 55,
  },
];

let nextIdCounter = 8905;

export function simulateIncomingWebhook(): ReturnLog {
  const template = MOCK_NEW_FEEDBACK_POOL[Math.floor(Math.random() * MOCK_NEW_FEEDBACK_POOL.length)];
  const classified = classifyCustomerFeedback(template.feedback, template.sku);

  const newLog: ReturnLog = {
    id: `RET-${nextIdCounter++}`,
    sku: template.sku,
    productName: template.productName,
    customerFeedback: template.feedback,
    category: classified.category,
    originalListingCopy: 'Standard seller listing description currently active in marketplace catalog.',
    suggestedFix: classified.suggestedFix,
    confidenceScore: classified.confidenceScore,
    priority: classified.priority,
    status: 'Pending',
    timestamp: 'Just now',
    marketplace: template.marketplace,
    itemValue: template.itemValue,
    returnCost: template.itemValue <= 25 ? 9.5 : 13.0,
    customerIntent: Math.random() > 0.5 ? 'exchange' : 'keep_discount',
    resolutionMode: Math.random() > 0.6 ? 'exchanged' : 'keep_item',
  };

  return newLog;
}

/**
 * Builds the exact Linear GraphQL mutation query payload
 */
export function buildLinearGraphQLPayload(log: ReturnLog, customFix?: string) {
  const fixToUse = customFix || log.suggestedFix;
  const title = `[Catalog Fix] [${log.category}] SKU: ${log.sku}`;
  const markdownDescription = `### 📦 Return Cause & Catalog Remediation Report

**SKU**: \`${log.sku}\`  
**Product**: ${log.productName}  
**Marketplace**: \`${log.marketplace.toUpperCase()}\`  
**Issue Category**: \`${log.category}\`  
**Priority Level**: ${log.priority}  
**AI Confidence**: ${(log.confidenceScore * 100).toFixed(1)}%  

#### 💬 Customer Feedback Signal
> "${log.customerFeedback}"

#### 🛠️ Recommended Listing / Copy Fix
${fixToUse}

---
*Auto-generated by Return Cause & Catalog Fix Generator*`;

  return {
    query: `mutation CreateIssue($teamId: String!, $title: String!, $description: String!, $priority: Int!) {
  issueCreate(input: {
    teamId: $teamId,
    title: $title,
    description: $description,
    priority: $priority
  }) {
    success
    issue {
      id
      identifier
      url
    }
  }
}`,
    variables: {
      teamId: "ENG-CAT-TEAM-UUID",
      title,
      description: markdownDescription,
      priority: log.priority === 'P1' ? 1 : log.priority === 'P2' ? 2 : 3,
    },
  };
}

/**
 * Builds the Jira REST API v3 payload with Atlassian Document Format (ADF)
 */
export function buildJiraAdfPayload(log: ReturnLog, customFix?: string) {
  const fixToUse = customFix || log.suggestedFix;
  return {
    fields: {
      project: { key: "CAT" },
      summary: `[Catalog Fix] [${log.category}] SKU: ${log.sku}`,
      issuetype: { name: "Bug" },
      priority: { name: log.priority === 'P1' ? 'High' : log.priority === 'P2' ? 'Medium' : 'Low' },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: `Automated Catalog Remediation for SKU: ${log.sku}` }],
          },
          {
            type: "blockquote",
            content: [{ type: "text", text: `Customer Signal: "${log.customerFeedback}"` }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: `Proposed Fix: ${fixToUse}` }],
          },
        ],
      },
    },
  };
}
