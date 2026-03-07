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
  localTipo: 'condominio' | 'hotel'
  onSaved: () => void
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

export default function EquipmentDetector({ userId, localTipo, onSaved }: EquipmentDetectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'confirm' | 'condo'>('upload')
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectedItem[] | null>(null)
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Condo info (only used when localTipo === 'condominio')
  const [condominioNome, setCondominioNome] = useState('')
  const [condominioCep, setCondominioCep] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    // Append up to the remaining slots (max 12 total)
    const remaining = 12 - uploadedUrls.length
    if (remaining <= 0) {
      setError('Limite de 12 fotos atingido.')
      return
    }

    const selected = Array.from(files).slice(0, remaining)
    const previewUrls = selected.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...previewUrls])

    // Reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i]
      const path = `${userId}/${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`
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

      newUrls.push(publicUrl.publicUrl)
    }

    setUploadedUrls((prev) => [...prev, ...newUrls])
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
      setStep('confirm')
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

  // Called from confirm step
  function handleConfirmNext() {
    const confirmedCount = (detected ?? []).filter((i) => i.confirmed).length
    if (!confirmedCount) {
      setError('Selecione ao menos um equipamento.')
      return
    }
    setError(null)

    if (localTipo === 'condominio') {
      setStep('condo')
    } else {
      doSave()
    }
  }

  async function doSave() {
    const toSave = (detected ?? []).filter((i) => i.confirmed)

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

    // Save profile update
    const profileUpdate: Record<string, unknown> = {
      onboarding_completo: true,
      onboarding_etapa: 'completo',
    }

    if (localTipo === 'condominio') {
      profileUpdate.condominio_nome = condominioNome.trim()
      profileUpdate.condominio_cep = condominioCep.replace(/\D/g, '')
      profileUpdate.condominio_fotos = uploadedUrls
    }

    await supabase
      .from('user_profiles')
      .update(profileUpdate)
      .eq('id', userId)

    onSaved()
  }

  const confiancaColor: Record<string, string> = {
    alta: 'text-[#FF8C00]',
    media: 'text-yellow-400',
    baixa: 'text-white/40',
  }

  const confirmedCount = detected?.filter((i) => i.confirmed).length ?? 0

  // ---- Etapa 1: Upload ----
  if (step === 'upload') {
    const atLimit = uploadedUrls.length >= 12
    const remaining = 12 - uploadedUrls.length

    return (
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div>
          <h2 className="text-xl font-bold">Fotografe sua academia</h2>
          <p className="mt-1 text-sm text-white/50">
            Tire fotos dos aparelhos disponíveis. A IA vai identificá-los automaticamente.
          </p>
        </div>

        {/* Área de upload — só mostra se ainda há slots */}
        {!atLimit && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-[#FF8C00]/50 hover:text-[#FF8C00]/70 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">
              {previews.length === 0 ? 'Toque para adicionar fotos' : 'Adicionar mais fotos'}
            </span>
            <span className="text-xs">
              {previews.length === 0
                ? 'Até 12 imagens'
                : `${uploadedUrls.length} enviada(s) · ainda ${remaining} disponível(is)`}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Previews em grade */}
        {previews.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/40">
                {uploading
                  ? 'Enviando...'
                  : uploadedUrls.length === previews.length
                    ? `${uploadedUrls.length} foto(s) enviada(s)`
                    : `${uploadedUrls.length} de ${previews.length} enviada(s)`}
              </p>
              {atLimit && (
                <span className="text-[10px] text-[#FF8C00] bg-[#FF8C00]/10 rounded-full px-2 py-0.5">
                  Limite atingido
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Indicador de upload pendente */}
                  {i >= uploadedUrls.length && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            disabled={!uploadedUrls.length || uploading}
            loading={detecting}
            onClick={handleDetect}
          >
            {detecting
              ? 'A IA está analisando...'
              : `Identificar equipamentos${uploadedUrls.length > 0 ? ` (${uploadedUrls.length} foto${uploadedUrls.length > 1 ? 's' : ''})` : ''}`}
          </Button>
        </div>
      </div>
    )
  }

  // ---- Etapa 2: Confirmação dos equipamentos ----
  if (step === 'confirm') {
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
          <Button fullWidth onClick={handleConfirmNext} disabled={confirmedCount === 0}>
            {localTipo === 'condominio'
              ? `Continuar com ${confirmedCount > 0 ? confirmedCount : ''} equipamento(s) →`
              : `Salvar ${confirmedCount > 0 ? `${confirmedCount} equipamento(s)` : 'equipamentos'}`
            }
          </Button>
          <button
            type="button"
            onClick={() => {
              setDetected(null)
              setPreviews([])
              setUploadedUrls([])
              setStep('upload')
            }}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Tirar novas fotos
          </button>
        </div>
      </div>
    )
  }

  // ---- Etapa 3: Dados do condomínio (apenas condominio) ----
  const cepValido = condominioCep.replace(/\D/g, '').length === 8
  const nomeValido = condominioNome.trim().length >= 2

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div>
        <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-1">
          Quase lá! 🏠
        </p>
        <h2 className="text-xl font-bold">Dados do condomínio</h2>
        <p className="mt-1 text-sm text-white/50">
          Isso fica salvo no seu perfil junto com as fotos e equipamentos.
        </p>
      </div>

      {/* Fotos salvas (preview mini) */}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40">{uploadedUrls.length} foto(s) salvas ✓</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {uploadedUrls.map((url, i) => (
              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipamentos confirmados */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-xs text-white/40 mb-1.5">Equipamentos selecionados</p>
        <p className="text-sm font-medium text-white/80">
          {confirmedCount} equipamento(s) detectado(s)
        </p>
      </div>

      {/* Nome do condomínio */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">
          Nome do condomínio <span className="text-[#FF8C00]">*</span>
        </label>
        <Input
          placeholder="Ex: Condomínio Residencial Park"
          value={condominioNome}
          onChange={(e) => setCondominioNome(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* CEP */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">
          CEP <span className="text-[#FF8C00]">*</span>
        </label>
        <Input
          placeholder="00000-000"
          value={condominioCep}
          onChange={(e) => setCondominioCep(formatCep(e.target.value))}
          inputMode="numeric"
          autoComplete="postal-code"
        />
        {condominioCep.length > 0 && !cepValido && (
          <p className="text-xs text-white/35">Digite os 8 dígitos do CEP</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 pb-8">
        <Button
          fullWidth
          loading={saving}
          disabled={!nomeValido || !cepValido}
          onClick={doSave}
        >
          Concluir cadastro
        </Button>
        <button
          type="button"
          onClick={() => setStep('confirm')}
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Voltar aos equipamentos
        </button>
      </div>
    </div>
  )
}
