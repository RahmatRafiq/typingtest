import { Keystroke } from '@/types';
import { getWordHand } from '@/lib/words';
import { TypingState, StateCreator } from '../types';

export const createInputSlice: StateCreator = (set, get) => ({
  handleKeyPress: (key: string) => {
    const state = get();
    if (state.status !== 'running') return;
    if (key === ' ') return;

    const now = Date.now();

    if (state.currentWordStartTime === null) {
      set({ currentWordStartTime: now });
    }

    const delay = state.lastKeystrokeTime ? now - state.lastKeystrokeTime : 0;
    const currentWord = state.words[state.currentWordIndex];
    const expectedChar = currentWord[state.currentInput.length];
    const isCorrect = key === expectedChar;

    const keystroke: Keystroke = {
      key,
      timestamp: now,
      correct: isCorrect,
      delay,
    };

    set({
      currentInput: state.currentInput + key,
      currentWordKeystrokes: [...state.currentWordKeystrokes, keystroke],
      lastKeystrokeTime: now,
    });
  },

  handleBackspace: () => {
    const state = get();
    if (state.status !== 'running') return;

    if (state.currentInput.length === 0) {
      if (state.currentWordIndex > 0 && state.currentWordIndex > state.furthestWordIndex - 1) {
        const prevIndex = state.currentWordIndex - 1;
        const prevWordResult = state.wordResults[prevIndex];

        if (prevWordResult && !prevWordResult.correct) {
          set({
            currentWordIndex: prevIndex,
            currentInput: prevWordResult.typed,
            wordResults: state.wordResults.slice(0, -1),
            currentWordKeystrokes: prevWordResult.keystrokes,
            currentWordStartTime: prevWordResult.startTime,
            lastKeystrokeTime: Date.now(),
          });
        }
      }
      return;
    }

    set({
      currentInput: state.currentInput.slice(0, -1),
      currentWordKeystrokes: state.currentWordKeystrokes.slice(0, -1),
      lastKeystrokeTime: Date.now(),
    });
  },

  handleSpace: () => {
    const state = get();
    if (state.status !== 'running') return;
    if (state.currentInput.length === 0) return;

    const now = Date.now();
    const currentWord = state.words[state.currentWordIndex];
    const typedWord = state.currentInput;
    const isWordCorrect = typedWord === currentWord;
    const typoCount = state.currentWordKeystrokes.filter((k) => !k.correct).length;

    const wordResult = {
      expected: currentWord,
      typed: typedWord,
      correct: isWordCorrect,
      startTime: state.currentWordStartTime || now,
      endTime: now,
      keystrokes: state.currentWordKeystrokes,
      typoCount,
      hand: getWordHand(currentWord),
    };

    const newWordResults = [...state.wordResults, wordResult];
    const newIndex = state.currentWordIndex + 1;

    if (state.testMode === 'words' && newIndex >= state.duration) {
      set({ wordResults: newWordResults, currentWordIndex: newIndex });
      get().finishTest();
      return;
    }

    if (newIndex >= state.words.length) {
      set({ wordResults: newWordResults, currentWordIndex: newIndex });
      get().finishTest();
      return;
    }

    set({
      currentWordIndex: newIndex,
      currentInput: '',
      wordResults: newWordResults,
      currentWordStartTime: null,
      currentWordKeystrokes: [],
      lastKeystrokeTime: now,
      furthestWordIndex: Math.max(state.furthestWordIndex, newIndex),
    });
  },
});
