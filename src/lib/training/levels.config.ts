import type { TrainingLevel } from '@/types/database.types'

export interface LevelConfig {
  label: string
  emoji: string
  cor: string
  corBg: string
  descricao: string
  proximo: TrainingLevel | null
  treinos_necessarios: number | null // treinos no nível atual para subir
  numero: number // 1–15
}

export const LEVEL_CONFIG: Record<TrainingLevel, LevelConfig> = {

  // ── Nível 1 — Adaptação (7 treinos) ───────────────────────────────────
  adaptacao: {
    label: 'Recruta',
    emoji: '🌱',
    cor: '#71717A',
    corBg: 'rgba(113,113,122,0.12)',
    descricao: 'Você está no começo da jornada. Vamos construir uma base sólida com treinos seguros, progressivos e focados em você aprender a se mover bem.',
    proximo: 'iniciante_bronze',
    treinos_necessarios: 7,
    numero: 1,
  },

  // ── Nível 2 — Iniciante Bronze (30 treinos) ───────────────────────────
  iniciante_bronze: {
    label: 'Aspirante',
    emoji: '🥉',
    cor: '#B45309',
    corBg: 'rgba(180,83,9,0.12)',
    descricao: 'Superou a adaptação! A rotina está se formando. Seu corpo começa a responder e a confiança cresce a cada sessão.',
    proximo: 'iniciante_prata',
    treinos_necessarios: 30,
    numero: 2,
  },

  // ── Nível 3 — Iniciante Prata (30 treinos) ────────────────────────────
  iniciante_prata: {
    label: 'Guerreiro',
    emoji: '🥈',
    cor: '#64748B',
    corBg: 'rgba(100,116,139,0.12)',
    descricao: 'A consistência já é sua marca. Os treinos ficam mais intensos e você já sente a diferença na força e resistência.',
    proximo: 'iniciante_ouro',
    treinos_necessarios: 30,
    numero: 3,
  },

  // ── Nível 4 — Iniciante Ouro (30 treinos) ────────────────────────────
  iniciante_ouro: {
    label: 'Forjado',
    emoji: '🥇',
    cor: '#CA8A04',
    corBg: 'rgba(202,138,4,0.12)',
    descricao: 'O ouro do Iniciante é seu! A base está sólida. Você está pronto para o próximo capítulo da sua evolução.',
    proximo: 'intermediario_bronze',
    treinos_necessarios: 30,
    numero: 4,
  },

  // ── Nível 5 — Intermediário Bronze (30 treinos) ───────────────────────
  intermediario_bronze: {
    label: 'Aguerrido',
    emoji: '🔥',
    cor: '#15803D',
    corBg: 'rgba(21,128,61,0.12)',
    descricao: 'Os treinos ficam sérios. Volume e intensidade sobem. Você não é mais um iniciante — é hora de se desafiar de verdade.',
    proximo: 'intermediario_prata',
    treinos_necessarios: 30,
    numero: 5,
  },

  // ── Nível 6 — Intermediário Prata (30 treinos) ────────────────────────
  intermediario_prata: {
    label: 'Combatente',
    emoji: '🔥',
    cor: '#16A34A',
    corBg: 'rgba(22,163,74,0.12)',
    descricao: 'Você está em boa forma. A técnica melhora e as cargas aumentam. Cada treino deixa você mais próximo do topo.',
    proximo: 'intermediario_ouro',
    treinos_necessarios: 30,
    numero: 6,
  },

  // ── Nível 7 — Intermediário Ouro (30 treinos) ────────────────────────
  intermediario_ouro: {
    label: 'Predador',
    emoji: '⚡',
    cor: '#22C55E',
    corBg: 'rgba(34,197,94,0.12)',
    descricao: 'Intermediário Ouro — impressionante evolução! Você domina os fundamentos e está pronto para o nível Avançado.',
    proximo: 'avancado_bronze',
    treinos_necessarios: 30,
    numero: 7,
  },

  // ── Nível 8 — Avançado Bronze (30 treinos) ───────────────────────────
  avancado_bronze: {
    label: 'Atleta',
    emoji: '💎',
    cor: '#6D28D9',
    corBg: 'rgba(109,40,217,0.12)',
    descricao: 'Poucos chegam até aqui. Os treinos são densos, técnicos e exigentes. Você está em outro patamar.',
    proximo: 'avancado_prata',
    treinos_necessarios: 30,
    numero: 8,
  },

  // ── Nível 9 — Avançado Prata (30 treinos) ────────────────────────────
  avancado_prata: {
    label: 'Capitão',
    emoji: '💎',
    cor: '#7C3AED',
    corBg: 'rgba(124,58,237,0.12)',
    descricao: 'Avançado Prata — você é uma referência de disciplina e comprometimento. A performance é o seu foco.',
    proximo: 'avancado_ouro',
    treinos_necessarios: 30,
    numero: 9,
  },

  // ── Nível 10 — Avançado Ouro (30 treinos) ────────────────────────────
  avancado_ouro: {
    label: 'Titã',
    emoji: '🔮',
    cor: '#8B5CF6',
    corBg: 'rgba(139,92,246,0.12)',
    descricao: 'O topo do Avançado. Treinos de alta performance para quem já domina o básico e vai além dos limites.',
    proximo: 'atleta_bronze',
    treinos_necessarios: 30,
    numero: 10,
  },

  // ── Nível 11 — Atleta Bronze (30 treinos) ────────────────────────────
  atleta_bronze: {
    label: 'Mestre',
    emoji: '🏅',
    cor: '#9A3412',
    corBg: 'rgba(154,52,18,0.12)',
    descricao: 'Bem-vindo ao nível Atleta. A elite começa aqui. Treinos de alta intensidade para quem fez do fitness um estilo de vida.',
    proximo: 'atleta_prata',
    treinos_necessarios: 30,
    numero: 11,
  },

  // ── Nível 12 — Atleta Prata (30 treinos) ─────────────────────────────
  atleta_prata: {
    label: 'Gladiador',
    emoji: '🏆',
    cor: '#EA580C',
    corBg: 'rgba(234,88,12,0.12)',
    descricao: 'Atleta Prata. Performance de alto nível. Você está entre os melhores usuários do Lets Train.',
    proximo: 'atleta_ouro',
    treinos_necessarios: 30,
    numero: 12,
  },

  // ── Nível 13 — Atleta Ouro (30 treinos) ──────────────────────────────
  atleta_ouro: {
    label: 'General',
    emoji: '🌟',
    cor: '#F97316',
    corBg: 'rgba(249,115,22,0.12)',
    descricao: 'Atleta Ouro — você é extraordinário. Sua dedicação inspira todos ao redor.',
    proximo: 'atleta_pro',
    treinos_necessarios: 30,
    numero: 13,
  },

  // ── Nível 14 — Atleta PRÓ (30 treinos) ───────────────────────────────
  atleta_pro: {
    label: 'Lendário',
    emoji: '👑',
    cor: '#BE185D',
    corBg: 'rgba(190,24,93,0.12)',
    descricao: 'PRÓ. Um dos melhores do Lets Train. Você transformou o exercício em identidade. O último degrau está à vista.',
    proximo: 'atleta_pro_max',
    treinos_necessarios: 30,
    numero: 14,
  },

  // ── Nível 15 — Atleta PRÓ MAX (topo máximo) ──────────────────────────
  atleta_pro_max: {
    label: 'Máximus',
    emoji: '🦅',
    cor: '#FF8C00',
    corBg: 'rgba(255,140,0,0.12)',
    descricao: 'PRÓ MAX — o nível máximo do Lets Train. Lendário. Pouquíssimos chegam aqui. Você redefiniu o que é possível.',
    proximo: null,
    treinos_necessarios: null,
    numero: 15,
  },
}

/** Lista ordenada de todos os níveis */
export const LEVEL_ORDER: TrainingLevel[] = [
  'adaptacao',
  'iniciante_bronze', 'iniciante_prata', 'iniciante_ouro',
  'intermediario_bronze', 'intermediario_prata', 'intermediario_ouro',
  'avancado_bronze', 'avancado_prata', 'avancado_ouro',
  'atleta_bronze', 'atleta_prata', 'atleta_ouro',
  'atleta_pro', 'atleta_pro_max',
]
