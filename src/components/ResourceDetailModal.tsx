import React from 'react';
import { CloudResource } from '../types/cloudsweep';
import { X, Activity, DollarSign, Calendar, Server, HardDrive, Network, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ResourceDetailModalProps {
  resource: CloudResource | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: (resource: CloudResource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  onOpenApproval,
}) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-950/80 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              {resource.resourceType === 'compute_instance' && <Server className="w-6 h-6" />}
              {resource.resourceType === 'storage_volume' && <HardDrive className="w-6 h-6" />}
              {resource.resourceType === 'load_balancer' && <Network className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-cyan-300">{resource.id}</span>
                <span className="text-[11px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {resource.provider.toUpperCase()} · {resource.region}
                </span>
                {resource.detection.confidence === 'high' && (
                  <span className="text-[11px] font-mono bg-rose-950/80 border border-rose-800/80 text-rose-300 px-2 py-0.5 rounded">
                    High-Confidence Waste
                  </span>
                )}
                {resource.detection.confidence === 'needs_review' && (
                  <span className="text-[11px] font-mono bg-amber-950/80 border border-amber-800/80 text-amber-300 px-2 py-0.5 rounded">
                    Needs Review (Plausible In-Use)
                  </span>
                )}
                {!resource.detection.flagged && (
                  <span className="text-[11px] font-mono bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded">
                    Reviewed &amp; Active
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-1">{resource.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300 flex-1">
          {/* Cost Formula Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Actual Billing &amp; Pricing Calculation
              </span>
              <span className="text-lg font-bold font-mono text-rose-400">
                ${resource.billing.monthlyCost.toFixed(2)} / month
              </span>
            </div>
            <div className="bg-slate-900 rounded p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800">
              Formula: {resource.billing.pricingFormula}
            </div>
            {resource.billing.dataGapNotice && (
              <div className="mt-2 text-amber-300 text-[11px] bg-amber-950/40 border border-amber-800/60 p-2.5 rounded">
                <strong>Data Gap Notice:</strong> {resource.billing.dataGapNotice}
              </div>
            )}
          </div>

          {/* Compute 14-day Telemetry View */}
          {resource.computeMetrics && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  14-Day CPU Utilization Telemetry
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Threshold: &lt;5.0% · Measured Avg: <strong className="text-cyan-300">{resource.computeMetrics.cpuAverage14d}%</strong>
                </span>
              </div>

              {/* Sparkline Bar Chart */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex items-end gap-1.5 h-24 pt-4 px-1">
                  {resource.computeMetrics.cpuHistory14d.map((val, idx) => {
                    const heightPercent = Math.min(100, Math.max(10, (val / 50) * 100));
                    const isOverThreshold = val >= 5.0;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            isOverThreshold ? 'bg-emerald-500' : 'bg-cyan-500/80 group-hover:bg-cyan-400'
                          }`}
                        />
                        <span className="text-[9px] text-slate-500 font-mono">D{idx + 1}</span>
                        {/* Hover Tooltip */}
                        <div className="absolute -top-7 bg-slate-950 border border-slate-700 text-white text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                          {val}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span>Day -14</span>
                  <span className="text-amber-400">Idle Threshold line (5.0%)</span>
                  <span>Today (Day 0)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Peak 14-day CPU:</span>
                  <span className="font-mono font-bold text-slate-200">{resource.computeMetrics.cpuPeak14d}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Days Since Active Traffic:</span>
                  <span className="font-mono font-bold text-slate-200">{resource.computeMetrics.lastActivityDaysAgo} days</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Network Out (24h):</span>
                  <span className="font-mono font-bold text-slate-200">{resource.computeMetrics.lastNetworkBytesOut24h} bytes</span>
                </div>
              </div>
            </div>
          )}

          {/* Volume Metrics */}
          {resource.volumeMetrics && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 mb-3">
                <HardDrive className="w-4 h-4 text-purple-400" />
                Storage Attachment Lifecycle
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Attachment State:</span>
                  <span className={`font-mono font-bold ${resource.volumeMetrics.isAttached ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resource.volumeMetrics.isAttached ? 'Attached' : 'Unattached (Orphaned)'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Days Detached:</span>
                  <span className="font-mono font-bold text-white">{resource.volumeMetrics.daysDetached} days</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Allocated Size:</span>
                  <span className="font-mono font-bold text-white">{resource.volumeMetrics.sizeGB} GiB</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Provisioned IOPS:</span>
                  <span className="font-mono font-bold text-white">{resource.volumeMetrics.provisionedIops || 'Default'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Load Balancer Metrics */}
          {resource.loadBalancerMetrics && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 mb-3">
                <Network className="w-4 h-4 text-blue-400" />
                Load Balancer Target Group Telemetry
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Healthy Targets:</span>
                  <span className={`font-mono font-bold ${resource.loadBalancerMetrics.healthyTargetsCount === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {resource.loadBalancerMetrics.healthyTargetsCount} / {resource.loadBalancerMetrics.totalTargetsCount}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">14-Day Requests:</span>
                  <span className="font-mono font-bold text-white">{resource.loadBalancerMetrics.requestsReceived14d.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Days Zero Traffic:</span>
                  <span className="font-mono font-bold text-white">{resource.loadBalancerMetrics.daysWithZeroTraffic} days</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Listeners:</span>
                  <span className="font-mono font-bold text-white">{resource.loadBalancerMetrics.listenerPorts.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tag Metadata */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-xs font-semibold text-white block mb-2">Resource Tags</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {Object.entries(resource.tags).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-cyan-300 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>

          {resource.detection.flagged && resource.actionState !== 'terminated' && (
            <button
              onClick={() => {
                onClose();
                onOpenApproval(resource);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Open Safety Gate &amp; Authorize Action
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
