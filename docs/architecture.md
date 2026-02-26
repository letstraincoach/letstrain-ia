# Arquitetura Técnica — Lets Train

## Change Log
| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-02-26 | 1.0 | Versão inicial — MVP | Orion (AIOS) |

---

## 1. Visão Geral

Arquitetura full-stack monolítica serverless em monorepo Next.js, com Supabase como backend-as-a-service (banco de dados, autenticação, storage e edge functions). A IA é fornecida pela API da Anthropic (Claude). O produto é um PWA (Progressive Web App) web-first, mobile-first.

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO (Browser/PWA)                 │
│              Next.js 15 App Router (Vercel)              │
│         React + TypeScript + Tailwind CSS                │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────────┐
│              Next.js API Routes (Serverless)             │
│   /api/workout/generate  /api/equipment/detect          │
│   /api/webhooks/payment  /api/notifications/send        │
└──────┬──────────────┬─────────────────────┬─────────────┘
       │              │                     │
┌──────▼──────┐ ┌─────▼──────┐ ┌───────────▼──────────┐
│  Supabase   │ │ Claude API │ │   Mercado Pago API   │
│  DB + Auth  │ │ (Anthropic)│ │   (Pagamentos/PIX)   │
│  + Storage  │ └────────────┘ └──────────────────────┘
└─────────────┘
       │
┌──────▼──────────────────────────┐
│    Supabase Edge Functions      │
│  (Push Notifications Scheduler) │
└─────────────────────────────────┘
```

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Next.js | 15 (App Router) | Full-stack, SSR/SSG, API routes, excelente DX, deploy na Vercel |
| React | 19 | Componentes declarativos, ecossistema robusto |
| TypeScript | 5+ | Type safety, reduz bugs em produção |
| Tailwind CSS | 4 | Utility-first, mobile-first, fácil customização de design system |
| Framer Motion | 11 | Microanimações e transições (level up, conquistas, celebrações) |
| Zustand | 4 | State management leve (estado do treino em curso, check-in) |
| React Hook Form | 7 | Formulários performáticos com validação (anamnese, checkout) |
| Zod | 3 | Validação de schema compartilhada com o backend |

### Backend / Infraestrutura
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Supabase | Managed | PostgreSQL + Auth + Storage + Edge Functions em um serviço |
| Next.js API Routes | 15 | Serverless functions co-locadas com o frontend |
| Supabase Edge Functions | Deno | Agendamento de push notifications |

### Inteligência Artificial
| Tecnologia | Uso |
|---|---|
| Claude API (claude-sonnet-4-6) | Geração de treinos personalizados |
| Claude API com Vision | Detecção de equipamentos por foto |

### Pagamentos
| Tecnologia | Uso |
|---|---|
| Mercado Pago SDK | Cartão + PIX (suporte nativo ao mercado brasileiro) |

### Notificações
| Tecnologia | Uso |
|---|---|
| Web Push API | Push notifications no browser/PWA |
| next-pwa | Configuração do Service Worker |

### DevOps
| Tecnologia | Uso |
|---|---|
| Vercel | Deploy frontend + API routes (preview + produção) |
| GitHub Actions | CI/CD (lint, type-check, build em PRs) |
| Supabase CLI | Migrations de banco de dados versionadas |

---

## 3. Estrutura de Diretórios

```
lets-train/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo: login, cadastro, recuperar senha
│   │   ├── (onboarding)/             # Grupo: quiz, nível, local, equipamentos
│   │   ├── (app)/                    # Grupo: área autenticada
│   │   │   ├── dashboard/            # Home / Dashboard
│   │   │   ├── workout/              # Check-in + treino do dia
│   │   │   ├── progress/             # Progresso + histórico + conquistas
│   │   │   └── settings/             # Perfil + notificações + assinatura
│   │   ├── api/
│   │   │   ├── health/               # GET /api/health
│   │   │   ├── workout/
│   │   │   │   └── generate/         # POST /api/workout/generate
│   │   │   ├── equipment/
│   │   │   │   └── detect/           # POST /api/equipment/detect
│   │   │   ├── webhooks/
│   │   │   │   └── payment/          # POST /api/webhooks/payment
│   │   │   └── notifications/
│   │   │       └── subscribe/        # POST /api/notifications/subscribe
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # Design system base (Button, Card, Input...)
│   │   ├── workout/                  # WorkoutCard, ExerciseCard, CheckinForm...
│   │   ├── progress/                 # LevelBadge, StreakCounter, AchievementCard...
│   │   └── onboarding/               # AnamnesisStep, LevelReveal, EquipmentScanner...
│   ├── lib/
│   │   ├── supabase/                 # Client + server client + types gerados
│   │   ├── ai/
│   │   │   ├── workout-generator.ts  # Prompt engineering + chamada Claude API
│   │   │   └── equipment-detector.ts # Detecção de equipamentos por visão
│   │   ├── payments/
│   │   │   └── mercadopago.ts        # SDK + helpers
│   │   └── notifications/
│   │       └── web-push.ts           # Web Push helpers
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # Zustand stores
│   ├── types/                        # TypeScript types globais
│   └── utils/                        # Utilitários gerais
├── supabase/
│   ├── migrations/                   # SQL migrations versionadas
│   ├── functions/                    # Edge Functions (push scheduler)
│   └── seed.sql                      # Dados iniciais (catálogo de exercícios)
├── public/
│   ├── icons/                        # PWA icons
│   └── manifest.json                 # PWA manifest
├── docs/                             # Documentação do projeto
└── .github/workflows/                # CI/CD pipelines
```

---

## 4. Schema do Banco de Dados

```sql
-- Perfil do usuário
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT,
  peso DECIMAL(5,2),
  idade INTEGER,
  altura DECIMAL(5,2),
  tempo_sem_treinar TEXT, -- 'menos_6_meses' | '6_meses_a_1_ano' | 'mais_1_ano' | 'nunca'
  doenca_cardiaca BOOLEAN DEFAULT false,
  lesao_cronica BOOLEAN DEFAULT false,
  lesao_descricao TEXT,
  medicamento_controlado BOOLEAN DEFAULT false,
  objetivo TEXT, -- 'perda_peso' | 'ganho_massa' | 'qualidade_vida'
  dias_por_semana INTEGER, -- 2-6
  preferencia_treino TEXT, -- 'isolados' | 'grupos_musculares' | 'superior_inferior'
  nivel_atual TEXT DEFAULT 'adaptacao', -- 'adaptacao' | 'iniciante' | 'intermediario' | 'avancado' | 'pro'
  local_treino TEXT, -- 'condominio' | 'academia'
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo padrão de equipamentos
CREATE TABLE equipment_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT, -- 'pesos_livres' | 'maquinas' | 'cabos' | 'cardio' | 'funcionais'
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Equipamentos do usuário
CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment_catalog(id),
  nome_custom TEXT, -- para equipamentos não catalogados
  foto_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Banco de exercícios (seed pela Lets Train)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  grupo_muscular TEXT[],
  equipamentos_necessarios UUID[], -- refs equipment_catalog
  nivel_minimo TEXT,
  youtube_url TEXT,
  imagem_url TEXT,
  instrucoes TEXT,
  contraindicacoes TEXT[] -- lesões que contraindicam
);

-- Treinos gerados
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  nivel TEXT NOT NULL,
  local_treino TEXT NOT NULL,
  duracao_estimada INTEGER, -- em minutos
  checkin_ultima_refeicao TEXT,
  checkin_tempo_disponivel INTEGER,
  checkin_disposicao INTEGER, -- 1-10
  exercicios JSONB NOT NULL, -- array de exercícios com séries/reps
  status TEXT DEFAULT 'gerado', -- 'gerado' | 'executado' | 'cancelado'
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  executado_em TIMESTAMPTZ
);

-- Avaliações pós-treino
CREATE TABLE workout_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_rapido TEXT, -- 'muito_facil' | 'na_medida' | 'muito_dificil' | 'nao_gostei'
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso do usuário
CREATE TABLE user_progress (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  treinos_totais INTEGER DEFAULT 0,
  treinos_nivel_atual INTEGER DEFAULT 0,
  streak_atual INTEGER DEFAULT 0,
  streak_maximo INTEGER DEFAULT 0,
  ultimo_treino DATE,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Conquistas
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone_url TEXT,
  criterio_tipo TEXT, -- 'treinos_totais' | 'streak' | 'level_up' | etc
  criterio_valor INTEGER
);

-- Conquistas do usuário
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  desbloqueado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plano TEXT NOT NULL, -- 'mensal' | 'anual'
  status TEXT NOT NULL, -- 'ativa' | 'vencida' | 'cancelada'
  mp_subscription_id TEXT, -- ID no Mercado Pago
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  dias_treino INTEGER[], -- 0=dom, 1=seg, ..., 6=sab
  horario_lembrete TIME,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Arquitetura de IA

### 5.1 Geração de Treino

**Fluxo:**
```
POST /api/workout/generate
  → Busca perfil + equipamentos + histórico recente do usuário
  → Monta prompt estruturado
  → Chama Claude API (claude-sonnet-4-6)
  → Parse + validação do JSON retornado
  → Salva treino no banco
  → Retorna treino ao frontend
```

**Estrutura do Prompt:**
```
Sistema: Você é um personal trainer especialista na metodologia Time Efficient da Lets Train.
Gere treinos rápidos, objetivos e cientificamente embasados.
Responda APENAS em JSON válido no formato especificado.

Contexto do Usuário:
- Nível: {nivel}
- Objetivo: {objetivo}
- Dias por semana: {dias_semana}
- Preferência: {preferencia_treino}
- Lesões/contraindicações: {lesoes}
- Equipamentos disponíveis: {lista_equipamentos}

Check-in de Hoje:
- Última refeição: {ultima_refeicao}
- Tempo disponível: {tempo_disponivel} minutos
- Disposição: {disposicao}/10

Histórico recente (últimos 3 treinos): {historico}

Gere um treino seguindo as diretrizes Time Efficient para este usuário hoje.
```

**Schema de resposta esperado (Zod):**
```typescript
const WorkoutSchema = z.object({
  nome: z.string(),
  duracao_estimada: z.number(),
  aquecimento: z.array(ExerciseSchema),
  principal: z.array(ExerciseSchema),
  cooldown: z.array(ExerciseSchema),
})
```

**Otimização de custo:**
- Cache de treinos por perfil similar (hash de equipamentos + nível + objetivo) com TTL de 24h
- Treinos gerados em horário de pico podem ser pré-aquecidos em batch

### 5.2 Detecção de Equipamentos por Visão

**Fluxo:**
```
POST /api/equipment/detect
  → Recebe URLs das fotos (Supabase Storage)
  → Chama Claude API com Vision passando até 10 imagens
  → Retorna lista de equipamentos detectados com confiança
  → Frontend exibe para confirmação do usuário
```

**Prompt de detecção:**
```
Analise as imagens e identifique todos os equipamentos de academia visíveis.
Para cada equipamento, retorne o nome padrão e a categoria.
Responda apenas em JSON: { equipamentos: [{ nome, categoria, confianca }] }
```

---

## 6. Fluxo de Pagamento

```
Usuário seleciona plano
  → Frontend chama POST /api/payment/create-preference
  → Backend cria preferência no Mercado Pago
  → Frontend redireciona para checkout MP (cartão) ou exibe QR PIX
  → Mercado Pago chama POST /api/webhooks/payment
  → Backend valida assinatura do webhook
  → Backend cria/atualiza subscription no banco
  → Backend envia email de confirmação
  → Usuário redirecionado para home do app
```

---

## 7. Push Notifications

**Arquitetura:**
- Service Worker registrado pelo `next-pwa` no browser
- Usuário concede permissão → `PushManager.subscribe()` → endpoint salvo no banco
- Supabase Edge Function roda via cron job diário (ex: às 6h, 12h, 18h)
- Edge Function busca usuários com lembrete configurado para aquele horário
- Envia Web Push para cada endpoint ativo

---

## 8. Segurança

| Camada | Medida |
|---|---|
| **Banco de dados** | Row Level Security (RLS) em todas as tabelas |
| **API Routes** | Autenticação via Supabase JWT em todas as rotas protegidas |
| **Dados de saúde** | Armazenados criptografados, acesso restrito ao próprio usuário |
| **Webhooks** | Validação de assinatura HMAC do Mercado Pago |
| **LGPD** | Consentimento explícito para dados de saúde no onboarding, opção de exclusão de conta |
| **Input** | Validação com Zod em todas as API routes |
| **Imagens** | Upload direto para Supabase Storage com políticas de acesso privado |

---

## 9. Performance

| Métrica | Meta | Estratégia |
|---|---|---|
| Geração de treino | < 10s | Cache por perfil similar, streaming opcional |
| Carregamento inicial | < 3s (3G) | Next.js SSR + code splitting |
| Core Web Vitals | LCP < 2.5s | Imagens otimizadas, lazy loading |
| Banco de dados | < 100ms queries | Índices nas colunas de busca, connection pooling |

---

## 10. Decisões de Arquitetura

### ADR-001: Monorepo com Next.js em vez de backend separado
**Decisão**: Full-stack em um único repositório Next.js com API Routes serverless.
**Justificativa**: Equipe pequena, tempo de mercado rápido, zero infra própria a gerenciar. API routes da Vercel escalam automaticamente.

### ADR-002: Supabase como BaaS
**Decisão**: Supabase para banco, auth, storage e edge functions.
**Justificativa**: PostgreSQL real com RLS nativo, auth pronta com OAuth, storage integrado para fotos de equipamentos. Elimina necessidade de configurar Redis, S3, Cognito separadamente.

### ADR-003: Claude API para geração de treino
**Decisão**: Claude API (claude-sonnet-4-6) para geração de treinos.
**Justificativa**: Qualidade de raciocínio superior para seguir metodologia proprietária e adaptar ao contexto, suporte nativo a vision para detecção de equipamentos.

### ADR-004: Mercado Pago para pagamentos
**Decisão**: Mercado Pago em vez de Stripe.
**Justificativa**: Suporte nativo a PIX (requisito do produto), cartões brasileiros, checkout local em português. Stripe é superior em DX mas não tem PIX nativo.

### ADR-005: PWA em vez de app nativo no MVP
**Decisão**: Web PWA com push notifications.
**Justificativa**: Velocidade de desenvolvimento x10, sem custo de App Store, push notifications via Web Push API cobre o caso de uso. App nativo fica para fase 2 após validação do produto.

### ADR-006: Sem rastreamento de carga
**Decisão**: O sistema não registra a carga (peso) dos exercícios.
**Justificativa**: Sem presença do profissional, não é possível garantir execução segura. Usuário treina no peso que se sentir seguro. A progressão é por nível de dificuldade do treino, não por carga.
