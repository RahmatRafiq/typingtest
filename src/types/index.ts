export type HandMode = 'both' | 'left' | 'right' | 'alternating';
export type TestMode = 'time' | 'words';
export type TestStatus = 'idle' | 'running' | 'finished';

export interface Keystroke {
  key: string;
  timestamp: number;
  correct: boolean;
  delay: number; // ms since previous keystroke
}

export interface WordResult {
  expected: string;
  typed: string;
  correct: boolean;
  startTime: number;
  endTime: number;
  keystrokes: Keystroke[];
  typoCount: number;
  hand: 'left' | 'right' | 'mixed';
}

export interface TestSession {
  id: string;
  userId?: string;
  timestamp: number;
  mode: TestMode;
  handMode: HandMode;
  duration: number; // in seconds for time mode, or word count
  words: WordResult[];
  results: TestResults;
}

export interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  totalWords: number;
  correctWords: number;
  problemWords: string[];
  slowWords: string[];
}

export interface ProblemWord {
  word: string;
  totalAppearances: number;
  typoCount: number;
  typoRate: number;
  avgTime: number;
  slowCount: number;
  lastPracticed?: number;
  improvementTrend: 'improving' | 'stable' | 'worsening';
  severityScore: number;
  tags: string[];
  hand: 'left' | 'right' | 'mixed';
}

export interface UserStats {
  totalTests: number;
  totalTime: number;
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  problemWords: ProblemWord[];
  recentTests: TestSession[];
}

// Database types for Supabase
export interface DbTestSession {
  id: string;
  user_id?: string;
  created_at: string;
  mode: TestMode;
  hand_mode: HandMode;
  duration: number;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  total_chars: number;
  correct_chars: number;
  total_words: number;
  correct_words: number;
  words_data: WordResult[];
}

export interface DbProblemWord {
  id: string;
  user_id?: string;
  word: string;
  total_appearances: number;
  typo_count: number;
  typo_rate: number;
  avg_time: number;
  slow_count: number;
  last_practiced?: string;
  improvement_trend: string;
  severity_score: number;
  tags: string[];
  hand: string;
  created_at: string;
  updated_at: string;
}
