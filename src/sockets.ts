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
  private streamCounters: Map<string, number> = new Map();
  private websocketUrl: string;
  private socketIOFactory: SocketIOFactory;
  private callbacks: Map<number, Function> = new Map();
  private onAnyRegistered: boolean = false;
  private handlerIdCounter: number = 0;

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

    this.setupReconnectHandler();
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public subscribe(
    subscribeOptions: SubscribeOptions,
    callback: Function
  ): number {
    const handlerId = Date.now() + (++this.handlerIdCounter);

    if (this.socket === null) {
      this.initializeSocket();
    }

    // Store callback for this handler
    this.callbacks.set(handlerId, callback);

    // Register onAny listener only once
    if (!this.onAnyRegistered) {
      this.socket!.onAny((event: string, ...args: unknown[]) => {
        // Call all registered callbacks
        this.callbacks.forEach((cb) => {
          cb(event, args);
        });
      });
      this.onAnyRegistered = true;
    }

    subscribeOptions.streams.forEach((stream) => {
      const streamKey = String(stream);
      if (!this.streamCounters.has(streamKey)) {
        this.streamCounters.set(streamKey, 1);
        console.log(`[SocketManager] Stream counter created: stream=${streamKey}, count=1`);
        return;
      }

      const currentCount = this.streamCounters.get(streamKey);
      this.streamCounters.set(streamKey, currentCount + 1);
      console.log(`[SocketManager] Stream counter increased: stream=${streamKey}, count=${currentCount + 1}`);
    });

    const subscribeToSocket = () => {
      if (this.socket) {
        this.socket.emit('subscribe', subscribeOptions);
        console.log(`[SocketManager] SUBSCRIBE: handlerId=${handlerId}, options=`, subscribeOptions, `connected=${this.socket.connected}, streamCounters=`, Object.fromEntries(this.streamCounters));
      }
    };

    subscribeToSocket();

    if (!this.socket!.connected) {
      this.socket!.once('connect', subscribeToSocket);
      console.log(`[SocketManager] SUBSCRIBE (also waiting for connect): handlerId=${handlerId}, options=`, subscribeOptions);
    }

    this.socketPool[handlerId] = subscribeOptions;

    return handlerId;
  }

  private setupReconnectHandler(): void {
    if (this.socket) {
      this.socket.io.off('reconnect');
      this.socket.io.on('reconnect', () => {
        // Re-subscribe all active subscriptions on reconnect
        Object.entries(this.socketPool).forEach(([id, options]) => {
          this.socket?.emit('subscribe', options);
          console.log(`[SocketManager] RECONNECT re-subscribe: handlerId=${id}, options=`, options);
        });
      });
    }
  }

  public unsubscribe(handlerId: number): void {
    // Remove callback for this handler
    this.callbacks.delete(handlerId);

    const options = this.socketPool[handlerId];
    if (!options) {
      console.log(`[SocketManager] UNSUBSCRIBE: handlerId=${handlerId} not found in socketPool`);
      return;
    }

    const streamsToUnsubscribe: number[] = [];

    options.streams.forEach((stream) => {
      const streamKey = String(stream);
      if (!this.streamCounters.has(streamKey)) {
        console.log(`[SocketManager] Stream counter not found: stream=${streamKey}, skipping unsubscribe (no subscription was made)`);
        return;
      }
      
      const currentCount = this.streamCounters.get(streamKey)!;
      
      if (currentCount === 1) {
        this.streamCounters.set(streamKey, 0);
        streamsToUnsubscribe.push(stream);
        console.log(`[SocketManager] Stream counter <= 1, will unsubscribe: stream=${streamKey}, count=${currentCount}`);
      } else if (currentCount > 1) {
        const newCount = currentCount - 1;
        this.streamCounters.set(streamKey, newCount);
        console.log(`[SocketManager] Stream counter decreased (no unsubscribe): stream=${streamKey}, count=${newCount}`);
      }
    });

    if (streamsToUnsubscribe.length > 0 && this.socket) {
      const unsubscribeOptions: SubscribeOptions = {
        ...options,
        streams: streamsToUnsubscribe,
      };
      this.socket.emit('unsubscribe', unsubscribeOptions);
      console.log(`[SocketManager] UNSUBSCRIBE: handlerId=${handlerId}, unsubscribeSentForStreams=[${streamsToUnsubscribe.join(', ')}], streamCounters=`, Object.fromEntries(this.streamCounters), `remainingSubscriptions=${Object.keys(this.socketPool).length}`);
    } else {
      console.log(`[SocketManager] UNSUBSCRIBE: handlerId=${handlerId}, no streams to unsubscribe (all counters > 1), streamCounters=`, Object.fromEntries(this.streamCounters), `remainingSubscriptions=${Object.keys(this.socketPool).length}`);
    }

    delete this.socketPool[handlerId];

    if (Object.keys(this.socketPool).length === 0 && this.socket) {
      console.log(`[SocketManager] UNSUBSCRIBE: No more subscriptions, disconnecting socket`);
      this.disconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.streamCounters.clear();
    this.callbacks.clear();
    this.onAnyRegistered = false;
    console.log(`[SocketManager] DISCONNECT: All stream counters and callbacks cleared`);
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
