export interface Signer {
  signAndSend: ([]) => any;
  signMessage: (msg: string, encoding?: BufferEncoding) => Promise<string>;
  signMessageByToken: (msg: string, encoding?: BufferEncoding) => Promise<string>;
}

export interface AuthCredentials {
  company: string;
  clientId?: string;
  clientSecret?: string;
  mnemonic?: string;
  signer: Signer;
}

export interface WalletCredentials {
  address: string;
  chain: string;
  provider: string;
  token: string;
  tradingKey?: string;
}

