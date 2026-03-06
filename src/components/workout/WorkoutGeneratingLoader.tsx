'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'Analisando seu perfil e equipamentos...',
  'Preparando seu treino de hoje...',
  'Aplicando a metodologia Time Efficient...',
  'Ajustando a intensidade para sua disposição...',
  'Quase pronto! Vai ser um treino incrível...',
]

export default function WorkoutGeneratingLoader() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-6">
      {/* Spinner animado */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#FF8C00] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-[#FF8C00]/40 border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">💪</span>
      </div>

      {/* Mensagem rotativa */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="text-sm text-white/60 text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Barra de progresso indeterminada */}
      <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-[#FF8C00] rounded-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
