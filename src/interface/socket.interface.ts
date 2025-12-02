import type { Socket } from "socket.io-client";

import { STREAMS } from "@enum";


export interface SocketIOFactory {
  (url: string, options?: unknown): Socket;
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

