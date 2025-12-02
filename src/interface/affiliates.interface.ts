export interface AffiliateSummaryStat {
  value: number | null;
  trend: number | null;
}

export interface AffiliateTrendStat {
  value: number;
  time: number;
}

export interface AffiliateStats<T> {
  totalRevenue: T;
  linkClicks: T;
  registrations: T;
  firstTimeDepositors: T;
  totalTradingVolume: T;
  totalFees: T;
}

export interface AffiliateSummaryStats extends AffiliateStats<AffiliateSummaryStat> {}
export interface AffiliateTrendStats extends AffiliateStats<AffiliateTrendStat[]> {}

export interface DashboardInfo {
  feeShare: number;
  referralLink: string;
  summaryStats: AffiliateSummaryStats;
  trendStats: AffiliateTrendStats | null;
}

export interface IAffiliateDashboardStatus {
  enabled: boolean;
  isAffiliate: boolean;
}

export interface IAffiliateProgress {
  totalTradingVolumeUsd: number;
  unlockThreshold: number;
}

export interface IAffiliateForClient {
  getAffiliatesStatus(companyId: number): Promise<IAffiliateDashboardStatus>;
  createAffiliate(companyId: number): Promise<DashboardInfo>;
  getAffiliateProgress(companyId: number): Promise<IAffiliateProgress>;
  getAffiliateInfo(companyId: number, range: string): Promise<DashboardInfo>;
  countAffiliateDepost(companyId: number): Promise<void>;
  countAffiliateClick(referralToken: string): Promise<void>;
}