'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useOnboardingStore } from '@/stores/onboarding.store'
import Button from '@/components/ui/Button'

type Sexo = 'masculino' | 'feminino'

// ── Cálculos ──────────────────────────────────────────────────────────────────

function getIMCClassificacao(imc: number) {
  if (imc < 18.5) return { label: 'Abaixo do peso', cor: '#60A5FA' }
  if (imc < 25)   return { label: 'Peso ideal',     cor: '#FF8C00' }
  if (imc < 30)   return { label: 'Sobrepeso',      cor: '#FBBF24' }
  if (imc < 35)   return { label: 'Obesidade I',    cor: '#F87171' }
  if (imc < 40)   return { label: 'Obesidade II',   cor: '#EF4444' }
  return               { label: 'Obesidade III',   cor: '#DC2626' }
}

function calcTMB(peso: number, altura: number, idade: number, sexo: Sexo) {
  const base = 10 * peso + 6.25 * altura - 5 * idade
  return sexo === 'masculino' ? base + 5 : base - 161
}

function getAtividadeInfo(dias: number) {
  if (dias <= 3) return { mult: 1.375, label: 'Levemente ativo' }
  if (dias <= 5) return { mult: 1.55,  label: 'Moderadamente ativo' }
  return              { mult: 1.725, label: 'Muito ativo' }
}

function calcGorduraPct(imc: number, idade: number, sexo: Sexo) {
  const sexFactor = sexo === 'masculino' ? 10.8 : 0
  return Math.max(0, Math.round(((1.20 * imc) + (0.23 * idade) - sexFactor - 5.4) * 10) / 10)
}

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

function calcLBS(gorduraPct: number, peso: number, pesoIdealFitness: number, ffmi: number, idade: number, sexo: Sexo) {
  let c1: number
  if (sexo === 'masculino') {
    if (gorduraPct >= 10 && gorduraPct <= 18) c1 = 40
    else if (gorduraPct > 18) c1 = 40 - (gorduraPct - 18) * 2.2
    else c1 = 40 - (10 - gorduraPct) * 2
  } else {
    if (gorduraPct >= 18 && gorduraPct <= 28) c1 = 40
    else if (gorduraPct > 28) c1 = 40 - (gorduraPct - 28) * 2
    else c1 = 40 - (18 - gorduraPct) * 1.5
  }
  c1 = Math.max(0, Math.min(40, c1))
  const dif = Math.abs(peso - pesoIdealFitness) / pesoIdealFitness
  const c2 = Math.max(0, Math.min(20, 20 - dif * 100 * 0.8))
  let c3: number
  if (sexo === 'masculino') {
    if (ffmi >= 21.5) c3 = 20; else if (ffmi >= 19) c3 = 18; else if (ffmi >= 17) c3 = 14; else c3 = 10
  } else {
    if (ffmi >= 18) c3 = 20; else if (ffmi >= 16) c3 = 18; else if (ffmi >= 14) c3 = 14; else c3 = 10
  }
  const c4 = Math.max(12, Math.min(20, 20 - (idade - 18) * 0.2))
  return { total: Math.max(0, Math.min(100, Math.round(c1 + c2 + c3 + c4))), c1: Math.round(c1*10)/10, c2: Math.round(c2*10)/10, c3, c4: Math.round(c4*10)/10 }
}

function lbsClassif(score: number) {
  if (score >= 90) return { label: 'Elite',             cor: '#8B5CF6' }
  if (score >= 75) return { label: 'Muito bom',         cor: '#4ADE80' }
  if (score >= 60) return { label: 'Bom / em evolução', cor: '#FF8C00' }
  if (score >= 45) return { label: 'Atenção',           cor: '#FBBF24' }
  return               { label: 'Risco elevado',       cor: '#EF4444' }
}

// ── Gauge IMC ─────────────────────────────────────────────────────────────────

function IMCGauge({ imc }: { imc: number }) {
  const info = getIMCClassificacao(imc)
  // Mapa IMC 16–40 → 0–180 graus
  const pct = Math.min(Math.max((imc - 16) / (40 - 16), 0), 1)
  const angleDeg = pct * 180

  const cx = 100, cy = 90, r = 68, sw = 10
  const toRad = (d: number) => (d * Math.PI) / 180

  function pt(deg: number) {
    const a = toRad(180 + deg)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  function arc(start: number, end: number) {
    const s = pt(start), e = pt(end)
    const large = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const SEGMENTS = [
    { s: 0,   e: 30,  cor: '#60A5FA' }, // abaixo do peso
    { s: 32,  e: 83,  cor: '#4ADE80' }, // ideal
    { s: 85,  e: 117, cor: '#FBBF24' }, // sobrepeso
    { s: 119, e: 151, cor: '#F87171' }, // obeso I
    { s: 153, e: 180, cor: '#DC2626' }, // obeso II+
  ]

  const np = pt(angleDeg)

  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-[240px]">
      {/* trilha */}
      {SEGMENTS.map((seg, i) => (
        <path key={i} d={arc(seg.s, seg.e)} stroke={seg.cor} strokeWidth={sw} fill="none" strokeLinecap="round" opacity={0.2} />
      ))}
      {/* progresso ativo */}
      {angleDeg > 1 && (
        <path d={arc(0, angleDeg)} stroke={info.cor} strokeWidth={sw} fill="none" strokeLinecap="round" />
      )}
      {/* ponteiro */}
      <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke="white" strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />
      <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      {/* valor */}
      <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui">
        {imc.toFixed(1)}
      </text>
      <text x={cx} y={cy - 3} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="system-ui">
        IMC
      </text>
      {/* escala */}
      <text x={16} y={97} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">16</text>
      <text x={86} y={22} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">25</text>
      <text x={174} y={97} fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">40</text>
    </svg>
  )
}

// ── Score Gauge (circular) ────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const r = 72, cx = 100, cy = 100
  const circ = 2 * Math.PI * r
  const progress = circ * (score / 100)
  const { label, cor } = lbsClassif(score)
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={20}
        strokeLinecap="round" strokeDasharray={`${progress} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`} opacity={0.08} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={14}
        strokeLinecap="round" strokeDasharray={`${progress} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`} opacity={0.9} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="46" fontWeight="bold" fontFamily="system-ui">{score}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="system-ui" letterSpacing="1.5">LETS BODY SCORE</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill={cor} fontSize="11" fontWeight="bold" fontFamily="system-ui">{label}</text>
    </svg>
  )
}

// ── Card de dieta ─────────────────────────────────────────────────────────────

function DietCard({ titulo, meta, dica, cor }: { titulo: string; meta: string; dica: string; cor: string }) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-2" style={{ borderColor: cor + '35', backgroundColor: cor + '0A' }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">{titulo}</p>
        <span className="text-xs font-bold shrink-0" style={{ color: cor }}>{meta}</span>
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{dica}</p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DesempenhoPage() {
  const router = useRouter()
  const storeAnswers = useOnboardingStore((s) => s.answers)
  const [saving, setSaving] = useState(false)
  const [dados, setDados] = useState({
    peso: storeAnswers.peso ?? 0,
    altura: storeAnswers.altura ?? 0,
    idade: storeAnswers.idade ?? 0,
    dias: storeAnswers.dias_por_semana ?? 3,
    objetivo: storeAnswers.objetivo ?? [] as string[],
    sexo: (storeAnswers.sexo ?? 'masculino') as Sexo,
  })

  // Fallback: busca do banco se store estiver vazio (ex: reload)
  useEffect(() => {
    if (dados.peso) return
    async function fetchDados() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('user_profiles')
        .select('peso, altura, idade, dias_por_semana, objetivo, sexo')
        .eq('id', user.id)
        .single()
      if (data) {
        setDados({
          peso: data.peso ?? 70,
          altura: data.altura ?? 170,
          idade: data.idade ?? 30,
          dias: data.dias_por_semana ?? 3,
          objetivo: data.objetivo ? (data.objetivo as string).split(',') : [],
          sexo: ((data.sexo as Sexo) ?? 'masculino'),
        })
      }
    }
    fetchDados()
  }, [dados.peso, router])

  async function handleContinuar() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').update({ onboarding_etapa: '/local' }).eq('id', user.id)
    }
    router.push('/local')
  }

  const { peso, altura, idade, dias, objetivo, sexo } = dados
  const alturaM = altura / 100
  const imc = alturaM > 0 ? peso / (alturaM * alturaM) : 0
  const imcInfo = getIMCClassificacao(imc)
  const tmb = Math.round(calcTMB(peso, altura, idade, sexo))
  const atv = getAtividadeInfo(dias)
  const tdee = Math.round(tmb * atv.mult)

  // Lets Body Score
  const gorduraPct = imc > 0 ? calcGorduraPct(imc, idade, sexo) : 0
  const massaGorda = Math.round(peso * (gorduraPct / 100) * 10) / 10
  const massaMagra = Math.round((peso - massaGorda) * 10) / 10
  const ffmi = alturaM > 0 ? Math.round((massaMagra / (alturaM * alturaM)) * 10) / 10 : 0
  const pesosIdeais = calcPesosIdeais(massaMagra, sexo)
  const lbs = imc > 0 ? calcLBS(gorduraPct, peso, pesosIdeais.fitness, ffmi, idade, sexo) : null
  const lbsInfo = lbs ? lbsClassif(lbs.total) : null

  if (!imc) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#FF8C00] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-6 pt-2 pb-8">

      {/* Título */}
      <motion.div className="text-center w-full" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold">Desempenho & Projeção</h2>
        <p className="mt-1 text-sm text-white/50">Análise do seu perfil físico e metabólico</p>
      </motion.div>

      {/* ── LETS BODY SCORE ──────────────────────────────────────────────── */}
      {lbs && lbsInfo && (
        <motion.div
          className="w-full rounded-3xl border p-5 flex flex-col gap-4"
          style={{ borderColor: lbsInfo.cor + '30', backgroundColor: lbsInfo.cor + '06' }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">
                <span className="text-white">Lets</span>
                <span style={{ color: lbsInfo.cor }}> Body Score</span>
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">Avaliação física integrada</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: lbsInfo.cor + '20', color: lbsInfo.cor }}>
              {lbsInfo.label}
            </span>
          </div>

          <div className="flex justify-center">
            <ScoreGauge score={lbs.total} />
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide">Composição do score</p>
            {[
              { label: 'C1 — Composição corporal', value: lbs.c1, max: 40, cor: '#FF8C00' },
              { label: 'C2 — Peso funcional',      value: lbs.c2, max: 20, cor: '#4ADE80' },
              { label: 'C3 — Estrutura muscular',  value: lbs.c3, max: 20, cor: '#8B5CF6' },
              { label: 'C4 — Fator metabólico',    value: lbs.c4, max: 20, cor: '#60A5FA' },
            ].map(p => (
              <div key={p.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/45">{p.label}</span>
                  <span className="text-xs font-bold" style={{ color: p.cor }}>
                    {p.value} <span className="text-white/20 font-normal">/ {p.max}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.value / p.max) * 100}%`, backgroundColor: p.cor }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* IMC */}
      <motion.div
        className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      >
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold">Índice de Massa Corporal</p>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: imcInfo.cor + '20', color: imcInfo.cor }}>
            {imcInfo.label}
          </span>
        </div>
        <IMCGauge imc={imc} />
        <p className="text-xs text-white/35 text-center">
          {peso}kg ÷ ({alturaM.toFixed(2)}m)² = <strong className="text-white/60">{imc.toFixed(1)}</strong>
        </p>
      </motion.div>

      {/* TMB + TDEE */}
      <motion.div
        className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
      >
        <p className="text-sm font-semibold">Taxa Metabólica Basal (TMB)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center">
            <p className="text-2xl font-bold">{tmb}</p>
            <p className="text-[10px] text-white/40 mt-0.5 leading-tight">kcal em repouso</p>
          </div>
          <div className="rounded-2xl border p-3 text-center" style={{ borderColor: '#FF8C0030', backgroundColor: '#FF8C0008' }}>
            <p className="text-2xl font-bold text-[#FF8C00]">{tdee}</p>
            <p className="text-[10px] text-white/40 mt-0.5 leading-tight">kcal/dia com treino</p>
          </div>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          Com <strong className="text-white/60">{dias} treinos/semana</strong> ({atv.label}), você gasta aproximadamente <strong className="text-white/60">{tdee} kcal por dia</strong>. Use esse valor como referência para sua alimentação.
        </p>
      </motion.div>

      {/* Guia alimentar */}
      <motion.div
        className="w-full flex flex-col gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.21 }}
      >
        <p className="text-sm font-semibold">Guia alimentar para seus objetivos</p>

        {objetivo.includes('perda_peso') && (
          <DietCard
            titulo="🔥 Emagrecimento"
            meta={`~${tdee - 400} kcal/dia`}
            dica={`Déficit de 400 kcal/dia — perca ~0,5kg/semana de forma saudável. Priorize proteínas (2g/kg do peso) para preservar massa muscular durante o processo.`}
            cor="#F97316"
          />
        )}
        {objetivo.includes('ganho_massa') && (
          <DietCard
            titulo="💪 Ganho de Massa"
            meta={`~${tdee + 300} kcal/dia`}
            dica={`Superávit de 300 kcal/dia para ganho limpo. Consuma 2,2g de proteína por kg de peso e priorize treinos progressivos com descanso adequado.`}
            cor="#8B5CF6"
          />
        )}
        {objetivo.includes('qualidade_vida') && (
          <DietCard
            titulo="🌱 Qualidade de Vida"
            meta={`~${tdee} kcal/dia`}
            dica={`Manutenção calórica com alimentação variada e rica em nutrientes. Foque em hidratação (35ml/kg/dia), sono de qualidade e consistência nos treinos.`}
            cor="#4ADE80"
          />
        )}
        {objetivo.length === 0 && (
          <DietCard
            titulo="⚡ Equilíbrio"
            meta={`~${tdee} kcal/dia`}
            dica="Mantenha uma alimentação equilibrada e use seu gasto calórico como referência. Priorize alimentos naturais e pouco processados."
            cor="#FF8C00"
          />
        )}
      </motion.div>

      {/* CTAs */}
      <div className="w-full flex flex-col gap-3">
        <Button fullWidth loading={saving} onClick={handleContinuar}>
          Continuar
        </Button>
        <button
          type="button"
          onClick={() => router.push('/nivel')}
          className="text-sm text-white/30 hover:text-white/60 transition-colors text-center py-1"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
