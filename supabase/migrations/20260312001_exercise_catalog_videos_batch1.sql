-- ============================================================
-- Exercícios novos — Batch vídeos 12/03/2026
-- Tríceps (polia + graviton), Bíceps (barra W, corda, alternada), Ombros (crucifixo inverso)
-- ============================================================

INSERT INTO public.exercise_catalog
  (slug, nome, grupo_muscular, padrao_movimento, nivel_grupo, locais, equipamentos, instrucoes, erros_comuns, validado_por)
VALUES

-- ── OMBROS ─────────────────────────────────────────────────────────────────

('crucifixo-inverso-inclinado',
 'Crucifixo Inverso no Banco Inclinado com Halter',
 'ombros', 'pull', 'iniciante',
 ARRAY['academia'],
 ARRAY['halteres', 'banco inclinado'],
 'Deite de bruços no banco inclinado a ~30°. Com os halteres pendurados abaixo e cotovelos levemente flexionados, abra os braços em arco até a altura dos ombros, contraindo o deltóide posterior. Desça controlado.',
 'Não usar impulso; manter leve flexão no cotovelo durante todo o movimento; não subir além da linha do ombro.',
 'guilherme'),

-- ── BÍCEPS ─────────────────────────────────────────────────────────────────

('rosca-direta-barra-w',
 'Rosca Direta com Barra W',
 'biceps', 'pull', 'iniciante',
 ARRAY['academia'],
 ARRAY['barra w', 'anilhas'],
 'Em pé, segure a barra W na pegada angulada (supinada). Flexione os cotovelos trazendo a barra até a altura dos ombros, mantendo os cotovelos fixos ao lado do corpo. Desça controlado sem balançar o tronco.',
 'Não jogar o tronco para trás; a pegada angulada da barra W reduz estresse no punho — aproveite mantendo os pulsos neutros.',
 'guilherme'),

('rosca-corda-polia',
 'Rosca com Corda na Polia',
 'biceps', 'pull', 'iniciante',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'corda'],
 'Polia na posição baixa com corda. Segure as pontas da corda em pegada neutra (martelo). Flexione os cotovelos contraindo o bíceps, rode levemente os punhos para fora no topo para contração máxima. Desça com tensão constante.',
 'Manter cotovelos fixos ao lado do corpo; não usar momentum do tronco.',
 'carlos'),

('rosca-alternada-halteres',
 'Rosca Alternada com Halteres',
 'biceps', 'pull', 'iniciante',
 ARRAY['academia', 'condominio', 'hotel'],
 ARRAY['halteres'],
 'Em pé com um halter em cada mão, palmas para frente. Flexione um braço de cada vez até o ombro, contraindo o bíceps no topo. Desça controlado antes de alternar para o outro braço. Mantenha o tronco estável.',
 'Não balançar o corpo para gerar impulso; completar o movimento de um lado antes de iniciar o outro.',
 'guilherme'),

-- ── TRÍCEPS ────────────────────────────────────────────────────────────────

('triceps-coice-polia',
 'Tríceps Coice na Polia',
 'triceps', 'push', 'iniciante',
 ARRAY['academia'],
 ARRAY['polia', 'cabo'],
 'Polia baixa, pegada neutra. Incline o tronco à frente ~45°, cotovelo fixo ao lado do corpo em 90°. Estenda o antebraço para trás até o braço ficar reto, contraindo o tríceps. Retorne controlado.',
 'Não mover o ombro ou cotovelo durante a extensão; manter o tronco estável.',
 'guilherme'),

('triceps-frances-barra-polia',
 'Tríceps Francês com Barra na Polia',
 'triceps', 'push', 'intermediario',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'barra reta'],
 'De costas para a polia baixa, segure a barra com pegada supinada. Braços estendidos acima da cabeça. Flexione apenas os cotovelos descendo a barra atrás da cabeça, depois estenda de volta sem mover os ombros.',
 'Não abrir os cotovelos para os lados; manter os braços próximos à cabeça durante todo o movimento.',
 'carlos'),

('triceps-testa-barra-polia',
 'Tríceps Testa com Barra na Polia',
 'triceps', 'push', 'intermediario',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'barra reta', 'banco'],
 'Deite no banco com a cabeça voltada para a polia baixa. Segure a barra com braços estendidos acima do peito. Flexione os cotovelos descendo a barra até próximo da testa, depois estenda de volta. A tensão do cabo mantém o tríceps ativado durante todo o arco.',
 'Não mover os ombros — apenas os cotovelos flexionam e estendem; não bater a barra na testa.',
 'guilherme'),

('triceps-pushdown-barra-reta',
 'Tríceps Pushdown com Barra Reta na Polia',
 'triceps', 'push', 'iniciante',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'barra reta'],
 'Polia alta com barra reta em pegada pronada. Cotovelos fixos ao lado do corpo, estenda os antebraços para baixo até os braços ficarem retos. Contraia o tríceps no final do movimento e retorne controlado.',
 'Não afastar os cotovelos do corpo; não inclinar o tronco excessivamente à frente.',
 'guilherme'),

('triceps-testa-barra-w',
 'Tríceps Testa com Barra W',
 'triceps', 'push', 'intermediario',
 ARRAY['academia'],
 ARRAY['barra w', 'anilhas', 'banco'],
 'Deitado no banco, segure a barra W acima do peito com pegada angulada. Flexione apenas os cotovelos descendo a barra até próximo da testa. Estenda de volta contraindo o tríceps. A barra W reduz estresse nos punhos.',
 'Não abrir os cotovelos para os lados; descer de forma controlada sem momentum.',
 'carlos'),

('triceps-paralela-graviton',
 'Tríceps na Paralela (Graviton)',
 'triceps', 'push', 'iniciante',
 ARRAY['academia'],
 ARRAY['graviton'],
 'No graviton, selecione a carga de assistência adequada. Segure as barras paralelas com cotovelos estendidos, tronco levemente inclinado à frente. Desça flexionando os cotovelos até ~90°, depois empurre de volta estendendo completamente. Foque a contração no tríceps.',
 'Não descer demais — 90° de flexão é suficiente para proteger o ombro; manter os cotovelos próximos ao corpo para focar no tríceps.',
 'guilherme'),

('triceps-frances-corda-polia',
 'Tríceps Francês com Corda na Polia',
 'triceps', 'push', 'intermediario',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'corda'],
 'De costas para a polia baixa, segure a corda acima da cabeça com os braços estendidos. Flexione apenas os cotovelos descendo a corda atrás da cabeça, depois estenda de volta abrindo levemente as pontas da corda no topo para contração máxima.',
 'Manter os cotovelos apontados para frente e próximos à cabeça; não usar o tronco para gerar impulso.',
 'carlos'),

('triceps-testa-corda-polia',
 'Tríceps Testa com Corda na Polia',
 'triceps', 'push', 'intermediario',
 ARRAY['academia'],
 ARRAY['polia', 'cabo', 'corda', 'banco'],
 'Deite no banco com a cabeça voltada para a polia baixa. Segure a corda com braços estendidos acima do peito. Flexione os cotovelos descendo a corda até as laterais da cabeça, depois estenda de volta. A corda permite rotação natural dos punhos.',
 'Não mover os ombros; manter os cotovelos fixos apontando para o teto.',
 'guilherme')

ON CONFLICT (slug) DO NOTHING;
