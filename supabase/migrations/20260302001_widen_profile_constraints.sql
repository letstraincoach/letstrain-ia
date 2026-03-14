-- ============================================================
-- Migration 008: widen check constraints on user_profiles
-- - tempo_sem_treinar: add 'treinando_regularmente'
-- - objetivo: allow comma-separated multi-value (drop strict enum)
-- - dias_por_semana: extend range to 2–7
-- ============================================================

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_tempo_sem_treinar_check,
  DROP CONSTRAINT IF EXISTS user_profiles_objetivo_check,
  DROP CONSTRAINT IF EXISTS user_profiles_dias_por_semana_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_tempo_sem_treinar_check
    CHECK (tempo_sem_treinar IN ('menos_6_meses', '6m_1ano', 'mais_1_ano', 'nunca_treinou', 'treinando_regularmente')),
  ADD CONSTRAINT user_profiles_dias_por_semana_check
    CHECK (dias_por_semana BETWEEN 2 AND 7);

-- objetivo agora aceita valores múltiplos separados por vírgula (ex: 'perda_peso,ganho_massa')
-- sem constraint adicional — validação ocorre na aplicação
