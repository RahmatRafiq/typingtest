export const TYPING_THRESHOLDS = {
  TYPO_RATE: 0.3,
  SLOW_WORD_TIME: 2500,
  IMPROVEMENT_THRESHOLD: 0.1,
  MASTERY_TYPO_RATE: 0.15,
  MASTERY_MIN_APPEARANCES: 3,
  MAX_WORD_LENGTH: 50,
  MAX_CUSTOM_WORDS: 500,
} as const;

export type HandMode = 'both' | 'left' | 'right' | 'alternating';
export type TestStatus = 'idle' | 'running' | 'finished';
export type TestMode = 'time' | 'words';
