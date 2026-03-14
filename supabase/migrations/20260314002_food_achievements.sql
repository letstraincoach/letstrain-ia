-- ============================================================
-- Migration: Food / Nutrition Achievements (10 medals)
-- criterio_tipo: nutricao_dias, nutricao_proteina, nutricao_completa,
--                nutricao_pos_treino, nutricao_cafe, nutricao_streak, nutricao_combo
-- ============================================================

INSERT INTO public.achievements
  (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor, criterio_extra)
VALUES
  -- 1. Primeiro registro
  ('primeiro_controle',
   'Primeiro Controle',
   'Primeiro registro alimentar! O autoconhecimento começa aqui.',
   '🥗', 'nutricao_dias', 1, NULL),

  -- 2. 5 dias registrando
  ('nutricao_5dias',
   '5 Dias no Controle',
   '5 dias registrando a alimentação. O hábito está nascendo!',
   '📋', 'nutricao_dias', 5, NULL),

  -- 3. 7 dias registrando
  ('nutricao_semana',
   'Semana Nutricional',
   '7 dias de registro alimentar. Uma semana de autoconhecimento!',
   '📅', 'nutricao_dias', 7, NULL),

  -- 4. 30 dias registrando
  ('nutricao_30dias',
   'Mês de Controle',
   '30 dias registrando alimentação. Disciplina real!',
   '🗓️', 'nutricao_dias', 30, NULL),

  -- 5. 3 dias com proteína >= 100g
  ('proteina_3dias',
   'Proteína em Dia',
   '3 dias batendo 100g de proteína. Músculo em construção!',
   '💪', 'nutricao_proteina', 3, NULL),

  -- 6. 5 combos treino + registro no mesmo dia
  ('combo_perfeito',
   'Combo Perfeito',
   'Treino + registro alimentar no mesmo dia. 5 vezes seguidas!',
   '⚡', 'nutricao_combo', 5, NULL),

  -- 7. 3 dias com 4+ tipos de refeição
  ('diario_completo',
   'Diário Completo',
   '4 refeições registradas no mesmo dia. Controle total!',
   '🍽️', 'nutricao_completa', 3, NULL),

  -- 8. 5 registros pós-treino
  ('pos_treino_5x',
   'Recuperação Inteligente',
   'Refeição pós-treino registrada 5 vezes. Recuperação em dia!',
   '🔋', 'nutricao_pos_treino', 5, NULL),

  -- 9. 10 cafés da manhã registrados
  ('cafe_manha_10x',
   'Café Campeão',
   'Café da manhã registrado 10 vezes. Começando o dia certo!',
   '☕', 'nutricao_cafe', 10, NULL),

  -- 10. 14 dias seguidos com registro
  ('nutricao_streak_14',
   '14 Dias Seguidos',
   '14 dias seguidos registrando alimentação. Imparável!',
   '🔥', 'nutricao_streak', 14, NULL)

ON CONFLICT (codigo) DO NOTHING;
