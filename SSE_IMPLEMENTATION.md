# SSE Implementation Guide

## How it Works

### Backend (NestJS)

1. **BrokerService emits events** when trades occur:
   ```typescript
   this.eventEmitter.emit('price.update', {
     symbol: 'MEME1',
     price: 11700,
     quantity: 10,
     timestamp: Date.now()
   });
   ```

2. **MarketDataController streams events via SSE**:
   - `GET /market-data/stream` - All symbols
   - `GET /market-data/stream/:symbol` - Specific symbol only

3. **EventEmitter2** broadcasts to all connected clients in real-time

### Frontend (Next.js)

1. **usePriceStream hook** connects to SSE endpoint:
   ```typescript
   const { prices, lastUpdate, isConnected } = usePriceStream({ symbol: 'MEME1' });
   ```

2. **EventSource API** receives server-sent events:
   - Automatically reconnects on connection loss
   - Parses JSON data from events
   - Updates React state with new prices

3. **Components consume** the hook:
   - Dashboard: Shows all symbols with live prices
   - Symbol page: Live graph + trading form

## Testing the SSE Flow

1. Start backend: `cd backend && yarn start:dev`
2. Start frontend: `cd dashboard && yarn dev`
3. Place orders through the UI
4. Watch prices update in real-time on both pages

## Key Files

- **Backend**:
  - `backend/src/services/broker.service.ts` - Emits price updates
  - `backend/src/apis/market-data/market-data.controller.ts` - SSE endpoint
  - `backend/src/app.module.ts` - EventEmitter configuration

- **Frontend**:
  - `dashboard/hooks/usePriceStream.ts` - SSE consumer hook
  - `dashboard/app/(protected)/dashboard/page.tsx` - Multi-symbol view
  - `dashboard/app/(protected)/symbol/[symbol]/page.tsx` - Single symbol + trading

## How EventEmitter2 Works

EventEmitter2 is an in-memory pub/sub system:
- **Publisher**: BrokerService emits events after trade execution
- **Subscribers**: All connected SSE clients via MarketDataController
- **Event**: `price.update` with payload `{symbol, price, quantity, timestamp}`

No database involved - events are ephemeral and broadcast immediately.

## CORS Configuration

Make sure your backend allows SSE connections:
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
});
```
