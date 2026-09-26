import React from 'react';
import { Cloud, Shield, Sliders, CheckCircle2 } from 'lucide-react';
import { CloudProvider } from '../types/cloudsweep';

interface AccountContextBarProps {
  currentAccount: string;
  onSelectAccount: (acct: string) => void;
  provider: CloudProvider;
  cpuThreshold: number;
  onResetData: () => void;
}

export const AccountContextBar: React.FC<AccountContextBarProps> = ({
  currentAccount,
  onSelectAccount,
  provider,
  cpuThreshold,
  onResetData,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 mb-6 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm text-xs">
      {/* Account Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-medium">Target Account:</span>
          <select
            value={currentAccount}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="aws_prod">AWS Enterprise Core (8188-4466-3739)</option>
            <option value="gcp_staging">GCP Multi-Region Staging (gcp-infra-stg-01)</option>
            <option value="azure_corp">Azure Global Corp (sub-azure-902)</option>
          </select>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Unambiguous Detection Thresholds Status */}
        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">Detection Thresholds:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded font-mono text-cyan-300 border border-slate-800">
            Compute: 14d CPU &lt; {cpuThreshold}%
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded font-mono text-purple-300 border border-slate-800">
            Storage: Unattached Volumes
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded font-mono text-blue-300 border border-slate-800">
            LB: 0 Healthy Targets
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetData}
          className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
          title="Reset simulated environment to initial state"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
