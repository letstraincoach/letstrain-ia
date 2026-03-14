-- Add sexo column to user_profiles for metabolic calculations
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('masculino', 'feminino'));
