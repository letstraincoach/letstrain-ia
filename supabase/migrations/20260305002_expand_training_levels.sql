-- ============================================================
-- Migration: Expand training levels from 5 to 15
-- Old: adaptacao, iniciante, intermediario, avancado, pro
-- New: 15 levels across Adaptação, Iniciante, Intermediário,
--      Avançado and Atleta tiers (Bronze/Prata/Ouro)
-- ============================================================

-- 1. Migrate existing user data to new level names BEFORE changing constraint
UPDATE public.user_profiles SET nivel_atual = 'iniciante_bronze'    WHERE nivel_atual = 'iniciante';
UPDATE public.user_profiles SET nivel_atual = 'intermediario_bronze' WHERE nivel_atual = 'intermediario';
UPDATE public.user_profiles SET nivel_atual = 'avancado_bronze'      WHERE nivel_atual = 'avancado';
UPDATE public.user_profiles SET nivel_atual = 'atleta_pro_max'       WHERE nivel_atual = 'pro';
-- 'adaptacao' stays as-is

-- 2. Drop old constraint and add the new 15-level constraint
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_nivel_atual_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_nivel_atual_check
    CHECK (nivel_atual IN (
      'adaptacao',
      'iniciante_bronze', 'iniciante_prata', 'iniciante_ouro',
      'intermediario_bronze', 'intermediario_prata', 'intermediario_ouro',
      'avancado_bronze', 'avancado_prata', 'avancado_ouro',
      'atleta_bronze', 'atleta_prata', 'atleta_ouro',
      'atleta_pro', 'atleta_pro_max'
    ));

-- 3. Remove old level_up achievements
DELETE FROM public.achievements WHERE criterio_tipo = 'level_up';

-- 4. Insert new level_up achievements (14 transitions)
INSERT INTO public.achievements (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor, criterio_extra) VALUES
  ('nivel_iniciante_bronze',    'Iniciante Bronze',    'Superou a adaptação e entrou no nível Iniciante Bronze!',         '🥉', 'level_up', NULL, 'iniciante_bronze'),
  ('nivel_iniciante_prata',     'Iniciante Prata',     'Evoluiu para Iniciante Prata. A consistência está mostrando!',    '🥈', 'level_up', NULL, 'iniciante_prata'),
  ('nivel_iniciante_ouro',      'Iniciante Ouro',      'Iniciante Ouro conquistado! A base está sólida.',                 '🥇', 'level_up', NULL, 'iniciante_ouro'),
  ('nivel_intermediario_bronze','Intermediário Bronze', 'Chegou ao Intermediário Bronze. Os treinos ficam sérios agora.',  '🔵', 'level_up', NULL, 'intermediario_bronze'),
  ('nivel_intermediario_prata', 'Intermediário Prata',  'Intermediário Prata! Você está se transformando.',                '🔷', 'level_up', NULL, 'intermediario_prata'),
  ('nivel_intermediario_ouro',  'Intermediário Ouro',   'Intermediário Ouro. Impressionante evolução!',                   '⚡', 'level_up', NULL, 'intermediario_ouro'),
  ('nivel_avancado_bronze',     'Avançado Bronze',     'Avançado Bronze — poucos chegam até aqui.',                       '💜', 'level_up', NULL, 'avancado_bronze'),
  ('nivel_avancado_prata',      'Avançado Prata',      'Avançado Prata. Você é uma referência de disciplina.',            '💎', 'level_up', NULL, 'avancado_prata'),
  ('nivel_avancado_ouro',       'Avançado Ouro',       'Avançado Ouro — o topo do nível Avançado!',                      '🔮', 'level_up', NULL, 'avancado_ouro'),
  ('nivel_atleta_bronze',       'Atleta Bronze',       'Você é um Atleta Bronze. Elite começa aqui.',                    '🏅', 'level_up', NULL, 'atleta_bronze'),
  ('nivel_atleta_prata',        'Atleta Prata',        'Atleta Prata conquistado. Performance de alto nível.',            '🏆', 'level_up', NULL, 'atleta_prata'),
  ('nivel_atleta_ouro',         'Atleta Ouro',         'Atleta Ouro — você é extraordinário.',                           '🌟', 'level_up', NULL, 'atleta_ouro'),
  ('nivel_atleta_pro',          'Atleta PRÓ',          'Atleta PRÓ! Um dos melhores do Lets Train.',                     '👑', 'level_up', NULL, 'atleta_pro'),
  ('nivel_atleta_pro_max',      'Atleta PRÓ MAX',      'PRÓ MAX — o nível máximo. Lendário.',                            '🦅', 'level_up', NULL, 'atleta_pro_max')
ON CONFLICT (codigo) DO NOTHING;
