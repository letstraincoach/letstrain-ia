export type TrainerSlug = 'guilherme' | 'carlos' | 'raul' | 'maicon'

export interface Trainer {
  slug: TrainerSlug
  nome: string
  cref: string
  estilo: string
  estiloDesc: string
  emoji: string
}

export const TRAINERS: Trainer[] = [
  {
    slug: 'guilherme',
    nome: 'Personal Guilherme',
    cref: 'CREF SC146532',
    estilo: 'Treino Intenso',
    estiloDesc: 'Alta intensidade, máxima superação. Para quem quer resultados rápidos e não tem medo de suor.',
    emoji: '🔥',
  },
  {
    slug: 'carlos',
    nome: 'Personal Carlos',
    cref: 'CREF SC151652',
    estilo: 'Pega Pesado',
    estiloDesc: 'Foco em força e hipertrofia. Treinos densos, carga progressiva e muito ganho muscular.',
    emoji: '💪',
  },
  {
    slug: 'raul',
    nome: 'Personal Raul',
    cref: 'CREF SC5666156',
    estilo: 'Mais Calmo',
    estiloDesc: 'Equilíbrio entre desempenho e bem-estar. Ideal para quem quer evoluir sem sacrificar a qualidade de vida.',
    emoji: '🎯',
  },
  {
    slug: 'maicon',
    nome: 'Personal Maicon',
    cref: 'CREF SC513252',
    estilo: 'Terceira Idade',
    estiloDesc: 'Especialista em treinos funcionais e de baixo impacto. Segurança, mobilidade e saúde em primeiro lugar.',
    emoji: '🌟',
  },
]

export const TRAINERS_MAP = Object.fromEntries(
  TRAINERS.map((t) => [t.slug, t])
) as Record<TrainerSlug, Trainer>

export const DEFAULT_TRAINER: TrainerSlug = 'guilherme'

export function getTrainer(slug: string | null | undefined): Trainer {
  return TRAINERS_MAP[slug as TrainerSlug] ?? TRAINERS_MAP[DEFAULT_TRAINER]
}
