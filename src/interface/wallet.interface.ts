import { SuggestedParams } from 'algosdk';
import {
  TradingKeyType,
  PaginatedResult,
  ISafeWithdrawalWallets,
  UpdateWithdrawalWallet,
  CreateWithdrawalWallet,
} from "@ultrade/shared/browser/interfaces";

import { ACTION_TYPE, OperationStatusEnum, TransactionType } from '@enum';

export interface TxnParams {
  suggestedParams: SuggestedParams;
  from: string;
  to: string;
  amount: number;
  assetIndex?: number;
}

export interface OperationTxn {
  txn_hash: string;
  chain_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  type?: TransactionType;
}

export interface OperationVAA {
  vaaId: string;
  from_chain_id: number;
  to_chain_id: number;
  sequence: number;
  emitter: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationCCTP {
  id: number;
  destinationChainId: number;
  messageHash: string;
  messageBytes: string;
  status: OperationStatusEnum;
  attestationSignature: string;
  createdAt: Date;
  updatedAt: Date;
  attestationCompletedAt: Date;
}

export interface ITransactionDetails {
  primaryId: number;
  id: string;
  login_address: string;
  login_chain_id: number;
  action_type: 'withdraw' | 'deposit';
  status: OperationStatusEnum;
  amount: string;
  targetAddress: string;
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
  vaa_message?: Buffer;
  fee: string | null;
  transactions: Array<OperationTxn>;
  vaaMessages: Array<OperationVAA>;
  cctp: Array<OperationCCTP>;
}

export interface ITransaction { 
  primaryId: number;
  id: string;
  action_type: ACTION_TYPE;
  status: OperationStatusEnum;
  amount: string;
  targetAddress: string;
  createdAt?: Date;
  updatedAt: Date;
  vaa_message?: Buffer;
  fee: string | null;
  token_id: {
    id: number;
    address: string;
    chainId: number;
    unitName: string;
    name: string;
    decimals: number;
  };
  transactions: Array<{
    txnHash: string;
    chainId: number;
  }>;
  vaaMessages: Array<OperationVAA>;
}

export type IGetWalletTransactions = PaginatedResult<ITransaction>;

export interface ITradingKey {
  address: string,
  createdAt: Date,
  expiredAt: Date,
  orders: number,
  device: string,
  type?: TradingKeyType
}

export interface ITransfer {
  transferId: number,
  senderAddress: string,
  recipientAddress: string,
  tokenId: number,
  amount: string,
  expiredAt: number,
  whitelistId: number,
  txnId: string,
  completedAt: Date,
  status: OperationStatusEnum;
}

export type IGetTransfers = PaginatedResult<ITransfer>;

export interface IPendingTxn {
  id: number;
  type: ACTION_TYPE;
  amount: string;
  tokenId: number;
}

export interface IWhiteList {
  id?: number;
  loginAddress: string;
  loginChainId: number;
  recipient: string;
  recipientChainId: number;
  tkAddress: string;
  expiredDate: number;
}

export interface IGetWhiteList {
  id: number;
  recipientAddress: string;
  tkAddress: string;
  expiredAt: number;
}

export type IPreparedGetWhiteList = PaginatedResult<IGetWhiteList>;

import {
  IWithdrawData,
  ITransferData,
} from "@ultrade/shared/browser/interfaces";

export interface IWithdrawResponse {
  operationId: string;
  txnId: string;
}

export interface IWalletForClient {
  getTransactionDetalis(transactionId: number): Promise<ITransactionDetails>;
  getPendingTransactions(): Promise<IPendingTxn[]>;
  getWhitelist(): Promise<IPreparedGetWhiteList>;
  addWhitelist(data: IWhiteList): Promise<IGetWhiteList>;
  deleteWhitelist(whitelistId: number): Promise<void>;
  getWalletTransactions(type: string, page: number, limit?: number): Promise<IGetWalletTransactions>;
  getTradingKeys(): Promise<ITradingKey[]>;
  getTransfers(page: number, limit?: number): Promise<IGetTransfers>;
  getAllWithdrawalWallets(): Promise<ISafeWithdrawalWallets[]>;
  getWithdrawalWalletByAddress(address: string): Promise<ISafeWithdrawalWallets>;
  createWithdrawalWallet(body: CreateWithdrawalWallet): Promise<ISafeWithdrawalWallets>;
  updateWithdrawalWallet(params: UpdateWithdrawalWallet): Promise<boolean>;
  deleteWithdrawalWallet(address: string): Promise<boolean>;
  withdraw(withdrawData: IWithdrawData, prettyMsg?: string): Promise<IWithdrawResponse>;
  transfer(transferData: ITransferData): Promise<ITransfer>;
}