import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AlbumConquistas from '@/components/gamification/AlbumConquistas'

export const dynamic = 'force-dynamic'

export default async function ConquistasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [allAchievementsResult, userAchievementsResult] = await Promise.all([
    supabase.from('achievements')
      .select('id, codigo, nome, descricao, icone_emoji, criterio_tipo'),

    supabase.from('user_achievements')
      .select('achievement_id, desbloqueado_em')
      .eq('user_id', user.id),
  ])

  const allAchievements = allAchievementsResult.data ?? []
  const userAchievements = userAchievementsResult.data ?? []
  const unlockedCount = userAchievements.length

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">🏆 Conquistas</h1>
          <p className="text-sm text-white/50 mt-1">
            {unlockedCount} de {allAchievements.length} figurinhas desbloqueadas
          </p>
        </div>

        <AlbumConquistas
          achievements={allAchievements}
          userAchievements={userAchievements}
          totalDesbloqueadas={unlockedCount}
        />

        <div className="pb-8" />
      </div>
    </div>
  )
}
