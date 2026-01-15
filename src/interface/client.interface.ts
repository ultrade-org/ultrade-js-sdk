
import {
  IAccountForClient,
  IMarketForClient,
  ISystemForClient,
  IWalletForClient,
  IAffiliateForClient,
  ISocialForClient,
  SubscribeOptions,
} from "@interface";
import { Network } from "@const"
import { STREAMS } from "@enum";

export interface ClientOptions {
  network: Network;
  apiUrl?: string;
  algoSdkClient: any;
  websocketUrl: string;
  companyId?: number;
}

export interface IClient
  extends IMarketForClient,
    IAccountForClient,
    IWalletForClient,
    ISystemForClient,
    IAffiliateForClient,
    ISocialForClient {
  getSocketSubscribeOptions(streams: STREAMS[]): SubscribeOptions;
  subscribe(subscribeOptions: SubscribeOptions, callback: Function): number;
  unsubscribe(handlerId: number): void;
}

