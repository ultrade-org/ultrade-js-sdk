import { io } from 'socket.io-client';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { DEFAULT_ORDER_EXPIRATION_DAYS, ORDER_MSG_VERSION } from '@ultrade/shared/browser/constants';
import { getRandomInt } from '@ultrade/shared/browser/common';
import {
  getCancelOrderDataJsonBytes,
  makeLoginMsg,
  makeTradingKeyMsg,
  makeCreateOrderMsg,
} from '@ultrade/shared/browser/helpers/codex.helper';
import { makeWithdrawMsg } from '@ultrade/shared/browser/helpers/withdraw.helper';
import { ICreateSpotOrderData } from '@ultrade/shared/browser/interfaces';
import { ITradingKeyData, TradingKeyType, TradingKeyView } from '@ultrade/shared/browser/interfaces';
import {
  ILoginData,
  ITransferData,
  IWithdrawData,
  PROVIDERS,
} from "@ultrade/shared/browser/interfaces";
import { OrderStatus } from "@ultrade/shared/browser/enums";
import { makeDtwMsg, makeTransferMsg } from "@ultrade/shared/browser/helpers/codex";
import { CreateWithdrawalWallet, UpdateWithdrawalWallet } from "@ultrade/shared/browser/interfaces";
import { ISafeWithdrawalWallets } from "@ultrade/shared/browser/interfaces";

import { SocketManager } from "./sockets";
import { LocalStorageService } from "./localStorage";
import {
  AuthCredentials,
  ClientOptions,
  CancelOrderArgs,
  CreateSpotOrderArgs,
  Signer,
  SubscribeOptions,
  TelegramData,
  WalletCredentials,
  UserNotification,
  IPairDto,
  IGetDepth,
  SettingsInit,
  IGetLastTrades,
  CodexBalanceDto,
  IOrderDto,
  Order,
  Chain,
  MappedCCTPAssets,
  CCTPUnifiedAssets,
  IGetKycStatus,
  IGetKycInitLink,
  IGetDollarValues,
  ITransactionDetails,
  IClient,
  IGetPrice,
  IGetSymbols,
  IGetHistoryResponse,
  IWithdrawalFee,
  ITransaction,
  ITradingKey,
  ITransfer,
  IPendingTxn,
  IGetWhiteList,
  IWhiteList,
  ISystemVersion,
  ISystemMaintenance,
  IUnreadNotificationsCount,
  UpdateUserNotificationDto,
  IAffiliateDashboardStatus,
  IAffiliateProgress,
  DashboardInfo,
  ISocialAccount,
  ILeaderboardItem,
  IUnlock,
  IAction,
  IActionHistory,
  ISocialSettings,
  ISocialSeason,
  ITelegramConnectResponse,
  ICompanyTweet,
  IAIStyle,
  IAIGeneratedComment,
  IWithdrawResponse,
  IRevokeTradingKeyResponse,
  ICancelOrderResponse,
  ICancelMultipleOrdersResponse,
  CodexAsset,
  IGetWalletTransactions,
  IGetTransfers,
  IPreparedGetWhiteList,
} from "@interface";
import { ACTION_TYPE, PRIVATE_STREAMS, STREAMS } from "@enum";
import { createExtendedConfig, ExtendedAxiosRequestConfig, AlgodService } from "@utils";
import { DEFAULT_LOGIN_MESSAGE, NETWORK_CONFIGS, tokenizedUrls } from "@const";

export class Client implements IClient {
  private client: AlgodService;
  private algodNode: string;
  private algodIndexer: string;
  private apiUrl: string;
  private companyId: number;
  private websocketUrl: string;
  private wallet: WalletCredentials | null;
  private _axios: AxiosInstance;
  private localStorageService: LocalStorageService;
  private isUltradeID: boolean;
  public socketManager: SocketManager;

  constructor(
    options: ClientOptions,
    authCredentials?: AuthCredentials,
  ) {

    const networkConfig = NETWORK_CONFIGS[options.network];
    this.algodNode = networkConfig.algodNode;
    this.apiUrl = networkConfig.apiUrl;
    this.algodIndexer = networkConfig.algodIndexer;
    if (options.apiUrl !== undefined) {
      this.apiUrl = options.apiUrl;
    }
    if (options.companyId !== undefined) {
      this.companyId = options.companyId;
    }
    this.websocketUrl = options.websocketUrl;
    this.client = new AlgodService(options.algoSdkClient, authCredentials || {} as AuthCredentials, this.algodIndexer)

    this._axios = this.axiosInterceptor(axios.create({
      baseURL: this.apiUrl,
    }));
    this.localStorageService = new LocalStorageService();
    this.wallet = this.localStorageService.getMainWallet();
    this.isUltradeID = false;
    
    this.socketManager = new SocketManager(
      this.websocketUrl,
      io,
      (socketId) => {
        console.log(`Socket ${socketId} disconnected at`, new Date());
      },
      (err) => {
        console.log(`Socket connect_error due to ${err}`);
      }
    );    
    console.log('SDK Wallet', this.wallet);
  }

  private axiosInterceptor = (axios: AxiosInstance): AxiosInstance => {
    const tokenRequired = (config: ExtendedAxiosRequestConfig): boolean => {
      return config.withWalletCredentials || (config.url ? tokenizedUrls.some(value => config.url!.includes(value)) : false)
    };
    const tradingKeyRequired = (config: ExtendedAxiosRequestConfig): boolean => {
      const urls = [
        '/market/order',
        // '/wallet/transfer',
      ];
      return config.withWalletCredentials || (config.url ? urls.some(value => config.url!.includes(value)) : false)
    };
    const companyIdRequired = (config: ExtendedAxiosRequestConfig): boolean => {
      const urls = [
        '/wallet/signin',
        '/market/account/kyc/init',
        '/notifications'
      ];
      return config.url ? urls.some(value => config.url!.includes(value)) : false
    };
    const isSocialRequest = (config: ExtendedAxiosRequestConfig): boolean => {
      const urls = [
        '/social/',
      ];
      return config.url ? urls.some(value => config.url!.includes(value)) : false
    };
    const ifCollectStatistic = (config: ExtendedAxiosRequestConfig): boolean => {
      return config.url ? tokenizedUrls.some(value => config.url!.includes(value)) : false
    };

    axios.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        if (this.wallet && tokenRequired(config)) {
          config.headers['X-Wallet-Address'] = this.wallet.address;
          config.headers['X-Wallet-Token'] = this.wallet.token;
        }
        if (this.wallet && ifCollectStatistic(config)) {
          config.headers['CompanyId'] = this.companyId;
        }
        if (this.wallet && tradingKeyRequired(config)) {
          const tradingKey = this.localStorageService.getMainWallet()?.tradingKey;
          if (tradingKey) {
            config.headers['X-Trading-Key'] = tradingKey;
          }
        }
        if (companyIdRequired(config)) {
          config.headers['CompanyId'] = this.companyId;
        }
        if (isSocialRequest(config) && !config.headers.CompanyId) {
          config.headers['CompanyId'] = this.isUltradeID ? 1 : this.companyId;
        }
        return config;
      },
      (error: any) => Promise.reject(error),
    );
  
    //Add a response interceptor
    axios.interceptors.response.use(
      (response: AxiosResponse<any, any>) => {
        return response.data;
      },
      async (error: any) => {
        console.log('Request was failed', error);
        const invalidToken = [401].includes(
          error?.response?.status,
        );
        
        if (invalidToken && error.config && tokenRequired(error.config as ExtendedAxiosRequestConfig)) {
          this.wallet = null;
          this.localStorageService.clearMainWallet();
        }

        return Promise.reject(error);
      },
    );
  
    return axios;
  }

  // TODO: rework emit logic in SDK UL-1257

  // public setState(args: AppSocketState) {
  //   return ws.emitPair(args);
  // }

  // public setFilter(args: AppSocketState) {
  //   return ws.emitFilter(args);
  // }

  public get useUltradeID(): boolean {
    return this.isUltradeID;
  }

  public set useUltradeID(isUltrade: boolean) {
    this.isUltradeID = isUltrade;
  }

  public get isLogged() {
    return !!this.wallet?.token;
  }

  public get mainWallet(): WalletCredentials | null {
    return this.wallet;
  }

  public set mainWallet(wallet: WalletCredentials) {
    this.wallet = wallet;
    if (!wallet) {
      this.localStorageService.clearMainWallet();
    } else {
      this.localStorageService.setMainWallet(wallet);
    }
  }

  public setSigner(signer: Signer) {
    this.client.signer = signer;
  }

  public subscribe(subscribeOptions: SubscribeOptions, callback: Function): number {
    const requiresAuth = subscribeOptions.streams.some(stream => PRIVATE_STREAMS.includes(stream));

    if(requiresAuth && !this.mainWallet?.token && !this.mainWallet?.tradingKey) {
      subscribeOptions.streams = subscribeOptions.streams.filter(stream => !PRIVATE_STREAMS.includes(stream));
      return this.socketManager.subscribe(subscribeOptions, callback);
    }

    if(requiresAuth) {
      subscribeOptions.options = {
        ...subscribeOptions.options,
        token: this.mainWallet?.token,
        tradingKey: this.mainWallet?.tradingKey
      }
      return this.socketManager.subscribe(subscribeOptions, callback);
    }

    return this.socketManager.subscribe(subscribeOptions, callback);
  }

  public unsubscribe(handlerId: number) {
    this.socketManager.unsubscribe(handlerId);
  }

  public getPairList(companyId?: number): Promise<IPairDto[]> {
    const query = companyId ? `&companyId=${companyId}` : "";
    return this._axios.get(`/market/markets?includeAllOrders=false${query}`);
  }

  public getPair(symbol: string | number): Promise<IPairDto> {
    return this._axios.get(`/market/market?symbol=${symbol}`);
  }

  public getPrice(symbol: string): Promise<IGetPrice> {
    return this._axios.get(`/market/price?symbol=${symbol}`);
  }

  public getDepth(symbol: string, depth: number): Promise<IGetDepth> {
    return this._axios.get(`/market/depth?symbol=${symbol}&depth=${depth}`);
  }

  public getSymbols(mask?: string): Promise<IGetSymbols> {
    return this._axios.get(`/market/symbols${mask ? '?mask=' + mask : ''}`);
  }

  public getLastTrades(symbol: string): Promise<IGetLastTrades[]> {
    return this._axios.get(`/market/last-trades?symbol=${symbol}`);
  }

  public getHistory(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit = 500,
    page: number = 1,
  ): Promise<IGetHistoryResponse> {
    return this._axios.get(`/market/history?symbol=${symbol}&interval=${interval}&startTime=${startTime ?? ""}&endTime=${endTime ?? ""}&limit=${limit}&page=${page}`);
  }

  public getOrders(
    symbol?: string,
    status?: number,
    limit = 50,
    endTime?: number,
    startTime?: number,
  ): Promise<IOrderDto[]> {
    const statusStr = !status
      ? ""
      : (status === 1 )
        ? OrderStatus.Open
        : [OrderStatus.Canceled, OrderStatus.Matched, OrderStatus.SelfMatched, OrderStatus.Expired].join(',');

    const symbolQuery = symbol ? `&symbol=${symbol}` : "";
    const statusQuery = statusStr ? `&status=${statusStr}` : "";
    const startTimeQuery = startTime ? `&startTime=${startTime}` : "";
    const endTimeQuery = endTime ? `&endTime=${endTime}` : "";
    return this._axios.get(`/market/orders?limit=${limit}${symbolQuery}${statusQuery}${startTimeQuery}${endTimeQuery}`);
  }

  public getOrderById(orderId: number): Promise<Order> {
    return this._axios.get(`/market/order/${orderId}`);
  }

  public getSettings(): Promise<SettingsInit> {
    const domain = new URL((window.location !== window.parent.location) ? document.referrer : document.location.href).host;
    return this._axios.get(`/market/settings`, { headers: { "wl-domain": domain } });
  }

  public getBalances(): Promise<CodexBalanceDto[]> {
    return this._axios.get(`/market/balances`);
  }

  public getChains(): Promise<Chain[]> {
    return this._axios.get(`/market/chains`);
  }

  public getCodexAssets(): Promise<CodexAsset[]> {
    return this._axios.get(`/market/assets`);
  }

  public getCCTPAssets(): Promise<MappedCCTPAssets> {
    return this._axios.get(`/market/cctp-assets`);
  }

  public getCCTPUnifiedAssets(): Promise<CCTPUnifiedAssets[]> {
    return this._axios.get(`/market/cctp-unified-assets`);
  }

  public getWithdrawalFee(assetAddress: string, chainId: number): Promise<IWithdrawalFee> {
    return this._axios.get(`/market/withdrawal-fee?assetAddress=${assetAddress}&chainId=${chainId}`);
  }
  
  public getKycStatus(): Promise<IGetKycStatus> {
    return this._axios.get(`/market/account/kyc/status`);
  }

  public getKycInitLink(embeddedAppUrl: string | null): Promise<IGetKycInitLink> {
    return this._axios.post(`/market/account/kyc/init`, { embeddedAppUrl });
  }

  public getDollarValues(assetIds: number[] = []): Promise<IGetDollarValues> {
    return this._axios.get(`/market/dollar-price?assetIds=${JSON.stringify(assetIds)}`);
  }

  public getTransactionDetalis(transactionId: number): Promise<ITransactionDetails> {
    return this._axios.get(`/market/operation-details?operationId=${transactionId}`);
  }

  //#region Wallet

  public getWalletTransactions(type: ACTION_TYPE, page: number, limit: number = 100): Promise<IGetWalletTransactions> {
    return this._axios.get(`/wallet/transactions?type=${type}&limit=${limit}&page=${page}`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getTradingKeys(): Promise<ITradingKey[]> {
    return this._axios.get(`/wallet/keys`, createExtendedConfig(createExtendedConfig({ withWalletCredentials: true })));
  }

  public getTransfers(page: number, limit: number = 100): Promise<IGetTransfers> {
    return this._axios.get(`/wallet/transfers?limit=${limit}&page=${page}`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getPendingTransactions(): Promise<IPendingTxn[]> {
    return this._axios.get(`/wallet/transactions/pending`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getWhitelist(): Promise<IPreparedGetWhiteList> {
    return this._axios.get(`/wallet/whitelist`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public async addWhitelist(data: IWhiteList): Promise<IGetWhiteList> {
    const encoding = 'hex';
    data = {
      ...data,
      expiredDate: data.expiredDate && Math.round(data.expiredDate / 1000)
    };
    const message = Buffer.from(makeDtwMsg(data)).toString(encoding);
    return await this.client.signAndSendData<IGetWhiteList>(
      message,
      this.client.signer.signMessage,
      ({ signature }) => {
        return this._axios.post(`/wallet/whitelist`, { message, signature });
      },
      encoding
    );
  }

  public deleteWhitelist(whitelistId: number): Promise<void> {
    const data = { whitelistId };
    return this.client.signAndSendData(
      data,
      this.client.signer.signMessage,
      ({ signature }) => this._axios.delete(`/wallet/whitelist`, {
        data: { data, signature }
      }),
    );
  }

  public getAllWithdrawalWallets(): Promise<ISafeWithdrawalWallets[]> {
    return this._axios.get(`/wallet/withdrawal-wallets`);
  }

  public getWithdrawalWalletByAddress(address: string): Promise<ISafeWithdrawalWallets> {
    return this._axios.get(`/wallet/withdrawal-wallets/${address}`);
  }

  public createWithdrawalWallet(body: CreateWithdrawalWallet): Promise<ISafeWithdrawalWallets> {
    return this._axios.post(`/wallet/withdrawal-wallets`, body);
  }

  public updateWithdrawalWallet(params: UpdateWithdrawalWallet): Promise<boolean> {
    return this._axios.patch(`/wallet/withdrawal-wallets`, params);
  }

  public deleteWithdrawalWallet(address: string): Promise<boolean> {
    return this._axios.delete(`/wallet/withdrawal-wallets/${address}`);
  }
  //#endregion Wallet

  //#region System

  public getVersion(): Promise<ISystemVersion> {
    return this._axios.get(`/system/version`);
  }

  public getMaintenance(): Promise<ISystemMaintenance> {
    return this._axios.get(`/system/maintenance`);
  }

  public getNotifications(): Promise<UserNotification[]> {
    return this._axios.get(`/notifications`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getNotificationsUnreadCount(): Promise<IUnreadNotificationsCount> {
    return this._axios.get(`/notifications/count`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public readNotifications(
    notifications: UpdateUserNotificationDto[],
  ): Promise<UpdateUserNotificationDto[]> {
    return this._axios.put(
      `/notifications`,
      { notifications },
      createExtendedConfig({ withWalletCredentials: true }),
    );
  }

  //#endregion System

  //#region Affiliates

  public getAffiliatesStatus(companyId: number): Promise<IAffiliateDashboardStatus> {
    return this._axios.get(
      `/affiliates/${companyId}/dashboardStatus`,
      createExtendedConfig({ withWalletCredentials: true }),
    );
  }

  public createAffiliate(companyId: number): Promise<DashboardInfo> {
    return this._axios.post(`/affiliates/${companyId}`, {}, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getAffiliateProgress(companyId: number): Promise<IAffiliateProgress> {
    return this._axios.get(
      `/affiliates/${companyId}/tradingVolumeProgress`,
      createExtendedConfig({ withWalletCredentials: true }),
    );
  }

  public getAffiliateInfo(companyId: number, range: string): Promise<DashboardInfo> {
    return this._axios.get(
      `/affiliates/${companyId}/dashboard?range=${range}`,
      createExtendedConfig({ withWalletCredentials: true }),
    );
  }

  public async countAffiliateDepost(companyId: number): Promise<void> {
    await this._axios.post(`/affiliates/${companyId}/deposit`, {}, createExtendedConfig({ withWalletCredentials: true }));
  }

  public async countAffiliateClick(referralToken: string): Promise<void> {
    await this._axios.post(`/affiliates/click`, { referralToken }, createExtendedConfig({ withWalletCredentials: true }));
  }

  //#endregion Affiliates

  //#region Social
  public getSocialAccount(): Promise<ISocialAccount | undefined> {
    return this._axios.get(`/social/account`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public async addSocialEmail(email: string, embeddedAppUrl: string): Promise<void> {
    await this._axios.put(`/social/account/email`, { email, embeddedAppUrl }, createExtendedConfig({ withWalletCredentials: true }));
  }

  public async verifySocialEmail(email: string, hash: string): Promise<void> {
    await this._axios.put(`/social/account/verifyEmail`, { email, hash }, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getLeaderboards(): Promise<ILeaderboardItem[]> {
    return this._axios.get(`/social/leaderboard`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getUnlocks(): Promise<IUnlock[]> {
    return this._axios.get(`/social/unlocks`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getSocialSettings(): Promise<ISocialSettings> {
    return this._axios.get(`/social/settings`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getSeason(ultradeId?: number): Promise<ISocialSeason> {
    return this._axios.get(`/social/seasons/active`, createExtendedConfig({ 
      withWalletCredentials: true,
      headers: { "CompanyId": ultradeId } 
    }));
  }

  public getPastSeasons(): Promise<ISocialSeason[]> {
    return this._axios.get(`/social/seasons/history`, createExtendedConfig({ withWalletCredentials: true }));
  }

  //#region Telegram
  public addTelegram(data: TelegramData): Promise<ITelegramConnectResponse> {
    return this._axios.post(`/social/telegram/connect`, data, createExtendedConfig({ withWalletCredentials: true }));
  }

  public async disconnectTelegram(data: TelegramData): Promise<void> {
    await this._axios.put(`/social/telegram/disconnect`, data, createExtendedConfig({ withWalletCredentials: true }));
  }

  //#endregion Telegram

  //#region Discord
  public async getDiscordConnectionUrl(url: string): Promise<string> {
    const query = url ? `?embeddedAppUrl=${encodeURIComponent(url)}` : "";
    const response = await this._axios.get(`/social/discord/connect${query}`, createExtendedConfig({ withWalletCredentials: true })) as { url: string };
    return response.url;
  }

  public async disconnectDiscord(): Promise<void> {
    await this._axios.put(`/social/discord/disconnect`, {}, createExtendedConfig({ withWalletCredentials: true }));
  }
  //#endregion Discord

  //#region Twitter
  public async getTwitterConnectionUrl(appUrl: string, permissions?: string): Promise<string> {
    const queryURL = appUrl ? `?embeddedAppUrl=${encodeURIComponent(appUrl)}` : "";
    const queryPermissions = permissions ? `&scopes=${permissions}` : "";
    const response = await this._axios.get(`/social/twitter/connect${queryURL}${queryPermissions}`, createExtendedConfig({ withWalletCredentials: true })) as { url: string };
    return response.url;
  }

  public async disconnectTwitter(): Promise<void> {
    await this._axios.put(`/social/twitter/disconnect`, {}, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getTweets(): Promise<ICompanyTweet[]> {
    return this._axios.get(`/social/twitter/tweets`, createExtendedConfig({ withWalletCredentials: true }));
  }
  
  public async actionWithTweet(data: { actions: Array<{ id: number; text?: string }>; tweetId?: string }): Promise<void> {
    await this._axios.post(`/social/twitter/tweet/actions`, data, createExtendedConfig({ withWalletCredentials: true }));
  }
  
  public getActions(): Promise<IAction[]> {
    return this._axios.get(`/social/actions`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getActionHistory(): Promise<IActionHistory[]> {
    return this._axios.get(`/social/actions/history`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getAIStyles(): Promise<IAIStyle[]> {
    return this._axios.get(`/social/twitter/tweets/styles`, createExtendedConfig({ withWalletCredentials: true }));
  }

  public getAIComment(styleId: number, tweetId: string): Promise<IAIGeneratedComment> {
    return this._axios.get(`/social/twitter/tweets/${tweetId}/generateComment?styleId=${styleId}`, createExtendedConfig({ withWalletCredentials: true }));
  }
  //#endregion Twitter

  //#endregion Social

  private getTechnologyByProvider(provider: PROVIDERS) {
    switch (provider) {
      case PROVIDERS.PERA:
        return "ALGORAND";
      case PROVIDERS.METAMASK:
        return "EVM";
      case PROVIDERS.SOLFLARE:
      case PROVIDERS.COINBASE:
      case PROVIDERS.PHANTOM:
      case PROVIDERS.BACKPACK:
      case PROVIDERS.MOBILE:
        return "SOLANA";

      default: throw new Error("Not implemented");
    }
  }

  public async login({ address, provider, chain, referralToken, loginMessage }: ILoginData): Promise<string> {
    const encoding = 'hex';
    const signingMessage = loginMessage || DEFAULT_LOGIN_MESSAGE;
    const data = {
      address,
      technology: this.getTechnologyByProvider(provider),
    };
    const message = Buffer.from(makeLoginMsg(data, signingMessage)).toString(encoding);
    return await this.client.signAndSendData<string>(
      message,
      this.client.signer.signMessage,
      async ({ signature }) => {
        const token = await this._axios.put(`/wallet/signin`, { data, message, encoding, signature, referralToken }) as string;
        this.mainWallet = { address, provider, token, chain };
        return token;
      },
      encoding
    );
  }

  public async addTradingKey(data: ITradingKeyData): Promise<TradingKeyView> {
    const encoding = 'hex';
    const message = Buffer.from(makeTradingKeyMsg(data, true)).toString(encoding);
    const { device, type } = data;
    return await this.client.signAndSendData<TradingKeyView>(
      message,
      this.client.signer.signMessage,
      async ({ signature }) => {
        const tradingKey = await this._axios.post(`/wallet/key`, {
          data: { device, type }, encoding, message, signature
        }) as unknown as TradingKeyView
        if (this.mainWallet && tradingKey.type === TradingKeyType.User) {
          this.mainWallet.tradingKey = tradingKey.address;
        }
        return tradingKey;
      },
      encoding
    );
  }

  public async revokeTradingKey(data: ITradingKeyData): Promise<IRevokeTradingKeyResponse> {
    const encoding = 'hex';
    const message = Buffer.from(makeTradingKeyMsg(data, false)).toString(encoding);
    const { device, type } = data;
    return await this.client.signAndSendData<IRevokeTradingKeyResponse>(
      message,
      this.client.signer.signMessage,
      async ({ signature }) => {
        await this._axios.delete(`/wallet/key`, {
          data: { data: { device, type }, encoding, message, signature }
        });
        if (this.mainWallet && data.tkAddress === this.mainWallet.tradingKey) {
          this.mainWallet.tradingKey = undefined;
        }
        return { signature };
      },
      encoding
    );
  }

  public async withdraw(withdrawData: IWithdrawData, prettyMsg?: string): Promise<IWithdrawResponse> {
    const encoding = 'hex';
    const data = {
      ...withdrawData,
      random: getRandomInt(1, Number.MAX_SAFE_INTEGER),
    };
    const message = Buffer.from(makeWithdrawMsg(data, prettyMsg)).toString(encoding);
    return await this.client.signAndSendData<IWithdrawResponse>(
      message,
      this.client.signer.signMessage,
      ({ signature }) => {
        return this._axios.post(`/wallet/withdraw`, { encoding, message, signature, destinationAddress: data.recipient });
      },
      encoding
    );
  }

  public async transfer(transferData: ITransferData): Promise<ITransfer> {
    const encoding = 'hex';
    const data = {
      ...transferData,
      random: getRandomInt(1, Number.MAX_SAFE_INTEGER),
    };
    const message = Buffer.from(makeTransferMsg(data)).toString(encoding);
    return await this.client.signAndSendData<ITransfer>(
      message,
      this.client.signer.signMessage,
      ({ signature }) => {
        return this._axios.post(`/wallet/transfer`, { message, signature });
      },
      encoding
    );
  }

  public async createSpotOrder(order: CreateSpotOrderArgs): Promise<IOrderDto> {
    const _daysInSec = DEFAULT_ORDER_EXPIRATION_DAYS * 24 * 60 * 60;
    const expiredTime = Math.floor(Date.now() / 1000) + _daysInSec;
    const data: ICreateSpotOrderData = {
      ...order,
      version: ORDER_MSG_VERSION,
      expiredTime,
      random: getRandomInt(1, Number.MAX_SAFE_INTEGER),
    };
    const encoding = 'hex';
    const message = Buffer.from(makeCreateOrderMsg(data)).toString(encoding);

    return await this.client.signAndSendData<IOrderDto>(
      message,
      this.client.signer.signMessageByToken,
      ({ signature }) => {
        return this._axios.post(`/market/order`, { encoding, message, signature });
      },
      encoding
    );
  }

  public async cancelOrder(order: CancelOrderArgs): Promise<ICancelOrderResponse> {
    const data = { orderId: order.orderId };
    const encoding = 'hex';
    const message = Buffer.from(getCancelOrderDataJsonBytes(order)).toString(encoding);
    return await this.client.signAndSendData<ICancelOrderResponse>(
      message,
      this.client.signer.signMessageByToken,
      ({ signature }) => {
        return this._axios.delete(`/market/order`, {
          data: { data, message, signature }
        });
      },
      encoding
    );
  }

  public async cancelMultipleOrders({ orderIds, pairId }: { orderIds?: number[]; pairId?: number }): Promise<ICancelMultipleOrdersResponse> {
    const data = { orderIds, pairId };
    return await this.client.signAndSendData<ICancelMultipleOrdersResponse>(
      data,
      this.client.signer.signMessageByToken,
      ({ signature }) => {
        return this._axios.delete(`/market/orders`, {
          data: { data, signature }
        });
      },
    );
  }

  public async ping(): Promise<number> {
    const response = await this._axios.get(`/system/time`) as unknown as { currentTime: number };
    return Math.round(Date.now() - response.currentTime);
  }

  public getSocketSubscribeOptions(streams: STREAMS[], pairKey?: string): SubscribeOptions | null {

    const companyId = this?.companyId
    const address = this?.wallet?.address

    if(!pairKey || !companyId || !address) {
      return null
    }
    return {
      symbol: pairKey,
      streams: streams,
      options: {
        companyId: companyId,
        address: address,
      },
    };
  }
}
