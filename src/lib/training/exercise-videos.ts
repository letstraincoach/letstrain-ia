/**
 * Helpers para vídeos de exercícios
 *
 * Organização no Supabase Storage:
 *   Bucket: exercise-videos (público)
 *   Arquivos: {slug}.mp4
 *   Exemplo: supino-reto-com-halteres.mp4
 *
 * Convenção de slug: nome do exercício em lowercase, sem acentos, espaços → hífens.
 * Deve coincidir com o campo `slug` da tabela exercise_catalog.
 */

const SUPABASE_URL = 'https://ngjkzchoonpuxwgkckyq.supabase.co'
const BUCKET = 'exercise-videos'

/** Normaliza o nome do exercício para o slug do arquivo de vídeo */
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
  const slug = exerciseNameToSlug(nome)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}.mp4`
}
