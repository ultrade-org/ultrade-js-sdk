/**
 * Client configuration and subscription arguments
 */

import { ClientOptions, AuthCredentials, SubscribeOptions, WalletCredentials } from '@interface';

export interface IClientConstructorArgs {
  options: ClientOptions;
  authCredentials?: AuthCredentials;
}

export interface ISubscribeArgs {
  subscribeOptions: SubscribeOptions;
  callback: Function;
}

export interface IUnsubscribeArgs {
  handlerId: number;
}

export interface ISetMainWalletArgs {
  wallet: WalletCredentials;
}

export interface ISetUseUltradeIdArgs {
  isUltrade: boolean;
}
