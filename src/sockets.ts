import type { Socket } from 'socket.io-client';

import {
  SubscribeOptions,
  SocketIOFactory,
} from '@interface';

interface ISocketPool {
  [key: string]: SubscribeOptions
}

export class SocketManager {
  private socket: Socket | null = null;
  private socketPool: ISocketPool = {};
  private websocketUrl: string;
  private socketIOFactory: SocketIOFactory;

  constructor(
    url: string,
    socketIOFactory: SocketIOFactory,
    private onDisconnect?: (socketId: string) => void,
    private onConnectError?: (error: Error) => void
  ) {
    this.websocketUrl = url;
    this.socketIOFactory = socketIOFactory;
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (this.socket !== null) {
      return
    }

    this.socket = this.socketIOFactory(this.websocketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 9999,
      transports: ['websocket'],
    });
    if (this.onDisconnect) {
      this.socket.on('disconnect', () => {
        this.onDisconnect!(this.socket!.id);
      });
    }
    if (this.onConnectError) {
      this.socket.on('connect_error', (err: unknown) => {
        this.onConnectError!(err as Error);
      });
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public subscribe(
    subscribeOptions: SubscribeOptions,
    callback: Function
  ): number {
    const handlerId = Date.now();

    if (this.socket === null) {
      this.initializeSocket();
    }

    this.socket!.onAny((event: string, ...args: unknown[]) => {
      callback(event, args);
    });

    this.socket!.io.on('reconnect', () => {
      this.socket!.emit('subscribe', subscribeOptions);
    });

    this.socket!.emit('subscribe', subscribeOptions);
    this.socketPool[handlerId] = subscribeOptions;

    return handlerId;
  }

  public unsubscribe(handlerId: number): void {
    const options = this.socketPool[handlerId];
    if (options && this.socket) {
      this.socket.emit('unsubscribe', options);
      delete this.socketPool[handlerId];
    }

    if (Object.keys(this.socketPool).length === 0 && this.socket) {
      this.disconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  public on(event: string, handler: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  public off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.socket) {
      return
    }
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  public emit(event: string, ...args: unknown[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args as any);
    }
  }

  public emitCurrentPair(data: {
    address: string;
    pair: string;
    pair_id: number;
    order_filter: string;
  }): void {
    this.emit('currentPair', data);
  }

  public emitOrderFilter(data: { order_filter: string }): void {
    this.emit('orderFilter', data);
  }

  public onReconnect(handler: () => void): () => void {
    if (!this.socket) {
      return () => {}
    }

    this.socket.io.off('reconnect');
    this.socket.io.on('reconnect', handler);
    return () => {
      if (this.socket) {
        this.socket.io.off('reconnect', handler);
      }
    };
  }

  public offReconnect(handler?: () => void): void {
    if (!this.socket) {
      return
    }
    if (handler) {
      this.socket.io.off('reconnect', handler);
    } else {
      this.socket.io.off('reconnect');
    }
  }
}
