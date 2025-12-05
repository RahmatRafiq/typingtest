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
  testMode: TestMode;
  handMode: HandMode;
  duration: number;

  status: TestStatus;
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  wordResults: WordResult[];

  startTime: number | null;
  endTime: number | null;
  timeRemaining: number;

  currentWordStartTime: number | null;
  currentWordKeystrokes: Keystroke[];
  lastKeystrokeTime: number | null;

  furthestWordIndex: number;

  results: TestResults | null;

  problemWords: ProblemWord[];

  testHistory: TestSession[];

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

      handleKeyPress: (key) => {
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

        if (state.currentInput.length === 0) {
          if (state.currentWordIndex > 0 && state.currentWordIndex > state.furthestWordIndex - 1) {
            const prevIndex = state.currentWordIndex - 1;
            const prevWordResult = state.wordResults[prevIndex];

            if (prevWordResult && !prevWordResult.correct) {
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

        const newInput = state.currentInput.slice(0, -1);
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

        if (state.testMode === 'words' && newIndex >= state.duration) {
          set({
            wordResults: newWordResults,
            currentWordIndex: newIndex,
          });
          get().finishTest();
          return;
        }

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
        const variance =
          wordTimes.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) /
          wordTimes.length;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, Math.round(100 - (stdDev / avgTime) * 100));

        const problemWords = state.wordResults
          .filter((w) => {
            const typoRate = w.keystrokes.length > 0
              ? w.typoCount / w.keystrokes.length
              : 0;
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
          problemWords: [...new Set(problemWords)],
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
            const newTotalAppearances = existing.totalAppearances + 1;
            const newTypoCount = existing.typoCount + (result.correct ? 0 : 1);
            const newTypoRate =
              (existing.typoRate * existing.totalAppearances + typoRate) /
              newTotalAppearances;
            const newAvgTime =
              (existing.avgTime * existing.totalAppearances + wordTime) /
              newTotalAppearances;

            let trend: 'improving' | 'stable' | 'worsening' = 'stable';
            if (newTypoRate < existing.typoRate - 0.1) trend = 'improving';
            else if (newTypoRate > existing.typoRate + 0.1) trend = 'worsening';

            const severityScore = Math.min(
              100,
              Math.round(newTypoRate * 40 + (newAvgTime / 1000) * 30 + 30)
            );

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

        const updatedProblemWords = Array.from(problemMap.values()).sort(
          (a, b) => b.severityScore - a.severityScore
        );

        set({ problemWords: updatedProblemWords });

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
