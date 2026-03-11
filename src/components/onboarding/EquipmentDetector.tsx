'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── SVG icons ─────────────────────────────────────────────────────────────────
type IconProps = { className?: string }

const IcoHalteres = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="14" width="7" height="12" rx="2"/>
    <rect x="8" y="16" width="5" height="8" rx="1.5"/>
    <line x1="13" y1="20" x2="27" y2="20" strokeWidth="2"/>
    <rect x="27" y="16" width="5" height="8" rx="1.5"/>
    <rect x="31" y="14" width="7" height="12" rx="2"/>
  </svg>
)

const IcoKettlebell = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 18 Q13 8 20 8 Q27 8 26 18"/>
    <path d="M11 22 Q11 34 20 34 Q29 34 29 22 Q29 16 20 16 Q11 16 11 22Z"/>
  </svg>
)

const IcoBarra = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" y1="20" x2="38" y2="20" strokeWidth="2"/>
    <rect x="2" y="11" width="6" height="18" rx="2"/>
    <rect x="7" y="14" width="5" height="12" rx="1.5"/>
    <rect x="32" y="11" width="6" height="18" rx="2"/>
    <rect x="28" y="14" width="5" height="12" rx="1.5"/>
  </svg>
)

const IcoBanco = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="20" y="20" width="16" height="5" rx="2"/>
    <path d="M6 30 L6 16 Q6 10 12 10 L20 10 L20 20"/>
    <rect x="4" y="28" width="5" height="8" rx="1.5"/>
    <line x1="34" y1="25" x2="34" y2="34"/>
    <line x1="22" y1="25" x2="22" y2="34"/>
    <line x1="20" y1="34" x2="36" y2="34"/>
  </svg>
)

const IcoBarraFixa = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="10" x2="37" y2="10" strokeWidth="2.5"/>
    <line x1="8" y1="10" x2="8" y2="36"/>
    <line x1="32" y1="10" x2="32" y2="36"/>
    <line x1="4" y1="36" x2="14" y2="36"/>
    <line x1="26" y1="36" x2="36" y2="36"/>
    <line x1="8" y1="36" x2="8" y2="32"/>
    <line x1="32" y1="36" x2="32" y2="32"/>
  </svg>
)

const IcoParalelas = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="16" x2="37" y2="16" strokeWidth="2.5"/>
    <line x1="3" y1="24" x2="37" y2="24" strokeWidth="2.5"/>
    <line x1="10" y1="16" x2="10" y2="36"/>
    <line x1="30" y1="16" x2="30" y2="36"/>
    <line x1="6" y1="36" x2="14" y2="36"/>
    <line x1="26" y1="36" x2="34" y2="36"/>
  </svg>
)

const IcoLegPress = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="36" x2="36" y2="36"/>
    <rect x="28" y="24" width="8" height="12" rx="2"/>
    <line x1="28" y1="30" x2="10" y2="14"/>
    <rect x="4" y="6" width="12" height="10" rx="2"/>
    <line x1="36" y1="30" x2="36" y2="24"/>
    <line x1="10" y1="14" x2="4" y2="16"/>
  </svg>
)

const IcoExtensora = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="22" y="8" width="5" height="14" rx="2"/>
    <rect x="10" y="20" width="16" height="5" rx="2"/>
    <path d="M14 25 L8 34"/>
    <ellipse cx="6" cy="35" rx="3" ry="2"/>
    <line x1="10" y1="25" x2="10" y2="36"/>
    <line x1="26" y1="25" x2="26" y2="36"/>
    <line x1="8" y1="36" x2="28" y2="36"/>
  </svg>
)

const IcoFlexora = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="18" width="26" height="5" rx="2"/>
    <path d="M28 23 Q36 23 36 30 Q36 36 28 36"/>
    <ellipse cx="27" cy="36" rx="3" ry="2"/>
    <line x1="10" y1="23" x2="10" y2="36"/>
    <line x1="26" y1="23" x2="26" y2="36"/>
    <line x1="8" y1="36" x2="26" y2="36"/>
  </svg>
)

const IcoPuxador = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="6" y1="4" x2="34" y2="4" strokeWidth="2"/>
    <line x1="6" y1="4" x2="6" y2="36"/>
    <line x1="34" y1="4" x2="34" y2="36"/>
    <circle cx="20" cy="6" r="3"/>
    <line x1="20" y1="9" x2="20" y2="20"/>
    <path d="M12 20 Q16 15 20 20 Q24 25 28 20"/>
    <rect x="12" y="28" width="16" height="4" rx="2"/>
    <line x1="4" y1="36" x2="36" y2="36"/>
  </svg>
)

const IcoCrossover = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="6" y1="4" x2="6" y2="36"/>
    <line x1="34" y1="4" x2="34" y2="36"/>
    <circle cx="6" cy="8" r="2.5"/>
    <circle cx="34" cy="8" r="2.5"/>
    <line x1="8.5" y1="8" x2="22" y2="26"/>
    <line x1="31.5" y1="8" x2="18" y2="26"/>
    <circle cx="22" cy="26" r="2"/>
    <circle cx="18" cy="26" r="2"/>
    <line x1="2" y1="36" x2="12" y2="36"/>
    <line x1="28" y1="36" x2="38" y2="36"/>
  </svg>
)

const IcoSupino = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="26" width="28" height="5" rx="2"/>
    <line x1="30" y1="8" x2="30" y2="26"/>
    <line x1="24" y1="8" x2="24" y2="26"/>
    <line x1="22" y1="8" x2="32" y2="8"/>
    <line x1="3" y1="16" x2="37" y2="16" strokeWidth="2"/>
    <rect x="3" y="10" width="5" height="12" rx="2"/>
    <rect x="32" y="10" width="5" height="12" rx="2"/>
    <line x1="10" y1="31" x2="10" y2="38"/>
    <line x1="30" y1="31" x2="30" y2="38"/>
  </svg>
)

const IcoEsteira = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="24" width="32" height="7" rx="3"/>
    <rect x="16" y="6" width="10" height="8" rx="2"/>
    <line x1="13" y1="14" x2="16" y2="6"/>
    <line x1="27" y1="14" x2="24" y2="6"/>
    <line x1="10" y1="24" x2="13" y2="14"/>
    <line x1="30" y1="24" x2="27" y2="14"/>
    <line x1="4" y1="31" x2="2" y2="38"/>
    <line x1="36" y1="31" x2="38" y2="38"/>
  </svg>
)

const IcoBicicleta = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="28" r="8"/>
    <circle cx="11" cy="28" r="2"/>
    <line x1="11" y1="28" x2="23" y2="18"/>
    <line x1="23" y1="18" x2="30" y2="24"/>
    <line x1="23" y1="18" x2="25" y2="9"/>
    <line x1="21" y1="7" x2="29" y2="7"/>
    <line x1="30" y1="24" x2="33" y2="14"/>
    <line x1="29" y1="12" x2="37" y2="12"/>
    <circle cx="22" cy="26" r="2"/>
    <line x1="30" y1="24" x2="29" y2="36"/>
    <line x1="37" y1="12" x2="37" y2="36"/>
    <line x1="27" y1="36" x2="39" y2="36"/>
  </svg>
)

const IcoEliptico = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="36" x2="36" y2="36"/>
    <line x1="10" y1="36" x2="16" y2="8"/>
    <ellipse cx="24" cy="30" rx="11" ry="4" transform="rotate(-8 24 30)"/>
    <line x1="16" y1="8" x2="24" y2="14"/>
    <line x1="24" y1="14" x2="32" y2="8"/>
    <line x1="30" y1="6" x2="38" y2="10"/>
    <line x1="32" y1="36" x2="36" y2="20"/>
  </svg>
)

const IcoColchonete = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(-20 20 20)"/>
    <ellipse cx="20" cy="20" rx="10" ry="4.5" transform="rotate(-20 20 20)"/>
    <ellipse cx="20" cy="20" rx="4" ry="2" transform="rotate(-20 20 20)"/>
    <ellipse cx="29" cy="13" rx="3" ry="7" transform="rotate(-20 29 13)"/>
    <ellipse cx="11" cy="27" rx="3" ry="7" transform="rotate(-20 11 27)"/>
  </svg>
)

const IcoElasticos = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="20" cy="20" rx="15" ry="10"/>
    <ellipse cx="20" cy="20" rx="9" ry="6"/>
    <line x1="11" y1="13" x2="13" y2="11"/>
    <line x1="20" y1="10" x2="22" y2="8"/>
    <line x1="29" y1="13" x2="31" y2="11"/>
  </svg>
)

const IcoStep = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 26 L35 26 L39 21 L9 21 Z"/>
    <path d="M5 26 L35 26 L35 34 L5 34 Z"/>
    <path d="M35 26 L39 21 L39 29 L35 34 Z"/>
  </svg>
)

const IcoCorda = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="20" cy="9" r="3"/>
    <line x1="20" y1="12" x2="20" y2="24"/>
    <path d="M5 30 Q10 10 20 8 Q30 10 35 30"/>
    <line x1="20" y1="18" x2="8" y2="26"/>
    <line x1="20" y1="18" x2="32" y2="26"/>
    <line x1="20" y1="24" x2="15" y2="34"/>
    <line x1="20" y1="24" x2="25" y2="34"/>
  </svg>
)

const IcoBola = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="20" cy="22" r="16"/>
    <path d="M5 22 Q20 14 35 22"/>
    <path d="M7 15 Q20 7 33 15"/>
    <line x1="20" y1="6" x2="20" y2="38"/>
  </svg>
)

const IcoTRX = ({ className }: IconProps) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="15" y="2" width="10" height="4" rx="2"/>
    <line x1="18" y1="6" x2="11" y2="24"/>
    <line x1="22" y1="6" x2="29" y2="24"/>
    <rect x="7" y="24" width="8" height="4" rx="2"/>
    <rect x="25" y="24" width="8" height="4" rx="2"/>
    <ellipse cx="11" cy="33" rx="5" ry="3"/>
    <ellipse cx="29" cy="33" rx="5" ry="3"/>
    <line x1="11" y1="28" x2="11" y2="30"/>
    <line x1="29" y1="28" x2="29" y2="30"/>
  </svg>
)

// ── Categorias e itens ────────────────────────────────────────────────────────
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
      { nome: 'Banco Scott',      slug: 'banco-scott' },
      { nome: 'Step',             slug: 'step' },
      { nome: 'Bola de Pilates',  slug: 'bola-pilates' },
    ],
  },
]

const ALL_ITEMS = CATEGORIES.flatMap((c) => c.items.map((i) => i.nome))

function fotoUrl(slug: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/equipment-photos/${slug}.jpg`
}

function PhotoModal({ nome, slug, onClose }: { nome: string; slug: string; onClose: () => void }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 w-full max-w-xs flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{nome}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-lg leading-none">✕</button>
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/[0.05] flex items-center justify-center">
          {status !== 'error' && (
            <img src={fotoUrl(slug)} alt={nome}
              className={`w-full h-full object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setStatus('ok')} onError={() => setStatus('error')} />
          )}
          {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" /></div>}
          {status === 'error' && <p className="text-xs text-white/30 text-center px-4">Foto em breve</p>}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface EquipmentDetectorProps {
  userId: string
  localTipo: 'condominio' | 'hotel'
  onSaved: () => void
}

export default function EquipmentDetector({ userId, localTipo, onSaved }: EquipmentDetectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'select' | 'upload'>('select')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [photoItem, setPhotoItem] = useState<{ nome: string; slug: string } | null>(null)
  const [customName, setCustomName] = useState('')
  const [customItems, setCustomItems] = useState<string[]>([])

  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)

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

      const detectados = data.equipamentos ?? []
      setSelected((prev) => {
        const next = new Set(prev)
        detectados.forEach(({ nome }) => next.add(nome))
        return next
      })
      const novosCustom = detectados
        .map(({ nome }) => nome)
        .filter((n) => !ALL_ITEMS.includes(n))
      setCustomItems((prev) => {
        const existing = new Set(prev)
        return [...prev, ...novosCustom.filter((n) => !existing.has(n))]
      })

      setStep('select')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setDetecting(false)
    }
  }

  function handleSelectNext() {
    if (selected.size === 0) {
      setError('Selecione ao menos um equipamento.')
      return
    }
    setError(null)
    doSave()
  }

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

    if (localTipo === 'condominio' && uploadedUrls.length) {
      profileUpdate.condominio_fotos = uploadedUrls
    }

    await supabase.from('user_profiles').update(profileUpdate).eq('id', userId)
    onSaved()
  }

  const allSelected = selected.size

  // ── Etapa: select ──────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <>
        {photoItem && <PhotoModal nome={photoItem.nome} slug={photoItem.slug} onClose={() => setPhotoItem(null)} />}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div>
            <h2 className="text-xl font-bold">
              {localTipo === 'condominio' ? 'Equipamentos da academia' : 'O que o hotel tem?'}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Selecione os equipamentos disponíveis. A IA monta o treino ideal para o que você tem.
            </p>
          </div>

          {selected.size > 0 && (
            <p className="text-xs text-[#FF8C00]">{selected.size} equipamento(s) selecionado(s)</p>
          )}

          {/* Lista por categoria */}
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat, catIdx) => (
              <div key={cat.label}>
                {catIdx > 0 && <div className="h-px bg-white/[0.05] my-3" />}
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
                          onClick={() => toggleItem(item.nome)}
                          className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] ${
                            isSelected
                              ? 'bg-[#FF8C00]/10 text-white'
                              : 'text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
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
          </div>

        {/* Itens personalizados */}
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
      </>
    )
  }

  // ── Etapa: upload ──────────────────────────────────────────────────────────
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
              {uploading ? 'Enviando...' : `${uploadedUrls.length} foto(s) enviada(s)`}
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
            {detecting ? 'A IA está analisando...' : 'Identificar e adicionar à lista'}
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

}
