'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GoldCoin from '@/components/ui/GoldCoin'
import Icon from '@/components/ui/Icon'

interface Resgate {
  id: string
  codigo: string
  valor_brl: number
  coins_gastos: number
  status: string
  criado_em: string
}

interface LetsCoinsSectionProps {
  coins: number
  resgates: Resgate[]
}

const OPCOES = [
  { coins: 100, valorBrl: 5,  label: 'R$5 de desconto',  desc: '100 coins' },
  { coins: 200, valorBrl: 12, label: 'R$12 de desconto', desc: '200 coins' },
  { coins: 500, valorBrl: 35, label: 'R$35 de desconto', desc: '500 coins · Melhor custo-benefício' },
]

export default function LetsCoinsSection({ coins: initialCoins, resgates: initialResgates }: LetsCoinsSectionProps) {
  const [coins, setCoins] = useState(initialCoins)
  const [resgates, setResgates] = useState(initialResgates)
  const [loading, setLoading] = useState<number | null>(null)
  const [codigoGerado, setCodigoGerado] = useState<{ codigo: string; valorBrl: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResgatar(coinsOpcao: number, valorBrl: number) {
    setLoading(coinsOpcao)
    setError(null)
    setCodigoGerado(null)

    try {
      const res = await fetch('/api/lets-coins/resgatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: coinsOpcao }),
      })
      const data = await res.json() as { ok?: boolean; codigo?: string; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Erro ao gerar cupom.')
        return
      }

      setCoins((c) => c - coinsOpcao)
      setCodigoGerado({ codigo: data.codigo!, valorBrl })
      setResgates((prev) => [{
        id: Date.now().toString(),
        codigo: data.codigo!,
        valor_brl: valorBrl,
        coins_gastos: coinsOpcao,
        status: 'pendente',
        criado_em: new Date().toISOString(),
      }, ...prev])
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div id="coins" className="flex flex-col gap-6">

      {/* Saldo */}
      <div className="rounded-2xl border border-[#F59E0B]/25 bg-[#F59E0B]/[0.05] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#F59E0B] uppercase tracking-widest font-semibold mb-1">Seu saldo</p>
          <div className="flex items-center gap-2">
            <p className="text-4xl font-bold">{coins.toLocaleString('pt-BR')}</p>
            <GoldCoin size={32} />
          </div>
          <p className="text-xs text-white/40 mt-1">Lets Coins</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-xs text-white/30">Como ganhar:</p>
          <p className="text-xs text-white/50 flex items-center gap-1">+10 por treino <Icon name="dumbbell" /></p>
          <p className="text-xs text-white/50 flex items-center gap-1">+25 a cada 7 dias <Icon name="fire" /></p>
          <p className="text-xs text-white/50 flex items-center gap-1">+15 no 1º do mês <Icon name="star" /></p>
        </div>
      </div>

      {/* Cupom gerado */}
      <AnimatePresence>
        {codigoGerado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-green-400/30 bg-green-400/[0.05] p-5 flex flex-col gap-3"
          >
            <p className="text-sm font-semibold text-green-400 flex items-center gap-1.5"><Icon name="check-circle" /> Cupom gerado com sucesso!</p>
            <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-center">
              <p className="text-xs text-white/40 mb-1">Seu código</p>
              <p className="text-xl font-bold tracking-widest font-mono">{codigoGerado.codigo}</p>
            </div>
            <p className="text-xs text-white/50 leading-relaxed text-center">
              Apresente este código na loja física Lets Train para obter{' '}
              <span className="text-white font-semibold">R${codigoGerado.valorBrl.toFixed(2)}</span> de desconto.
              <br />Válido por 30 dias.
            </p>
            <button
              type="button"
              onClick={() => setCodigoGerado(null)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors text-center"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opções de resgate */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Resgatar desconto na loja</p>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {OPCOES.map((opt) => {
          const temSaldo = coins >= opt.coins
          const isLoading = loading === opt.coins

          return (
            <div
              key={opt.coins}
              className={`rounded-2xl border p-4 flex items-center justify-between transition-all
                ${temSaldo ? 'border-white/10 bg-white/[0.03]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}
            >
              <div>
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleResgatar(opt.coins, opt.valorBrl)}
                disabled={!temSaldo || isLoading || loading !== null}
                className="h-9 px-4 rounded-xl bg-[#F59E0B] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#D97706] transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-3"
              >
                {isLoading
                  ? <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <><GoldCoin size={14} /> {opt.coins}</>
                }
              </button>
            </div>
          )
        })}

        <p className="text-xs text-white/25 leading-relaxed text-center">
          Os cupons são válidos por 30 dias e utilizáveis na loja física Lets Train.
        </p>
      </div>

      {/* Histórico de resgates */}
      {resgates.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Histórico de resgates</p>
          <div className="flex flex-col gap-2">
            {resgates.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-mono font-semibold">{r.codigo}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    R${Number(r.valor_brl).toFixed(2)} · {r.coins_gastos} coins ·{' '}
                    {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  ${r.status === 'usado'
                    ? 'text-white/30 bg-white/5'
                    : 'text-[#F59E0B] bg-[#F59E0B]/10'}`}
                >
                  {r.status === 'usado' ? 'Usado' : 'Ativo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
