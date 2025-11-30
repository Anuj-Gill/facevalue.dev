'use client';

import { Activity, Vote, LineChart } from 'lucide-react';
import { WobbleCard } from '@/components/ui/wobble-card';

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Why Trade on <span className="text-orange-500">Face Value</span>?
          </h2>
          <p className="text-gray-400 text-xl max-w-xl mx-auto">
            Built with modern tech, designed for maximum fun
          </p>
        </div>

        {/* Wobble Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Real-time Trading Card - Pink/Purple theme */}
          <WobbleCard containerClassName="col-span-1 lg:col-span-2 bg-pink-800 min-h-[300px]">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-left text-balance text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Real-Time Price Updates
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                Watch prices move live with Server-Sent Events. Every trade
                updates instantly across all connected clients. No refresh
                needed.
              </p>
            </div>
          </WobbleCard>

          {/* Community Voting Card - Default indigo */}
          <WobbleCard containerClassName="col-span-1 min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-left text-balance text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Community Voting
            </h2>
            <p className="mt-4 text-left text-base/6 text-neutral-200">
              Suggest new CEO stocks and vote on what gets listed next. The
              community decides.
            </p>
          </WobbleCard>

          {/* Order Book & Matching Engine Card - Blue theme */}
          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[250px]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-left text-balance text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Professional-Grade Order Book & Matching Engine
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                Place limit and market orders just like on a real exchange.
                Our custom-built matching engine processes orders in
                milliseconds, maintaining a proper order book with price-time
                priority. Experience the thrill of real trading mechanics with
                virtual currency.
              </p>
            </div>
          </WobbleCard>
        </div>
      </div>
    </section>
  );
};
