'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut } from 'lucide-react';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from '@/components/ui/resizable-navbar';

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
    {/* Outer ring with 3D effect */}
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="25%" stopColor="#FFC107" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="75%" stopColor="#FFA000" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <linearGradient id="coinShine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FF8F00" stopOpacity="0.1" />
      </linearGradient>
      <radialGradient id="coinShadow" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
      </radialGradient>
    </defs>
    {/* Coin edge (3D effect) */}
    <ellipse cx="50" cy="52" rx="42" ry="42" fill="#B8860B" />
    {/* Main coin face */}
    <circle cx="50" cy="50" r="42" fill="url(#coinShadow)" />
    <circle cx="50" cy="50" r="38" fill="url(#coinGradient)" />
    {/* Shine effect */}
    <ellipse cx="35" cy="35" rx="15" ry="12" fill="url(#coinShine)" />
    {/* Inner circle */}
    <circle cx="50" cy="50" r="30" fill="none" stroke="#B8860B" strokeWidth="2" />
    {/* Dollar sign or M for Meme */}
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontSize="28"
      fontWeight="bold"
      fill="#B8860B"
      fontFamily="Arial, sans-serif"
    >
      M
    </text>
  </svg>
);

export function AppNavbar() {
  const { user, isLoading } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedAvatarUrl = localStorage.getItem('user_avatar_url');
    const storedFullName = localStorage.getItem('user_full_name');
    const storedEmail = localStorage.getItem('user_email');
    
    if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);
    if (storedFullName) setUserName(storedFullName);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('sb-zuxsdgfqyvltynwigkpc-auth-token');
    localStorage.removeItem('user_avatar_url');
    localStorage.removeItem('user_full_name');
    localStorage.removeItem('user_email');
    window.location.href = '/';
  };

  // Use localStorage data as fallback if user store doesn't have the data
  const displayAvatarUrl = user?.avatarUrl || avatarUrl;
  const displayName = user?.name || userName;
  const displayEmail = user?.email || userEmail;

  const navItems = [
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Holdings', link: '/holdings' },
    { name: 'Orders', link: '/orders' },
  ];

  return (
    <Navbar className="top-10">
      {/* Desktop Navigation */}
      <NavBody className="bg-card/80 border border-white/10">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="relative z-20 flex items-center gap-2 px-2 py-1"
        >
          <div className="bg-orange-500 text-white flex size-8 items-center justify-center rounded-xl">
            <span className="text-sm font-bold">M</span>
          </div>
          <span className="font-semibold text-white">MemeExchange</span>
        </Link>

        {/* Nav Items */}
        <NavItems items={navItems} />

        {/* Right Side - Wallet Balance & Profile */}
        <div className="relative z-20 flex items-center gap-3">
          {/* Wallet Balance Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <GoldCoin className="size-5" />
            {isLoading ? (
              <Skeleton className="h-4 w-16 bg-amber-500/20" />
            ) : (
              <span className="font-semibold text-sm text-amber-400">
                {user ? formatCoins(user.walletBalance) : '0.00'}
              </span>
            )}
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              {isLoading ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-white/10 hover:border-orange-500/50 transition-colors">
                  <AvatarImage src={displayAvatarUrl || undefined} alt={displayName || 'User'} />
                  <AvatarFallback className="bg-card text-white">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-white/10">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">{displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav className="bg-card/80 border border-white/10">
        <MobileNavHeader>
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="bg-orange-500 text-white flex size-8 items-center justify-center rounded-xl">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="font-semibold text-white">MemeExchange</span>
          </Link>

          {/* Right side with wallet, avatar, and toggle */}
          <div className="flex items-center gap-2">
            {/* Compact Wallet Balance */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
              <GoldCoin className="size-4" />
              {isLoading ? (
                <Skeleton className="h-3 w-10 bg-amber-500/20" />
              ) : (
                <span className="font-semibold text-xs text-amber-400">
                  {user ? formatCoins(user.walletBalance) : '0.00'}
                </span>
              )}
            </div>

            {/* Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/10">
                    <AvatarImage src={displayAvatarUrl || undefined} alt={displayName || 'User'} />
                    <AvatarFallback className="bg-card text-white text-xs">
                      {displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{displayEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full px-4 py-2 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export default AppNavbar;
