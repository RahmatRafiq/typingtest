-- TypeMaster Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: test_sessions
-- Stores each typing test session with results
CREATE TABLE IF NOT EXISTS test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Anonymous user ID from localStorage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mode TEXT NOT NULL CHECK (mode IN ('time', 'words')),
    hand_mode TEXT NOT NULL CHECK (hand_mode IN ('both', 'left', 'right', 'alternating')),
    duration INTEGER NOT NULL, -- seconds for time mode, word count for words mode
    wpm INTEGER NOT NULL,
    raw_wpm INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    consistency INTEGER NOT NULL,
    total_chars INTEGER NOT NULL,
    correct_chars INTEGER NOT NULL,
    total_words INTEGER NOT NULL,
    correct_words INTEGER NOT NULL,
    words_data JSONB NOT NULL DEFAULT '[]'::jsonb -- Array of WordResult objects
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_created_at ON test_sessions(created_at DESC);

-- Table: problem_words
-- Tracks problematic words for each user
CREATE TABLE IF NOT EXISTS problem_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    word TEXT NOT NULL,
    total_appearances INTEGER DEFAULT 1,
    typo_count INTEGER DEFAULT 0,
    typo_rate DECIMAL(5, 4) DEFAULT 0,
    avg_time DECIMAL(10, 2) DEFAULT 0, -- in milliseconds
    slow_count INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE,
    improvement_trend TEXT DEFAULT 'stable' CHECK (improvement_trend IN ('improving', 'stable', 'worsening')),
    severity_score INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    hand TEXT DEFAULT 'mixed' CHECK (hand IN ('left', 'right', 'mixed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique word per user
    UNIQUE(user_id, word)
);

-- Create indexes for problem_words
CREATE INDEX IF NOT EXISTS idx_problem_words_user_id ON problem_words(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_words_severity ON problem_words(severity_score DESC);

-- Table: user_stats
-- Aggregate statistics per user (optional - can be computed from test_sessions)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    total_tests INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    avg_wpm DECIMAL(6, 2) DEFAULT 0,
    avg_accuracy DECIMAL(5, 2) DEFAULT 0,
    best_wpm INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update user_stats after each test
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, total_tests, avg_wpm, avg_accuracy, best_wpm)
    VALUES (
        NEW.user_id,
        1,
        NEW.wpm,
        NEW.accuracy,
        NEW.wpm
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_tests = user_stats.total_tests + 1,
        avg_wpm = (user_stats.avg_wpm * user_stats.total_tests + NEW.wpm) / (user_stats.total_tests + 1),
        avg_accuracy = (user_stats.avg_accuracy * user_stats.total_tests + NEW.accuracy) / (user_stats.total_tests + 1),
        best_wpm = GREATEST(user_stats.best_wpm, NEW.wpm),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update user_stats
DROP TRIGGER IF EXISTS trigger_update_user_stats ON test_sessions;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON test_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update problem_words timestamp
CREATE OR REPLACE FUNCTION update_problem_words_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_problem_words_timestamp ON problem_words;
CREATE TRIGGER trigger_update_problem_words_timestamp
    BEFORE UPDATE ON problem_words
    FOR EACH ROW
    EXECUTE FUNCTION update_problem_words_timestamp();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/write their own data based on user_id
-- Since we're using anonymous user IDs stored in localStorage,
-- we'll allow all operations but you can restrict this further if needed

-- For test_sessions
CREATE POLICY "Allow all operations on test_sessions" ON test_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- For problem_words
CREATE POLICY "Allow all operations on problem_words" ON problem_words
    FOR ALL USING (true) WITH CHECK (true);

-- For user_stats
CREATE POLICY "Allow all operations on user_stats" ON user_stats
    FOR ALL USING (true) WITH CHECK (true);

-- Sample queries for analytics:

-- Get user's recent tests
-- SELECT * FROM test_sessions
-- WHERE user_id = 'your-user-id'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Get user's problem words sorted by severity
-- SELECT * FROM problem_words
-- WHERE user_id = 'your-user-id'
-- ORDER BY severity_score DESC;

-- Get user's overall stats
-- SELECT * FROM user_stats WHERE user_id = 'your-user-id';

-- Get WPM trend over time
-- SELECT DATE(created_at) as date, AVG(wpm) as avg_wpm
-- FROM test_sessions
-- WHERE user_id = 'your-user-id'
-- GROUP BY DATE(created_at)
-- ORDER BY date;
