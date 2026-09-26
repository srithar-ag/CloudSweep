export type ResourceType = 'compute_instance' | 'storage_volume' | 'load_balancer';

export type CloudProvider = 'aws' | 'gcp' | 'azure';

export type DetectionStatus = 
  | 'flagged_high_confidence' 
  | 'flagged_needs_review' 
  | 'reviewed_not_flagged';

export type ActionStatus = 
  | 'pending_approval' 
  | 'approved' 
  | 'executing' 
  | 'terminated' 
  | 'denied' 
  | 'exempted';

export interface ComputeMetrics {
  cpuAverage14d: number; // e.g. 1.8%
  cpuPeak14d: number; // e.g. 3.2%
  cpuHistory14d: number[]; // 14 daily average datapoints
  lastActivityDaysAgo: number; // e.g. 41 days ago
  lastNetworkBytesOut24h: number; // e.g. 1420 bytes
  activeSshConnections: number;
}

export interface VolumeMetrics {
  isAttached: boolean;
  attachedInstanceId: string | null;
  attachedInstanceName?: string | null;
  daysDetached: number; // e.g. 38 days
  detachedTimestamp: string;
  sizeGB: number;
  volumeType: string; // e.g. 'gp3', 'io2', 'pd-ssd'
  provisionedIops?: number;
  provisionedThroughputMBps?: number;
  hasRecentSnapshot: boolean;
  snapshotAgeDays?: number;
}

export interface LoadBalancerMetrics {
  healthyTargetsCount: number; // e.g. 0
  totalTargetsCount: number; // e.g. 2
  targetGroupsCount: number;
  requestsReceived14d: number; // e.g. 0
  daysWithZeroTraffic: number; // e.g. 29 days
  lastRequestTimestamp: string | null;
  listenerPorts: number[];
  scheme: 'internet-facing' | 'internal';
}

export interface BillingBreakdown {
  hourlyRate: number; // $/hr
  monthlyCost: number; // exact calculated $/month
  pricingFormula: string; // e.g. "$0.68/hr * 730 hrs/month"
  billingConfirmed: boolean;
  dataGapNotice?: string; // Honest notice if telemetry or pricing API was incomplete
}

export interface CloudResource {
  id: string; // e.g. "i-094f31b28da1"
  name: string; // e.g. "staging-analytics-worker-01"
  resourceType: ResourceType;
  provider: CloudProvider;
  region: string;
  zone?: string;
  state: 'running' | 'available' | 'active' | 'in-use' | 'stopped' | 'terminated';
  specSummary: string; // e.g. "c5.4xlarge · 16 vCPU · 32 GB RAM"
  tags: Record<string, string>;
  
  // Specific category telemetry
  computeMetrics?: ComputeMetrics;
  volumeMetrics?: VolumeMetrics;
  loadBalancerMetrics?: LoadBalancerMetrics;
  
  // Real billing metrics
  billing: BillingBreakdown;
  
  // Autonomous detection evaluation
  detection: {
    status: DetectionStatus;
    flagged: boolean;
    confidence: 'high' | 'needs_review' | 'not_applicable';
    evidenceReason: string; // specific evidence e.g. "CPU averaged 1.8% over 14 days, last activity 41 days ago"
    needsReviewReason?: string; // specific plausibility reasoning why excluded from standard plan
    reviewedNotFlaggedReason?: string; // why this didn't breach the threshold
    thresholdBreached: string; // e.g. "Avg CPU < 5% (1.8% measured)"
    blastRadiusAnalysis: string; // e.g. "No active IAM roles, security group ingress closed, 0 attached ENIs"
  };

  // Human gating workflow
  actionState: ActionStatus;
  operatorNotes?: string;
  actionTimestamp?: string;
  auditLog: Array<{
    timestamp: string;
    action: string;
    operator: string;
    details: string;
  }>;
}

export interface AccountScanSummary {
  accountName: string;
  accountId: string;
  provider: CloudProvider;
  scannedAt: string;
  totalScanned: number;
  totalFlagged: number;
  totalMonthlyWaste: number;
  highConfidenceCount: number;
  highConfidenceMonthlyWaste: number;
  needsReviewCount: number;
  needsReviewMonthlyWaste: number;
  reviewedNotFlaggedCount: number;
  dataGapsIdentified: number;
}

export interface ExecutionApprovalRequest {
  resource: CloudResource;
  actionType: 'terminate' | 'delete' | 'snapshot_and_delete';
  createSnapshotFirst: boolean;
  operatorConfirmation: string;
}
