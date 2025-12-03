/**
 * Wallet-related method arguments
 */

import { CreateWithdrawalWallet, UpdateWithdrawalWallet, IWhitelist } from '@ultrade/shared/browser/interfaces';

export interface IGetWalletTransactionsArgs {
  type: string;
  page: number;
  limit?: number;
}

export interface IGetTransfersArgs {
  page: number;
  limit?: number;
}

export interface IAddWhitelistArgs {
  data: IWhitelist;
}

export interface IDeleteWhitelistArgs {
  whitelistId: number;
}

export interface IGetWithdrawalWalletByAddressArgs {
  address: string;
}

export interface ICreateWithdrawalWalletArgs {
  body: CreateWithdrawalWallet;
}

export interface IUpdateWithdrawalWalletArgs {
  params: UpdateWithdrawalWallet;
}

export interface IDeleteWithdrawalWalletArgs {
  address: string;
}
