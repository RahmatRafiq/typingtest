'use client';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="pl-4 sm:pl-6 lg:pl-8 pr-4 py-6 sm:py-8 transition-all duration-300">
      {children}
    </main>
  );
}
