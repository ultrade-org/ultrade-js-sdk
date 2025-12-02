
import {
  IAccountForClient,
  IMarketForClient,
  ISystemForClient,
  IWalletForClient,
  IAffiliateForClient,
  ISocialForClient,
} from "@interface";
import { Network } from "@const"

export interface ClientOptions {
  network: Network;
  apiUrl?: string;
  algoSdkClient: any;
  websocketUrl: string;
  companyId?: number;
}

export interface IClient
  extends
    IMarketForClient,
    IAccountForClient,
    IWalletForClient,
    ISystemForClient,
    IAffiliateForClient,
    ISocialForClient {
}

