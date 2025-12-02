import secureLocalStorage from 'react-secure-storage';

import { WalletCredentials } from '@interface';

const host = new URL((window.location !== window.parent.location) ? document.referrer : document.location.href).host;
const addHostPostfix = (key) => `${key}_${host}`;

const secureLocalStorageProxy = new Proxy(secureLocalStorage, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && typeof target[prop] === 'function') {
      return function(...args) {
        if (typeof prop === 'string' && ['setItem', 'getItem', 'removeItem'].includes(prop)) {
          args[0] = addHostPostfix(args[0]);
        }
        return target[prop].apply(target, args);
      };
    }
    return Reflect.get(target, prop, receiver);
  }
});

const localStorageProxy = new Proxy(localStorage, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && typeof target[prop] === 'function') {
      return function(...args) {
        if (typeof prop === 'string' && ['setItem', 'getItem', 'removeItem', 'key'].includes(prop)) {
          args[0] = addHostPostfix(args[0]);
        }
        return target[prop].apply(target, args);
      };
    }
    return Reflect.get(target, prop, receiver);
  }
});

export class LocalStorageService {
  private isBrowser: boolean;
  private keys = {
    mainWallet: 'main-wallet',
    tradingKey: 'trading-key'
  };

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    if (!this.isBrowser) {
      this.clearMainWallet = (): void => {};
      this.getMainWallet = (): WalletCredentials | null => null;
      this.setMainWallet = (): void => {};
    }
  }

  public setMainWallet(mainWallet: WalletCredentials) {
    localStorageProxy.setItem(this.keys.mainWallet, JSON.stringify(mainWallet));
  }

  public getMainWallet(): WalletCredentials | null {
    const mainWalletStr = localStorageProxy.getItem(this.keys.mainWallet);
    if (!mainWalletStr) {
      return null;
    }
    const mainWallet = JSON.parse(mainWalletStr);
    const tradingKey = secureLocalStorageProxy.getItem(`${this.keys.tradingKey}-${mainWallet.address}`);
    // @ts-ignore
    if (tradingKey && (tradingKey.expiredAt === 0 || Number(new Date(tradingKey.expiredAt)) - Date.now() > 1)) {
      // @ts-ignore
      mainWallet.tradingKey = tradingKey.address;
    }
    return mainWallet;
  }

  public clearMainWallet() {
    localStorageProxy.removeItem(this.keys.mainWallet);
  }
}
