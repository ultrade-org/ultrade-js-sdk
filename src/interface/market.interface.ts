import { KYCAuthenticationStatus } from "@ultrade/shared/browser/enums";

import {
  BLOCKCHAINS,
  OrderStatus,
  OrderTypeEnum,
  OrderUpdateStaus,
  PairSettingsIds,
} from "@enum";

export interface IPair {
  id: number;
  base_chain_id: number;
  base_currency: string;
  base_decimal: number;
  base_id: string;
  min_order_size: string;
  min_price_increment: string;
  min_size_increment: string;
  is_active: boolean;
  pairId: number;
  pair_key: string;
  pair_name: string;
  price_chain_id: number;
  price_currency: string;
  price_decimal: number;
  price_id: string;
  restrictedCountries: string[];
  inuseWithPartners: number[];
  pairSettings: IPairSettings;
  delisting_date?: Date;
  new_orders_disabled?: boolean;
  current_price: string;
  h: string;
  l: string;
  l_p: string;
  price_24: string;
  total_24: string;
  volume_24: string;
  change_24: number;
}
export interface IPairDto {
  id: number;
  base_chain_id: number;
  base_currency: string;
  base_decimal: number;
  base_id: string;
  min_order_size: string;
  min_price_increment: string;
  min_size_increment: string;
  is_active: boolean;
  pairId: number,
  pair_key: string;
  pair_name: string;
  price_chain_id: number;
  price_currency: string;
  price_decimal: number;
  price_id: string;
  restrictedCountries: string[];
  inuseWithPartners: number[];
  pairSettings: {
    [PairSettingsIds.MFT_AUDIO_LINK]?: string;
    [PairSettingsIds.MFT_TITLE]?: string;
    [PairSettingsIds.VIEW_BASE_COIN_ICON_LINK]?: string;
    [PairSettingsIds.VIEW_BASE_COIN_MARKET_LINK]?: string;
    [PairSettingsIds.VIEW_PRICE_COIN_ICON_LINK]?: string;
    [PairSettingsIds.VIEW_PRICE_COIN_MARKET_LINK]?: string;
    [PairSettingsIds.MAKER_FEE]?: string;
    [PairSettingsIds.TAKER_FEE]?: string;
    [PairSettingsIds.MODE_PRE_SALE]?: {
      sellerAddress: string;
    }
  };
  delisting_date?: Date;
  new_orders_disabled?: boolean;
  current_price?: string;
  h?: string;
  l?: string;
  l_p?: string;
  price_24?: string;
  total_24?: string;
  volume_24?: string;
  change_24?: string;
}

export interface IGetDepth {
  buy: string[][];
  sell: string[][];
  pair: string;
  ts: number;
  U: number;
  u: number;
}

export interface IGetLastTrades {
  tradeId: number;
  amount: string;
  createdAt: number;
  price: string;
  isBuyerMaker: boolean;
}

export interface CodexBalanceDto {
  hash: string,
  loginAddress: string,
  loginChainId: number,
  tokenId: number,
  tokenAddress: string,
  tokenChainId: number,
  amount: string,
  lockedAmount: string
}

export type OrderSideShort = "B" | "S";

export interface ITradeDto {
  tradeId: number,
  amount: string,
  price: string,
  createdAt: number,
  updatedAt?: number,
  total?: string,
  orderId?: number,
  orderSide?: OrderSideShort,
  pairId?: number,
  baseTokenId?: number,
  baseTokenDecimal?: number,
  quoteTokenId?: number,
  quoteTokenDecimal?: number,
  status?: string,//UserTradeStatus | LastTradeStatus,
  fee?: string,
  isBuyer?: boolean,
  isMaker?: boolean,
}

export interface IOrderDto {
  id: number,
  pairId: number,
  pair: string,
  status: OrderStatus,
  side: 0 | 1;
  type: OrderTypeEnum,
  price: string,
  amount: string,
  filledAmount: string,
  total: string,
  filledTotal: string,
  avgPrice: string,
  userId: string,
  createdAt: number,
  updatedAt?: number,
  completedAt?: number;
  trades?: ITradeDto[],
}

export interface Order extends IOrderDto {
  executed: boolean;
  updateStatus?: OrderUpdateStaus,
  base_currency: string;
  base_decimal: number;
  price_currency: string;
  price_decimal: number;
  min_size_increment: string;
  min_price_increment: string;
  price_id: number;
}

export interface Chain {
  chainId: number;
  whChainId: string;
  tmc: string;
  name: BLOCKCHAINS;
}

export interface AccountAssetType {
  id: number,
  index: string;
  name: string | null;
  decimal: number;
  img: string;
  amount: string;
  lockedAmount: string;
  unit_name: string | null;
  chainId: number;
  usd_value?: number;
  isWrapped?: boolean;
}

export interface CCTPAssets {
  chainId: number; //wh chain id
  address: string;
  unifiedChainId: number;
}

export type MappedCCTPAssets = {[key: string]: CCTPAssets[]}

export interface CCTPUnifiedAssets {
  id: number;
  chainId: number;
  address: string;
  symbol: string;
}

export interface IGetKycStatus {
  kycStatus?: KYCAuthenticationStatus
}

export interface IGetKycInitLink {
  url: string
}

export interface IGetDollarValues {
  [key: string]: number 
}

export interface IWithdrawalFee {
  fee: string;
  dollarValue: string;
}

export interface IGetPrice {
  ask: number,
  bid: number,
  last: number 
}

export interface IGetHistoryResponse {
  t: number[];
  o: number[];
  c: number[];
  l: number[];
  h: number[];
  v: number[];
  q: number[];
  s: string;
  b: number;
}

interface IGetSymbolsItem {
  pairKey: string
}

export type IGetSymbols = IGetSymbolsItem[]

import { CancelOrderArgs, CreateSpotOrderArgs } from "@interface";
import { IPairSettings } from '@ultrade/shared/browser/interfaces';

export interface ICancelOrderResponse {
  orderId: number;
  isCancelled: boolean;
  amount?: string;
  filledAmount?: string;
  filledTotal?: string;
  averageExecutedPrice?: string;
}

export interface ICancelMultipleOrdersResponseItem {
  orderId: number;
  pairId: number;
  isCancelled: boolean;
  reason?: string;
  amount?: string;
  filledAmount?: string;
  filledTotal?: string;
}

export type ICancelMultipleOrdersResponse = ICancelMultipleOrdersResponseItem[];

export interface IMarketForClient {
  getPairList(companyId?: number): Promise<IPairDto[]>
  getPair(symbol: string | number): Promise<IPairDto>
  getPrice(symbol: string): Promise<IGetPrice>
  getDepth(symbol: string, depth: number): Promise<IGetDepth> 
  getSymbols(mask?: string): Promise<IGetSymbols>
  getLastTrades(symbol: string): Promise<IGetLastTrades>
  getHistory(symbol: string, interval: string, startTime?: number, endTime?: number, limit?: number, page?: number): Promise<IGetHistoryResponse>
  getOrders(symbol?: string, status?: number, limit?: number, endTime?: number, startTime?: number): Promise<IOrderDto[]>
  getOrderById(orderId: number): Promise<Order>
  getBalances(): Promise<CodexBalanceDto[]>
  getChains(): Promise<Chain[]>
  getCodexAssets(): Promise<CodexBalanceDto>
  getCCTPAssets(): Promise<MappedCCTPAssets>
  getCCTPUnifiedAssets(): Promise<CCTPUnifiedAssets[]>
  getWithdrawalFee(assetAddress: string, chainId: number): Promise<IWithdrawalFee>
  getKycStatus(): Promise<IGetKycStatus>
  getKycInitLink(embeddedAppUrl: string | null): Promise<IGetKycInitLink>
  getDollarValues(assetIds?: number[]): Promise<IGetDollarValues>
  createSpotOrder(order: CreateSpotOrderArgs): Promise<IOrderDto>;
  cancelOrder(order: CancelOrderArgs): Promise<ICancelOrderResponse>;
  cancelMultipleOrders(data: { orderIds?: number[]; pairId?: number }): Promise<ICancelMultipleOrdersResponse>;
}