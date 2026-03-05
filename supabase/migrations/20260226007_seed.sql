-- ============================================================
-- Seed: Catálogo de Equipamentos + Conquistas
-- ============================================================
-- Executar com: supabase db reset
-- ou manualmente via Dashboard SQL Editor

-- -------------------------------------------------------
-- Catálogo de Equipamentos (36 itens em 5 categorias)
-- -------------------------------------------------------
INSERT INTO public.equipment_catalog (nome, categoria) VALUES

  -- Pesos Livres (8 itens)
  ('Halter (par)',          'pesos_livres'),
  ('Halteres Fixos',        'pesos_livres'),
  ('Barra Olímpica',        'pesos_livres'),
  ('Barra EZ',              'pesos_livres'),
  ('Kettlebell',            'pesos_livres'),
  ('Anilhas',               'pesos_livres'),
  ('Barra W (Curl)',        'pesos_livres'),
  ('Disco de Peso',         'pesos_livres'),

  -- Máquinas (9 itens)
  ('Leg Press',             'maquinas'),
  ('Cadeira Extensora',     'maquinas'),
  ('Cadeira Flexora',       'maquinas'),
  ('Peck Deck',             'maquinas'),
  ('Pulley / Lat Pulldown', 'maquinas'),
  ('Smith Machine',         'maquinas'),
  ('Chest Press',           'maquinas'),
  ('Shoulder Press',        'maquinas'),
  ('Hack Squat',            'maquinas'),

  -- Cabos (4 itens)
  ('Cabo Crossover',        'cabos'),
  ('Cabo Baixo',            'cabos'),
  ('Cabo Alto',             'cabos'),
  ('Polia Dupla',           'cabos'),

  -- Cardio (5 itens)
  ('Esteira',               'cardio'),
  ('Bicicleta Ergométrica', 'cardio'),
  ('Elíptico',              'cardio'),
  ('Remo Ergométrico',      'cardio'),
  ('Corda de Pular',        'cardio'),

  -- Funcionais (10 itens)
  ('Colchonete',            'funcionais'),
  ('Bola Suíça',            'funcionais'),
  ('Elástico / Faixa',      'funcionais'),
  ('TRX / Fita de Suspensão','funcionais'),
  ('Step',                  'funcionais'),
  ('Cones',                 'funcionais'),
  ('Medicine Ball',         'funcionais'),
  ('Barra Fixa',            'funcionais'),
  ('Paralelas',             'funcionais'),
  ('Banco Regulável',       'funcionais');

-- -------------------------------------------------------
-- Conquistas / Badges (17 itens)
-- -------------------------------------------------------
INSERT INTO public.achievements (codigo, nome, descricao, icone_emoji, criterio_tipo, criterio_valor, criterio_extra) VALUES

  -- Treinos totais
  ('primeiro_passo',    'Primeiro Passo',    'Completou seu primeiro treino!',                       '🎯', 'treinos_totais', 1,   NULL),
  ('semana_1',          'Semana 1',          'Completou 7 treinos. A jornada começou.',              '📅', 'treinos_totais', 7,   NULL),
  ('dedicado',          'Dedicado',          '30 treinos concluídos. Parabéns pela dedicação!',      '💪', 'treinos_totais', 30,  NULL),
  ('centuriao',         'Centurião',         '100 treinos! Você é uma máquina.',                     '🏆', 'treinos_totais', 100, NULL),
  ('lendario',          'Lendário',          '300 treinos. Poucos chegam até aqui.',                 '👑', 'treinos_totais', 300, NULL),

  -- Streaks
  ('consistente',       'Consistente',       'Treinou 7 dias seguidos. Sem desculpa!',               '🔥', 'streak', 7,  NULL),
  ('imparavel',         'Imparável',         '30 dias seguidos. Você é diferente.',                  '⚡', 'streak', 30, NULL),

  -- Level Up
  ('nivel_iniciante',   'Nível Iniciante',   'Subiu para o nível Iniciante!',                        '🌱', 'level_up', NULL, 'iniciante'),
  ('nivel_intermediario','Nível Intermediário','Subiu para o nível Intermediário!',                   '🌿', 'level_up', NULL, 'intermediario'),
  ('nivel_avancado',    'Nível Avançado',    'Subiu para o nível Avançado. Impressionante!',         '🌳', 'level_up', NULL, 'avancado'),
  ('nivel_pro',         'Nível PRO',         'Chegou ao topo. PRO do Lets Train!',                   '🦅', 'level_up', NULL, 'pro'),

  -- Horário
  ('madrugador',        'Madrugador',        'Treinou antes das 7h. O dia é todo seu!',              '🌅', 'horario', NULL, 'antes_7h'),
  ('noturno',           'Noturno',           'Treinou após as 21h. A noite é sua academia.',         '🌙', 'horario', NULL, 'apos_21h'),

  -- Diversidade
  ('explorador',        'Explorador',        'Executou 10 exercícios diferentes.',                   '🗺️', 'diversidade', 10,  NULL),
  ('diversificado',     'Diversificado',     'Treinou 3 grupos musculares diferentes em uma semana.','🎨', 'diversidade', 3,   NULL),

  -- Avaliações
  ('avaliador',         'Avaliador',         'Avaliou 10 treinos. Feedback valioso!',                '⭐', 'avaliacoes', 10, NULL),
  ('critico',           'Crítico',           'Avaliou 50 treinos. Você nos ajuda a melhorar!',       '🔬', 'avaliacoes', 50, NULL);
