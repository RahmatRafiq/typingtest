import { TestMode, HandMode } from '@/types';
import { TypingState, StateCreator } from '../types';

export const createSettingsSlice: StateCreator = (set, get) => ({
  setTestMode: (mode: TestMode) => set({ testMode: mode }),
  setHandMode: (mode: HandMode) => set({ handMode: mode }),
  setDuration: (duration: number) => set({ duration, timeRemaining: duration }),
});
