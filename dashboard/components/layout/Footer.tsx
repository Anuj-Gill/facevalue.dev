'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';

// Footer component
export const Footer = () => {
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
                <a
                  href="https://github.com/sponsors/Anuj-Gill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                >
                  Become a Sponsor
                </a>
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
