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
  PieChart,
  Coins,
  ExternalLink
} from 'lucide-react';

// Format coins (stored in cents, display as coins)
const formatCoins = (cents: number) => {
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Gold coin SVG component
const GoldCoin = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="coinGradientHoldings" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <radialGradient id="coinShadowHoldings" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="52" rx="42" ry="42" fill="#B8860B" />
    <circle cx="50" cy="50" r="42" fill="url(#coinShadowHoldings)" />
    <circle cx="50" cy="50" r="38" fill="url(#coinGradientHoldings)" />
    <ellipse cx="35" cy="35" rx="15" ry="12" fill="rgba(255,255,255,0.3)" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#B8860B" strokeWidth="2" />
    <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#B8860B" fontFamily="Arial, sans-serif">M</text>
  </svg>
);

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

  // Calculate total net worth
  const totalNetWorth = (user?.walletBalance || 0) + portfolioSummary.totalValue;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 mt-24">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <div className="p-2 bg-orange-500/20 rounded-xl">
            <Briefcase className="h-7 w-7 text-orange-500" />
          </div>
          Your Portfolio
        </h1>
        <p className="text-gray-500">
          Track your investments and performance in real-time
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Net Worth */}
        <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/30 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-orange-400">
              <Coins className="h-4 w-4" />
              Total Net Worth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GoldCoin className="size-6" />
              <span className="text-2xl font-bold text-white">
                {formatCoins(totalNetWorth)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Available Cash */}
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <Wallet className="h-4 w-4" />
              Available Cash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GoldCoin className="size-5" />
              <span className="text-2xl font-bold text-white">
                {user ? formatCoins(user.walletBalance) : '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <PieChart className="h-4 w-4" />
              Portfolio Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GoldCoin className="size-5" />
              <span className="text-2xl font-bold text-white">
                {formatCoins(portfolioSummary.totalValue)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Invested: {formatCoins(portfolioSummary.totalInvested)}
            </p>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card className={`border-white/10 rounded-2xl ${
          portfolioSummary.totalPL >= 0 
            ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/5' 
            : 'bg-gradient-to-br from-red-500/10 to-rose-500/5'
        }`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <TrendingUp className="h-4 w-4" />
              Total P&L
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              portfolioSummary.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {portfolioSummary.totalPL >= 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
              {formatCoins(Math.abs(portfolioSummary.totalPL))}
            </div>
            <p className={`text-xs mt-1 ${
              plPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}% all time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="bg-card border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white">Holdings</CardTitle>
          <CardDescription className="text-gray-500">Your current stock positions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {holdings.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">No holdings yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start trading to build your portfolio and track your investments here
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Start Trading
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left py-4 px-6 font-medium text-gray-400 text-sm">Asset</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Quantity</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Avg. Price</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Current Price</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Market Value</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const livePrice = prices.get(holding.symbol) || holding.currentPrice;
                    const liveValue = holding.quantity * livePrice;
                    const livePL = holding.quantity * (livePrice - holding.avgPrice);
                    const livePLPercent = ((livePrice - holding.avgPrice) / holding.avgPrice) * 100;
                    
                    return (
                      <tr key={holding.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6">
                          <Link 
                            href={`/symbol/${holding.symbol}`}
                            className="flex items-center gap-3 group-hover:text-orange-400 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center">
                              <span className="font-bold text-orange-400">{holding.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-white">{holding.symbol}</span>
                              <p className="text-xs text-gray-500">Meme Stock</p>
                            </div>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                          </Link>
                        </td>
                        <td className="text-right py-4 px-6">
                          <span className="font-medium text-white">{holding.quantity}</span>
                          <span className="text-gray-500 text-sm ml-1">shares</span>
                        </td>
                        <td className="text-right py-4 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <GoldCoin className="size-4" />
                            <span className="text-white">{formatCoins(holding.avgPrice)}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex items-center gap-1">
                              <GoldCoin className="size-4" />
                              <span className="text-white font-medium">{formatCoins(livePrice)}</span>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] px-1.5">
                              LIVE
                            </Badge>
                          </div>
                        </td>
                        <td className="text-right py-4 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <GoldCoin className="size-4" />
                            <span className="font-semibold text-white">{formatCoins(liveValue)}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-6">
                          <div className={`flex flex-col items-end ${
                            livePL >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            <div className="flex items-center gap-1">
                              {livePL >= 0 ? (
                                <ArrowUpIcon className="h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="h-3 w-3" />
                              )}
                              <GoldCoin className="size-3" />
                              <span className="font-semibold">
                                {formatCoins(Math.abs(livePL))}
                              </span>
                            </div>
                            <span className="text-xs">
                              {livePLPercent >= 0 ? '+' : ''}{livePLPercent.toFixed(2)}%
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
