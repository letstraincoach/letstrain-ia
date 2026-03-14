/**
 * Helpers para vídeos de exercícios
 *
 * Organização no Supabase Storage:
 *   Bucket: exercise-videos (público)
 *   Arquivos: {slug}.mp4  (slug = exercise_catalog.slug)
 *
 * O mapa nome→slug é carregado uma vez do catálogo via initExerciseSlugMap().
 * Fallback: converte nome→slug por normalização de texto.
 */

import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = 'https://ngjkzchoonpuxwgkckyq.supabase.co'
const BUCKET = 'exercise-videos'

let _slugMap: Map<string, string> | null = null

/** Carrega o mapa nome→slug do exercise_catalog (chame uma vez no mount) */
export async function initExerciseSlugMap(): Promise<void> {
  if (_slugMap) return
  const supabase = createClient()
  const { data } = await supabase
    .from('exercise_catalog')
    .select('slug, nome')
  _slugMap = new Map(data?.map(e => [e.nome, e.slug]) ?? [])
}

/** Normaliza o nome do exercício para slug (fallback quando não está no catálogo) */
export function exerciseNameToSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')   // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-')           // espaços → hífens
}

/** Retorna a URL pública do vídeo no Supabase Storage */
export function getExerciseVideoUrl(nome: string): string {
  const slug = _slugMap?.get(nome) ?? exerciseNameToSlug(nome)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}.mp4`
}
