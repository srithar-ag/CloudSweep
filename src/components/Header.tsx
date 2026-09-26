import React from 'react';
import { ShieldCheck, RefreshCw, Terminal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'plan' | 'needs_review' | 'reviewed' | 'report' | 'audit';
  setActiveTab: (tab: 'plan' | 'needs_review' | 'reviewed' | 'report' | 'audit') => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  needsReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onTriggerScan,
  isScanning,
  needsReviewCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-3.5 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveTab('plan'); }}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
        >
          CloudSweep
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-slate-500">
          autonomous cost-optimization agent
        </span>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('plan')}
          className={`transition-colors hover:text-white ${
            activeTab === 'plan' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'text-slate-400'
          }`}
        >
          Teardown Plan
        </button>

        <button
          onClick={() => setActiveTab('needs_review')}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${
            activeTab === 'needs_review' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'text-slate-400'
          }`}
        >
          Needs Review
          {needsReviewCount > 0 && (
            <span className="text-xs font-mono text-amber-300">
              ({needsReviewCount})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reviewed')}
          className={`transition-colors hover:text-white ${
            activeTab === 'reviewed' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400'
          }`}
        >
          Reviewed & Active
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${
            activeTab === 'report' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Autonomous Report
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${
            activeTab === 'audit' ? 'text-slate-200 font-semibold border-b-2 border-slate-200 pb-0.5' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Trail
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Telemetry...' : 'Run Agent Scan'}</span>
        </button>
      </div>
    </header>
  );
};
