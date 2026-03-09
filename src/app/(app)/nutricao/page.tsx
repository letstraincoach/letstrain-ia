import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { calcularMetaCalorica, calcularMetaProteina, TIPO_LABELS, TIPO_ICONS } from '@/lib/nutrition/foods'
import NutritionSummary from '@/components/nutrition/NutritionSummary'
import FoodLoggerWrapper from '@/components/nutrition/FoodLoggerWrapper'
import DeleteButton from '@/components/nutrition/DeleteButton'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any

export default async function NutricaoPage() {
  const supabase = await createClient()
  const sb = supabase as AnySupabase

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date().toISOString().slice(0, 10)

  const [profileResult, logsResult, ontemResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('peso, altura, idade, sexo, objetivo, dias_por_semana')
      .eq('id', user.id)
      .single(),
    sb
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', hoje)
      .order('criado_em', { ascending: true }),
    sb
      .from('food_logs')
      .select('id, tipo, calorias_total, items')
      .eq('user_id', user.id)
      .eq('data', new Date(Date.now() - 86400000).toISOString().slice(0, 10))
      .order('criado_em', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data
  const logs: Array<{
    id: string
    tipo: string
    calorias_total: number
    proteina_total: number
    carbo_total: number
    gordura_total: number
    items: Array<{ food_id: string; nome: string; icone: string; quantidade: number; calorias: number; proteina_g: number; carbo_g: number; gordura_g: number }>
  }> = logsResult.data ?? []

  const logsOntem: Array<{ id: string; tipo: string; calorias_total: number; items: unknown[] }> = ontemResult.data ?? []

  // Metas
  const metaCalorias = profile
    ? calcularMetaCalorica({
        peso: profile.peso,
        altura: profile.altura,
        idade: profile.idade,
        sexo: profile.sexo,
        objetivo: profile.objetivo,
        dias_por_semana: profile.dias_por_semana,
      })
    : 2000

  const metaProteina = calcularMetaProteina(profile?.peso ?? null)

  // Totais do dia
  const totais = logs.reduce(
    (acc, log) => ({
      calorias: acc.calorias + (log.calorias_total ?? 0),
      proteina: acc.proteina + parseFloat(String(log.proteina_total ?? 0)),
      carbo: acc.carbo + parseFloat(String(log.carbo_total ?? 0)),
      gordura: acc.gordura + parseFloat(String(log.gordura_total ?? 0)),
    }),
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-sm mx-auto px-5 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/60 mb-4 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Diário Alimentar</h1>
          <p className="text-sm text-white/40 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Resumo do dia */}
        <NutritionSummary
          calorias={totais.calorias}
          metaCalorias={metaCalorias}
          proteina={totais.proteina}
          metaProteina={metaProteina}
          carbo={totais.carbo}
          gordura={totais.gordura}
        />

        {/* Repetir refeição de ontem */}
        {logsOntem.length > 0 && logs.length === 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Ontem você comeu</p>
            <div className="flex flex-wrap gap-1.5">
              {logsOntem.slice(0, 3).map((log) => (
                <span
                  key={log.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/50"
                >
                  {TIPO_ICONS[log.tipo]} {TIPO_LABELS[log.tipo]} · {log.calorias_total} kcal
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Registros do dia */}
        {logs.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Registros de hoje</p>
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{TIPO_ICONS[log.tipo]}</span>
                    <span className="text-sm font-semibold text-white/80">{TIPO_LABELS[log.tipo]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#FF8C00]">{log.calorias_total} kcal</span>
                    <DeleteButton logId={log.id} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {log.items.map((item, i) => (
                    <span key={i} className="text-xs text-white/40 bg-white/[0.04] rounded-lg px-2 py-0.5">
                      {item.icone} {item.nome}{item.quantidade > 1 ? ` ×${item.quantidade}` : ''}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-white/25">
                  <span>P: {parseFloat(String(log.proteina_total)).toFixed(0)}g</span>
                  <span>C: {parseFloat(String(log.carbo_total)).toFixed(0)}g</span>
                  <span>G: {parseFloat(String(log.gordura_total)).toFixed(0)}g</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FoodLogger */}
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
            {logs.length === 0 ? 'Registre sua primeira refeição' : 'Adicionar refeição'}
          </p>
          <FoodLoggerWrapper />
        </div>

        {/* Disclaimer legal */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
          <p className="text-[10px] text-white/20 leading-relaxed">
            Este diário é de caráter informativo e registra apenas o que você informou ter consumido.
            Os valores calóricos são estimativas baseadas em tabelas de referência (TACO).
            Não constitui prescrição dietética. Para orientação nutricional personalizada, consulte um nutricionista (CRN).
          </p>
        </div>

      </div>
    </div>
  )
}

