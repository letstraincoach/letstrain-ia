-- ============================================================
-- Migration: Jejum Intermitente
-- Adds fasting tracking to user_profiles, jejum_sessions
-- history table, and 14 new fasting achievements (45 → 59)
-- ============================================================

-- 1. Add jejum_inicio to user_profiles
--    NULL  = not currently fasting
--    value = timestamp when current fast started
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS jejum_inicio timestamptz;

-- 2. Fasting sessions (completed fast history)
CREATE TABLE IF NOT EXISTS public.jejum_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  inicio       timestamptz NOT NULL,
  fim          timestamptz NOT NULL,
  duracao_horas numeric    GENERATED ALWAYS AS (
                              EXTRACT(EPOCH FROM (fim - inicio)) / 3600
                           ) STORED,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jejum_sessions_user
  ON public.jejum_sessions(user_id);

ALTER TABLE public.jejum_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own jejum sessions"
  ON public.jejum_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. Expand criterio_tipo check constraint to include fasting types
ALTER TABLE public.achievements
  DROP CONSTRAINT IF EXISTS achievements_criterio_tipo_check;

ALTER TABLE public.achievements
  ADD CONSTRAINT achievements_criterio_tipo_check
    CHECK (criterio_tipo IN (
      'treinos_totais', 'streak', 'level_up', 'horario', 'diversidade', 'avaliacoes',
      'jejum_duracao', 'jejum_total'
    ));

-- 4. Insert 14 fasting achievements (ON CONFLICT = safe to re-run)
INSERT INTO public.achievements
  (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor, criterio_extra)
VALUES

  -- ── Duração — conquistas por duração de um único jejum ───────────────────
  ('jejum_14h',  '14 Horas de Foco',
   '14h de jejum! Autofagia iniciando. Parabéns pela disciplina.',
   '🔬', 'jejum_duracao', 14,  NULL),

  ('jejum_16h',  'Queima Total',
   '16h! Você está no pico de queima de gordura. Nível outro!',
   '🔥', 'jejum_duracao', 16,  NULL),

  ('jejum_18h',  'Anti-Inflamatório',
   '18h de jejum. Marcadores inflamatórios em queda. Saúde em alta!',
   '💚', 'jejum_duracao', 18,  NULL),

  ('jejum_20h',  'Hormônio em Alta',
   '20h! GH até 5x acima do normal. Músculo protegido e crescendo.',
   '💪', 'jejum_duracao', 20,  NULL),

  ('jejum_24h',  'Renovação Celular',
   '24 horas de jejum! Autofagia máxima. Limpeza celular completa.',
   '🧬', 'jejum_duracao', 24,  NULL),

  ('jejum_36h',  'Cetose Profunda',
   '36h! Cérebro operando 100% em cetonas. Clareza mental épica.',
   '🧠', 'jejum_duracao', 36,  NULL),

  ('jejum_48h',  'Mestre do Jejum',
   '48 horas! Reset metabólico completo. Você está em outro nível.',
   '🏆', 'jejum_duracao', 48,  NULL),

  -- ── Total — conquistas pelo número de jejuns completados ─────────────────
  ('jejum_1',    'Primeira Jornada',
   'Primeiro jejum completo! O começo de uma nova relação com o corpo.',
   '🌱', 'jejum_total',   1,   NULL),

  ('jejum_3',    'Trio de Ouro',
   '3 jejuns concluídos. O hábito está tomando forma!',
   '✨', 'jejum_total',   3,   NULL),

  ('jejum_7',    'Semana de Clareza',
   '7 jejuns! Uma semana completa de disciplina e foco.',
   '⭐', 'jejum_total',   7,   NULL),

  ('jejum_15',   'Guardião do Jejum',
   '15 jejuns concluídos. Sua relação com o jejum está transformada!',
   '🛡️', 'jejum_total',   15,  NULL),

  ('jejum_30',   'Um Mês de Jejum',
   '30 jejuns! Um mês de consistência. Isso é raro e poderoso.',
   '💎', 'jejum_total',   30,  NULL),

  ('jejum_50',   'Mestre da Autofagia',
   '50 jejuns completos. Você dominou a arte da limpeza celular.',
   '🔮', 'jejum_total',   50,  NULL),

  ('jejum_100',  'Lenda do Jejum',
   '100 jejuns! Isso é histórico. Você redefiniu o que é possível.',
   '👑', 'jejum_total',   100, NULL)

ON CONFLICT (codigo) DO NOTHING;
