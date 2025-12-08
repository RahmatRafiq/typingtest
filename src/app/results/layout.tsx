import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Test Results - WPM & Accuracy Score",
  description: "View your typing test results including WPM, accuracy, and detailed performance breakdown.",
  alternates: {
    canonical: "/results",
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
