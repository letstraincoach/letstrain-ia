'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

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
      {/* Logo animada */}
      <div className="relative flex items-center justify-center">
        {/* Anel externo girando */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-white/5" />
        <motion.div
          className="absolute w-24 h-24 rounded-full border-4 border-t-[#FF8C00] border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        {/* Anel interno girando ao contrário */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border-4 border-t-transparent border-r-[#FF8C00]/40 border-b-transparent border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Logo centralizada */}
        <LetsTrainLogo size="xs" />
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
