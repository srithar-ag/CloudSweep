import React, { useState } from 'react';
import { CloudResource, AccountScanSummary } from '../types/cloudsweep';
import { generateAutonomousOutput } from '../utils/engine';
import { Terminal, Copy, Check, Download, Send, Bot, ShieldAlert, Sparkles } from 'lucide-react';

interface AgentTerminalReportProps {
  resources: CloudResource[];
  summary: AccountScanSummary;
  onOpenResource: (resource: CloudResource) => void;
  onOpenApproval: (resource: CloudResource) => void;
}

export const AgentTerminalReport: React.FC<AgentTerminalReportProps> = ({
  resources,
  summary,
  onOpenResource,
  onOpenApproval,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw_markdown'>('formatted');
  const [userQuery, setUserQuery] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: `CloudSweep autonomous agent ready. I have completed the infrastructure sweep for ${summary.accountName} (${summary.accountId}).\n\n- Scanned: ${summary.totalScanned} resources\n- Flagged Waste: ${summary.totalFlagged} ($${summary.totalMonthlyWaste.toFixed(2)}/mo)\n- Safety Gating: Active. All teardown actions require explicit operator sign-off.\n\nYou may ask me to justify any flag, query blast radius, or clarify needs-review exclusions.`,
    },
  ]);

  const rawOutput = generateAutonomousOutput(resources, summary);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([rawOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudsweep-teardown-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    setUserQuery('');

    // Append user message
    const newChat = [...chatLog, { role: 'user' as const, text: query }];
    setChatLog(newChat);

    // Formulate autonomous agent response grounded in real data and strict rules
    setTimeout(() => {
      let agentReply = '';
      const lower = query.toLowerCase();

      if (lower.includes('why') && (lower.includes('quarterly') || lower.includes('fintech') || lower.includes('i-0b553e1f893d39aa1'))) {
        agentReply = `**Resource \`i-0b553e1f893d39aa1\` (financial-quarterly-ledger-aggregator)**:\n\nAlthough average CPU is 3.2% (under our 5.0% threshold), it is explicitly excluded from the standard teardown plan because of its tags: \`Schedule: quarterly-reconciliation-run\` and \`SeasonalTag: q3-close-active\`. In accordance with our reasoning guidelines, any resource with plausible scheduled usage must be placed in **Needs Review** rather than proposed for termination to avoid quarter-end accounting disruptions.`;
      } else if (lower.includes('vol-078a9c4021ef3381a') || (lower.includes('bluegreen') || lower.includes('cache'))) {
        agentReply = `**Volume \`vol-078a9c4021ef3381a\` (prod-api-cache-vol-bluegreen)**:\n\nWhile unattached, this volume was detached only 14 hours ago during blue-green deployment v2026.38.2. Under CloudSweep detection principles, recently detached storage (<24 hours) may represent active rollback reserves. It is placed in **Needs Review** for 48 hours.`;
      } else if (lower.includes('highest') || lower.includes('expensive') || lower.includes('top')) {
        const topItem = [...resources].sort((a, b) => b.billing.monthlyCost - a.billing.monthlyCost)[0];
        agentReply = `The highest monthly waste item is **\`${topItem.id}\` (${topItem.name})** incurring **$${topItem.billing.monthlyCost.toFixed(2)}/mo** ($${(topItem.billing.monthlyCost * 12).toFixed(2)}/yr).\n\nEvidence: ${topItem.detection.evidenceReason}.\nSafety notice: Hard approval rule applies. No deletion will occur without your explicit confirmation.`;
      } else if (lower.includes('rule') || lower.includes('approval') || lower.includes('delete')) {
        agentReply = `**CloudSweep Hard Approval Rule**:\n"Any tool call that terminates, deletes, or otherwise modifies a live resource requires explicit human approval before execution, with no exceptions, regardless of detection confidence."\n\nI will never delete a resource unapproved. If you deny approval, I immediately preserve the resource and log your decision in the tamper-evident audit log.`;
      } else if (lower.includes('data gap') || lower.includes('honest') || lower.includes('missing')) {
        agentReply = `**Honesty Telemetry Policy**:\nIf billing or CloudWatch metrics are incomplete or API timeouts occur, CloudSweep states this transparently rather than guessing.\n\nExample: \`i-0ff3a19bc89231a4e\` has an unverified private enterprise discount tier. We explicitly report this data gap while displaying standard public rates ($1,185.52/mo) with a disclaimer.`;
      } else {
        agentReply = `Understood. I have evaluated ${summary.totalScanned} resources against unambiguous thresholds:\n\n- Idle Instances (<5% 14d CPU avg)\n- Orphaned Volumes (unattached to any running instance)\n- Forgotten Load Balancers (zero healthy targets)\n\nTotal monthly waste identified is **$${summary.totalMonthlyWaste.toFixed(2)}/mo**. To execute any item from the prioritized teardown plan, please use the Safety Gated Action button in the Teardown Plan tab.`;
      }

      setChatLog([...newChat, { role: 'agent' as const, text: agentReply }]);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Run Report Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Autonomous Agent Executive Run Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generated according to required 4-part specification: Summary, Per-Resource Breakdown, Prioritized Teardown Plan, Needs-Review Exclusions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'formatted' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setViewMode('raw_markdown')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'raw_markdown' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Markdown
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      {viewMode === 'raw_markdown' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {rawOutput}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="font-mono text-cyan-400">1.</span> Executive Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Total Scanned:</span>
                <div className="text-xl font-bold font-mono text-white mt-1">{summary.totalScanned} resources</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Total Flagged Waste:</span>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">{summary.totalFlagged} items</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Total Monthly Waste:</span>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">${summary.totalMonthlyWaste.toFixed(2)}/mo</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Active Cleared (Passed):</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.reviewedNotFlaggedCount} resources</div>
              </div>
            </div>
          </div>

          {/* Section 2: Per-Resource Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="font-mono text-cyan-400">2.</span> Per-Resource Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="py-2.5 px-3">Resource ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Reason Flagged</th>
                    <th className="py-2.5 px-3 text-right">Monthly Cost</th>
                    <th className="py-2.5 px-3 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {resources
                    .filter((r) => r.detection.flagged && r.actionState !== 'terminated')
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">{r.id}</td>
                        <td className="py-2.5 px-3 capitalize text-slate-300">{r.resourceType.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-sm">{r.detection.evidenceReason}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400 tabular-nums">
                          ${r.billing.monthlyCost.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span
                            className={
                              r.detection.confidence === 'high'
                                ? 'text-cyan-400 font-semibold'
                                : 'text-amber-400 font-semibold'
                            }
                          >
                            {r.detection.confidence === 'high' ? 'High' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Prioritized Teardown Plan */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="font-mono text-cyan-400">3.</span> Prioritized Teardown Plan (Ordered by Cost, Highest First)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Safety Rule: Requires Explicit Approval
              </span>
            </div>

            <div className="space-y-3">
              {resources
                .filter((r) => r.detection.status === 'flagged_high_confidence' && r.actionState !== 'terminated')
                .sort((a, b) => b.billing.monthlyCost - a.billing.monthlyCost)
                .map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-mono font-semibold text-cyan-300">{r.id}</span>
                        <span className="text-slate-300 font-medium">({r.name})</span>
                        <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {r.resourceType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1">
                        <strong>Evidence:</strong> {r.detection.evidenceReason}
                      </p>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                        Blast Radius: {r.detection.blastRadiusAnalysis}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-rose-400">
                          ${r.billing.monthlyCost.toFixed(2)}/mo
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {r.billing.pricingFormula.split('×')[0]}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenApproval(r)}
                        className="px-3 py-1.5 rounded bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all font-semibold text-xs cursor-pointer"
                      >
                        Authorize Action
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 4: Needs-Review Items */}
          <div className="rounded-xl border border-amber-900/50 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="font-mono text-amber-400">4.</span> Needs-Review Items (Plausible In-Use Exclusions)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Resources meeting statistical criteria but possessing indicators of seasonal, scheduled, or standby usage. Excluded from standard teardown recommendations.
            </p>

            <div className="space-y-3 text-xs">
              {resources
                .filter((r) => r.detection.status === 'flagged_needs_review' && r.actionState !== 'terminated')
                .map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-lg border border-amber-800/40 bg-slate-950/70 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">#{idx + 1}</span>
                        <span className="font-mono font-semibold text-amber-300">{r.id}</span>
                        <span className="text-slate-300 font-medium">({r.name})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-300">
                        ${r.billing.monthlyCost.toFixed(2)}/mo
                      </span>
                    </div>
                    <div className="mt-2 text-amber-200/90 text-[11px] leading-relaxed">
                      <strong>Why Excluded:</strong> {r.detection.needsReviewReason || r.detection.evidenceReason}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Agent Query Console */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Ask CloudSweep Agent
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Ground-truth queries on thresholds, blast radius, or exclusions
          </span>
        </div>

        <div className="h-40 overflow-y-auto space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono mb-3">
          {chatLog.map((msg, index) => (
            <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'text-cyan-300' : 'text-slate-300'}`}>
              <span className="text-slate-500 select-none">
                {msg.role === 'user' ? 'Operator>' : 'CloudSweep>'}
              </span>
              <div className="whitespace-pre-wrap flex-1">{msg.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendQuery} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask agent: e.g. 'Why was financial-quarterly-ledger-aggregator excluded?'"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
