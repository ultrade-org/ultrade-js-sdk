export interface NetworkConfig {
  algodNode: string;
  apiUrl: string;
  algodIndexer: string;
}

export type Network = 'mainnet' | 'testnet' | 'local'

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  mainnet: {
    algodNode: 'https://mainnet-api.algonode.cloud',
    apiUrl: 'https://mainnet-api.algonode.cloud',
    algodIndexer: 'https://mainnet-idx.algonode.cloud',
  },
  testnet: {
    algodNode: 'https://testnet-api.algonode.cloud',
    apiUrl: 'https://testnet-apigw.ultradedev.net',
    algodIndexer: 'https://testnet-idx.algonode.cloud',
  },
  local: {
    algodNode: 'http://localhost:4001',
    apiUrl: 'http://localhost:5001',
    algodIndexer: 'http://localhost:8980',
  },
};


export const tokenizedUrls = [
  '/market/balances',
  '/market/order',
  '/market/orders',
  '/market/account/kyc/status',
  '/market/account/kyc/init',
  '/market/withdrawal-fee',
  '/market/operation-details',
  '/wallet/key',
  '/wallet/transactions',
  '/wallet/transfer',
  '/wallet/withdraw',
  '/wallet/whitelist',
  '/wallet/withdrawal-wallets',
] as const;