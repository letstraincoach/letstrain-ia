import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lets Train para Condomínios — Personal Trainer IA para todos os seus moradores',
  description: '80% dos moradores não usam a academia do condomínio. A Lets Train ativa esse espaço com personal trainer por IA, treinos personalizados e progressão automática — por menos do que um professor de ginástica.',
  openGraph: {
    title: 'Lets Train para Condomínios — Academia inteligente para todos os moradores',
    description: 'Transforme o espaço fitness do seu condomínio em um diferencial real. Personal trainer IA disponível 24h para todos os moradores.',
    url: 'https://letstrain.com.br/condominios',
  },
  alternates: { canonical: '/condominios' },
}

const WA_LINK = 'https://wa.me/5548999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20conhecer%20a%20Lets%20Train%20para%20condom%C3%ADnios.'

export default function CondominiosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-lg tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Para moradores
            </Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center hover:bg-[#E07000] transition-colors"
            >
              Falar com consultor
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full px-4 py-1.5">
            <span className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest">Para Construtoras · Condomínios · Síndicos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight max-w-4xl">
            A academia do seu condomínio
            {' '}<span className="text-[#FF8C00]">está parada.</span>
            {' '}Nós ativamos ela.
          </h1>

          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl">
            80% dos moradores não pisam na sala fitness do condomínio. A Lets Train entrega um personal trainer por IA para cada morador — sem contratar ninguém, sem obra, sem custo de equipamento.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 px-8 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
            >
              Solicitar proposta →
            </a>
            <Link
              href="#precos"
              className="h-14 px-8 rounded-2xl border border-white/10 text-white/60 font-medium text-base flex items-center justify-center hover:border-white/20 hover:text-white/80 transition-colors"
            >
              Ver planos e preços
            </Link>
          </div>

          <p className="text-xs text-white/30">
            Sem taxa de setup · Implantação em menos de 24h · Contrato sem fidelidade
          </p>
        </div>
      </section>

      {/* ── Problema em números ──────────────────────────────── */}
      <section className="px-6 py-12 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { num: '80%', label: 'dos moradores nunca usa a academia do condomínio' },
            { num: '520 mil', label: 'condomínios no Brasil — crescendo 23,8% em 8 anos' },
            { num: '68 mi', label: 'de brasileiros vivem em condomínios' },
            { num: '+10%', label: 'de valorização percebida com amenidade fitness de qualidade' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="text-2xl sm:text-3xl font-black text-[#FF8C00]">{item.num}</p>
              <p className="text-xs text-white/40 leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── O problema real ─────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">O problema</p>
            <h2 className="text-2xl sm:text-3xl font-black">O condomínio investiu.<br />Os moradores não usam.</h2>
            <p className="text-sm text-white/40 mt-3 max-w-2xl mx-auto leading-relaxed">
              Uma academia de condomínio custa entre R$20.000 e R$150.000 para montar. Mais R$2.000 a R$8.000 por mês em manutenção rateada entre todos. E 80% dos moradores nunca entram lá. O problema não é o equipamento — é a falta de orientação.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Sem personal, sem rotina',
                desc: 'O morador olha para a esteira e não sabe por onde começar. Sem orientação, a visita vira exceção. A academia vira depósito.',
              },
              {
                title: 'Custo compartilhado, benefício individual',
                desc: 'Todos pagam na taxa condominial. Só 20% usam. Os 80% que não usam percebem o condomínio como caro sem retorno.',
              },
              {
                title: 'Espaço subutilizado = argumento perdido',
                desc: 'Para construtoras e síndicos, uma academia vazia é um diferencial de venda desperdiçado. O espaço existe. A narrativa não.',
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500/70" />
                <p className="font-bold text-sm">{p.title}</p>
                <p className="text-xs text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A solução ───────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">A solução</p>
            <h2 className="text-2xl sm:text-3xl font-black">Personal trainer por IA<br />para cada morador.</h2>
            <p className="text-sm text-white/40 mt-3 max-w-2xl mx-auto leading-relaxed">
              A Lets Train entrega o Método LETS TRAIN — 15 anos de metodologia validada em campo — via inteligência artificial. Cada morador abre o app, faz o check-in e recebe um treino personalizado para os equipamentos que existem na academia do seu condomínio.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Treino personalizado por morador',
                desc: 'A IA cruza o nível de condicionamento, objetivo e equipamentos disponíveis. Cada morador recebe um treino diferente. Todo dia.',
              },
              {
                title: 'Detecta os equipamentos pela câmera',
                desc: 'No onboarding, o morador fotografa a sala fitness. A IA identifica os aparelhos e passa a gerar treinos adaptados àquele espaço específico.',
              },
              {
                title: 'Progressão automática',
                desc: '15 níveis de progressão. O app sobe o nível automaticamente conforme o morador evolui — sem depender de orientação presencial.',
              },
              {
                title: 'Gamificação e engajamento',
                desc: '59 conquistas desbloqueáveis, Lets Coins, streaks e o Lets Body Score mantêm o morador voltando. Engajamento que nenhum professor consegue sozinho.',
              },
              {
                title: 'Funciona com qualquer equipamento',
                desc: 'Halteres, cabo, esteira, peso corporal. A IA adapta o treino ao que existe. Não precisa comprar novos equipamentos.',
              },
              {
                title: 'Relatório de uso para o síndico',
                desc: 'O gestor acompanha quantos moradores estão ativos, quais horários de pico e o engajamento geral — argumento concreto para assembleias.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quem é ─────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Para quem é</p>
            <h2 className="text-2xl sm:text-3xl font-black">Três públicos. Um argumento.</h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Construtoras */}
            <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-6 flex flex-col sm:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/25 flex items-center justify-center">
                  <span className="text-xl">🏗️</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-black text-base text-[#FF8C00]">Construtoras e Incorporadoras</p>
                <p className="text-sm text-white/55 leading-relaxed">
                  75% dos compradores consideram academia essencial na escolha do imóvel. Inclua a Lets Train como amenidade digital no seu lançamento — sem custo de obra adicional, sem aprovação de CREF, sem projeto arquitetônico. Um diferencial de venda concreto que pode ser comunicado no stand, no material de vendas e no app do empreendimento.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Diferencial de lançamento', 'Sem CAPEX adicional', 'Argumento documentável +10% valorização', 'Implantação na entrega das chaves'].map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-[#FF8C00]/20 text-[#FF8C00]/70">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Síndicos */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col sm:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-black text-base">Síndicos Profissionais</p>
                <p className="text-sm text-white/55 leading-relaxed">
                  O síndico profissional médio gerencia 5 a 20 edifícios. A demanda por síndicos profissionais cresce 25-30% ao ano. Diferenciação de gestão é o ativo mais escasso dessa profissão. A Lets Train é a prova concreta de uma gestão orientada a qualidade de vida — um argumento direto para conquistar e reter contratos, melhorar o NPS dos moradores e destacar seu portfolio.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Melhora NPS de moradores', 'Diferencial de gestão', 'Relatório de uso por assembleia', 'Argumento para novos contratos'].map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Administradoras */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col sm:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center">
                  <span className="text-xl">🏛️</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-black text-base">Administradoras de Condomínios</p>
                <p className="text-sm text-white/55 leading-relaxed">
                  O mercado condominial movimenta R$300 bilhões por ano no Brasil. As taxas subiram 25% em 3 anos — moradores exigem mais em troca. A Lets Train é o benefício de saúde e bem-estar que ainda não está no portfolio das grandes administradoras. Quem oferecer primeiro captura um diferencial de mercado antes dos concorrentes.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Portfolio diferenciado', 'R$300bi de mercado', 'Bem-estar como serviço', 'Retenção de contratos'].map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparativo ─────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Por que Lets Train</p>
            <h2 className="text-2xl sm:text-3xl font-black">Mais valor.<br />Menos custo.</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-white/40 font-medium text-xs">Solução</th>
                  <th className="text-center py-3 px-4 text-white/40 font-medium text-xs">Custo médio</th>
                  <th className="text-center py-3 px-4 text-white/40 font-medium text-xs">Moradores atendidos</th>
                  <th className="text-center py-3 px-4 text-white/40 font-medium text-xs">Personalização</th>
                  <th className="text-center py-3 px-4 text-white/40 font-medium text-xs">Disponibilidade</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    sol: 'Personal trainer presencial',
                    custo: 'R$3k–8k/mês',
                    moradores: '1–5 por sessão',
                    personaliz: 'Alta',
                    disp: '2–3h/dia',
                    destaque: false,
                  },
                  {
                    sol: 'Gestora esportiva',
                    custo: 'R$10–30/apto/mês',
                    moradores: 'Turmas fixas',
                    personaliz: 'Baixa',
                    disp: 'Horários fixos',
                    destaque: false,
                  },
                  {
                    sol: 'Wellhub / Gympass',
                    custo: 'R$29,90/pessoa/mês',
                    moradores: 'Quem assinar',
                    personaliz: 'Média',
                    disp: 'Depende de academia',
                    destaque: false,
                  },
                  {
                    sol: 'Lets Train para Condomínios',
                    custo: 'A partir de R$790/mês',
                    moradores: 'Todos os moradores',
                    personaliz: 'Alta — por IA',
                    disp: '24h · 7 dias',
                    destaque: true,
                  },
                ].map((row) => (
                  <tr
                    key={row.sol}
                    className={`border-b border-white/[0.04] ${row.destaque ? 'bg-[#FF8C00]/[0.06]' : ''}`}
                  >
                    <td className={`py-3 px-4 font-medium text-sm ${row.destaque ? 'text-[#FF8C00]' : 'text-white/70'}`}>
                      {row.sol}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-white/55">{row.custo}</td>
                    <td className="py-3 px-4 text-center text-xs text-white/55">{row.moradores}</td>
                    <td className="py-3 px-4 text-center text-xs text-white/55">{row.personaliz}</td>
                    <td className="py-3 px-4 text-center text-xs text-white/55">{row.disp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Preços ──────────────────────────────────────────── */}
      <section id="precos" className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Planos para condomínios</p>
            <h2 className="text-2xl sm:text-3xl font-black">Preço por condomínio.<br />Acesso para todos os moradores.</h2>
            <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto">
              Um único contrato para o condomínio. Todos os moradores têm acesso completo — sem limite de usuários por unidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
            {[
              {
                nome: 'Starter',
                unidades: 'Até 100 unidades',
                preco: 'R$790',
                porUnidade: 'R$7,90/unidade',
                destaque: false,
                features: [
                  'Todos os moradores com acesso',
                  'Treinos gerados por IA',
                  'Detecção de equipamentos por foto',
                  '15 níveis de progressão',
                  'Onboarding assistido',
                  'Suporte por WhatsApp',
                ],
              },
              {
                nome: 'Pro',
                unidades: 'Até 200 unidades',
                preco: 'R$1.290',
                porUnidade: 'R$6,45/unidade',
                destaque: true,
                features: [
                  'Tudo do Starter',
                  'Dashboard de uso para síndico',
                  'Relatório mensal de engajamento',
                  'Personalização com logo do condomínio',
                  'Treinamento para moradores (online)',
                  'Gerente de conta dedicado',
                ],
              },
              {
                nome: 'Enterprise',
                unidades: 'Acima de 200 unidades',
                preco: 'Sob consulta',
                porUnidade: 'Preço por volume',
                destaque: false,
                features: [
                  'Tudo do Pro',
                  'Multi-torre / multi-edifício',
                  'Integração com app do condomínio',
                  'SLA garantido em contrato',
                  'Treinamento presencial',
                  'Contrato flexível por volume',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.nome}
                className={`rounded-2xl p-6 flex flex-col gap-5 ${
                  plan.destaque
                    ? 'border border-[#FF8C00] bg-[#FF8C00]/[0.06] relative'
                    : 'border border-white/[0.08] bg-white/[0.02]'
                }`}
              >
                {plan.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF8C00] text-black text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    Mais popular
                  </span>
                )}
                <div>
                  <p className={`font-black text-lg ${plan.destaque ? 'text-[#FF8C00]' : ''}`}>{plan.nome}</p>
                  <p className="text-xs text-white/40 mt-0.5">{plan.unidades}</p>
                </div>
                <div>
                  <p className="font-black text-3xl">{plan.preco}</p>
                  <p className="text-xs text-white/40 mt-0.5">{plan.porUnidade} · por mês</p>
                </div>
                <div className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="text-[#FF8C00] text-xs mt-0.5 shrink-0">✓</span>
                      <p className="text-xs text-white/55 leading-tight">{f}</p>
                    </div>
                  ))}
                </div>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${
                    plan.destaque
                      ? 'bg-[#FF8C00] text-black hover:bg-[#E07000]'
                      : 'border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {plan.preco === 'Sob consulta' ? 'Solicitar proposta →' : 'Falar com consultor →'}
                </a>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
            {[
              '✅ Sem taxa de setup — implantação inclusa',
              '✅ Sem fidelidade — cancele quando quiser',
              '✅ Onboarding assistido para os moradores',
              '✅ Todos os moradores com acesso ilimitado',
            ].map((item) => (
              <p key={item} className="text-xs text-white/40">{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ B2B ─────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Perguntas frequentes</p>
            <h2 className="text-2xl sm:text-3xl font-black">Dúvidas do gestor.</h2>
          </div>

          <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
            {[
              {
                q: 'O condomínio precisa comprar novos equipamentos?',
                a: 'Não. A plataforma funciona com o que já existe na sala fitness — halteres, cabo, esteira, peso corporal. No onboarding, cada morador fotografa o espaço e a IA mapeia os equipamentos disponíveis.',
              },
              {
                q: 'Como funciona o acesso dos moradores?',
                a: 'O síndico recebe um código de acesso do condomínio. Os moradores baixam o app Lets Train, inserem o código na hora do cadastro e já têm acesso completo. Sem burocracia para o gestor.',
              },
              {
                q: 'Precisa de obra ou instalação física?',
                a: 'Não. A Lets Train é 100% digital. Nenhuma obra, nenhum equipamento adicional, nenhuma aprovação de projeto. A implantação leva menos de 24 horas após a assinatura do contrato.',
              },
              {
                q: 'Como o síndico acompanha o uso?',
                a: 'O plano Pro inclui um dashboard exclusivo para o gestor com dados de moradores ativos, frequência de uso, horários de pico e engajamento. Um relatório em PDF é enviado mensalmente — pronto para apresentar em assembleia.',
              },
              {
                q: 'Qual é o modelo de contrato?',
                a: 'Contrato mensal sem fidelidade. O condomínio pode cancelar a qualquer momento sem multa. Oferecemos também contratos anuais com desconto de até 15% para quem prefere previsibilidade orçamentária.',
              },
              {
                q: 'Funciona para construtoras em fase de lançamento?',
                a: 'Sim. Trabalhamos com construtoras e incorporadoras desde a fase de lançamento — a Lets Train é comunicada como amenidade digital do empreendimento e ativada na entrega das chaves. Entre em contato para discutir o modelo de parceria.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <span className="shrink-0 text-white/40 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight">
            Sua academia está pronta.<br />
            <span className="text-[#FF8C00]">Seus moradores, não.</span>
          </h2>
          <p className="text-sm text-white/45 leading-relaxed">
            Leva menos de 24h para ativar. Sem obra, sem contratação, sem burocracia. Fale com um consultor e receba uma proposta para o seu condomínio.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 px-10 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
          >
            Solicitar proposta agora →
          </a>
          <p className="text-xs text-white/25">
            Sem taxa de setup · Sem fidelidade · Resposta em até 2h úteis
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </span>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">Para moradores</Link>
            <Link href="/termos" className="hover:text-white/60 transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white/60 transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Lets Train. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  )
}
