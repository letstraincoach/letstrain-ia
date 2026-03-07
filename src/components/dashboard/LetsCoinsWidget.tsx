'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import GoldCoin from '@/components/ui/GoldCoin'

interface LetsCoinsWidgetProps {
  coins: number
}

export default function LetsCoinsWidget({ coins }: LetsCoinsWidgetProps) {
  return (
    <Link href="/progress#coins" className="block">
      <motion.div
        className="rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.05] px-4 py-3.5 flex items-center justify-between hover:border-[#F59E0B]/40 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <GoldCoin size={36} />
          <div>
            <p className="text-xs text-[#F59E0B] font-semibold uppercase tracking-wider">Lets Coins</p>
            <p className="text-xl font-bold leading-tight">
              {coins.toLocaleString('pt-BR')}
              <span className="text-sm font-normal text-white/40 ml-1">coins</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-white/30">Resgatar →</span>
          {coins >= 100 && (
            <span className="text-[10px] text-[#F59E0B]/70">
              = R${coins >= 500 ? '35' : coins >= 200 ? '12' : '5'} na loja
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
