import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Lets Train para Academia — Pare de abandonar. Comece a evoluir.',
  description: '8 em cada 10 pessoas abandonam a academia em 6 meses por falta de metodologia e acompanhamento. A Lets Train resolve isso com o Método Lets Train e tecnologia.',
  openGraph: {
    title: 'Lets Train para Academia — Pare de abandonar. Comece a evoluir.',
    description: '8 em cada 10 pessoas abandonam a academia em 6 meses. Conheça o Método Lets Train com tecnologia aplicada.',
    url: 'https://letstrain.com.br/academia',
  },
  twitter: {
    title: 'Lets Train para Academia — Metodologia + Tecnologia + Gamificação',
    description: 'Pare de ser mais um número na academia. Método Lets Train com progressão automática e resultados reais.',
  },
  alternates: {
    canonical: '/academia',
  },
}

export default function AcademiaPage() {
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
              href="/condominios"
              className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block"
            >
              Para condomínios
            </Link>
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

      {/* ── Churn Hook ───────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-20 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">

          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">A verdade sobre as academias no Brasil</span>
          </div>

          {/* Stat principal — mais impactante */}
          <div className="flex flex-col gap-4">
            <p className="text-base sm:text-lg text-white/50 font-medium">Você sabia que...</p>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight text-white">
              <span style={{ color: '#EF4444' }}>8 em cada 10 pessoas</span><br />
              que entram na academia hoje<br />
              vão abandonar em menos de<br />
              <span style={{ color: '#EF4444' }}>6 meses.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 font-semibold mt-2">Sabe por quê?</p>
          </div>

          {/* Motivos */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
            {[
              { icon: '😤', label: 'Péssimo atendimento' },
              { icon: '🎯', label: 'Falta de metodologia' },
              { icon: '📉', label: 'Zero resultado visível' },
              { icon: '👻', label: 'Ninguém acompanha você' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl border border-red-500/15 bg-red-500/[0.04] py-4 px-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs font-semibold text-red-300/80 text-center leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-xl">
            Você paga a mensalidade, vai animado nos primeiros dias e some em 3 meses.{' '}
            <span className="text-white font-semibold">Não é fraqueza. É falta de sistema.</span>
          </p>

          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <p className="text-base sm:text-lg text-white/80 font-semibold">
            Estes problemas acabaram com a <span className="text-[#FF8C00]">Lets Train.</span>
          </p>
        </div>
      </section>

      {/* ── Hero — solução ──────────────────────────────────── */}
      <section className="px-6 pb-24 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(255,140,0,0.06) 0%, transparent 70%)' }}
        />
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full px-4 py-1.5">
              <span className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest">🏋️ Para quem treina em academia</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Metodologia real.{' '}
              <span className="text-[#FF8C00]">Progressão automática.</span>{' '}
              Seu treino pronto{' '}
              <span className="text-[#FF8C00]">em 3 minutos.</span>
            </h2>

            <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-lg">
              A Lets Train aplica o Método Lets Train nos equipamentos da sua academia e transforma cada ida em uma sessão estruturada, com progressão real e gamificação que mantém você voltando.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/cadastro"
                className="h-14 px-8 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
              >
                Começar 3 dias grátis →
              </Link>
              <Link
                href="/login"
                className="h-14 px-8 rounded-2xl border border-white/10 text-white/60 font-medium text-base flex items-center justify-center hover:border-white/20 hover:text-white/80 transition-colors"
              >
                Já tenho conta
              </Link>
            </div>

            <p className="text-xs text-white/30">
              Sem cobranças durante o trial · Cancele quando quiser
            </p>
          </div>

          {/* Mockup academia */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[260px]">
              <div className="w-full rounded-[2.5rem] border-2 border-white/[0.12] bg-[#111] shadow-2xl overflow-hidden">
                <div className="bg-[#0d0d0d] px-5 pt-4 pb-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  </div>
                  <div className="w-6 h-1 rounded-full bg-white/10" />
                  <div className="w-5 h-1 rounded-full bg-white/10" />
                </div>

                <div className="bg-[#111] px-4 pb-5 pt-3 flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Treino de Hoje · Academia</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black">Personal Guilherme</p>
                      <span className="text-[10px] text-[#FF8C00] font-bold bg-[#FF8C00]/10 px-2 py-0.5 rounded-full">Nível 7</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {[
                    { label: 'Preparação', desc: 'Mobilidade + ativação', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Força', desc: 'Supino · Agachamento · Barra', color: '#FF8C00', bg: 'rgba(255,140,0,0.08)' },
                    { label: 'Circuito', desc: 'Leg Press · Polia · Core', color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
                    { label: 'Finisher', desc: 'AMRAP 5 min', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
                  ].map((block) => (
                    <div
                      key={block.label}
                      className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                      style={{ background: block.bg, border: `1px solid ${block.color}22` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: block.color }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold" style={{ color: block.color }}>{block.label}</p>
                        <p className="text-[10px] text-white/40 truncate">{block.desc}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-1 h-9 rounded-xl bg-[#FF8C00] flex items-center justify-center gap-1.5">
                    <span className="text-black font-bold text-[10px] tracking-wide">▶  INICIAR TREINO</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#FF8C00]/20 blur-3xl rounded-full pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Números ──────────────────────────────────────────── */}
      <section className="px-6 py-12 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: '15 anos', label: 'De metodologia validada em campo' },
            { num: '3 min', label: 'Para seu treino estar pronto' },
            { num: 'R$1,09/dia', label: 'Custo médio no plano anual' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="text-2xl sm:text-3xl font-black text-[#FF8C00]">{item.num}</p>
              <p className="text-xs text-white/40 leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como a Lets Train resolve o problema ─────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">A solução</p>
            <h2 className="text-2xl sm:text-3xl font-black">Por que a Lets Train funciona<br />quando a academia convencional falha.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: '🎯',
                prob: 'Sem metodologia',
                sol: 'Método Lets Train',
                desc: '4 blocos por treino: Preparação, Força, Circuito e Finisher. Estrutura profissional criada por um personal trainer com 15 anos de prática, aplicada no app a cada sessão.',
              },
              {
                icon: '📈',
                prob: 'Sem progressão',
                sol: '15 Níveis automáticos',
                desc: 'O app rastreia cada treino e sobe de nível quando você bate as metas. Nunca mais estagnado. A carga e o volume crescem com você.',
              },
              {
                icon: '👤',
                prob: 'Ninguém te acompanha',
                sol: 'Acompanhamento pelo app 24h',
                desc: 'Check-in diário de disposição e energia. O treino adapta a intensidade ao seu estado: mais leve quando você está cansado, mais intenso quando está no pique.',
              },
              {
                icon: '🏋️',
                prob: 'Treino genérico',
                sol: 'Personalizado por equipamento',
                desc: 'Você marca o que a sua academia tem: máquinas, polias, peso livre. O treino usa exatamente o que está disponível para você.',
              },
              {
                icon: '🎮',
                prob: 'Sem motivação',
                sol: 'Gamificação real',
                desc: '60+ conquistas, streak diário e controle calórico integrado. Cada treino concluído gera recompensas concretas. Nada de parabéns vago.',
              },
              {
                icon: '📊',
                prob: 'Sem resultado visível',
                sol: 'Lets Body Score',
                desc: 'Score 0-100 que mede sua evolução com 4 pilares e 15 indicadores. Você vê o resultado crescer, mesmo quando a balança não move.',
              },
            ].map((item) => (
              <div
                key={item.prob}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-red-400/70 font-semibold uppercase tracking-wide line-through">Problema: {item.prob}</p>
                  <p className="font-bold text-sm text-[#FF8C00]">Solução: {item.sol}</p>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Showcase ─────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">App na prática</p>
            <h2 className="text-2xl sm:text-3xl font-black">Veja o que acontece quando você abre o app.</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 lg:justify-center snap-x snap-mandatory">

            {/* Phone 1 — Equipamentos */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-widest">Sua Academia</p>
                  <p className="text-[11px] font-bold leading-tight">O que você tem?</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { nome: 'Leg Press 45°', checked: true },
                      { nome: 'Smith Machine', checked: true },
                      { nome: 'Pec Deck / Fly', checked: true },
                      { nome: 'Polia Alta', checked: false },
                      { nome: 'Halteres', checked: true },
                    ].map((eq) => (
                      <div
                        key={eq.nome}
                        className="flex items-center gap-2 rounded-lg px-2 py-1"
                        style={eq.checked
                          ? { background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.15)' }
                          : { background: 'rgba(255,255,255,0.03)' }
                        }
                      >
                        <div
                          className="w-3 h-3 rounded flex items-center justify-center shrink-0"
                          style={eq.checked
                            ? { background: '#FF8C00' }
                            : { border: '1px solid rgba(255,255,255,0.2)' }
                          }
                        >
                          {eq.checked && <span className="text-[6px] text-black font-bold">✓</span>}
                        </div>
                        <span className="text-[9px] text-white/60">{eq.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Marque o que a academia tem. O treino usa exatamente isso.</p>
            </div>

            {/* Phone 2 — Exercício com máquina */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#FF8C00] font-bold uppercase">Força 3/5</span>
                    <span className="text-[9px] text-white/30">4×10</span>
                  </div>
                  <p className="text-[12px] font-black leading-tight">Leg Press 45°</p>
                  <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-lg p-2">
                    <p className="text-[9px] text-white/50 leading-relaxed">Pés na largura dos ombros, paralelos. Desça até 90°. Empurre sem travar os joelhos.</p>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {[1,2,3,4].map((s) => (
                      <div
                        key={s}
                        className="flex-1 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                        style={s <= 3
                          ? { background: 'rgba(255,140,0,0.2)', color: '#FF8C00' }
                          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
                        }
                      >
                        {s <= 3 ? '✓' : s}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-white/30">Descanso</span>
                    <span className="text-[9px] text-[#FF8C00] font-bold">90s</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Execute série por série com instrução e timer de descanso.</p>
            </div>

            {/* Phone 3 — Progressão */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col gap-3">
                  <p className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-widest">Sua evolução</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                      style={{ background: 'linear-gradient(135deg,rgba(255,140,0,0.3),rgba(255,200,0,0.15))', border: '1.5px solid rgba(255,140,0,0.4)' }}>
                      🏋️
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#FF8C00]">Nível 7 · Intermediário Ouro</p>
                      <p className="text-[9px] text-white/40">+2 níveis neste mês</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Treinos', val: '23', icon: '🔥' },
                      { label: 'Streak', val: '14 dias', icon: '⚡' },
                      { label: 'Calorias', val: '1.840 kcal', icon: '🥗' },
                      { label: 'Body Score', val: '68/100', icon: '📊' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <span className="text-[9px] text-white/50">{stat.icon} {stat.label}</span>
                        <span className="text-[9px] font-bold text-white">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Acompanhe sua evolução real: nível, streak e score.</p>
            </div>

            {/* Phone 4 — Conquistas */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col items-center gap-2 text-center">
                  <p className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-widest">Figurinha desbloqueada!</p>
                  <div className="grid grid-cols-3 gap-1.5 w-full mt-1">
                    {[
                      { emoji: '🔥', nome: 'Sequência 7d', desbloqueado: true },
                      { emoji: '💪', nome: '10 Treinos', desbloqueado: true },
                      { emoji: '🏆', nome: 'Nível 5', desbloqueado: true },
                      { emoji: '⚡', nome: '3 Semanas', desbloqueado: false },
                      { emoji: '🎯', nome: 'Meta Mensal', desbloqueado: false },
                      { emoji: '🦾', nome: 'Atleta', desbloqueado: false },
                    ].map((fig) => (
                      <div
                        key={fig.nome}
                        className="aspect-square rounded-xl flex items-center justify-center text-xl"
                        style={fig.desbloqueado
                          ? { background: 'linear-gradient(135deg,rgba(255,140,0,0.25),rgba(255,200,0,0.12))', border: '1.5px solid rgba(255,140,0,0.35)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', filter: 'grayscale(1) brightness(0.3)' }
                        }
                      >
                        {fig.emoji}
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/35 mt-1">3 de 60+ figurinhas</p>
                  <div className="w-full h-7 rounded-lg mt-1 flex items-center justify-center text-[10px] font-bold text-[#FF8C00]"
                    style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)' }}>
                    Ver álbum completo →
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">60+ figurinhas. Desbloqueie com cada conquista.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Como funciona ────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Como funciona</p>
            <h2 className="text-2xl sm:text-3xl font-black">Simples. Eficiente. Sem desculpa.</h2>
          </div>

          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            {[
              {
                num: '01',
                title: 'Diz o que você tem na academia',
                desc: 'No onboarding, você marca os equipamentos disponíveis: máquinas guiadas, polias, peso livre, barras. Leva menos de 2 minutos.',
              },
              {
                num: '02',
                title: 'O Método Lets Train estrutura seu treino do dia',
                desc: 'Baseado na metodologia criada pelo Personal Guilherme, nos seus equipamentos, nível atual e disposição de hoje. Um treino único a cada sessão. Nunca mais "não sei o que fazer na academia".',
              },
              {
                num: '03',
                title: 'Executa, evolui, vicia',
                desc: 'Conclui o treino, sobe de nível, desbloqueia conquistas e registra suas calorias. A progressão acontece automaticamente. Você não precisa pensar, só fazer.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center">
                  <span className="text-[#FF8C00] font-black text-sm">{step.num}</span>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">O que está incluso</p>
            <h2 className="text-2xl sm:text-3xl font-black">Tudo que um personal daria.<br />Por R$1,09 por dia.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Treinos Diários Personalizados', desc: 'Metodologia 4 blocos do Método Lets Train, adaptada aos seus equipamentos e nível.' },
              { title: 'Progressão de 15 Níveis', desc: 'De Adaptação a Atleta Pro Max. Sobe automaticamente quando você bate as metas.' },
              { title: '60+ Figurinhas', desc: 'Conquistas reais por streak, diversidade de treino, jejum, body score e muito mais.' },
              { title: 'Controle Calórico Diário', desc: 'Registre sua alimentação e acompanhe calorias, proteínas, carboidratos e gorduras. Tudo integrado à sua evolução no app.' },
              { title: 'Lets Body Score', desc: 'Score 0-100 com 4 pilares e 15 indicadores para medir evolução real.' },
              { title: 'Check-in diário de disposição', desc: 'O treino adapta a intensidade ao seu estado físico e mental do dia.' },
              { title: 'Timer de descanso', desc: 'Cronômetro entre séries com preview do próximo exercício, sem distração.' },
              { title: 'Palavra do Dia', desc: 'Versículo bíblico diário com interpretação motivacional. Começo de dia poderoso.' },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3"
              >
                <div className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                <div>
                  <p className="font-semibold text-sm mb-0.5">{f.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal ─────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-80 xl:w-96 shrink-0 h-72 lg:h-auto">
                <Image
                  src="/guilherme-personal.jpeg"
                  alt="Guilherme Lets — Personal Trainer e criador do Método Lets Train"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 384px"
                />
              </div>
              <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
                <div>
                  <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-1">O profissional por trás do Método</p>
                  <p className="font-black text-2xl sm:text-3xl">Guilherme Lets</p>
                  <p className="text-sm text-white/40 mt-1">Personal Trainer · Proprietário da Academia Lets Train · Criador do Método LETS TRAIN</p>
                  <p className="text-[11px] text-white/25 font-mono mt-1">CREF 011884-G/SC</p>
                </div>
                <blockquote className="border-l-2 border-[#FF8C00] pl-4">
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    "Eu vi ao longo de 15 anos o mesmo padrão: a pessoa entra na academia, fica perdida, ninguém explica, o resultado não aparece e ela some. A Lets Train existe para acabar com isso. O Método Lets Train, que criei na prática treino a treino, agora está disponível no app para quem frequenta academia de verdade."
                  </p>
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  {[
                    '15 anos de prática',
                    'Metodologia própria',
                    'Acadêmico e prático',
                    'Especialista em resultado',
                  ].map((tag) => (
                    <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/40">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ──────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Resultados reais</p>
            <h2 className="text-2xl sm:text-3xl font-black">Quem parou de abandonar.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                initials: 'MO',
                name: 'Marcos O.',
                city: 'São Paulo',
                result: 'Não abandonou mais',
                quote: 'Passei 3 anos tentando manter frequência na academia. Pagando e não indo. Com a Lets Train, já são 4 meses sem faltar, porque chego sabendo exatamente o que fazer.',
                months: '4 meses de Lets Train',
              },
              {
                initials: 'JL',
                name: 'Juliana L.',
                city: 'Belo Horizonte',
                result: 'Perdeu 11kg em 5 meses',
                quote: 'A progressão automática me surpreendeu. Em 5 meses fui do nível Iniciante para Intermediário Ouro. Sem ter que calcular nada. O app faz isso por mim.',
                months: '5 meses de Lets Train',
              },
              {
                initials: 'RT',
                name: 'Ricardo T.',
                city: 'Porto Alegre',
                result: 'Streak de 52 dias',
                quote: 'Treinava sem método nenhum. Via todo mundo malhando mas não sabia como montar um treino sério. Hoje tenho 52 dias seguidos e estou no Intermediário Prata.',
                months: '3 meses de Lets Train',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(255,140,0,0.4),rgba(255,200,0,0.2))', color: '#FF8C00' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-[11px] text-white/35">{t.city}</p>
                  </div>
                </div>

                <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-xl px-3 py-2">
                  <p className="text-xs font-bold text-[#FF8C00]">"{t.result}"</p>
                </div>

                <p className="text-xs text-white/45 leading-relaxed flex-1">"{t.quote}"</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-[#FF8C00] text-xs">★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/25">{t.months}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preços ───────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Preços</p>
            <h2 className="text-2xl sm:text-3xl font-black">Menos que um suplemento.<br />Resultado de verdade.</h2>
            <p className="text-sm text-white/40 mt-2">3 dias grátis em todos os planos. Sem cobranças durante o trial.</p>
          </div>

          <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
            <div className="relative rounded-2xl border border-[#FF8C00] bg-[#FF8C00]/[0.06] p-6 flex flex-col gap-4">
              <span className="absolute -top-3 left-5 bg-[#FF8C00] text-black text-xs font-bold px-3 py-0.5 rounded-full">
                Melhor custo-benefício
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">Anual</p>
                  <p className="text-xs text-[#FF8C00] font-medium mt-0.5">Economize R$201,80 em relação ao mensal</p>
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
                Começar 3 dias grátis →
              </Link>
            </div>

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
                Começar 3 dias grátis →
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
            {[
              '✅ 3 dias grátis sem cobranças durante o trial',
              '✅ Cancele antes do trial e não paga nada',
              '✅ Acesso completo a todos os recursos',
              '✅ Sem contrato de fidelidade',
            ].map((item) => (
              <p key={item} className="text-xs text-white/40">{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Dúvidas frequentes</p>
            <h2 className="text-2xl sm:text-3xl font-black">Perguntas e Respostas.</h2>
          </div>

          <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
            {[
              {
                q: 'Funciona para qualquer academia?',
                a: 'Sim. Você seleciona manualmente os equipamentos disponíveis na sua academia: leg press, smith machine, polia, halteres e muito mais. O treino usa exatamente o que você marcou. Não importa o tamanho da academia.',
              },
              {
                q: 'Sou iniciante total. Consigo usar?',
                a: 'Esse é o perfil que mais se beneficia. O app começa no nível Adaptação com treinos técnicos, volume baixo e exercícios explicados passo a passo. Conforme você evolui, o app sobe de nível automaticamente. Você nunca fica perdido na academia de novo.',
              },
              {
                q: 'O que acontece se eu pular um treino?',
                a: 'O app registra, não te pune e te manda um lembrete. Se estiver com streak em risco às 19h, você recebe uma notificação push. No dia seguinte, novo treino gerado. Sem acúmulo e sem culpa.',
              },
              {
                q: 'Como o app monta o treino certo para mim?',
                a: 'O Método Lets Train é aplicado considerando: seu nível atual, objetivo (perda de gordura, hipertrofia ou qualidade de vida), equipamentos disponíveis, disposição do dia e histórico recente para não repetir os mesmos exercícios toda semana.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim. Sem fidelidade, sem multa, sem burocracia. Cancele em 1 clique pelo app. Se cancelar durante o trial de 3 dias, não paga absolutamente nada.',
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

      {/* ── CTA Final ────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,140,0,0.07) 0%, transparent 70%)' }}
        />
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6 relative">
          <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full px-4 py-1.5">
            <span className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest">Pare de ser mais uma estatística</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight">
            Você não precisa de<br />um personal caro.<br />
            <span className="text-[#FF8C00]">Precisa de um sistema.</span>
          </h2>
          <p className="text-sm text-white/45 leading-relaxed">
            Comece com 3 dias grátis, sem cartão e sem compromisso.<br />
            Seu primeiro treino pronto em menos de 3 minutos.
          </p>
          <Link
            href="/cadastro"
            className="h-14 px-10 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
          >
            Começar 3 dias grátis →
          </Link>
          <p className="text-xs text-white/25">
            Sem cobranças durante o trial · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </span>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">Início</Link>
            <Link href="/condominios" className="hover:text-white/60 transition-colors">Para condomínios</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Entrar</Link>
            <Link href="/termos" className="hover:text-white/60 transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white/60 transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Lets Train. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  )
}
