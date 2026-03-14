-- AI insight para evolução de peso
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS peso_insight      text,
  ADD COLUMN IF NOT EXISTS peso_insight_at   timestamptz;
