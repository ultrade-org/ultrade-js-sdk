/**
 * Market-related method arguments
 */

export interface IGetPairListArgs {
  companyId?: number;
  currentCountry: string;
  selectedPairId: number;
}

export interface IGetPairArgs {
  symbol: string | number;
}

export interface IGetPriceArgs {
  symbol: string;
}

export interface IGetDepthArgs {
  symbol: string;
  depth: number;
  baseDecimal: number;
}

export interface IGetSymbolsArgs {
  mask?: string;
}

export interface IGetLastTradesArgs {
  symbol: string;
}

export interface IGetHistoryArgs {
  symbol: string;
  interval: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  page?: number;
}

export interface IGetOrdersArgs {
  symbol?: string;
  status?: number;
  limit?: number;
  endTime?: number;
  startTime?: number;
}

export interface IGetOrderByIdArgs {
  orderId: number;
}

export interface IGetWithdrawalFeeArgs {
  assetAddress: string;
  chainId: number;
}

export interface IGetKycInitLinkArgs {
  embeddedAppUrl: string | null;
}

export interface IGetDollarValuesArgs {
  assetIds?: number[];
}

export interface IGetTransactionDetailsArgs {
  transactionId: number;
}
