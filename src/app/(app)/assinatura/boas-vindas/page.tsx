import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import { BoasVindasContent } from './content'

export default async function BoasVindasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nome, nivel_atual')
    .eq('id', user.id)
    .single()

  const nivel = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]
  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'

  return (
    <BoasVindasContent
      firstName={firstName}
      levelLabel={levelCfg.label}
      levelEmoji={levelCfg.emoji}
      levelCor={levelCfg.cor}
      levelCorBg={levelCfg.corBg}
      levelDescricao={levelCfg.descricao}
    />
  )
}
