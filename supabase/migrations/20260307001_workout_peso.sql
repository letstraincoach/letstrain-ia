-- ============================================================
-- Migration: peso corporal pós-treino
-- Permite registrar o peso do aluno no momento de cada treino,
-- criando um histórico de peso ao longo do tempo.
-- ============================================================

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS peso_treino numeric(5,1);  -- peso corporal no dia (kg)
