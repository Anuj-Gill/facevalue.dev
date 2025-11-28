'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrdersStore } from '@/stores';
import Link from 'next/link';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Format currency from cents to dollars
const formatCurrency = (cents: number | null) => {
  if (cents === null) return 'Market';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge variant
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'filled':
      return <Badge className="bg-green-500">Filled</Badge>;
    case 'partial':
      return <Badge className="bg-yellow-500">Partial</Badge>;
    case 'open':
      return <Badge variant="outline">Open</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Get side badge
const getSideBadge = (side: string) => {
  return side === 'buy' 
    ? <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/20">BUY</Badge>
    : <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/20">SELL</Badge>;
};

export default function OrdersPage() {
  const { orders, isLoading, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Order History
          </h1>
          <p className="text-muted-foreground">
            View all your past and pending orders
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchOrders()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Showing last 50 orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Place your first order to see it here
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Side</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Filled</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          href={`/symbol/${order.symbol}`}
                          className="font-medium hover:text-primary"
                        >
                          {order.symbol}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        {getSideBadge(order.side)}
                      </td>
                      <td className="py-3 px-4 capitalize text-sm">
                        {order.type}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(order.price)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {order.originalQuantity}
                      </td>
                      <td className="text-right py-3 px-4">
                        {order.originalQuantity - order.remainingQuantity} / {order.originalQuantity}
                      </td>
                      <td className="text-center py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
