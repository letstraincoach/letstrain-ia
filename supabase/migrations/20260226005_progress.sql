-- ============================================================
-- Migration 005: user_progress + achievements + user_achievements
-- ============================================================

-- Progresso acumulado do usuário (1:1 com auth.users)
CREATE TABLE public.user_progress (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  treinos_totais       INTEGER NOT NULL DEFAULT 0,
  treinos_nivel_atual  INTEGER NOT NULL DEFAULT 0,
  streak_atual         INTEGER NOT NULL DEFAULT 0,
  streak_maximo        INTEGER NOT NULL DEFAULT 0,
  ultimo_treino        DATE,
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- Trigger: criar user_progress ao criar usuário
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_progress
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_progress();

-- -------------------------------------------------------
-- Trigger: atualizar progresso ao concluir treino
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_workout_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_ultimo_treino   DATE;
  v_streak_atual    INTEGER;
  v_streak_maximo   INTEGER;
BEGIN
  -- Só processa quando status muda para 'executado'
  IF NEW.status <> 'executado' OR OLD.status = 'executado' THEN
    RETURN NEW;
  END IF;

  -- Busca progresso atual
  SELECT ultimo_treino, streak_atual, streak_maximo
  INTO v_ultimo_treino, v_streak_atual, v_streak_maximo
  FROM public.user_progress
  WHERE id = NEW.user_id;

  -- Calcula streak
  IF v_ultimo_treino IS NULL OR v_ultimo_treino < NEW.data - INTERVAL '1 day' THEN
    -- Quebrou o streak ou primeiro treino
    v_streak_atual := 1;
  ELSIF v_ultimo_treino = NEW.data - INTERVAL '1 day' THEN
    -- Consecutivo
    v_streak_atual := v_streak_atual + 1;
  END IF;
  -- Mesmo dia: não altera streak

  v_streak_maximo := GREATEST(v_streak_atual, v_streak_maximo);

  INSERT INTO public.user_progress (
    id, treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo, ultimo_treino, atualizado_em
  )
  VALUES (
    NEW.user_id, 1, 1, v_streak_atual, v_streak_maximo, NEW.data, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    treinos_totais      = user_progress.treinos_totais + 1,
    treinos_nivel_atual = user_progress.treinos_nivel_atual + 1,
    streak_atual        = v_streak_atual,
    streak_maximo       = v_streak_maximo,
    ultimo_treino       = NEW.data,
    atualizado_em       = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workout_completed
  AFTER UPDATE OF status ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_workout_completed();

-- Catálogo de conquistas/badges
CREATE TABLE public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          TEXT UNIQUE NOT NULL,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  icone_emoji     TEXT,
  criterio_tipo   TEXT NOT NULL CHECK (criterio_tipo IN (
    'treinos_totais', 'streak', 'level_up', 'horario', 'diversidade', 'avaliacoes'
  )),
  criterio_valor  INTEGER,
  criterio_extra  TEXT  -- dados complementares (ex: nível para level_up)
);

-- Conquistas desbloqueadas pelo usuário
CREATE TABLE public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  desbloqueado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT one_achievement_per_user UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- -------------------------------------------------------
-- RLS: user_progress
-- -------------------------------------------------------
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = id);

-- -------------------------------------------------------
-- RLS: achievements — leitura pública para autenticados
-- -------------------------------------------------------
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- -------------------------------------------------------
-- RLS: user_achievements
-- -------------------------------------------------------
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);
