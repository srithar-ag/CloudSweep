import React, { useState } from 'react';
import { CloudResource } from '../types/cloudsweep';
import { Server, HardDrive, Network, Shield, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface PrioritizedTeardownTableProps {
  resources: CloudResource[];
  onSelectResource: (resource: CloudResource) => void;
  onInitiateApproval: (resource: CloudResource) => void;
}

export const PrioritizedTeardownTable: React.FC<PrioritizedTeardownTableProps> = ({
  resources,
  onSelectResource,
  onInitiateApproval,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = resources
    .filter((r) => {
      if (filterType !== 'all' && r.resourceType !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(query) ||
          r.name.toLowerCase().includes(query) ||
          r.detection.evidenceReason.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.billing.monthlyCost - a.billing.monthlyCost);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'compute_instance':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'storage_volume':
        return <HardDrive className="w-4 h-4 text-purple-400" />;
      case 'load_balancer':
        return <Network className="w-4 h-4 text-blue-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'compute_instance':
        return 'Idle Compute (<5% CPU)';
      case 'storage_volume':
        return 'Orphaned Volume';
      case 'load_balancer':
        return 'Forgotten LB (0 Targets)';
      default:
        return type;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Prioritized Teardown Plan</h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              Ordered by Monthly Cost (Highest First)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            High-confidence waste exceeding unambiguous thresholds. Requires human approval before modification.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Waste ({resources.length})
            </button>
            <button
              onClick={() => setFilterType('compute_instance')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'compute_instance' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Compute
            </button>
            <button
              onClick={() => setFilterType('storage_volume')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'storage_volume' ? 'bg-slate-800 text-purple-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Volumes
            </button>
            <button
              onClick={() => setFilterType('load_balancer')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'load_balancer' ? 'bg-slate-800 text-blue-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Load Balancers
            </button>
          </div>

          <input
            type="text"
            placeholder="Search ID, tag, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-44"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Resource & Specs</th>
              <th className="py-3 px-4">Waste Category</th>
              <th className="py-3 px-4">Specific Unambiguous Evidence</th>
              <th className="py-3 px-4 text-right">Monthly Waste</th>
              <th className="py-3 px-4 text-center">Approval State</th>
              <th className="py-3 px-4 text-right">Human Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No high-confidence flagged resources matching current filters.
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const isTerminated = item.actionState === 'terminated';
                const isDenied = item.actionState === 'denied';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isTerminated ? 'opacity-40 line-through' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      #{index + 1}
                    </td>

                    {/* Resource ID & Specs */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                        {item.id}
                        {item.billing.dataGapNotice && (
                          <span
                            title={item.billing.dataGapNotice}
                            className="text-amber-400 cursor-help"
                          >
                            *
                          </span>
                        )}
                      </div>
                      <div className="text-slate-300 font-medium truncate max-w-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.region} · {item.specSummary}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {getCategoryIcon(item.resourceType)}
                        <span>{getCategoryLabel(item.resourceType)}</span>
                      </div>
                    </td>

                    {/* Specific Evidence */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-slate-200 leading-snug font-normal">
                        {item.detection.evidenceReason}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Rule: {item.detection.thresholdBreached}
                      </div>
                    </td>

                    {/* Monthly Cost */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                        ${item.billing.monthlyCost.toFixed(2)}/mo
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ${item.billing.hourlyRate.toFixed(3)}/hr
                      </div>
                    </td>

                    {/* Approval State */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isTerminated ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Terminated
                        </span>
                      ) : isDenied ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Preserved (Denied)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300/90 font-medium text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Awaiting Sign-off
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectResource(item)}
                          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Inspect Telemetry & Evidence"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isTerminated && !isDenied && (
                          <button
                            onClick={() => onInitiateApproval(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                            title="Review Safety Gate & Grant Explicit Approval"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Approve Teardown</span>
                          </button>
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

      {/* Footer Note */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            <strong>Hard Rule Enforced:</strong> CloudSweep cannot execute deletions autonomously without operator authorization.
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Total Flagged: {filtered.length} resources
        </span>
      </div>
    </div>
  );
};
