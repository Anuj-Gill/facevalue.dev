'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePriceStream } from '@/hooks/usePriceStream';
import { useUserStore, useHoldingsStore } from '@/stores';
import { orderApi, marketDataApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  TrendingUp, 
  Activity, 
  ArrowUpIcon, 
  ArrowDownIcon,
  AlertCircle,
  Wallet,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { STOCK_IMAGES, SYMBOLS, PERSON_NAMES, type Symbol } from '@/lib/constants';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Area, AreaChart } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface PricePoint {
  time: number;
  price: number;
}

// Format currency from cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

const formatPrice = (price: number | undefined) => {
  if (price === undefined) return '---';
  return (price / 100).toFixed(2);
};

export default function SymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol;
  
  // State
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderExecutionTime, setOrderExecutionTime] = useState<number>(0);
  
  // Stores
  const { user, fetchUser } = useUserStore();
  const { holdings, fetchHoldings, getHoldingBySymbol } = useHoldingsStore();
  
  // Price stream
  const { prices, lastUpdate, isConnected } = usePriceStream({ symbol });
  const currentPrice = prices.get(symbol);

  // Get holding for this symbol
  const holding = getHoldingBySymbol(symbol);

  // Fetch historical prices on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await marketDataApi.getPriceHistory(symbol);
        if (response.history && response.history.length > 0) {
          setPriceHistory(
            response.history.map((point) => ({
              time: point.timestamp,
              price: point.price,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      }
    };
    fetchHistory();
  }, [symbol]);

  // Update price history when new prices come in
  useEffect(() => {
    if (lastUpdate && lastUpdate.symbol === symbol) {
      setPriceHistory((prev) => [
        ...prev,
        { time: lastUpdate.timestamp, price: lastUpdate.price }
      ]); // Keep all points - chart will auto-scale
    }
  }, [lastUpdate, symbol]);

  // Auto-fill price with current market price for limit orders
  useEffect(() => {
    if (currentPrice && !price && orderType === 'limit') {
      setPrice((currentPrice / 100).toFixed(2));
    }
  }, [currentPrice, orderType]);

  // Calculate order value and validation
  const orderValidation = useMemo(() => {
    const qty = parseInt(quantity) || 0;
    const priceInCents = orderType === 'limit' 
      ? Math.round(parseFloat(price || '0') * 100)
      : currentPrice || 0;
    const orderValue = qty * priceInCents;
    
    if (side === 'buy') {
      const walletBalance = user?.walletBalance || 0;
      const hasInsufficientFunds = orderValue > walletBalance;
      return {
        orderValue,
        isValid: qty > 0 && priceInCents > 0 && !hasInsufficientFunds,
        error: hasInsufficientFunds 
          ? `Insufficient funds. Need ${formatCurrency(orderValue)}, have ${formatCurrency(walletBalance)}`
          : null,
        available: walletBalance,
      };
    } else {
      const holdingQty = holding?.quantity || 0;
      const hasInsufficientHoldings = qty > holdingQty;
      return {
        orderValue,
        isValid: qty > 0 && priceInCents > 0 && !hasInsufficientHoldings,
        error: hasInsufficientHoldings
          ? `Insufficient holdings. Have ${holdingQty} shares, trying to sell ${qty}`
          : null,
        available: holdingQty,
      };
    }
  }, [quantity, price, orderType, side, currentPrice, user?.walletBalance, holding?.quantity]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderValidation.isValid) {
      toast.error(orderValidation.error || 'Invalid order');
      return;
    }

    setIsSubmitting(true);
    const startTime = performance.now();

    try {
      const orderData = {
        symbol,
        side,
        type: orderType,
        quantity: parseInt(quantity),
        ...(orderType === 'limit' && { price: Math.round(parseFloat(price) * 100) })
      };

      await orderApi.create(orderData);
      
      const endTime = performance.now();
      setOrderExecutionTime(Math.round(endTime - startTime));
      setShowOrderSuccess(true);
      
      // Auto-hide after 3 seconds
      // setTimeout(() => setShowOrderSuccess(false), 5000);
      
      setQuantity('');
      setPrice('');
      
      // Refresh user and holdings data
      fetchUser();
      fetchHoldings();
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate live P&L for holdings
  const livePL = holding && currentPrice
    ? holding.quantity * (currentPrice - holding.avgPrice)
    : 0;
  const livePLPercent = holding && currentPrice
    ? ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 my-28">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/10 ring-2 ring-orange-500/30">
            <Image
              src={STOCK_IMAGES[symbol as Symbol]}
              alt={symbol}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{symbol}</h1>
              <Badge variant="outline" className={isConnected ? 'text-green-500 border-green-500' : 'text-yellow-500 border-yellow-500'}>
                <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                {isConnected ? 'Live' : 'Connecting...'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Live Price Chart
                </CardTitle>
              </div>
              {priceHistory.length > 0 && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="text-2xl font-bold">${formatPrice(currentPrice)}</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {priceHistory.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground border border-border rounded-lg">
                <div className="text-center space-y-2">
                  <Activity className="h-12 w-12 mx-auto animate-pulse text-orange-500" />
                  <p className="text-sm">Waiting for price updates...</p>
                  <p className="text-xs text-muted-foreground">Chart will appear after receiving data</p>
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <ChartContainer
                  config={{
                    price: {
                      label: "Price",
                      color: "hsl(25, 95%, 53%)", // Orange theme
                    },
                  } satisfies ChartConfig}
                  className="h-[280px] w-full"
                >
                  <AreaChart
                    data={priceHistory.map((point, index) => ({
                      time: new Date(point.time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }),
                      price: point.price / 100,
                      timestamp: point.time,
                      index: index,
                    }))}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis
                      hide={true}
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                    <XAxis
                      dataKey="index"
                      hide={true}
                      type="number"
                      domain={[0, 'dataMax']}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-xl">
                            <div className="text-xs text-muted-foreground mb-1">{data.time}</div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-mono font-bold text-foreground">
                                ${Number(data.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(25, 95%, 53%)"
                      strokeWidth={2.5}
                      fill="url(#colorPrice)"
                      animationDuration={300}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Form & Holdings - Right side of chart */}
        <div className="space-y-6">
          {/* Holdings Card */}
          {holding && holding.quantity > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Your Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-medium">{holding.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Price</span>
                  <span className="font-medium">{formatCurrency(holding.avgPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-medium">
                    {currentPrice ? formatCurrency(holding.quantity * currentPrice) : '---'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P&L</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    livePL >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {livePL >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    {formatCurrency(Math.abs(livePL))}
                    <span className="text-xs">
                      ({livePLPercent >= 0 ? '+' : ''}{livePLPercent.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
              <CardDescription>Buy or sell {symbol}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Side Selection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={side === 'buy' ? 'default' : 'outline'}
                    className={`flex-1 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => setSide('buy')}
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={side === 'sell' ? 'default' : 'outline'}
                    className={`flex-1 ${side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => setSide('sell')}
                  >
                    Sell
                  </Button>
                </div>

                {/* Order Type */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={orderType === 'limit' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setOrderType('limit')}
                  >
                    Limit
                  </Button>
                  <Button
                    type="button"
                    variant={orderType === 'market' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setOrderType('market')}
                  >
                    Market
                  </Button>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                {/* Price (only for limit orders) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-muted rounded-md p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Value</span>
                    <span className="font-medium">
                      {orderValidation.orderValue > 0 
                        ? formatCurrency(orderValidation.orderValue) 
                        : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {side === 'buy' ? <Wallet className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                      {side === 'buy' ? 'Available' : 'Holdings'}
                    </span>
                    <span className="font-medium">
                      {side === 'buy' 
                        ? formatCurrency(orderValidation.available as number)
                        : `${orderValidation.available} shares`}
                    </span>
                  </div>
                </div>

                {/* Validation Error */}
                {orderValidation.error && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{orderValidation.error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className={`w-full ${
                    side === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={isSubmitting || !orderValidation.isValid || !quantity}
                >
                  {isSubmitting 
                    ? 'Placing Order...' 
                    : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Other Stocks to Watch - Below the chart, spans full width on second row */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Other stocks to watch</h3>
          <div className="flex gap-3">
            {SYMBOLS.filter(s => s !== symbol).map((otherSymbol) => {
              const otherPrice = prices.get(otherSymbol);
              return (
                <Link key={otherSymbol} href={`/symbol/${otherSymbol}`} className="flex-1">
                  <Card className="hover:border-orange-500/50 transition-all cursor-pointer group bg-zinc-900/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-linear-to-br from-orange-500/20 to-amber-500/10 ring-2 ring-orange-500/20 shrink-0">
                        <Image
                          src={STOCK_IMAGES[otherSymbol as Symbol]}
                          alt={otherSymbol}
                          width={44}
                          height={44}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      {/* Name & Person */}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">{otherSymbol}</span>
                        <span className="text-xs text-gray-500">{PERSON_NAMES[otherSymbol as Symbol]}</span>
                      </div>
                      
                      {/* Price */}
                      <div className="ml-auto text-right">
                        <p className="font-bold text-white">
                          ${otherPrice ? (otherPrice / 100).toFixed(2) : '---'}
                        </p>
                      </div>
                      
                      {/* Live Badge */}
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full shrink-0">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {showOrderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-zinc-900/90 border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-orange-500/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <span className="text-gray-400 group-hover:text-white text-lg leading-none">&times;</span>
            </button>

            {/* Success Icon with glow effect */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl scale-150" />
                <div className="relative w-20 h-20 bg-linear-to-br from-orange-500/20 to-amber-500/10 rounded-full flex items-center justify-center ring-2 ring-orange-500/30">
                  <Image
                    src="/premium-flash.png"
                    alt="Order Success"
                    width={48}
                    height={48}
                    className="drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Success Text */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Order Executed!</h2>
              <p className="text-gray-400 text-sm">Your order has been successfully placed</p>
            </div>
            
            {/* Execution Time Card */}
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Execution Time</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-mono font-bold text-orange-400">{orderExecutionTime}</span>
                  <span className="text-orange-400/70 text-sm font-medium">ms</span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all"
            >
              Continue Trading
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
