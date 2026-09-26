import React from 'react';
import { AccountScanSummary } from '../types/cloudsweep';
import { DollarSign, AlertTriangle, Layers, ShieldAlert, AlertCircle } from 'lucide-react';

interface SummaryCardsProps {
  summary: AccountScanSummary;
  onFilterCategory?: (category: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Scanned */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Resources Scanned</span>
          <Layers className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-2xl font-bold font-mono text-white tabular-nums">
          {summary.totalScanned}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span>{summary.reviewedNotFlaggedCount} active verified</span>
          <span aria-hidden="true">·</span>
          <span>{summary.totalFlagged} flagged</span>
        </div>
      </div>

      {/* 2. Total Flagged */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Flagged Waste Items</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
          {summary.totalFlagged}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span className="text-cyan-400 font-mono font-medium">{summary.highConfidenceCount} high confidence</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-300 font-mono">{summary.needsReviewCount} needs review</span>
        </div>
      </div>

      {/* 3. Total Monthly Waste */}
      <div className="rounded-xl border border-rose-900/40 bg-slate-900/70 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
          <span>Total Monthly Waste</span>
          <DollarSign className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
          ${summary.totalMonthlyWaste.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span className="text-slate-300 font-mono">${summary.highConfidenceMonthlyWaste.toFixed(2)} actionable</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400 font-mono">${summary.needsReviewMonthlyWaste.toFixed(2)} in review</span>
        </div>
      </div>

      {/* 4. Safety Gating Hard Rule */}
      <div className="rounded-xl border border-emerald-900/40 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
          <span>Approval Policy</span>
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-sm font-semibold text-white mt-1">
          Strict Human Gating
        </div>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          Zero unapproved deletions. Every termination requires explicit human sign-off.
        </p>
      </div>

      {/* Incomplete Telemetry / Honesty Alert if present */}
      {summary.dataGapsIdentified > 0 && (
        <div className="col-span-full rounded-lg border border-amber-800/60 bg-amber-950/30 px-4 py-2.5 text-xs text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Honesty Notice:</strong> {summary.dataGapsIdentified} resource(s) have incomplete billing or CloudWatch telemetry. CloudSweep reports these transparently without inventing figures.
          </span>
        </div>
      )}
    </div>
  );
};
