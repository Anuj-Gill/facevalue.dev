import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileWarningProvider } from "@/components/MobileWarningProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Face Value",
  description: "Trade the Tech Faces, Own the Hype",
  icons: {
    icon: '/facevalue_logo.png'
  },
  openGraph: {
    title: "Face Value",
    description: "Trade the Tech Faces, Own the Hype",
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Face Value",
    description: "Trade the Tech Faces, Own the Hype",
    images: ['/og.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MobileWarningProvider>
          {children}
        </MobileWarningProvider>
      </body>
    </html>
  );
}
