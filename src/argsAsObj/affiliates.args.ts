/**
 * Affiliates-related method arguments
 */

export interface IGetAffiliatesStatusArgs {
  companyId: number;
}

export interface ICreateAffiliateArgs {
  companyId: number;
}

export interface IGetAffiliateProgressArgs {
  companyId: number;
}

export interface IGetAffiliateInfoArgs {
  companyId: number;
  range: string;
}

export interface ICountAffiliateDepositArgs {
  companyId: number;
}

export interface ICountAffiliateClickArgs {
  referralToken: string;
}
