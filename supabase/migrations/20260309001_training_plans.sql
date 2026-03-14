-- ──────────────────────────────────────────────────────────────────────────────
-- Training Plans: planos semanais pré-gerados por IA (1 chamada por semana)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE training_plans (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users NOT NULL,
  nome_plano   text NOT NULL DEFAULT 'Plano Semanal',
  nivel        text NOT NULL,
  objetivo     text NOT NULL,
  local_treino text NOT NULL,
  equipamentos text[] NOT NULL DEFAULT '{}',
  status       text NOT NULL DEFAULT 'ativo'
                 CHECK (status IN ('ativo', 'concluido', 'expirado')),
  total_dias   integer NOT NULL DEFAULT 5 CHECK (total_dias BETWEEN 3 AND 7),
  criado_em    timestamptz DEFAULT now(),
  valido_ate   date NOT NULL   -- expira após N dias (total_dias + 3 de folga)
);

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_training_plans" ON training_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX training_plans_user_ativo
  ON training_plans(user_id, status, valido_ate DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- Plan Workouts: treinos individuais do plano (pré-gerados, ajustados na hora)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE plan_workouts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id      uuid REFERENCES training_plans ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES auth.users NOT NULL,
  dia_numero   integer NOT NULL CHECK (dia_numero BETWEEN 1 AND 7),
  workout_json jsonb NOT NULL,          -- GeneratedWorkout completo
  executado    boolean DEFAULT false,
  workout_id   uuid,                    -- ref para workouts.id quando executado (soft ref)
  criado_em    timestamptz DEFAULT now(),
  UNIQUE(plan_id, dia_numero)
);

ALTER TABLE plan_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_plan_workouts" ON plan_workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX plan_workouts_next
  ON plan_workouts(plan_id, dia_numero)
  WHERE executado = false;

CREATE INDEX plan_workouts_user
  ON plan_workouts(user_id, executado);
