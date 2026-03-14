-- Migration: Stripe Subscriptions com trial
-- Adiciona colunas para Subscription-based billing com período de trial

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at           TIMESTAMPTZ;

-- Atualiza constraint de status para incluir 'trial'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('ativa', 'cancelada', 'expirada', 'trial'));

-- Índice para lookup por stripe_subscription_id (webhook idempotência)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Índice para lookup por stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
