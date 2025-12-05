import {
  HandMode,
  TestMode,
  TestStatus,
  WordResult,
  TestResults,
  ProblemWord,
  Keystroke,
} from '@/types';

export interface TypingState {
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

  testHistory: import('@/types').TestSession[];

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

export type StateCreator = (
  set: (partial: Partial<TypingState> | ((state: TypingState) => Partial<TypingState>)) => void,
  get: () => TypingState
) => Partial<TypingState>;
