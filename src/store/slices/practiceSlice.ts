import { getProblemWords } from '@/lib/words';
import { syncProblemWords } from '@/lib/supabaseSync';
import { PracticeSliceCreator } from '../types';

export const createPracticeSlice: PracticeSliceCreator = (set, get) => ({
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

        if (newTypoRate < 0.1 && newTotalAppearances >= 5 && trend === 'improving') {
          problemMap.delete(result.expected);
        } else {
          problemMap.set(result.expected, {
            ...existing,
            totalAppearances: newTotalAppearances,
            typoCount: newTypoCount,
            typoRate: newTypoRate,
            avgTime: newAvgTime,
            slowCount: existing.slowCount + (wordTime > existing.avgTime * 2 ? 1 : 0),
            lastPracticed: Date.now(),
            improvementTrend: trend,
            severityScore,
            tags,
          });
        }
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
});
