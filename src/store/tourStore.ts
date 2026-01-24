import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOUR_STEPS } from '@/components/tour/tourSteps';

interface TourState {
  hasCompletedTour: boolean;
  hasSkippedTour: boolean;
  isTourActive: boolean;
  currentStepIndex: number;

  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      hasCompletedTour: false,
      hasSkippedTour: false,
      isTourActive: false,
      currentStepIndex: 0,

      startTour: () => set({ isTourActive: true, currentStepIndex: 0 }),

      nextStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          get().completeTour();
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTour: () => set({
        isTourActive: false,
        hasSkippedTour: true,
        currentStepIndex: 0,
      }),

      completeTour: () => set({
        isTourActive: false,
        hasCompletedTour: true,
        currentStepIndex: 0,
      }),

      resetTour: () => set({
        hasCompletedTour: false,
        hasSkippedTour: false,
        isTourActive: false,
        currentStepIndex: 0,
      }),
    }),
    {
      name: 'typing-test-tour',
      partialize: (state) => ({
        hasCompletedTour: state.hasCompletedTour,
        hasSkippedTour: state.hasSkippedTour,
      }),
    }
  )
);
