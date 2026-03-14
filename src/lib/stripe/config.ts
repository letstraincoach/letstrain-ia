import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANOS = {
  mensal: {
    id: 'letstrain_mensal',
    label: 'Lets Train Mensal',
    amount: 4990,       // centavos BRL — R$49,90
    duracao_dias: 31,
  },
  anual: {
    id: 'letstrain_anual',
    label: 'Lets Train Anual',
    amount: 39700,      // centavos BRL — R$397,00 (R$33,08/mês, -34%)
    duracao_dias: 366,
  },
} as const

export type PlanoKey = keyof typeof PLANOS
