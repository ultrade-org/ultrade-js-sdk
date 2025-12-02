import { AxiosRequestConfig } from "axios";

export interface ExtendedAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  withWalletCredentials?: boolean;
  url?: string;
}

export function createExtendedConfig<T>(config: ExtendedAxiosRequestConfig<T>): ExtendedAxiosRequestConfig<T> {
  return config ;
}