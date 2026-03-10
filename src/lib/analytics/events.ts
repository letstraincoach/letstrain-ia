/**
 * Eventos de analytics tipados para o funil de conversão do Lets Train.
 *
 * Uso:
 *   import { track } from '@/lib/analytics/events'
 *   track('signup_completed', { method: 'email' })
 */

import posthog from 'posthog-js'

export type TrackEvent =
  // ── Aquisição ─────────────────────────────────────────────────────────────
  | { event: 'cta_clicked';              props: { location: 'hero' | 'pricing' | 'features' | 'final' } }
  | { event: 'signup_started';           props: { method: 'email' | 'google' } }
  | { event: 'signup_completed';         props: { method: 'email' | 'google' } }

  // ── Ativação (onboarding) ─────────────────────────────────────────────────
  | { event: 'onboarding_quiz_done';     props: { objetivo: string; nivel: string } }
  | { event: 'onboarding_location_set';  props: { local: string } }
  | { event: 'onboarding_personal_chosen'; props: { personal: string } }
  | { event: 'onboarding_completed';     props: Record<string, never> }

  // ── Retenção (produto) ────────────────────────────────────────────────────
  | { event: 'workout_generated';        props: { local: string; nivel: string } }
  | { event: 'workout_started';          props: Record<string, never> }
  | { event: 'workout_completed';        props: { duracao_min: number } }
  | { event: 'workout_evaluated';        props: { nota: number } }

  // ── Monetização ──────────────────────────────────────────────────────────
  | { event: 'paywall_seen';             props: { trial_usado: boolean } }
  | { event: 'checkout_started';         props: { plan: 'mensal' | 'anual' } }
  | { event: 'subscription_started';     props: { plan: 'mensal' | 'anual'; trial: boolean } }
  | { event: 'subscription_cancelled';   props: Record<string, never> }

type EventName = TrackEvent['event']
type EventProps<E extends EventName> = Extract<TrackEvent, { event: E }>['props']

export function track<E extends EventName>(event: E, props: EventProps<E>): void {
  try {
    posthog.capture(event, props)
  } catch {
    // Silently ignore if PostHog not ready
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  try {
    posthog.identify(userId, traits)
  } catch {
    // Silently ignore
  }
}

export function resetUser(): void {
  try {
    posthog.reset()
  } catch {
    // Silently ignore
  }
}
