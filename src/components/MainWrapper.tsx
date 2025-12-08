'use client';

import { useFocus } from '@/context/FocusContext';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocus();

  return (
    <main
      className={`mx-auto transition-all duration-300 ${
        isFocusMode
          ? 'max-w-7xl px-4 sm:px-6 lg:px-12 pt-[8vh] pb-8'
          : 'max-w-7xl px-4 sm:px-6 lg:px-12 py-6 sm:py-8'
      }`}
    >
      {children}
    </main>
  );
}
