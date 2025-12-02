/**
 * Authentication-related method arguments
 */

import { ILoginData, ITradingKeyData, IWithdrawData, ITransferData } from '@ultrade/shared/browser/interfaces';
import { Signer } from '@interface';

export interface ILoginArgs extends ILoginData {
  loginMessage?: string;
}

export interface IAddTradingKeyArgs {
  data: ITradingKeyData;
}

export interface IRevokeTradingKeyArgs {
  data: ITradingKeyData;
}

export interface IWithdrawArgs {
  withdrawData: IWithdrawData;
  prettyMsg?: string;
}

export interface ITransferArgs {
  transferData: ITransferData;
}

export interface ISetSignerArgs {
  signer: Signer;
}
