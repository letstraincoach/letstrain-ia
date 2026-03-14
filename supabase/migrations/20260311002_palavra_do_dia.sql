-- ============================================================
-- Migration 20260311002: palavras_do_dia
-- Palavra do Dia — devocional diário com versículo bíblico
-- ============================================================

CREATE TABLE IF NOT EXISTS public.palavras_do_dia (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data                  DATE NOT NULL,
  versiculo_referencia  TEXT NOT NULL,
  versiculo_texto       TEXT NOT NULL,
  interpretacao         TEXT NOT NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT palavras_do_dia_user_data_unique UNIQUE (user_id, data)
);

CREATE INDEX idx_palavras_do_dia_user ON public.palavras_do_dia(user_id, data DESC);

-- RLS
ALTER TABLE public.palavras_do_dia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own palavras"
  ON public.palavras_do_dia FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert palavras"
  ON public.palavras_do_dia FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update palavras"
  ON public.palavras_do_dia FOR UPDATE
  USING (true)
  WITH CHECK (true);
