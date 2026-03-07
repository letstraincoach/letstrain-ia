-- Migration: telefone opcional no perfil do usuário
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS telefone text;
