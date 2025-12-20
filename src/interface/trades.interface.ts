export type LastTradeEvent = [
  number, // pairId
  string, // pairKey
  number, // tradeId
  string, // price
  string, // amount
  string, // total
  number, // ts
  boolean, // isBuyerMaker
]

export type UserTradeEvent = [
  number, // pairId
  string, // pairKey
  string, // userId
  number, // orderId
  boolean, // isBuyer
  boolean, // isMaker
  number, // tradeId
  string, // price
  string, // amount
  string, // total
  number, // createdOrUpdated
  string, // status: 'Pending' | 'Confirmed' | 'Rejected'
  string, // fee
  number, // feeTokenId
  number, // feeTokenDecimal
]

export interface IMarketTrade {
  tradeId: number;
  price: string;
  amount: string;
  date: number;
  isBuyerMaker: boolean;
}