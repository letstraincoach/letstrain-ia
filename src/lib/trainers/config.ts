export type TrainerSlug = 'guilherme'

export interface Trainer {
  slug: TrainerSlug
  nome: string
  cref: string
  estilo: string
  estiloDesc: string
  icon: string
}

export const TRAINERS: Trainer[] = [
  {
    slug: 'guilherme',
    nome: 'Personal Guilherme',
    cref: 'CREF 011884-G/SC',
    estilo: 'Metodologia Time Efficient',
    estiloDesc: 'Mais de 15 anos transformando vidas. Treinos inteligentes e eficientes para resultados reais.',
    icon: 'fire',
  },
]

export const TRAINERS_MAP = Object.fromEntries(
  TRAINERS.map((t) => [t.slug, t])
) as Record<TrainerSlug, Trainer>

export const DEFAULT_TRAINER: TrainerSlug = 'guilherme'

export function getTrainer(slug: string | null | undefined): Trainer {
  return TRAINERS_MAP[slug as TrainerSlug] ?? TRAINERS_MAP[DEFAULT_TRAINER]
}
