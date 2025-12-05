import { SettingsSliceCreator } from '../types';

export const createSettingsSlice: SettingsSliceCreator = (set) => ({
  setTestMode: (mode) => set({ testMode: mode }),
  setHandMode: (mode) => set({ handMode: mode }),
  setDuration: (duration) => set({ duration, timeRemaining: duration }),
});
