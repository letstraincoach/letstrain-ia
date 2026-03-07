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

      {/* Lista de equipamentos */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            Equipamentos
          </h2>
          <span className="text-xs text-white/30">{items.length} item(s)</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center">
            <p className="text-sm text-white/40">Nenhum equipamento cadastrado</p>
            <p className="text-xs text-white/25 mt-1">Adicione abaixo ou re-analise as fotos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  {item.isNew && (
                    <span className="text-[10px] font-semibold text-[#FF8C00] bg-[#FF8C00]/10 rounded-full px-1.5 py-0.5">
                      novo
                    </span>
                  )}
                  <p className="text-sm">{item.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-white/30 hover:text-red-400 transition-colors text-sm"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Adicionar manualmente */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">
          Adicionar equipamento
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
