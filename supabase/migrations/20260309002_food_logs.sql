-- ──────────────────────────────────────────────────────────────────────────────
-- Food Logs: diário alimentar (registro do que o usuário comeu — sem prescrição)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE food_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users NOT NULL,
  data             date NOT NULL,
  tipo             text NOT NULL CHECK (tipo IN ('cafe_manha','almoco','lanche','jantar','pos_treino','outro')),
  items            jsonb NOT NULL DEFAULT '[]',
  calorias_total   integer NOT NULL DEFAULT 0,
  proteina_total   numeric(5,1) NOT NULL DEFAULT 0,
  carbo_total      numeric(5,1) NOT NULL DEFAULT 0,
  gordura_total    numeric(5,1) NOT NULL DEFAULT 0,
  criado_em        timestamptz DEFAULT now()
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_food_logs" ON food_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX food_logs_user_data
  ON food_logs(user_id, data DESC);
