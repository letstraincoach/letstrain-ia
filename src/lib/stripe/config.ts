import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANOS = {
  mensal: {
    id: 'letstrain_mensal',
    label: 'Lets Train Mensal',
    amount: 2990,       // centavos BRL
    duracao_dias: 31,
  },
  anual: {
    id: 'letstrain_anual',
    label: 'Lets Train Anual',
    amount: 24900,      // centavos BRL
    duracao_dias: 366,
  },
} as const

export type PlanoKey = keyof typeof PLANOS
