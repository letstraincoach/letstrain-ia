'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TelefoneInputProps {
  userId: string
  initialTelefone: string | null
}

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2)  return `(${digits}`
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  return value
}

export default function TelefoneInput({ userId, initialTelefone }: TelefoneInputProps) {
  const [telefone, setTelefone] = useState(initialTelefone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(maskTelefone(e.target.value))
    setSaved(false)
  }

  async function handleSave() {
    const digits = telefone.replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 10) return // incompleto
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('user_profiles')
      .update({ telefone: digits.length >= 10 ? telefone : null })
      .eq('id', userId)
    setSaving(false)
    setSaved(true)
  }

  const digits = telefone.replace(/\D/g, '')
  const isValid = digits.length === 0 || digits.length >= 10

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-white/70 mb-0.5">WhatsApp / Celular</p>
        <p className="text-xs text-white/35 leading-relaxed">
          Opcional. Use para receber lembretes de treino por WhatsApp no futuro.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={telefone}
          onChange={handleChange}
          onBlur={handleSave}
          placeholder="(11) 99999-9999"
          className={`flex-1 rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transition-colors
            ${!isValid ? 'border-red-500/40' : 'border-white/10'}`}
        />
        {digits.length >= 10 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-[#FF8C00] text-black font-semibold text-xs hover:bg-[#E07000] transition-colors active:scale-[0.97] disabled:opacity-60 shrink-0"
          >
            {saving ? '...' : saved ? '✓' : 'Salvar'}
          </button>
        )}
      </div>

      {!isValid && (
        <p className="text-xs text-red-400">Número incompleto.</p>
      )}
    </div>
  )
}
