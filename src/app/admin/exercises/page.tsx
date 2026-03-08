import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata: Metadata = { title: 'Admin — Exercícios' }

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map((e) => e.trim()).filter(Boolean)

const GRUPO_LABEL: Record<string, string> = {
  peito: 'Peito', costas: 'Costas', ombros: 'Ombros',
  biceps: 'Bíceps', triceps: 'Tríceps', quadriceps: 'Quadríceps',
  posterior: 'Posterior', gluteos: 'Glúteos', panturrilha: 'Panturrilha',
  core: 'Core', full_body: 'Full Body', mobilidade: 'Mobilidade',
}

const NIVEL_COLOR: Record<string, string> = {
  iniciante: 'text-green-400 bg-green-500/10',
  intermediario: 'text-yellow-400 bg-yellow-500/10',
  avancado: 'text-orange-400 bg-orange-500/10',
  atleta: 'text-red-400 bg-red-500/10',
}

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string; nivel?: string; validado_por?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email ?? '')
  if (!isAdmin) redirect('/dashboard')

  const params = await searchParams
  const service = createServiceClient()

  let query = service
    .from('exercise_catalog')
    .select('id,slug,nome,grupo_muscular,nivel_grupo,locais,equipamentos,validado_por,ativo')
    .order('grupo_muscular')
    .order('nivel_grupo')
    .order('nome')

  if (params.grupo) query = query.eq('grupo_muscular', params.grupo)
  if (params.nivel) query = query.eq('nivel_grupo', params.nivel)
  if (params.validado_por) query = query.eq('validado_por', params.validado_por)

  const { data: exercises } = await query

  const total = exercises?.length ?? 0
  const ativos = exercises?.filter((e) => e.ativo).length ?? 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                ← Admin
              </Link>
            </div>
            <h1 className="text-2xl font-black">Banco de Exercícios</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {ativos} exercícios ativos · {total} total
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <FilterLink href="/admin/exercises" label="Todos" active={!params.grupo && !params.nivel && !params.validado_por} />
          <span className="text-white/20 text-xs self-center">Grupo:</span>
          {Object.entries(GRUPO_LABEL).map(([val, label]) => (
            <FilterLink
              key={val}
              href={`/admin/exercises?grupo=${val}`}
              label={label}
              active={params.grupo === val}
            />
          ))}
          <span className="text-white/20 text-xs self-center ml-2">Nível:</span>
          {['iniciante', 'intermediario', 'avancado', 'atleta'].map((n) => (
            <FilterLink
              key={n}
              href={`/admin/exercises?nivel=${n}`}
              label={n}
              active={params.nivel === n}
            />
          ))}
          <span className="text-white/20 text-xs self-center ml-2">Professor:</span>
          {['guilherme', 'carlos', 'raul', 'maicon'].map((p) => (
            <FilterLink
              key={p}
              href={`/admin/exercises?validado_por=${p}`}
              label={p}
              active={params.validado_por === p}
            />
          ))}
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest">Exercício</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest hidden sm:table-cell">Grupo</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest">Nível</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest hidden md:table-cell">Locais</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">Professor</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {(exercises ?? []).map((ex, i) => (
                <tr
                  key={ex.id}
                  className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'} ${!ex.ativo ? 'opacity-40' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{ex.nome}</p>
                    <p className="text-xs text-white/30 font-mono mt-0.5">{ex.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/60">{GRUPO_LABEL[ex.grupo_muscular] ?? ex.grupo_muscular}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${NIVEL_COLOR[ex.nivel_grupo] ?? 'text-white/40 bg-white/5'}`}>
                      {ex.nivel_grupo}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-white/40">{(ex.locais as string[]).join(', ')}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-white/50 capitalize">{ex.validado_por}</span>
                  </td>
                  <td className="px-4 py-3">
                    {ex.ativo
                      ? <span className="text-xs text-green-400">● ativo</span>
                      : <span className="text-xs text-white/30">○ inativo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!exercises || exercises.length === 0) && (
            <div className="text-center py-16 text-white/30 text-sm">
              Nenhum exercício encontrado com os filtros selecionados.
            </div>
          )}
        </div>

        {/* Resumo por grupo */}
        <div>
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Distribuição por Grupo</h2>
          <GroupSummary exercises={exercises ?? []} />
        </div>

      </div>
    </div>
  )
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
        active
          ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
          : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
      }`}
    >
      {label}
    </Link>
  )
}

function GroupSummary({ exercises }: { exercises: { grupo_muscular: string; ativo: boolean }[] }) {
  const byGroup: Record<string, number> = {}
  for (const ex of exercises) {
    if (!ex.ativo) continue
    byGroup[ex.grupo_muscular] = (byGroup[ex.grupo_muscular] ?? 0) + 1
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {Object.entries(byGroup).sort((a, b) => b[1] - a[1]).map(([grupo, count]) => (
        <div key={grupo} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
          <p className="text-lg font-black text-[#FF8C00]">{count}</p>
          <p className="text-xs text-white/40 mt-0.5 capitalize">{GRUPO_LABEL[grupo] ?? grupo}</p>
        </div>
      ))}
    </div>
  )
}
