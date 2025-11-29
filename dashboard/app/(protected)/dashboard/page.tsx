'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriceStream } from '@/hooks/usePriceStream';
import { useHoldingsStore, useUserStore } from '@/stores';
import { SYMBOLS, STOCK_IMAGES, type Symbol } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ActivityIcon, 
  TrendingUp,
  ChevronRight,
  Briefcase,
  Wallet,
  Plus,
  Lightbulb,
  Flame,
  Zap,
  X,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

// Format coins (stored in cents, display as coins)
const formatCoins = (cents: number | undefined) => {
  if (cents === undefined) return '---';
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
      <linearGradient id="coinGradientDash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <radialGradient id="coinShadowDash" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="52" rx="42" ry="42" fill="#B8860B" />
    <circle cx="50" cy="50" r="42" fill="url(#coinShadowDash)" />
    <circle cx="50" cy="50" r="38" fill="url(#coinGradientDash)" />
    <ellipse cx="35" cy="35" rx="15" ry="12" fill="rgba(255,255,255,0.3)" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#B8860B" strokeWidth="2" />
    <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#B8860B" fontFamily="Arial, sans-serif">M</text>
  </svg>
);

export default function Dashboard() {
  const { prices, isConnected } = usePriceStream();
  const { holdings, isLoading: holdingsLoading } = useHoldingsStore();
  const { user } = useUserStore();
  const [showMoneyModal, setShowMoneyModal] = useState(false);

  // Create a map for quick holdings lookup
  const holdingsMap = new Map(holdings.map(h => [h.symbol, h]));

  // Calculate portfolio summary
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

  return (
    <div className="container mx-auto p-6 mt-24">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Market Overview</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ActivityIcon className="h-4 w-4" />
            <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isConnected ? 'Live Market Data' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        {/* Vote CEO Button */}
        <Link
          href="/suggestions"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 hover:from-orange-500/30 hover:to-amber-500/30 transition-all group"
        >
          <Sparkles className="size-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
          <span className="text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors">Vote Next CEO Coin</span>
        </Link>
      </div>

      {/* Main Layout: Stocks on Left, Portfolio on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Stock Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Available Stocks</h2>
            <Badge variant="outline" className="border-white/10 text-gray-400">
              {SYMBOLS.length} assets
            </Badge>
          </div>

          {/* Stock Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SYMBOLS.map((symbol) => {
              const currentPrice = prices.get(symbol);
              const holding = holdingsMap.get(symbol);
              const hasHolding = holding && holding.quantity > 0;

              return (
                <Link href={`/symbol/${symbol}`} key={symbol}>
                  <Card className="bg-card border-white/10 rounded-2xl hover:border-orange-500/30 transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center ring-2 ring-orange-500/20">
                            <Image
                              src={STOCK_IMAGES[symbol as Symbol]}
                              alt={symbol}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">{symbol}</h3>
                            <p className="text-xs text-gray-500">Meme Stock</p>
                          </div>
                        </div>
                        {currentPrice !== undefined ? (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 uppercase tracking-wide">Live</span>
                          </div>
                        ) : (
                          <Skeleton className="h-4 w-12" />
                        )}
                      </div>

                      {/* Price - single coin icon only */}
                      <div className="flex items-center gap-2 mb-4">
                        <GoldCoin className="size-5" />
                        <span className="text-2xl font-bold text-white">
                          {formatCoins(currentPrice)}
                        </span>
                      </div>

                      {/* Holdings Preview or CTA */}
                      {holdingsLoading ? (
                        <Skeleton className="h-8 w-full" />
                      ) : hasHolding ? (
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="text-xs text-gray-500">
                            <span className="text-white font-medium">{holding.quantity}</span> shares owned
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            holding.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {holding.profitLoss >= 0 ? (
                              <ArrowUpIcon className="h-3 w-3" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3" />
                            )}
                            {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <span className="text-xs text-gray-500">Start trading</span>
                          <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Market Tips & Insights */}
          <Card className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20 rounded-2xl mt-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-orange-500/20 rounded-lg">
                  <Lightbulb className="size-4 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white">Trading Tips</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <Flame className="size-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white mb-1">Stay Updated</p>
                    <p className="text-[11px] text-gray-500">Meme stocks are volatile. Watch for social media trends!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <Zap className="size-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white mb-1">Quick Trades</p>
                    <p className="text-[11px] text-gray-500">Set price alerts and act fast when opportunities arise.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <TrendingUp className="size-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white mb-1">Diamond Hands 💎</p>
                    <p className="text-[11px] text-gray-500">Sometimes the best trade is holding. HODL responsibly!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Portfolio Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-2">Your Investments</h2>

          {/* Portfolio Value Card */}
          <Card className="bg-card border-white/10 rounded-2xl">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Current Value</p>
              <div className="flex items-center gap-2 mb-4">
                <GoldCoin className="size-6" />
                <span className="text-3xl font-bold text-white">
                  {formatCoins(portfolioSummary.totalValue + (user?.walletBalance || 0))}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-500">1D returns</span>
                  <span className={`text-sm font-medium ${
                    portfolioSummary.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolioSummary.totalPL >= 0 ? '+' : ''}{formatCoins(portfolioSummary.totalPL)} ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-500">Total returns</span>
                  <span className={`text-sm font-medium ${
                    portfolioSummary.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolioSummary.totalPL >= 0 ? '+' : ''}{formatCoins(portfolioSummary.totalPL)} ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Invested</span>
                  <span className="text-sm font-medium text-white">{formatCoins(portfolioSummary.totalInvested)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Balance Card */}
          <Card className="bg-card border-white/10 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Wallet className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500">Available Cash</span>
                </div>
                <button
                  onClick={() => setShowMoneyModal(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </div>
              <div className="flex items-center gap-2">
                <GoldCoin className="size-5" />
                <span className="text-xl font-bold text-white">
                  {user ? formatCoins(user.walletBalance) : '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Holdings List */}
          <Card className="bg-card border-white/10 rounded-2xl">
            <CardHeader className="pb-2 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500">Holdings</span>
                </div>
                <Link href="/holdings" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  See all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {holdingsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : holdings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-2">No holdings yet</p>
                  <p className="text-xs text-gray-600">Buy stocks to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {holdings.slice(0, 4).map((holding) => {
                    const livePrice = prices.get(holding.symbol) || holding.currentPrice;
                    const livePL = holding.quantity * (livePrice - holding.avgPrice);
                    const livePLPercent = ((livePrice - holding.avgPrice) / holding.avgPrice) * 100;

                    return (
                      <Link 
                        key={holding.id} 
                        href={`/symbol/${holding.symbol}`}
                        className="flex items-center justify-between py-2 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center ring-2 ring-orange-500/20">
                            <Image
                              src={STOCK_IMAGES[holding.symbol as Symbol]}
                              alt={holding.symbol}
                              width={36}
                              height={36}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">{holding.symbol}</p>
                            <p className="text-xs text-gray-500">{holding.quantity} shares</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-white">{formatCoins(livePrice)}</span>
                          <p className={`text-xs ${livePL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {livePL >= 0 ? '+' : ''}{livePLPercent.toFixed(2)}%
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fun Money Modal */}
      {showMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <button
              onClick={() => setShowMoneyModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <GoldCoin className="size-10" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Nice Try! 😏</h3>
              
              <p className="text-gray-400 mb-4">
                These are <span className="text-orange-400 font-semibold">MemeCoins™</span> — they're completely fake and worth absolutely nothing in the real world.
              </p>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <p className="text-xs text-amber-400">
                  ⚠️ This is a demo trading platform. No real money, no real stocks, just vibes and memes.
                </p>
              </div>
              
              <button
                onClick={() => setShowMoneyModal(false)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                I Understand 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}