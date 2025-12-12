export type AddOrderEvent = [
  number, // pairId
  string, // pairKey
  string, // userId
  number, // id
  number, // side
  number, // type
  string, // price
  string, // amount
  string, // total
  number, // createdAt
];

export type UpdateOrderEvent = [
  number, // pairId
  string, // pairKey
  string, // userId
  number, // id
  number, // status
  string, // executedPrice
  string, // filledAmount
  string, // filledTotal
  number, // updatedAt
  number, // completedAt
];