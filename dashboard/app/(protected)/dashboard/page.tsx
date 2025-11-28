'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriceStream } from '@/hooks/usePriceStream';
import { useHoldingsStore } from '@/stores';
import { SYMBOLS } from '@/lib/constants';
import Link from 'next/link';
import { ArrowUpIcon, ArrowDownIcon, ActivityIcon, TrendingUp } from 'lucide-react';

// Format price from cents to dollars
const formatPrice = (price: number | undefined) => {
  if (price === undefined) return '---';
  return (price / 100).toFixed(2);
};

// Format currency
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

export default function Dashboard() {
  const { prices, isConnected } = usePriceStream();
  const { holdings, isLoading: holdingsLoading } = useHoldingsStore();

  // Create a map for quick holdings lookup
  const holdingsMap = new Map(holdings.map(h => [h.symbol, h]));

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Market Overview</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ActivityIcon className="h-4 w-4" />
          <span className={isConnected ? 'text-green-500' : 'text-yellow-500'}>
            {isConnected ? 'Live Market Data' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Symbol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SYMBOLS.map((symbol) => {
          const currentPrice = prices.get(symbol);
          const holding = holdingsMap.get(symbol);
          const hasHolding = holding && holding.quantity > 0;

          return (
            <Link href={`/symbol/${symbol}`} key={symbol}>
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{symbol}</CardTitle>
                    <div className="flex items-center gap-2">
                      {currentPrice !== undefined ? (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Loading...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>Meme Stock</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Current Price */}
                  <div className="text-3xl font-bold mb-4">
                    ${formatPrice(currentPrice)}
                  </div>

                  {/* Holdings Info */}
                  {holdingsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : hasHolding ? (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your Holdings</span>
                        <span className="font-medium">{holding.quantity} shares</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg. Price</span>
                        <span className="font-medium">{formatCurrency(holding.avgPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">P&L</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          holding.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {holding.profitLoss >= 0 ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          )}
                          {formatCurrency(Math.abs(holding.profitLoss))}
                          <span className="text-xs">
                            ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Click to start trading
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}