import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lets Train — Método LETS TRAIN com suporte da Inteligência Artificial.',
  description: 'Treinos diários com o Método LETS TRAIN e suporte da Inteligência Artificial. Progressão automática, 59 conquistas e Lets Body Score. Comece com 3 dias grátis.',
  openGraph: {
    title: 'Lets Train — Método LETS TRAIN + Inteligência Artificial.',
    description: 'Treinos diários com o Método LETS TRAIN. 15 níveis de progressão, 59 conquistas, Lets Body Score. 3 dias grátis — sem cobranças durante o trial.',
    url: 'https://letstrain.com.br',
  },
  twitter: {
    title: 'Lets Train — Método LETS TRAIN + Inteligência Artificial.',
    description: 'Treinos com o Método LETS TRAIN e suporte da IA. 3 dias grátis, sem cobranças durante o trial.',
  },
  alternates: {
    canonical: '/',
  },
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
      <section className="px-6 pt-16 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* Texto */}
          <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full px-4 py-1.5">
              <span className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest">3 dias grátis — sem cartão</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              Método Lets Train{' '}
              <span className="text-[#FF8C00]">+</span>{' '}
              Inteligência Artificial{' '}
              <span className="text-[#FF8C00]">=</span>{' '}
              <span className="text-[#FF8C00]">Evolução todo dia.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-lg">
              A metodologia Time Efficient do Personal Guilherme agora na palma da sua mão.
              Treinos diários personalizados para condomínio ou hotel, com progressão automática.
            </p>

            <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.05] px-4 py-3 max-w-lg w-full">
              <p className="text-sm text-white/60 leading-relaxed">
                Não tem equipamento suficiente no condomínio ou no hotel? Tire fotos do espaço e a nossa IA cruza os dados com a Metodologia da Academia LETS TRAIN — e envia treinos personalizados para você.
              </p>
            </div>

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

          {/* Mockup CSS do app */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[260px]">
              {/* Phone frame */}
              <div className="w-full rounded-[2.5rem] border-2 border-white/[0.12] bg-[#111] shadow-2xl overflow-hidden">
                {/* Notch bar */}
                <div className="bg-[#0d0d0d] px-5 pt-4 pb-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  </div>
                  <div className="w-6 h-1 rounded-full bg-white/10" />
                  <div className="w-5 h-1 rounded-full bg-white/10" />
                </div>

                {/* App content */}
                <div className="bg-[#111] px-4 pb-5 pt-3 flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Treino de Hoje</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black">Personal Guilherme</p>
                      <span className="text-[10px] text-[#FF8C00] font-bold bg-[#FF8C00]/10 px-2 py-0.5 rounded-full">Nível 3</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Blocos */}
                  {[
                    { label: 'Preparação', desc: 'Mobilidade · 8 min', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Força', desc: 'Supino · Remada · Desenvolvimento', color: '#FF8C00', bg: 'rgba(255,140,0,0.08)' },
                    { label: 'Circuito', desc: '4 exerc. · 3 rounds · 40s', color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
                    { label: 'Finisher', desc: 'Burpee · 30s · AMRAP', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
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

                  {/* CTA dentro do mockup */}
                  <div className="mt-1 h-9 rounded-xl bg-[#FF8C00] flex items-center justify-center gap-1.5">
                    <span className="text-black font-bold text-[10px] tracking-wide">▶  INICIAR TREINO</span>
                  </div>
                </div>
              </div>

              {/* Glow de fundo */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#FF8C00]/20 blur-3xl rounded-full pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Prova social / números ──────────────────────────── */}
      <section className="px-6 py-12 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
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

      {/* ── App Showcase ─────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">App na prática</p>
            <h2 className="text-2xl sm:text-3xl font-black">Veja como funciona.</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 lg:justify-center snap-x snap-mandatory">
            {/* Phone 1 — Check-in */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-widest">Check-in</p>
                  <p className="text-[11px] font-bold leading-tight">Como você está hoje?</p>
                  <div className="flex flex-col gap-1.5">
                    {['😴 Cansado', '😊 Normal', '💪 Animado'].map((opt, i) => (
                      <div
                        key={opt}
                        className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium"
                        style={i === 1
                          ? { background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.4)', color: '#FF8C00' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                        }
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 h-7 rounded-lg bg-[#FF8C00] flex items-center justify-center">
                    <span className="text-black font-bold text-[10px]">Confirmar</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Registre como você está antes de treinar</p>
            </div>

            {/* Phone 2 — Exercício */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#FF8C00] font-bold uppercase">Força — 2/4</span>
                    <span className="text-[9px] text-white/30">3×12</span>
                  </div>
                  <p className="text-[12px] font-black leading-tight">Supino Reto<br />com Halteres</p>
                  <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-lg p-2">
                    <p className="text-[9px] text-white/50 leading-relaxed">Deite no banco, halteres na altura do peito. Empurre até estender os braços. Desça controlado.</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[1,2,3].map((s) => (
                      <div
                        key={s}
                        className="flex-1 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                        style={s <= 2
                          ? { background: 'rgba(255,140,0,0.2)', color: '#FF8C00' }
                          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
                        }
                      >
                        {s <= 2 ? '✓' : s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Execute guiado, série por série</p>
            </div>

            {/* Phone 3 — Conquista */}
            <div className="shrink-0 snap-center flex flex-col items-center gap-4 w-[200px]">
              <div className="w-full rounded-[2rem] border-2 border-white/[0.10] bg-[#111] overflow-hidden">
                <div className="bg-[#0d0d0d] h-6 flex items-center justify-center">
                  <div className="w-12 h-1 rounded-full bg-white/10" />
                </div>
                <div className="p-3 flex flex-col items-center gap-2 text-center">
                  <p className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-widest">Conquista!</p>
                  {/* Figurinha simulada */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'linear-gradient(135deg,rgba(255,140,0,0.3),rgba(255,200,0,0.15))', border: '2px solid rgba(255,140,0,0.4)' }}>
                    🔥
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#FF8C00]">Sequência de 7 dias</p>
                    <p className="text-[9px] text-white/40 mt-0.5">Figurinha desbloqueada!</p>
                  </div>
                  <div className="w-full h-7 rounded-lg mt-1 flex items-center justify-center text-[10px] font-bold text-[#FF8C00]"
                    style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)' }}>
                    Ver álbum →
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center leading-tight">Desbloqueie conquistas a cada marco</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Como funciona</p>
            <h2 className="text-2xl sm:text-3xl font-black">Simples assim.</h2>
          </div>

          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            {[
              {
                num: '01',
                title: 'Faz o onboarding',
                desc: 'Conta seu nível, objetivo, onde treina e os equipamentos disponíveis. Leva menos de 3 minutos.',
              },
              {
                num: '02',
                title: 'Método Lets Train + Inteligência Artificial',
                desc: 'Cada dia, um treino novo. Personalizado pro seu nível, objetivo e equipamentos — com exercícios da metodologia Lets Train.',
              },
              {
                num: '03',
                title: 'Executa e evolui',
                desc: 'Conclui o treino, sobe de nível, desbloqueia conquistas e acumula Lets Coins. A progressão acontece automaticamente.',
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
                  <p className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest mb-1">{step.num}</p>
                  <p className="font-bold text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ──────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Resultados reais</p>
            <h2 className="text-2xl sm:text-3xl font-black">Quem já treina com a Lets Train.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                initials: 'LM',
                name: 'Lucas M.',
                city: 'São Paulo',
                result: 'Perdeu 8kg em 3 meses',
                quote: 'Nunca consegui manter uma rotina de treino. O app me mantém consistente porque o treino muda todo dia — e o app cobra se eu ficar parado.',
                months: '4 meses de Lets Train',
              },
              {
                initials: 'FR',
                name: 'Fernanda R.',
                city: 'Florianópolis',
                result: 'Ganhou 4kg de massa',
                quote: 'A progressão automática é incrível. Cheguei no nível Atleta em 5 meses sem precisar ficar calculando carga — o app ajusta tudo.',
                months: '5 meses de Lets Train',
              },
              {
                initials: 'RS',
                name: 'Rafael S.',
                city: 'Curitiba',
                result: 'Streak de 47 dias',
                quote: 'Faço tudo no condomínio do prédio. Com pouco equipamento o app ainda gera treinos completos e variados. 23 conquistas desbloqueadas.',
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

      {/* ── Personal Trainer ────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
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
                  A IA cruza dados com os da metodologia LETS TRAIN e prepara o seu melhor treino.
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
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">O que está incluso</p>
            <h2 className="text-2xl sm:text-3xl font-black">Tudo que você precisa.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Treinos Diários', desc: 'Metodologia Time Efficient da Lets Train, com acompanhamento da Inteligência Artificial.' },
              { title: 'Progressão automática', desc: '15 níveis. Sobe quando bate as metas. Intensidade adapta sozinha.' },
              { title: 'Álbum de conquistas', desc: '59 figurinhas para colecionar. Streak, jejum, diversidade e mais.' },
              { title: 'Lets Coins', desc: 'Ganhe moedas por treino e troque por descontos reais.' },
              { title: 'Jejum intermitente', desc: 'Timer ao vivo com alertas de milestone. Integrado às conquistas.' },
              { title: 'Treino 4 blocos', desc: 'Preparação → Força → Circuito → Finisher. Estrutura profissional.' },
              { title: 'Lembretes push', desc: 'Notificações nos dias e horários que você escolher.' },
              { title: 'Lets Body Score', desc: 'Score 0-100 com 4 pilares e 15 indicadores metabólicos.' },
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

      {/* ── Locais de treino ────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Funciona onde você estiver</p>
            <h2 className="text-2xl sm:text-3xl font-black">Seu treino,<br />em qualquer lugar.</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
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
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Preços</p>
            <h2 className="text-2xl sm:text-3xl font-black">Simples e transparente.</h2>
            <p className="text-sm text-white/40 mt-2">3 dias grátis em todos os planos. Sem cobranças durante o trial.</p>
          </div>

          <div className="flex flex-col gap-4 max-w-md mx-auto w-full">

            {/* Plano Anual — destaque */}
            <div className="relative rounded-2xl border border-[#FF8C00] bg-[#FF8C00]/[0.06] p-6 flex flex-col gap-4">
              <span className="absolute -top-3 left-5 bg-[#FF8C00] text-black text-xs font-bold px-3 py-0.5 rounded-full">
                Melhor custo-benefício
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
                Começar 3 dias grátis →
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
                Começar 3 dias grátis →
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
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

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">Dúvidas frequentes</p>
            <h2 className="text-2xl sm:text-3xl font-black">Perguntas & Respostas.</h2>
          </div>

          <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
            {[
              {
                q: 'O trial de 3 dias é realmente grátis?',
                a: 'Sim, 100% grátis. Você não é cobrado durante os 3 dias de trial. Se cancelar antes do trial acabar, não paga nada. Prometemos.',
              },
              {
                q: 'Funciona para quem é iniciante?',
                a: 'Sim. O app começa no nível Adaptação — treinos mais suaves e técnicos. Conforme você evolui e bate as metas, o app sobe de nível automaticamente. Não precisa saber nada de musculação.',
              },
              {
                q: 'Preciso de academia ou equipamentos caros?',
                a: 'Não. A Lets Train funciona em academia de condomínio ou hotel — com halteres básicos, colchonete ou até peso corporal. A IA adapta o treino ao que você tem disponível.',
              },
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim. Sem fidelidade, sem multa, sem burocracia. Cancele em 1 clique direto pelo app, nas configurações de assinatura.',
              },
              {
                q: 'O que é o Lets Body Score?',
                a: 'É um score de 0 a 100 que avalia sua composição corporal com base em 4 pilares: IMC, percentual de gordura estimado, relação cintura/quadril e desempenho nos treinos. Atualiza conforme você registra suas medidas.',
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
            Metodologia real,<br />
            <span className="text-[#FF8C00]">resultados de verdade.</span>
          </h2>
          <p className="text-sm text-white/45 leading-relaxed">
            Comece hoje, sem risco. 3 dias grátis para experimentar tudo.
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

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
