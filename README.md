# Lets Train

**Seu personal trainer no bolso.** Treinos diários personalizados por IA com metodologia real — para academia de condomínio e academia convencional.

> R$29,90/mês. Muito menos que um personal. Muito mais que um treino genérico.

---

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase** — Banco de dados, autenticação, storage
- **Claude API** (Anthropic) — Geração de treinos + detecção de equipamentos
- **Mercado Pago** — Pagamentos + PIX
- **Vercel** — Deploy

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)
- Conta na [Anthropic](https://console.anthropic.com) (Claude API)

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
# Edite .env.local com suas chaves
```

**3. Rode o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

**4. Health-check:**
```bash
curl http://localhost:3000/api/health
# → { "status": "ok", "app": "Lets Train", "timestamp": "..." }
```

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emit
npm run format       # Prettier em src/
npm run db:types     # Regenerar tipos TypeScript do Supabase
```

## Estrutura

```
src/
  app/
    (auth)/          # Login, cadastro, recuperar senha
    (onboarding)/    # Quiz, nível, local, equipamentos
    (app)/           # Área autenticada: dashboard, workout, progress, settings
    api/             # API Routes
    auth/callback/   # OAuth callback
  components/
    ui/              # Design system base
    workout/         # Componentes de treino
    onboarding/      # Componentes de onboarding
  lib/
    supabase/        # Clients browser e server
    ai/              # Geração de treinos + detecção de equipamentos
    payments/        # Mercado Pago
  stores/            # Zustand stores
  types/             # TypeScript types
docs/                # Documentação do produto (PRD, arquitetura, stories)
supabase/            # Migrations e seed do banco
```

## Documentação

- [Project Brief](docs/project-brief.md) — Visão, proposta de valor, modelo de negócio
- [PRD](docs/prd.md) — Requisitos, épicos e stories
- [Arquitetura](docs/architecture.md) — Stack, schema do banco, decisões técnicas
- [Stories](docs/stories/) — Stories de desenvolvimento prontas para o `@dev`

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (server) | Service role key (nunca expor no client) |
| `ANTHROPIC_API_KEY` | Sim | Chave da API Claude (Anthropic) |
| `MERCADOPAGO_ACCESS_TOKEN` | Épico 5 | Token do Mercado Pago |
| `MERCADOPAGO_WEBHOOK_SECRET` | Épico 5 | Secret para validar webhooks |
