-- ============================================================
-- Migration 009: replace mp_* columns with stripe_payment_intent_id
-- ============================================================

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS mp_subscription_id,
  DROP COLUMN IF EXISTS mp_payment_id;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_pi
  ON public.subscriptions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
