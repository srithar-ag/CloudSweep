import React from 'react';
import { CloudResource } from '../types/cloudsweep';
import { CheckCircle, Activity, Server, HardDrive, Network, Eye } from 'lucide-react';

interface ReviewedNotFlaggedTableProps {
  resources: CloudResource[];
  onSelectResource: (resource: CloudResource) => void;
}

export const ReviewedNotFlaggedTable: React.FC<ReviewedNotFlaggedTableProps> = ({
  resources,
  onSelectResource,
}) => {
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'compute_instance':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'storage_volume':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'load_balancer':
        return <Network className="w-4 h-4 text-emerald-400" />;
      default:
        return <Server className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-emerald-900/40 bg-slate-900/60 backdrop-blur-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Reviewed &amp; Active (Not Flagged)</h2>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
            {resources.length} Verified Healthy Resources
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          CloudSweep strictly evaluates telemetry against unambiguous thresholds. If a resource falls short of the threshold (e.g. CPU &ge; 5%, actively mounted volume, or healthy target registered), it is <strong>reported as reviewed, not flagged</strong> rather than guessing.
        </p>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
              <th className="py-3 px-4">Resource ID & Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Measured Evidence (Why Cleared)</th>
              <th className="py-3 px-4 text-right">Current Monthly Spend</th>
              <th className="py-3 px-4 text-right">Telemetry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {resources.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                {/* ID & Name */}
                <td className="py-3.5 px-4">
                  <div className="font-mono text-emerald-400 font-semibold">{item.id}</div>
                  <div className="text-slate-200 font-medium">{item.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {item.region} · {item.specSummary}
                  </div>
                </td>

                {/* Type */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    {getCategoryIcon(item.resourceType)}
                    <span className="capitalize">{item.resourceType.replace('_', ' ')}</span>
                  </div>
                </td>

                {/* Reason Cleared */}
                <td className="py-3.5 px-4 max-w-lg">
                  <div className="text-slate-200 font-normal leading-relaxed">
                    {item.detection.reviewedNotFlaggedReason || 'Passed all waste thresholds without deviation.'}
                  </div>
                  <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>In-Use Activity Verified</span>
                  </div>
                </td>

                {/* Monthly Spend */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="text-sm font-bold font-mono text-slate-300 tabular-nums">
                    ${item.billing.monthlyCost.toFixed(2)}/mo
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ${item.billing.hourlyRate.toFixed(3)}/hr
                  </div>
                </td>

                {/* Telemetry Inspect */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onSelectResource(item)}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title="View Telemetry Metrics"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
