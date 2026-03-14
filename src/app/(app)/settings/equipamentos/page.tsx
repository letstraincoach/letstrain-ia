import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EquipmentManager from '@/components/settings/EquipmentManager'

export default async function EquipamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, equipmentResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('local_treino, condominio_nome, condominio_cep, condominio_fotos')
      .eq('id', user.id)
      .single(),

    supabase
      .from('user_equipment')
      .select('id, nome_custom')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: true }),
  ])

  const profile = profileResult.data
  const equipment = equipmentResult.data ?? []

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Meus Equipamentos</h1>
          {profile?.local_treino === 'condominio' && profile.condominio_nome && (
            <p className="text-sm text-white/50 mt-1">🏠 {profile.condominio_nome}</p>
          )}
        </div>

        <EquipmentManager
          userId={user.id}
          localTipo={profile?.local_treino as 'condominio' | 'academia' | 'hotel' | null}
          initialEquipment={equipment
            .filter((e) => e.nome_custom !== null)
            .map((e) => ({ id: e.id, nome_custom: e.nome_custom as string }))}
          condominioFotos={(profile?.condominio_fotos as string[] | null) ?? []}
        />

      </div>
    </div>
  )
}
