import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lets Train — Seu treino, gerado por IA. Evoluindo todo dia.',
  description: 'A metodologia da Lets Train na palma da sua mão. Treinos diários personalizados para academia, condomínio ou hotel. Progressão automática, 59 conquistas e Lets Body Score. Comece com 3 dias grátis.',
  openGraph: {
    title: 'Lets Train — Seu treino, gerado por IA.',
    description: 'Treinos diários personalizados por IA. 15 níveis de progressão, 59 conquistas, Lets Body Score. 3 dias grátis — sem cobranças durante o trial.',
    url: 'https://letstrain.com.br',
  },
  twitter: {
    title: 'Lets Train — Seu treino, gerado por IA.',
    description: 'Treinos diários personalizados por IA. 3 dias grátis, sem cobranças durante o trial.',
  },
  alternates: {
    canonical: '/',
  },
}

export default async function LandingPage() {
  // Usuário logado vai direto pro dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-black text-lg tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="h-9 px-4 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center hover:bg-[#E07000] transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-24 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">

          <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full px-4 py-1.5">
            <span className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest">🎁 3 dias grátis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            Seu treino,{' '}
            <span className="text-[#FF8C00]">gerado por IA.</span>
            <br />
            Evoluindo todo dia.
          </h1>

          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-lg">
            A metodologia da Lets Train agora na palma da sua mão.
            Treinos diários personalizados para academia, condomínio ou hotel.
            Com progressão automática, conquistas e muito mais.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/cadastro"
              className="h-14 px-8 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
            >
              💪 Começar 3 dias grátis
            </Link>
            <Link
              href="/login"
              className="h-14 px-8 rounded-2xl border border-white/10 text-white/60 font-medium text-base flex items-center justify-center hover:border-white/20 hover:text-white/80 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="text-xs text-white/30">
            Sem cobranças durante o trial. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ── Prova social / números ──────────────────────────── */}
      <section className="px-6 py-12 border-y border-white/[0.06]">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: '15', label: 'Níveis de progressão' },
            { num: '59', label: 'Conquistas desbloqueáveis' },
            { num: '100%', label: 'Metodologia Lets Train' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="text-2xl sm:text-3xl font-black text-[#FF8C00]">{item.num}</p>
              <p className="text-xs text-white/40 leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Como funciona</p>
            <h2 className="text-2xl sm:text-3xl font-black">Simples assim.</h2>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                num: '01',
                title: 'Faz o onboarding',
                desc: 'Conta seu nível, objetivo, onde treina e os equipamentos disponíveis. Leva menos de 3 minutos.',
                icon: '🎯',
              },
              {
                num: '02',
                title: 'IA gera seu treino',
                desc: 'Cada dia, um treino novo. Personalizado pro seu nível, objetivo e equipamentos — com exercícios da metodologia Lets Train.',
                icon: '🤖',
              },
              {
                num: '03',
                title: 'Executa e evolui',
                desc: 'Conclui o treino, sobe de nível, desbloqueia conquistas e acumula Lets Coins. A progressão acontece automaticamente.',
                icon: '📈',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-xl">
                  {step.icon}
                </div>
                <div>
                  <p className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest mb-1">{step.num}</p>
                  <p className="font-bold text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal Trainer ────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Profissional real</p>
            <h2 className="text-2xl sm:text-3xl font-black">Metodologia criada por<br />um personal registrado.</h2>
            <p className="text-sm text-white/40 mt-3 leading-relaxed max-w-lg mx-auto">
              A IA aplica a metodologia Time Efficient desenvolvida pelo Personal Guilherme — todos os exercícios e progressões são validados por um profissional com CREF ativo.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col sm:flex-row items-center gap-6 max-w-md w-full">
              <div className="shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-[#FF8C00]/30">
                <img
                  src="/guilherme-avatar.jpg"
                  alt="Personal Guilherme"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <div>
                  <p className="font-black text-lg">Personal Guilherme</p>
                  <p className="text-xs text-[#FF8C00] font-semibold mt-0.5">Criador da Metodologia Time Efficient</p>
                  <p className="text-[11px] text-white/30 font-mono mt-1">CREF 011884-G/SC</p>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">
                  Mais de 10 anos treinando pessoas reais com resultados reais. A Lets Train IA é a metodologia aplicada em escala.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {['Perda de Gordura', 'Ganho de Massa', 'Qualidade de Vida'].map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">O que está incluso</p>
            <h2 className="text-2xl sm:text-3xl font-black">Tudo que você precisa.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '💪', title: 'Treinos diários por IA', desc: 'Gerados com Claude (Anthropic) usando a metodologia Time Efficient da Lets Train.' },
              { icon: '📊', title: 'Progressão automática', desc: '15 níveis. Sobe quando bate as metas. Adapta automaticamente a intensidade.' },
              { icon: '🏆', title: 'Álbum de conquistas', desc: '59 figurinhas para colecionar. Streak, horário, jejum, diversidade e muito mais.' },
              { icon: '🪙', title: 'Lets Coins', desc: 'Ganhe moedas por treino e troque por descontos reais na loja Lets Train.' },
              { icon: '⏱️', title: 'Jejum intermitente', desc: 'Timer ao vivo com alertas de milestone. Integrado às conquistas.' },
              { icon: '🏠', title: 'Treino 4 blocos', desc: 'Preparação → Força → Circuito Metabólico → Finisher. Metodologia estruturada em toda sessão.' },
              { icon: '🔔', title: 'Lembretes personalizados', desc: 'Push notifications nos dias e horários que você escolher.' },
              { icon: '📏', title: 'Lets Body Score', desc: 'Score 0-100 de composição corporal com 4 pilares e 15 indicadores metabólicos.' },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3"
              >
                <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{f.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locais de treino ────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Funciona onde você estiver</p>
            <h2 className="text-2xl sm:text-3xl font-black">Seu treino,<br />em qualquer lugar.</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏢', label: 'Academia\nde Condomínio', desc: 'Detecta equipamentos pela câmera' },
              { icon: '🏨', label: 'Hotel /\nViagem', desc: 'Modo silencioso — sem impacto' },
            ].map((local) => (
              <div
                key={local.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col items-center gap-2 text-center"
              >
                <span className="text-2xl">{local.icon}</span>
                <p className="text-xs text-white/60 leading-tight whitespace-pre-line font-medium">{local.label}</p>
                <p className="text-[10px] text-white/30 leading-tight">{local.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preços ──────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Preços</p>
            <h2 className="text-2xl sm:text-3xl font-black">Simples e transparente.</h2>
            <p className="text-sm text-white/40 mt-2">3 dias grátis em todos os planos. Sem cobranças durante o trial.</p>
          </div>

          <div className="flex flex-col gap-4">

            {/* Plano Anual — destaque */}
            <div className="relative rounded-2xl border border-[#FF8C00] bg-[#FF8C00]/[0.06] p-6 flex flex-col gap-4">
              <span className="absolute -top-3 left-5 bg-[#FF8C00] text-black text-xs font-bold px-3 py-0.5 rounded-full">
                🔥 Melhor custo-benefício
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">Anual</p>
                  <p className="text-xs text-[#FF8C00] font-medium mt-0.5">Economize R$201,80 vs mensal</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl">12x de R$37,90</p>
                  <p className="text-xs text-white/40">total R$397,00 · cobrado anualmente</p>
                </div>
              </div>
              <Link
                href="/cadastro"
                className="w-full h-12 rounded-xl bg-[#FF8C00] text-black font-bold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors"
              >
                🎁 Começar 3 dias grátis
              </Link>
            </div>

            {/* Plano Mensal */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">Mensal</p>
                  <p className="text-xs text-white/40 mt-0.5">Flexibilidade total</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl">R$49,90</p>
                  <p className="text-xs text-white/40">por mês</p>
                </div>
              </div>
              <Link
                href="/cadastro"
                className="w-full h-12 rounded-xl border border-white/10 text-white/70 font-semibold text-sm flex items-center justify-center hover:border-white/20 hover:text-white transition-colors"
              >
                🎁 Começar 3 dias grátis
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              '✅ 3 dias grátis — sem cobranças durante o trial',
              '✅ Cancele antes do trial e não paga nada',
              '✅ Acesso completo a todos os recursos',
              '✅ Sem contrato de fidelidade',
            ].map((item) => (
              <p key={item} className="text-xs text-white/40">{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
          <span className="text-5xl">💪</span>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight">
            Metodologia real,<br />
            <span className="text-[#FF8C00]">resultados de verdade.</span>
          </h2>
          <p className="text-sm text-white/45 leading-relaxed">
            Junte-se aos atletas que já treinam com a IA da Lets Train.
            Comece hoje, sem risco.
          </p>
          <Link
            href="/cadastro"
            className="h-14 px-10 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
          >
            💪 Começar 3 dias grátis
          </Link>
          <p className="text-xs text-white/25">
            Sem cobranças durante o trial · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </span>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/login" className="hover:text-white/60 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-white/60 transition-colors">Cadastrar</Link>
            <Link href="/termos" className="hover:text-white/60 transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white/60 transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Lets Train. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  )
}
