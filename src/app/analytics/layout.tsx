import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Analytics - Track WPM Progress & Performance",
  description: "Track your typing progress with detailed analytics. View WPM trends, accuracy stats, and identify problem words.",
  alternates: {
    canonical: "/analytics",
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
