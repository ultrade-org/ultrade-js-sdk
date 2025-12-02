import { STREAMS } from "@enum";

export interface SocketIOClient {
  connected: boolean;
  id: string;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler?: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  onAny: (handler: (event: string, ...args: unknown[]) => void) => void;
  disconnect: () => void;
  io: {
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    off: (event: string, handler?: (...args: unknown[]) => void) => void;
  };
}

export interface SocketIOFactory {
  (url: string, options?: unknown): SocketIOClient;
}

export interface AppSocketState {
  address: string;
  appId: number;
  orderFilter: string;
  pairKey: string;
  pairId: number;
}

interface WSOptions {
  address: string;
  token?: string;
  tradingKey?: string;
  message?: string;
  signature?: string;
  depth?: number;
  companyId?: number;
  interval?: string;
}

export interface SubscribeOptions {
  symbol: string;
  streams: STREAMS[];
  options: WSOptions;
}

export interface ServerToClientEvents {
  reconnect: () => void;
}

export interface ClientToServerEvents {
  subscribe: (options: SubscribeOptions) => void;
  unsubscribe: (options: SubscribeOptions) => void;
}

