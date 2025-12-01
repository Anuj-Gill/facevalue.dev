'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Github, Plus, ChevronDown } from 'lucide-react';

// Sponsors configuration - Add new sponsors here
interface Sponsor {
  name: string;
  avatar?: string;
  amount: number;
  message?: string;
  github?: string;
  twitter?: string;
}

const SPONSORS: Sponsor[] = [
  {
    name: 'Om Alve',
    avatar: '/sponsors/om.webp',
    amount: 10,
    message: 'I am betting on Sam!!',
    github: 'https://github.com/Om-Alve',
    twitter: 'https://x.com/alve_om',
  },
  {
    name: 'Sahil Shangloo',
    avatar: '/sponsors/sahil.webp',
    amount: 5,
    message: 'Love this project',
    github: 'https://github.com/SAHILSHANGLOO35',
    twitter: 'https://x.com/doubleSdotdev',
  },
  {
    name: 'Arkan Khan',
    avatar: '/sponsors/arkan.webp',
    amount: 8,
    message: 'Ab toh paisa hi paisa hoga',
    github: 'https://github.com/Arkan-Khan',
    twitter: 'https://x.com/arkan__khan_',
  },
  // Add more sponsors as needed
];

// Sponsor Card component
interface SponsorCardProps {
  name: string;
  avatar?: string;
  amount: number;
  message?: string;
  github?: string;
  twitter?: string;
}

const SponsorCard = ({
  name,
  avatar,
  amount,
  message,
  github,
  twitter,
}: SponsorCardProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative bg-zinc-900/60 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-400">
              {initials}
            </span>
          )}
        </div>

        {/* Social Links */}
        {(github || twitter) && (
          <div className="flex items-center gap-3 mb-3">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all"
              >
                <Github className="w-4 h-4 text-gray-400 hover:text-white" />
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Name */}
        <h3 className="text-white font-semibold text-lg mb-2">{name}</h3>

        {/* Amount */}
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-3">
          <span className="text-gray-400 text-sm">Amount:</span>
          <span className="text-orange-400 font-bold text-lg">${amount}</span>
        </div>

        {/* Message */}
        {message && (
          <p className="text-gray-500 text-sm italic">
            &ldquo;{message}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
};

// Become a Sponsor Card with Modal
const BecomeSponsorCard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative bg-zinc-900/40 border border-dashed border-white/20 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] cursor-pointer w-full"
      >
        {/* Plus icon */}
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 border-2 border-dashed border-white/20 flex items-center justify-center mb-4 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all duration-300">
          <Plus className="w-8 h-8 text-gray-500 group-hover:text-orange-500 transition-colors duration-300" />
        </div>

        {/* Text */}
        <h3 className="text-gray-400 font-medium text-lg mb-2 group-hover:text-white transition-colors duration-300">
          Your Name Here
        </h3>
        <p className="text-gray-600 text-sm text-center max-w-[180px]">
          Love what we built? Become a sponsor and get featured here.
        </p>
      </button>

      {/* Sponsor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-zinc-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-orange-500/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <span className="text-gray-400 group-hover:text-white text-lg leading-none">
                &times;
              </span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl scale-150" />
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
                    <Image
                      src="/color-heart.png"
                      alt="Support"
                      width={180}
                      height={180}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Support This Project
              </h3>
              <p className="text-gray-400 text-sm">
                Choose your preferred way to sponsor
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Buy Me a Coffee */}
              <a
                href="https://buymeacoffee.com/gillanuj12e"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#FFDD00]/10 border border-[#FFDD00]/30 rounded-2xl hover:bg-[#FFDD00]/20 transition-all group"
              >
                <div className="w-12 h-12 bg-[#FFDD00] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">☕</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white group-hover:text-[#FFDD00] transition-colors">
                    Buy Me a Coffee
                  </h4>
                  <p className="text-sm text-gray-400">
                    Quick & easy way to support
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500 -rotate-90" />
              </a>

              {/* UPI Payment */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">🇮🇳</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Pay via UPI</h4>
                    <p className="text-sm text-gray-400">Scan QR code to pay</p>
                  </div>
                </div>
                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <Image
                    src="/qr-code.webp"
                    alt="UPI QR Code"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-xs mt-6">
              Your support helps keep this project alive! 🚀
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// Sponsors Section
export const SponsorsSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-orange-500">Sponsors</span>
          </h2>
        </div>

        {/* Sponsors Grid */}
        {SPONSORS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {SPONSORS.map((sponsor, index) => (
              <SponsorCard
                key={index}
                name={sponsor.name}
                avatar={sponsor.avatar}
                amount={sponsor.amount}
                message={sponsor.message}
                github={sponsor.github}
                twitter={sponsor.twitter}
              />
            ))}
            <BecomeSponsorCard />
          </div>
        ) : (
          /* Empty state - only show become sponsor card */
          <div className="flex flex-col items-center">
            <div className="max-w-sm w-full">
              <BecomeSponsorCard />
            </div>
            <p className="text-gray-600 text-sm mt-6 text-center">
              Be the first to support Face Value!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
