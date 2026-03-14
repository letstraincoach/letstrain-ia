import { createServiceClient } from '@/lib/supabase/service'

export type ExerciseCatalogRow = {
  slug: string
  nome: string
  grupo_muscular: string
  nivel_grupo: string
  locais: string[]
  equipamentos: string[] | null
  instrucoes: string
  erros_comuns: string | null
}

// Hierarquia de acesso por nível de treino
const NIVEL_ACESSO: Record<string, string[]> = {
  iniciante:     ['iniciante'],
  intermediario: ['iniciante', 'intermediario'],
  avancado:      ['iniciante', 'intermediario', 'avancado'],
  atleta:        ['iniciante', 'intermediario', 'avancado', 'atleta'],
}

export function getNivelAcesso(trainingLevel: string): string[] {
  if (trainingLevel.startsWith('atleta'))        return NIVEL_ACESSO['atleta']
  if (trainingLevel.startsWith('avancado'))       return NIVEL_ACESSO['avancado']
  if (trainingLevel.startsWith('intermediario'))  return NIVEL_ACESSO['intermediario']
  return NIVEL_ACESSO['iniciante']
}

export async function fetchExerciseCatalog(
  localTreino: string,
  trainingLevel: string,
): Promise<ExerciseCatalogRow[]> {
  const supabase = createServiceClient()
  const niveisAcesso = getNivelAcesso(trainingLevel)

  // Normaliza local: hotel é tratado como condominio para fins de catálogo
  const localNormalizado = localTreino === 'hotel' ? 'condominio' : localTreino

  const { data, error } = await supabase
    .from('exercise_catalog')
    .select('slug,nome,grupo_muscular,nivel_grupo,locais,equipamentos,instrucoes,erros_comuns')
    .eq('ativo', true)
    .contains('locais', [localNormalizado])
    .in('nivel_grupo', niveisAcesso)
    .order('grupo_muscular')

  if (error) {
    console.error('[exercise-catalog] Erro ao buscar catálogo:', error)
    return []
  }

  return data ?? []
}

export function formatCatalogForPrompt(exercises: ExerciseCatalogRow[]): string {
  if (exercises.length === 0) return ''

  const byGroup: Record<string, ExerciseCatalogRow[]> = {}
  for (const ex of exercises) {
    if (!byGroup[ex.grupo_muscular]) byGroup[ex.grupo_muscular] = []
    byGroup[ex.grupo_muscular].push(ex)
  }

  const lines: string[] = [
    '=== BANCO DE EXERCÍCIOS VALIDADOS PELOS PROFESSORES LETS TRAIN ===',
    'Priorize SEMPRE os exercícios desta lista. Ao selecionar um exercício catalogado, use o nome e as instruções EXATAMENTE como estão abaixo.',
    '',
  ]

  for (const [grupo, exs] of Object.entries(byGroup)) {
    lines.push(`--- ${grupo.toUpperCase().replace('_', ' ')} ---`)
    for (const ex of exs) {
      const equips = ex.equipamentos?.length ? ex.equipamentos.join(', ') : 'peso corporal'
      lines.push(`• ${ex.nome} [${equips}]`)
      lines.push(`  Execução: ${ex.instrucoes}`)
      if (ex.erros_comuns) lines.push(`  Erros comuns: ${ex.erros_comuns}`)
    }
    lines.push('')
  }

  lines.push('REGRAS DE USO DO CATÁLOGO:')
  lines.push('1. Selecione exercícios preferencialmente desta lista.')
  lines.push('2. Ao selecionar, copie nome e instrucoes idênticos ao catálogo.')
  lines.push('3. Somente use exercícios fora do catálogo se nenhum catalogado se adequar ao grupo muscular do treino.')
  lines.push('')

  return lines.join('\n')
}
