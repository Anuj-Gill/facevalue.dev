'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { marketDataApi } from '@/lib/api';
import { GoldCoin } from './GoldCoin';

// Animated Counter component
interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: React.ReactNode;
  suffix?: string;
}

const AnimatedCounter = ({
  target,
  duration = 2000,
  prefix,
  suffix,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(target * easeOutQuart));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <div
      ref={counterRef}
      className="flex items-center justify-center gap-1 text-4xl"
    >
      {prefix}
      <span className="text-4xl md:text-5xl font-bold text-white">
        {count.toLocaleString()}
      </span>
      {suffix && (
        <span className="text-4xl md:text-5xl font-bold text-white">
          {suffix}
        </span>
      )}
    </div>
  );
};

// Stats Bar component
export const StatsSection = () => {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalVolume: number;
    matchingEngineLatency: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await marketDataApi.getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback values
        setStats({
          totalOrders: 0,
          totalVolume: 0,
          matchingEngineLatency: 400,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Platform <span className="text-orange-500">Statistics</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-xl mx-auto">
            Real-time metrics from our trading engine
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Orders */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
              <Image src="/color-fire.png" alt="Fire" width={42} height={42} />
            </div>
            <AnimatedCounter target={stats?.totalOrders || 0} duration={2500} />
            <p className="text-gray-400 mt-2">Total Orders Placed</p>
          </div>

          {/* Total Volume */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
              <Image
                src="/color-money.png"
                alt="Money"
                width={42}
                height={42}
              />
            </div>
            <AnimatedCounter target={stats?.totalVolume || 0} duration={2500} />
            <p className="text-gray-400 mt-2">Total Volume Traded</p>
          </div>

          {/* Matching Engine Latency */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
              <Image
                src="/premium-flash.png"
                alt="Flash"
                width={42}
                height={42}
              />
            </div>
            <AnimatedCounter
              target={stats?.matchingEngineLatency || 300}
              duration={2000}
              suffix="ms"
              prefix="~"
            />
            <p className="text-gray-400 mt-2">Matching Engine Latency</p>
          </div>
        </div>
      </div>
    </section>
  );
};
