
import {
  IAccountForClient,
  IMarketForClient,
  ISystemForClient,
  IWalletForClient,
  SocketIOFactory,
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
  socketIO: SocketIOFactory;
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

