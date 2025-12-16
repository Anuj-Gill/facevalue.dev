"use client";

import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderThree } from "@/components/ui/loader"
import { userApi } from "@/lib/api"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await userApi.getProfile();
        router.replace('/dashboard');
      } catch {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-svh items-center justify-center">
        <LoaderThree />
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 antialiased">
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-3 self-center font-semibold text-xl">
          <Image
            src="/facevalue_logo.webp"
            alt="Face Value"
            width={90}
            height={90}
            className="rounded-lg"
          />
          <span className="text-white text-4xl">Face Value</span>
        </a>
        <LoginForm />
        
        {/* Subtle footer text */}
        <p className="text-center text-gray-600 text-xs mt-2">
          100% Virtual Currency • Zero Real Risk • Pure Fun
        </p>
      </div>
      
      {/* Floating stats badges */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Live Trading</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <span>Open Source</span>
        <div className="h-4 w-px bg-gray-700" />
        <span>Built for Devs</span>
      </div>
      
      <BackgroundBeams />
    </div>
  )
}
