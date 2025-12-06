import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TypingState } from './types';
import {
  createInputSlice,
  createTestSlice,
  createSettingsSlice,
  createPracticeSlice,
  createDataSlice,
} from './slices';

export const useTypingStore = create<TypingState>()(
  persist(
    (set, get) => ({
      // Initial state
      testMode: 'time',
      handMode: 'both',
      duration: 30,
      status: 'idle',
      words: [],
      currentWordIndex: 0,
      currentInput: '',
      wordResults: [],
      startTime: null,
      endTime: null,
      timeRemaining: 30,
      currentWordStartTime: null,
      currentWordKeystrokes: [],
      lastKeystrokeTime: null,
      furthestWordIndex: 0,
      results: null,
      problemWords: [],
      testHistory: [],
      wpmHistory: [],

      // Spread slices
      ...createSettingsSlice(set, get),
      ...createInputSlice(set, get),
      ...createTestSlice(set, get),
      ...createPracticeSlice(set, get),
      ...createDataSlice(set, get),
    }),
    {
      name: 'typing-test-storage',
      partialize: (state) => ({
        problemWords: state.problemWords,
        testHistory: state.testHistory,
      }),
    }
  )
);
