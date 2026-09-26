import React from 'react';
import { CloudResource } from '../types/cloudsweep';
import { AlertCircle, HelpCircle, Tag, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NeedsReviewTableProps {
  resources: CloudResource[];
  onSelectResource: (resource: CloudResource) => void;
  onExemptResource: (resource: CloudResource, reason: string) => void;
  onForceApproveStage: (resource: CloudResource) => void;
}

export const NeedsReviewTable: React.FC<NeedsReviewTableProps> = ({
  resources,
  onSelectResource,
  onExemptResource,
  onForceApproveStage,
}) => {
  return (
    <div className="rounded-xl border border-amber-900/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-amber-950/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Needs-Review Queue (Plausible In-Use Exclusions)</h2>
          <span className="text-xs font-mono text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
            {resources.length} Plausible Edge-Cases Excluded
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          These resources met initial criteria (e.g. &lt;5% CPU, unattached volume, or 0 targets), but show evidence of legitimate periodic or disaster recovery usage (e.g. recently detached during maintenance, scheduled batch tags, DR standby). They are <strong>safely excluded</strong> from the standard teardown plan to prevent outages.
        </p>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
              <th className="py-3 px-4">Resource & Tags</th>
              <th className="py-3 px-4">Detected Threshold Trigger</th>
              <th className="py-3 px-4">Why Excluded From Standard Plan</th>
              <th className="py-3 px-4 text-right">Potential Cost</th>
              <th className="py-3 px-4 text-right">Investigation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No resources currently in the needs-review queue.
                </td>
              </tr>
            ) : (
              resources.map((item) => {
                const isExempted = item.actionState === 'exempted';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isExempted ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Resource ID & Tags */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-amber-300 font-semibold">{item.id}</div>
                      <div className="text-slate-200 font-medium">{item.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-slate-400">
                        {Object.entries(item.tags).slice(0, 3).map(([key, val]) => (
                          <span key={key} className="font-mono text-slate-400">
                            {key}: <span className="text-slate-200">{val}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Trigger */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-300 bg-slate-800/60 px-2 py-1 rounded">
                        {item.detection.thresholdBreached}
                      </span>
                    </td>

                    {/* Why Excluded From Standard Plan */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="text-amber-200/90 font-medium leading-relaxed">
                        {item.detection.needsReviewReason || item.detection.evidenceReason}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Blast Radius: {item.detection.blastRadiusAnalysis}
                      </div>
                    </td>

                    {/* Monthly Cost */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="text-sm font-bold font-mono text-slate-200 tabular-nums">
                        ${item.billing.monthlyCost.toFixed(2)}/mo
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ${item.billing.hourlyRate.toFixed(3)}/hr
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectResource(item)}
                          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View Full Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isExempted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Exempted
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => onExemptResource(item, 'Tagged as verified periodic/standby workload')}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-600 transition-all text-xs cursor-pointer"
                              title="Tag as approved lifecycle exemption"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Tag Exemption</span>
                            </button>

                            <button
                              onClick={() => onForceApproveStage(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all text-xs font-semibold cursor-pointer"
                              title="Operator confirms this is indeed waste despite tags"
                            >
                              <span>Stage for Teardown</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
