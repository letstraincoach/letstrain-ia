-- ============================================================
-- Migration 004: workouts + workout_evaluations
-- ============================================================

-- Treinos gerados pela IA
CREATE TABLE public.workouts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data                     DATE NOT NULL,
  nivel                    TEXT NOT NULL CHECK (nivel IN ('adaptacao', 'iniciante', 'intermediario', 'avancado', 'pro')),
  local_treino             TEXT NOT NULL CHECK (local_treino IN ('condominio', 'academia')),
  duracao_estimada         INTEGER,  -- em minutos
  checkin_ultima_refeicao  TEXT,
  checkin_tempo_disponivel INTEGER,
  checkin_disposicao       INTEGER CHECK (checkin_disposicao BETWEEN 1 AND 10),
  exercicios               JSONB NOT NULL DEFAULT '{}',
  status                   TEXT NOT NULL DEFAULT 'gerado' CHECK (status IN ('gerado', 'executado', 'cancelado')),
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executado_em             TIMESTAMPTZ
);

-- Índice primário para histórico do usuário (busca mais comum)
CREATE INDEX idx_workouts_user_data ON public.workouts(user_id, data DESC);
-- Índice para buscar treinos por status
CREATE INDEX idx_workouts_user_status ON public.workouts(user_id, status);

-- Avaliações pós-treino
CREATE TABLE public.workout_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id      UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_rapido TEXT CHECK (feedback_rapido IN ('muito_facil', 'na_medida', 'muito_dificil', 'nao_gostei')),
  comentario      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT one_evaluation_per_workout UNIQUE (workout_id, user_id)
);

CREATE INDEX idx_workout_evaluations_user ON public.workout_evaluations(user_id);

-- -------------------------------------------------------
-- RLS: workouts
-- -------------------------------------------------------
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- RLS: workout_evaluations
-- -------------------------------------------------------
ALTER TABLE public.workout_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations"
  ON public.workout_evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations"
  ON public.workout_evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations"
  ON public.workout_evaluations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
