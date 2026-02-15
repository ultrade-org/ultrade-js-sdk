import type { Socket } from "socket.io-client";

import { STREAMS } from "@enum";
import type { SubscribeOptions, WSOptions } from "@ultrade/shared/browser/interfaces";

export type { SubscribeOptions, WSOptions } from "@ultrade/shared/browser/interfaces";

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

export interface ServerToClientEvents {
  reconnect: () => void;
}

export interface ClientToServerEvents {
  subscribe: (options: SubscribeOptions) => void;
  unsubscribe: (options: SubscribeOptions) => void;
}

