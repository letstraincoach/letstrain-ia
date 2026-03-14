'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import type { TrainingLocation } from '@/types/database.types'

const OPTIONS: {
  value: TrainingLocation
  label: string
  icon: string
  descricao: string
  detalhe: string
}[] = [
  {
    value: 'condominio',
    label: 'Academia de Condomínio',
    icon: 'building',
    descricao: 'Equipamentos limitados mas suficientes',
    detalhe: 'Fotografe os aparelhos disponíveis e nossa equipe monta seu treino com o que você tem.',
  },
  {
    value: 'hotel',
    label: 'Academia de Hotel',
    icon: 'plane',
    descricao: 'Estrutura básica, ideal para viagens',
    detalhe: 'Fotografe a academia do hotel e nossa equipe monta um treino completo com o que estiver disponível.',
  },
  {
    value: 'academia',
    label: 'Academia Convencional',
    icon: 'gym',
    descricao: 'Academia completa com máquinas e peso livre',
    detalhe: 'Selecione os equipamentos disponíveis e seu personal IA monta um treino com tudo que a academia oferece.',
  },
]

export default function LocalPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<TrainingLocation | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({
        local_treino: selected,
        onboarding_etapa: 'equipamentos',
      })
      .eq('id', user.id)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    router.push('/equipamentos')
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-8 pt-2">
      {/* Título */}
      <motion.div
        className="text-center w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold">Onde você vai treinar?</h2>
        <p className="mt-1 text-sm text-white/50">
          Seus treinos serão personalizados para o seu ambiente.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col gap-4 w-full">
        {OPTIONS.map((opt, i) => {
          const isSelected = selected === opt.value
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.1 }}
              className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 active:scale-[0.98]
                ${isSelected
                  ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
            >
              <div className="flex items-start gap-4">
                <Icon name={opt.icon} className="text-3xl leading-none mt-0.5 text-[#FF8C00]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{opt.label}</span>
                    {isSelected && (
                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF8C00]">
                        <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-white/50">{opt.descricao}</p>
                  <p className="mt-2 text-xs text-white/40 leading-relaxed">{opt.detalhe}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 w-full">
          {error}
        </p>
      )}

      {/* CTA */}
      <motion.div
        className="w-full flex flex-col gap-3 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Button fullWidth disabled={!selected} loading={saving} onClick={handleConfirm}>
          Confirmar local
        </Button>
        <button
          type="button"
          onClick={() => router.push('/nivel')}
          className="text-sm text-white/30 hover:text-white/60 transition-colors text-center py-1"
        >
          ← Voltar
        </button>
      </motion.div>
    </div>
  )
}
