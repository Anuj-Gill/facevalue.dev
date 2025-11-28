'use client';

import { useEffect } from 'react';
import { AppNavbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { useUserStore, useHoldingsStore } from '@/stores';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUser } = useUserStore();
  const { fetchHoldings } = useHoldingsStore();

  useEffect(() => {
    // Fetch user data and holdings on mount
    fetchUser();
    fetchHoldings();
  }, [fetchUser, fetchHoldings]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main>{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
