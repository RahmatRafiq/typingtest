import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TypeMaster - Advanced Typing Test with Deep Analytics",
    template: "%s | TypeMaster"
  },
  description: "Master your typing skills with personalized training. Identify your weak words, track progress, and practice with targeted drills. Features left/right hand modes, detailed analytics, and problem word detection.",
  keywords: [
    "typing test",
    "typing speed",
    "WPM test",
    "typing practice",
    "keyboard training",
    "touch typing",
    "typing analytics",
    "typing improvement",
    "problem words",
    "typing trainer"
  ],
  authors: [{ name: "TypeMaster" }],
  creator: "TypeMaster",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://typemaster.app",
    siteName: "TypeMaster",
    title: "TypeMaster - Advanced Typing Test with Deep Analytics",
    description: "Master your typing skills with personalized training. Identify weak words and practice with targeted drills.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TypeMaster - Typing Test"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeMaster - Advanced Typing Test",
    description: "Master your typing skills with personalized training and deep analytics.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
