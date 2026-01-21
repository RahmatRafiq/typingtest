import { SettingsSliceCreator } from '../types';
import { setEnabled as setSoundEnabled, setVolume as setSoundVolume } from '@/lib/typeSound';

export const createSettingsSlice: SettingsSliceCreator = (set) => ({
  setTestMode: (mode) => set({ testMode: mode }),
  setHandMode: (mode) => set({ handMode: mode }),
  setDuration: (duration) => set({ duration, timeRemaining: duration }),
  setSoundEnabled: (enabled) => {
    setSoundEnabled(enabled);
    set({ soundEnabled: enabled });
  },
  setSoundVolume: (volume) => {
    setSoundVolume(volume);
    set({ soundVolume: volume });
  },
});
