'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoaderThree } from '@/components/ui/loader';
import { useOrdersStore } from '@/stores';
import { STOCK_IMAGES, type Symbol } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ClipboardList, 
  RefreshCw, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 10;

// Format coins (stored in cents, display as coins)
const formatCoins = (cents: number | null) => {
  if (cents === null) return 'Market';
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
      <linearGradient id="coinGradientOrders" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <radialGradient id="coinShadowOrders" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="52" rx="42" ry="42" fill="#B8860B" />
    <circle cx="50" cy="50" r="42" fill="url(#coinShadowOrders)" />
    <circle cx="50" cy="50" r="38" fill="url(#coinGradientOrders)" />
    <ellipse cx="35" cy="35" rx="15" ry="12" fill="rgba(255,255,255,0.3)" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#B8860B" strokeWidth="2" />
    <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#B8860B" fontFamily="Arial, sans-serif">M</text>
  </svg>
);

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatFullDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'filled':
      return {
        icon: CheckCircle2,
        label: 'Filled',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      };
    case 'partial':
      return {
        icon: AlertCircle,
        label: 'Partial',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    case 'open':
      return {
        icon: Clock,
        label: 'Open',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      };
    case 'cancelled':
      return {
        icon: XCircle,
        label: 'Cancelled',
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
    default:
      return {
        icon: AlertCircle,
        label: status,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
  }
};

export default function OrdersPage() {
  const { orders, pagination, isLoading, fetchOrders } = useOrdersStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

  // Calculate order statistics
  const orderStats = orders.reduce((acc, order) => {
    if (order.status === 'filled') acc.filled++;
    else if (order.status === 'open') acc.open++;
    else if (order.status === 'cancelled') acc.cancelled++;
    
    if (order.side === 'buy') acc.buys++;
    else acc.sells++;
    
    return acc;
  }, { filled: 0, open: 0, cancelled: 0, buys: 0, sells: 0 });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 mt-24 flex flex-col items-center justify-center min-h-[60vh]">
        <LoaderThree />
        <p className="text-muted-foreground mt-4">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Image
                src="/color-notebook.png"
                alt="Orders"
                width={28}
                height={28}
              />
            </div>
            Order History
          </h1>
          <p className="text-gray-500">
            Track all your trading activity
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchOrders(currentPage, ITEMS_PER_PAGE)}
          className="flex items-center gap-2 border-white/10 hover:bg-white/5 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <ClipboardList className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Filled</p>
                <p className="text-2xl font-bold text-emerald-400">{orderStats.filled}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Open</p>
                <p className="text-2xl font-bold text-blue-400">{orderStats.open}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Buy / Sell</p>
                <p className="text-2xl font-bold">
                  <span className="text-emerald-400">{orderStats.buys}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">{orderStats.sells}</span>
                </p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-card border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription className="text-gray-500">
            {pagination ? `Showing ${orders.length} of ${pagination.total} orders` : `Showing ${orders.length} orders`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">No orders yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Place your first order to start trading meme stocks
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
                    <th className="text-left py-4 px-6 font-medium text-gray-400 text-sm">Time</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-400 text-sm">Asset</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-400 text-sm">Side</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-400 text-sm">Type</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Price</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Quantity</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-400 text-sm">Filled</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-400 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    const filledQty = order.originalQuantity - order.remainingQuantity;
                    const fillPercent = (filledQty / order.originalQuantity) * 100;
                    
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-white text-sm">{formatDate(order.createdAt)}</span>
                            <span className="text-gray-500 text-xs">{formatFullDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Link 
                            href={`/symbol/${order.symbol}`}
                            className="flex items-center gap-3 group-hover:text-orange-400 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/10 ring-2 ring-orange-500/20">
                              <Image
                                src={STOCK_IMAGES[order.symbol as Symbol]}
                                alt={order.symbol}
                                width={36}
                                height={36}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <span className="font-semibold text-white">{order.symbol}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          {order.side === 'buy' ? (
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 rounded bg-emerald-500/20">
                                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                              </div>
                              <span className="text-emerald-400 font-medium text-sm">BUY</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 rounded bg-red-500/20">
                                <ArrowDownRight className="h-3 w-3 text-red-400" />
                              </div>
                              <span className="text-red-400 font-medium text-sm">SELL</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="border-white/10 text-gray-400 capitalize">
                            {order.type}
                          </Badge>
                        </td>
                        <td className="text-right py-4 px-6">
                          {order.price ? (
                            <div className="flex items-center justify-end gap-1">
                              <GoldCoin className="size-4" />
                              <span className="text-white">{formatCoins(order.price)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Market</span>
                          )}
                        </td>
                        <td className="text-right py-4 px-6 text-white">
                          {order.originalQuantity}
                        </td>
                        <td className="text-right py-4 px-6">
                          <div className="flex flex-col items-end">
                            <span className="text-white">{filledQty} / {order.originalQuantity}</span>
                            <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <Badge className={`${statusInfo.className} border gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                            {order.status === 'cancelled' && order.type === 'market' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-300" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-xs bg-zinc-900 border-white/10 text-white p-3">
                                    <p className="font-semibold mb-1">Why was this cancelled?</p>
                                    <p className="text-xs text-gray-400">
                                      Market orders are executed as IOC (Immediate-or-Cancel). 
                                      If there&apos;s not enough liquidity at the current market price 
                                      to fill your order, the unfilled portion is automatically cancelled.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-white/5 p-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="border-white/10 hover:bg-white/5"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-gray-400 px-2">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="border-white/10 hover:bg-white/5"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
