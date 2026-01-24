import type { Metadata } from "next";
import { Caveat, Patrick_Hand, Special_Elite } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MainWrapper from "@/components/MainWrapper";
import SyncIndicator from "@/components/SyncIndicator";
import { FocusProvider } from "@/context/FocusContext";
import TourProvider from "@/components/tour/TourProvider";

// Handwritten style font for headings and UI
const caveat = Caveat({
  variable: "--font-sketch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Secondary handwritten font
const patrickHand = Patrick_Hand({
  variable: "--font-sketch-alt",
  subsets: ["latin"],
  weight: "400",
});

// Typewriter style for typing area
const specialElite = Special_Elite({
  variable: "--font-sketch-mono",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://typingtest-olive.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TypeMaster - Latihan Mengetik",
    template: "%s | TypeMaster"
  },
  description: "Latihan mengetik dengan gaya notebook. Lacak kemajuan, analisis kelemahan, dan tingkatkan kecepatan mengetik.",
  alternates: {
    canonical: "/",
  },
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
    locale: "id_ID",
    url: siteUrl,
    siteName: "TypeMaster",
    title: "TypeMaster - Latihan Mengetik",
    description: "Latihan mengetik dengan gaya notebook. Lacak kemajuan dan tingkatkan kecepatan.",
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
    title: "TypeMaster - Latihan Mengetik",
    description: "Latihan mengetik dengan gaya notebook dan analitik mendalam.",
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
    <html lang="id">
      <body
        className={`${caveat.variable} ${patrickHand.variable} ${specialElite.variable} antialiased min-h-screen`}
      >
        <FocusProvider>
          <Header />
          <MainWrapper>
            {children}
          </MainWrapper>
          <SyncIndicator />
          <TourProvider />
        </FocusProvider>
      </body>
    </html>
  );
}
