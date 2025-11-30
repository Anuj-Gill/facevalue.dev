'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, ChevronRight } from 'lucide-react';

// Sponsor Modal component
const SponsorModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-zinc-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-orange-500/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
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
            <ChevronRight className="w-5 h-5 text-gray-500" />
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
  );
};

// Footer component
export const Footer = () => {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  return (
    <footer className="py-12 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/facevalue_logo.webp"
                alt="Face Value"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-semibold text-white">Face Value</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              A virtual stock exchange for trading CEO stocks. Built with modern tech, 
              designed for maximum fun. 100% open source.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/suggestions" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Suggestions
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Anuj-Gill/meme-stock-exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <button
                  onClick={() => setShowSponsorModal(true)}
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm cursor-pointer"
                >
                  Become a Sponsor
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Face Value. Open source under MIT License.
          </p>
        </div>
      </div>

      {/* Sponsor Modal */}
      <SponsorModal isOpen={showSponsorModal} onClose={() => setShowSponsorModal(false)} />
    </footer>
  );
};

export const FaceValueBrandText = () => {
  return (
    <div className="bg-black pb-20">
      <p className="text-center uppercase mt-20 text-5xl md:text-9xl lg:text-[12rem] xl:text-[13rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 dark:from-neutral-950 dark:to-neutral-800">
        Face Value
      </p>
    </div>
  );
};

export default Footer;
