-- ============================================================
-- Migration: Lets Coins — moeda de recompensa por treino
-- Alunos ganham coins treinando e resgatam descontos na loja
-- ============================================================

-- 1. Coluna de saldo na tabela de progresso
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS lets_coins INTEGER NOT NULL DEFAULT 0;

-- 2. Histórico de transações (ganhos e gastos)
CREATE TABLE IF NOT EXISTS public.lets_coins_transactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER     NOT NULL,   -- positivo = ganhou, negativo = gastou
  tipo        TEXT        NOT NULL,   -- 'treino' | 'streak' | 'primeiro_mes' | 'resgate'
  descricao   TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lets_coins_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own coin transactions"
  ON public.lets_coins_transactions FOR SELECT
  USING (user_id = auth.uid());

-- 3. Resgates (cupons gerados para a loja física)
CREATE TABLE IF NOT EXISTS public.lets_coins_resgates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coins_gastos INTEGER    NOT NULL,
  valor_brl   NUMERIC(6,2) NOT NULL, -- valor do desconto em reais
  codigo      TEXT        NOT NULL UNIQUE,
  status      TEXT        NOT NULL DEFAULT 'pendente'
              CHECK (status IN ('pendente', 'usado', 'expirado')),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usado_em    TIMESTAMPTZ
);

ALTER TABLE public.lets_coins_resgates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own resgates"
  ON public.lets_coins_resgates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own resgates"
  ON public.lets_coins_resgates FOR INSERT
  WITH CHECK (user_id = auth.uid());
