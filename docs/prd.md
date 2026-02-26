# Coach Lets Train IA — Product Requirements Document (PRD)

## Change Log
| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-02-26 | 1.0 | Versão inicial — MVP | Orion (AIOS) |

---

## 1. Goals e Contexto

### Goals
- Entregar treinos diários personalizados por IA com metodologia real (Lets Train Time Efficient) para usuários de academia de condomínio e academia convencional
- Democratizar o acesso a coaching de qualidade a R$29,90/mês (vs. R$800–2.000 de personal)
- Criar um sistema de progressão automático que mantém o usuário evoluindo sem necessidade de um profissional presencial
- Estabelecer o produto como referência em treinos para academias de condomínio no Brasil
- Testar e validar adesão por segmento (condomínio vs. academia) via tráfego pago

### Background Context
Coach Lets Train IA nasce da observação de duas dores que têm a mesma raiz: a ausência de orientação profissional de qualidade acessível. No condomínio, a academia fica vazia porque os moradores não sabem usar os equipamentos disponíveis. Na academia convencional, o aluno paga mensalidade mas treina sozinho com um treino genérico que nunca muda. Em ambos os casos, a falta de metodologia e progressão leva ao abandono.

A solução é um app que age como um personal trainer de bolso: coleta o perfil do usuário, mapeia os equipamentos disponíveis, entende o contexto do dia (tempo, energia, alimentação) e gera um treino personalizado seguindo a metodologia Time Efficient da Lets Train — treinos rápidos, objetivos e scientificamente embasados.

---

## 2. Requisitos Funcionais

- **FR1**: O sistema deve coletar anamnese completa (10 campos) durante o onboarding do usuário.
- **FR2**: A IA deve classificar o usuário em um dos 5 níveis de treino (Adaptação, Iniciante, Intermediário, Avançado, PRO) com base na anamnese.
- **FR3**: O usuário deve poder escolher seu local de treino: Academia de Condomínio ou Academia Convencional.
- **FR4**: Para academia de condomínio, o usuário deve poder enviar fotos dos aparelhos e a IA deve detectar e catalogar os equipamentos disponíveis.
- **FR5**: Para academia convencional, o sistema deve apresentar uma lista padrão de equipamentos, com opção de adicionar equipamentos customizados com foto.
- **FR6**: Antes de cada treino, o sistema deve realizar um check-in diário com 3 perguntas contextuais (última refeição, tempo disponível, disposição 1-10).
- **FR7**: A IA deve gerar um treino diário personalizado considerando: nível do usuário, local de treino, equipamentos disponíveis, objetivo, preferência de treino e check-in do dia.
- **FR8**: O treino gerado deve ser exibido em uma tela com arte visual, nome do exercício, séries, repetições e tempo de descanso.
- **FR9**: Cada exercício deve ter um botão que abre um vídeo no YouTube demonstrando a execução correta.
- **FR10**: O usuário deve poder avaliar o treino ao final (rating + feedback).
- **FR11**: O sistema deve rastrear automaticamente os treinos executados via sistema Scout.
- **FR12**: O sistema deve promover automaticamente o usuário ao próximo nível quando atingir o número de treinos exigido para o nível atual.
- **FR13**: O sistema deve ter um mecanismo de recompensas (badges, conquistas, streaks) para gamificação da progressão.
- **FR14**: O usuário deve ter acesso ao histórico completo de treinos realizados.
- **FR15**: O sistema deve enviar push notifications para lembrar o usuário de treinar nos dias configurados.
- **FR16**: O sistema deve suportar autenticação via email/senha e Google OAuth.
- **FR17**: O sistema deve suportar pagamento de assinatura mensal (R$29,90) e anual com desconto via PIX.
- **FR18**: O sistema deve bloquear acesso ao app após vencimento da assinatura, com tela de renovação.

## 3. Requisitos Não-Funcionais

- **NFR1**: O app deve ser web-first com design mobile-first (PWA), responsivo para todos os tamanhos de tela.
- **NFR2**: A geração do treino pela IA deve completar em no máximo 10 segundos.
- **NFR3**: O app deve funcionar em conexões 3G (tempo de carregamento < 5s na tela principal).
- **NFR4**: O sistema deve suportar até 10.000 usuários simultâneos no lançamento sem degradação.
- **NFR5**: Dados sensíveis do usuário (saúde, condições físicas) devem ser armazenados com criptografia.
- **NFR6**: O app deve seguir LGPD — consentimento explícito para coleta de dados de saúde.
- **NFR7**: Uptime mínimo de 99,5% (máximo ~3,5h de downtime/mês).
- **NFR8**: O sistema deve exibir aviso de segurança em exercícios de alto risco para usuários no nível Adaptação.
- **NFR9**: O custo de API por usuário ativo deve ser monitorado e mantido abaixo de R$1,50/mês.
- **NFR10**: O sistema de pagamento deve ser PCI-compliant via gateway terceiro.

---

## 4. UI/UX Vision

### Overall UX Vision
Interface clean, motivacional e gamificada. Sensação de ter um personal trainer no bolso — profissional mas acessível. Cada interação deve ser rápida (o usuário está indo treinar, não tem tempo para navegar). Dark mode como opção padrão para uso na academia (ambientes com luz baixa).

### Key Interaction Paradigms
- **Mobile-first, one-thumb friendly**: todas as ações principais alcançáveis com o polegar
- **Cards swipeable** para navegação entre exercícios do treino
- **Microanimações** de celebração ao completar um treino ou subir de nível
- **Check-in em 3 taps**: a interação diária deve ser ultrarrápida
- **Progressive disclosure**: mostrar só o que importa naquele momento

### Core Screens
1. **Splash / Onboarding** — apresentação do produto
2. **Quiz de Anamnese** — 10 perguntas passo a passo
3. **Resultado do Nível** — revelação do nível com animação
4. **Escolha do Local** — card selector (Condomínio / Academia)
5. **Setup de Equipamentos** — upload de fotos + confirmação da lista
6. **Home / Dashboard** — status do dia, streak, botão "Treinar Hoje"
7. **Check-in Diário** — 3 perguntas rápidas antes do treino
8. **Treino do Dia** — arte visual + lista de exercícios com séries/reps
9. **Detalhe do Exercício** — vídeo YouTube + instruções
10. **Avaliação Pós-Treino** — rating + feedback
11. **Progresso / Histórico** — nível atual, treinos completos, conquistas
12. **Perfil & Configurações** — dados pessoais, notificações, assinatura
13. **Pagamento / Assinatura** — planos, checkout

### Acessibilidade
WCAG AA

### Branding
Identidade visual da Lets Train — energética, moderna, focada em performance. Paleta escura com accent color vibrante (verde ou laranja energético). Tipografia sans-serif bold para nomes de exercícios.

### Plataforma Alvo
Web Responsivo (PWA) — mobile-first. App nativo na fase 2.

---

## 5. Premissas Técnicas

### Repositório
Monorepo (Next.js full-stack — frontend + API routes no mesmo repositório)

### Arquitetura de Serviço
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (email + Google OAuth)
- **Storage**: Supabase Storage (fotos de equipamentos)
- **IA — Geração de Treino**: Claude API (claude-sonnet-4-6)
- **IA — Detecção de Equipamentos**: Claude API com vision (análise de imagem)
- **Pagamentos**: Mercado Pago (suporte nativo a PIX + cartão brasileiro)
- **Push Notifications**: Web Push API (PWA) via Supabase Edge Functions
- **Vídeos**: Links YouTube (sem hospedagem própria)
- **Deploy**: Vercel (frontend + API routes) + Supabase (DB + storage + auth)
- **CI/CD**: GitHub Actions

### Testes
Unit + Integration para funções críticas (geração de treino, sistema de progressão, pagamentos)

### Premissas Adicionais
- Sem load tracking de carga — segurança do usuário é responsabilidade dele
- Banco de exercícios próprio criado pela equipe Lets Train (não dependência externa)
- Metodologia proprietária Lets Train Time Efficient (5 níveis, expansão para 7 na v2)
- Compliance LGPD obrigatório desde o MVP (dados de saúde)

---

## 6. Lista de Épicos

| # | Épico | Objetivo |
|---|---|---|
| 1 | **Fundação & Infraestrutura** | Configurar projeto, autenticação, banco de dados e deploy base |
| 2 | **Onboarding & Perfil** | Anamnese, definição de nível, escolha de local e mapeamento de equipamentos |
| 3 | **Motor de Treino com IA** | Check-in diário, geração e entrega do treino personalizado |
| 4 | **Progressão & Gamificação** | Scout, sistema de níveis, recompensas, histórico e avaliação |
| 5 | **Monetização & Assinatura** | Pagamento mensal/anual, controle de acesso por assinatura |
| 6 | **Push Notifications & Engajamento** | Lembretes de treino, notificações de conquistas |

---

## Epic 1 — Fundação & Infraestrutura

**Objetivo**: Estabelecer toda a base técnica do produto — projeto configurado, autenticação funcionando, banco de dados estruturado, deploy automático no ar. Ao final deste épico, o app deve estar acessível na web com uma tela de login funcional e uma rota de health-check.

### Story 1.1 — Setup do Projeto e Deploy Base
Como desenvolvedor,
Eu quero configurar o repositório Next.js com TypeScript, Tailwind, Supabase e CI/CD,
Para que a fundação técnica do produto esteja pronta para desenvolvimento.

**Critérios de Aceitação:**
1. Repositório Next.js 15 (App Router) criado com TypeScript e Tailwind CSS configurados
2. Supabase projeto criado com variáveis de ambiente configuradas no `.env.local`
3. Rota de health-check `/api/health` retornando `{ status: "ok", timestamp }` com status 200
4. Deploy automático na Vercel configurado (branch `main` → produção, `develop` → preview)
5. GitHub Actions com pipeline de lint + build em PRs
6. README com instruções de setup local

### Story 1.2 — Autenticação (Email + Google OAuth)
Como usuário,
Eu quero me cadastrar e fazer login com email/senha ou conta Google,
Para que eu possa acessar o app com segurança.

**Critérios de Aceitação:**
1. Tela de cadastro com email, senha e confirmação de senha
2. Tela de login com email/senha e botão "Entrar com Google"
3. Google OAuth configurado via Supabase Auth
4. Fluxo de recuperação de senha via email funcionando
5. Sessão persistida (usuário não precisa logar toda vez)
6. Redirecionamento para onboarding após primeiro cadastro
7. Redirecionamento para home após login de usuário já cadastrado
8. Validação de formulários com mensagens de erro claras

### Story 1.3 — Estrutura do Banco de Dados
Como sistema,
Eu quero ter o schema completo do banco de dados criado e documentado,
Para que todos os dados do produto sejam armazenados de forma consistente.

**Critérios de Aceitação:**
1. Tabela `users` com perfil completo (id, email, nome, foto, criado_em, atualizado_em)
2. Tabela `user_profiles` com dados da anamnese e nível atual
3. Tabela `training_locations` com tipo (condomínio/academia) e dados do local
4. Tabela `equipment` com catálogo padrão de equipamentos
5. Tabela `user_equipment` relacionando usuário + equipamentos disponíveis
6. Tabela `workouts` com treinos gerados (data, nível, local, exercícios em JSON, status)
7. Tabela `workout_evaluations` com avaliações pós-treino
8. Tabela `user_progress` com contador de treinos, nível, conquistas
9. Tabela `subscriptions` com status, plano, datas e dados do pagamento
10. Row Level Security (RLS) habilitado em todas as tabelas — usuário acessa apenas seus dados
11. Migrations versionadas via Supabase CLI

---

## Epic 2 — Onboarding & Perfil

**Objetivo**: Guiar o novo usuário por todo o processo de configuração inicial — coleta de anamnese, definição inteligente do nível de treino, escolha do local e mapeamento dos equipamentos disponíveis. Ao final, o usuário tem um perfil completo e está pronto para receber seu primeiro treino.

### Story 2.1 — Quiz de Anamnese
Como novo usuário,
Eu quero responder um quiz de saúde e objetivos passo a passo,
Para que o sistema entenda meu perfil e possa criar treinos adequados para mim.

**Critérios de Aceitação:**
1. Fluxo de 10 perguntas apresentadas uma por vez com barra de progresso
2. Perguntas: (1) Peso, (2) Idade, (3) Altura, (4) Tempo sem praticar atividade, (5) Doença cardíaca (sim/não), (6) Lesão crônica (sim/não + campo descritivo), (7) Medicamento controlado (sim/não), (8) Objetivo principal (Perda de Peso / Ganho de Massa / Qualidade de Vida), (9) Dias por semana disponíveis (2–6), (10) Preferência de treino (Isolados / Grupos Musculares / Superiores+Inferiores no mesmo dia)
3. Validação de cada campo antes de avançar
4. Botão "voltar" para corrigir respostas anteriores
5. Dados salvos no banco ao concluir
6. Usuário que já completou o onboarding não vê o quiz novamente

### Story 2.2 — Definição do Nível pela IA
Como usuário que completou a anamnese,
Eu quero que o sistema defina meu nível de treino automaticamente,
Para que meus treinos sejam adequados ao meu condicionamento atual.

**Critérios de Aceitação:**
1. Lógica de classificação aplicada após conclusão do quiz:
   - Adaptação: sedentário ou >6 meses sem treinar OU doença cardíaca OU lesão ativa
   - Iniciante: 3–6 meses de experiência, treino irregular
   - Intermediário: >6 meses de treino consistente
   - Avançado: >2 anos de treino consistente
   - PRO: atleta / >4 anos de treino de alta performance
2. Tela de revelação do nível com nome, descrição e animação motivacional
3. Nível salvo no perfil do usuário
4. Explicação de quantos treinos são necessários para evoluir ao próximo nível

### Story 2.3 — Escolha do Local de Treino
Como usuário,
Eu quero escolher se treino em academia de condomínio ou academia convencional,
Para que meus treinos sejam adaptados ao ambiente e equipamentos disponíveis.

**Critérios de Aceitação:**
1. Tela com dois cards visuais: "Academia de Condomínio" e "Academia Convencional"
2. Breve descrição de cada opção com ícone ilustrativo
3. Seleção salva no perfil e usada na geração de treinos
4. Usuário pode alterar o local de treino posteriormente em Configurações

### Story 2.4 — Mapeamento de Equipamentos (Academia de Condomínio)
Como usuário de academia de condomínio,
Eu quero fotografar os aparelhos disponíveis e ter a IA identificá-los automaticamente,
Para que meus treinos usem apenas o que está disponível na minha academia.

**Critérios de Aceitação:**
1. Tela de upload com instrução clara: "Tire fotos dos aparelhos da sua academia"
2. Suporte a múltiplos uploads (até 10 fotos)
3. Fotos enviadas para Supabase Storage
4. Claude API com vision analisa as fotos e retorna lista de equipamentos detectados
5. Usuário vê a lista detectada e pode confirmar, remover ou adicionar manualmente
6. Lista final de equipamentos salva em `user_equipment`
7. Fallback: se IA não detectar nada, mostrar lista manual para o usuário selecionar

### Story 2.5 — Mapeamento de Equipamentos (Academia Convencional)
Como usuário de academia convencional,
Eu quero selecionar de uma lista padrão os equipamentos que tenho acesso,
Para que o sistema saiba com o que posso treinar.

**Critérios de Aceitação:**
1. Lista padrão de equipamentos organizados por categoria (Pesos Livres, Máquinas, Cabos, Cardio, Funcionais)
2. Busca por nome de equipamento na lista
3. Seleção múltipla com visual de "check" nos selecionados
4. Opção de adicionar equipamento não listado com nome + foto opcional
5. Lista salva em `user_equipment`
6. Usuário pode editar a lista de equipamentos a qualquer momento

---

## Epic 3 — Motor de Treino com IA

**Objetivo**: Implementar o coração do produto — o sistema que gera treinos diários personalizados por IA. Inclui o check-in contextual antes do treino, a geração inteligente baseada em todos os dados do usuário e a entrega em uma tela intuitiva com art visual, exercícios detalhados e links para vídeos.

### Story 3.1 — Check-in Diário
Como usuário que vai treinar,
Eu quero responder 3 perguntas rápidas sobre meu momento atual,
Para que o treino gerado seja adequado para como estou hoje.

**Critérios de Aceitação:**
1. Tela de check-in apresentada ao clicar em "Treinar Hoje" na home
2. Pergunta 1: "Quando foi sua última refeição?" (opções: há menos de 1h / 1–2h atrás / mais de 2h atrás)
3. Pergunta 2: "Quanto tempo você tem para treinar hoje?" (slider: 20–90 minutos)
4. Pergunta 3: "De 1 a 10, qual sua disposição para treinar hoje?" (slider numérico)
5. Respostas salvas junto ao treino gerado para histórico
6. Fluxo completo em menos de 30 segundos

### Story 3.2 — Geração de Treino por IA
Como sistema,
Eu quero gerar um treino personalizado usando Claude API com base em todos os dados do usuário,
Para que cada treino seja único, adequado e seguindo a metodologia Lets Train.

**Critérios de Aceitação:**
1. API route `/api/workout/generate` recebe: perfil do usuário, nível atual, local de treino, equipamentos disponíveis, objetivo, preferência de treino, check-in do dia
2. Prompt estruturado enviado ao Claude API incluindo diretrizes da metodologia Time Efficient da Lets Train
3. Resposta da IA retorna JSON estruturado com: nome do treino, duração estimada, aquecimento, bloco principal (exercícios com séries/reps/descanso), cooldown
4. Treino adaptado ao tempo disponível informado no check-in (disposição baixa = treino mais curto/leve)
5. Treino usa APENAS equipamentos da lista do usuário
6. Nenhum exercício de risco para lesões declaradas na anamnese
7. Treino salvo na tabela `workouts` com status "gerado"
8. Tempo de resposta < 10 segundos

### Story 3.3 — Tela de Treino do Dia
Como usuário,
Eu quero ver meu treino em uma tela visual e intuitiva,
Para que eu possa executar os exercícios com clareza diretamente do celular.

**Critérios de Aceitação:**
1. Header com nome do treino, duração estimada e nível
2. Cards swipeable para cada exercício com: nome, imagem ilustrativa, séries × repetições, tempo de descanso
3. Botão "Ver Vídeo" em cada exercício abrindo link YouTube em nova aba
4. Indicador de progresso ("Exercício 3 de 8")
5. Botão "Concluir Treino" ao final da lista
6. Modal de confirmação antes de concluir
7. Ao concluir, treino marcado como "executado" e usuário redirecionado para avaliação

---

## Epic 4 — Progressão & Gamificação

**Objetivo**: Criar o sistema que mantém o usuário motivado e progredindo a longo prazo. Inclui rastreamento automático de treinos (Scout), progressão de nível, sistema de recompensas com conquistas e badges, avaliação pós-treino e histórico completo.

### Story 4.1 — Avaliação Pós-Treino
Como usuário que concluiu um treino,
Eu quero avaliar como foi o treino,
Para que o sistema aprenda minhas preferências e melhore os próximos treinos.

**Critérios de Aceitação:**
1. Tela de avaliação exibida automaticamente após concluir treino
2. Rating de 1–5 estrelas com emoji correspondente
3. Campo opcional de texto livre para comentário
4. Opções rápidas de feedback: "Muito fácil" / "Na medida" / "Muito difícil" / "Não gostei dos exercícios"
5. Avaliação salva em `workout_evaluations`
6. Tela de celebração com animação após salvar avaliação
7. Feedback de treinos anteriores usado no prompt de geração da IA

### Story 4.2 — Sistema Scout e Rastreamento de Progresso
Como usuário,
Eu quero que o sistema acompanhe automaticamente minha evolução,
Para que eu veja meu progresso sem precisar registrar manualmente.

**Critérios de Aceitação:**
1. Contador automático de treinos executados por nível
2. Dashboard de progresso mostrando: nível atual, treinos no nível, treinos para o próximo nível, barra de progresso visual
3. Streak ativo (dias consecutivos treinados) exibido na home
4. Histórico de treinos com data, tipo, duração e avaliação
5. Calendário visual do mês com dias treinados destacados

### Story 4.3 — Progressão Automática de Nível
Como usuário que atingiu o requisito de treinos,
Eu quero ser promovido automaticamente ao próximo nível,
Para que meus treinos evoluam junto com meu condicionamento.

**Critérios de Aceitação:**
1. Requisitos de treinos por nível definidos no banco (configuráveis):
   - Adaptação → Iniciante: 20 treinos
   - Iniciante → Intermediário: 40 treinos
   - Intermediário → Avançado: 60 treinos
   - Avançado → PRO: 80 treinos
2. Sistema verifica progressão ao concluir cada treino
3. Quando requisito atingido: tela de celebração de "Level Up" com animação
4. Novo nível salvo no perfil
5. Próximo treino gerado já no novo nível
6. Notificação push de level up

### Story 4.4 — Sistema de Recompensas e Conquistas
Como usuário,
Eu quero ganhar conquistas e recompensas por marcos de evolução,
Para que eu me mantenha motivado a treinar consistentemente.

**Critérios de Aceitação:**
1. Banco de conquistas com no mínimo 15 badges no MVP:
   - "Primeiro Treino", "7 Dias Seguidos", "30 Treinos", "Level Up x1", "Level Up x2", "100 Treinos", etc.
2. Badge desbloqueado automaticamente ao atingir critério
3. Tela de conquistas mostrando desbloqueadas (coloridas) e bloqueadas (cinza com dica)
4. Animação ao desbloquear nova conquista
5. Push notification ao ganhar conquista
6. Conquistas exibidas no perfil do usuário

---

## Epic 5 — Monetização & Assinatura

**Objetivo**: Implementar o sistema de pagamento e controle de acesso por assinatura. O usuário pode se inscrever em plano mensal ou anual, com suporte nativo a PIX e cartão. Assinaturas vencidas bloqueiam acesso ao conteúdo com tela de renovação.

### Story 5.1 — Planos e Checkout
Como usuário novo ou sem assinatura,
Eu quero ver os planos disponíveis e me inscrever,
Para que eu possa acessar o app completo.

**Critérios de Aceitação:**
1. Tela de planos mostrando: Mensal (R$29,90) e Anual (valor com desconto + economia destacada)
2. Integração com Mercado Pago SDK
3. Checkout de cartão de crédito/débito funcionando
4. Geração de QR Code PIX para pagamento anual
5. Confirmação de pagamento via webhook do Mercado Pago
6. Assinatura criada na tabela `subscriptions` após confirmação
7. Redirecionamento para home do app após pagamento confirmado

### Story 5.2 — Controle de Acesso e Renovação
Como sistema,
Eu quero controlar o acesso ao app com base no status da assinatura,
Para que apenas usuários com assinatura ativa possam usar os treinos.

**Critérios de Aceitação:**
1. Middleware verifica status da assinatura em rotas protegidas
2. Assinatura vencida redireciona para tela de renovação
3. Tela de renovação exibe dias de inatividade e botão de renovar
4. Período de graça de 3 dias após vencimento antes de bloquear
5. Email automático enviado 7 dias e 1 dia antes do vencimento
6. Cancelamento disponível em Configurações (cancela ao fim do período pago)
7. Status da assinatura visível em Configurações > Minha Assinatura

---

## Epic 6 — Push Notifications & Engajamento

**Objetivo**: Implementar o sistema de notificações push para manter o usuário engajado — lembretes de treino nos dias configurados, notificações de conquistas desbloqueadas e comunicações de engajamento.

### Story 6.1 — Configuração de Push Notifications
Como usuário,
Eu quero ativar notificações e configurar meus dias e horários de treino,
Para que o app me lembre de treinar automaticamente.

**Critérios de Aceitação:**
1. Solicitação de permissão de notificação na web (Web Push API)
2. Tela de configuração: dias da semana + horário preferido de lembrete
3. Service Worker registrado para receber push notifications em background
4. Configuração salva no banco por usuário

### Story 6.2 — Envio de Notificações
Como sistema,
Eu quero enviar notificações push automáticas nos horários configurados,
Para que os usuários sejam lembrados de treinar e celebrem conquistas.

**Critérios de Aceitação:**
1. Supabase Edge Function agendada para enviar lembretes de treino nos horários configurados
2. Notificação de lembrete com mensagem motivacional personalizada
3. Notificação disparada em tempo real ao desbloquear conquista
4. Notificação de level up enviada imediatamente
5. Usuário pode desativar cada tipo de notificação separadamente
6. Notificações não enviadas para usuários com assinatura vencida

---

## 7. Checklist Results

_A ser preenchido após validação pelo PO._

---

## 8. Next Steps

### UX Expert Prompt
Use este PRD para criar a especificação de UI/UX (front-end-spec.md). Foque nas telas de maior impacto na ativação: onboarding (quiz + nível + equipamentos) e tela de treino do dia. Siga a visão de interface mobile-first, dark mode, gamificada e com microanimações.

### Architect Prompt
Use este PRD para criar a arquitetura técnica fullstack (fullstack-architecture.md). Stack: Next.js 15 + Supabase + Claude API + Mercado Pago + Vercel. Monorepo. Atenção especial para: sistema de geração de treino por IA (prompt engineering + cache), detecção de equipamentos por visão computacional, webhook de pagamentos, sistema de push notifications via PWA e Web Push API.
