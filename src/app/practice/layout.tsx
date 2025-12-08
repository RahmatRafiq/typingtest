import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Practice - Train Weak Words & Hand Drills",
  description: "Targeted typing practice for your weak words. Train with left/right hand modes or custom word lists.",
  alternates: {
    canonical: "/practice",
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
