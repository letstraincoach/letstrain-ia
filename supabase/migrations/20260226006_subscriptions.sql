-- ============================================================
-- Migration 006: subscriptions + push_subscriptions
-- ============================================================

-- Assinaturas de plano
CREATE TABLE public.subscriptions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plano              TEXT NOT NULL CHECK (plano IN ('mensal', 'anual')),
  status             TEXT NOT NULL CHECK (status IN ('ativa', 'vencida', 'cancelada')),
  mp_subscription_id TEXT,       -- ID da assinatura no Mercado Pago
  mp_payment_id      TEXT,       -- ID do último pagamento no Mercado Pago
  inicio             TIMESTAMPTZ NOT NULL,
  fim                TIMESTAMPTZ NOT NULL,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_fim ON public.subscriptions(fim);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Push notification subscriptions (dispositivos)
CREATE TABLE public.push_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint          TEXT NOT NULL,
  keys              JSONB NOT NULL,   -- { p256dh, auth }
  dias_treino       INTEGER[] DEFAULT '{}',  -- 0=dom … 6=sab
  horario_lembrete  TIME,
  ativo             BOOLEAN NOT NULL DEFAULT true,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_ativo ON public.push_subscriptions(ativo);

-- -------------------------------------------------------
-- RLS: subscriptions
-- -------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserção/atualização feita apenas por service role (webhook do Mercado Pago)

-- -------------------------------------------------------
-- RLS: push_subscriptions
-- -------------------------------------------------------
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
