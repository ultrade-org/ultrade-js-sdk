import { decodeStateArray, getTxnParams } from '@ultrade/shared/browser/helpers/algo.helper';
import algosdk, { Transaction, SuggestedParams } from 'algosdk';
import axios from 'axios';

import { AuthCredentials, Signer, OrderSide, TxnParams } from '@interface';

import { unpackData } from '@utils';

type GetTxnParamsAlgoClient = Parameters<typeof getTxnParams>[0];

export class AlgodService {
  private client: algosdk.Algodv2;
  private authCredentials: AuthCredentials;
  private indexerDomain: string;

  constructor(
    algodClient: algosdk.Algodv2,
    credentials: AuthCredentials,
    indexerDomain: string
  ) {
    this.client = algodClient;
    this.authCredentials = credentials;
    this.indexerDomain = indexerDomain;
  }

  isAppOptedIn(appLocalState, appId: number) {
    return !!appLocalState?.find((app) => app.id === appId);
  }

  isAssetOptedIn(balances, assetId: number) {
    return Object.keys(balances).includes(assetId.toString());
  }

  async optInAsset(userAddress: string, assetIndex: number): Promise<Transaction> {
    const params = await this.getTxnParams();
    const response = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: userAddress,
      to: userAddress,
      assetIndex: assetIndex,
      amount: 0,
    });

    return response;
  }

  async makeAppCallTransaction(
    assetIndex: number,
    senderAddress: string,
    appId: number,
    args: any[],
    params?: any
  ) {
    const accounts = [];
    const foreignApps = [];
    const foreignAssets = [assetIndex];

    const txn = algosdk.makeApplicationNoOpTxn(
      senderAddress,
      params || await this.getTxnParams(),
      appId,
      args,
      accounts,
      foreignApps,
      foreignAssets
    );

    return txn;
  }

  makeTransferTransaction(
    params: SuggestedParams,
    assetIndex: number,
    transferAmount: number,
    senderAddress: string,
    appAddress: string
  ): Transaction | null {
    if (transferAmount <= 0) return null;

    const txn_params: TxnParams = {
      suggestedParams: {
        ...params,
      },
      from: senderAddress,
      to: appAddress,
      amount: transferAmount,
    };

    if (assetIndex === 0) {
      return algosdk.makePaymentTxnWithSuggestedParamsFromObject(txn_params);
    }

    txn_params.assetIndex = assetIndex;
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
      // @ts-ignore
      txn_params
    );
  }

  public get signer() {
    return this.authCredentials.signer;
  }

  public set signer(value: Signer) {
    this.authCredentials.signer = value;
  }

  async signAndSend(txnGroup: Transaction[] | Transaction) {
    if (!Array.isArray(txnGroup)) txnGroup = [txnGroup];

    const recoveredAccount = this.getCurrentAccount();
    if (recoveredAccount) {
      const signedTxns = txnGroup.map((txn: Transaction) =>
        txn.signTxn(recoveredAccount.sk)
      );

      return this.client.sendRawTransaction(signedTxns).do();
    }

    return this.authCredentials.signer.signAndSend(txnGroup);
  }

  async signAndSendData<TResponse>(
    data: object | string,
    signMessage: (msg: string, encoding?: BufferEncoding) => Promise<string>,
    sendAction: (signedData: { signature: string }) => Promise<TResponse>,
    encoding?: BufferEncoding
  ): Promise<TResponse> {
    const message = typeof data === "string" ? data : JSON.stringify(data);
    const payload = typeof data === "string" ? { message } : { ...data };
    const signature = await signMessage(message, encoding);
    return sendAction({
      ...payload,
      signature: signature
    });
  }

  async getTxnParams(): Promise<SuggestedParams> {
    return await getTxnParams(this.client as unknown as GetTxnParamsAlgoClient);
  }

  getCurrentAccount(): { addr: string; sk: Uint8Array } | null {
    if (!this.authCredentials.mnemonic) return null;
    return algosdk.mnemonicToSecretKey(this.authCredentials.mnemonic);
  }

  async getAccountInfo(address: string) {
    return this.client.accountInformation(address).do();
  }

  constructArgsForAppCall(...args: any[]) {
    const appArgs: Uint8Array[] = [];

    args.forEach((elem) => {
      appArgs.push(
        new Uint8Array(
          elem.toBuffer ? elem.toBuffer() : Buffer.from(elem.toString())
        )
      );
    });

    return appArgs;
  }

  validateCredentials() {
    if (!this.authCredentials.mnemonic && !this.authCredentials.signer) {
      throw 'You need specify mnemonic or signer to execute the method';
    }
  }

  async getAppState(
    appId: number,
  ) {
    try {
      const app = await this.client.getApplicationByID(appId).do();
      const globalState = decodeStateArray(app['params']['global-state']);
      return globalState;
    } catch (error) {
      console.log(`Attempt to load app by id ${appId}`);
      console.log(error.message);
    }
  }

  async getSuperAppId(
    appId: number,
  ) {
    const state = await this.getAppState(appId);
    return state?.['UL_SUPERADMIN_APP'] || 0;
  }
  
  async getPairBalances(appId: number, address: string) {
    const { data }: any = await axios.get(
      `${this.indexerDomain}/v2/accounts/${address}?include-all=true`
    );

    if (data.account.hasOwnProperty('apps-local-state')) {
      const state = data.account['apps-local-state'].find(
        (el) => el.id === appId && el.deleted === false
      );
      if (!state) {
        return null;
      }

      const key = state['key-value'].find(
        (el) => el.key === 'YWNjb3VudEluZm8='
      );

      const uintArray = Buffer.from(key.value.bytes, 'base64');
      return unpackData(uintArray as Uint8Array);
    }
  }

  async calculateTransferAmount(
    appId: number,
    address: string,
    side: OrderSide,
    quantity: number,
    price: number,
    decimal: number
  ) {
    const pairBalances = await this.getPairBalances(appId, address);
    const availableBalance =
      (side === 'B'
        ? pairBalances?.priceCoin_available
        : pairBalances?.baseCoin_available) ?? 0;

    if (side === 'B') {
      quantity = (quantity / 10 ** decimal) * price;
    }

    const transferAmount = Math.ceil(quantity - availableBalance);

    if (transferAmount < 0) {
      return 0;
    }
    return transferAmount;
  }
}
