import { supabase, getAnonymousUserId } from './supabase';
import { TestSession, ProblemWord, WordResult } from '@/types';

export async function syncTestSession(session: TestSession): Promise<boolean> {
  if (!supabase) return true;

  try {
    const userId = getAnonymousUserId();
    if (!userId) return true;

    const { error } = await supabase.from('test_sessions').insert({
      id: session.id,
      user_id: userId,
      mode: session.mode,
      hand_mode: session.handMode,
      duration: session.duration,
      wpm: session.results.wpm,
      raw_wpm: session.results.rawWpm,
      accuracy: session.results.accuracy,
      consistency: session.results.consistency,
      total_chars: session.results.totalChars,
      correct_chars: session.results.correctChars,
      total_words: session.results.totalWords,
      correct_words: session.results.correctWords,
      words_data: session.words,
      is_practice: session.isPractice || false,
    });

    if (error) {
      console.error('syncTestSession error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('syncTestSession exception:', err);
    return false;
  }
}

export async function syncProblemWords(problemWords: ProblemWord[]): Promise<boolean> {
  if (!supabase) return true;

  try {
    const userId = getAnonymousUserId();
    if (!userId) return true;

    let hasError = false;
    for (const word of problemWords) {
      const { error } = await supabase.from('problem_words').upsert(
        {
          user_id: userId,
          word: word.word,
          total_appearances: word.totalAppearances,
          typo_count: word.typoCount,
          typo_rate: word.typoRate,
          avg_time: word.avgTime,
          slow_count: word.slowCount,
          last_practiced: word.lastPracticed ? new Date(word.lastPracticed).toISOString() : null,
          improvement_trend: word.improvementTrend,
          severity_score: word.severityScore,
          tags: word.tags,
          hand: word.hand,
        },
        {
          onConflict: 'user_id,word',
        }
      );

      if (error) {
        console.error('syncProblemWords error:', error.message);
        hasError = true;
      }
    }

    return !hasError;
  } catch (err) {
    console.error('syncProblemWords exception:', err);
    return false;
  }
}

export async function loadTestHistory(): Promise<TestSession[]> {
  if (!supabase) return []; // Supabase not configured

  try {
    const userId = getAnonymousUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading test history:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      timestamp: new Date(row.created_at).getTime(),
      mode: row.mode,
      handMode: row.hand_mode,
      duration: row.duration,
      words: row.words_data as WordResult[],
      results: {
        wpm: row.wpm,
        rawWpm: row.raw_wpm,
        accuracy: row.accuracy,
        consistency: row.consistency,
        totalChars: row.total_chars,
        correctChars: row.correct_chars,
        incorrectChars: row.total_chars - row.correct_chars,
        totalWords: row.total_words,
        correctWords: row.correct_words,
        problemWords: [],
        slowWords: [],
      },
      isPractice: !!row.is_practice,
    }));
  } catch (err) {
    console.error('Error loading test history:', err);
    return [];
  }
}

export async function loadProblemWords(): Promise<ProblemWord[]> {
  if (!supabase) return []; // Supabase not configured

  try {
    const userId = getAnonymousUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('problem_words')
      .select('*')
      .eq('user_id', userId)
      .order('severity_score', { ascending: false });

    if (error) {
      console.error('Error loading problem words:', error);
      return [];
    }

    return (data || []).map((row) => ({
      word: row.word,
      totalAppearances: row.total_appearances,
      typoCount: row.typo_count,
      typoRate: row.typo_rate,
      avgTime: row.avg_time,
      slowCount: row.slow_count,
      lastPracticed: row.last_practiced ? new Date(row.last_practiced).getTime() : undefined,
      improvementTrend: row.improvement_trend as 'improving' | 'stable' | 'worsening',
      severityScore: row.severity_score,
      tags: row.tags || [],
      hand: row.hand as 'left' | 'right' | 'mixed',
    }));
  } catch (err) {
    console.error('Error loading problem words:', err);
    return [];
  }
}

export async function getUserStats(): Promise<{
  totalTests: number;
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
} | null> {
  if (!supabase) return null; // Supabase not configured

  try {
    const userId = getAnonymousUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error loading user stats:', error);
      return null;
    }

    return {
      totalTests: data.total_tests,
      avgWpm: Math.round(data.avg_wpm),
      avgAccuracy: Math.round(data.avg_accuracy),
      bestWpm: data.best_wpm,
    };
  } catch (err) {
    console.error('Error loading user stats:', err);
    return null;
  }
}

export async function deleteAllUserData(): Promise<boolean> {
  if (!supabase) return false; // Supabase not configured

  try {
    const userId = getAnonymousUserId();
    if (!userId) return false;

    // Delete test sessions
    const { error: sessionsError } = await supabase
      .from('test_sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionsError) {
      console.error('Error deleting test sessions:', sessionsError);
    }

    // Delete problem words
    const { error: wordsError } = await supabase
      .from('problem_words')
      .delete()
      .eq('user_id', userId);

    if (wordsError) {
      console.error('Error deleting problem words:', wordsError);
    }

    return !sessionsError && !wordsError;
  } catch (err) {
    console.error('Error deleting user data:', err);
    return false;
  }
}
