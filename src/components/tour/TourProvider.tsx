'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTourStore } from '@/store/tourStore';
import TourOverlay from './TourOverlay';

export default function TourProvider() {
  const pathname = usePathname();
  const { isTourActive, hasCompletedTour, hasSkippedTour, startTour, nextStep, prevStep, skipTour } = useTourStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for store hydration from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Auto-start tour for first-time visitors on home page
  useEffect(() => {
    if (!hydrated) return;
    if (pathname !== '/') return;
    if (hasCompletedTour || hasSkippedTour) return;
    if (isTourActive) return;

    const timer = setTimeout(() => {
      startTour();
    }, 800);

    return () => clearTimeout(timer);
  }, [hydrated, pathname, hasCompletedTour, hasSkippedTour, isTourActive, startTour]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          skipTour();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  if (!hydrated || !isTourActive) return null;

  return <TourOverlay />;
}
