'use client'

interface Props {
  calorias: number
  metaCalorias: number
  proteina: number
  metaProteina: number
  carbo: number
  gordura: number
}

function MacroBar({
  label,
  valor,
  meta,
  cor,
}: {
  label: string
  valor: number
  meta: number
  cor: string
}) {
  const pct = meta > 0 ? Math.min((valor / meta) * 100, 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-white/70">
          {Math.round(valor)}g{' '}
          <span className="text-white/25 font-normal">/ {Math.round(meta)}g</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: cor }}
        />
      </div>
    </div>
  )
}

export default function NutritionSummary({
  calorias,
  metaCalorias,
  proteina,
  metaProteina,
  carbo,
  gordura,
}: Props) {
  const pctCal = metaCalorias > 0 ? Math.min((calorias / metaCalorias) * 100, 100) : 0
  const faltam = Math.max(metaCalorias - calorias, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Barra principal de calorias */}
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Consumido hoje</p>
            <p className="text-4xl font-black text-white">{calorias.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-white/30 mt-0.5">kcal estimadas</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Meta</p>
            <p className="text-2xl font-black text-white/50">{metaCalorias.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Barra de progresso calorias */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pctCal}%`,
                background:
                  pctCal < 70
                    ? '#FF8C00'
                    : pctCal < 95
                    ? '#f59e0b'
                    : '#22c55e',
              }}
            />
          </div>
          {faltam > 0 ? (
            <p className="text-xs text-white/30">
              Faltam <span className="text-white/60 font-semibold">{faltam.toLocaleString('pt-BR')} kcal</span> para a meta
            </p>
          ) : (
            <p className="text-xs text-green-400 font-semibold">Meta calórica atingida</p>
          )}
        </div>

        {/* Macros */}
        <div className="flex flex-col gap-2.5 pt-1 border-t border-white/[0.04]">
          <MacroBar label="Proteína" valor={proteina} meta={metaProteina} cor="#FF8C00" />
          <MacroBar label="Carboidrato" valor={carbo} meta={metaCalorias * 0.45 / 4} cor="#60a5fa" />
          <MacroBar label="Gordura" valor={gordura} meta={metaCalorias * 0.25 / 9} cor="#fbbf24" />
        </div>
      </div>

      {/* Feedback informativo (nunca prescritivo) */}
      {proteina < metaProteina * 0.6 && calorias > 0 && (
        <div className="rounded-2xl border border-orange-400/20 bg-orange-400/5 px-4 py-3">
          <p className="text-xs text-orange-400">
            Sua ingestão de proteína hoje está abaixo do recomendado para praticantes de atividade física.
          </p>
        </div>
      )}
    </div>
  )
}
