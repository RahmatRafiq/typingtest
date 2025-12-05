import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  HandMode,
  TestMode,
  TestStatus,
  WordResult,
  TestSession,
  TestResults,
  ProblemWord,
  Keystroke,
} from '@/types';
import { getWords, getWordHand, getProblemWords } from '@/lib/words';
import { syncTestSession, syncProblemWords } from '@/lib/supabaseSync';

interface TypingState {
  // Test configuration
  testMode: TestMode;
  handMode: HandMode;
  duration: number; // seconds for time mode, word count for words mode

  // Test state
  status: TestStatus;
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  wordResults: WordResult[];

  // Timing
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number;

  // Keystroke tracking
  currentWordStartTime: number | null;
  currentWordKeystrokes: Keystroke[];
  lastKeystrokeTime: number | null;

  // Backtrack limit (can only go back 2 words from furthest point)
  furthestWordIndex: number;

  // Results
  results: TestResults | null;

  // Problem words (persisted)
  problemWords: ProblemWord[];

  // History (persisted)
  testHistory: TestSession[];

  // Actions
  setTestMode: (mode: TestMode) => void;
  setHandMode: (mode: HandMode) => void;
  setDuration: (duration: number) => void;
  startTest: () => void;
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  handleSpace: () => void;
  resetTest: () => void;
  tick: () => void;
  finishTest: () => void;
  startPracticeMode: (words: string[]) => void;
  updateProblemWords: (results: WordResult[]) => void;
}

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

      setTestMode: (mode) => set({ testMode: mode }),
      setHandMode: (mode) => set({ handMode: mode }),
      setDuration: (duration) => set({ duration, timeRemaining: duration }),

      startTest: () => {
        const { handMode, duration, testMode } = get();
        const wordCount = testMode === 'words' ? duration : 200; // More words for time mode
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

      handleKeyPress: (key) => {
        const state = get();
        if (state.status !== 'running') return;

        // Ignore space key here - handled by handleSpace
        if (key === ' ') return;

        const now = Date.now();

        // Start word timer on first keystroke
        if (state.currentWordStartTime === null) {
          set({ currentWordStartTime: now });
        }

        // Calculate delay from last keystroke
        const delay = state.lastKeystrokeTime ? now - state.lastKeystrokeTime : 0;

        const currentWord = state.words[state.currentWordIndex];
        const expectedChar = currentWord[state.currentInput.length];
        const isCorrect = key === expectedChar;

        // Record keystroke
        const keystroke: Keystroke = {
          key,
          timestamp: now,
          correct: isCorrect,
          delay,
        };

        const newKeystrokes = [...state.currentWordKeystrokes, keystroke];
        const newInput = state.currentInput + key;

        set({
          currentInput: newInput,
          currentWordKeystrokes: newKeystrokes,
          lastKeystrokeTime: now,
        });
      },

      handleBackspace: () => {
        const state = get();
        if (state.status !== 'running') return;

        // If current input is empty, try to go back to previous word
        if (state.currentInput.length === 0) {
          // Can only go back 1 word from furthest point
          if (state.currentWordIndex > 0 && state.currentWordIndex > state.furthestWordIndex - 1) {
            const prevIndex = state.currentWordIndex - 1;
            const prevWordResult = state.wordResults[prevIndex];

            if (prevWordResult) {
              // Remove the last word result and go back
              const newWordResults = state.wordResults.slice(0, -1);

              set({
                currentWordIndex: prevIndex,
                currentInput: prevWordResult.typed,
                wordResults: newWordResults,
                currentWordKeystrokes: prevWordResult.keystrokes,
                currentWordStartTime: prevWordResult.startTime,
                lastKeystrokeTime: Date.now(),
              });
            }
          }
          return;
        }

        // Remove last character
        const newInput = state.currentInput.slice(0, -1);

        // Also remove the last keystroke
        const newKeystrokes = state.currentWordKeystrokes.slice(0, -1);

        set({
          currentInput: newInput,
          currentWordKeystrokes: newKeystrokes,
          lastKeystrokeTime: Date.now(),
        });
      },

      handleSpace: () => {
        const state = get();
        if (state.status !== 'running') return;

        // Don't allow space if no input yet
        if (state.currentInput.length === 0) return;

        const now = Date.now();
        const currentWord = state.words[state.currentWordIndex];
        const typedWord = state.currentInput;
        const isWordCorrect = typedWord === currentWord;
        const typoCount = state.currentWordKeystrokes.filter((k) => !k.correct).length;

        const wordResult: WordResult = {
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

        // Check if test should end (words mode)
        if (state.testMode === 'words' && newIndex >= state.duration) {
          set({
            wordResults: newWordResults,
            currentWordIndex: newIndex,
          });
          get().finishTest();
          return;
        }

        // Check if we've run out of words
        if (newIndex >= state.words.length) {
          set({
            wordResults: newWordResults,
            currentWordIndex: newIndex,
          });
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
        const totalTime = (endTime - (state.startTime || endTime)) / 1000; // in seconds

        // Calculate results - count characters per-letter like Monkeytype
        let totalChars = 0;
        let correctChars = 0;

        state.wordResults.forEach((w, index) => {
          // Add word length
          totalChars += w.typed.length;

          // Add space (except for last word)
          if (index < state.wordResults.length - 1) {
            totalChars += 1; // space
            // Space counts as correct if the word was completed (moved to next word)
            correctChars += 1;
          }

          // Count correct characters per-letter
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

        // WPM calculation (standard: 5 chars = 1 word)
        // Net WPM uses correct chars, Raw WPM uses all typed chars
        const wpm = Math.round((correctChars / 5 / totalTime) * 60);
        const rawWpm = Math.round((totalChars / 5 / totalTime) * 60);
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

        // Consistency calculation (based on word typing times)
        const wordTimes = state.wordResults.map((w) => w.endTime - w.startTime);
        const avgTime = wordTimes.reduce((a, b) => a + b, 0) / wordTimes.length;
        const variance =
          wordTimes.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) /
          wordTimes.length;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, Math.round(100 - (stdDev / avgTime) * 100));

        // Identify problem words (>30% typo rate or >2x average time)
        const problemWords = state.wordResults
          .filter((w) => {
            const typoRate = w.keystrokes.length > 0
              ? w.typoCount / w.keystrokes.length
              : 0;
            const wordTime = w.endTime - w.startTime;
            return typoRate > 0.3 || wordTime > avgTime * 2;
          })
          .map((w) => w.expected);

        // Identify slow words
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
          problemWords: [...new Set(problemWords)],
          slowWords: [...new Set(slowWords)],
        };

        // Create test session
        const session: TestSession = {
          id: crypto.randomUUID(),
          timestamp: endTime,
          mode: state.testMode,
          handMode: state.handMode,
          duration: state.duration,
          words: state.wordResults,
          results,
        };

        // Update history (keep last 50 tests)
        const newHistory = [session, ...state.testHistory].slice(0, 50);

        set({
          status: 'finished',
          endTime,
          results,
          testHistory: newHistory,
        });

        // Sync to Supabase (non-blocking)
        syncTestSession(session).catch(console.error);

        // Update problem words database
        get().updateProblemWords(state.wordResults);
      },

      startPracticeMode: (customWords) => {
        const { problemWords } = get();
        const problemWordsList = problemWords.map((p) => p.word);
        const words =
          customWords.length > 0
            ? customWords
            : getProblemWords(problemWordsList, 0.7, 50);

        set({
          status: 'running',
          words,
          currentWordIndex: 0,
          currentInput: '',
          wordResults: [],
          startTime: Date.now(),
          endTime: null,
          timeRemaining: Infinity,
          currentWordStartTime: null,
          currentWordKeystrokes: [],
          lastKeystrokeTime: null,
          furthestWordIndex: 0,
          results: null,
          testMode: 'words',
          duration: words.length,
        });
      },

      updateProblemWords: (results) => {
        const { problemWords } = get();
        const problemMap = new Map(problemWords.map((p) => [p.word, p]));

        results.forEach((result) => {
          const existing = problemMap.get(result.expected);
          const typoRate =
            result.keystrokes.length > 0
              ? result.typoCount / result.keystrokes.length
              : 0;
          const wordTime = result.endTime - result.startTime;

          if (existing) {
            // Update existing problem word
            const newTotalAppearances = existing.totalAppearances + 1;
            const newTypoCount = existing.typoCount + (result.correct ? 0 : 1);
            const newTypoRate =
              (existing.typoRate * existing.totalAppearances + typoRate) /
              newTotalAppearances;
            const newAvgTime =
              (existing.avgTime * existing.totalAppearances + wordTime) /
              newTotalAppearances;

            // Determine improvement trend
            let trend: 'improving' | 'stable' | 'worsening' = 'stable';
            if (newTypoRate < existing.typoRate - 0.1) trend = 'improving';
            else if (newTypoRate > existing.typoRate + 0.1) trend = 'worsening';

            // Calculate severity score
            const severityScore = Math.min(
              100,
              Math.round(newTypoRate * 40 + (newAvgTime / 1000) * 30 + 30)
            );

            // Update tags
            const tags: string[] = [];
            if (newTypoRate > 0.3) tags.push('typo-prone');
            if (newAvgTime > 2000) tags.push('slow');

            problemMap.set(result.expected, {
              ...existing,
              totalAppearances: newTotalAppearances,
              typoCount: newTypoCount,
              typoRate: newTypoRate,
              avgTime: newAvgTime,
              slowCount:
                existing.slowCount + (wordTime > existing.avgTime * 2 ? 1 : 0),
              lastPracticed: Date.now(),
              improvementTrend: trend,
              severityScore,
              tags,
            });
          } else if (typoRate > 0.3 || wordTime > 2000) {
            // Add new problem word
            const severityScore = Math.min(
              100,
              Math.round(typoRate * 40 + (wordTime / 1000) * 30 + 30)
            );
            const tags: string[] = [];
            if (typoRate > 0.3) tags.push('typo-prone');
            if (wordTime > 2000) tags.push('slow');

            problemMap.set(result.expected, {
              word: result.expected,
              totalAppearances: 1,
              typoCount: result.correct ? 0 : 1,
              typoRate,
              avgTime: wordTime,
              slowCount: wordTime > 2000 ? 1 : 0,
              lastPracticed: Date.now(),
              improvementTrend: 'stable',
              severityScore,
              tags,
              hand: result.hand,
            });
          }
        });

        // Convert map back to array and sort by severity
        const updatedProblemWords = Array.from(problemMap.values()).sort(
          (a, b) => b.severityScore - a.severityScore
        );

        set({ problemWords: updatedProblemWords });

        // Sync problem words to Supabase (non-blocking)
        syncProblemWords(updatedProblemWords).catch(console.error);
      },
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
