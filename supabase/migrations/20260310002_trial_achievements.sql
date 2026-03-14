-- ── Trial engagement achievements ────────────────────────────────────────────
-- Dia 1: recompensa imediata no primeiro treino (engaja desde o início do trial)
-- Dia 3: motivação no último dia do trial gratuito para converter em assinante

INSERT INTO achievements (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor)
VALUES
  (
    'boas_vindas',
    'Boas-vindas!',
    'Você completou seu primeiro treino no Lets Train. O trial de 3 dias começa agora — aproveite ao máximo!',
    '🎉',
    'treinos_totais',
    1
  ),
  (
    'tres_dias',
    '3 Dias de Foco',
    'Você treinou por 3 dias no Lets Train! Continue sua jornada — assine agora e nunca mais pare.',
    '🔥',
    'treinos_totais',
    3
  )
ON CONFLICT (codigo) DO NOTHING;
