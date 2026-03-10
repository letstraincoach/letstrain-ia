'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa_install_dismissed'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Não mostrar se já foi dispensado ou se já está instalado (standalone)
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem(DISMISSED_KEY)
    ) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Mostrar o prompt após 30s — usuário já interagiu com o app
      setTimeout(() => setVisible(true), 30_000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
    setInstalling(false)
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="rounded-2xl border border-white/10 bg-[#161616] shadow-2xl shadow-black/60 p-4 flex items-center gap-3">
            {/* Ícone */}
            <div className="w-12 h-12 rounded-xl bg-[#FF8C00] shrink-0 flex items-center justify-center">
              <span className="text-black font-black text-lg">LT</span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Adicionar à tela inicial</p>
              <p className="text-[11px] text-white/40 mt-0.5">Acesso rápido sem abrir o navegador</p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={dismiss}
                className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1"
              >
                Não
              </button>
              <button
                onClick={install}
                disabled={installing}
                className="text-xs font-bold text-black bg-[#FF8C00] hover:bg-[#E07000] transition-colors px-3 py-1.5 rounded-lg disabled:opacity-60"
              >
                {installing ? '…' : 'Instalar'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
