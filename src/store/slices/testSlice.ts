import { TestResults, TestSession } from '@/types';
import { getWords } from '@/lib/words';
import { syncTestSession } from '@/lib/supabaseSync';
import { TypingState, StateCreator } from '../types';

export const createTestSlice: StateCreator = (set, get) => ({
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
    });
  },

  tick: () => {
    const state = get();
    if (state.status !== 'running' || state.testMode !== 'time') return;

    const newTimeRemaining = state.timeRemaining - 1;

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
    const totalTime = (endTime - (state.startTime || endTime)) / 1000;

    let totalChars = 0;
    let correctChars = 0;

    state.wordResults.forEach((w, index) => {
      totalChars += w.typed.length;

      if (index < state.wordResults.length - 1) {
        totalChars += 1;
        correctChars += 1;
      }

      const expectedChars = w.expected.split('');
      const typedChars = w.typed.split('');

      expectedChars.forEach((char, charIndex) => {
        if (typedChars[charIndex] === char) {
          correctChars += 1;
        }
      });
    });

    const incorrectChars = totalChars - correctChars;
    const totalWords = state.wordResults.length;
    const correctWords = state.wordResults.filter((w) => w.correct).length;

    const wpm = Math.round((correctChars / 5 / totalTime) * 60);
    const rawWpm = Math.round((totalChars / 5 / totalTime) * 60);
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    const wordTimes = state.wordResults.map((w) => w.endTime - w.startTime);
    const avgTime = wordTimes.reduce((a, b) => a + b, 0) / wordTimes.length;
    const variance = wordTimes.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / wordTimes.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, Math.round(100 - (stdDev / avgTime) * 100));

    const problemWordsList = state.wordResults
      .filter((w) => {
        const typoRate = w.keystrokes.length > 0 ? w.typoCount / w.keystrokes.length : 0;
        const wordTime = w.endTime - w.startTime;
        return typoRate > 0.3 || wordTime > avgTime * 2;
      })
      .map((w) => w.expected);

    const slowWords = state.wordResults
      .filter((w) => w.endTime - w.startTime > avgTime * 2)
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
