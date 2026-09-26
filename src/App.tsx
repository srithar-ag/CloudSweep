import React, { useState } from 'react';
import { INITIAL_RESOURCES } from './data/mockResources';
import { CloudResource } from './types/cloudsweep';
import { calculateScanSummary, getPrioritizedTeardownPlan, getNeedsReviewItems, getReviewedNotFlaggedItems } from './utils/engine';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AccountContextBar } from './components/AccountContextBar';
import { PrioritizedTeardownTable } from './components/PrioritizedTeardownTable';
import { NeedsReviewTable } from './components/NeedsReviewTable';
import { ReviewedNotFlaggedTable } from './components/ReviewedNotFlaggedTable';
import { AgentTerminalReport } from './components/AgentTerminalReport';
import { AuditTrailView } from './components/AuditTrailView';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { ResourceDetailModal } from './components/ResourceDetailModal';

export default function App() {
  const [resources, setResources] = useState<CloudResource[]>(INITIAL_RESOURCES);
  const [activeTab, setActiveTab] = useState<'plan' | 'needs_review' | 'reviewed' | 'report' | 'audit'>('plan');
  const [currentAccount, setCurrentAccount] = useState('aws_prod');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);

  // Modals state
  const [inspectedResource, setInspectedResource] = useState<CloudResource | null>(null);
  const [approvalTargetResource, setApprovalTargetResource] = useState<CloudResource | null>(null);

  // Summary calculation
  const summary = calculateScanSummary(
    resources,
    currentAccount === 'aws_prod'
      ? 'AWS Enterprise Core'
      : currentAccount === 'gcp_staging'
      ? 'GCP Multi-Region Staging'
      : 'Azure Global Corp',
    currentAccount === 'aws_prod'
      ? 'acct-8188-4466-3739'
      : currentAccount === 'gcp_staging'
      ? 'gcp-infra-stg-01'
      : 'sub-azure-902'
  );

  const teardownPlan = getPrioritizedTeardownPlan(resources);
  const needsReviewItems = getNeedsReviewItems(resources);
  const reviewedNotFlaggedItems = getReviewedNotFlaggedItems(resources);

  // Trigger an autonomous scan sequence
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanStatusMessage('Querying CloudWatch & Compute Engine telemetry APIs...');

    setTimeout(() => {
      setScanStatusMessage('Evaluating 14-day CPU averages (<5% threshold) & attachment maps...');
    }, 600);

    setTimeout(() => {
      setScanStatusMessage('Checking target group health probes & calculating billing formulas...');
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);
      setScanStatusMessage(null);
    }, 1700);
  };

  // Explicit Human Approval Handler (HARD RULE compliant)
  const handleApproveAction = (
    resourceId: string,
    operatorNotes: string,
    createSnapshot: boolean,
    operatorEmail: string
  ) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;

        const newLog = [
          ...r.auditLog,
          ...(createSnapshot && r.resourceType === 'storage_volume'
            ? [
                {
                  timestamp: new Date().toISOString(),
                  action: 'Pre-Deletion Snapshot Created',
                  operator: 'CloudSweep Safety Subsystem',
                  details: `Generated snapshot snap-${Math.random().toString(36).substring(2, 9)} for volume ${r.id} before termination. Zero data loss protection guaranteed.`,
                },
              ]
            : []),
          {
            timestamp: new Date().toISOString(),
            action: 'Explicit Operator Authorization Granted',
            operator: operatorEmail,
            details: `Termination executed with human approval. Notes: ${operatorNotes || 'Direct operator sign-off'}. Reclaimed $${r.billing.monthlyCost.toFixed(2)}/mo ($${(r.billing.monthlyCost * 12).toFixed(2)}/yr).`,
          },
        ];

        return {
          ...r,
          actionState: 'terminated' as const,
          operatorNotes,
          actionTimestamp: new Date().toISOString(),
          auditLog: newLog,
        };
      })
    );
  };

  // Explicit Human Denial Handler
  const handleDenyAction = (resourceId: string, reason: string, operatorEmail: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;

        return {
          ...r,
          actionState: 'denied' as const,
          operatorNotes: reason,
          actionTimestamp: new Date().toISOString(),
          auditLog: [
            ...r.auditLog,
            {
              timestamp: new Date().toISOString(),
              action: 'Action Explicitly Denied by Operator',
              operator: operatorEmail,
              details: `Operator rejected deletion proposal: "${reason}". Resource preserved untouched in cloud account.`,
            },
          ],
        };
      })
    );
  };

  // Exemption Tagging Handler
  const handleExemptResource = (resource: CloudResource, reason: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resource.id) return r;

        return {
          ...r,
          actionState: 'exempted' as const,
          tags: {
            ...r.tags,
            'CloudSweep:Exemption': 'Approved-Lifecycle-Exemption',
            'CloudSweep:ExemptionReason': reason,
          },
          auditLog: [
            ...r.auditLog,
            {
              timestamp: new Date().toISOString(),
              action: 'Exemption Tag Applied',
              operator: 'Operator',
              details: `Resource tagged with lifecycle exemption: "${reason}". Excluded from future waste sweeps.`,
            },
          ],
        };
      })
    );
  };

  const handleResetData = () => {
    setResources(INITIAL_RESOURCES);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Header compliant with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        needsReviewCount={needsReviewItems.length}
      />

      {/* Scanning status banner */}
      {scanStatusMessage && (
        <div className="bg-cyan-950/80 border-b border-cyan-800/80 px-6 py-2 text-xs font-mono text-cyan-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>{scanStatusMessage}</span>
          </div>
          <span className="text-cyan-500">Autonomous evaluation in progress</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Context bar with account selection & unambiguous thresholds */}
        <AccountContextBar
          currentAccount={currentAccount}
          onSelectAccount={setCurrentAccount}
          provider="aws"
          cpuThreshold={5.0}
          onResetData={handleResetData}
        />

        {/* 1. Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Primary View Router */}
        {activeTab === 'plan' && (
          <PrioritizedTeardownTable
            resources={teardownPlan}
            onSelectResource={(r) => setInspectedResource(r)}
            onInitiateApproval={(r) => setApprovalTargetResource(r)}
          />
        )}

        {activeTab === 'needs_review' && (
          <NeedsReviewTable
            resources={needsReviewItems}
            onSelectResource={(r) => setInspectedResource(r)}
            onExemptResource={handleExemptResource}
            onForceApproveStage={(r) => setApprovalTargetResource(r)}
          />
        )}

        {activeTab === 'reviewed' && (
          <ReviewedNotFlaggedTable
            resources={reviewedNotFlaggedItems}
            onSelectResource={(r) => setInspectedResource(r)}
          />
        )}

        {activeTab === 'report' && (
          <AgentTerminalReport
            resources={resources}
            summary={summary}
            onOpenResource={(r) => setInspectedResource(r)}
            onOpenApproval={(r) => setApprovalTargetResource(r)}
          />
        )}

        {activeTab === 'audit' && <AuditTrailView resources={resources} />}
      </main>

      {/* Safety Gated Human Approval Modal */}
      <HumanApprovalModal
        resource={approvalTargetResource}
        isOpen={!!approvalTargetResource}
        onClose={() => setApprovalTargetResource(null)}
        onApprove={handleApproveAction}
        onDeny={handleDenyAction}
        defaultOperatorEmail="sritharag17@gmail.com"
      />

      {/* Deep-Dive Resource Telemetry Modal */}
      <ResourceDetailModal
        resource={inspectedResource}
        isOpen={!!inspectedResource}
        onClose={() => setInspectedResource(null)}
        onOpenApproval={(r) => setApprovalTargetResource(r)}
      />

      {/* Minimal, quiet footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        CloudSweep · Autonomous Cloud Cost-Optimization Agent · Zero Unapproved Deletions Hard Policy
      </footer>
    </div>
  );
}
