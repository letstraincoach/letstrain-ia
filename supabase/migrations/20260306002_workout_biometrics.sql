-- ============================================================
-- Migration: Biometrics from smartwatch / fitness tracker
-- Adds optional post-workout biometric columns to workouts
-- ============================================================

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS fc_media       integer,   -- avg heart rate (bpm)
  ADD COLUMN IF NOT EXISTS fc_maxima      integer,   -- max heart rate (bpm)
  ADD COLUMN IF NOT EXISTS calorias_reais integer,   -- calories burned (kcal)
  ADD COLUMN IF NOT EXISTS origem_bio     text        -- 'manual' | 'strava' | 'garmin' | 'polar'
    CHECK (origem_bio IN ('manual', 'strava', 'garmin', 'polar') OR origem_bio IS NULL);
