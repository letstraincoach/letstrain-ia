-- ============================================================
-- Migration 002: equipment_catalog + user_equipment
-- ============================================================

-- Catálogo padrão de equipamentos (readonly para usuários)
CREATE TABLE public.equipment_catalog (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  categoria  TEXT NOT NULL CHECK (categoria IN ('pesos_livres', 'maquinas', 'cabos', 'cardio', 'funcionais')),
  imagem_url TEXT,
  ativo      BOOLEAN NOT NULL DEFAULT true
);

-- Índices para busca por categoria
CREATE INDEX idx_equipment_catalog_categoria ON public.equipment_catalog(categoria);
CREATE INDEX idx_equipment_catalog_ativo ON public.equipment_catalog(ativo);

-- Equipamentos selecionados pelo usuário
CREATE TABLE public.user_equipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id  UUID REFERENCES public.equipment_catalog(id) ON DELETE SET NULL,
  nome_custom   TEXT,  -- equipamento não catalogado detectado pela IA
  foto_url      TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_equipment_has_ref CHECK (
    equipment_id IS NOT NULL OR nome_custom IS NOT NULL
  )
);

CREATE INDEX idx_user_equipment_user_id ON public.user_equipment(user_id);

-- -------------------------------------------------------
-- RLS: equipment_catalog — leitura pública para autenticados
-- -------------------------------------------------------
ALTER TABLE public.equipment_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read equipment catalog"
  ON public.equipment_catalog FOR SELECT
  TO authenticated
  USING (ativo = true);

-- -------------------------------------------------------
-- RLS: user_equipment — usuário gerencia apenas seus dados
-- -------------------------------------------------------
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment"
  ON public.user_equipment FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment"
  ON public.user_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
  ON public.user_equipment FOR DELETE
  USING (auth.uid() = user_id);
