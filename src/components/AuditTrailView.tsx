import React from 'react';
import { CloudResource } from '../types/cloudsweep';
import { ShieldCheck, Lock, CheckCircle2, XCircle, Clock, Server, FileText } from 'lucide-react';

interface AuditTrailViewProps {
  resources: CloudResource[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ resources }) => {
  // Aggregate all audit logs across all resources
  const allEvents = resources.flatMap((r) =>
    r.auditLog.map((log) => ({
      ...log,
      resourceId: r.id,
      resourceName: r.name,
      resourceType: r.resourceType,
      monthlyCost: r.billing.monthlyCost,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Security &amp; Action Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all autonomous findings, operator authorizations, snapshot creations, and preserved resources.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Gating Audit Active</span>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-4">
        {allEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No administrative or execution actions recorded yet. All resources remain intact.
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 space-y-6 pl-6 py-2">
            {allEvents.map((evt, idx) => {
              const isApproval = evt.action.toLowerCase().includes('authorized') || evt.action.toLowerCase().includes('terminated');
              const isDenial = evt.action.toLowerCase().includes('denied') || evt.action.toLowerCase().includes('preserved');

              return (
                <div key={idx} className="relative group text-xs">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                      isApproval
                        ? 'bg-rose-500'
                        : isDenial
                        ? 'bg-slate-400'
                        : 'bg-cyan-500'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{evt.action}</span>
                      <span className="font-mono text-cyan-400">[{evt.resourceId}]</span>
                      <span className="text-slate-400">({evt.resourceName})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-1 text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                    {evt.details}
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500 font-mono flex items-center gap-3">
                    <span>Operator: <strong className="text-slate-300">{evt.operator}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Monthly Impact: <strong className="text-rose-400">${evt.monthlyCost.toFixed(2)}/mo</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
