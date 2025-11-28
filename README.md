# 🚀 Meme Stock Exchange

A full-stack, real-time stock exchange simulation for trading meme stocks. Features a custom-built matching engine, live price streaming via SSE, and automated trading bots.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend](#backend)
- [Dashboard](#dashboard)
- [Trading Bots](#trading-bots)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)

---

## Overview

Meme Stock Exchange is a simulated stock trading platform that allows users to:

- **Trade meme stocks** (MEME1, MEME2) with limit and market orders
- **View real-time prices** via Server-Sent Events (SSE)
- **Authenticate** via Google OAuth through Supabase
- **Automated market activity** via trading bots with different personalities

### Key Features

- ⚡ **Real-time matching engine** with price-time priority
- 📊 **Live price streaming** via SSE (Server-Sent Events)
- 🤖 **Automated trading bots** (Aggressive, Conservative, Random)
- 🔐 **JWT authentication** for users, API key auth for bots
- 📈 **In-memory order book** with database persistence

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Dashboard    │────▶│     Backend     │◀────│  Trading Bots   │
│   (Next.js)     │ SSE │   (NestJS)      │ API │   (Node.js)     │
│                 │◀────│                 │────▶│                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │ Prisma ORM
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   PostgreSQL    │
                        │   (Supabase)    │
                        │                 │
                        └─────────────────┘
```

### Data Flow

1. **Order Placement**: User/Bot → API → Order Service → Broker Service (Matching Engine)
2. **Matching**: Broker Service matches orders → Updates DB → Emits SSE events
3. **Price Updates**: SSE events → Dashboard updates in real-time

---

## Project Structure

```
meme-stock-exchange/
├── package.json              # Root workspace configuration
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── apis/            # API controllers & services
│   │   │   ├── order/       # User order endpoints
│   │   │   ├── bot-order/   # Bot order endpoints (API key auth)
│   │   │   ├── market-data/ # SSE streaming endpoints
│   │   │   └── oauth/       # Google OAuth flow
│   │   ├── auth/            # JWT & API key guards
│   │   ├── services/        # Core services
│   │   │   ├── broker.service.ts    # Matching engine
│   │   │   ├── prisma.service.ts    # Database client
│   │   │   └── supabase.service.ts  # Supabase client
│   │   └── common/          # Shared configs
│   └── prisma/
│       └── schema.prisma    # Database schema
├── dashboard/                # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Login & callback pages
│   │   ├── (protected)/     # Authenticated pages
│   │   │   ├── dashboard/   # Symbol cards with live prices
│   │   │   └── symbol/[symbol]/ # Trading page with chart
│   │   └── (public)/        # Public pages
│   ├── components/          # UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   │   └── usePriceStream.ts # SSE price subscription hook
│   └── lib/                 # Utilities & Supabase client
└── trading-bots/            # Automated trading system
    ├── src/
    │   ├── bots/            # Bot implementations
    │   │   ├── Bot.ts       # Abstract base class
    │   │   ├── AggressiveBot.ts
    │   │   ├── ConservativeBot.ts
    │   │   └── RandomBot.ts
    │   ├── services/        # API & price services
    │   └── utils/           # Randomization utilities
    └── .env                 # Bot configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (workspace manager)
- PostgreSQL database (or Supabase account)

### Installation

```bash
# Clone the repository
git clone https://github.com/Anuj-Gill/meme-stock-exchange.git
cd meme-stock-exchange

# Install all dependencies (workspaces)
yarn install
```

### Environment Setup

Create `.env` files in each project:

**backend/.env**
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/oauth/callback"
FRONTEND_URL="http://localhost:3000"
BOT_API_KEY="your-secret-bot-api-key"
ENVIRONMENT="development"
PORT=4000
```

**dashboard/.env.local**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**trading-bots/.env**
```env
BACKEND_URL=http://localhost:4000
BOT_API_KEY=your-secret-bot-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
BOT_AGGRESSIVE_USER_ID=uuid-of-aggressive-bot-user
BOT_CONSERVATIVE_USER_ID=uuid-of-conservative-bot-user
BOT_RANDOM_USER_ID=uuid-of-random-bot-user
BOTS_ENABLED=true
```

### Running the Project

```bash
# Terminal 1: Backend
cd backend
yarn start:dev

# Terminal 2: Dashboard
cd dashboard
yarn dev

# Terminal 3: Trading Bots (optional)
cd trading-bots
yarn dev
```

---

## Backend

**Tech Stack**: NestJS, Prisma, PostgreSQL, EventEmitter2

### Matching Engine (`broker.service.ts`)

The core of the exchange - a custom-built order matching engine:

#### Data Structures

```typescript
// Order Book per symbol
OrderBook {
  symbol: string
  bids: OrderBookSide    // Buy orders (sorted DESC by price)
  asks: OrderBookSide    // Sell orders (sorted ASC by price)
  lastTradePrice: number
}

// Each side of the order book
OrderBookSide {
  priceLevels: number[]           // Sorted price levels
  levelMap: Map<price, LinkedList> // Price → Queue of orders
  orderMap: Map<orderId, {price, node}> // O(1) order lookup
}

// FIFO queue at each price level
LinkedList {
  head: ListNode
  tail: ListNode
  addNodeToTail(node)
  removeHeadNode()
}
```

#### Matching Algorithm

1. **Limit Orders**: Match against opposite side if price crosses, add remainder to book
2. **Market Orders**: Match immediately at best available price, cancel unfilled (IOC)
3. **Price-Time Priority**: Best price first, then FIFO within price level

#### Order Flow

```
Order Created → Validate → Match Against Book → Update DB → Emit SSE → Add Remainder to Book
```

### API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /order` | JWT | Place order (users) |
| `POST /bot-order` | API Key | Place order (bots) |
| `GET /market-data/stream` | None | SSE stream (all symbols) |
| `GET /market-data/stream/:symbol` | None | SSE stream (single symbol) |
| `GET /oauth/login` | None | Initiate Google OAuth |
| `GET /oauth/callback` | None | OAuth callback |

### Authentication

- **Users**: JWT tokens stored in HTTP-only cookies
- **Bots**: API key in `x-api-key` header + user ID in `x-user-id` header

---

## Dashboard

**Tech Stack**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui

### Key Components

#### `usePriceStream` Hook

Subscribes to SSE price updates:

```typescript
const { prices, lastUpdate, isConnected } = usePriceStream({ symbol: 'MEME1' });
// prices: Map<symbol, price>
// lastUpdate: { symbol, price, quantity, timestamp }
```

#### Pages

- `/login` - Google OAuth sign-in
- `/dashboard` - Symbol cards with live prices
- `/symbol/[symbol]` - Trading page with live chart and order form

### Real-time Chart

SVG-based line chart with gradient fill, similar to Groww/Robinhood:

```tsx
<svg viewBox="0 0 100 100">
  <path d={areaPath} fill="url(#priceGradient)" />
  <polyline points={linePoints} stroke="#3b82f6" />
</svg>
```

---

## Trading Bots

**Tech Stack**: Node.js, TypeScript, Supabase client

Automated trading bots that simulate market activity.

### Bot Personalities

| Bot | Interval | Market Orders | Price Variance | Quantity |
|-----|----------|---------------|----------------|----------|
| **Aggressive** | 10-30s | 70% | ±0.5% | 50-200 |
| **Conservative** | 30-60s | 10% | ±2-5% | 10-50 |
| **Random** | 5-90s | 50% | ±1-10% | 5-150 |

### Configuration

Edit bot files in `trading-bots/src/bots/`:

```typescript
// AggressiveBot.ts
getMinDelay(): number { return 10000; }  // 10 seconds
getMaxDelay(): number { return 30000; }  // 30 seconds
```

### Bot User Setup

Create bot users in Supabase (see `bot-users.sql`):

```sql
INSERT INTO users (supabase_id, name, email, provider, refresh_token)
VALUES 
  (gen_random_uuid(), 'Aggressive Bot', 'bot-aggressive@local', 'system', 'token'),
  (gen_random_uuid(), 'Conservative Bot', 'bot-conservative@local', 'system', 'token'),
  (gen_random_uuid(), 'Random Bot', 'bot-random@local', 'system', 'token');
```

---

## Database Schema

### Core Models

```prisma
model User {
  id            String    @id @db.Uuid
  name          String
  email         String    @unique
  walletBalance Int       @default(1000)  // In cents
  // ... auth fields
}

model Order {
  id                String      @id @db.Uuid
  userId            String
  symbol            String      // MEME1, MEME2
  side              Side        // buy, sell
  type              OrderType   // limit, market
  price             Int?        // In cents (null for market)
  originalQuantity  Int
  remainingQuantity Int
  status            OrderStatus // open, partial, filled, cancelled
}

model Trade {
  id          String   @id @db.Uuid
  symbol      Symbols
  buyOrderId  String
  sellOrderId String
  price       Int      // In cents
  quantity    Int
}

model Symbol {
  id             String  @id @db.Uuid
  symbol         Symbols @unique
  lastTradePrice Int     // In cents
}

model Holdings {
  id       String @id @db.Uuid
  userId   String
  symbolId String
  quantity Int
  avgPrice Int    // In cents
}
```

### Price Convention

All prices are stored in **cents** (e.g., $120.50 = 12050).

---

## API Reference

### Place Order (User)

```bash
POST /order
Cookie: access_token=<jwt>
Content-Type: application/json

{
  "symbol": "MEME1",
  "side": "buy",
  "type": "limit",
  "quantity": 10,
  "price": 12050  # $120.50 in cents
}
```

### Place Order (Bot)

```bash
POST /bot-order
x-api-key: <bot-api-key>
x-user-id: <bot-user-uuid>
Content-Type: application/json

{
  "symbol": "MEME1",
  "side": "sell",
  "type": "market",
  "quantity": 50
}
```

### SSE Stream

```javascript
const eventSource = new EventSource('http://localhost:4000/market-data/stream', {
  withCredentials: true
});

eventSource.onmessage = (event) => {
  const { symbol, price, quantity, timestamp } = JSON.parse(event.data);
  console.log(`${symbol}: $${price / 100}`);
};
```

---

## Development Scripts

```bash
# Root
yarn dashboard:dev        # Start dashboard

# Backend
yarn start:dev           # Start with hot reload
yarn prisma:migrate      # Run migrations
yarn prisma:studio       # Open Prisma Studio
yarn prisma:generate     # Generate Prisma client

# Dashboard
yarn dev                 # Start Next.js dev server
yarn build               # Production build

# Trading Bots
yarn dev                 # Start bots with ts-node-dev
yarn build               # Compile TypeScript
yarn start               # Run compiled JS
```

---

## License

UNLICENSED - Private project

---

## Author

[Anuj Gill](https://github.com/Anuj-Gill)
