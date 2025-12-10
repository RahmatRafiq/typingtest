import { WordResult } from '@/types';

export function calculateWpm(correctChars: number, timeInMinutes: number): number {
  if (timeInMinutes <= 0) return 0;
  return Math.round((correctChars / 5) / timeInMinutes);
}

export function calculateRawWpm(totalChars: number, timeInMinutes: number): number {
  if (timeInMinutes <= 0) return 0;
  return Math.round((totalChars / 5) / timeInMinutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function calculateConsistency(wpmSamples: number[]): number {
  if (wpmSamples.length <= 1) return 0;

  const avgRawWpm = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
  if (avgRawWpm <= 0) return 0;

  const variance = wpmSamples.reduce((sum, val) => sum + Math.pow(val - avgRawWpm, 2), 0) / wpmSamples.length;
  const sd = Math.sqrt(variance);

  return Math.max(0, Math.round(100 * (1 - sd / avgRawWpm)));
}

export function countCorrectChars(wordResults: WordResult[], currentWord?: string, currentInput?: string): number {
  let correctChars = 0;

  wordResults.forEach((w) => {
    if (w.correct) {
      correctChars += w.expected.length;
      correctChars++;
    } else {
      const expectedChars = w.expected.split('');
      const typedChars = w.typed.split('');
      expectedChars.forEach((char, charIndex) => {
        if (typedChars[charIndex] === char) correctChars++;
      });
    }
  });

  if (currentWord && currentInput) {
    const expectedChars = currentWord.split('');
    const typedChars = currentInput.split('');
    expectedChars.forEach((char, charIndex) => {
      if (typedChars[charIndex] === char) correctChars++;
    });
  }

  return correctChars;
}
