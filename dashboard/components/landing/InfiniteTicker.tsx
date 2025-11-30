'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePriceStream } from '@/hooks/usePriceStream';
import { SYMBOLS, STOCK_IMAGES, PERSON_NAMES, type Symbol } from '@/lib/constants';
import { GoldCoin } from './GoldCoin';

// Stock ticker card component
interface TickerCardProps {
  symbol: string;
  price: number | undefined;
  image: string;
  previousPrice: number | undefined;
  personName: string;
}

const TickerCard = ({
  symbol,
  price,
  image,
  previousPrice,
  personName,
}: TickerCardProps) => {
  const isUp =
    previousPrice !== undefined && price !== undefined && price > previousPrice;
  const isDown =
    previousPrice !== undefined && price !== undefined && price < previousPrice;

  return (
    <div className="flex items-center gap-4 bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-3 min-w-[280px] backdrop-blur-sm">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center ring-2 ring-orange-500/20 shrink-0">
        <Image
          src={image}
          alt={symbol}
          width={40}
          height={40}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Name & Type */}
      <div className="flex flex-col min-w-0">
        <span className="text-white font-semibold text-sm text-start">{symbol}</span>
        <span className="text-gray-500 text-xs">{personName}</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 ml-auto">
        <GoldCoin className="w-4 h-4" />
        <span className="text-white font-bold text-base">
          {price !== undefined ? (price / 100).toFixed(2) : '---'}
        </span>
      </div>

      {/* Live Badge & Arrows */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">LIVE</span>
        </div>

        {/* Animated arrows */}
        <div className="flex flex-col gap-0.5">
          <ArrowUp
            className={cn(
              'w-3 h-3 transition-colors',
              isUp ? 'text-emerald-400' : 'text-gray-600'
            )}
          />
          <ArrowDown
            className={cn(
              'w-3 h-3 transition-colors',
              isDown ? 'text-red-400' : 'text-gray-600'
            )}
          />
        </div>
      </div>
    </div>
  );
};

// Infinite Ticker component
export const InfiniteTicker = () => {
  const { prices } = usePriceStream();
  const [previousPrices, setPreviousPrices] = useState<Map<string, number>>(
    new Map()
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Update previous prices when prices change
  useEffect(() => {
    if (prices.size > 0) {
      const timer = setTimeout(() => {
        setPreviousPrices(new Map(prices));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [prices]);

  // Initialize animation
  useEffect(() => {
    if (scrollerRef.current) {
      setIsReady(true);
    }
  }, []);

  // Create stock items - duplicate for infinite scroll effect
  const stockItems = SYMBOLS.map((symbol) => ({
    symbol,
    image: STOCK_IMAGES[symbol as Symbol],
    name: PERSON_NAMES[symbol as Symbol],
  }));

  // Duplicate items for seamless loop
  const allItems = [...stockItems, ...stockItems, ...stockItems, ...stockItems];

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <div
        ref={scrollerRef}
        className={cn('flex gap-4 py-4 w-max', isReady && 'animate-scroll')}
        style={{
          ['--animation-duration' as string]: '30s',
          ['--animation-direction' as string]: 'forwards',
        }}
      >
        {allItems.map((item, index) => (
          <TickerCard
            key={`${item.symbol}-${index}`}
            symbol={item.symbol}
            price={prices.get(item.symbol)}
            image={item.image}
            previousPrice={previousPrices.get(item.symbol)}
            personName={item.name}
          />
        ))}
      </div>
    </div>
  );
};
