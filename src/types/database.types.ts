export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          codigo: string
          criterio_extra: string | null
          criterio_tipo: string
          criterio_valor: number | null
          descricao: string | null
          icone_emoji: string | null
          id: string
          nome: string
        }
        Insert: {
          codigo: string
          criterio_extra?: string | null
          criterio_tipo: string
          criterio_valor?: number | null
          descricao?: string | null
          icone_emoji?: string | null
          id?: string
          nome: string
        }
        Update: {
          codigo?: string
          criterio_extra?: string | null
          criterio_tipo?: string
          criterio_valor?: number | null
          descricao?: string | null
          icone_emoji?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      equipment_catalog: {
        Row: {
          ativo: boolean
          categoria: string
          id: string
          imagem_url: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          id?: string
          imagem_url?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          id?: string
          imagem_url?: string | null
          nome?: string
        }
        Relationships: []
      }
      exercise_catalog: {
        Row: {
          id: string
          slug: string
          nome: string
          grupo_muscular: string
          padrao_movimento: string
          nivel_grupo: string
          locais: string[]
          equipamentos: string[] | null
          instrucoes: string
          erros_comuns: string | null
          youtube_url: string | null
          validado_por: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          slug: string
          nome: string
          grupo_muscular: string
          padrao_movimento: string
          nivel_grupo?: string
          locais?: string[]
          equipamentos?: string[] | null
          instrucoes: string
          erros_comuns?: string | null
          youtube_url?: string | null
          validado_por?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          slug?: string
          nome?: string
          grupo_muscular?: string
          padrao_movimento?: string
          nivel_grupo?: string
          locais?: string[]
          equipamentos?: string[] | null
          instrucoes?: string
          erros_comuns?: string | null
          youtube_url?: string | null
          validado_por?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          ativo: boolean
          contraindicacoes: string[] | null
          equipamentos_necessarios: string[] | null
          grupo_muscular: string[]
          id: string
          imagem_url: string | null
          instrucoes: string | null
          nivel_minimo: string
          nome: string
          youtube_url: string | null
        }
        Insert: {
          ativo?: boolean
          contraindicacoes?: string[] | null
          equipamentos_necessarios?: string[] | null
          grupo_muscular?: string[]
          id?: string
          imagem_url?: string | null
          instrucoes?: string | null
          nivel_minimo?: string
          nome: string
          youtube_url?: string | null
        }
        Update: {
          ativo?: boolean
          contraindicacoes?: string[] | null
          equipamentos_necessarios?: string[] | null
          grupo_muscular?: string[]
          id?: string
          imagem_url?: string | null
          instrucoes?: string | null
          nivel_minimo?: string
          nome?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          ativo: boolean
          criado_em: string
          dias_treino: number[] | null
          endpoint: string
          horario_lembrete: string | null
          id: string
          keys: Json
          user_id: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          dias_treino?: number[] | null
          endpoint: string
          horario_lembrete?: string | null
          id?: string
          keys: Json
          user_id: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          dias_treino?: number[] | null
          endpoint?: string
          horario_lembrete?: string | null
          id?: string
          keys?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          atualizado_em: string
          criado_em: string
          fim: string
          id: string
          inicio: string
          plano: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          fim: string
          id?: string
          inicio: string
          plano: string
          status: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          fim?: string
          id?: string
          inicio?: string
          plano?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          desbloqueado_em: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          desbloqueado_em?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          desbloqueado_em?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipment: {
        Row: {
          criado_em: string
          equipment_id: string | null
          foto_url: string | null
          id: string
          nome_custom: string | null
          user_id: string
        }
        Insert: {
          criado_em?: string
          equipment_id?: string | null
          foto_url?: string | null
          id?: string
          nome_custom?: string | null
          user_id: string
        }
        Update: {
          criado_em?: string
          equipment_id?: string | null
          foto_url?: string | null
          id?: string
          nome_custom?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      jejum_sessions: {
        Row: {
          id: string
          user_id: string
          inicio: string
          fim: string
          duracao_horas: number | null
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          inicio: string
          fim: string
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          inicio?: string
          fim?: string
          criado_em?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          altura: number | null
          atualizado_em: string
          condominio_cep: string | null
          condominio_fotos: string[] | null
          condominio_nome: string | null
          criado_em: string
          dias_por_semana: number | null
          doenca_cardiaca: boolean
          id: string
          idade: number | null
          jejum_inicio: string | null
          lesao_cronica: boolean
          lesao_descricao: string | null
          local_treino: string | null
          medicamento_controlado: boolean
          nivel_atual: string
          nome: string | null
          objetivo: string | null
          onboarding_completo: boolean
          onboarding_etapa: string
          personal_slug: string | null
          peso: number | null
          preferencia_treino: string | null
          sexo: string | null
          telefone: string | null
          tempo_sem_treinar: string | null
        }
        Insert: {
          altura?: number | null
          atualizado_em?: string
          condominio_cep?: string | null
          condominio_fotos?: string[] | null
          condominio_nome?: string | null
          criado_em?: string
          dias_por_semana?: number | null
          doenca_cardiaca?: boolean
          id: string
          idade?: number | null
          jejum_inicio?: string | null
          lesao_cronica?: boolean
          lesao_descricao?: string | null
          local_treino?: string | null
          medicamento_controlado?: boolean
          nivel_atual?: string
          nome?: string | null
          objetivo?: string | null
          onboarding_completo?: boolean
          onboarding_etapa?: string
          personal_slug?: string | null
          peso?: number | null
          preferencia_treino?: string | null
          sexo?: string | null
          telefone?: string | null
          tempo_sem_treinar?: string | null
        }
        Update: {
          altura?: number | null
          atualizado_em?: string
          condominio_cep?: string | null
          condominio_fotos?: string[] | null
          condominio_nome?: string | null
          criado_em?: string
          dias_por_semana?: number | null
          doenca_cardiaca?: boolean
          id?: string
          idade?: number | null
          jejum_inicio?: string | null
          lesao_cronica?: boolean
          lesao_descricao?: string | null
          local_treino?: string | null
          medicamento_controlado?: boolean
          nivel_atual?: string
          nome?: string | null
          objetivo?: string | null
          onboarding_completo?: boolean
          onboarding_etapa?: string
          personal_slug?: string | null
          peso?: number | null
          preferencia_treino?: string | null
          sexo?: string | null
          telefone?: string | null
          tempo_sem_treinar?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          atualizado_em: string
          id: string
          lets_coins: number
          streak_atual: number
          streak_maximo: number
          treinos_nivel_atual: number
          treinos_totais: number
          ultimo_treino: string | null
        }
        Insert: {
          atualizado_em?: string
          id: string
          lets_coins?: number
          streak_atual?: number
          streak_maximo?: number
          treinos_nivel_atual?: number
          treinos_totais?: number
          ultimo_treino?: string | null
        }
        Update: {
          atualizado_em?: string
          id?: string
          lets_coins?: number
          streak_atual?: number
          streak_maximo?: number
          treinos_nivel_atual?: number
          treinos_totais?: number
          ultimo_treino?: string | null
        }
        Relationships: []
      }
      lets_coins_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          tipo: string
          descricao: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          tipo: string
          descricao?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          tipo?: string
          descricao?: string | null
          criado_em?: string
        }
        Relationships: []
      }
      lets_coins_resgates: {
        Row: {
          id: string
          user_id: string
          coins_gastos: number
          valor_brl: number
          codigo: string
          status: string
          criado_em: string
          usado_em: string | null
        }
        Insert: {
          id?: string
          user_id: string
          coins_gastos: number
          valor_brl: number
          codigo: string
          status?: string
          criado_em?: string
          usado_em?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          coins_gastos?: number
          valor_brl?: number
          codigo?: string
          status?: string
          criado_em?: string
          usado_em?: string | null
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          id: string
          user_id: string
          nome_plano: string
          nivel: string
          objetivo: string
          local_treino: string
          equipamentos: string[]
          status: string
          total_dias: number
          criado_em: string
          valido_ate: string
        }
        Insert: {
          id?: string
          user_id: string
          nome_plano?: string
          nivel: string
          objetivo: string
          local_treino: string
          equipamentos?: string[]
          status?: string
          total_dias?: number
          criado_em?: string
          valido_ate: string
        }
        Update: {
          id?: string
          user_id?: string
          nome_plano?: string
          nivel?: string
          objetivo?: string
          local_treino?: string
          equipamentos?: string[]
          status?: string
          total_dias?: number
          criado_em?: string
          valido_ate?: string
        }
        Relationships: []
      }
      plan_workouts: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          dia_numero: number
          workout_json: Json
          executado: boolean
          workout_id: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          dia_numero: number
          workout_json: Json
          executado?: boolean
          workout_id?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          dia_numero?: number
          workout_json?: Json
          executado?: boolean
          workout_id?: string | null
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo: string
          items: Json
          calorias_total: number
          proteina_total: number
          carbo_total: number
          gordura_total: number
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          tipo: string
          items?: Json
          calorias_total?: number
          proteina_total?: number
          carbo_total?: number
          gordura_total?: number
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          tipo?: string
          items?: Json
          calorias_total?: number
          proteina_total?: number
          carbo_total?: number
          gordura_total?: number
          criado_em?: string
        }
        Relationships: []
      }
      workout_evaluations: {
        Row: {
          comentario: string | null
          criado_em: string
          feedback_rapido: string | null
          id: string
          rating: number | null
          user_id: string
          workout_id: string
        }
        Insert: {
          comentario?: string | null
          criado_em?: string
          feedback_rapido?: string | null
          id?: string
          rating?: number | null
          user_id: string
          workout_id: string
        }
        Update: {
          comentario?: string | null
          criado_em?: string
          feedback_rapido?: string | null
          id?: string
          rating?: number | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_evaluations_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calorias_reais: number | null
          checkin_disposicao: number | null
          checkin_tempo_disponivel: number | null
          checkin_ultima_refeicao: string | null
          criado_em: string
          data: string
          duracao_estimada: number | null
          executado_em: string | null
          exercicios: Json
          fc_maxima: number | null
          fc_media: number | null
          id: string
          local_treino: string
          nivel: string
          origem_bio: string | null
          peso_treino: number | null
          status: string
          user_id: string
        }
        Insert: {
          calorias_reais?: number | null
          checkin_disposicao?: number | null
          checkin_tempo_disponivel?: number | null
          checkin_ultima_refeicao?: string | null
          criado_em?: string
          data: string
          duracao_estimada?: number | null
          executado_em?: string | null
          exercicios?: Json
          fc_maxima?: number | null
          fc_media?: number | null
          id?: string
          local_treino: string
          nivel: string
          origem_bio?: string | null
          peso_treino?: number | null
          status?: string
          user_id: string
        }
        Update: {
          calorias_reais?: number | null
          checkin_disposicao?: number | null
          checkin_tempo_disponivel?: number | null
          checkin_ultima_refeicao?: string | null
          criado_em?: string
          data?: string
          duracao_estimada?: number | null
          executado_em?: string | null
          exercicios?: Json
          fc_maxima?: number | null
          fc_media?: number | null
          id?: string
          local_treino?: string
          nivel?: string
          origem_bio?: string | null
          peso_treino?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Custom app types
export type TrainingLevel =
  | 'adaptacao'
  | 'iniciante_bronze' | 'iniciante_prata' | 'iniciante_ouro'
  | 'intermediario_bronze' | 'intermediario_prata' | 'intermediario_ouro'
  | 'avancado_bronze' | 'avancado_prata' | 'avancado_ouro'
  | 'atleta_bronze' | 'atleta_prata' | 'atleta_ouro'
  | 'atleta_pro' | 'atleta_pro_max'
export type TrainingLocation = 'condominio' | 'hotel'
export type TrainingObjective = 'perda_peso' | 'ganho_massa' | 'qualidade_vida'
export type TrainingPreference = 'isolados' | 'grupos_musculares' | 'superior_inferior'
export type WorkoutStatus = 'gerado' | 'executado' | 'cancelado'
export type SubscriptionPlan = 'mensal' | 'anual'
export type SubscriptionStatus = 'ativa' | 'vencida' | 'cancelada'

