-- Histórico de peso corporal
CREATE TABLE IF NOT EXISTS peso_historico (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users NOT NULL,
  peso       numeric(5,1) NOT NULL CHECK (peso > 20 AND peso < 400),
  data       date NOT NULL DEFAULT CURRENT_DATE,
  criado_em  timestamptz DEFAULT now()
);

ALTER TABLE peso_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_peso" ON peso_historico FOR ALL USING (auth.uid() = user_id);
CREATE INDEX peso_historico_user_data ON peso_historico (user_id, data DESC);

-- Garante apenas 1 registro por dia por usuário
CREATE UNIQUE INDEX peso_historico_user_data_uniq ON peso_historico (user_id, data);
