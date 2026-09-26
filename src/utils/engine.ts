import { CloudResource, AccountScanSummary } from '../types/cloudsweep';

export function calculateScanSummary(
  resources: CloudResource[],
  accountName = 'AWS Production & Staging Core',
  accountId = 'acct-8188-4466-3739'
): AccountScanSummary {
  const totalScanned = resources.length;
  const flaggedItems = resources.filter((r) => r.detection.flagged && r.actionState !== 'terminated');
  const highConfidenceItems = flaggedItems.filter((r) => r.detection.confidence === 'high');
  const needsReviewItems = flaggedItems.filter((r) => r.detection.confidence === 'needs_review');
  const reviewedNotFlagged = resources.filter((r) => !r.detection.flagged);
  
  const totalMonthlyWaste = flaggedItems.reduce((acc, r) => acc + r.billing.monthlyCost, 0);
  const highConfidenceMonthlyWaste = highConfidenceItems.reduce((acc, r) => acc + r.billing.monthlyCost, 0);
  const needsReviewMonthlyWaste = needsReviewItems.reduce((acc, r) => acc + r.billing.monthlyCost, 0);
  const dataGapsIdentified = resources.filter((r) => !r.billing.billingConfirmed || !!r.billing.dataGapNotice).length;

  return {
    accountName,
    accountId,
    provider: 'aws',
    scannedAt: new Date().toISOString(),
    totalScanned,
    totalFlagged: flaggedItems.length,
    totalMonthlyWaste: Math.round(totalMonthlyWaste * 100) / 100,
    highConfidenceCount: highConfidenceItems.length,
    highConfidenceMonthlyWaste: Math.round(highConfidenceMonthlyWaste * 100) / 100,
    needsReviewCount: needsReviewItems.length,
    needsReviewMonthlyWaste: Math.round(needsReviewMonthlyWaste * 100) / 100,
    reviewedNotFlaggedCount: reviewedNotFlagged.length,
    dataGapsIdentified,
  };
}

/**
 * Returns prioritized teardown plan:
 * High-confidence flagged items ordered strictly by monthly cost descending.
 */
export function getPrioritizedTeardownPlan(resources: CloudResource[]): CloudResource[] {
  return resources
    .filter((r) => r.detection.status === 'flagged_high_confidence' && r.actionState !== 'terminated')
    .sort((a, b) => b.billing.monthlyCost - a.billing.monthlyCost);
}

/**
 * Returns items requiring human investigation before any decision
 */
export function getNeedsReviewItems(resources: CloudResource[]): CloudResource[] {
  return resources
    .filter((r) => r.detection.status === 'flagged_needs_review' && r.actionState !== 'terminated')
    .sort((a, b) => b.billing.monthlyCost - a.billing.monthlyCost);
}

/**
 * Returns resources that were evaluated against thresholds and cleared
 */
export function getReviewedNotFlaggedItems(resources: CloudResource[]): CloudResource[] {
  return resources.filter((r) => r.detection.status === 'reviewed_not_flagged');
}

/**
 * Generates the strictly ordered 4-part autonomous output text demanded by the system prompt:
 * 1. Summary — total resources scanned, total flagged, total monthly waste found.
 * 2. Per-resource breakdown — resource ID, type, reason flagged, monthly cost, confidence (high / needs review).
 * 3. Prioritized teardown plan — ordered by cost, highest first.
 * 4. Needs-review items — listed separately, with the reason they weren't included in the standard recommendation.
 */
export function generateAutonomousOutput(
  resources: CloudResource[],
  summary: AccountScanSummary
): string {
  const flagged = resources.filter((r) => r.detection.flagged && r.actionState !== 'terminated');
  const teardownPlan = getPrioritizedTeardownPlan(resources);
  const needsReview = getNeedsReviewItems(resources);

  // 1. Summary
  let output = `## 1. Summary
- **Total Resources Scanned:** ${summary.totalScanned}
- **Total Flagged for Waste:** ${summary.totalFlagged} (${summary.highConfidenceCount} high-confidence, ${summary.needsReviewCount} needs-review)
- **Total Monthly Waste Found:** $${summary.totalMonthlyWaste.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month
- **Immediate High-Confidence Recoverable:** $${summary.highConfidenceMonthlyWaste.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month
- **Reviewed & Cleared (Not Flagged):** ${summary.reviewedNotFlaggedCount} resources verified active against thresholds
${summary.dataGapsIdentified > 0 ? `- **Data Gaps / Incomplete Telemetry:** ${summary.dataGapsIdentified} notice(s) identified (reported transparently with no guesswork)` : ''}

`;

  // 2. Per-resource breakdown
  output += `## 2. Per-Resource Breakdown
| Resource ID | Type | Reason Flagged | Monthly Cost | Confidence |
| :--- | :--- | :--- | :---: | :---: |
`;

  flagged.forEach((r) => {
    const formattedType = r.resourceType.replace('_', ' ');
    const cost = `$${r.billing.monthlyCost.toFixed(2)}`;
    const conf = r.detection.confidence === 'high' ? 'High' : 'Needs Review';
    output += `| \`${r.id}\` | ${formattedType} | ${r.detection.evidenceReason} | ${cost} | **${conf}** |\n`;
  });

  // 3. Prioritized teardown plan
  output += `\n## 3. Prioritized Teardown Plan (Ordered by Cost, Highest First)
*Safety Notice: No termination will execute automatically. Every action below is gated on explicit human operator approval.*\n\n`;

  teardownPlan.forEach((r, idx) => {
    const formattedType = r.resourceType.replace('_', ' ').toUpperCase();
    output += `**${idx + 1}. \`${r.id}\` (${r.name})**\n`;
    output += `   - **Resource Type:** ${formattedType} (${r.specSummary})\n`;
    output += `   - **Monthly Waste:** $${r.billing.monthlyCost.toFixed(2)}/mo (${r.billing.pricingFormula})\n`;
    output += `   - **Specific Evidence:** ${r.detection.evidenceReason}\n`;
    output += `   - **Blast Radius Check:** ${r.detection.blastRadiusAnalysis}\n`;
    output += `   - **Approval Status:** ${r.actionState === 'approved' ? 'Approved by Operator' : r.actionState === 'denied' ? 'Preserved (Denied by Operator)' : 'Awaiting Explicit Human Approval'}\n\n`;
  });

  // 4. Needs-review items
  output += `## 4. Needs-Review Items (Plausible In-Use Exclusions)
The following resources met statistical detection criteria but exhibit indicators of legitimate periodic, seasonal, or standby usage. They have been excluded from the automated teardown recommendation to prevent operational downtime.\n\n`;

  needsReview.forEach((r, idx) => {
    output += `**${idx + 1}. \`${r.id}\` (${r.name})**\n`;
    output += `   - **Resource Type:** ${r.resourceType.replace('_', ' ')} · $${r.billing.monthlyCost.toFixed(2)}/mo\n`;
    output += `   - **Why Excluded From Standard Plan:** ${r.detection.needsReviewReason || r.detection.evidenceReason}\n`;
    output += `   - **Recommended Next Step:** Investigate tagged owner or schedule lifecycle exemption before any teardown.\n\n`;
  });

  return output;
}
