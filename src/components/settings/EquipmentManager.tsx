'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import EquipmentDetector from '@/components/onboarding/EquipmentDetector'

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

const EQUIPMENT_CATEGORIES = [
  {
    label: 'Cardio',
    cor: 'text-red-400',
    items: ['Esteira', 'Bike', 'Ergométrica', 'Elíptico', 'Remo', 'Escada'],
  },
  {
    label: 'Máquinas',
    cor: 'text-blue-400',
    items: ['Polia', 'Cross Over', 'Barra Smith', 'Extensora', 'Flexora', 'Leg Press', 'Cadeira Adutora', 'Cadeira Abdutora', 'Cadeira Romana', 'Hack Squat', 'Supino Máquina', 'Remada Máquina', 'Pulldown', 'Voador', 'Panturrilha Máquina'],
  },
  {
    label: 'Funcional',
    cor: 'text-green-400',
    items: ['Halter', 'Kettlebell', 'Mini Band', 'Elástico', 'TRX', 'Medicine Ball', 'Bosu', 'Battle Rope', 'Slam Ball', 'Corrente'],
  },
  {
    label: 'Acessórios',
    cor: 'text-yellow-400',
    items: ['Banco Ajustável', 'Banco de Supino', 'Caixote', 'Step', 'Barra', 'Anilha', 'Paralela', 'Barra Fixa', 'Corda', 'Colchonete', 'Foam Roller'],
  },
]

export default function EquipmentManager({
  userId,
  localTipo,
  initialEquipment,
  condominioFotos,
}: EquipmentManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<{ name: string; isNew?: boolean }[]>(
    initialEquipment.map((e) => ({ name: e.nome_custom }))
  )
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearingForDetect, setClearingForDetect] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDetector, setShowDetector] = useState(false)

  function isSelected(nome: string) {
    return items.some((i) => i.name.toLowerCase() === nome.toLowerCase())
  }

  function toggleEquipment(nome: string) {
    if (isSelected(nome)) {
      setItems((prev) => prev.filter((i) => i.name.toLowerCase() !== nome.toLowerCase()))
    } else {
      setItems((prev) => [...prev, { name: nome, isNew: true }])
    }
  }

  function addItem() {
    const name = customName.trim()
    if (!name) return
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      setCustomName('')
      return
    }
    setItems((prev) => [...prev, { name, isNew: true }])
    setCustomName('')
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()

    // Delete all current equipment for user
    const { error: deleteError } = await supabase
      .from('user_equipment')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      setError('Erro ao atualizar equipamentos. Tente novamente.')
      setSaving(false)
      return
    }

    // Insert new list (if any)
    if (items.length > 0) {
      const rows = items.map((item) => ({
        user_id: userId,
        nome_custom: item.name,
      }))

      const { error: insertError } = await supabase
        .from('user_equipment')
        .insert(rows)

      if (insertError) {
        setError('Erro ao salvar equipamentos. Tente novamente.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      router.refresh()
      setSuccess(false)
    }, 1500)
  }

  async function handleStartDetector() {
    setClearingForDetect(true)
    const supabase = createClient()
    await supabase.from('user_equipment').delete().eq('user_id', userId)
    setClearingForDetect(false)
    setShowDetector(true)
  }

  // If showing the re-detect flow for condomínio
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
          onSaved={() => {
            setShowDetector(false)
            router.refresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Fotos do condomínio (read-only preview) */}
      {localTipo === 'condominio' && condominioFotos.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">
              Fotos da academia
            </h2>
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

      {/* Quick-select por categoria — lista vertical */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">
          Selecionar equipamentos
        </h2>
        {EQUIPMENT_CATEGORIES.map((cat, catIdx) => (
          <div key={cat.label}>
            {/* Separador entre categorias (exceto a primeira) */}
            {catIdx > 0 && <div className="h-px bg-white/[0.04] my-3" />}
            <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${cat.cor}`}>
              {cat.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {cat.items.map((nome) => {
                const selected = isSelected(nome)
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => toggleEquipment(nome)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] ${
                      selected
                        ? 'bg-[#FF8C00]/10 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>{nome}</span>
                    {selected && (
                      <span className="w-4 h-4 rounded-full bg-[#FF8C00] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                          <path d="M2 5 L4 7 L8 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Lista de equipamentos selecionados */}
      {items.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">
              Selecionados
            </h2>
            <span className="text-xs text-white/30">{items.length} item(s)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5"
              >
                <p className="text-sm text-white/70">{item.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
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
          <Button variant="outline" onClick={addItem} className="shrink-0 px-4">
            +
          </Button>
        </div>
      </section>

      {/* Condomínio sem fotos — opção de ir ao detector */}
      {localTipo === 'condominio' && condominioFotos.length === 0 && (
        <button
          type="button"
          onClick={handleStartDetector}
          disabled={clearingForDetect}
          className="rounded-xl border border-[#FF8C00]/30 bg-[#FF8C00]/[0.04] px-4 py-3 text-sm text-[#FF8C00] hover:bg-[#FF8C00]/[0.08] transition-colors text-left disabled:opacity-50"
        >
          📷 Fotografar academia e identificar equipamentos →
        </button>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          ✓ Equipamentos salvos com sucesso!
        </p>
      )}

      <div className="pb-8">
        <Button fullWidth loading={saving} onClick={handleSave}>
          Salvar alterações
        </Button>
      </div>

    </div>
  )
}
