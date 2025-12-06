import { TestResults, TestSession } from '@/types';
import { getWords } from '@/lib/words';
import { syncTestSession } from '@/lib/supabaseSync';
import { TestSliceCreator } from '../types';

export const createTestSlice: TestSliceCreator = (set, get) => ({
  startTest: () => {
    const { handMode, duration, testMode } = get();
    const wordCount = testMode === 'words' ? duration : 200;
    const words = getWords(handMode, wordCount);

    set({
      status: 'running',
      words,
      currentWordIndex: 0,
      currentInput: '',
      wordResults: [],
      startTime: Date.now(),
      endTime: null,
      timeRemaining: testMode === 'time' ? duration : Infinity,
      currentWordStartTime: null,
      currentWordKeystrokes: [],
      lastKeystrokeTime: null,
      furthestWordIndex: 0,
      results: null,
      wpmHistory: [],
    });
  },

  resetTest: () => {
    const { duration, testMode } = get();
    set({
      status: 'idle',
      words: [],
      currentWordIndex: 0,
      currentInput: '',
      wordResults: [],
      startTime: null,
      endTime: null,
      timeRemaining: testMode === 'time' ? duration : Infinity,
      currentWordStartTime: null,
      currentWordKeystrokes: [],
      lastKeystrokeTime: null,
      furthestWordIndex: 0,
      results: null,
      wpmHistory: [],
    });
  },

  tick: () => {
    const state = get();
    if (state.status !== 'running' || state.testMode !== 'time') return;

    const newTimeRemaining = state.timeRemaining - 1;

    // Calculate instantaneous Raw WPM for history
    const currentTime = Date.now();
    const elapsedTime = (currentTime - (state.startTime || currentTime)) / 1000 / 60; // in minutes

    let totalChars = 0;
    state.wordResults.forEach((w, index) => {
      totalChars += w.typed.length;
      if (index < state.wordResults.length - 1) totalChars++; // space
    });
    // Add current input length
    totalChars += state.currentInput.length;

    // Avoid division by zero
    const currentRawWpm = elapsedTime > 0 ? Math.round((totalChars / 5) / elapsedTime) : 0;

    set((prev) => ({
      wpmHistory: [...prev.wpmHistory, currentRawWpm]
    }));

    if (newTimeRemaining <= 0) {
      set({ timeRemaining: 0 });
      get().finishTest();
    } else {
      set({ timeRemaining: newTimeRemaining });
    }
  },

  finishTest: () => {
    const state = get();
    const endTime = Date.now();
    const totalTimeInMinutes = (endTime - (state.startTime || endTime)) / 1000 / 60;

    let totalChars = 0;
    let correctChars = 0;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;

    state.wordResults.forEach((w, index) => {
      // For Raw WPM: count all typed characters including spaces
      totalChars += w.typed.length;

      // For WPM: count only correct characters in correct words
      if (w.correct) {
        correctChars += w.expected.length;
      } else {
        // Even in incorrect words, some chars might be correct, but Monkeytype usually 
        // counts "correct chars" as characters in words that are fully correct OR 
        // characters that are correct within the word.
        // Let's stick to the definition: "correct characters"
        const expectedChars = w.expected.split('');
        const typedChars = w.typed.split('');
        expectedChars.forEach((char, charIndex) => {
          if (typedChars[charIndex] === char) correctChars++;
        });
      }

      // Add space if not last word
      if (index < state.wordResults.length - 1) {
        totalChars++; // space is a char
        if (w.correct) correctChars++; // space after correct word is correct
      }

      // Accuracy calculations
      totalKeystrokes += w.keystrokes.length;
      correctKeystrokes += w.keystrokes.filter(k => k.correct).length;
    });

    const incorrectChars = totalChars - correctChars;
    const totalWords = state.wordResults.length;
    const correctWords = state.wordResults.filter((w) => w.correct).length;

    // Monkeytype Formulas
    // WPM = (Total Correct Chars / 5) / Time (min)
    const wpm = Math.round((correctChars / 5) / totalTimeInMinutes);

    // Raw WPM = (Total Chars / 5) / Time (min)
    const rawWpm = Math.round((totalChars / 5) / totalTimeInMinutes);

    // Accuracy = (Correct Keystrokes / Total Keystrokes) * 100
    const accuracy = totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 0;

    // Consistency = 100 * (1 - sd(raw wpm) / avg(raw wpm))
    // Use samples from wpmHistory
    const wpmSamples = state.wpmHistory;
    let consistency = 0;

    if (wpmSamples.length > 0) {
      const avgRawWpm = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
      const variance = wpmSamples.reduce((sum, val) => sum + Math.pow(val - avgRawWpm, 2), 0) / wpmSamples.length;
      const sd = Math.sqrt(variance);

      // Monkeytype uses specific mapping, but coefficient of variation is standard
      // COV = SD / Mean
      if (avgRawWpm > 0) {
        consistency = Math.max(0, Math.round(100 * (1 - sd / avgRawWpm)));
      }
    }

    const problemWordsList = state.wordResults
      .filter((w) => {
        const typoRate = w.keystrokes.length > 0 ? w.typoCount / w.keystrokes.length : 0;
        // Simple heuristic for problem words
        return typoRate > 0.3;
      })
      .map((w) => w.expected);

    const slowWords = state.wordResults
      .filter((w) => {
        const wordTime = w.endTime - w.startTime;
        // Define slow as taking 2x longer than average char time * word length
        // This is a simplified check
        return false;
      }) // Simplified for now as we changed metrics
      .map((w) => w.expected);

    const results: TestResults = {
      wpm,
      rawWpm,
      accuracy,
      consistency,
      totalChars,
      correctChars,
      incorrectChars,
      totalWords,
      correctWords,
      problemWords: [...new Set(problemWordsList)],
      slowWords: [...new Set(slowWords)],
    };

    const session: TestSession = {
      id: crypto.randomUUID(),
      timestamp: endTime,
      mode: state.testMode,
      handMode: state.handMode,
      duration: state.duration,
      words: state.wordResults,
      results,
    };

    const newHistory = [session, ...state.testHistory].slice(0, 50);

    set({
      status: 'finished',
      endTime,
      results,
      testHistory: newHistory,
    });

    syncTestSession(session).catch(console.error);
    get().updateProblemWords(state.wordResults);
  },
});
