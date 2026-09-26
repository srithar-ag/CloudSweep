import React, { useState } from 'react';
import { CloudResource } from '../types/cloudsweep';
import { ShieldAlert, AlertTriangle, CheckCircle, X, Camera, DollarSign, Lock } from 'lucide-react';

interface HumanApprovalModalProps {
  resource: CloudResource | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (resourceId: string, operatorNotes: string, createSnapshot: boolean, operatorEmail: string) => void;
  onDeny: (resourceId: string, reason: string, operatorEmail: string) => void;
  defaultOperatorEmail?: string;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  resource,
  isOpen,
  onClose,
  onApprove,
  onDeny,
  defaultOperatorEmail = 'sritharag17@gmail.com',
}) => {
  const [operatorEmail, setOperatorEmail] = useState(defaultOperatorEmail);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [createSnapshot, setCreateSnapshot] = useState(true);
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !resource) return null;

  const handleApproveExecution = () => {
    if (!hasConfirmedCheckbox) return;
    setIsProcessing(true);
    setTimeout(() => {
      onApprove(resource.id, operatorNotes, createSnapshot, operatorEmail);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  const handleDenyExecution = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onDeny(resource.id, operatorNotes || 'Operator denied termination; preserved resource intact.', operatorEmail);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-900/60 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="border-b border-rose-900/40 bg-gradient-to-r from-rose-950/70 to-slate-900 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                  Safety-Gated Action Gate
                </span>
                <span className="text-[11px] font-mono bg-rose-950 border border-rose-800 text-rose-300 px-2 py-0.5 rounded">
                  HARD RULE ENFORCED
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Explicit Human Approval Required
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Target Resource Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Target Resource</span>
                <div className="text-sm font-bold font-mono text-cyan-300">{resource.id}</div>
                <div className="text-xs font-medium text-slate-200">{resource.name}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase font-mono text-[10px]">Monthly Recovery</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  +${resource.billing.monthlyCost.toFixed(2)}/mo
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ${(resource.billing.monthlyCost * 12).toFixed(2)}/yr run-rate
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
              <div>
                <span className="text-slate-500">Resource Type:</span>
                <div className="font-semibold text-slate-200 capitalize">
                  {resource.resourceType.replace('_', ' ')} ({resource.specSummary})
                </div>
              </div>
              <div>
                <span className="text-slate-500">Cloud Region:</span>
                <div className="font-semibold text-slate-200 font-mono">
                  {resource.provider.toUpperCase()} / {resource.region}
                </div>
              </div>
            </div>
          </div>

          {/* Specific Evidence */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Autonomous Finding &amp; Evidence
            </h4>
            <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800">
              {resource.detection.evidenceReason}
            </p>
            <div className="mt-2 text-slate-400 text-[11px]">
              <strong>Blast Radius Check:</strong> {resource.detection.blastRadiusAnalysis}
            </div>
          </div>

          {/* Safety Options */}
          {resource.resourceType === 'storage_volume' && (
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={createSnapshot}
                onChange={(e) => setCreateSnapshot(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Create Pre-Deletion Snapshot (Recommended)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Creates an immutable point-in-time EBS snapshot before issuing volume deletion, allowing immediate zero-loss restoration if ever required.
                </div>
              </div>
            </label>
          )}

          {/* Operator Audit Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Authorizing Operator Email (Audit Log Record)
              </label>
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Optional Change Request / Ticket Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Approved via Jira SRE-1094 cost remediation sprint"
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Checkbox Gating */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 rounded border-rose-700 text-rose-600 focus:ring-0"
              />
              <div className="text-[11px] leading-tight">
                <strong>I hereby explicitly grant authorization</strong> to decommission{' '}
                <span className="font-mono text-white underline">{resource.id}</span>. I confirm that I have reviewed the 14-day telemetry and agree this resource is abandoned waste.
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDenyExecution}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Deny Action (Preserve Untouched)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveExecution}
              disabled={!hasConfirmedCheckbox || isProcessing}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Executing API Call...' : 'Confirm & Execute Teardown'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
