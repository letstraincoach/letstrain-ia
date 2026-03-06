import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import AlbumConquistas from '@/components/gamification/AlbumConquistas'

type Sexo = 'masculino' | 'feminino'

// ── Cálculos metabólicos ──────────────────────────────────────────────────────

function imcClassif(imc: number) {
  if (imc < 18.5) return { label: 'Abaixo do peso', cor: '#60A5FA' }
  if (imc < 25)   return { label: 'Peso ideal',     cor: '#4ADE80' }
  if (imc < 30)   return { label: 'Sobrepeso',      cor: '#FBBF24' }
  if (imc < 35)   return { label: 'Obesidade I',    cor: '#F87171' }
  if (imc < 40)   return { label: 'Obesidade II',   cor: '#EF4444' }
  return               { label: 'Obesidade III',   cor: '#DC2626' }
}

function calcTMB(peso: number, alturaCm: number, idade: number, sexo: Sexo) {
  const base = 10 * peso + 6.25 * alturaCm - 5 * idade
  return Math.round(sexo === 'masculino' ? base + 5 : base - 161)
}

// Peso ideal baseado na composição corporal — massaMagra / (1 − %gorduraAlvo)
function calcPesosIdeais(massaMagra: number, sexo: Sexo) {
  const alvos = sexo === 'masculino'
    ? { saude: 0.18, fitness: 0.15, atletico: 0.10 }
    : { saude: 0.28, fitness: 0.24, atletico: 0.20 }
  return {
    saude:    Math.round(massaMagra / (1 - alvos.saude)    * 10) / 10,
    fitness:  Math.round(massaMagra / (1 - alvos.fitness)  * 10) / 10,
    atletico: Math.round(massaMagra / (1 - alvos.atletico) * 10) / 10,
  }
}

function calcGorduraPct(imc: number, idade: number, sexo: Sexo) {
  // Fórmula de Deurenberg
  const sexFactor = sexo === 'masculino' ? 10.8 : 0
  return Math.max(0, Math.round(((1.20 * imc) + (0.23 * idade) - sexFactor - 5.4) * 10) / 10)
}

function gorduraClassif(pct: number, sexo: Sexo) {
  const m = sexo === 'masculino'
  if (m) {
    if (pct < 6)  return { label: 'Essencial',  cor: '#60A5FA' }
    if (pct < 14) return { label: 'Atlético',   cor: '#4ADE80' }
    if (pct < 18) return { label: 'Bom',        cor: '#4ADE80' }
    if (pct < 25) return { label: 'Aceitável',  cor: '#FBBF24' }
    return             { label: 'Elevado',     cor: '#F87171' }
  } else {
    if (pct < 14) return { label: 'Essencial',  cor: '#60A5FA' }
    if (pct < 21) return { label: 'Atlético',   cor: '#4ADE80' }
    if (pct < 25) return { label: 'Bom',        cor: '#4ADE80' }
    if (pct < 32) return { label: 'Aceitável',  cor: '#FBBF24' }
    return             { label: 'Elevado',     cor: '#F87171' }
  }
}

function ffmiClassif(ffmi: number) {
  if (ffmi < 18) return { label: 'Baixo',    cor: '#60A5FA' }
  if (ffmi < 20) return { label: 'Normal',   cor: '#4ADE80' }
  if (ffmi < 23) return { label: 'Atlético', cor: '#FF8C00' }
  return               { label: 'Elite',     cor: '#8B5CF6' }
}

function riscoClassif(imc: number, gordura: number, idade: number) {
  let score = 0
  if (imc >= 30) score += 2; else if (imc >= 25) score += 1
  if (gordura >= 30) score += 2; else if (gordura >= 25) score += 1
  if (idade >= 50) score += 1; else if (idade >= 40) score += 0.5
  if (score >= 4) return { label: 'Alto',     cor: '#EF4444', emoji: '⚠️' }
  if (score >= 2) return { label: 'Moderado', cor: '#FBBF24', emoji: '⚡' }
  return               { label: 'Baixo',     cor: '#4ADE80', emoji: '✅' }
}

const GET_LEVELS = [
  { tag: 'sed',  mult: 1.20, label: 'Sedentário',          dias: '0–1 dias/sem' },
  { tag: 'leve', mult: 1.37, label: 'Levemente ativo',     dias: '2–3 dias/sem' },
  { tag: 'mod',  mult: 1.55, label: 'Moderadamente ativo', dias: '4–5 dias/sem' },
  { tag: 'alto', mult: 1.72, label: 'Muito ativo',         dias: '6–7 dias/sem' },
]

function activeGetTag(dias: number) {
  if (dias <= 1) return 'sed'
  if (dias <= 3) return 'leve'
  if (dias <= 5) return 'mod'
  return 'alto'
}

// ── IMC Gauge SVG ─────────────────────────────────────────────────────────────

function IMCGauge({ imc }: { imc: number }) {
  const info = imcClassif(imc)
  const pct  = Math.min(Math.max((imc - 16) / (40 - 16), 0), 1)
  const angleDeg = pct * 180
  const cx = 100, cy = 90, r = 68, sw = 10
  const toRad = (d: number) => (d * Math.PI) / 180

  function pt(deg: number) {
    const a = toRad(180 + deg)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  function arcPath(s: number, e: number) {
    const sp = pt(s), ep = pt(e)
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`
  }

  const SEGS = [
    { s: 0,   e: 30,  c: '#60A5FA' },
    { s: 32,  e: 83,  c: '#4ADE80' },
    { s: 85,  e: 117, c: '#FBBF24' },
    { s: 119, e: 151, c: '#F87171' },
    { s: 153, e: 180, c: '#DC2626' },
  ]
  const np = pt(angleDeg)

  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-[240px]">
      {SEGS.map((seg, i) => (
        <path key={i} d={arcPath(seg.s, seg.e)} stroke={seg.c} strokeWidth={sw}
          fill="none" strokeLinecap="round" opacity={0.25} />
      ))}
      {angleDeg > 1 && (
        <path d={arcPath(0, angleDeg)} stroke={info.cor} strokeWidth={sw}
          fill="none" strokeLinecap="round" />
      )}
      <line x1={cx} y1={cy} x2={np.x} y2={np.y}
        stroke="white" strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />
      <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="white"
        fontSize="20" fontWeight="bold" fontFamily="system-ui">
        {imc.toFixed(1)}
      </text>
      <text x={cx} y={cy - 3} textAnchor="middle"
        fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="system-ui">
        IMC
      </text>
      <text x={16} y={97} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">16</text>
      <text x={86} y={22} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">25</text>
      <text x={174} y={97} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">40</text>
    </svg>
  )
}

// ── Calendário de treinos ─────────────────────────────────────────────────────

function WorkoutCalendar({ executedDates }: { executedDates: Set<string> }) {
  const today = new Date()
  const days: Date[] = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  const firstDow = days[0].getDay()
  const paddingDays = Array(firstDow).fill(null) as null[]
  const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-xs text-white/30 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square rounded-md" />
        ))}
        {days.map((d) => {
          const iso = d.toISOString().split('T')[0]
          const isToday = iso === today.toISOString().split('T')[0]
          const trained = executedDates.has(iso)
          return (
            <div key={iso} title={iso}
              className={`aspect-square rounded-md flex items-center justify-center
                ${trained
                  ? 'bg-[#FF8C00] shadow-[0_0_8px_rgba(255,140,0,0.4)]'
                  : isToday
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/[0.04]'
                }`}
            >
              {isToday && !trained && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FF8C00]" />
          <span className="text-xs text-white/40">Treinou</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-white/[0.04] border border-white/20" />
          <span className="text-xs text-white/40">Hoje</span>
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, progressResult, workoutsResult, allAchievementsResult, userAchievementsResult] =
    await Promise.all([
      supabase
        .from('user_profiles')
        .select('nome, nivel_atual, peso, altura, idade, sexo, objetivo, dias_por_semana')
        .eq('id', user.id)
        .single(),

      supabase
        .from('user_progress')
        .select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo')
        .eq('id', user.id)
        .single(),

      supabase
        .from('workouts')
        .select('data, status')
        .eq('user_id', user.id)
        .eq('status', 'executado')
        .gte('data', (() => {
          const d = new Date(); d.setDate(d.getDate() - 34)
          return d.toISOString().split('T')[0]
        })()),

      supabase.from('achievements')
        .select('id, codigo, nome, descricao, icone_emoji, criterio_tipo'),

      supabase.from('user_achievements')
        .select('achievement_id, desbloqueado_em')
        .eq('user_id', user.id),
    ])

  const profile         = profileResult.data
  const progress        = progressResult.data
  const workouts        = workoutsResult.data ?? []
  const allAchievements = allAchievementsResult.data ?? []
  const userAchievements = userAchievementsResult.data ?? []

  const nivel     = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg  = LEVEL_CONFIG[nivel]
  const treinos   = progress?.treinos_nivel_atual ?? 0
  const treinosNecessarios = levelCfg.treinos_necessarios ?? 1
  const progressoPct = Math.min(Math.round((treinos / treinosNecessarios) * 100), 100)
  const executedDates = new Set(workouts.map((w) => w.data as string))
  const unlockedCount = userAchievements.length

  // ── Métricas metabólicas (apenas se perfil completo) ─────────────────────
  const hasMeta = !!(profile?.peso && profile?.altura && profile?.idade && profile?.sexo)

  let meta: {
    imc: number; imcInfo: ReturnType<typeof imcClassif>
    pesosIdeais: ReturnType<typeof calcPesosIdeais>; pesoDiff: number
    tmb: number
    gorduraPct: number; gorduraInfo: ReturnType<typeof gorduraClassif>
    massaGorda: number; massaMagra: number
    ffmi: number; ffmiInfo: ReturnType<typeof ffmiClassif>
    risco: ReturnType<typeof riscoClassif>
    tdee: number; activeTag: string
    objetivos: string[]
  } | null = null

  if (hasMeta) {
    const peso     = profile!.peso as number
    const alturaCm = profile!.altura as number
    const idade    = profile!.idade as number
    const sexo     = (profile!.sexo as Sexo) ?? 'masculino'
    const dias     = profile!.dias_por_semana ?? 3
    const alturaM  = alturaCm / 100

    const imc        = peso / (alturaM * alturaM)
    const tmb        = calcTMB(peso, alturaCm, idade, sexo)
    const gorduraPct = calcGorduraPct(imc, idade, sexo)
    const massaGorda = Math.round(peso * (gorduraPct / 100) * 10) / 10
    const massaMagra = Math.round((peso - massaGorda) * 10) / 10
    const ffmi       = Math.round((massaMagra / (alturaM * alturaM)) * 10) / 10
    const pesosIdeais = calcPesosIdeais(massaMagra, sexo)
    const activeTag  = activeGetTag(dias)
    const activeMult = GET_LEVELS.find(g => g.tag === activeTag)!.mult
    const objetivos  = profile!.objetivo
      ? (profile!.objetivo as string).split(',').map(s => s.trim())
      : []

    meta = {
      imc: Math.round(imc * 10) / 10,
      imcInfo: imcClassif(imc),
      pesosIdeais,
      pesoDiff: Math.round((peso - pesosIdeais.saude) * 10) / 10,
      tmb,
      gorduraPct,
      gorduraInfo: gorduraClassif(gorduraPct, sexo),
      massaGorda,
      massaMagra,
      ffmi,
      ffmiInfo: ffmiClassif(ffmi),
      risco: riscoClassif(imc, gorduraPct, idade),
      tdee: Math.round(tmb * activeMult),
      activeTag,
      objetivos,
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-sm text-white/50 mt-1">Sua evolução na jornada Lets Train</p>
        </div>

        {/* Nível atual + barra */}
        <div className="rounded-3xl border p-6 flex flex-col gap-4"
          style={{ borderColor: levelCfg.cor + '30', backgroundColor: levelCfg.corBg }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50 mb-1">Nível atual</p>
              <span className="text-xl font-bold flex items-center gap-2" style={{ color: levelCfg.cor }}>
                {levelCfg.emoji} {levelCfg.label}
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: levelCfg.cor + '20' }}>
              {levelCfg.emoji}
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{levelCfg.descricao}</p>
          {levelCfg.proximo && (
            <>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Progresso para {LEVEL_CONFIG[levelCfg.proximo].emoji} {LEVEL_CONFIG[levelCfg.proximo].label}</span>
                <span>{treinos} / {treinosNecessarios}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressoPct}%`, backgroundColor: levelCfg.cor }} />
              </div>
              <p className="text-xs text-white/40">
                {treinosNecessarios - treinos > 0
                  ? `Faltam ${treinosNecessarios - treinos} treinos para subir de nível`
                  : 'Pronto para subir! Complete mais um treino 🎉'}
              </p>
            </>
          )}
          {!levelCfg.proximo && (
            <p className="text-xs text-white/60 font-semibold">
              Você chegou ao topo! 👑 Nível máximo alcançado.
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Treinos totais',   value: String(progress?.treinos_totais ?? 0) },
            { label: 'Sequência atual',  value: `🔥 ${progress?.streak_atual ?? 0}`  },
            { label: 'Melhor sequência', value: `⚡ ${progress?.streak_maximo ?? 0}` },
            { label: 'Conquistas',       value: `${unlockedCount} / ${allAchievements.length}` },
          ].map((stat) => (
            <div key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Desempenho & Projeção ──────────────────────────────────────── */}
        {meta && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold">Desempenho &amp; Projeção</h2>
              <p className="text-xs text-white/40 mt-0.5">Análise do seu perfil físico e metabólico</p>
            </div>

            {/* IMC */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm font-semibold">Índice de Massa Corporal</p>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: meta.imcInfo.cor + '20', color: meta.imcInfo.cor }}>
                  {meta.imcInfo.label}
                </span>
              </div>
              <IMCGauge imc={meta.imc} />
              <p className="text-xs text-white/35 text-center">
                IMC <strong className="text-white/60">{meta.imc}</strong> — {meta.imcInfo.label}
              </p>
            </div>

            {/* Peso Ideal — baseado em composição corporal */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold">Peso Ideal (Composição Corporal)</p>
                <p className="text-[10px] text-white/35 mt-0.5">
                  Baseado na massa magra e metas de gordura por categoria
                </p>
              </div>

              {/* Grid 4 células: Atual / Saúde / Fitness / Atlético */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Peso atual',
                    value: `${profile!.peso} kg`,
                    sub: `${meta.gorduraPct}% gordura`,
                    cor: '#FFFFFF',
                    bg: 'bg-white/[0.04]',
                    border: 'border-white/10',
                  },
                  {
                    label: '💚 Saúde',
                    value: `${meta.pesosIdeais.saude} kg`,
                    sub: profile!.sexo === 'feminino' ? 'meta 28% gordura' : 'meta 18% gordura',
                    cor: '#4ADE80',
                    bg: '',
                    border: 'border-[#4ADE80]/25',
                  },
                  {
                    label: '🔥 Fitness',
                    value: `${meta.pesosIdeais.fitness} kg`,
                    sub: profile!.sexo === 'feminino' ? 'meta 24% gordura' : 'meta 15% gordura',
                    cor: '#FF8C00',
                    bg: '',
                    border: 'border-[#FF8C00]/25',
                  },
                  {
                    label: '⚡ Atlético',
                    value: `${meta.pesosIdeais.atletico} kg`,
                    sub: profile!.sexo === 'feminino' ? 'meta 20% gordura' : 'meta 10% gordura',
                    cor: '#8B5CF6',
                    bg: '',
                    border: 'border-[#8B5CF6]/25',
                  },
                ].map(cell => (
                  <div key={cell.label}
                    className={`rounded-2xl border ${cell.border} ${cell.bg || 'bg-white/[0.02]'} p-4 flex flex-col gap-1`}>
                    <p className="text-[10px] text-white/40 font-medium">{cell.label}</p>
                    <p className="text-xl font-bold" style={{ color: cell.cor }}>{cell.value}</p>
                    <p className="text-[10px] text-white/30">{cell.sub}</p>
                  </div>
                ))}
              </div>

              {meta.pesoDiff > 0 && (
                <p className="text-xs text-white/35 leading-relaxed">
                  Para atingir o peso de saúde, você precisa perder{' '}
                  <strong className="text-white/60">{meta.pesoDiff} kg</strong> — aproximadamente{' '}
                  <strong className="text-white/60">{Math.ceil(meta.pesoDiff / 0.5)} semanas</strong> com déficit de 400 kcal/dia.
                </p>
              )}
              {meta.pesoDiff <= 0 && (
                <p className="text-xs text-green-400/70 leading-relaxed">
                  Você já está no peso de saúde ou abaixo dele. Foque em composição corporal e qualidade muscular.
                </p>
              )}

              <p className="text-[10px] text-white/20 leading-relaxed">
                Cálculo: massa magra ÷ (1 − % gordura alvo). Estimativa baseada em método científico populacional.
              </p>
            </div>

            {/* Composição corporal */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold">Composição Corporal Estimada</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    title: 'Gordura corporal',
                    value: `${meta.gorduraPct}%`,
                    sub: meta.gorduraInfo.label,
                    cor: meta.gorduraInfo.cor,
                  },
                  {
                    title: 'Massa gorda',
                    value: `${meta.massaGorda} kg`,
                    sub: 'gordura total',
                    cor: '#FBBF24',
                  },
                  {
                    title: 'Massa magra',
                    value: `${meta.massaMagra} kg`,
                    sub: 'músculo + osso',
                    cor: '#4ADE80',
                  },
                  {
                    title: 'FFMI',
                    value: meta.ffmi.toFixed(1),
                    sub: meta.ffmiInfo.label,
                    cor: meta.ffmiInfo.cor,
                  },
                ].map(card => (
                  <div key={card.title}
                    className="rounded-2xl border bg-white/[0.03] p-3 flex flex-col gap-1"
                    style={{ borderColor: card.cor + '30' }}>
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">{card.title}</p>
                    <p className="text-xl font-bold" style={{ color: card.cor }}>{card.value}</p>
                    <p className="text-[10px] text-white/40">{card.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed">
                Estimativa baseada na fórmula de Deurenberg (IMC + idade). Não substitui avaliação clínica.
              </p>
            </div>

            {/* Metabolismo */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold">Taxa Metabólica Basal</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center">
                  <p className="text-2xl font-bold">{meta.tmb}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">kcal em repouso</p>
                </div>
                <div className="rounded-2xl border p-3 text-center"
                  style={{ borderColor: '#FF8C0030', backgroundColor: '#FF8C0008' }}>
                  <p className="text-2xl font-bold text-[#FF8C00]">{meta.tdee}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">kcal/dia atual</p>
                </div>
              </div>

              {/* GET table */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-white/40 mb-1">Gasto energético por nível de atividade</p>
                {GET_LEVELS.map(row => {
                  const kcal = Math.round(meta!.tmb * row.mult)
                  const active = row.tag === meta!.activeTag
                  return (
                    <div key={row.tag}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all
                        ${active ? 'bg-[#FF8C00]/10 border border-[#FF8C00]/30' : 'bg-white/[0.02] border border-transparent'}`}>
                      <div>
                        <p className={`text-xs font-medium ${active ? 'text-[#FF8C00]' : 'text-white/60'}`}>
                          {row.label} {active && '← você'}
                        </p>
                        <p className="text-[10px] text-white/30">{row.dias}</p>
                      </div>
                      <p className={`text-sm font-bold ${active ? 'text-[#FF8C00]' : 'text-white/50'}`}>
                        {kcal} kcal
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Metas calóricas */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
              <p className="text-sm font-semibold">Metas Calóricas</p>
              <div className="flex flex-col gap-2">
                {meta.objetivos.includes('perda_peso') && (
                  <div className="rounded-2xl border p-4 flex flex-col gap-1.5"
                    style={{ borderColor: '#F9731630', backgroundColor: '#F9731608' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">🔥 Emagrecimento</p>
                      <span className="text-sm font-bold text-[#F97316]">~{meta.tdee - 400} kcal/dia</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Déficit de 400 kcal — perca ~0,5 kg/semana. Priorize proteínas (2 g/kg) para preservar massa muscular.
                    </p>
                  </div>
                )}
                {meta.objetivos.includes('ganho_massa') && (
                  <div className="rounded-2xl border p-4 flex flex-col gap-1.5"
                    style={{ borderColor: '#8B5CF630', backgroundColor: '#8B5CF608' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">💪 Ganho de massa</p>
                      <span className="text-sm font-bold text-[#8B5CF6]">~{meta.tdee + 300} kcal/dia</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Superávit de 300 kcal — ganho limpo. Consuma 2,2 g de proteína por kg de peso.
                    </p>
                  </div>
                )}
                {meta.objetivos.includes('qualidade_vida') && (
                  <div className="rounded-2xl border p-4 flex flex-col gap-1.5"
                    style={{ borderColor: '#4ADE8030', backgroundColor: '#4ADE8008' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">🌱 Qualidade de vida</p>
                      <span className="text-sm font-bold text-[#4ADE80]">~{meta.tdee} kcal/dia</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Manutenção calórica. Foque em hidratação (35 ml/kg/dia), sono e consistência nos treinos.
                    </p>
                  </div>
                )}
                {meta.objetivos.length === 0 && (
                  <div className="rounded-2xl border border-white/10 p-4 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">⚡ Manutenção</p>
                      <span className="text-sm font-bold text-[#FF8C00]">~{meta.tdee} kcal/dia</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Use seu gasto calórico como referência. Priorize alimentos naturais e pouco processados.
                    </p>
                  </div>
                )}
                {/* Sempre exibe os dois cenários extras */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-0.5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">Déficit leve</p>
                    <p className="text-base font-bold text-yellow-400">{meta.tdee - 300}</p>
                    <p className="text-[10px] text-white/30">−300 kcal/dia</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-0.5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">Superávit</p>
                    <p className="text-base font-bold text-purple-400">{meta.tdee + 250}</p>
                    <p className="text-[10px] text-white/30">+250 kcal/dia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de saúde */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold">Indicadores de Saúde</p>
              <div className="flex flex-col gap-3">

                {/* Risco metabólico */}
                <div className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  style={{ borderColor: meta.risco.cor + '30', backgroundColor: meta.risco.cor + '08' }}>
                  <div>
                    <p className="text-xs text-white/50">Risco metabólico</p>
                    <p className="text-[10px] text-white/30 mt-0.5">IMC + gordura + idade</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.risco.emoji}</span>
                    <p className="text-sm font-bold" style={{ color: meta.risco.cor }}>
                      {meta.risco.label}
                    </p>
                  </div>
                </div>

              </div>
              <p className="text-[10px] text-white/25 leading-relaxed">
                Indicadores estimados com base em dados populacionais. Consulte um profissional de saúde para avaliação clínica completa.
              </p>
            </div>
          </div>
        )}

        {/* Calendário */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Calendário (últimas 5 semanas)</h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <WorkoutCalendar executedDates={executedDates} />
          </div>
        </div>

        {/* Álbum de Conquistas */}
        <AlbumConquistas
          achievements={allAchievements}
          userAchievements={userAchievements}
          totalDesbloqueadas={unlockedCount}
        />

        <div className="pb-8" />
      </div>
    </div>
  )
}
