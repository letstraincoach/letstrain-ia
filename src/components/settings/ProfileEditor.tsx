'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TRAINERS } from '@/lib/trainers/config'

type Objetivo = 'perda_peso' | 'ganho_massa' | 'qualidade_vida'
type Preferencia = 'isolados' | 'grupos_musculares' | 'superior_inferior'

const OBJETIVOS: { value: Objetivo; label: string; emoji: string; desc: string }[] = [
  { value: 'perda_peso',     label: 'Perda de Peso',    emoji: '🔥', desc: 'Queimar gordura e melhorar composição' },
  { value: 'ganho_massa',    label: 'Ganho de Massa',   emoji: '💪', desc: 'Aumentar força e volume muscular' },
  { value: 'qualidade_vida', label: 'Qualidade de Vida',emoji: '🌱', desc: 'Mais disposição, saúde e bem-estar' },
]

const PREFERENCIAS: { value: Preferencia; label: string; emoji: string; desc: string }[] = [
  { value: 'isolados',          label: 'Treinos Isolados',    emoji: '🎯', desc: 'Um grupo muscular por sessão' },
  { value: 'grupos_musculares', label: 'Grupos Musculares',   emoji: '⚡', desc: 'Push/pull/legs (2 grupos/sessão)' },
  { value: 'superior_inferior', label: 'Superior + Inferior', emoji: '🔄', desc: 'Corpo dividido em cima e baixo' },
]

const DIAS = [2, 3, 4, 5, 6, 7]

interface ProfileEditorProps {
  userId: string
  initialNome: string
  initialObjetivo: string[]
  initialDias: number
  initialPreferencia: string
  initialPersonal: string
}

export default function ProfileEditor({
  userId,
  initialNome,
  initialObjetivo,
  initialDias,
  initialPreferencia,
  initialPersonal,
}: ProfileEditorProps) {
  const router = useRouter()
  const [nome, setNome] = useState(initialNome)
  const [objetivos, setObjetivos] = useState<Objetivo[]>(initialObjetivo as Objetivo[])
  const [dias, setDias] = useState(initialDias)
  const [preferencia, setPreferencia] = useState<Preferencia | ''>(initialPreferencia as Preferencia | '')
  const personalSlug = 'guilherme' as const
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function toggleObjetivo(val: Objetivo) {
    setObjetivos((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val]
    )
  }

  async function handleSave() {
    if (!nome.trim() || nome.trim().length < 2) {
      setError('Informe um nome com ao menos 2 caracteres.')
      return
    }
    if (objetivos.length === 0) {
      setError('Selecione ao menos um objetivo.')
      return
    }
    if (!preferencia) {
      setError('Selecione uma preferência de treino.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({
        nome: nome.trim(),
        objetivo: objetivos.join(','),
        dias_por_semana: dias,
        preferencia_treino: preferencia,
        personal_slug: personalSlug,
      })
      .eq('id', userId)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      router.push('/settings')
      router.refresh()
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* Nome */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Nome</h2>
        <Input
          placeholder="Como podemos te chamar?"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoComplete="off"
        />
      </section>

      {/* Objetivos */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Objetivos</h2>
          <span className="text-xs text-white/25">Pode selecionar mais de um</span>
        </div>
        <div className="flex flex-col gap-2">
          {OBJETIVOS.map((opt) => {
            const selected = objetivos.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleObjetivo(opt.value)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                  ${selected
                    ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-white/40">{opt.desc}</p>
                </div>
                {selected && (
                  <div className="ml-auto h-5 w-5 rounded-md bg-[#FF8C00] flex items-center justify-center shrink-0">
                    <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Preferência de treino */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Preferência de Treino</h2>
        <div className="flex flex-col gap-2">
          {PREFERENCIAS.map((opt) => {
            const selected = preferencia === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreferencia(opt.value)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                  ${selected
                    ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-white/40">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Dias por semana */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Dias por Semana</h2>
        <div className="flex gap-2">
          {DIAS.map((d) => {
            const selected = dias === d
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDias(d)}
                className={`flex-1 flex flex-col items-center justify-center h-12 rounded-xl border font-bold text-sm transition-all duration-200 active:scale-[0.97]
                  ${selected
                    ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
                  }`}
              >
                <span>{d}</span>
                <span className="text-[9px] font-normal opacity-70 leading-none">dias</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Personal Trainer — fixo */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Seu Personal Trainer</h2>
        <div className="flex items-center gap-4 rounded-2xl border border-[#FF8C00]/30 bg-[#FF8C00]/[0.06] p-4">
          <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-[#FF8C00]/30">
            <img src="/guilherme-avatar.jpg" alt="Personal Guilherme" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{TRAINERS[0].nome}</p>
            <p className="text-xs text-[#FF8C00] font-medium">{TRAINERS[0].estilo}</p>
            <p className="text-[10px] text-white/25 font-mono mt-0.5">{TRAINERS[0].cref}</p>
          </div>
          <div className="h-5 w-5 rounded-full bg-[#FF8C00] flex items-center justify-center shrink-0">
            <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          ✓ Perfil atualizado!
        </p>
      )}

      <Button fullWidth loading={saving} onClick={handleSave}>
        Salvar alterações
      </Button>

    </div>
  )
}
