-- Tabela de dicas diárias geradas pelo personal IA
CREATE TABLE IF NOT EXISTS daily_tips (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data           date NOT NULL,
  tip            text NOT NULL,
  categoria      text NOT NULL DEFAULT 'treino',
  personal_slug  text,
  criado_em      timestamptz DEFAULT now(),
  UNIQUE(user_id, data)
);

ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_tips"
  ON daily_tips FOR SELECT
  USING (auth.uid() = user_id);
