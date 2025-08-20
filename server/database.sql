-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create entries table
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  raw_text TEXT NOT NULL,
  breakfast BOOLEAN DEFAULT FALSE,
  lunch BOOLEAN DEFAULT FALSE,
  dinner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create ai_evaluations table
CREATE TABLE ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  good TEXT,
  next TEXT,
  went_out_level INTEGER DEFAULT 0 CHECK (went_out_level >= 0 AND went_out_level <= 3),
  tags TEXT[] DEFAULT '{}',
  places TEXT[] DEFAULT '{}',
  model TEXT DEFAULT 'gemini-1.5-flash',
  prompt_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_entries_user_date ON entries(user_id, date);
CREATE INDEX idx_ai_evaluations_entry_id ON ai_evaluations(entry_id);

-- Insert default user for MVP
INSERT INTO users (id, display_name) VALUES ('00000000-0000-0000-0000-000000000000', 'Default User');

-- Enable Row Level Security (optional for MVP)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;
