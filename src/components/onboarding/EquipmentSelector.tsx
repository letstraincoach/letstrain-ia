'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// Catálogo embutido — espelha o seed.sql para funcionar sem fetch ao banco
const CATALOG: { nome: string; categoria: string }[] = [
  // Pesos Livres
  { nome: 'Halter (par)', categoria: 'pesos_livres' },
  { nome: 'Halteres Fixos', categoria: 'pesos_livres' },
  { nome: 'Barra Olímpica', categoria: 'pesos_livres' },
  { nome: 'Barra EZ', categoria: 'pesos_livres' },
  { nome: 'Kettlebell', categoria: 'pesos_livres' },
  { nome: 'Anilhas', categoria: 'pesos_livres' },
  { nome: 'Barra W (Curl)', categoria: 'pesos_livres' },
  { nome: 'Disco de Peso', categoria: 'pesos_livres' },
  // Máquinas
  { nome: 'Leg Press', categoria: 'maquinas' },
  { nome: 'Cadeira Extensora', categoria: 'maquinas' },
  { nome: 'Cadeira Flexora', categoria: 'maquinas' },
  { nome: 'Peck Deck', categoria: 'maquinas' },
  { nome: 'Pulley / Lat Pulldown', categoria: 'maquinas' },
  { nome: 'Smith Machine', categoria: 'maquinas' },
  { nome: 'Chest Press', categoria: 'maquinas' },
  { nome: 'Shoulder Press', categoria: 'maquinas' },
  { nome: 'Hack Squat', categoria: 'maquinas' },
  // Cabos
  { nome: 'Cabo Crossover', categoria: 'cabos' },
  { nome: 'Cabo Baixo', categoria: 'cabos' },
  { nome: 'Cabo Alto', categoria: 'cabos' },
  { nome: 'Polia Dupla', categoria: 'cabos' },
  // Cardio
  { nome: 'Esteira', categoria: 'cardio' },
  { nome: 'Bicicleta Ergométrica', categoria: 'cardio' },
  { nome: 'Elíptico', categoria: 'cardio' },
  { nome: 'Remo Ergométrico', categoria: 'cardio' },
  { nome: 'Corda de Pular', categoria: 'cardio' },
  // Funcionais
  { nome: 'Colchonete', categoria: 'funcionais' },
  { nome: 'Bola Suíça', categoria: 'funcionais' },
  { nome: 'Elástico / Faixa', categoria: 'funcionais' },
  { nome: 'TRX / Fita de Suspensão', categoria: 'funcionais' },
  { nome: 'Step', categoria: 'funcionais' },
  { nome: 'Cones', categoria: 'funcionais' },
  { nome: 'Medicine Ball', categoria: 'funcionais' },
  { nome: 'Barra Fixa', categoria: 'funcionais' },
  { nome: 'Paralelas', categoria: 'funcionais' },
  { nome: 'Banco Regulável', categoria: 'funcionais' },
]

const CATEGORY_LABELS: Record<string, string> = {
  pesos_livres: '🏋️ Pesos Livres',
  maquinas: '⚙️ Máquinas',
  cabos: '🔗 Cabos',
  cardio: '🏃 Cardio',
  funcionais: '🤸 Funcionais',
}

const CATEGORY_ORDER = ['pesos_livres', 'maquinas', 'cabos', 'cardio', 'funcionais']

interface EquipmentSelectorProps {
  userId: string
  onSaved: () => void
}

export default function EquipmentSelector({ userId, onSaved }: EquipmentSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customName, setCustomName] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return CATALOG
    const q = search.toLowerCase()
    return CATALOG.filter((e) => e.nome.toLowerCase().includes(q))
  }, [search])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof CATALOG> = {}
    for (const item of filtered) {
      if (!groups[item.categoria]) groups[item.categoria] = []
      groups[item.categoria].push(item)
    }
    return groups
  }, [filtered])

  function toggleItem(nome: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(nome)) next.delete(nome)
      else next.add(nome)
      return next
    })
  }

  function toggleAll(cat: string) {
    const items = grouped[cat] ?? []
    const allSelected = items.every((i) => selected.has(i.nome))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) items.forEach((i) => next.delete(i.nome))
      else items.forEach((i) => next.add(i.nome))
      return next
    })
  }

  function addCustom() {
    const name = customName.trim()
    if (!name || extras.includes(name)) return
    setExtras((prev) => [...prev, name])
    setSelected((prev) => new Set([...prev, name]))
    setCustomName('')
  }

  async function handleSave() {
    const allSelected = [...selected]
    if (!allSelected.length) {
      setError('Selecione ao menos um equipamento.')
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    const rows = allSelected.map((nome) => ({
      user_id: userId,
      nome_custom: nome,
    }))

    const { error: dbError } = await supabase.from('user_equipment').insert(rows)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    await supabase
      .from('user_profiles')
      .update({ onboarding_completo: true, onboarding_etapa: 'completo' })
      .eq('id', userId)

    onSaved()
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm">
      <div>
        <h2 className="text-xl font-bold">Quais equipamentos você tem acesso?</h2>
        <p className="mt-1 text-sm text-white/50">
          Selecione tudo que sua academia tem. Você pode editar isso depois.
        </p>
      </div>

      {/* Busca */}
      <Input
        placeholder="Buscar equipamento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Contador */}
      <p className="text-xs text-white/40">
        {selected.size} equipamento(s) selecionado(s)
      </p>

      {/* Lista por categoria */}
      <div className="flex flex-col gap-6">
        {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => {
          const items = grouped[cat]
          const allSelected = items.every((i) => selected.has(i.nome))
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat]}
                </span>
                <button
                  type="button"
                  onClick={() => toggleAll(cat)}
                  className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors"
                >
                  {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((item) => {
                  const isSelected = selected.has(item.nome)
                  return (
                    <button
                      key={item.nome}
                      type="button"
                      onClick={() => toggleItem(item.nome)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150
                        ${isSelected
                          ? 'bg-[#FF8C00]/10 border border-[#FF8C00]/40'
                          : 'bg-white/[0.03] border border-white/8 hover:border-white/15'
                        }`}
                    >
                      <span
                        className={`h-4 w-4 rounded shrink-0 border flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-white/30'}`}
                      >
                        {isSelected && (
                          <svg className="h-2.5 w-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm">{item.nome}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Extras customizados */}
        {extras.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
              ➕ Adicionados por você
            </span>
            <div className="flex flex-col gap-1.5 mt-2">
              {extras.map((nome) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => toggleItem(nome)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150
                    ${selected.has(nome)
                      ? 'bg-[#FF8C00]/10 border border-[#FF8C00]/40'
                      : 'bg-white/[0.03] border border-white/8 hover:border-white/15'
                    }`}
                >
                  <span
                    className={`h-4 w-4 rounded shrink-0 border flex items-center justify-center transition-colors
                      ${selected.has(nome) ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-white/30'}`}
                  >
                    {selected.has(nome) && (
                      <svg className="h-2.5 w-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm">{nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Adicionar equipamento custom */}
      <div className="flex gap-2 pt-2">
        <Input
          placeholder="Outro equipamento..."
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          className="flex-1"
        />
        <Button variant="outline" onClick={addCustom} className="shrink-0 px-4">
          +
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="pb-8">
        <Button fullWidth loading={saving} onClick={handleSave} disabled={selected.size === 0}>
          Salvar equipamentos ({selected.size})
        </Button>
      </div>
    </div>
  )
}
