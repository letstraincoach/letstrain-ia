-- ============================================================
-- Migration: Condomínio profile fields
-- Saves condo name, CEP, and equipment photo URLs
-- on the user's profile when local_treino = 'condominio'
-- ============================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS condominio_nome  text,
  ADD COLUMN IF NOT EXISTS condominio_cep   text,
  ADD COLUMN IF NOT EXISTS condominio_fotos text[];
