# @ultrade/ultrade-js-sdk

JavaScript/TypeScript SDK for Ultrade platform integration.

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
| `@ultrade/shared/browser/*` | `../shared/dist/browser/*` | Browser-specific shared utilities |
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
