-- ============================================================
-- Migration 003: exercises
-- ============================================================

-- Banco de exercícios curado pela Lets Train
CREATE TABLE public.exercises (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                     TEXT NOT NULL,
  grupo_muscular           TEXT[] NOT NULL DEFAULT '{}',
  equipamentos_necessarios UUID[] DEFAULT '{}',  -- refs equipment_catalog.id
  nivel_minimo             TEXT NOT NULL DEFAULT 'adaptacao'
                           CHECK (nivel_minimo IN ('adaptacao', 'iniciante', 'intermediario', 'avancado', 'pro')),
  youtube_url              TEXT,
  imagem_url               TEXT,
  instrucoes               TEXT,
  contraindicacoes         TEXT[] DEFAULT '{}',  -- lesões que contraindicam
  ativo                    BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_exercises_nivel ON public.exercises(nivel_minimo);
CREATE INDEX idx_exercises_grupo ON public.exercises USING gin(grupo_muscular);
CREATE INDEX idx_exercises_ativo ON public.exercises(ativo);

-- -------------------------------------------------------
-- RLS: exercises — leitura para usuários autenticados
-- -------------------------------------------------------
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (ativo = true);
