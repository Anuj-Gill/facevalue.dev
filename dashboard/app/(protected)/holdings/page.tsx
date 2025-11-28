'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHoldingsStore, useUserStore } from '@/stores';
import { usePriceStream } from '@/hooks/usePriceStream';
import Link from 'next/link';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Briefcase, 
  TrendingUp,
  Wallet,
  PieChart
} from 'lucide-react';

// Format currency from cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

export default function HoldingsPage() {
  const { holdings, isLoading } = useHoldingsStore();
  const { user } = useUserStore();
  const { prices } = usePriceStream();

  // Calculate portfolio summary with live prices
  const portfolioSummary = holdings.reduce((acc, holding) => {
    const livePrice = prices.get(holding.symbol) || holding.currentPrice;
    const liveValue = holding.quantity * livePrice;
    const livePL = holding.quantity * (livePrice - holding.avgPrice);
    
    return {
      totalValue: acc.totalValue + liveValue,
      totalInvested: acc.totalInvested + holding.totalInvested,
      totalPL: acc.totalPL + livePL,
    };
  }, { totalValue: 0, totalInvested: 0, totalPL: 0 });

  const plPercent = portfolioSummary.totalInvested > 0 
    ? (portfolioSummary.totalPL / portfolioSummary.totalInvested) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          Your Portfolio
        </h1>
        <p className="text-muted-foreground">
          Track your investments and performance
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available Cash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user ? formatCurrency(user.walletBalance) : '---'}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioSummary.totalValue)}
            </div>
            <p className="text-sm text-muted-foreground">
              Invested: {formatCurrency(portfolioSummary.totalInvested)}
            </p>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total P&L
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              portfolioSummary.totalPL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {portfolioSummary.totalPL >= 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
              {formatCurrency(Math.abs(portfolioSummary.totalPL))}
            </div>
            <p className={`text-sm ${
              plPercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current stock positions</CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No holdings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start trading to build your portfolio
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <TrendingUp className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg. Price</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Current Price</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const livePrice = prices.get(holding.symbol) || holding.currentPrice;
                    const liveValue = holding.quantity * livePrice;
                    const livePL = holding.quantity * (livePrice - holding.avgPrice);
                    const livePLPercent = ((livePrice - holding.avgPrice) / holding.avgPrice) * 100;
                    
                    return (
                      <tr key={holding.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Link 
                            href={`/symbol/${holding.symbol}`}
                            className="font-medium hover:text-primary"
                          >
                            {holding.symbol}
                          </Link>
                        </td>
                        <td className="text-right py-3 px-4">
                          {holding.quantity}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(holding.avgPrice)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {formatCurrency(livePrice)}
                            <Badge variant="outline" className="text-xs">
                              Live
                            </Badge>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatCurrency(liveValue)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className={`flex items-center justify-end gap-1 ${
                            livePL >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {livePL >= 0 ? (
                              <ArrowUpIcon className="h-3 w-3" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3" />
                            )}
                            <span className="font-medium">
                              {formatCurrency(Math.abs(livePL))}
                            </span>
                            <span className="text-xs">
                              ({livePLPercent >= 0 ? '+' : ''}{livePLPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
