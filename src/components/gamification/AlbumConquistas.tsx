'use client'

import { motion } from 'framer-motion'
import Figurinha, { type FigurinhaData } from './Figurinha'

// ── Definição das categorias ─────────────────────────────────────────────────

interface CategoryDef {
  tipo: string
  label: string
  emoji: string
  cor: string
  corBg: string
  /** Ordem interna dos codigos (do mais fácil ao mais difícil) */
  codigos: string[]
}

const CATEGORIES: CategoryDef[] = [
  {
    tipo: 'treinos_totais',
    label: 'Treinos',
    emoji: '🏋️',
    cor: '#FF8C00',
    corBg: 'rgba(255,140,0,0.10)',
    codigos: [
      'primeiro_passo',
      'semana_1',
      'quinze_treinos',
      'dedicado',
      'persistente',
      'seis_meses',
      'centuriao',
      'meio_caminho',
      'duzentos_treinos',
      'lendario',
      'quinhentos_treinos',
    ],
  },
  {
    tipo: 'streak',
    label: 'Consistência',
    emoji: '🔥',
    cor: '#EF4444',
    corBg: 'rgba(239,68,68,0.10)',
    codigos: [
      'tres_seguidos',
      'consistente',
      'duas_semanas',
      'imparavel',
      'dois_meses',
    ],
  },
  {
    tipo: 'horario',
    label: 'Horário',
    emoji: '🕐',
    cor: '#8B5CF6',
    corBg: 'rgba(139,92,246,0.10)',
    codigos: [
      'madrugador',
      'noturno',
      'almoco_ativo',
      'golden_time',
      'fim_de_semana',
    ],
  },
  {
    tipo: 'diversidade',
    label: 'Diversidade',
    emoji: '🎨',
    cor: '#10B981',
    corBg: 'rgba(16,185,129,0.10)',
    codigos: [
      'diversificado',
      'explorador',
      'atleta_completo',
      'especialista',
      'coreografista',
    ],
  },
  {
    tipo: 'avaliacoes',
    label: 'Feedback',
    emoji: '⭐',
    cor: '#F59E0B',
    corBg: 'rgba(245,158,11,0.10)',
    codigos: [
      'primeira_nota',
      'avaliador',
      'vinte_cinco_aval',
      'critico',
      'cem_aval',
    ],
  },
  {
    tipo: 'level_up',
    label: 'Evolução',
    emoji: '🏆',
    cor: '#0EA5E9',
    corBg: 'rgba(14,165,233,0.10)',
    codigos: [
      'nivel_iniciante_bronze',
      'nivel_iniciante_prata',
      'nivel_iniciante_ouro',
      'nivel_intermediario_bronze',
      'nivel_intermediario_prata',
      'nivel_intermediario_ouro',
      'nivel_avancado_bronze',
      'nivel_avancado_prata',
      'nivel_avancado_ouro',
      'nivel_atleta_bronze',
      'nivel_atleta_prata',
      'nivel_atleta_ouro',
      'nivel_atleta_pro',
      'nivel_atleta_pro_max',
    ],
  },
]

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AchievementRaw {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  icone_emoji: string | null
  criterio_tipo: string
}

export interface UserAchievementRaw {
  achievement_id: string
  desbloqueado_em: string
}

interface AlbumConquistasProps {
  achievements: AchievementRaw[]
  userAchievements: UserAchievementRaw[]
  totalDesbloqueadas: number
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function AlbumConquistas({
  achievements,
  userAchievements,
  totalDesbloqueadas,
}: AlbumConquistasProps) {
  const achMap = new Map(achievements.map((a) => [a.codigo, a]))
  // unlockedMap: achievement_id (UUID) → desbloqueado_em
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievement_id, ua.desbloqueado_em]))

  return (
    <div className="flex flex-col gap-8">
      {/* Header do álbum */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Álbum de Conquistas</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {totalDesbloqueadas} / {achievements.length} figurinhas reveladas
          </p>
        </div>
        {/* Barra geral de progresso */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-[#FF8C00]">
            {Math.round((totalDesbloqueadas / Math.max(achievements.length, 1)) * 100)}%
          </span>
          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#FF8C00]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((totalDesbloqueadas / Math.max(achievements.length, 1)) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Categorias */}
      {CATEGORIES.map((cat, catIndex) => {
        // Montar lista de figurinhas na ordem definida
        const figurinhas: FigurinhaData[] = cat.codigos
          .map((codigo) => {
            const ach = achMap.get(codigo)
            if (!ach) return null
            const isUnlocked = unlockedMap.has(ach.id)
            return {
              codigo: ach.codigo,
              emoji: ach.icone_emoji ?? '🏅',
              nome: ach.nome,
              descricao: ach.descricao ?? '',
              desbloqueado: isUnlocked,
              desbloqueado_em: isUnlocked ? (unlockedMap.get(ach.id) ?? null) : null,
              cor: cat.cor,
              corBg: cat.corBg,
            } satisfies FigurinhaData
          })
          .filter(Boolean) as FigurinhaData[]

        // Conquistas da categoria que não estão na lista ordenada (fallback)
        const extraAchs = achievements.filter(
          (a) => a.criterio_tipo === cat.tipo && !cat.codigos.includes(a.codigo)
        )
        for (const ach of extraAchs) {
          const isUnlocked = unlockedMap.has(ach.id)
          figurinhas.push({
            codigo: ach.codigo,
            emoji: ach.icone_emoji ?? '🏅',
            nome: ach.nome,
            descricao: ach.descricao ?? '',
            desbloqueado: isUnlocked,
            desbloqueado_em: isUnlocked ? (unlockedMap.get(ach.id) ?? null) : null,
            cor: cat.cor,
            corBg: cat.corBg,
          })
        }

        const unlockedCount = figurinhas.filter((f) => f.desbloqueado).length

        return (
          <motion.section
            key={cat.tipo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: catIndex * 0.06 }}
          >
            {/* Header da categoria */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.emoji}</span>
                <span className="text-sm font-bold" style={{ color: cat.cor }}>
                  {cat.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.cor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((unlockedCount / Math.max(figurinhas.length, 1)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: catIndex * 0.06 + 0.3 }}
                  />
                </div>
                <span className="text-xs text-white/40 tabular-nums">
                  {unlockedCount}/{figurinhas.length}
                </span>
              </div>
            </div>

            {/* Grade de figurinhas */}
            <div className="grid grid-cols-4 gap-2">
              {figurinhas.map((fig, i) => (
                <Figurinha
                  key={fig.codigo}
                  {...fig}
                  delay={catIndex * 0.06 + i * 0.03}
                />
              ))}
            </div>
          </motion.section>
        )
      })}

      {/* Rodapé do álbum */}
      <div
        className="rounded-2xl border border-white/[0.06] p-4 text-center"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs text-white/30 leading-relaxed">
          Continue treinando para revelar todas as figurinhas do álbum. 🎴
        </p>
      </div>
    </div>
  )
}
