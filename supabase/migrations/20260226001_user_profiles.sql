-- ============================================================
-- Migration 001: user_profiles
-- ============================================================

-- Tabela principal de perfis de usuário
CREATE TABLE public.user_profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                   TEXT,
  peso                   DECIMAL(5,2),
  idade                  INTEGER,
  altura                 DECIMAL(5,2),
  tempo_sem_treinar      TEXT CHECK (tempo_sem_treinar IN ('menos_6_meses', '6m_1ano', 'mais_1_ano', 'nunca_treinou')),
  doenca_cardiaca        BOOLEAN NOT NULL DEFAULT false,
  lesao_cronica          BOOLEAN NOT NULL DEFAULT false,
  lesao_descricao        TEXT,
  medicamento_controlado BOOLEAN NOT NULL DEFAULT false,
  objetivo               TEXT CHECK (objetivo IN ('perda_peso', 'ganho_massa', 'qualidade_vida')),
  dias_por_semana        INTEGER CHECK (dias_por_semana BETWEEN 2 AND 6),
  preferencia_treino     TEXT CHECK (preferencia_treino IN ('isolados', 'grupos_musculares', 'superior_inferior')),
  nivel_atual            TEXT NOT NULL DEFAULT 'adaptacao' CHECK (nivel_atual IN ('adaptacao', 'iniciante', 'intermediario', 'avancado', 'pro')),
  local_treino           TEXT CHECK (local_treino IN ('condominio', 'academia')),
  onboarding_completo    BOOLEAN NOT NULL DEFAULT false,
  onboarding_etapa       TEXT NOT NULL DEFAULT 'quiz',
  criado_em              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscas por nível (relatórios futuros)
CREATE INDEX idx_user_profiles_nivel ON public.user_profiles(nivel_atual);

-- -------------------------------------------------------
-- Trigger: atualizar atualizado_em automaticamente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- Trigger: criar user_profile ao criar usuário no Auth
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nome)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- RLS
-- -------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
