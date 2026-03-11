'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'

interface ShareProgressButtonProps {
  nivel: string
  emoji: string
  score: number
  scoreLabel: string
  treinos: number
  streak: number
  conquistas: number
}

export default function ShareProgressButton({
  nivel,
  emoji,
  score,
  scoreLabel,
  treinos,
  streak,
  conquistas,
}: ShareProgressButtonProps) {
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  function buildImageUrl() {
    const base = '/api/share/progresso'
    const p = new URLSearchParams({
      nivel,
      emoji,
      score: String(score),
      scoreLabel,
      treinos: String(treinos),
      streak: String(streak),
      conquistas: String(conquistas),
    })
    return `${base}?${p.toString()}`
  }

  function buildText() {
    const parts = [
      `${emoji} Nível ${nivel} no Lets Train!`,
      score > 0 ? `Body Score: ${score}/100 (${scoreLabel})` : null,
      `🏋️ ${treinos} treinos concluídos`,
      streak >= 2 ? `🔥 ${streak} dias de sequência` : null,
      `🏅 ${conquistas} conquistas desbloqueadas`,
      `\nTreina comigo → https://letstrain.com.br`,
    ].filter(Boolean)
    return parts.join('\n')
  }

  async function handleShare() {
    setSharing(true)
    const imageUrl = buildImageUrl()
    const text = buildText()
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'progresso-lets-train.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, title: 'Lets Train' })
      } else if (navigator.share) {
        await navigator.share({ text, title: 'Lets Train' })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch { /* usuário cancelou */ }
    finally { setSharing(false) }
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')
  }

  async function handleSaveImage() {
    const a = document.createElement('a')
    a.href = buildImageUrl()
    a.download = 'progresso-lets-train.png'
    a.click()
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full h-12 rounded-2xl border border-[#FF8C00]/30 bg-[#FF8C00]/[0.08] text-[#FF8C00] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FF8C00]/[0.14] transition-colors active:scale-[0.98] disabled:opacity-60"
      >
        {sharing ? '...' : copied ? <><Icon name="check-circle" /> Link copiado!</> : <><Icon name="share" /> Compartilhar progresso</>}
      </button>

      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
        >
          <Icon name="comment" /> WhatsApp
        </button>
        <button
          onClick={handleSaveImage}
          className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
        >
          <Icon name="download" /> Salvar
        </button>
      </div>
    </div>
  )
}
