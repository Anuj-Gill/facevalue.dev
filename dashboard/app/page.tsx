"use client";

import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { AppNavbar } from "@/components/layout/Navbar";
import { Footer, FaceValueBrandText } from "@/components/layout/Footer";
import { useUserStore } from "@/stores";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// Landing page components
import {
  InfiniteTicker,
  StatsSection as StatsBar,
  SponsorsSection,
  FAQSection,
  FeaturesSection,
} from "@/components/landing";

export default function LandingPage() {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <AppNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
        {/* Spotlight Effect with White Theme */}
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 80%, transparent 100%)"
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-none">
            <span className="text-white">Trade the Tech Faces,</span>
            <br />
            <span className="text-orange-500">Own the Hype</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-normal">
            Powered by a custom TypeScript matching engine. Buy and sell your
            favorite founders in real-time on an exchange built for developers
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Primary CTA - Changes based on auth state */}
            <Link href={user ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg rounded-full transition-all hover:scale-105"
              >
                {user ? "Go to Dashboard" : "Start Trading"}
              </Button>
            </Link>

            {/* Secondary CTA */}
            <a
              href="https://github.com/Anuj-Gill/meme-stock-exchange"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full transition-all hover:scale-105"
              >
                <Github className="mr-2 h-5 w-5" />
                View Source Code
              </Button>
            </a>
          </div>

          {/* Micro-copy */}
          <p className="text-sm text-gray-600">
            100% Virtual Currency. 0% Financial Advice.
          </p>
          {/* Ticker Tape Section */}
          <section className="relative py-8">
            <div className="max-w-7xl mx-auto">
              <InfiniteTicker />
            </div>
          </section>
        </div>

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </section>

      {/* Dashboard Preview Section with Scroll Animation */}
      <section className="bg-black overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                Your Trading{" "}
                <span className="text-orange-500">Command Center</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-lg mb-4">
                Real-time charts, live order books, and instant execution — all
                in one sleek interface.
              </p>
            </>
          }
        >
          <Image
            src="/dashboard_image.png"
            alt="Face Value Dashboard Preview"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </section>

      {/* Stats Bar Section */}
      <StatsBar />

      {/* Features Section */}
      <FeaturesSection />

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Face Value Brand Text */}
      <FaceValueBrandText />
    </div>
  );
}
