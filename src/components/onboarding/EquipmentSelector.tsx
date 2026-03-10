'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

const CATEGORIES = [
  {
    label: 'Cardio',
    cor: 'text-red-400',
    items: [
      { nome: 'Esteira',           slug: 'esteira' },
      { nome: 'Elíptico',          slug: 'eliptico' },
      { nome: 'Bike',              slug: 'bike' },
      { nome: 'Ergométrica',       slug: 'ergometrica' },
      { nome: 'Remo Ergométrico',  slug: 'remo-ergometrico' },
    ],
  },
  {
    label: 'Máquinas',
    cor: 'text-blue-400',
    items: [
      { nome: 'Leg Press',              slug: 'leg-press' },
      { nome: 'Cadeira Extensora',      slug: 'cadeira-extensora' },
      { nome: 'Cross Over',             slug: 'cross-over' },
      { nome: 'Gaiola de Agachamento',  slug: 'gaiola-agachamento' },
      { nome: 'Cadeira Flexora',        slug: 'cadeira-flexora' },
      { nome: 'Polia',                  slug: 'polia' },
      { nome: 'Puxada (Lat Pulldown)',  slug: 'puxada' },
      { nome: 'Remada Máquina',         slug: 'remada-maquina' },
      { nome: 'Multi Estação',          slug: 'multi-estacao' },
    ],
  },
  {
    label: 'Livre',
    cor: 'text-green-400',
    items: [
      { nome: 'Barra Reta',     slug: 'barra-reta' },
      { nome: 'Barra W',        slug: 'barra-w' },
      { nome: 'Barra Olímpica', slug: 'barra-olimpica' },
      { nome: 'Anilhas',        slug: 'anilhas' },
      { nome: 'Halteres',       slug: 'halteres' },
      { nome: 'Mini Band',      slug: 'mini-band' },
      { nome: 'Kettlebell',     slug: 'kettlebell' },
      { nome: 'Caneleira',      slug: 'caneleira' },
      { nome: 'TRX',            slug: 'trx' },
    ],
  },
  {
    label: 'Materiais de Apoio',
    cor: 'text-yellow-400',
    items: [
      { nome: 'Caixote',         slug: 'caixote' },
      { nome: 'Banco com Ajuste', slug: 'banco-ajuste' },
      { nome: 'Banco de Supino', slug: 'banco-supino' },
      { nome: 'Step',            slug: 'step' },
      { nome: 'Bola de Pilates', slug: 'bola-pilates' },
    ],
  },
]

function fotoUrl(slug: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/equipment-photos/${slug}.jpg`
}

function PhotoModal({ nome, slug, onClose }: { nome: string; slug: string; onClose: () => void }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl p-4 w-full max-w-xs flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{nome}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-lg leading-none">✕</button>
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/[0.05] flex items-center justify-center">
          {status !== 'error' && (
            <img
              src={fotoUrl(slug)}
              alt={nome}
              className={`w-full h-full object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setStatus('ok')}
              onError={() => setStatus('error')}
            />
          )}
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
            </div>
          )}
          {status === 'error' && (
            <p className="text-xs text-white/30 text-center px-4">Foto em breve</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface EquipmentSelectorProps {
  userId: string
  onSaved: () => void
}

export default function EquipmentSelector({ userId, onSaved }: EquipmentSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [photoItem, setPhotoItem] = useState<{ nome: string; slug: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(nome: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(nome)) next.delete(nome)
      else next.add(nome)
      return next
    })
  }

  function toggleAll(items: { nome: string }[]) {
    const allSelected = items.every((i) => selected.has(i.nome))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) items.forEach((i) => next.delete(i.nome))
      else items.forEach((i) => next.add(i.nome))
      return next
    })
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

    const { error: dbError } = await supabase.from('user_equipment').insert(
      allSelected.map((nome) => ({ user_id: userId, nome_custom: nome }))
    )

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
    <>
      {photoItem && (
        <PhotoModal nome={photoItem.nome} slug={photoItem.slug} onClose={() => setPhotoItem(null)} />
      )}

      <div className="flex flex-col gap-5 w-full max-w-sm">
        <div>
          <h2 className="text-xl font-bold">Quais equipamentos você tem acesso?</h2>
          <p className="mt-1 text-sm text-white/50">
            Selecione tudo que sua academia tem. Você pode editar depois.
          </p>
        </div>

        {selected.size > 0 && (
          <p className="text-xs text-[#FF8C00]">{selected.size} equipamento(s) selecionado(s)</p>
        )}

        <div className="flex flex-col gap-6">
          {CATEGORIES.map((cat, catIdx) => {
            const allSelected = cat.items.every((i) => selected.has(i.nome))
            return (
              <div key={cat.label}>
                {catIdx > 0 && <div className="h-px bg-white/[0.05] mb-4" />}
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-[11px] uppercase tracking-widest font-semibold ${cat.cor}`}>
                    {cat.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleAll(cat.items)}
                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    {allSelected ? 'Desmarcar todos' : 'Todos'}
                  </button>
                </div>

                <div className="flex flex-col gap-0.5">
                  {cat.items.map((item) => {
                    const isSelected = selected.has(item.nome)
                    return (
                      <div key={item.nome} className="flex items-center gap-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => toggle(item.nome)}
                          className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] text-left ${
                            isSelected
                              ? 'bg-[#FF8C00]/10 text-white'
                              : 'text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded shrink-0 border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-white/25'
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-2.5 w-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span>{item.nome}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPhotoItem(item)}
                          className="text-[11px] text-white/25 hover:text-[#FF8C00] transition-colors shrink-0 pr-1"
                        >
                          ver foto
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="pb-8">
          <Button fullWidth loading={saving} onClick={handleSave} disabled={selected.size === 0}>
            Salvar equipamentos {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </div>
      </div>
    </>
  )
}
