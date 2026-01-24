'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTourStore } from '@/store/tourStore';
import TourOverlay from './TourOverlay';

export default function TourProvider() {
  const pathname = usePathname();
  const { isTourActive, hasCompletedTour, hasSkippedTour, startTour, nextStep, prevStep, skipTour } = useTourStore();
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

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
    }, 1000);

    return () => clearTimeout(timer);
  }, [hydrated, pathname, hasCompletedTour, hasSkippedTour, isTourActive, startTour]);

  // Manage body scroll lock and visibility
  useEffect(() => {
    if (isTourActive) {
      document.body.style.overflow = 'hidden';
      // Small delay for mount animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isTourActive]);

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

  return (
    <div className={`tour-root ${visible ? 'tour-visible' : ''}`}>
      <TourOverlay />
    </div>
  );
}
