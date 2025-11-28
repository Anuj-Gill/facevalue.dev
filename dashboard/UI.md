# UI.md: Meme Stock Exchange Frontend Specification

## 1. 🎨 Design System & Visual Theme

The UI must adhere strictly to a professional, dark-mode, minimalist aesthetic, replicating the "glass-morphism" finance dashboard style.

### 1.1. Color Palette (Tailwind/CSS Variables)

| Role | Color | Description |
| :--- | :--- | :--- |
| **Primary Background** | `#0C0C0E` | Deep charcoal/OLED black (Default `bg-background`). |
| **Card/Surface** | `#18181B` | Slightly lighter background for main containers (Default `bg-card`). |
| **Primary CTA/Accent** | `orange-500` (`#FF782C`) | Safety Orange for all main action buttons (e.g., "Review Order"). |
| **Success/Gain** | `emerald-400` (`#34D399`) | For positive price changes (+%). |
| **Error/Loss** | `red-500` (`#EF4444`) | For negative price changes (-%) and sell actions. |
| **Text Primary** | `white` | For large values and headings. |
| **Text Secondary** | `gray-500` | For labels, subheadings, and muted details. |
| **Borders** | `white/5` | Extremely subtle borders to define separation without visual clutter. |

### 1.2. Aesthetics & Spacing

| Property | Value | Tailwind Classes / Description |
| :--- | :--- | :--- |
| **Border Radius** | Heavy | Use `rounded-xl` to `rounded-3xl` for all containers, buttons, and inputs. |
| **Separation** | Subtle Lines | Use `border border-white/10` for card boundaries. Avoid heavy drop shadows. |
| **Typography** | Sans-Serif | Use the default configured sans-serif font (Inter or Geist). Ensure numerical values are large and bold. |
| **Spacing** | Generous | Use `p-6` or `p-8` for card padding, and `gap-6` for grid spacing. |

---

## 2. 🏗️ Architecture & State Management

To ensure high performance and maintainability, the frontend must follow these architectural principles.

### 2.1. State Management (Zustand)

Use **Zustand** for global state to minimize `useState` usage and prevent unnecessary re-renders.

*   **`useUserStore`**: Manages user profile, wallet balance, and authentication state.
*   **`useHoldingsStore`**: Manages the list of user assets and portfolio value.
*   **`useMarketStore`**: Manages real-time price data (SSE) and symbol metadata.
*   **`useOrderStore`**: Manages active order history and current order form state.

### 2.2. Component Architecture

*   **Atomic/Feature-based**: Group components by feature (e.g., `components/features/trade/OrderWidget.tsx`) rather than generic types.
*   **Container/Presenter**: Separate logic (fetching/stores) from UI rendering where possible.

---

## 3. 🏛️ Layout Architecture (Top Navigation)

The application uses a standard broker website layout with a fixed top navigation bar.

### 3.1. Header / Navbar (`<Navbar />`)

*   **Design:** Fixed to the top, full width, glass-morphism background.
*   **Left:** Logo / Brand Name ("MemeExchange").
*   **Center:** Navigation Links.
    *   **Dashboard**: `/dashboard` (Market Overview)
    *   **Holdings**: `/holdings` (Portfolio)
    *   **Orders**: `/orders` (History)
*   **Right:** User Profile & Wallet Balance.
    *   **Wallet Pill:** Display current balance (e.g., `$23,082.00`).
    *   **Avatar:** User profile image (circle).

---

## 4. 📄 Page Specifications

### 4.1. Login Page (`/login`)

*   **Layout:** Centered single card on a deep background.
*   **Content:**
    *   Logo/Branding.
    *   "Welcome to Meme Stock Exchange".
    *   **Action:** "Connect with Google" / "Sign in with Supabase" button.
    *   Minimalist footer.

### 4.2. Dashboard (`/dashboard`) - Market Overview

*   **Goal:** High-level view of the market.
*   **Components:**
    *   **Market Header:** "Market Overview" title + Global Market Cap/Volume (optional).
    *   **Stock Grid:** A grid of cards, one for each symbol (MEME1, MEME2).
        *   **Card Content:**
            *   **Header:** Icon (Circle) + Ticker + Name.
            *   **Price:** Large current price.
            *   **Change:** 24h % change (Green/Red pill).
            *   **Mini-Chart:** Small sparkline graph (SVG) showing trend.
        *   **Action:** Clicking a card navigates to `/symbol/[symbol]`.

### 4.3. Symbol Detail Page (`/symbol/[symbol]`) - Trading View

*   **Layout:** 2-Column Layout (Main Content + Sidebar).
*   **Header:**
    *   **Stock Identity:** Large Icon (Circle) + Ticker (e.g., MEME1) + Full Name.
    *   **Price Info:** Current Price (Large) + 24h Change + High/Low stats.
*   **Main Content (Left/Center - 70%):**
    *   **Main Chart:** Large, interactive line chart (shadcn/recharts).
        *   Gradient fill under the line.
        *   Timeframe selectors (1H, 1D, 1W, 1M).
    *   **"Other Stocks" Carousel:** Located *below* the chart.
        *   Horizontal list of other available assets to quickly switch markets.
*   **Sidebar (Right - 30%):**
    *   **Order Widget:**
        *   **Tabs:** "Buy" (Green) / "Sell" (Red).
        *   **Type:** Limit / Market toggle.
        *   **Inputs:** Quantity, Price (if Limit).
        *   **Summary:** "Total: $XX.XX".
        *   **Button:** Large "Place Order" CTA.

### 4.4. Holdings Page (`/holdings`)

*   **Goal:** Detailed view of user assets.
*   **Components:**
    *   **Portfolio Summary:** Total Value card.
    *   **Holdings Table:**
        *   **Asset:** Icon + Ticker.
        *   **Quantity:** Total units held.
        *   **Avg. Cost:** Average buy price.
        *   **Current Price:** Live market price.
        *   **Market Value:** Quantity * Current Price.
        *   **Return:** P/L ($ and %).

### 4.5. Orders Page (`/orders`)

*   **Goal:** History of all transactions.
*   **Components:**
    *   **Orders Table:**
        *   **Date/Time:** Timestamp.
        *   **Symbol:** Ticker.
        *   **Side:** Buy/Sell (Color coded).
        *   **Type:** Limit/Market.
        *   **Price:** Execution price.
        *   **Quantity:** Amount.
        *   **Status:** Filled/Cancelled/Open (Badge).

---

## 5. 🔗 Data Mapping Instructions

Map UI elements to the provided backend schema:

| UI Element | Backend Model/Field | Notes |
| :--- | :--- | :--- |
| **Total Balance** | `User.walletBalance` | Stored in **cents**. Divide by 100 for display. |
| **Asset Ticker** | `Symbol.symbol` | Enum: `MEME1`, `MEME2`. |
| **Asset Quantity** | `Holdings.quantity` | Integer. |
| **Avg Price** | `Holdings.avgPrice` | Stored in **cents**. |
| **Real-time Price** | SSE Event `price` | From `GET /market-data/stream`. Stored in **cents**. |
| **Order Quantity** | `OrderDto.quantity` | Integer. |
| **Order Price** | `OrderDto.price` | Send in **cents**. Required for Limit orders. |
| **Order Side** | `OrderDto.side` | `buy` or `sell`. |
| **Order Type** | `OrderDto.type` | `limit` or `market`. |
