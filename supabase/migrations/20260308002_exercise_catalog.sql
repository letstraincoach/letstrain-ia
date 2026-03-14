-- ============================================================
-- Banco de Exercícios Validados pelos Professores Lets Train
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exercise_catalog (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  nome             TEXT        NOT NULL,
  grupo_muscular   TEXT        NOT NULL CHECK (grupo_muscular IN (
                     'peito','costas','ombros','biceps','triceps',
                     'quadriceps','posterior','gluteos','panturrilha',
                     'core','full_body','mobilidade')),
  padrao_movimento TEXT        NOT NULL CHECK (padrao_movimento IN (
                     'push','pull','squat','hinge','core','cardio','mobilidade')),
  nivel_grupo      TEXT        NOT NULL DEFAULT 'iniciante'
                     CHECK (nivel_grupo IN ('iniciante','intermediario','avancado','atleta')),
  locais           TEXT[]      NOT NULL DEFAULT ARRAY['academia','condominio','hotel'],
  equipamentos     TEXT[],
  instrucoes       TEXT        NOT NULL,
  erros_comuns     TEXT,
  youtube_url      TEXT,
  validado_por     TEXT        NOT NULL DEFAULT 'guilherme'
                     CHECK (validado_por IN ('guilherme','carlos','raul','maicon')),
  ativo            BOOLEAN     NOT NULL DEFAULT true,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'exercise_catalog' AND policyname = 'exercise_catalog_read'
  ) THEN
    CREATE POLICY "exercise_catalog_read" ON public.exercise_catalog
      FOR SELECT TO authenticated USING (ativo = true);
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_grupo   ON public.exercise_catalog(grupo_muscular);
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_nivel   ON public.exercise_catalog(nivel_grupo);
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_locais  ON public.exercise_catalog USING GIN(locais);
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_validado ON public.exercise_catalog(validado_por);

-- ============================================================
-- SEED: ~100 exercícios validados
-- ============================================================

INSERT INTO public.exercise_catalog
  (slug, nome, grupo_muscular, padrao_movimento, nivel_grupo, locais, equipamentos, instrucoes, erros_comuns, validado_por)
VALUES

-- ── PEITO ──────────────────────────────────────────────────
('flexao-solo', 'Flexão de Solo', 'peito', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Posicione as mãos ligeiramente mais largas que os ombros com os dedos apontados para frente. Mantenha o corpo em linha reta da cabeça aos calcanhares, com o core contraído. Desça o peito até quase tocar o chão, depois empurre de volta com força, expirando no esforço.',
 'Evite deixar o quadril cair ou subir demais — o corpo precisa manter linha reta do início ao fim.', 'guilherme'),

('supino-halteres-reto', 'Supino Reto com Halteres', 'peito', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Deite no banco com os pés apoiados no chão, segure os halteres na altura do peito com os cotovelos em 45 graus. Empurre os halteres para cima até os braços ficarem quase estendidos, depois desça controladamente até sentir o alongamento no peito.',
 'Não deixe os cotovelos abrirem demais (90 graus) — gera sobrecarga desnecessária no ombro.', 'guilherme'),

('supino-halteres-inclinado', 'Supino Inclinado com Halteres', 'peito', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco inclinado'],
 'Ajuste o banco a 30-45 graus. Segure os halteres na altura dos ombros e empurre diagonalmente para cima e levemente para frente. Controle bem a descida, mantendo o peito alto e as escápulas retraídas durante todo o movimento.',
 'Não incline o banco demais — acima de 45 graus começa a recrutar mais deltóide e menos peitoral superior.', 'carlos'),

('crucifixo-halteres', 'Crucifixo com Halteres', 'peito', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Deitado no banco, estenda os braços acima do peito com uma leve flexão dos cotovelos. Abra os braços em arco amplo até sentir o alongamento no peito, depois feche contraindo o peitoral como se abraçasse uma árvore grande. Mantenha sempre a leve flexão no cotovelo.',
 'Não abaixe demais os halteres — o alongamento deve ser confortável, sem dor nos ombros.', 'guilherme'),

('flexao-diamante', 'Flexão Diamante', 'peito', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Forme um triângulo com os dedos indicadores e polegares, posicionando as mãos abaixo do esterno. Mantenha o corpo rígido e desça até o peito quase tocar as mãos, focando a tensão no peitoral medial e no tríceps. Suba com força e controle.',
 'Não deixe os cotovelos abrirem para os lados — eles devem permanecer próximos ao corpo.', 'carlos'),

('supino-halteres-declinado', 'Supino Declinado com Halteres', 'peito', 'push', 'intermediario',
 ARRAY['academia'], ARRAY['halteres','banco declinado'],
 'Com o banco a -15 a -30 graus, segure os halteres e empurre para cima e levemente para cima do peito. Sinta a contração na parte inferior do peitoral. Desça com controle, mantendo o core ativo para estabilizar o corpo na posição declinada.',
 'Fixe bem os pés no suporte antes de iniciar — a posição declinada sem fixação é instável.', 'guilherme'),

('flexao-arqueiro', 'Flexão Arqueiro', 'peito', 'push', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Na posição de flexão com os braços mais abertos que o normal, desça transferindo o peso para um lado enquanto o outro braço vai estendendo. Alterne os lados a cada repetição, como se fosse puxar uma corda. Mantenha o core firme durante toda a execução.',
 'Mantenha o ombro do lado ativo estável — não deixe o quadril rodar ao transferir o peso.', 'carlos'),

('mergulho-paralelas', 'Mergulho nas Paralelas', 'peito', 'push', 'intermediario',
 ARRAY['academia'], ARRAY['paralelas'],
 'Apoie-se nas paralelas com os braços estendidos e incline levemente o torso para frente. Desça controlando até os cotovelos chegarem a 90 graus, sentindo o alongamento no peito. Suba empurrando com o peitoral até os braços ficarem quase estendidos.',
 'Não desça demais — abaixo de 90 graus nos cotovelos aumenta o estresse no ombro. Incline o tronco para focar mais no peito.', 'guilherme'),

-- ── COSTAS ─────────────────────────────────────────────────
('remada-curvada-halteres', 'Remada Curvada com Halteres', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com os joelhos levemente flexionados e o tronco inclinado a 45 graus, segure os halteres com os braços estendidos. Puxe os halteres em direção ao abdômen, abrindo os cotovelos para os lados e contraindo as escápulas no topo. Desça controladamente.',
 'Evite arredondar as costas — mantenha a coluna neutra e o peito aberto durante todo o movimento.', 'guilherme'),

('remada-unilateral', 'Remada Unilateral com Haltere', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Apoie um joelho e a mão do mesmo lado no banco. Com o outro braço, segure o haltere e puxe em direção ao quadril, cotovelo apontando para o teto. Sinta a contração no grande dorsal e no rombóide. Desça o haltere com controle total.',
 'Não gire o tronco ao puxar — o movimento deve ser do braço, não da rotação das costas.', 'carlos'),

('barra-fixa', 'Barra Fixa', 'costas', 'pull', 'intermediario',
 ARRAY['academia','condominio'], ARRAY['barra fixa'],
 'Segure a barra com as mãos um pouco mais largas que os ombros, palmas voltadas para fora. Parta de braços completamente estendidos, puxe o corpo para cima até o queixo ultrapassar a barra. Desça de forma controlada, resistindo à gravidade.',
 'Não balance o corpo para ganhar impulso — o movimento deve ser puro de força nas costas.', 'guilherme'),

('barra-fixa-supinada', 'Barra Fixa Supinada (Chin-up)', 'costas', 'pull', 'intermediario',
 ARRAY['academia','condominio'], ARRAY['barra fixa'],
 'Segure a barra com as palmas voltadas para você, mãos na largura dos ombros. Puxe o corpo até o queixo passar pela barra, sentindo forte contração no bíceps e no grande dorsal. Desça lentamente e completamente até os braços estenderem.',
 'Não use o pescoço para alcançar a barra — o movimento vem dos braços e das costas.', 'carlos'),

('remada-alta-halteres', 'Remada Alta com Halteres', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres à frente das coxas, puxe os cotovelos para cima e para os lados até os halteres chegarem na altura do queixo. Mantenha os cotovelos sempre acima dos pulsos durante o movimento. Desça de forma controlada.',
 'Não eleve os ombros junto — mantenha os trapézios relaxados para focar no deltóide medial e no trapézio médio.', 'guilherme'),

('encolhimento-halteres', 'Encolhimento de Ombros com Halteres', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres ao lado do corpo, eleve os ombros em direção às orelhas sem dobrar os cotovelos. Segure a contração por 1-2 segundos no topo e desça lentamente. Imagine que está tentando tocar as orelhas com os ombros.',
 'Não gire os ombros — o movimento é puramente vertical, sem rotação.', 'carlos'),

('pull-over-haltere', 'Pull-over com Haltere', 'costas', 'pull', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Deite transversalmente no banco com apenas a parte superior das costas apoiada. Segure o haltere com as duas mãos acima do peito, cotovelos levemente flexionados. Abaixe o haltere por trás da cabeça em arco, sentindo o alongamento nas costas, e retorne contraindo o grande dorsal.',
 'Não abaixe demais o haltere — pare quando sentir o alongamento nas costas, sem forçar os ombros.', 'guilherme'),

('face-pull-elastico', 'Face Pull com Elástico', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Prenda o elástico em algo estável na altura dos olhos. Segure as pontas com os braços estendidos e puxe em direção ao rosto, abrindo os cotovelos para os lados e externamente rotacionando os ombros. Contraia as escápulas no topo e volte lentamente.',
 'Não deixe os cotovelos caírem abaixo dos ombros — mantenha-os alinhados ou acima para proteger o manguito.', 'carlos'),

('remada-serrail', 'Serrátil Anterior — Isometria', 'costas', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em posição de prancha com os braços estendidos, empurre o chão com as mãos como se quisesse afastá-lo de você, protraindo as escápulas. Segure a posição com os ombros elevados acima das escápulas por 20-30 segundos. Respire de forma constante.',
 'Não deixe os ombros caírem — a tensão deve estar na região lateral do peito, não no trapézio.', 'guilherme'),

('remada-baixa-elastico', 'Remada Baixa com Elástico', 'costas', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Sente-se no chão com as pernas levemente flexionadas e o elástico preso nos pés. Segure as pontas e puxe em direção ao abdômen, contraindo as escápulas. Mantenha o tronco ereto sem inclinar para trás. Retorne de forma controlada.',
 'Não arredonde a lombar ao retornar — mantenha o tronco neutro durante todo o movimento.', 'carlos'),

('superman', 'Superman', 'costas', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deite de barriga para baixo com os braços estendidos à frente. Ao mesmo tempo, eleve os braços, o peito e as pernas do chão, contraindo a lombar e os glúteos. Segure 2-3 segundos no topo e desça controladamente. Imagine que você está voando.',
 'Não force o pescoço para cima — mantenha o olhar para o chão, o pescoço em linha com a coluna.', 'guilherme'),

-- ── OMBROS ─────────────────────────────────────────────────
('desenvolvimento-halteres', 'Desenvolvimento com Halteres', 'ombros', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Sentado ou em pé, segure os halteres na altura dos ombros com os cotovelos dobrados a 90 graus. Empurre os halteres diretamente para cima até os braços ficarem quase estendidos, depois desça controladamente. Mantenha o core contraído para não arquear a lombar.',
 'Não incline o tronco para trás ao empurrar — use o abdômen para estabilizar e proteger a lombar.', 'guilherme'),

('elevacao-lateral', 'Elevação Lateral com Halteres', 'ombros', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres ao lado do corpo e uma leve flexão nos cotovelos, eleve os braços lateralmente até a altura dos ombros, mantendo os cotovelos levemente à frente dos pulsos. Desça lentamente em 3-4 segundos, resistindo à gravidade.',
 'Não use impulso do tronco para levantar — se precisar balançar o corpo, o peso está pesado demais.', 'carlos'),

('elevacao-frontal-halteres', 'Elevação Frontal com Halteres', 'ombros', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres à frente das coxas, eleve um braço de cada vez até a altura dos ombros, com o polegar apontando para o teto. Alterne os braços de forma controlada. Mantenha o tronco estável, sem oscilar durante o movimento.',
 'Não eleve acima da linha dos ombros — ultrapassar essa altura não adiciona benefício e aumenta o risco de impacto.', 'guilherme'),

('desenvolvimento-arnold', 'Desenvolvimento Arnold', 'ombros', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Comece com os halteres na frente dos ombros, palmas voltadas para você. Ao empurrar para cima, gire as palmas para frente em um movimento fluido. No topo os braços estão quase estendidos com as palmas para fora. Inverta o movimento ao descer.',
 'Faça a rotação de forma suave e controlada — não force a mudança de plano, deve ser um arco natural.', 'carlos'),

('rotacao-externa-elastico', 'Rotação Externa com Elástico', 'ombros', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Com o cotovelo dobrado a 90 graus e colado ao tronco, segure o elástico e gire o antebraço para fora, afastando a mão do corpo. Mantenha o cotovelo fixo — ele é o pivô do movimento. Retorne lentamente controlando a resistência do elástico.',
 'Não deixe o cotovelo sair do tronco — ele deve permanecer fixo para isolar o manguito rotador.', 'guilherme'),

('elevacao-lateral-inclinado', 'Elevação Lateral Inclinada', 'ombros', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Incline o tronco para um lado, apoiando a mão livre em algo estável. Com o braço livre, segure o haltere e eleve lateralmente acima da linha do tronco. Essa posição aumenta o arco de movimento e o estímulo no deltóide lateral. Desça controladamente.',
 'Não eleve o ombro junto ao movimento — mantenha-o rebaixado para maximizar o isolamento do deltóide.', 'carlos'),

('remada-queixo-halteres', 'Remada ao Queixo com Halteres', 'ombros', 'pull', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres à frente, puxe-os verticalmente até a altura do queixo, com os cotovelos sempre acima dos pulsos. No topo, os cotovelos devem estar acima dos ombros. Desça de forma controlada mantendo os halteres próximos ao corpo.',
 'Não eleve os halteres com um agarre muito fechado — isso comprime o ombro. Mãos na largura dos ombros.', 'guilherme'),

('press-militar-halteres', 'Press Militar com Halteres', 'ombros', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres na altura das orelhas, cotovelos levemente à frente dos ombros, empurre diretamente para cima até os braços ficarem quase estendidos. Desça até os cotovelos ficarem abaixo dos ombros. Mantenha o core contraído para proteger a lombar.',
 'Não arquee a lombar ao empurrar — ative o abdômen e os glúteos para criar uma base estável.', 'carlos'),

-- ── BÍCEPS ─────────────────────────────────────────────────
('rosca-direta-halteres', 'Rosca Direta com Halteres', 'biceps', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres ao lado do corpo, palmas voltadas para frente, flexione os cotovelos trazendo os halteres em direção aos ombros. Mantenha os cotovelos colados ao tronco como pivôs fixos. Desça controladamente até os braços ficarem completamente estendidos.',
 'Não balance o tronco para cima — se precisar de impulso, o peso está pesado demais.', 'guilherme'),

('rosca-martelo', 'Rosca Martelo', 'biceps', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com os halteres ao lado do corpo, palmas voltadas para dentro (posição neutra), flexione os cotovelos como se martelasse algo. O polegar deve sempre apontar para o teto. Isso trabalha mais o braquiorradial e o braquial além do bíceps.',
 'Não gire o punho durante o movimento — mantenha a pegada neutra do começo ao fim.', 'carlos'),

('rosca-concentrada', 'Rosca Concentrada', 'biceps', 'pull', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Sentado, apoie o cotovelo na face interna da coxa. Segure o haltere e flexione o cotovelo contraindo fortemente o bíceps no topo. Desça lentamente, resistindo à gravidade. Concentre-se em sentir a contração máxima em cada repetição.',
 'Não levante o cotovelo da coxa — ele é o ponto de apoio que permite isolar o bíceps.', 'guilherme'),

('rosca-21', 'Rosca 21', 'biceps', 'pull', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Faça 7 repetições na metade inferior (da posição estendida até 90 graus), depois 7 repetições na metade superior (de 90 graus até os ombros), e finalize com 7 repetições completas. Não descanse entre as partes. Esse método cria tensão em todo o arco do bíceps.',
 'Use um peso mais leve que o habitual — o volume total de 21 repetições cria fadiga significativa.', 'carlos'),

('rosca-inversa', 'Rosca Inversa com Halteres', 'biceps', 'pull', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com as palmas voltadas para baixo (pronadas), flexione os cotovelos trazendo os halteres até os ombros. Esse exercício trabalha principalmente o braquiorradial e os extensores do pulso. Mantenha os pulsos retos e desça de forma controlada.',
 'Não curve os pulsos — mantenha-os neutros durante toda a amplitude para não sobrecarregar os tendões.', 'guilherme'),

('rosca-isometrica', 'Rosca Isométrica no Ângulo Fraco', 'biceps', 'pull', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Segure um haltere em cada mão a 90 graus de flexão. Mantenha essa posição por 20-40 segundos enquanto faz contrações pulsadas com o outro braço. Alterne os braços. O isométrico no ângulo fraco (90 graus) gera tensão máxima no bíceps.',
 'Mantenha a respiração — não prenda o ar durante os isométricos, respire de forma ritmada.', 'carlos'),

-- ── TRÍCEPS ────────────────────────────────────────────────
('triceps-coice', 'Tríceps Coice com Haltere', 'triceps', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com o tronco inclinado a 45-90 graus e apoiado em algo estável, mantenha o braço paralelo ao chão com o cotovelo a 90 graus. Estenda o antebraço para trás até o braço ficar completamente reto, contraindo o tríceps. Volte devagar.',
 'Não mova o cotovelo — ele é o pivô fixo. Apenas o antebraço deve se mover durante o exercício.', 'guilherme'),

('triceps-testa', 'Tríceps Testa com Halteres', 'triceps', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Deitado no banco, segure os halteres acima do peito. Mantendo os cotovelos apontados para o teto e fixos, flexione os cotovelos e desça os halteres em direção à testa ou ao lado da cabeça. Estenda os braços contraindo o tríceps e retorne.',
 'Não abra os cotovelos para os lados — eles devem permanecer paralelos e apontando para o teto.', 'carlos'),

('mergulho-banco', 'Mergulho no Banco', 'triceps', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['banco','cadeira'],
 'Apoie as mãos no banco atrás de você, pernas estendidas à frente. Desça o corpo flexionando os cotovelos até eles chegarem a 90 graus. Empurre de volta com força usando o tríceps. Mantenha o tronco próximo ao banco durante todo o movimento.',
 'Não deixe os cotovelos abrirem para os lados — mantenha-os paralelos apontando para trás.', 'guilherme'),

('extensao-triceps-overhead', 'Extensão de Tríceps Overhead com Haltere', 'triceps', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Segure um haltere com as duas mãos acima da cabeça, cotovelos próximos às orelhas. Desça o haltere por trás da cabeça flexionando os cotovelos, depois estenda de volta para cima. O grande dorsal trabalha em oposição aqui — mantenha os cotovelos apontados para o teto.',
 'Não afaste os cotovelos das orelhas — eles devem permanecer próximos durante todo o movimento.', 'carlos'),

('triceps-frances', 'Tríceps Francês com Halteres', 'triceps', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Deitado no banco com halteres em cada mão acima do peito, incline os braços ligeiramente para trás da vertical. Flexione apenas os cotovelos, descendo os halteres ao lado da cabeça. Estenda os braços contraindo o tríceps. Esse ângulo coloca o tríceps longo em máximo estiramento.',
 'Não mova os ombros — somente os cotovelos flexionam e estendem.', 'guilherme'),

('pushdown-elastico', 'Push-down com Elástico', 'triceps', 'push', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Prenda o elástico em algo estável acima da altura dos ombros. Com os cotovelos fixos ao lado do tronco, empurre o elástico para baixo até os braços ficarem completamente estendidos. Contraia o tríceps no final e volte de forma controlada.',
 'Não mova os cotovelos — eles são o ponto fixo. O movimento é somente do antebraço para baixo.', 'carlos'),

-- ── QUADRÍCEPS ─────────────────────────────────────────────
('agachamento-livre', 'Agachamento Livre', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Posicione os pés na largura dos ombros com os dedos levemente abertos para fora. Desça controlando o movimento até as coxas ficarem paralelas ao chão, mantendo o peito erguido e os joelhos alinhados com os pés. Suba expirando, contraindo o glúteo no topo.',
 'Não deixe os joelhos caírem para dentro — imagine que está afastando o chão com os pés para manter os joelhos fora.', 'guilherme'),

('agachamento-halteres', 'Agachamento com Halteres', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Segure os halteres ao lado do corpo ou na posição goblet. Com os pés na largura dos ombros, desça como no agachamento livre, mantendo o peito alto e a coluna neutra. Os halteres adicionam carga e podem ajudar a balancear o tronco na posição goblet.',
 'Na posição goblet, segure o haltere próximo ao peito — não o deixe cair à frente do corpo.', 'carlos'),

('avanco', 'Avanço (Lunge)', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Dê um passo longo à frente e desça o joelho traseiro em direção ao chão sem tocá-lo. O joelho da frente deve ficar alinhado com o tornozelo, sem ultrapassá-lo. Empurre com o calcanhar da frente para voltar à posição inicial.',
 'Não deixe o tronco cair para frente — mantenha o peito erguido e o core ativo durante todo o movimento.', 'guilherme'),

('avanco-halteres', 'Avanço com Halteres', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com halteres em cada mão ao lado do corpo, execute o avanço como no movimento sem carga. Os halteres aumentam a demanda sobre o quadríceps e glúteo. Alterne as pernas ou complete todas as repetições em um lado antes de trocar.',
 'Não use os halteres como apoio — eles devem ficar neutros ao lado do corpo, sem balanço.', 'carlos'),

('agachamento-sumó', 'Agachamento Sumô', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Posicione os pés mais largos que os ombros com as pontas dos pés apontando bem para fora (45 graus). Segure um haltere no centro com as duas mãos. Desça mantendo o tronco ereto e os joelhos alinhados com os pés. Esse exercício recruta mais o adutor e o glúteo medial.',
 'Não deixe os joelhos caírem para dentro — com a posição aberta, é comum os joelhos cederem.', 'guilherme'),

('agachamento-bulgaro', 'Agachamento Búlgaro', 'quadriceps', 'squat', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Apoie o pé de trás em um banco ou cadeira, fique em posição de avanço longa. Com halteres nas mãos, desça flexionando o joelho da frente até a coxa ficar paralela ao chão. Empurre com o calcanhar da frente para subir. É unilateral e exige equilíbrio.',
 'A distância entre o pé e o banco deve ser suficiente para que o joelho não ultrapasse o tornozelo ao descer.', 'carlos'),

('step-up', 'Step-up com Halteres', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco','step'],
 'Com halteres nas mãos, suba em um banco ou step com o pé direito. Empurre o calcanhar contra o step para erguer o corpo e trazer o pé esquerdo ao lado. Desça o pé esquerdo primeiro. Concentre o trabalho na perna que está no step, evitando impulso da perna de baixo.',
 'Não use a perna de baixo para dar impulso — toda a força deve vir da perna que está no step.', 'guilherme'),

('agachamento-wall', 'Agachamento na Parede (Wall Squat)', 'quadriceps', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Apoie as costas na parede com os pés afastados 60 cm da parede. Desça deslizando a coluna pela parede até os joelhos chegarem a 90 graus. Segure a posição estática pelo tempo programado. Isso desenvolve força isométrica no quadríceps sem impacto nas articulações.',
 'Mantenha a lombar pressionada contra a parede — não deixe a curva lombar aparecer.', 'carlos'),

-- ── POSTERIOR ─────────────────────────────────────────────
('stiff-halteres', 'Stiff com Halteres', 'posterior', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com os halteres à frente das coxas, incline o tronco para frente com os joelhos levemente flexionados, deslizando os halteres pelas pernas. Sinta o alongamento nos isquiotibiais ao descer. Suba contraindo os glúteos e a lombar para retornar.',
 'Não arredonde a lombar — mantenha a coluna neutra durante todo o movimento, mesmo que isso limite a amplitude.', 'guilherme'),

('levantamento-terra', 'Levantamento Terra com Halteres', 'posterior', 'hinge', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com os halteres no chão à sua frente, agache e segure-os com as mãos. Mantenha a coluna neutra, o peito alto e os ombros sobre os halteres. Empurre o chão com os pés para se levantar, estendendo quadril e joelhos ao mesmo tempo. Os halteres sobem deslizando pelas pernas.',
 'Não arredonde as costas — se a lombar arredondar, reduza a carga ou melhore a mobilidade antes de progredir.', 'carlos'),

('cadeira-flexora-elastico', 'Curl de Isquiotibial com Elástico', 'posterior', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Deite de barriga para baixo com o elástico preso nos tornozelos e preso em algo estável à sua frente. Flexione os joelhos trazendo os calcanhares em direção aos glúteos. Sinta a contração nos isquiotibiais. Desça de forma controlada, resistindo à tração do elástico.',
 'Não levante os quadris ao flexionar os joelhos — mantenha o quadril no chão durante todo o movimento.', 'guilherme'),

('nordic-curl', 'Nordic Curl (Cadeira Nórdica)', 'posterior', 'hinge', 'avancado',
 ARRAY['academia','condominio'], ARRAY['banco'],
 'Ajoelhe-se com os tornozelos fixos sob algo pesado ou com parceiro segurando. Com o corpo reto, desça lentamente para frente resistindo com os isquiotibiais. Quando a tensão exceder sua força, apoie as mãos no chão. Suba com auxílio dos braços e repita a descida eccêntrica.',
 'Esse exercício é muito intenso — comece com apenas 2-3 repetições e progrida gradualmente para evitar lesão.', 'carlos'),

('bom-dia-halteres', 'Bom Dia com Halteres', 'posterior', 'hinge', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Em pé com halteres nos ombros ou nas mãos ao lado do corpo, incline o tronco para frente com os joelhos levemente flexionados e a coluna neutra. Incline até o tronco ficar quase paralelo ao chão, sentindo o isquiotibial. Suba contraindo os glúteos e a lombar.',
 'Mantenha a curvatura natural da lombar — não arredonde nem hiperlorde durante o movimento.', 'guilherme'),

('ponte-isquiotibial', 'Ponte de Isquiotibial', 'posterior', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deite de costas com os joelhos dobrados e os pés bem próximos aos glúteos. Eleve os quadris contraindo os glúteos e os isquiotibiais. No topo, as coxas devem estar alinhadas com o tronco. Segure 2 segundos e desça controladamente.',
 'Não deixe os joelhos caírem para dentro ou para fora — mantenha-os alinhados com os pés.', 'carlos'),

-- ── GLÚTEOS ────────────────────────────────────────────────
('hip-thrust-banco', 'Hip Thrust com Haltere', 'gluteos', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Apoie as escápulas em um banco e coloque um haltere sobre os quadris. Com os pés apoiados no chão, empurre os quadris para cima contraindo os glúteos no topo. O tronco e as coxas devem ficar paralelos ao chão no pico do movimento. Desça controladamente.',
 'Não hiperestenda a lombar no topo — o movimento de extensão deve vir do quadril, não da lombar.', 'guilherme'),

('elevacao-quadril-solo', 'Elevação de Quadril no Solo', 'gluteos', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas com joelhos dobrados e pés apoiados, eleve o quadril contraindo os glúteos. Segure 2-3 segundos no topo e desça sem encostar o quadril completamente no chão antes da próxima repetição. Mantenha a tensão durante todo o set.',
 'Não arquee a lombar para ganhar altura — a amplitude deve ser limitada pela contração do glúteo.', 'carlos'),

('avanco-reverso', 'Avanço Reverso com Halteres', 'gluteos', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com halteres nas mãos, dê um passo longo para trás e desça o joelho traseiro em direção ao chão. O joelho da perna da frente fica alinhado com o tornozelo. Empurre com o calcanhar da frente para retornar. O avanço reverso é mais seguro para os joelhos.',
 'Não deixe o tronco inclinar para frente — mantenha o peito erguido durante todo o movimento.', 'guilherme'),

('abducao-quadril-elastico', 'Abdução de Quadril com Elástico', 'gluteos', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Com o elástico acima dos joelhos, deite de lado ou fique em pé. Eleve a perna de cima lateralmente em amplitude confortável, sentindo a contração no glúteo médio. Não deixe o quadril girar — apenas a perna se move. Desça controladamente.',
 'Não gire o quadril ou o tronco para compensar — mantenha tudo alinhado, apenas a perna se eleva.', 'carlos'),

('donkey-kick', 'Donkey Kick', 'gluteos', 'hinge', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em posição de quatro apoios com as mãos abaixo dos ombros e os joelhos abaixo dos quadris. Mantendo o joelho dobrado a 90 graus, eleve um pé em direção ao teto contraindo o glúteo. Não gire o quadril. Desça controladamente e repita no mesmo lado antes de trocar.',
 'Não eleve a perna além do ponto em que o quadril começa a rotar — limite a amplitude para manter o alinhamento.', 'guilherme'),

('passada-lateral-elastico', 'Passada Lateral com Elástico', 'gluteos', 'squat', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['elástico'],
 'Com o elástico acima dos joelhos, fique em posição de semi-agachamento. Dê passos laterais mantendo a tensão no elástico e o quadril baixo. Percorra 10 passos para um lado e depois para o outro. O glúteo médio é o principal músculo trabalhado.',
 'Não fique completamente ereto ao pasear lateralmente — mantenha leve flexão no quadril e joelhos.', 'carlos'),

-- ── PANTURRILHA ────────────────────────────────────────────
('gemeos-pe', 'Gêmeos em Pé', 'panturrilha', 'cardio', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em pé com os pés na largura dos quadris, eleve-se nas pontas dos pés o mais alto possível, contraindo as panturrilhas no topo. Desça controladamente até os calcanhares tocarem o chão. Realize o movimento completo para maximizar o recrutamento muscular.',
 'Não dobre os joelhos ao elevar — mantenha as pernas retas para focar nas panturrilhas.', 'guilherme'),

('gemeos-unipodal', 'Gêmeos Unipodal', 'panturrilha', 'cardio', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em uma perna só, apoie levemente a mão em algo para equilíbrio. Eleve-se na ponta do pé o mais alto possível e desça controladamente. Esse exercício unilateral é muito mais intenso que o bilateral e ajuda a corrigir desequilíbrios.',
 'Não incline o tornozelo para dentro ou fora ao subir — mantenha o tornozelo neutro.', 'carlos'),

('gemeos-sentado', 'Gêmeos Sentado com Haltere', 'panturrilha', 'cardio', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres','banco'],
 'Sentado no banco, coloque um haltere sobre a coxa perto do joelho. Eleve o calcanhar o mais alto possível, contraindo o sóleo (músculo mais profundo da panturrilha). O exercício sentado trabalha o sóleo de forma mais eficaz por causa do joelho flexionado.',
 'Não faça meias repetições — desça o calcanhar completamente e eleve completamente.', 'guilherme'),

('elevacao-calcanhar-step', 'Elevação de Calcanhar no Step', 'panturrilha', 'cardio', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['step','degrau'],
 'Posicione as pontas dos pés na borda de um step ou degrau, com os calcanhares no ar. Desça os calcanhares abaixo da plataforma para obter um alongamento completo, depois eleve o mais alto possível. Essa amplitude aumentada maximiza o ganho de força e tamanho.',
 'O alongamento na parte baixa é importante — não faça apenas a metade superior do movimento.', 'carlos'),

-- ── CORE ───────────────────────────────────────────────────
('prancha-frente', 'Prancha Frontal', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Apoie os antebraços no chão com os cotovelos sob os ombros. Estenda as pernas e apoie nas pontas dos pés. Mantenha o corpo em linha reta — sem quadril elevado ou caído. Respire de forma constante e contraia o abdômen durante todo o tempo.',
 'Não deixe o quadril subir formando um triângulo — isso tira a tensão do core e facilita demais.', 'guilherme'),

('prancha-lateral', 'Prancha Lateral', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deite de lado e apoie o antebraço com o cotovelo sob o ombro. Eleve o quadril até o corpo formar uma linha diagonal reta. Mantenha essa posição respirando normalmente. Trabalha principalmente o oblíquo e o quadrado lombar.',
 'Não deixe o quadril cair — se cair, reduza o tempo ou passe para a versão com joelhos no chão.', 'carlos'),

('abdominal-supra', 'Abdominal Supra (Crunch)', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas com joelhos dobrados, coloque as mãos atrás da cabeça sem puxar o pescoço. Eleve apenas as escápulas do chão contraindo o reto abdominal, não é uma abdominada completa. Desça lentamente sem deitar completamente antes da próxima repetição.',
 'Não puxe o pescoço com as mãos — as mãos apenas apoiam, o esforço deve vir do abdômen.', 'guilherme'),

('abdominal-infra', 'Elevação de Pernas', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas com os braços ao lado do corpo, eleve as pernas até formarem 90 graus com o tronco. Desça controladamente sem deixar os pés tocarem o chão entre as repetições. Mantenha a lombar em contato com o chão durante todo o movimento.',
 'Não deixe a lombar arquear ao abaixar as pernas — se isso acontecer, reduza a amplitude.', 'carlos'),

('mountain-climber', 'Mountain Climber', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em posição de prancha com os braços estendidos, traga alternadamente os joelhos em direção ao peito em ritmo controlado. Mantenha o quadril estável — ele não deve subir ou balançar. O core trabalha para estabilizar enquanto as pernas se movem.',
 'Não levante o quadril para facilitar — mantenha-o alinhado com os ombros e os calcanhares.', 'guilherme'),

('russian-twist', 'Russian Twist', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Sentado com os pés levemente elevados do chão e o tronco inclinado a 45 graus, gire o tronco de um lado para o outro, tocando o chão com as mãos ou o haltere. Mantenha as pernas imóveis — a rotação vem do tronco, não das pernas.',
 'Não gire só com os braços — a rotação deve envolver todo o tronco para trabalhar os oblíquos.', 'carlos'),

('dead-bug', 'Dead Bug', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas, eleve os braços perpendiculares ao chão e as pernas a 90 graus (mesa). Abaixe simultaneamente o braço direito acima da cabeça e a perna esquerda até quase tocar o chão. Retorne e repita no outro lado. Mantenha a lombar colada no chão.',
 'Não deixe a lombar sair do chão — é o sinal de que o core perdeu o controle. Reduza a amplitude se isso acontecer.', 'guilherme'),

('bird-dog', 'Bird Dog', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em quatro apoios, estenda simultaneamente o braço direito à frente e a perna esquerda para trás, mantendo o quadril nivelado. Segure 2-3 segundos e troque de lado. O desafio é manter o equilíbrio sem deixar o quadril ou o tronco rodarem.',
 'Não eleve a perna além da altura do quadril — acima disso começa a lombose e o exercício perde o foco.', 'carlos'),

('hollow-hold', 'Hollow Hold', 'core', 'core', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas, contraia fortemente o abdômen pressionando a lombar no chão. Eleve levemente os ombros e as pernas criando uma posição côncava no corpo. Mantenha essa posição com respiração constante. É um dos exercícios mais eficazes para o core profundo.',
 'Se a lombar sair do chão, levante mais as pernas ou flexione os joelhos para facilitar.', 'guilherme'),

('crunch-bicicleta', 'Crunch Bicicleta', 'core', 'core', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Deitado de costas, com as mãos atrás da cabeça, eleve as escápulas e as pernas levemente. Traga o joelho esquerdo em direção ao cotovelo direito enquanto estende a perna direita. Alterne de forma controlada e fluida, como pedalando.',
 'Não puxe o pescoço com os cotovelos — gire o tronco de verdade para fazer os oblíquos trabalharem.', 'carlos'),

('rollout-joelhos', 'Rollout com Haltere ou Roda', 'core', 'core', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Ajoelhado no chão, segure um haltere deitado horizontalmente ou uma roda de abdômen. Role para frente estendendo os braços à frente do corpo, mantendo o core contraído e a lombar neutra. Puxe de volta usando o abdômen, sem usar os quadris para subir.',
 'Não deixe a lombar cair em hiperlordose ao ir para frente — o core deve manter a coluna neutra.', 'guilherme'),

-- ── FULL BODY ──────────────────────────────────────────────
('burpee', 'Burpee', 'full_body', 'cardio', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em pé, agache e apoie as mãos no chão. Salte os pés para trás até a posição de flexão. Faça uma flexão, salte os pés de volta para as mãos e salte verticalmente com os braços acima da cabeça. Encadeie os movimentos com fluidez.',
 'Não pule os passos para ganhar velocidade — qualidade e amplitude completa importam mais que velocidade.', 'guilherme'),

('thruster-halteres', 'Thruster com Halteres', 'full_body', 'push', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Segure os halteres nos ombros. Faça um agachamento completo e, ao subir, use o impulso da subida para empurrar os halteres acima da cabeça. É uma combinação fluida de agachamento frontal e desenvolvimento. Desça os halteres enquanto faz o próximo agachamento.',
 'O momento da saída do agachamento é onde você transfere a energia — não pare no meio para então empurrar.', 'carlos'),

('clean-haltere', 'Clean com Haltere', 'full_body', 'hinge', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com um haltere entre os pés, execute um levantamento explosivo puxando o haltere para o ombro em um único movimento fluido — extensão de quadril, puxada e rotação do pulso. Receba o haltere com o cotovelo alto. Abaixe controladamente e repita.',
 'Aprenda o movimento em partes (terra + puxada + recepção) antes de encadear de forma explosiva.', 'guilherme'),

('swing-haltere', 'Kettlebell Swing com Haltere', 'full_body', 'hinge', 'intermediario',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com o haltere em uma ou duas mãos, incline o tronco em bisagra e balance o haltere entre as pernas. Use uma extensão explosiva do quadril — não os braços — para projetar o haltere até a altura dos ombros. Controle a descida e repita o balanço.',
 'O movimento é de bisagra (quadril), não de agachamento — os joelhos dobram pouco, o quadril abre tudo.', 'carlos'),

('man-maker', 'Man Maker com Halteres', 'full_body', 'push', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Com halteres no chão, execute: flexão + remada direita + remada esquerda + salto dos pés para as mãos + clean + thruster (agacha + desenvolvimento). Cada repetição é uma sequência completa. Exercício altamente metabólico e funcional.',
 'Comece devagar para aprender a sequência de movimentos antes de aumentar o ritmo ou a carga.', 'guilherme'),

('complexo-halteres', 'Complexo com Halteres (6x6)', 'full_body', 'pull', 'avancado',
 ARRAY['academia','condominio','hotel'], ARRAY['halteres'],
 'Execute 6 exercícios em sequência sem largar os halteres: remada curvada → stiff → agachamento frontal → desenvolvimento → avanço → rosca. Faça 6 repetições de cada sem descanso. O complexo desenvolve condicionamento e força simultaneamente.',
 'Use um peso que permita completar todos os 6 exercícios — o exercício mais fraco define o peso total.', 'carlos'),

-- ── MOBILIDADE ─────────────────────────────────────────────
('hip-90-90', 'Hip 90/90 (Mobilidade de Quadril)', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Sente no chão com ambas as pernas formando ângulos de 90 graus — uma perna à frente e outra atrás. Mantenha o tronco ereto e sinta o alongamento no quadril. Rotacione o tronco levemente sobre a perna da frente. Troque os lados após o tempo estipulado.',
 'Não force a posição se o quadril não permitir — use as mãos para apoio e progrida gradualmente.', 'guilherme'),

('worlds-greatest-stretch', 'World''s Greatest Stretch', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Partindo do avanço, coloque a mão do lado da perna da frente no chão, dentro do pé. Com a outra mão, alcance o teto rodando o tronco. Volte e repita do outro lado. Esse exercício mobiliza o quadril, a coluna torácica e os ombros em um único movimento.',
 'Faça o movimento devagar e com controle — não é um exercício de velocidade.', 'carlos'),

('cat-cow', 'Cat-Cow (Coluna)', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em quatro apoios, alterne entre arquear completamente a coluna para baixo com cabeça erguida (vaca) e arredondar completamente para cima com cabeça abaixada (gato). Sincronize com a respiração: inspire na vaca, expire no gato. Execute devagar e com amplitude total.',
 'Não faça o movimento pela metade — busque a amplitude máxima em ambas as direções.', 'guilherme'),

('ankle-mobility', 'Mobilidade de Tornozelo', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Apoie o pé em frente a uma parede com os dedos a 5 cm dela. Empurre o joelho em direção à parede mantendo o calcanhar no chão. Se o joelho tocar a parede, afaste mais o pé. Isso melhora a dorsiflexão do tornozelo, essencial para o agachamento.',
 'Não deixe o calcanhar sair do chão — é o critério principal do exercício.', 'carlos'),

('thoracic-rotation', 'Rotação Torácica em Quatro Apoios', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Em quatro apoios, coloque uma mão atrás da cabeça. Rode o tronco levando o cotovelo em direção ao chão e depois para o teto. Mantenha o quadril estático — apenas a coluna torácica rotaciona. Repita de cada lado.',
 'Mantenha o quadril parado — se ele começar a girar, a mobilidade já passou da coluna torácica.', 'guilherme'),

('pigeon-pose', 'Pigeon Pose (Abertura de Quadril)', 'mobilidade', 'mobilidade', 'iniciante',
 ARRAY['academia','condominio','hotel'], ARRAY[]::TEXT[],
 'Do quadrúpede, leve um joelho para frente entre as mãos, com a perna atrás esticada. Incline levemente o tronco para frente sobre a perna da frente para intensificar o alongamento no piriforme e no glúteo. Segure por 30-60 segundos e troque de lado.',
 'Use um towel dobrado sob o quadril se o chão estiver longe demais — a posição deve ser confortável para ser mantida.', 'carlos');
