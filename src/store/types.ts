import {
  HandMode,
  TestMode,
  TestStatus,
  WordResult,
  TestResults,
  ProblemWord,
  Keystroke,
  TestSession,
} from '@/types';

export interface TypingStateData {
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
  wpmHistory: number[];
  isPractice: boolean;
}

export interface SettingsSlice {
  setTestMode: (mode: TestMode) => void;
  setHandMode: (mode: HandMode) => void;
  setDuration: (duration: number) => void;
}

export interface InputSlice {
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  handleSpace: () => void;
}

export interface TestSlice {
  startTest: () => void;
  resetTest: () => void;
  tick: () => void;
  finishTest: () => void;
}

export interface PracticeSlice {
  startPracticeMode: (words: string[]) => void;
  updateProblemWords: (results: WordResult[]) => void;
}

export interface DataSlice {
  resetAllData: () => void;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncSlice {
  syncStatus: SyncStatus;
  syncError: string | null;
  setSyncStatus: (status: SyncStatus, error?: string) => void;
}

export type TypingState = TypingStateData & SettingsSlice & InputSlice & TestSlice & PracticeSlice & DataSlice & SyncSlice;

type SetState = (partial: Partial<TypingState> | ((state: TypingState) => Partial<TypingState>)) => void;
type GetState = () => TypingState;

export type SettingsSliceCreator = (set: SetState, get: GetState) => SettingsSlice;
export type InputSliceCreator = (set: SetState, get: GetState) => InputSlice;
export type TestSliceCreator = (set: SetState, get: GetState) => TestSlice;
export type PracticeSliceCreator = (set: SetState, get: GetState) => PracticeSlice;
export type DataSliceCreator = (set: SetState, get: GetState) => DataSlice;
export type SyncSliceCreator = (set: SetState, get: GetState) => SyncSlice;
