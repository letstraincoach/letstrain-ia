'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Listas de equipamentos comuns por local ────────────────────────────────────
interface EquipItem {
  nome: string
  categoria: string
  emoji: string
}

const CONDOMINIO_ITEMS: EquipItem[] = [
  // Pesos livres
  { nome: 'Halteres', categoria: 'pesos_livres', emoji: '🏋️' },
  { nome: 'Kettlebell', categoria: 'pesos_livres', emoji: '🔔' },
  { nome: 'Barras e anilhas', categoria: 'pesos_livres', emoji: '🥊' },
  // Banco / suporte
  { nome: 'Banco ajustável', categoria: 'maquinas', emoji: '🛋️' },
  // Barras
  { nome: 'Barra fixa', categoria: 'funcionais', emoji: '⬛' },
  { nome: 'Paralelas', categoria: 'funcionais', emoji: '⚌' },
  // Máquinas
  { nome: 'Leg Press', categoria: 'maquinas', emoji: '🦵' },
  { nome: 'Extensora', categoria: 'maquinas', emoji: '🦿' },
  { nome: 'Flexora', categoria: 'maquinas', emoji: '🦿' },
  { nome: 'Puxador / Lat Pull-down', categoria: 'maquinas', emoji: '⬇️' },
  { nome: 'Crossover / Polia', categoria: 'maquinas', emoji: '🔀' },
  { nome: 'Supino (banco + barra)', categoria: 'maquinas', emoji: '💪' },
  // Cardio
  { nome: 'Esteira', categoria: 'cardio', emoji: '🏃' },
  { nome: 'Bicicleta ergométrica', categoria: 'cardio', emoji: '🚴' },
  { nome: 'Elíptico', categoria: 'cardio', emoji: '🔁' },
  // Funcionais
  { nome: 'Colchonete / Tapete', categoria: 'funcionais', emoji: '🛏️' },
  { nome: 'Elásticos / Miniband', categoria: 'funcionais', emoji: '🎗️' },
  { nome: 'Step / Banco baixo', categoria: 'funcionais', emoji: '🪜' },
  { nome: 'Corda de pular', categoria: 'funcionais', emoji: '🪢' },
  { nome: 'Bola suíça', categoria: 'funcionais', emoji: '⚽' },
  { nome: 'TRX / Suspensão', categoria: 'funcionais', emoji: '🧗' },
]

const HOTEL_ITEMS: EquipItem[] = [
  { nome: 'Colchonete / Tapete', categoria: 'funcionais', emoji: '🛏️' },
  { nome: 'Halteres leves', categoria: 'pesos_livres', emoji: '🏋️' },
  { nome: 'Elásticos / Miniband', categoria: 'funcionais', emoji: '🎗️' },
  { nome: 'Corda de pular', categoria: 'funcionais', emoji: '🪢' },
  { nome: 'Banco / Cadeira', categoria: 'maquinas', emoji: '🛋️' },
  { nome: 'Esteira', categoria: 'cardio', emoji: '🏃' },
  { nome: 'Bicicleta ergométrica', categoria: 'cardio', emoji: '🚴' },
  { nome: 'Bola de exercício', categoria: 'funcionais', emoji: '⚽' },
]

// ─────────────────────────────────────────────────────────────────────────────

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

  // Controle de etapas
  const [step, setStep] = useState<'select' | 'upload' | 'condo'>('select')

  // Equipamentos selecionados (nomes)
  const commonList = localTipo === 'condominio' ? CONDOMINIO_ITEMS : HOTEL_ITEMS
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customName, setCustomName] = useState('')
  const [customItems, setCustomItems] = useState<string[]>([])

  // Upload / detecção por foto
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)

  // Condo info
  const [condominioNome, setCondominioNome] = useState('')
  const [condominioCep, setCondominioCep] = useState('')

  // Shared
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleItem(nome: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(nome)) next.delete(nome)
      else next.add(nome)
      return next
    })
  }

  function addCustom() {
    const name = customName.trim()
    if (!name || customItems.includes(name)) return
    setCustomItems((prev) => [...prev, name])
    setSelected((prev) => new Set([...prev, name]))
    setCustomName('')
  }

  function removeCustom(nome: string) {
    setCustomItems((prev) => prev.filter((n) => n !== nome))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(nome)
      return next
    })
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    const remaining = 12 - uploadedUrls.length
    if (remaining <= 0) { setError('Limite de 12 fotos atingido.'); return }

    const chosen = Array.from(files).slice(0, remaining)
    const previewUrls = chosen.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...previewUrls])
    if (fileInputRef.current) fileInputRef.current.value = ''

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (let i = 0; i < chosen.length; i++) {
      const file = chosen[i]
      const path = `${userId}/${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('equipment-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('Erro ao enviar foto. Verifique sua conexão.')
        setUploading(false)
        return
      }

      const { data: pub } = supabase.storage.from('equipment-photos').getPublicUrl(path)
      newUrls.push(pub.publicUrl)
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

      const data = (await res.json()) as {
        equipamentos?: { nome: string; categoria: string }[]
        error?: string
      }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Erro ao analisar imagens.')
        setDetecting(false)
        return
      }

      // Mescla os detectados com a seleção atual
      const detectados = data.equipamentos ?? []
      setSelected((prev) => {
        const next = new Set(prev)
        detectados.forEach(({ nome }) => next.add(nome))
        return next
      })
      // Adiciona à lista de custom os que não estão na lista padrão
      const commonNames = commonList.map((i) => i.nome)
      const novosCustom = detectados
        .map(({ nome }) => nome)
        .filter((n) => !commonNames.includes(n))
      setCustomItems((prev) => {
        const existing = new Set(prev)
        return [...prev, ...novosCustom.filter((n) => !existing.has(n))]
      })

      // Volta para select com os itens detectados já marcados
      setStep('select')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setDetecting(false)
    }
  }

  // ── Avançar do select ──────────────────────────────────────────────────────
  function handleSelectNext() {
    if (selected.size === 0) {
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

  // ── Salvar ─────────────────────────────────────────────────────────────────
  async function doSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const rows = Array.from(selected).map((nome) => ({ user_id: userId, nome_custom: nome }))
    const { error: dbError } = await supabase.from('user_equipment').insert(rows)

    if (dbError) {
      setError('Erro ao salvar equipamentos. Tente novamente.')
      setSaving(false)
      return
    }

    const profileUpdate: Record<string, unknown> = {
      onboarding_completo: true,
      onboarding_etapa: 'completo',
    }

    if (localTipo === 'condominio') {
      profileUpdate.condominio_nome = condominioNome.trim()
      profileUpdate.condominio_cep = condominioCep.replace(/\D/g, '')
      if (uploadedUrls.length) profileUpdate.condominio_fotos = uploadedUrls
    }

    await supabase.from('user_profiles').update(profileUpdate).eq('id', userId)
    onSaved()
  }

  const allSelected = selected.size

  // ── Etapa: select ──────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div>
          <h2 className="text-xl font-bold">
            {localTipo === 'condominio' ? 'Equipamentos da academia' : 'O que o hotel tem?'}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Toque nos equipamentos disponíveis. A IA vai montar o treino ideal pro que você tem.
          </p>
        </div>

        {/* Grid de equipamentos comuns */}
        <div className="flex flex-wrap gap-2">
          {commonList.map((item) => {
            const isSelected = selected.has(item.nome)
            return (
              <button
                key={item.nome}
                type="button"
                onClick={() => toggleItem(item.nome)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.97]
                  ${isSelected
                    ? 'border-[#FF8C00] bg-[#FF8C00]/15 text-[#FF8C00]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                  }`}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span>{item.nome}</span>
                {isSelected && <span className="text-xs leading-none">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Itens personalizados adicionados */}
        {customItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customItems.map((nome) => (
              <div
                key={nome}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FF8C00] bg-[#FF8C00]/15 text-sm font-medium text-[#FF8C00]"
              >
                <span>{nome}</span>
                <button
                  type="button"
                  onClick={() => removeCustom(nome)}
                  className="text-[#FF8C00]/60 hover:text-red-400 transition-colors leading-none"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar manualmente */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40">Não achou na lista? Adicione manualmente:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Smith machine, agachador..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              className="flex-1"
            />
            <Button variant="outline" onClick={addCustom} className="shrink-0 px-4">
              +
            </Button>
          </div>
        </div>

        {/* Detectar por foto */}
        <button
          type="button"
          onClick={() => { setError(null); setStep('upload') }}
          className="flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:border-white/20 hover:text-white/70 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Fotografar e deixar a IA identificar
        </button>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pb-8">
          <Button
            fullWidth
            disabled={allSelected === 0}
            onClick={handleSelectNext}
          >
            {allSelected > 0
              ? `Confirmar ${allSelected} equipamento${allSelected > 1 ? 's' : ''} →`
              : 'Selecione ao menos um equipamento'}
          </Button>
          {localTipo === 'hotel' && (
            <button
              type="button"
              onClick={() => { setSelected(new Set()); doSave() }}
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              Não tem equipamentos → treino funcional
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Etapa: upload (detectar por foto) ─────────────────────────────────────
  if (step === 'upload') {
    const atLimit = uploadedUrls.length >= 12
    const remaining = 12 - uploadedUrls.length

    return (
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div>
          <h2 className="text-xl font-bold">Fotografe sua academia</h2>
          <p className="mt-1 text-sm text-white/50">
            Tire fotos dos aparelhos. A IA vai identificá-los e adicionar à sua lista.
          </p>
        </div>

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
                : `${uploadedUrls.length} enviada(s) · ${remaining} disponível(is)`}
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

        {previews.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-white/40">
              {uploading
                ? 'Enviando...'
                : `${uploadedUrls.length} foto(s) enviada(s)`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
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
            {detecting ? 'A IA está analisando...' : `Identificar e adicionar à lista`}
          </Button>
          <button
            type="button"
            onClick={() => { setError(null); setStep('select') }}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← Voltar à lista de equipamentos
          </button>
        </div>
      </div>
    )
  }

  // ── Etapa: condo (apenas condominio) ──────────────────────────────────────
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
          Ficam salvos no seu perfil junto com os equipamentos.
        </p>
      </div>

      {/* Resumo dos equipamentos selecionados */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-xs text-white/40 mb-1.5">Equipamentos confirmados</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selected).slice(0, 8).map((nome) => (
            <span key={nome} className="text-[11px] px-2 py-0.5 rounded-full bg-[#FF8C00]/15 text-[#FF8C00] font-medium">
              {nome}
            </span>
          ))}
          {selected.size > 8 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
              +{selected.size - 8} mais
            </span>
          )}
        </div>
      </div>

      {/* Fotos (se houver) */}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-col gap-1.5">
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
          onClick={() => setStep('select')}
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Voltar aos equipamentos
        </button>
      </div>
    </div>
  )
}
