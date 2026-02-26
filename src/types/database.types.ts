// Este arquivo é gerado automaticamente pelo Supabase CLI.
// Comando: npm run db:types
// NÃO editar manualmente.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TrainingLevel = 'adaptacao' | 'iniciante' | 'intermediario' | 'avancado' | 'pro'
export type TrainingLocation = 'condominio' | 'academia'
export type TrainingObjective = 'perda_peso' | 'ganho_massa' | 'qualidade_vida'
export type TrainingPreference = 'isolados' | 'grupos_musculares' | 'superior_inferior'
export type WorkoutStatus = 'gerado' | 'executado' | 'cancelado'
export type SubscriptionPlan = 'mensal' | 'anual'
export type SubscriptionStatus = 'ativa' | 'vencida' | 'cancelada'

// Placeholder — será substituído pelos tipos gerados após criar as tabelas no Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          nome: string | null
          peso: number | null
          idade: number | null
          altura: number | null
          tempo_sem_treinar: string | null
          doenca_cardiaca: boolean
          lesao_cronica: boolean
          lesao_descricao: string | null
          medicamento_controlado: boolean
          objetivo: TrainingObjective | null
          dias_por_semana: number | null
          preferencia_treino: TrainingPreference | null
          nivel_atual: TrainingLevel
          local_treino: TrainingLocation | null
          onboarding_completo: boolean
          onboarding_etapa: string
          criado_em: string
          atualizado_em: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'criado_em' | 'atualizado_em'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
