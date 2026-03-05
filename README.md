# Lets Train

**Seu personal trainer no bolso.** Treinos diários personalizados por IA com metodologia real — para academia de condomínio e academia convencional.

> R$29,90/mês. Muito menos que um personal. Muito mais que um treino genérico.

---

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase** — Banco de dados, autenticação, Edge Functions
- **Claude API** (Anthropic) — Geração de treinos + detecção de equipamentos
- **Mercado Pago** — Pagamentos + PIX
- **Web Push / VAPID** — Push notifications nativas
- **Vercel** — Deploy

## Pré-requisitos

- Node.js 20+
- Supabase CLI (`npm i -g supabase`)
- Conta no [Supabase](https://supabase.com)
- Conta na [Anthropic](https://console.anthropic.com)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

---

## Setup Local

**1. Clone e instale as dependências:**
```bash
git clone <repo-url>
cd lets-train
npm install
```

**2. Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
# Edite .env.local com suas chaves (veja seção abaixo)
```

**3. Gere as chaves VAPID para Push Notifications:**
```bash
npx web-push generate-vapid-keys
# Copie NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY para .env.local
```

**4. Configure o banco de dados:**
```bash
# Login no Supabase
supabase login

# Link com seu projeto (pegue o Project Ref no dashboard do Supabase)
supabase link --project-ref <seu-project-ref>

# Aplique as migrations
supabase db push

# Popule exercícios e conquistas
supabase db execute --file supabase/seed.sql
```

**5. Deploy da Edge Function de push notifications:**
```bash
supabase functions deploy send-push-reminders --no-verify-jwt
```

Depois, configure o cron no dashboard do Supabase:
`Project → Edge Functions → send-push-reminders → Schedules → Add Schedule`
Expressão: `0 * * * *` (toda hora)

**6. Rode o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Deploy em Produção (Vercel)

**1. Configure as variáveis de ambiente no Vercel:**

No painel do Vercel → Project → Settings → Environment Variables, adicione todas as variáveis listadas abaixo.

**2. Configure o webhook do Mercado Pago:**

No [painel de desenvolvedores do MP](https://www.mercadopago.com.br/developers/panel):
- Webhooks → Adicionar webhook
- URL: `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
- Eventos: `payment`
- Copie o **secret** gerado para `MERCADOPAGO_WEBHOOK_SECRET`

**3. Atualize `NEXT_PUBLIC_APP_URL`** para a URL real da sua aplicação.

---

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emit
npm run format       # Prettier em src/
npm run db:types     # Regenerar tipos TypeScript do Supabase
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role key (nunca expor no client) |
| `ANTHROPIC_API_KEY` | Sim | Chave da API Claude (Anthropic) |
| `MERCADOPAGO_ACCESS_TOKEN` | Sim | Token do Mercado Pago (pagamentos) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Sim | Secret para validar webhooks do MP |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Sim | Chave pública VAPID (push notifications) |
| `VAPID_PRIVATE_KEY` | Sim | Chave privada VAPID (nunca expor no client) |
| `CRON_SECRET` | Sim | Secret para proteger `/api/push/send` |
| `NEXT_PUBLIC_APP_URL` | Sim | URL pública da aplicação (ex: https://letstrain.app) |
| `NODE_ENV` | Auto | `development` ou `production` |

---

## Estrutura

```
src/
  app/
    (auth)/          # Login, cadastro, recuperar senha, nova senha
    (onboarding)/    # Quiz, nível, local, equipamentos
    (app)/           # Área autenticada:
      dashboard/       # Home + progresso rápido
      workout/
        checkin/       # Check-in + detecção de equipamentos
        [id]/          # Tela do treino (exercícios)
        [id]/avaliacao/  # Avaliação pós-treino + level-up + conquistas
      progress/        # Histórico + conquistas
      settings/        # Perfil + push notifications + assinatura
      assinatura/      # Planos de assinatura
      assinatura/sucesso/   # Confirmação de pagamento
      assinatura/pendente/  # PIX aguardando pagamento
    api/             # Route Handlers
      equipment/detect/    # Detecção de equipamentos por IA
      workout/generate/    # Geração de treino por IA
      workout/[id]/complete/      # Marcar treino como executado
      workout/[id]/post-complete/ # Level-up + conquistas + push
      checkout/create/     # Criar preferência Mercado Pago
      webhooks/mercadopago/  # Webhook de pagamentos (idempotente)
      push/subscribe/      # Cadastrar/remover dispositivo push
      push/send/           # Envio manual (protegido por CRON_SECRET)
  components/
    ui/              # Design system base
    workout/         # Componentes de treino
    onboarding/      # Componentes de onboarding
    gamification/    # LevelUpScreen, AchievementBanner
    push/            # PushNotificationSetup
    settings/        # SignOutButton
  lib/
    supabase/        # Clients: browser, server, service role
    ai/              # Geração de treinos + detecção de equipamentos
    mp/              # Config Mercado Pago + planos
    push/            # sendPushToUser (VAPID)
    training/        # Level config + classifier
  stores/            # Zustand stores (onboarding)
  types/             # TypeScript types + database.types.ts
public/
  sw.js              # Service Worker (push + notificationclick)
  manifest.json      # PWA manifest
supabase/
  migrations/        # 6 migrations (schema completo)
  seed.sql           # Exercícios + conquistas (17 achievements)
  functions/
    send-push-reminders/  # Edge Function cron (envio horário)
```

---

## Documentação

- [Project Brief](docs/project-brief.md) — Visão, proposta de valor, modelo de negócio
- [PRD](docs/prd.md) — Requisitos, épicos e stories
- [Arquitetura](docs/architecture.md) — Stack, schema do banco, decisões técnicas
- [Stories](docs/stories/) — Histórico de implementação por story
