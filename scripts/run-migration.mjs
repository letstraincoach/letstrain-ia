// scripts/run-migration.mjs
// Executa as migrations via Supabase REST API (DML) e exibe DDL para SQL Editor
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Lê o .env.local
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  if (line.startsWith('#') || !line.trim() || !line.includes('=')) continue
  const [key, ...rest] = line.split('=')
  env[key.trim()] = rest.join('=').trim()
}

const BASE_URL    = env['NEXT_PUBLIC_SUPABASE_URL']
const KEY         = env['SUPABASE_SERVICE_ROLE_KEY']
const DATABASE_URL = env['DATABASE_URL']  // para futuras migrações DDL via pg

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${KEY}`,
  'apikey': KEY,
}

async function patch(path, body) {
  const res = await fetch(`${BASE_URL}/rest/v1${path}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${await res.text()}`)
}

async function del(path) {
  const res = await fetch(`${BASE_URL}/rest/v1${path}`, {
    method: 'DELETE',
    headers: { ...headers, 'Prefer': 'return=minimal' },
  })
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}: ${await res.text()}`)
}

async function insert(table, rows) {
  const res = await fetch(`${BASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`INSERT ${table} → ${res.status}: ${await res.text()}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION 002: expand_training_levels (DML only)
// ─────────────────────────────────────────────────────────────────────────────
async function migration002() {
  console.log('\n═══ Migration 002: Expand training levels ═══\n')

  // 1. Migrar nomes de nível antigos → novos
  for (const [old, novo] of [
    ['iniciante',     'iniciante_bronze'],
    ['intermediario', 'intermediario_bronze'],
    ['avancado',      'avancado_bronze'],
    ['pro',           'atleta_pro_max'],
  ]) {
    try {
      await patch(`/user_profiles?nivel_atual=eq.${old}`, { nivel_atual: novo })
      console.log(`  ✅ user_profiles: '${old}' → '${novo}'`)
    } catch (e) {
      console.log(`  ⚠  UPDATE '${old}': ${e.message}`)
    }
  }

  // 2. Deletar conquistas level_up antigas
  try {
    await del('/achievements?criterio_tipo=eq.level_up')
    console.log('  ✅ achievements: conquistas level_up antigas removidas')
  } catch (e) {
    console.log(`  ⚠  DELETE level_up: ${e.message}`)
  }

  // 3. Inserir 14 conquistas level_up novas
  try {
    await insert('achievements', [
      { codigo: 'nivel_iniciante_bronze',    nome: 'Iniciante Bronze',    descricao: 'Superou a adaptação e entrou no nível Iniciante Bronze!',         icone_emoji: '🥉', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'iniciante_bronze' },
      { codigo: 'nivel_iniciante_prata',     nome: 'Iniciante Prata',     descricao: 'Evoluiu para Iniciante Prata. A consistência está mostrando!',    icone_emoji: '🥈', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'iniciante_prata' },
      { codigo: 'nivel_iniciante_ouro',      nome: 'Iniciante Ouro',      descricao: 'Iniciante Ouro conquistado! A base está sólida.',                 icone_emoji: '🥇', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'iniciante_ouro' },
      { codigo: 'nivel_intermediario_bronze',nome: 'Intermediário Bronze', descricao: 'Chegou ao Intermediário Bronze. Os treinos ficam sérios agora.',  icone_emoji: '🔵', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'intermediario_bronze' },
      { codigo: 'nivel_intermediario_prata', nome: 'Intermediário Prata',  descricao: 'Intermediário Prata! Você está se transformando.',                icone_emoji: '🔷', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'intermediario_prata' },
      { codigo: 'nivel_intermediario_ouro',  nome: 'Intermediário Ouro',   descricao: 'Intermediário Ouro. Impressionante evolução!',                   icone_emoji: '⚡', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'intermediario_ouro' },
      { codigo: 'nivel_avancado_bronze',     nome: 'Avançado Bronze',     descricao: 'Avançado Bronze — poucos chegam até aqui.',                       icone_emoji: '💜', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'avancado_bronze' },
      { codigo: 'nivel_avancado_prata',      nome: 'Avançado Prata',      descricao: 'Avançado Prata. Você é uma referência de disciplina.',            icone_emoji: '💎', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'avancado_prata' },
      { codigo: 'nivel_avancado_ouro',       nome: 'Avançado Ouro',       descricao: 'Avançado Ouro — o topo do nível Avançado!',                      icone_emoji: '🔮', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'avancado_ouro' },
      { codigo: 'nivel_atleta_bronze',       nome: 'Atleta Bronze',       descricao: 'Você é um Atleta Bronze. Elite começa aqui.',                    icone_emoji: '🏅', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'atleta_bronze' },
      { codigo: 'nivel_atleta_prata',        nome: 'Atleta Prata',        descricao: 'Atleta Prata conquistado. Performance de alto nível.',            icone_emoji: '🏆', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'atleta_prata' },
      { codigo: 'nivel_atleta_ouro',         nome: 'Atleta Ouro',         descricao: 'Atleta Ouro — você é extraordinário.',                           icone_emoji: '🌟', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'atleta_ouro' },
      { codigo: 'nivel_atleta_pro',          nome: 'Atleta PRÓ',          descricao: 'Atleta PRÓ! Um dos melhores do Lets Train.',                     icone_emoji: '👑', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'atleta_pro' },
      { codigo: 'nivel_atleta_pro_max',      nome: 'Atleta PRÓ MAX',      descricao: 'PRÓ MAX — o nível máximo. Lendário.',                            icone_emoji: '🦅', criterio_tipo: 'level_up', criterio_valor: null, criterio_extra: 'atleta_pro_max' },
    ])
    console.log('  ✅ achievements: 14 conquistas level_up inseridas')
  } catch (e) {
    console.log(`  ⚠  INSERT level_up: ${e.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION 003: album achievements — 18 novas conquistas
// ─────────────────────────────────────────────────────────────────────────────
async function migration003() {
  console.log('\n═══ Migration 003: 18 novas conquistas (álbum) ═══\n')

  try {
    await insert('achievements', [
      { codigo: 'quinze_treinos',     nome: '15 Treinos',         descricao: '15 treinos concluídos. A rotina está se formando!',         icone_emoji: '📆', criterio_tipo: 'treinos_totais', criterio_valor: 15,  criterio_extra: null },
      { codigo: 'persistente',        nome: 'Persistente',        descricao: '50 treinos. Você não para mais!',                            icone_emoji: '💪', criterio_tipo: 'treinos_totais', criterio_valor: 50,  criterio_extra: null },
      { codigo: 'seis_meses',         nome: '6 Meses de Foco',    descricao: '90 treinos. Isso é dedicação de verdade.',                  icone_emoji: '📈', criterio_tipo: 'treinos_totais', criterio_valor: 90,  criterio_extra: null },
      { codigo: 'meio_caminho',       nome: 'Meio Caminho',       descricao: '150 treinos. A metade do caminho para os 300!',             icone_emoji: '🔮', criterio_tipo: 'treinos_totais', criterio_valor: 150, criterio_extra: null },
      { codigo: 'duzentos_treinos',   nome: '200 Treinos',        descricao: '200 treinos. Compromisso que poucos têm.',                  icone_emoji: '🌟', criterio_tipo: 'treinos_totais', criterio_valor: 200, criterio_extra: null },
      { codigo: 'quinhentos_treinos', nome: '500 Treinos',        descricao: '500 treinos. Lenda definitiva do Lets Train.',              icone_emoji: '🏔️', criterio_tipo: 'treinos_totais', criterio_valor: 500, criterio_extra: null },
      { codigo: 'tres_seguidos',      nome: '3 em Sequência',     descricao: '3 dias seguidos. O hábito está nascendo!',                  icone_emoji: '🔥', criterio_tipo: 'streak',         criterio_valor: 3,   criterio_extra: null },
      { codigo: 'duas_semanas',       nome: '2 Semanas de Fogo',  descricao: '14 dias sem parar. Totalmente imparável!',                  icone_emoji: '⚡', criterio_tipo: 'streak',         criterio_valor: 14,  criterio_extra: null },
      { codigo: 'dois_meses',         nome: '2 Meses Seguidos',   descricao: '60 dias seguidos. Disciplina de alto atleta.',              icone_emoji: '💎', criterio_tipo: 'streak',         criterio_valor: 60,  criterio_extra: null },
      { codigo: 'primeira_nota',      nome: 'Primeira Nota',      descricao: 'Primeira avaliação! Feedback é evolução.',                  icone_emoji: '📝', criterio_tipo: 'avaliacoes',     criterio_valor: 1,   criterio_extra: null },
      { codigo: 'vinte_cinco_aval',   nome: '25 Avaliações',      descricao: '25 avaliações. Parceiro de evolução!',                      icone_emoji: '📊', criterio_tipo: 'avaliacoes',     criterio_valor: 25,  criterio_extra: null },
      { codigo: 'cem_aval',           nome: '100 Avaliações',     descricao: '100 avaliações. Você é incrível!',                          icone_emoji: '🔭', criterio_tipo: 'avaliacoes',     criterio_valor: 100, criterio_extra: null },
      { codigo: 'fim_de_semana',      nome: 'Sem Descanso',       descricao: 'Treinou no fim de semana. Sem desculpas!',                  icone_emoji: '📅', criterio_tipo: 'horario',        criterio_valor: null, criterio_extra: 'fim_semana' },
      { codigo: 'almoco_ativo',       nome: 'Almoço Ativo',       descricao: 'Aproveitou o horário do almoço para malhar!',               icone_emoji: '🥗', criterio_tipo: 'horario',        criterio_valor: null, criterio_extra: 'hora_almoco' },
      { codigo: 'golden_time',        nome: 'Golden Hour',        descricao: 'Treinou entre 17h e 19h. Timing perfeito!',                 icone_emoji: '🌇', criterio_tipo: 'horario',        criterio_valor: null, criterio_extra: 'golden_hour' },
      { codigo: 'atleta_completo',    nome: 'Atleta Completo',    descricao: '15 exercícios diferentes. Repertório crescendo!',           icone_emoji: '🏅', criterio_tipo: 'diversidade',    criterio_valor: 15,  criterio_extra: null },
      { codigo: 'especialista',       nome: 'Especialista',       descricao: '25 exercícios diferentes. Repertório completo!',            icone_emoji: '🎯', criterio_tipo: 'diversidade',    criterio_valor: 25,  criterio_extra: null },
      { codigo: 'coreografista',      nome: 'Coreografista',      descricao: '50 exercícios diferentes. Você conhece tudo!',              icone_emoji: '🎭', criterio_tipo: 'diversidade',    criterio_valor: 50,  criterio_extra: null },
    ])
    console.log('  ✅ achievements: 18 novas conquistas inseridas')
  } catch (e) {
    console.log(`  ⚠  INSERT novas conquistas: ${e.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Executando migrações via Supabase REST API...')

  await migration002()
  await migration003()

  // Verifica resultado
  const r = await fetch(`${BASE_URL}/rest/v1/achievements?select=codigo`, {
    headers: { 'Authorization': `Bearer ${KEY}`, 'apikey': KEY },
  })
  const all = await r.json()
  console.log(`\n✅ Total de conquistas no banco: ${all.length} (esperado: 45)`)

  if (all.length >= 45) {
    console.log('\n🎉 Todas as migrações DML aplicadas com sucesso!\n')
  }

  // DDL obrigatório
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║  ⚠  PASSO FINAL: Cole este SQL no Supabase SQL Editor e execute          ║
║     https://supabase.com/dashboard/project/ngjkzchoonpuxwgkckyq/sql/new  ║
╚══════════════════════════════════════════════════════════════════════════╝

-- Atualiza constraints (obrigatório para level-up e geração de treinos)

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_nivel_atual_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_nivel_atual_check
    CHECK (nivel_atual IN (
      'adaptacao',
      'iniciante_bronze','iniciante_prata','iniciante_ouro',
      'intermediario_bronze','intermediario_prata','intermediario_ouro',
      'avancado_bronze','avancado_prata','avancado_ouro',
      'atleta_bronze','atleta_prata','atleta_ouro',
      'atleta_pro','atleta_pro_max'
    ));

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_nivel_check;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_nivel_check
    CHECK (nivel IN (
      'adaptacao',
      'iniciante_bronze','iniciante_prata','iniciante_ouro',
      'intermediario_bronze','intermediario_prata','intermediario_ouro',
      'avancado_bronze','avancado_prata','avancado_ouro',
      'atleta_bronze','atleta_prata','atleta_ouro',
      'atleta_pro','atleta_pro_max'
    ));

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_local_treino_check;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_local_treino_check
    CHECK (local_treino IN ('condominio','academia','hotel'));
`)
}

main().catch(console.error)
