# ⚡ CEO Stock Exchange

A full-stack, real-time stock exchange simulation for trading CEO-themed stocks. Features a custom-built matching engine, live price streaming via SSE, automated trading bots, and a community-driven CEO voting system.

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

CEO Stock Exchange is a gamified stock trading simulation where users can trade stocks based on popular CEOs. The platform combines real-time trading mechanics with community-driven features.

### What You Can Do

- **Trade CEO Stocks** - Buy and sell stocks named after famous CEOs (e.g., MEME1 for 
 Altman, MEME2 for Elon Musk)
- **Real-time Trading** - Experience live price updates and instant order execution
- **Vote for New CEOs** - Suggest and vote for which CEO should be added next to the platform
- **Track Your Portfolio** - Monitor holdings, P&L, and trading history in real-time
- **Compete with Bots** - Trade against AI-powered bots with different trading strategies

### Key Features

- ⚡ **Real-time matching engine** with price-time priority
- 📊 **Live price streaming** via SSE (Server-Sent Events)
- 🤖 **Automated trading bots** (Aggressive, Conservative, Random)
- 🔐 **JWT authentication** with Google OAuth via Supabase
- 📈 **In-memory order book** with database persistence
- 🗳️ **Community voting** for new CEO stocks
- 💰 **Virtual coin balance** for simulated trading
- 📱 **Responsive dashboard** with real-time charts

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
                        ┌────────┴────────┐
                        │                 │
                        ▼                 ▼
               ┌─────────────┐   ┌─────────────┐
               │  PostgreSQL │   │   Redis     │
               │  (Supabase) │   │  (Upstash)  │
               └─────────────┘   └─────────────┘
```

### Data Flow

1. **Order Placement**: User/Bot → API → Order Service → Broker Service (Matching Engine)
2. **Matching**: Broker Service matches orders → Updates DB → Caches prices in Redis → Emits SSE events
3. **Price Updates**: SSE events → Dashboard updates in real-time
4. **Price History**: Redis stores last 200 price points per symbol for chart history

---

## Project Structure

```
ceo-stock-exchange/
├── package.json              # Root workspace configuration
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── apis/            # API controllers & services
│   │   │   ├── order/       # User order endpoints
│   │   │   ├── bot-order/   # Bot order endpoints (API key auth)
│   │   │   ├── market-data/ # SSE streaming & price history
│   │   │   ├── suggestions/ # CEO voting system
│   │   │   └── oauth/       # Google OAuth flow
│   │   ├── auth/            # JWT & API key guards
│   │   ├── services/        # Core services
│   │   │   ├── broker.service.ts    # Matching engine
│   │   │   ├── redis.service.ts     # Price caching
│   │   │   ├── prisma.service.ts    # Database client
│   │   │   └── supabase.service.ts  # Supabase client
│   │   └── common/          # Shared configs
│   └── prisma/
│       └── schema.prisma    # Database schema
├── dashboard/                # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Login & callback pages
│   │   ├── (protected)/     # Authenticated pages
│   │   │   ├── dashboard/   # Market overview with stock cards
│   │   │   ├── symbol/[symbol]/ # Trading page with chart
│   │   │   ├── holdings/    # Portfolio management
│   │   │   ├── orders/      # Order history
│   │   │   └── suggestions/ # CEO voting page
│   │   └── (public)/        # Public pages
│   ├── components/          # UI components (shadcn/ui + Aceternity)
│   ├── hooks/               # Custom React hooks
│   │   └── usePriceStream.ts # SSE price subscription
│   ├── stores/              # Zustand state stores
│   └── lib/                 # Utilities & API clients
└── trading-bots/            # Automated trading system
    └── src/
        ├── bots/            # Bot implementations
        ├── services/        # API & price services
        └── utils/           # Utilities
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (workspace manager)
- PostgreSQL database (or Supabase account)
- Redis instance (or Upstash account)

### Installation

```bash
# Clone the repository
git clone https://github.com/Anuj-Gill/ceo-stock-exchange.git
cd ceo-stock-exchange

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
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
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

**Tech Stack**: NestJS, Prisma, PostgreSQL, Redis (Upstash), EventEmitter2

### Matching Engine (`broker.service.ts`)

The core of the exchange - a custom-built order matching engine with price-time priority:

#### Order Book Structure

- **Bids (Buy Orders)**: Sorted in descending order by price
- **Asks (Sell Orders)**: Sorted in ascending order by price
- **Price Levels**: FIFO queue of orders at each price point
- **O(1) Lookup**: Hash maps for instant order retrieval

#### Matching Rules

1. **Limit Orders**: Match against opposite side if price crosses, add remainder to book
2. **Market Orders**: Match immediately at best available price (IOC behavior)
3. **Price-Time Priority**: Best price first, then first-in-first-out

### Price Caching (`redis.service.ts`)

- Stores last 200 price points per symbol
- Caches latest prices for instant dashboard loading
- Provides price history for charts

### API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /order` | JWT | Place order (users) |
| `POST /bot-order` | API Key | Place order (bots) |
| `GET /market-data/stream` | None | SSE stream (all symbols) |
| `GET /market-data/:symbol/price-history` | None | Get price history |
| `GET /market-data/prices/latest` | None | Get latest prices |
| `GET /suggestions` | JWT | Get CEO suggestions |
| `POST /suggestions` | JWT | Create suggestion |
| `POST /suggestions/:id/vote` | JWT | Vote on suggestion |

---

## Dashboard

**Tech Stack**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Aceternity UI, Zustand

### Pages

- **Dashboard** (`/dashboard`): Market overview with live stock prices
- **Symbol** (`/symbol/[symbol]`): Trading page with real-time chart and order form
- **Holdings** (`/holdings`): Portfolio management with P&L tracking
- **Orders** (`/orders`): Complete order history with pagination
- **Suggestions** (`/suggestions`): Vote for next CEO stock

### Real-time Features

- **SSE Price Stream**: Live price updates via Server-Sent Events
- **Price Charts**: Area charts with 200 data points from Redis cache
- **Live P&L**: Real-time profit/loss calculations

---

## Trading Bots

Automated trading bots that simulate market activity with different personalities:

| Bot | Behavior | Interval | Market Order % |
|-----|----------|----------|----------------|
| **Aggressive** | High frequency, tight spreads | 10-30s | 70% |
| **Conservative** | Low frequency, wide spreads | 30-60s | 10% |
| **Random** | Unpredictable patterns | 5-90s | 50% |

---

## Database Schema

### Core Models

- **User**: Authentication, wallet balance (in coins/cents)
- **Order**: Trading orders with status tracking
- **Trade**: Executed trade records
- **Symbol**: Tradable CEO stocks with last trade price
- **Holdings**: User portfolio positions
- **Suggestion**: CEO voting suggestions with vote counts

### Price Convention

All prices are stored in **cents** (e.g., $120.50 = 12050).

---

## Development Scripts

```bash
# Backend
yarn start:dev           # Start with hot reload
yarn prisma:migrate      # Run migrations
yarn prisma:studio       # Open Prisma Studio

# Dashboard
yarn dev                 # Start Next.js dev server
yarn build               # Production build

# Trading Bots
yarn dev                 # Start bots
```

---

## License

UNLICENSED - Private project

---

## Author

[Anuj Gill](https://github.com/Anuj-Gill)
