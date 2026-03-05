'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface DetectedItem {
  nome: string
  categoria: string
  confianca: 'alta' | 'media' | 'baixa'
  confirmed: boolean
  custom?: boolean
}

interface EquipmentDetectorProps {
  userId: string
  onSaved: () => void
}

export default function EquipmentDetector({ userId, onSaved }: EquipmentDetectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectedItem[] | null>(null)
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Etapas: 'upload' | 'confirm'
  const step = detected === null ? 'upload' : 'confirm'

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    const selected = Array.from(files).slice(0, 10)
    const previewUrls = selected.map((f) => URL.createObjectURL(f))
    setPreviews(previewUrls)

    // Upload para Supabase Storage
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []

    for (const file of selected) {
      const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('equipment-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('Erro ao enviar foto. Verifique sua conexão.')
        setUploading(false)
        return
      }

      const { data: publicUrl } = supabase.storage
        .from('equipment-photos')
        .getPublicUrl(path)

      urls.push(publicUrl.publicUrl)
    }

    setUploadedUrls(urls)
    setUploading(false)
  }

  async function handleDetect() {
    if (!uploadedUrls.length) return
    setDetecting(true)
    setError(null)

    try {
      const res = await fetch('/api/equipment/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: uploadedUrls }),
      })

      const data = (await res.json()) as { equipamentos?: DetectedItem[]; error?: string }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Erro ao analisar imagens.')
        setDetecting(false)
        return
      }

      const items: DetectedItem[] = (data.equipamentos ?? []).map((e) => ({
        ...e,
        confirmed: true,
      }))

      setDetected(items)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setDetecting(false)
    }
  }

  function toggleItem(idx: number) {
    setDetected((prev) =>
      prev?.map((item, i) =>
        i === idx ? { ...item, confirmed: !item.confirmed } : item
      ) ?? null
    )
  }

  function removeItem(idx: number) {
    setDetected((prev) => prev?.filter((_, i) => i !== idx) ?? null)
  }

  function addCustom() {
    const name = customName.trim()
    if (!name) return
    setDetected((prev) => [
      ...(prev ?? []),
      { nome: name, categoria: 'funcionais', confianca: 'alta', confirmed: true, custom: true },
    ])
    setCustomName('')
  }

  async function handleSave() {
    const toSave = (detected ?? []).filter((i) => i.confirmed)
    if (!toSave.length) {
      setError('Selecione ao menos um equipamento.')
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    const rows = toSave.map((item) => ({
      user_id: userId,
      nome_custom: item.nome,
    }))

    const { error: dbError } = await supabase.from('user_equipment').insert(rows)

    if (dbError) {
      setError('Erro ao salvar equipamentos. Tente novamente.')
      setSaving(false)
      return
    }

    // Marcar onboarding como completo
    await supabase
      .from('user_profiles')
      .update({ onboarding_completo: true, onboarding_etapa: 'completo' })
      .eq('id', userId)

    onSaved()
  }

  const confiancaColor: Record<string, string> = {
    alta: 'text-[#FF8C00]',
    media: 'text-yellow-400',
    baixa: 'text-white/40',
  }

  // ---- Etapa 1: Upload ----
  if (step === 'upload') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div>
          <h2 className="text-xl font-bold">Fotografe sua academia</h2>
          <p className="mt-1 text-sm text-white/50">
            Tire fotos dos aparelhos disponíveis. A IA vai identificá-los automaticamente.
          </p>
        </div>

        {/* Área de upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-[#FF8C00]/50 hover:text-[#FF8C00]/70 transition-all duration-200"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Toque para adicionar fotos</span>
          <span className="text-xs">Até 10 imagens</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pb-8">
          <Button
            fullWidth
            disabled={!uploadedUrls.length}
            loading={uploading || detecting}
            onClick={handleDetect}
          >
            {uploading ? 'Enviando fotos...' : detecting ? 'A IA está analisando...' : 'Identificar equipamentos'}
          </Button>
        </div>
      </div>
    )
  }

  // ---- Etapa 2: Confirmação ----
  const confirmedCount = detected?.filter((i) => i.confirmed).length ?? 0

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div>
        <h2 className="text-xl font-bold">Confirme os equipamentos</h2>
        <p className="mt-1 text-sm text-white/50">
          {detected?.length
            ? `Encontrei ${detected.length} equipamento(s). Remova o que não existir.`
            : 'Não detectei nenhum equipamento. Adicione manualmente.'}
        </p>
      </div>

      {/* Lista detectada */}
      {detected && detected.length > 0 && (
        <div className="flex flex-col gap-2">
          {detected.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-150
                ${item.confirmed ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 bg-transparent opacity-40'}`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleItem(i)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors
                    ${item.confirmed ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-white/30'}`}
                >
                  {item.confirmed && (
                    <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium">{item.nome}</p>
                  {!item.custom && (
                    <p className={`text-xs ${confiancaColor[item.confianca]}`}>
                      Confiança {item.confianca}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-white/30 hover:text-red-400 transition-colors ml-2"
                aria-label="Remover"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar manualmente */}
      <div className="flex gap-2">
        <Input
          placeholder="Adicionar equipamento..."
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

      <div className="flex flex-col gap-3 pb-8">
        <Button fullWidth loading={saving} onClick={handleSave} disabled={confirmedCount === 0}>
          Salvar {confirmedCount > 0 ? `${confirmedCount} equipamento(s)` : 'equipamentos'}
        </Button>
        <button
          type="button"
          onClick={() => {
            setDetected(null)
            setPreviews([])
            setUploadedUrls([])
          }}
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Tirar novas fotos
        </button>
      </div>
    </div>
  )
}
