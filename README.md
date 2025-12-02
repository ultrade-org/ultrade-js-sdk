
JavaScript/TypeScript SDK for Ultrade platform integration.

## Overview

The `@ultrade/ultrade-js-sdk` package provides a JavaScript/TypeScript interface for interacting with ULTRADE's V2 platform, the Native Exchange (NEX) with Bridgeless Crosschain Orderbook technology. It offers a simple interface for creating and managing orders, as well as for interacting with the Ultrade API and WebSocket streams.

### Key Features

- **Deposits**: Always credited to the logged in account
- **Order Creation**: Orders are created via this SDK by cryptographically signing order messages and sending them to the API
- **Gas-Free Trading**: This process does not involve on-chain transactions and does not incur any gas costs
- **Trading Keys**: Can be associated with a specific login account and its balances. Trading keys are used for managing orders but cannot withdraw funds. This is useful for working with market maker (MM) clients on their own accounts

### Important Notes

**Atomic Units**: Token amounts and prices stated in Atomic Units represent the smallest indivisible units of the token based on its number of decimals, in an unsigned integer format.

- Example: 1 ETH (Ethereum, 18 decimals) = `1000000000000000000` (1 with 18 zeros)
- Example: 1 USDC (Algorand, 6 decimals) = `1000000` (1 with 6 zeros)

**Price Denomination**: The price is denominated based on the Price (Quote) token, while amounts of a base token are denominated according to that base token's decimals.

**Repository:** [https://github.com/ultrade-org/ultrade-js-sdk](https://github.com/ultrade-org/ultrade-js-sdk)

## Package Info

- **Name:** `@ultrade/ultrade-js-sdk`
- **Main Entry:** `./dist/index.js`
- **Types:** `./dist/index.d.ts`

## Installation

Install the package using your preferred package manager:

```bash
npm install @ultrade/ultrade-js-sdk
```

```bash
yarn add @ultrade/ultrade-js-sdk
```

```bash
pnpm add @ultrade/ultrade-js-sdk
```

## Quick Start

### Creating a Client

```typescript
import { Client } from '@ultrade/ultrade-js-sdk';
import algosdk from 'algosdk';

// Create Algorand SDK client
const algodClient = new algosdk.Algodv2(
  '', // token
  'https://testnet-api.algonode.cloud', // server
  '' // port
);

// Initialize Ultrade client
const client = new Client({
  network: 'testnet', // or 'mainnet'
  apiUrl: 'https://api.testnet.ultrade.org',
  algoSdkClient: algodClient,
  websocketUrl: 'wss://ws.testnet.ultrade.org',
});
```

### Client Options

| Option | Type | Required | Description | Default |
|--------|------|----------|-------------|---------|
| `network` | `'mainnet' \| 'testnet'` | Yes | Algorand network | - |
| `algoSdkClient` | `Algodv2` | Yes | Algorand SDK client instance | - |
| `websocketUrl` | `string` | Yes | WebSocket server URL | - |
| `companyId` | `number` | No | Company ID | 1 |
| `apiUrl` | `string` | No | Override API URL | Auto-detected |

---

## Table of Contents

1. [Authentication & Wallet](#authentication--wallet)
2. [Market Data](#market-data)
3. [Trading](#trading)
4. [Account & Balances](#account--balances)
5. [Wallet Operations](#wallet-operations)
6. [Whitelist & Withdrawal Wallets](#whitelist--withdrawal-wallets)
7. [KYC](#kyc)
8. [WebSocket](#websocket)
9. [System](#system)
10. [Notifications](#notifications)
11. [Affiliates](#affiliates)
12. [Social](#social)
13. [Social Integrations](#social-integrations)

---

## Authentication & Wallet

### login

Authenticate a user with their wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `ILoginData` | Yes | Login data object |

**ILoginData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `address` | `string` | Yes | Wallet address |
| `provider` | `PROVIDERS` | Yes | Wallet provider (PERA, METAMASK, etc.) |
| `chain` | `string` | No | Blockchain chain |
| `referralToken` | `string` | No | Referral token |
| `loginMessage` | `string` | No | Custom login message |

**Returns:** `Promise<string>` - Authentication token

**Example:**

```typescript
import { PROVIDERS } from '@ultrade/ultrade-js-sdk';
import algosdk from 'algosdk';
import { encodeBase64 } from '@ultrade/shared/browser/helpers';

// Example signer implementation
const signMessage = async (data: string, encoding?: BufferEncoding): Promise<string> => {
  // For Pera Wallet
  const message = typeof data === 'string' 
    ? new Uint8Array(Buffer.from(data, encoding))
    : data;
  
  const signedData = await peraWallet.signData([{
    data: message,
    message: 'Please sign this message'
  }], walletAddress);
  
  return encodeBase64(signedData[0]);
};

// For trading key signing
const signMessageByToken = async (data: string, encoding?: BufferEncoding): Promise<string> => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new Uint8Array(Buffer.from(message, encoding));
  
  // Get trading key from secure storage
  const keyData = secureStorage.getKeyFromLocalStorage();
  const { sk } = algosdk.mnemonicToSecretKey(keyData.mnemonic);
  
  const signature = algosdk.signBytes(bytes, sk);
  return encodeBase64(signature);
};

// Set signer before login
client.setSigner({
  signMessage,
  signMessageByToken
});

// Login with wallet
const token = await client.login({
  address: 'NWQVUPGM7TBQO5FGRWQ45VD45JLFJFRKYVVNGVI6NZA4CVWZH7SDNWCHQU',
  provider: PROVIDERS.PERA,
  chain: 'algorand',
  referralToken: 'REF_ABC123XYZ'
});

console.log('Logged in with token:', token);

// Save wallet data
client.mainWallet = {
  address: 'NWQVUPGM7TBQO5FGRWQ45VD45JLFJFRKYVVNGVI6NZA4CVWZH7SDNWCHQU',
  provider: PROVIDERS.PERA,
  token,
  chain: 'algorand'
};
```

### addTradingKey

Create a new trading key for automated trading.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `ITradingKeyData` | Yes | Trading key data object |

**ITradingKeyData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `tkAddress` | `string` | Yes | Trading key address |
| `device` | `string` | Yes | Device identifier |
| `type` | `TradingKeyType` | Yes | Key type (User or Bot) |
| `expiredDate` | `number` | No | Expiration timestamp (ms) |
| `loginAddress` | `string` | Yes | Login wallet address |
| `loginChainId` | `string \| number` | Yes | Login chain ID |

**Returns:** `Promise<TradingKeyView>`

**Example:**

```typescript
import { TradingKeyType } from '@ultrade/ultrade-js-sdk';
import algosdk from 'algosdk';

// Generate new trading key account
const generatedAccount = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(generatedAccount.sk);

// Expiration: 30 days from now (in milliseconds)
const expirationTime = Date.now() + 30 * 24 * 60 * 60 * 1000;

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
};

// Create trading key data
const tkData = {
  tkAddress: generatedAccount.addr,
  expiredDate: expirationTime,
  loginAddress: client.mainWallet.address,
  loginChainId: 'algorand',
  device: getDeviceInfo(),
  type: TradingKeyType.User
};

// Add trading key to account
const tradingKey = await client.addTradingKey(tkData);

console.log('Trading key created:', {
  address: tradingKey.address,
  type: tradingKey.type,
  expiresAt: new Date(tradingKey.expiredAt)
});

// Save mnemonic securely for signing
secureStorage.setKeyToLocalStorage({
  address: generatedAccount.addr,
  mnemonic,
  expiredAt: expirationTime
});

// Set trading key to client
client.mainWallet.tradingKey = generatedAccount.addr;
```

### revokeTradingKey

Revoke an existing trading key.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `ITradingKeyData` | Yes | Trading key data object |

**ITradingKeyData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `tkAddress` | `string` | Yes | Trading key address to revoke |
| `device` | `string` | Yes | Device identifier |
| `type` | `TradingKeyType` | Yes | Key type |
| `loginAddress` | `string` | Yes | Login wallet address |
| `loginChainId` | `string \| number` | Yes | Login chain ID |

**Returns:** `Promise<IRevokeTradingKeyResponse>`

**Example:**

```typescript
await client.revokeTradingKey({
  tkAddress: 'TK_ADDRESS_HERE',
  device: 'web-browser',
  type: TradingKeyType.User,
  loginAddress: client.mainWallet?.address || '',
  loginChainId: 'algorand'
});

console.log('Trading key revoked');
```

---

## Market Data

### getPairList

Retrieve list of all trading pairs.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | No | Filter by company ID |

**Returns:** `Promise<IPairDto[]>`

**Example:**

```typescript
const pairs = await client.getPairList();

pairs.forEach(pair => {
  console.log(`${pair.pair_name}: ${pair.base_currency}/${pair.price_currency}`);
  console.log(`Pair ID: ${pair.id}, Active: ${pair.is_active}`);
});
```

### getPair

Get detailed information about a specific trading pair.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string \| number` | Yes | Trading pair symbol or ID |

**Returns:** `Promise<IPairDto>`

**IPairDto interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Pair ID |
| `pairId` | `number` | Pair ID (alternative) |
| `pair_key` | `string` | Pair key |
| `pair_name` | `string` | Pair name |
| `base_currency` | `string` | Base currency symbol |
| `base_decimal` | `number` | Base token decimals |
| `base_id` | `string` | Base token ID |
| `base_chain_id` | `number` | Base chain ID |
| `price_currency` | `string` | Price currency symbol |
| `price_decimal` | `number` | Price token decimals |
| `price_id` | `string` | Price token ID |
| `price_chain_id` | `number` | Price chain ID |
| `min_order_size` | `string` | Minimum order size |
| `min_price_increment` | `string` | Minimum price increment |
| `min_size_increment` | `string` | Minimum size increment |
| `is_active` | `boolean` | Whether pair is active |
| `current_price` | `string` | Current price (optional) |
| `volume_24` | `string` | 24h volume (optional) |
| `change_24` | `string` | 24h change (optional) |

**Example:**

```typescript
const pair = await client.getPair('ALGO/USDC');

console.log('Pair info:', {
  id: pair.id,
  pairId: pair.pairId,
  pairName: pair.pair_name,
  baseCurrency: pair.base_currency,
  priceCurrency: pair.price_currency,
  minOrderSize: pair.min_order_size,
  minPriceIncrement: pair.min_price_increment,
  isActive: pair.is_active,
  currentPrice: pair.current_price
});
```

### getPrice

Get current market price for a trading pair.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string` | Yes | Trading pair symbol |

**Returns:** `Promise<IGetPrice>`

**IGetPrice interface:**

| Property | Type | Description |
|----------|------|-------------|
| `ask` | `number` | Ask price (sell orders) |
| `bid` | `number` | Bid price (buy orders) |
| `last` | `number` | Last trade price |

**Example:**

```typescript
const price = await client.getPrice('ALGO/USDC');

console.log('Ask price:', price.ask);
console.log('Bid price:', price.bid);
console.log('Last price:', price.last);
```

### getDepth

Get order book depth for a trading pair.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string` | Yes | Trading pair symbol |
| `depth` | `number` | Yes | Number of price levels (max 20) |

**Returns:** `Promise<IGetDepth>`

**IGetDepth interface:**

| Property | Type | Description |
|----------|------|-------------|
| `buy` | `string[][]` | Buy orders (bids) array |
| `sell` | `string[][]` | Sell orders (asks) array |
| `pair` | `string` | Trading pair symbol |
| `ts` | `number` | Timestamp |
| `U` | `number` | Update ID (upper) |
| `u` | `number` | Update ID (lower) |

**Example:**

```typescript
const depth = await client.getDepth('ALGO/USDC', 10);

console.log('Bids (buy orders):', depth.buy);
console.log('Asks (sell orders):', depth.sell);
console.log('Pair:', depth.pair);
console.log('Last update ID:', depth.U);
```

### getSymbols

Get list of trading pairs matching a pattern.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `mask` | `string` | No | Search mask (e.g., 'ALGO*') |

**Returns:** `Promise<IGetSymbols>`

**Note:** Returns an array of `IGetSymbolsItem` objects.

**IGetSymbolsItem interface:**

| Property | Type | Description |
|----------|------|-------------|
| `pairKey` | `string` | Trading pair key |

**Example:**

```typescript
const symbols = await client.getSymbols('ALGO*');

symbols.forEach(symbol => {
  console.log('Pair:', symbol.pairKey);
});
```

### getLastTrades

Get recent trades for a trading pair.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string` | Yes | Trading pair symbol |

**Returns:** `Promise<IGetLastTrades>`

**Note:** Returns a single `IGetLastTrades` object, not an array.

**IGetLastTrades interface:**

| Property | Type | Description |
|----------|------|-------------|
| `tradeId` | `number` | Trade ID |
| `amount` | `string` | Trade amount |
| `createdAt` | `number` | Creation timestamp |
| `price` | `string` | Trade price |
| `isBuyerMaker` | `boolean` | Whether buyer is maker |

**Example:**

```typescript
const trade = await client.getLastTrades('ALGO/USDC');

console.log(`Trade ${trade.tradeId}: ${trade.amount} @ ${trade.price}`);
console.log(`Buyer is maker: ${trade.isBuyerMaker}`);
console.log(`Created: ${new Date(trade.createdAt)}`);
```

### getHistory

Get historical candlestick data.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string` | Yes | Trading pair symbol |
| `interval` | `string` | Yes | Candle interval ('1m', '5m', '1h', '1d', etc.) |
| `startTime` | `number` | No | Start timestamp (ms) |
| `endTime` | `number` | No | End timestamp (ms) |
| `limit` | `number` | No | Number of candles (default: 500) |
| `page` | `number` | No | Page number (default: 1) |

**Returns:** `Promise<IGetHistoryResponse>`

**IGetHistoryResponse interface:**

| Property | Type | Description |
|----------|------|-------------|
| `t` | `number[]` | Timestamps array |
| `o` | `number[]` | Open prices array |
| `c` | `number[]` | Close prices array |
| `l` | `number[]` | Low prices array |
| `h` | `number[]` | High prices array |
| `v` | `number[]` | Volumes array |
| `q` | `number[]` | Quote volumes array |
| `s` | `string` | Symbol |
| `b` | `number` | Base value |

**Example:**

```typescript
const history = await client.getHistory(
  'ALGO/USDC',
  '1h',
  Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
  Date.now(),
  100,
  1
);

// Access candle data by index
for (let i = 0; i < history.t.length; i++) {
  console.log(`[${new Date(history.t[i])}] O:${history.o[i]} H:${history.h[i]} L:${history.l[i]} C:${history.c[i]} V:${history.v[i]}`);
}
```

---

## Trading

### createOrder

Place a new order.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | `CreateOrderArgs` | Yes | Order creation data object |

**CreateOrderArgs interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `pairId` | `number` | Yes | Trading pair ID |
| `companyId` | `number` | Yes | Company ID |
| `orderSide` | `'S' \| 'B'` | Yes | Order side (S=SELL, B=BUY) |
| `orderType` | `'L' \| 'I' \| 'P' \| 'M'` | Yes | Order type |
| `amount` | `string` | Yes | Order quantity |
| `price` | `string` | Yes | Order price |
| `decimalPrice` | `number` | Yes | Price decimal places |
| `address` | `string` | Yes | Trading key address |
| `chainId` | `number` | Yes | Chain ID |
| `baseTokenAddress` | `string` | Yes | Base token address |
| `baseTokenChainId` | `number` | Yes | Base token chain ID |
| `baseChain` | `string` | Yes | Base chain name |
| `baseCurrency` | `string` | Yes | Base currency symbol |
| `baseDecimal` | `number` | Yes | Base token decimals |
| `priceTokenAddress` | `string` | Yes | Price token address |
| `priceTokenChainId` | `number` | Yes | Price token chain ID |
| `priceChain` | `string` | Yes | Price chain name |
| `priceCurrency` | `string` | Yes | Price currency symbol |
| `priceDecimal` | `number` | Yes | Price token decimals |

**Returns:** `Promise<IOrderDto>`

**Example:**

```typescript
const order = await client.createOrder({
  pairId: 1,
  companyId: 1,
  orderSide: 'B',
  orderType: 'L',
  amount: '100',
  price: '1.25',
  decimalPrice: 2,
  address: client.mainWallet?.tradingKey || '',
  chainId: 1,
  baseTokenAddress: 'ALGO_ADDRESS',
  baseTokenChainId: 1,
  baseChain: 'algorand',
  baseCurrency: 'ALGO',
  baseDecimal: 6,
  priceTokenAddress: 'USDC_ADDRESS',
  priceTokenChainId: 1,
  priceChain: 'algorand',
  priceCurrency: 'USDC',
  priceDecimal: 6
});

console.log('Order created:', order.id);
console.log('Status:', order.status);
```

### cancelOrder

Cancel an existing order.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | `CancelOrderArgs` | Yes | Order cancellation data object |

**CancelOrderArgs interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `orderId` | `number` | Yes | Order ID to cancel |
| `orderSide` | `'S' \| 'B'` | Yes | Order side (S=SELL, B=BUY) |
| `orderType` | `'L' \| 'I' \| 'P' \| 'M'` | Yes | Order type |
| `amount` | `string` | Yes | Order amount |
| `price` | `string` | Yes | Order price |
| `baseTokenAddress` | `string` | Yes | Base token address |
| `baseChain` | `string` | Yes | Base chain name |
| `baseCurrency` | `string` | Yes | Base currency symbol |
| `baseDecimal` | `number` | Yes | Base token decimals |
| `priceTokenAddress` | `string` | Yes | Price token address |
| `priceChain` | `string` | Yes | Price chain name |
| `priceCurrency` | `string` | Yes | Price currency symbol |
| `priceDecimal` | `number` | Yes | Price token decimals |

**Returns:** `Promise<ICancelOrderResponse>`

**ICancelOrderResponse interface:**

| Property | Type | Description |
|----------|------|-------------|
| `orderId` | `number` | Order ID |
| `isCancelled` | `boolean` | Whether order was cancelled |
| `amount` | `string` | Order amount (optional) |
| `filledAmount` | `string` | Filled amount (optional) |
| `filledTotal` | `string` | Filled total (optional) |
| `averageExecutedPrice` | `string` | Average executed price (optional) |

**Example:**

```typescript
const result = await client.cancelOrder({
  orderId: 12345,
  orderSide: 'B',
  orderType: 'L',
  amount: '100',
  price: '1.25',
  baseTokenAddress: 'ALGO_ADDRESS',
  baseChain: 'algorand',
  baseCurrency: 'ALGO',
  baseDecimal: 6,
  priceTokenAddress: 'USDC_ADDRESS',
  priceChain: 'algorand',
  priceCurrency: 'USDC',
  priceDecimal: 6
});

console.log('Order cancelled:', result.isCancelled);
console.log('Order ID:', result.orderId);
if (result.filledAmount) {
  console.log('Filled amount:', result.filledAmount);
}
```

### cancelMultipleOrders

Cancel multiple orders at once.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderIds` | `number[]` | No* | Array of order IDs |
| `pairId` | `number` | No* | Cancel all orders for pair |

*At least one parameter is required

**Returns:** `Promise<ICancelMultipleOrdersResponse>`

**Note:** Returns an array of `ICancelMultipleOrdersResponseItem` objects.

**ICancelMultipleOrdersResponseItem interface:**

| Property | Type | Description |
|----------|------|-------------|
| `orderId` | `number` | Order ID |
| `pairId` | `number` | Pair ID |
| `isCancelled` | `boolean` | Whether order was cancelled |
| `reason` | `string` | Cancellation reason (optional) |
| `amount` | `string` | Order amount (optional) |
| `filledAmount` | `string` | Filled amount (optional) |
| `filledTotal` | `string` | Filled total (optional) |

**Example:**

```typescript
// Cancel specific orders
const results = await client.cancelMultipleOrders({
  orderIds: [123, 456, 789]
});

results.forEach(result => {
  console.log(`Order ${result.orderId}: ${result.isCancelled ? 'Cancelled' : 'Failed'}`);
  if (result.reason) {
    console.log(`Reason: ${result.reason}`);
  }
});

// Cancel all orders for a pair
const pairResults = await client.cancelMultipleOrders({
  pairId: 1
});
```

### getOrders

Get user's orders with filters.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | `string` | No | Filter by trading pair |
| `status` | `number` | No | Filter by status (1=Open, 2=Closed) |
| `limit` | `number` | No | Max results (default: 50) |
| `endTime` | `number` | No | End timestamp (ms) |
| `startTime` | `number` | No | Start timestamp (ms) |

**Returns:** `Promise<IOrderDto[]>`

**Example:**

```typescript
// Get all open orders
const openOrders = await client.getOrders(undefined, 1);

// Get ALGO/USDC orders
const algoOrders = await client.getOrders('ALGO/USDC');

// Get last 100 orders
const recentOrders = await client.getOrders(undefined, undefined, 100);

// Get orders with time range
const timeRangeOrders = await client.getOrders(
  'ALGO/USDC',
  1,
  50,
  Date.now(),
  Date.now() - 24 * 60 * 60 * 1000
);
```

### getOrderById

Get detailed information about a specific order.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderId` | `number` | Yes | Order ID |

**Returns:** `Promise<Order>`

**Order interface:**

Extends `IOrderDto` with additional properties:
- `executed`: `boolean` - Whether order is executed
- `updateStatus`: `OrderUpdateStaus` - Update status (optional)
- `base_currency`: `string` - Base currency symbol
- `base_decimal`: `number` - Base token decimals
- `price_currency`: `string` - Price currency symbol
- `price_decimal`: `number` - Price token decimals
- `min_size_increment`: `string` - Minimum size increment
- `min_price_increment`: `string` - Minimum price increment
- `price_id`: `number` - Price token ID

**IOrderDto properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Order ID |
| `pairId` | `number` | Pair ID |
| `pair` | `string` | Pair symbol |
| `status` | `OrderStatus` | Order status |
| `side` | `0 \| 1` | Order side (0=Buy, 1=Sell) |
| `type` | `OrderTypeEnum` | Order type |
| `price` | `string` | Order price |
| `amount` | `string` | Order amount |
| `filledAmount` | `string` | Filled amount |
| `total` | `string` | Total value |
| `filledTotal` | `string` | Filled total |
| `avgPrice` | `string` | Average execution price |
| `createdAt` | `number` | Creation timestamp |
| `updatedAt` | `number` | Update timestamp (optional) |
| `completedAt` | `number` | Completion timestamp (optional) |
| `trades` | `ITradeDto[]` | Trade history (optional) |

**Example:**

```typescript
const order = await client.getOrderById(12345);

console.log('Order details:', {
  id: order.id,
  pair: order.pair,
  side: order.side === 0 ? 'BUY' : 'SELL',
  price: order.price,
  amount: order.amount,
  filledAmount: order.filledAmount,
  status: order.status,
  executed: order.executed,
  baseCurrency: order.base_currency,
  priceCurrency: order.price_currency
});
```

---

## Account & Balances

### getBalances

Get user's balances for all assets.

**Returns:** `Promise<CodexBalanceDto[]>`

**CodexBalanceDto interface:**

| Property | Type | Description |
|----------|------|-------------|
| `hash` | `string` | Balance hash |
| `loginAddress` | `string` | Login wallet address |
| `loginChainId` | `number` | Login chain ID |
| `tokenId` | `number` | Token ID |
| `tokenAddress` | `string` | Token address |
| `tokenChainId` | `number` | Token chain ID |
| `amount` | `string` | Available amount |
| `lockedAmount` | `string` | Locked amount |

**Example:**

```typescript
const balances = await client.getBalances();

balances.forEach(balance => {
  console.log(`Token ${balance.tokenId} (${balance.tokenAddress}):`);
  console.log(`  Available: ${balance.amount}`);
  console.log(`  Locked: ${balance.lockedAmount}`);
});
```

### getCodexAssets

Get all available Codex assets.

**Returns:** `Promise<CodexBalanceDto>`

**Note:** Returns a single `CodexBalanceDto` object, not an array.

**Example:**

```typescript
const assets = await client.getCodexAssets();

console.log('Available assets:', assets);
```

### getCCTPAssets

Get CCTP (Cross-Chain Transfer Protocol) assets.

**Returns:** `Promise<MappedCCTPAssets>`

**Note:** Returns an object with dynamic keys (`[key: string]: CCTPAssets[]`), where keys are asset identifiers and values are arrays of CCTP assets.

**CCTPAssets interface:**

| Property | Type | Description |
|----------|------|-------------|
| `chainId` | `number` | Wormhole chain ID |
| `address` | `string` | Token address |
| `unifiedChainId` | `number` | Unified chain ID |

**Example:**

```typescript
const cctpAssets = await client.getCCTPAssets();

Object.keys(cctpAssets).forEach(assetKey => {
  console.log(`Asset ${assetKey}:`);
  cctpAssets[assetKey].forEach(asset => {
    console.log(`  Chain ${asset.chainId}: ${asset.address}`);
  });
});
```

### getCCTPUnifiedAssets

Get unified CCTP assets across chains.

**Returns:** `Promise<CCTPUnifiedAssets[]>`

**CCTPUnifiedAssets interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Asset ID |
| `chainId` | `number` | Chain ID |
| `address` | `string` | Token address |
| `symbol` | `string` | Token symbol |

**Example:**

```typescript
const unifiedAssets = await client.getCCTPUnifiedAssets();

unifiedAssets.forEach(asset => {
  console.log(`${asset.symbol} on chain ${asset.chainId}: ${asset.address}`);
});
```

---

## Wallet Operations

### withdraw

Withdraw funds from the exchange.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `withdrawData` | `IWithdrawData` | Yes | Withdrawal data object |
| `prettyMsg` | `string` | No | Custom withdrawal message |

**IWithdrawData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `assetId` | `number` | Yes | Asset ID to withdraw |
| `amount` | `string` | Yes | Withdrawal amount |
| `recipient` | `string` | Yes | Recipient address |
| `chainId` | `number` | No | Target chain ID |

**Returns:** `Promise<IWithdrawResponse>`

**Example:**

```typescript
const withdrawal = await client.withdraw({
  assetId: 0, // ALGO
  amount: '100',
  recipient: 'RECIPIENT_ADDRESS_HERE',
  chainId: 1
}, 'Withdrawal to my wallet');

console.log('Withdrawal operation ID:', withdrawal.operationId);
console.log('Withdrawal txn:', withdrawal.txnId);
```

### transfer

Transfer funds between accounts.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transferData` | `ITransferData` | Yes | Transfer data object |

**ITransferData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `assetId` | `number` | Yes | Asset ID |
| `amount` | `string` | Yes | Transfer amount |
| `recipient` | `string` | Yes | Recipient address |
| `memo` | `string` | No | Transfer memo |

**Returns:** `Promise<ITransfer>`

**Example:**

```typescript
const transfer = await client.transfer({
  assetId: 0,
  amount: '50',
  recipient: 'RECIPIENT_ADDRESS',
  memo: 'Payment for services'
});

console.log('Transfer ID:', transfer.transferId);
console.log('Status:', transfer.status);
```

### getWalletTransactions

Get wallet transaction history.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | Yes | Transaction type ('DEPOSIT', 'WITHDRAWAL', etc.) |
| `page` | `number` | Yes | Page number |
| `limit` | `number` | No | Results per page (default: 100) |

**Returns:** `Promise<PaginatedResult<ITransaction>>`

**Example:**

```typescript
const transactions = await client.getWalletTransactions('DEPOSIT', 1, 50);

console.log(`Page ${transactions.page} of ${transactions.totalPages}`);
console.log('Transactions:', transactions.data);
```

### getTransfers

Get transfer history.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | `number` | Yes | Page number |
| `limit` | `number` | No | Results per page (default: 100) |

**Returns:** `Promise<PaginatedResult<ITransfer>>`

**Example:**

```typescript
const transfers = await client.getTransfers(1, 20);

transfers.data.forEach(transfer => {
  console.log(`Transfer ${transfer.transferId}: ${transfer.amount} from ${transfer.senderAddress} to ${transfer.recipientAddress}`);
  console.log(`Status: ${transfer.status}, Completed: ${transfer.completedAt}`);
});
```

### getPendingTransactions

Get pending transactions.

**Returns:** `Promise<IPendingTxn[]>`

**Example:**

```typescript
const pending = await client.getPendingTransactions();

console.log('Pending transactions:', pending.length);
```

### getTradingKeys

Get user's trading keys.

**Returns:** `Promise<ITradingKey>`

**Note:** Returns a single `ITradingKey` object, not an array.

**ITradingKey interface:**

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string` | Trading key address |
| `createdAt` | `Date` | Creation timestamp |
| `expiredAt` | `Date` | Expiration timestamp |
| `orders` | `number` | Number of orders |
| `device` | `string` | Device identifier |
| `type` | `TradingKeyType` | Key type (optional) |

**Example:**

```typescript
const tradingKey = await client.getTradingKeys();

console.log('Trading key address:', tradingKey.address);
console.log('Expires at:', tradingKey.expiredAt);
console.log('Orders count:', tradingKey.orders);
```

---

## Whitelist & Withdrawal Wallets

### getWhitelist

Get withdrawal whitelist.

**Returns:** `Promise<PaginatedResult<IGetWhiteList>>`

**IGetWhiteList interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Whitelist entry ID |
| `recipientAddress` | `string` | Recipient wallet address |
| `tkAddress` | `string` | Trading key address |
| `expiredAt` | `number` | Expiration timestamp |

**Example:**

```typescript
const whitelist = await client.getWhitelist();

whitelist.data.forEach(item => {
  console.log(`${item.recipientAddress} - expires: ${new Date(item.expiredAt)}`);
});
```

### addWhitelist

Add address to withdrawal whitelist.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `IWhiteList` | Yes | Whitelist data object |

**IWhiteList interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `number` | No | Whitelist entry ID (for updates) |
| `loginAddress` | `string` | Yes | Login wallet address |
| `loginChainId` | `number` | Yes | Login chain ID |
| `recipient` | `string` | Yes | Recipient wallet address |
| `recipientChainId` | `number` | Yes | Recipient chain ID |
| `tkAddress` | `string` | Yes | Trading key address |
| `expiredDate` | `number` | No | Expiration timestamp in milliseconds (will be converted to seconds internally) |

**Returns:** `Promise<IGetWhiteList>`

**Example:**

```typescript
const whitelisted = await client.addWhitelist({
  loginAddress: client.mainWallet?.address || '',
  loginChainId: 1,
  recipient: 'WHITELISTED_ADDRESS',
  recipientChainId: 1,
  tkAddress: client.mainWallet?.tradingKey || '',
  expiredDate: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
});

console.log('Address whitelisted:', whitelisted.id);
```

### deleteWhitelist

Remove address from whitelist.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `whitelistId` | `number` | Yes | Whitelist entry ID |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.deleteWhitelist(123);
```

### getAllWithdrawalWallets

Get all withdrawal wallets.

**Returns:** `Promise<ISafeWithdrawalWallets[]>`

**ISafeWithdrawalWallets interface:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Wallet name |
| `type` | `WithdrawalWalletType` | Wallet type |
| `address` | `string` | Wallet address |
| `description` | `string` | Wallet description |
| `createdAt` | `Date` | Creation timestamp |

**Example:**

```typescript
const wallets = await client.getAllWithdrawalWallets();

wallets.forEach(wallet => {
  console.log(`${wallet.name}: ${wallet.address}`);
  console.log(`Type: ${wallet.type}, Description: ${wallet.description}`);
});
```

### createWithdrawalWallet

Create a new withdrawal wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `body` | `CreateWithdrawalWallet` | Yes | Withdrawal wallet creation data object |

**CreateWithdrawalWallet interface:**

Extends `ISignedMessage<WithdrawalWalletData>` with:
- `data`: Contains `address`, `name`, `type`, `description?`
- `message`: Signed message
- `signature`: Message signature

**Returns:** `Promise<ISafeWithdrawalWallets>`

**ISafeWithdrawalWallets interface:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Wallet name |
| `type` | `WithdrawalWalletType` | Wallet type |
| `address` | `string` | Wallet address |
| `description` | `string` | Wallet description |
| `createdAt` | `Date` | Creation timestamp |

**Example:**

```typescript
const wallet = await client.createWithdrawalWallet({
  data: {
    address: 'WALLET_ADDRESS',
    name: 'Main wallet',
    type: WithdrawalWalletType.SAFE,
    description: 'My main withdrawal wallet'
  },
  message: 'SIGNED_MESSAGE',
  signature: 'SIGNATURE'
});

console.log('Wallet created:', wallet.address);
console.log('Name:', wallet.name);
```

### updateWithdrawalWallet

Update withdrawal wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | `UpdateWithdrawalWallet` | Yes | Withdrawal wallet update data object |

**UpdateWithdrawalWallet interface:**

Extends `ISignedMessage<UpdateWithdrawalWalletData>` with:
- `data`: Contains `oldAddress`, `address`, `name`, `type`, `description?`
- `message`: Signed message
- `signature`: Message signature

**Returns:** `Promise<boolean>`

**Example:**

```typescript
await client.updateWithdrawalWallet({
  data: {
    oldAddress: 'OLD_WALLET_ADDRESS',
    address: 'NEW_WALLET_ADDRESS',
    name: 'Updated wallet name',
    type: WithdrawalWalletType.SAFE,
    description: 'Updated description'
  },
  message: 'SIGNED_MESSAGE',
  signature: 'SIGNATURE'
});
```

### deleteWithdrawalWallet

Delete withdrawal wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | `string` | Yes | Wallet address |

**Returns:** `Promise<boolean>`

**Example:**

```typescript
await client.deleteWithdrawalWallet('WALLET_ADDRESS');
```

---

## KYC

### getKycStatus

Get user's KYC verification status.

**Returns:** `Promise<IGetKycStatus>`

**IGetKycStatus interface:**

| Property | Type | Description |
|----------|------|-------------|
| `kycStatus` | `KYCAuthenticationStatus` | KYC authentication status (optional) |

**Example:**

```typescript
import { KYCAuthenticationStatus } from '@ultrade/ultrade-js-sdk';

const kycStatus = await client.getKycStatus();

if (kycStatus.kycStatus) {
  console.log('KYC status:', kycStatus.kycStatus);
}
```

### getKycInitLink

Initialize KYC verification process.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `embeddedAppUrl` | `string \| null` | Yes | Callback URL after KYC |

**Returns:** `Promise<IGetKycInitLink>`

**Example:**

```typescript
const kycLink = await client.getKycInitLink('https://myapp.com/kyc-callback');

console.log('KYC verification URL:', kycLink.url);
window.open(kycLink.url, '_blank');
```

---

## WebSocket

### subscribe

Subscribe to real-time WebSocket streams.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscribeOptions` | `SubscribeOptions` | Yes | Subscription options object |
| `callback` | `Function` | Yes | Event callback function |

**SubscribeOptions interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `symbol` | `string` | Yes | Trading pair symbol |
| `streams` | `STREAMS[]` | Yes | Array of streams to subscribe |
| `options` | `object` | Yes | Subscription options (e.g., `address`, `depth`, `token`, `tradingKey`) |

**Returns:** `number` - Handler ID for unsubscribing

**Example:**

```typescript
import { STREAMS } from '@ultrade/ultrade-js-sdk';

const handlerId = client.subscribe(
  {
    symbol: 'ALGO/USDC',
    streams: [STREAMS.DEPTH, STREAMS.TRADES, STREAMS.TICKER],
    options: {
      address: client.mainWallet?.address || '',
      depth: 10
    }
  },
  (event: string, data: any) => {
    console.log('WebSocket event:', event, data);
    
    switch(event) {
      case 'depth':
        console.log('Order book update:', data);
        break;
      case 'trade':
        console.log('New trade:', data);
        break;
      case 'ticker':
        console.log('Price ticker:', data);
        break;
    }
  }
);

// Save handler ID for cleanup
```

### unsubscribe

Unsubscribe from WebSocket streams.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `handlerId` | `number` | Yes | Handler ID from subscribe |

**Returns:** `void`

**Example:**

```typescript
// Unsubscribe using handler ID
client.unsubscribe(handlerId);
```

---

## System

### getSettings

Get platform settings.

**Returns:** `Promise<SettingsInit>`

**Note:** Returns an object with dynamic keys based on `SettingIds` enum. Common properties include:
- `partnerId`: Partner ID
- `isUltrade`: Whether it's Ultrade platform
- `companyId`: Company ID
- `currentCountry`: Current country (optional)
- Various setting values indexed by `SettingIds` enum keys

**Example:**

```typescript
const settings = await client.getSettings();

console.log('Company ID:', settings.companyId);
console.log('Partner ID:', settings.partnerId);
console.log('Is Ultrade:', settings.isUltrade);
console.log('Current country:', settings.currentCountry);
// Access specific settings by SettingIds enum
console.log('App title:', settings[SettingIds.APP_TITLE]);
```

### getVersion

Get API version information.

**Returns:** `Promise<ISystemVersion>`

**ISystemVersion interface:**

| Property | Type | Description |
|----------|------|-------------|
| `version` | `string \| null` | API version string |

**Example:**

```typescript
const version = await client.getVersion();

console.log('API version:', version.version);
```

### getMaintenance

Get maintenance status.

**Returns:** `Promise<ISystemMaintenance>`

**ISystemMaintenance interface:**

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `MaintenanceMode` | Maintenance mode enum |

**Example:**

```typescript
import { MaintenanceMode } from '@ultrade/ultrade-js-sdk';

const maintenance = await client.getMaintenance();

if (maintenance.mode === MaintenanceMode.ACTIVE) {
  console.log('Platform is under maintenance');
}
```

### ping

Check latency to the server.

**Returns:** `Promise<number>` - Latency in milliseconds

**Example:**

```typescript
const latency = await client.ping();

console.log(`Server latency: ${latency}ms`);
```

### getChains

Get supported blockchain chains.

**Returns:** `Promise<Chain[]>`

**Chain interface:**

| Property | Type | Description |
|----------|------|-------------|
| `chainId` | `number` | Chain ID |
| `whChainId` | `string` | Wormhole chain ID |
| `tmc` | `string` | TMC identifier |
| `name` | `BLOCKCHAINS` | Blockchain name enum |

**Example:**

```typescript
const chains = await client.getChains();

chains.forEach(chain => {
  console.log(`${chain.name} (Chain ID: ${chain.chainId}, WH Chain ID: ${chain.whChainId})`);
});
```

### getDollarValues

Get USD values for assets.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `assetIds` | `number[]` | No | Array of asset IDs (default: empty array for all) |

**Returns:** `Promise<IGetDollarValues>`

**Note:** Returns an object with dynamic keys (`[key: string]: number`), where keys are asset IDs and values are USD prices.

**Example:**

```typescript
// Get prices for specific assets
const prices = await client.getDollarValues([0, 1, 2]);

// Get prices for all assets
const allPrices = await client.getDollarValues();

// Access prices by asset ID
Object.keys(prices).forEach(assetId => {
  console.log(`Asset ${assetId}: $${prices[assetId]}`);
});
```

### getTransactionDetalis

Get detailed transaction information.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionId` | `number` | Yes | Transaction ID |

**Returns:** `Promise<ITransactionDetails>`

**Example:**

```typescript
const details = await client.getTransactionDetalis(12345);

console.log('Transaction:', {
  id: details.id,
  primaryId: details.primaryId,
  actionType: details.action_type,
  amount: details.amount,
  status: details.status,
  targetAddress: details.targetAddress,
  timestamp: details.timestamp,
  createdAt: details.createdAt,
  fee: details.fee
});
```

### getWithdrawalFee

Get withdrawal fee for an asset.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `assetAddress` | `string` | Yes | Asset address |
| `chainId` | `number` | Yes | Chain ID |

**Returns:** `Promise<IWithdrawalFee>`

**IWithdrawalFee interface:**

| Property | Type | Description |
|----------|------|-------------|
| `fee` | `string` | Withdrawal fee amount |
| `dollarValue` | `string` | Fee value in USD |

**Example:**

```typescript
const fee = await client.getWithdrawalFee('ASSET_ADDRESS', 1);

console.log('Withdrawal fee:', fee.fee);
console.log('Fee in USD:', fee.dollarValue);
```

---

## Notifications

### getNotifications

Get user notifications.

**Returns:** `Promise<UserNotification[]>`

**UserNotification interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Notification ID |
| `globalNotificationId` | `number` | Global notification ID |
| `priority` | `any` | Notification priority |
| `status` | `any` | Notification status |
| `type` | `any` | Notification type |
| `message` | `string` | Notification message |
| `createdAt` | `Date` | Creation timestamp |

**Example:**

```typescript
const notifications = await client.getNotifications();

notifications.forEach(notif => {
  console.log(`[${notif.type}] ${notif.message}`);
  console.log('Status:', notif.status);
  console.log('Created:', notif.createdAt);
});
```

### getNotificationsUnreadCount

Get count of unread notifications.

**Returns:** `Promise<IUnreadNotificationsCount>`

**Example:**

```typescript
const { count } = await client.getNotificationsUnreadCount();

console.log(`You have ${count} unread notifications`);
```

### readNotifications

Mark notifications as read.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `notifications` | `UpdateUserNotificationDto[]` | Yes | Array of notifications to update |

**UpdateUserNotificationDto interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `number` | No | Notification ID |
| `globalNotificationId` | `number` | No | Global notification ID |
| `status` | `NotificationStatusEnum` | Yes | Notification status |

**Returns:** `Promise<UpdateUserNotificationDto[]>`

**Example:**

```typescript
import { NotificationStatusEnum } from '@ultrade/ultrade-js-sdk';

await client.readNotifications([
  { id: 1, status: NotificationStatusEnum.READ },
  { globalNotificationId: 2, status: NotificationStatusEnum.READ }
]);
```

---

## Affiliates

### getAffiliatesStatus

Get affiliate program status.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | Yes | Company ID |

**Returns:** `Promise<IAffiliateDashboardStatus>`

**IAffiliateDashboardStatus interface:**

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `boolean` | Whether affiliate program is enabled |
| `isAffiliate` | `boolean` | Whether user is an affiliate |

**Example:**

```typescript
const status = await client.getAffiliatesStatus(1);

console.log('Is affiliate:', status.isAffiliate);
console.log('Program enabled:', status.enabled);
```

### createAffiliate

Register as an affiliate.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | Yes | Company ID |

**Returns:** `Promise<DashboardInfo>`

**DashboardInfo interface:**

| Property | Type | Description |
|----------|------|-------------|
| `feeShare` | `number` | Fee share percentage |
| `referralLink` | `string` | Referral link |
| `summaryStats` | `AffiliateSummaryStats` | Summary statistics |
| `trendStats` | `AffiliateTrendStats \| null` | Trend statistics (optional) |

**Example:**

```typescript
const affiliate = await client.createAffiliate(1);

console.log('Referral link:', affiliate.referralLink);
console.log('Fee share:', affiliate.feeShare);
console.log('Summary stats:', affiliate.summaryStats);
```

### getAffiliateProgress

Get affiliate progress.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | Yes | Company ID |

**Returns:** `Promise<IAffiliateProgress>`

**IAffiliateProgress interface:**

| Property | Type | Description |
|----------|------|-------------|
| `totalTradingVolumeUsd` | `number` | Total trading volume in USD |
| `unlockThreshold` | `number` | Threshold to unlock affiliate status |

**Example:**

```typescript
const progress = await client.getAffiliateProgress(1);

console.log('Trading volume (USD):', progress.totalTradingVolumeUsd);
console.log('Unlock threshold:', progress.unlockThreshold);
console.log('Progress:', (progress.totalTradingVolumeUsd / progress.unlockThreshold * 100).toFixed(2) + '%');
```

### getAffiliateInfo

Get affiliate dashboard information.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | Yes | Company ID |
| `range` | `string` | Yes | Date range ('day', 'week', 'month', 'all') |

**Returns:** `Promise<DashboardInfo>`

**Example:**

```typescript
const info = await client.getAffiliateInfo(1, 'month');

console.log('Referral link:', info.referralLink);
console.log('Fee share:', info.feeShare);
console.log('Total revenue:', info.summaryStats.totalRevenue);
console.log('Link clicks:', info.summaryStats.linkClicks);
console.log('Registrations:', info.summaryStats.registrations);
console.log('Trading volume:', info.summaryStats.totalTradingVolume);
```

### countAffiliateDepost

Count affiliate deposit.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | `number` | Yes | Company ID |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.countAffiliateDepost(1);
```

### countAffiliateClick

Track affiliate referral click.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `referralToken` | `string` | Yes | Referral token |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.countAffiliateClick('REF123');
```

---

## Social

### getSocialAccount

Get user's social account information.

**Returns:** `Promise<ISocialAccount | undefined>`

**ISocialAccount interface:**

| Property | Type | Description |
|----------|------|-------------|
| `points` | `number` | User points |
| `address` | `string` | Wallet address |
| `email` | `string` | Email address (optional) |
| `emailVerified` | `boolean` | Email verification status |
| `twitterAccount` | `object` | Twitter account info (optional) |
| `telegramAccount` | `object` | Telegram account info (optional) |
| `discordAccount` | `object` | Discord account info (optional) |

**Example:**

```typescript
const social = await client.getSocialAccount();

if (social) {
  console.log('Address:', social.address);
  console.log('Points:', social.points);
  console.log('Email:', social.email);
  console.log('Email verified:', social.emailVerified);
  if (social.twitterAccount) {
    console.log('Twitter:', social.twitterAccount.userName);
  }
}
```

### addSocialEmail

Add email to social account.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | Email address |
| `embeddedAppUrl` | `string` | Yes | Callback URL |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.addSocialEmail(
  'user@example.com',
  'https://myapp.com/verify'
);

console.log('Verification email sent');
```

### verifySocialEmail

Verify email address.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | Email address |
| `hash` | `string` | Yes | Verification hash |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.verifySocialEmail(
  'user@example.com',
  'VERIFICATION_HASH'
);

console.log('Email verified');
```

### getLeaderboards

Get leaderboard rankings.

**Returns:** `Promise<ILeaderboardItem[]>`

**ILeaderboardItem interface:**

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string` | Wallet address |
| `currentPoints` | `number` | Current points |
| `tasksCompleted` | `number` | Number of completed tasks |
| `twitter` | `string` | Twitter username (optional) |
| `discord` | `string` | Discord username (optional) |
| `telegram` | `string` | Telegram username (optional) |
| `order` | `number` | Ranking position |

**Example:**

```typescript
const leaderboard = await client.getLeaderboards();

leaderboard.forEach((item) => {
  console.log(`${item.order}. ${item.address} - ${item.currentPoints} points`);
  console.log(`Tasks completed: ${item.tasksCompleted}`);
});
```

### getUnlocks

Get user's unlocked achievements.

**Returns:** `Promise<IUnlock[]>`

**IUnlock interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unlock ID |
| `companyId` | `number` | Company ID |
| `seasonId` | `number` | Season ID |
| `name` | `string` | Unlock name |
| `description` | `string` | Unlock description |
| `points` | `number` | Points required |
| `enabled` | `boolean` | Whether unlock is enabled |

**Example:**

```typescript
const unlocks = await client.getUnlocks();

unlocks.forEach(unlock => {
  console.log(`Unlocked: ${unlock.name} - ${unlock.description}`);
  console.log(`Points: ${unlock.points}`);
});
```

### getSocialSettings

Get social feature settings.

**Returns:** `Promise<ISocialSettings>`

**Note:** Returns an object with dynamic key-value pairs (`[key: string]: any`).

**Example:**

```typescript
const settings = await client.getSocialSettings();

console.log('Social settings:', settings);
// Access specific settings by key
console.log('Setting value:', settings['someKey']);
```

### getSeason

Get current active season.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ultradeId` | `number` | No | Ultrade ID (optional) |

**Returns:** `Promise<ISocialSeason>`

**Example:**

```typescript
// Get season for default company
const season = await client.getSeason();

// Get season for specific Ultrade ID
const ultradeSeason = await client.getSeason(1);

console.log('Season:', season.name);
console.log('Start:', new Date(season.startDate));
console.log('End:', season.endDate ? new Date(season.endDate) : 'Ongoing');
```

### getPastSeasons

Get historical seasons.

**Returns:** `Promise<ISocialSeason[]>`

**ISocialSeason interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Season ID |
| `companyId` | `number` | Company ID |
| `startDate` | `Date` | Season start date |
| `endDate` | `Date` | Season end date (optional) |
| `name` | `string` | Season name |
| `isSelected` | `boolean` | Whether season is selected |
| `status` | `string` | Season status |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Update timestamp |

**Example:**

```typescript
const pastSeasons = await client.getPastSeasons();

pastSeasons.forEach(season => {
  console.log(`${season.name} (${new Date(season.startDate)} - ${season.endDate ? new Date(season.endDate) : 'Ongoing'})`);
  console.log(`Status: ${season.status}, Selected: ${season.isSelected}`);
});
```

---

## Social Integrations

### Telegram

#### addTelegram

Connect Telegram account.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `TelegramData` | Yes | Telegram authentication data |

**TelegramData interface:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `auth_date` | `number` | Yes | Authentication date timestamp |
| `id` | `number` | Yes | Telegram user ID |
| `first_name` | `string` | Yes | First name |
| `hash` | `string` | Yes | Authentication hash |
| `photo_url` | `string` | Yes | Profile photo URL |
| `username` | `string` | Yes | Telegram username |

**Returns:** `Promise<ITelegramConnectResponse>`

**Example:**

```typescript
const result = await client.addTelegram({
  auth_date: Math.floor(Date.now() / 1000),
  id: 123456789,
  first_name: 'John',
  hash: 'TELEGRAM_HASH',
  photo_url: 'https://t.me/photo.jpg',
  username: 'myusername'
});

console.log('Telegram connected:', result.address);
console.log('Telegram ID:', result.telegramId);
```

#### disconnectTelegram

Disconnect Telegram account.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `TelegramData` | Yes | Telegram authentication data |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.disconnectTelegram({
  auth_date: Math.floor(Date.now() / 1000),
  id: 123456789,
  first_name: 'John',
  hash: 'TELEGRAM_HASH',
  photo_url: 'https://t.me/photo.jpg',
  username: 'myusername'
});
```

### Discord

#### getDiscordConnectionUrl

Get Discord OAuth URL.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | Callback URL |

**Returns:** `Promise<string>` - Discord OAuth URL

**Example:**

```typescript
const discordUrl = await client.getDiscordConnectionUrl(
  'https://myapp.com/discord-callback'
);

window.open(discordUrl, '_blank');
```

#### disconnectDiscord

Disconnect Discord account.

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.disconnectDiscord();
```

### Twitter

#### getTwitterConnectionUrl

Get Twitter OAuth URL.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `appUrl` | `string` | Yes | Callback URL |
| `permissions` | `string` | No | OAuth scopes |

**Returns:** `Promise<string>` - Twitter OAuth URL

**Example:**

```typescript
const twitterUrl = await client.getTwitterConnectionUrl(
  'https://myapp.com/twitter-callback',
  'tweet.read tweet.write'
);

window.open(twitterUrl, '_blank');
```

#### disconnectTwitter

Disconnect Twitter account.

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.disconnectTwitter();
```

#### getTweets

Get company tweets for interaction.

**Returns:** `Promise<ICompanyTweet[]>`

**ICompanyTweet interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Tweet ID |
| `companyId` | `number` | Company ID |
| `seasonId` | `number` | Season ID |
| `type` | `string` | Tweet type |
| `text` | `string` | Tweet text |
| `enabled` | `boolean` | Whether tweet is enabled |
| `isProcessed` | `boolean` | Processing status |
| `expiresAt` | `Date` | Expiration date |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Update timestamp |

**Example:**

```typescript
const tweets = await client.getTweets();

tweets.forEach(tweet => {
  console.log('Tweet:', tweet.text);
  console.log('Type:', tweet.type);
  console.log('Enabled:', tweet.enabled);
  console.log('Expires:', tweet.expiresAt);
});
```

#### actionWithTweet

Perform actions on a tweet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `{ actions: Array<{ id: number; text?: string }>; tweetId?: string }` | Yes | Action data object |

**Returns:** `Promise<void>`

**Example:**

```typescript
await client.actionWithTweet({
  actions: [
    { id: 1 }, // Like
    { id: 2, text: 'Great project!' } // Comment
  ],
  tweetId: 'TWEET_ID'
});
```

#### getActions

Get available social actions.

**Returns:** `Promise<IAction[]>`

**Example:**

```typescript
const actions = await client.getActions();

actions.forEach(action => {
  console.log(`${action.name}: ${action.points} points`);
});
```

#### getActionHistory

Get user's action history.

**Returns:** `Promise<IActionHistory[]>`

**IActionHistory interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | History entry ID |
| `address` | `string` | Wallet address |
| `companyId` | `number` | Company ID |
| `actionId` | `number` | Action ID |
| `seasonId` | `number` | Season ID |
| `source` | `string` | Action source |
| `points` | `number` | Points earned |
| `referenceId` | `string` | Reference ID (optional) |
| `createdAt` | `Date` | Creation timestamp |

**Example:**

```typescript
const history = await client.getActionHistory();

history.forEach(item => {
  console.log(`Action ${item.actionId} - ${item.points} points - ${item.source}`);
  console.log(`Date: ${item.createdAt}`);
});
```

#### getAIStyles

Get available AI comment styles.

**Returns:** `Promise<IAIStyle[]>`

**IAIStyle interface:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Style ID |
| `title` | `string` | Style title |
| `content` | `string` | Style content |
| `enabled` | `boolean` | Whether style is enabled |
| `type` | `string` | Style type |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Update timestamp |

**Example:**

```typescript
const styles = await client.getAIStyles();

styles.forEach(style => {
  console.log(`${style.title}: ${style.content}`);
  console.log(`Type: ${style.type}, Enabled: ${style.enabled}`);
});
```

#### getAIComment

Generate AI comment for a tweet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `styleId` | `number` | Yes | AI style ID |
| `tweetId` | `string` | Yes | Tweet ID |

**Returns:** `Promise<IAIGeneratedComment>`

**Example:**

```typescript
const comment = await client.getAIComment(1, 'TWEET_ID');

console.log('Generated comment:', comment.comment);
console.log('Requests left:', comment.requestsLeft);
```

---

## Structure

```
src/
├── argsAsObj/              # Method argument interfaces (RO-RO pattern)
│   ├── affiliates.args.ts  # Affiliate method arguments
│   ├── auth.args.ts        # Authentication arguments
│   ├── client.args.ts      # Client configuration arguments
│   ├── market.args.ts      # Market data arguments
│   ├── social.args.ts      # Social features arguments
│   ├── system.args.ts      # System method arguments
│   ├── trading.args.ts     # Trading operation arguments
│   ├── wallet.args.ts      # Wallet operation arguments
│   └── index.ts            # Barrel export
│
├── const/                  # Constants
│   ├── auth.const.ts       # Authentication constants
│   ├── client.const.ts     # Client configuration constants
│   └── index.ts
│
├── enum/                   # Enumerations
│   ├── account.enum.ts     # Account-related enums
│   ├── affiliates.enum.ts  # Affiliate enums
│   ├── common.enum.ts      # Common enums
│   ├── market.enum.ts      # Market enums
│   ├── social.enum.ts      # Social enums
│   ├── socket.enum.ts      # WebSocket stream enums
│   └── index.ts
│
├── interface/              # TypeScript interfaces
│   ├── account.interface.ts        # Account data interfaces
│   ├── affiliates.interface.ts     # Affiliate interfaces
│   ├── assets.interface.ts         # Asset interfaces
│   ├── auth.interface.ts           # Auth interfaces
│   ├── client.interface.ts         # Client interfaces
│   ├── common.interface.ts         # Common interfaces
│   ├── maintenance.interface.ts    # Maintenance interfaces
│   ├── market.interface.ts         # Market interfaces
│   ├── notification.interface.ts   # Notification interfaces
│   ├── social.interface.ts         # Social interfaces
│   ├── socket.interface.ts         # WebSocket interfaces
│   ├── system.interface.ts         # System interfaces
│   ├── trading.interface.ts        # Trading interfaces
│   ├── wallet.interface.ts         # Wallet interfaces
│   └── index.ts
│
├── utils/                  # Utility functions
│   ├── algodService.ts     # Algorand service
│   ├── algorand.util.ts    # Algorand utilities
│   ├── client.util.ts      # Client utilities
│   └── index.ts
│
├── client.ts               # Main SDK Client class
├── localStorage.ts         # Local storage service
├── sockets.ts              # WebSocket manager
└── index.ts                # Main entry point
```

## TypeScript Path Aliases

Defined in `tsconfig.alias.json`:

| Alias | Path | Description |
|-------|------|-------------|
| `@utils` | `./src/utils/index.ts` | Utility functions |
| `@interface` | `./src/interface/index.ts` | TypeScript interfaces |
| `@const` | `./src/const/index.ts` | Constants |
| `@enum` | `./src/enum/index.ts` | Enumerations |



## Build Commands

**Important:** First install node_modules from monorepo root (npm_packages)

- `npm run build` - Production build
- `npm run dev` - Development build with watch mode
- `npm run version:update` - Bump patch version

## Exports

The package exports:
- `Client` class - Main SDK client
- `SocketManager` - WebSocket connection manager
- All constants from `@const`
- All enums from `@enum`
- All interfaces from `@interface`
- All argument interfaces from `./argsAsObj`
