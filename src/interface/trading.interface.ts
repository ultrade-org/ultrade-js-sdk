export type OrderSide = 'S' | 'B';

export type OrderType = 'L' | 'I' | 'P' | 'M';

export interface CancelOrderArgs {
  orderId: number;
  orderSide: OrderSide;
  orderType: OrderType;
  amount: string;
  price: string;
  baseTokenAddress: string;
  baseChain: string;
  baseCurrency: string;
  baseDecimal: number;
  priceTokenAddress: string;
  priceChain: string;
  priceCurrency: string;
  priceDecimal: number;
}

export interface CreateSpotOrderArgs {
  pairId: number;
  companyId: number;
  orderSide: OrderSide;
  orderType: OrderType;
  amount: string;
  price: string;
  decimalPrice: number;
  address: string;
  chainId: number;
  baseTokenAddress: string;
  baseTokenChainId: number;
  baseChain: string;
  baseCurrency: string;
  baseDecimal: number;
  priceTokenAddress: string;
  priceTokenChainId: number;
  priceChain: string;
  priceCurrency: string;
  priceDecimal: number;
}

