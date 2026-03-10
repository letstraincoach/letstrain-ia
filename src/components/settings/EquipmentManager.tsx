'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import EquipmentDetector from '@/components/onboarding/EquipmentDetector'

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
      { nome: 'Barra Reta',      slug: 'barra-reta' },
      { nome: 'Barra W',         slug: 'barra-w' },
      { nome: 'Barra Olímpica',  slug: 'barra-olimpica' },
      { nome: 'Anilhas',         slug: 'anilhas' },
      { nome: 'Halteres',        slug: 'halteres' },
      { nome: 'Mini Band',       slug: 'mini-band' },
      { nome: 'Kettlebell',      slug: 'kettlebell' },
      { nome: 'Caneleira',       slug: 'caneleira' },
      { nome: 'TRX',             slug: 'trx' },
    ],
  },
  {
    label: 'Materiais de Apoio',
    cor: 'text-yellow-400',
    items: [
      { nome: 'Caixote',          slug: 'caixote' },
      { nome: 'Banco com Ajuste', slug: 'banco-ajuste' },
      { nome: 'Banco de Supino',  slug: 'banco-supino' },
      { nome: 'Step',             slug: 'step' },
      { nome: 'Bola de Pilates',  slug: 'bola-pilates' },
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

interface Equipment {
  id: string
  nome_custom: string
}

interface EquipmentManagerProps {
  userId: string
  localTipo: 'condominio' | 'academia' | 'hotel' | null
  initialEquipment: Equipment[]
  condominioFotos: string[]
}

export default function EquipmentManager({
  userId,
  localTipo,
  initialEquipment,
  condominioFotos,
}: EquipmentManagerProps) {
  const router = useRouter()
  const allCatalogNames = CATEGORIES.flatMap((c) => c.items.map((i) => i.nome))

  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialEquipment.map((e) => e.nome_custom))
  )
  const [extras, setExtras] = useState<string[]>(
    initialEquipment.map((e) => e.nome_custom).filter((n) => !allCatalogNames.includes(n))
  )
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearingForDetect, setClearingForDetect] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDetector, setShowDetector] = useState(false)
  const [photoItem, setPhotoItem] = useState<{ nome: string; slug: string } | null>(null)

  function toggle(nome: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(nome)) next.delete(nome)
      else next.add(nome)
      return next
    })
  }

  function addItem() {
    const name = customName.trim()
    if (!name) return
    if (selected.has(name)) { setCustomName(''); return }
    setExtras((prev) => [...prev, name])
    setSelected((prev) => new Set([...prev, name]))
    setCustomName('')
  }

  function removeExtra(nome: string) {
    setExtras((prev) => prev.filter((e) => e !== nome))
    setSelected((prev) => { const next = new Set(prev); next.delete(nome); return next })
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('user_equipment')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      setError('Erro ao atualizar equipamentos. Tente novamente.')
      setSaving(false)
      return
    }

    const items = [...selected]
    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from('user_equipment')
        .insert(items.map((nome) => ({ user_id: userId, nome_custom: nome })))

      if (insertError) {
        setError('Erro ao salvar equipamentos. Tente novamente.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => { router.refresh(); setSuccess(false) }, 1500)
  }

  async function handleStartDetector() {
    setClearingForDetect(true)
    const supabase = createClient()
    await supabase.from('user_equipment').delete().eq('user_id', userId)
    setClearingForDetect(false)
    setShowDetector(true)
  }

  if (showDetector) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowDetector(false)}
          className="text-sm text-white/40 hover:text-white/70 transition-colors self-start"
        >
          ← Voltar à lista
        </button>
        <EquipmentDetector
          userId={userId}
          localTipo="condominio"
          onSaved={() => { setShowDetector(false); router.refresh() }}
        />
      </div>
    )
  }

  return (
    <>
      {photoItem && (
        <PhotoModal nome={photoItem.nome} slug={photoItem.slug} onClose={() => setPhotoItem(null)} />
      )}

      <div className="flex flex-col gap-6">

        {/* Fotos do condomínio */}
        {localTipo === 'condominio' && condominioFotos.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Fotos da academia</h2>
              <span className="text-xs text-white/30">{condominioFotos.length} foto(s)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {condominioFotos.map((url, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleStartDetector}
              disabled={clearingForDetect}
              className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors self-start disabled:opacity-50"
            >
              {clearingForDetect ? 'Aguarde...' : 'Re-analisar fotos →'}
            </button>
          </section>
        )}

        {/* Lista por categoria */}
        <section className="flex flex-col gap-1">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">
            Selecionar equipamentos
          </h2>

          {CATEGORIES.map((cat, catIdx) => (
            <div key={cat.label}>
              {catIdx > 0 && <div className="h-px bg-white/[0.04] my-3" />}
              <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${cat.cor}`}>
                {cat.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {cat.items.map((item) => {
                  const isSelected = selected.has(item.nome)
                  return (
                    <div key={item.nome} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(item.nome)}
                        className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[#FF8C00]/10 text-white'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span>{item.nome}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#FF8C00] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                              <path d="M2 5 L4 7 L8 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
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
          ))}
        </section>

        {/* Extras adicionados manualmente */}
        {extras.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Outros</h2>
            <div className="flex flex-wrap gap-2">
              {extras.map((nome) => (
                <div key={nome} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  <p className="text-sm text-white/70">{nome}</p>
                  <button
                    type="button"
                    onClick={() => removeExtra(nome)}
                    className="text-white/25 hover:text-red-400 transition-colors text-xs ml-0.5"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Adicionar manualmente */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            Outro equipamento
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do equipamento..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="flex-1"
            />
            <Button variant="outline" onClick={addItem} className="shrink-0 px-4">+</Button>
          </div>
        </section>

        {localTipo === 'condominio' && condominioFotos.length === 0 && (
          <button
            type="button"
            onClick={handleStartDetector}
            disabled={clearingForDetect}
            className="rounded-xl border border-[#FF8C00]/30 bg-[#FF8C00]/[0.04] px-4 py-3 text-sm text-[#FF8C00] hover:bg-[#FF8C00]/[0.08] transition-colors text-left disabled:opacity-50"
          >
            Fotografar academia e identificar equipamentos →
          </button>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            Equipamentos salvos com sucesso!
          </p>
        )}

        <div className="pb-8">
          <Button fullWidth loading={saving} onClick={handleSave}>
            Salvar alterações
          </Button>
        </div>
      </div>
    </>
  )
}
