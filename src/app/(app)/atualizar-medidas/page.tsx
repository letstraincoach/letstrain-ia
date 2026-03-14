'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function AtualizarMedidasPage() {
  const router = useRouter()
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [idade, setIdade] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Pre-fill with current values from DB
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('user_profiles')
        .select('peso, altura, idade')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.peso) setPeso(String(data.peso))
        if (data.altura) setAltura(String(data.altura))
        if (data.idade) setIdade(String(data.idade))
      }
      setLoaded(true)
    }
    load()
  }, [])

  async function handleSalvar() {
    const pesoNum = parseFloat(peso)
    if (!peso || isNaN(pesoNum) || pesoNum < 30 || pesoNum > 300) {
      setError('Informe um peso válido (entre 30 e 300 kg).')
      return
    }

    setSaving(true)
    setError(null)

    const updates: Record<string, number> = { peso: pesoNum }
    const alturaNum = parseFloat(altura)
    if (altura && !isNaN(alturaNum) && alturaNum >= 100 && alturaNum <= 250) {
      updates.altura = alturaNum
    }
    const idadeNum = parseInt(idade)
    if (idade && !isNaN(idadeNum) && idadeNum >= 10 && idadeNum <= 100) {
      updates.idade = idadeNum
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('user_profiles').update(updates).eq('id', user.id)

    router.push('/progress')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Back */}
        <Link href="/settings" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Voltar
        </Link>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-4xl">📏</span>
          <h1 className="text-xl font-bold">Atualizar medidas</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Mantenha seus dados atualizados para que o{' '}
            <span className="text-white/70 font-medium">Lets Body Score</span>{' '}
            reflita sua evolução real.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        >
          {/* Peso — obrigatório */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Peso atual <span className="text-[#FF8C00]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ex: 82.5"
                value={peso}
                onChange={e => setPeso(e.target.value)}
                disabled={!loaded}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">kg</span>
            </div>
          </div>

          {/* Altura — opcional */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/50">
              Altura <span className="text-white/25 text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 178"
                value={altura}
                onChange={e => setAltura(e.target.value)}
                disabled={!loaded}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">cm</span>
            </div>
          </div>

          {/* Idade — opcional */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/50">
              Idade <span className="text-white/25 text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 32"
                value={idade}
                onChange={e => setIdade(e.target.value)}
                disabled={!loaded}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">anos</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </motion.div>

        <div className="flex flex-col gap-3">
          <Button fullWidth loading={saving} disabled={!loaded} onClick={handleSalvar}>
            Salvar e ver meu desempenho
          </Button>
          <button
            type="button"
            onClick={() => router.push('/progress')}
            className="text-sm text-white/30 hover:text-white/60 transition-colors text-center py-1"
          >
            Pular por agora
          </button>
        </div>

      </div>
    </div>
  )
}
