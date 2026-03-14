-- ============================================================
-- Migration: 45-achievement Album + fix workouts constraints
-- Adds 18 new achievements (total → 45) and expands the
-- workouts table to accept 15 levels + hotel local.
-- ============================================================

-- 1. Fix workouts.nivel constraint (5 old levels → 15 new levels)
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_nivel_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_nivel_check
    CHECK (nivel IN (
      'adaptacao',
      'iniciante_bronze', 'iniciante_prata', 'iniciante_ouro',
      'intermediario_bronze', 'intermediario_prata', 'intermediario_ouro',
      'avancado_bronze', 'avancado_prata', 'avancado_ouro',
      'atleta_bronze', 'atleta_prata', 'atleta_ouro',
      'atleta_pro', 'atleta_pro_max'
    ));

-- 2. Fix workouts.local_treino constraint (add 'hotel')
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_local_treino_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_local_treino_check
    CHECK (local_treino IN ('condominio', 'academia', 'hotel'));

-- 3. Insert 18 new achievements (ON CONFLICT = safe to re-run)
INSERT INTO public.achievements
  (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor, criterio_extra)
VALUES

  -- ── Treinos totais — milestones intermediários ──────────────────────────
  ('quinze_treinos',     '15 Treinos',          '15 treinos concluídos. A rotina está se formando!',          '📆', 'treinos_totais', 15,  NULL),
  ('persistente',        'Persistente',         '50 treinos. Você não para mais!',                             '💪', 'treinos_totais', 50,  NULL),
  ('seis_meses',         '6 Meses de Foco',     '90 treinos. Isso é dedicação de verdade.',                   '📈', 'treinos_totais', 90,  NULL),
  ('meio_caminho',       'Meio Caminho',        '150 treinos. A metade do caminho para os 300!',              '🔮', 'treinos_totais', 150, NULL),
  ('duzentos_treinos',   '200 Treinos',         '200 treinos. Compromisso que poucos têm.',                   '🌟', 'treinos_totais', 200, NULL),
  ('quinhentos_treinos', '500 Treinos',         '500 treinos. Lenda definitiva do Lets Train.',               '🏔️', 'treinos_totais', 500, NULL),

  -- ── Streak — sequências extras ────────────────────────────────────────
  ('tres_seguidos',      '3 em Sequência',      '3 dias seguidos. O hábito está nascendo!',                   '🔥', 'streak', 3,  NULL),
  ('duas_semanas',       '2 Semanas de Fogo',   '14 dias sem parar. Totalmente imparável!',                   '⚡', 'streak', 14, NULL),
  ('dois_meses',         '2 Meses Seguidos',    '60 dias seguidos. Disciplina de alto atleta.',               '💎', 'streak', 60, NULL),

  -- ── Avaliações — novas faixas ─────────────────────────────────────────
  ('primeira_nota',      'Primeira Nota',       'Primeira avaliação! Feedback é evolução.',                   '📝', 'avaliacoes', 1,   NULL),
  ('vinte_cinco_aval',   '25 Avaliações',       '25 avaliações. Parceiro de evolução!',                       '📊', 'avaliacoes', 25,  NULL),
  ('cem_aval',           '100 Avaliações',      '100 avaliações. Você é incrível!',                           '🔭', 'avaliacoes', 100, NULL),

  -- ── Horário — novos contextos ─────────────────────────────────────────
  ('fim_de_semana',      'Sem Descanso',        'Treinou no fim de semana. Sem desculpas!',                   '📅', 'horario', NULL, 'fim_semana'),
  ('almoco_ativo',       'Almoço Ativo',        'Aproveitou o horário do almoço para malhar!',                '🥗', 'horario', NULL, 'hora_almoco'),
  ('golden_time',        'Golden Hour',         'Treinou entre 17h e 19h. Timing perfeito!',                  '🌇', 'horario', NULL, 'golden_hour'),

  -- ── Diversidade — níveis de repertório ───────────────────────────────
  ('atleta_completo',    'Atleta Completo',     '15 exercícios diferentes. Repertório crescendo!',            '🏅', 'diversidade', 15, NULL),
  ('especialista',       'Especialista',        '25 exercícios diferentes. Repertório completo!',             '🎯', 'diversidade', 25, NULL),
  ('coreografista',      'Coreografista',       '50 exercícios diferentes. Você conhece tudo!',               '🎭', 'diversidade', 50, NULL)

ON CONFLICT (codigo) DO NOTHING;
