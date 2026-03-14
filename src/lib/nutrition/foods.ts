export type FoodCategory = 'proteinas' | 'carboidratos' | 'extras'

export interface FoodLogItem {
  food_id: string
  nome: string
  icone: string
  quantidade: number
  calorias: number
  proteina_g: number
  carbo_g: number
  gordura_g: number
}

export interface Food {
  id: string
  nome: string
  icone: string
  porcao: string
  calorias: number
  proteina_g: number
  carbo_g: number
  gordura_g: number
  categoria: FoodCategory
}

export const FOODS: Food[] = [
  // Proteínas
  { id: 'ovo', nome: 'Ovo', icone: '🥚', porcao: '1 unidade', calorias: 72, proteina_g: 6.3, carbo_g: 0.4, gordura_g: 4.8, categoria: 'proteinas' },
  { id: 'frango', nome: 'Frango', icone: '🍗', porcao: '100g', calorias: 165, proteina_g: 31.0, carbo_g: 0.0, gordura_g: 3.6, categoria: 'proteinas' },
  { id: 'carne', nome: 'Carne', icone: '🥩', porcao: '100g', calorias: 250, proteina_g: 26.0, carbo_g: 0.0, gordura_g: 17.0, categoria: 'proteinas' },
  { id: 'peixe', nome: 'Peixe', icone: '🐟', porcao: '100g', calorias: 120, proteina_g: 24.0, carbo_g: 0.0, gordura_g: 2.0, categoria: 'proteinas' },
  { id: 'atum', nome: 'Atum', icone: '🐠', porcao: '1 lata (120g)', calorias: 132, proteina_g: 29.4, carbo_g: 0.0, gordura_g: 1.2, categoria: 'proteinas' },
  { id: 'leite', nome: 'Leite', icone: '🥛', porcao: '200ml', calorias: 120, proteina_g: 6.6, carbo_g: 9.4, gordura_g: 3.6, categoria: 'proteinas' },
  { id: 'queijo', nome: 'Queijo', icone: '🧀', porcao: '30g', calorias: 114, proteina_g: 7.0, carbo_g: 0.4, gordura_g: 9.4, categoria: 'proteinas' },
  { id: 'whey', nome: 'Whey', icone: '🥤', porcao: '1 dose (30g)', calorias: 110, proteina_g: 23.0, carbo_g: 3.0, gordura_g: 1.5, categoria: 'proteinas' },

  // Carboidratos
  { id: 'arroz', nome: 'Arroz', icone: '🍚', porcao: '4 colheres (100g)', calorias: 130, proteina_g: 2.7, carbo_g: 28.0, gordura_g: 0.3, categoria: 'carboidratos' },
  { id: 'feijao', nome: 'Feijão', icone: '🫘', porcao: '1 concha (100g)', calorias: 77, proteina_g: 5.0, carbo_g: 14.0, gordura_g: 0.5, categoria: 'carboidratos' },
  { id: 'pao', nome: 'Pão', icone: '🍞', porcao: '1 fatia (50g)', calorias: 130, proteina_g: 4.5, carbo_g: 25.0, gordura_g: 1.5, categoria: 'carboidratos' },
  { id: 'batata', nome: 'Batata', icone: '🥔', porcao: '1 média (150g)', calorias: 116, proteina_g: 3.0, carbo_g: 26.0, gordura_g: 0.1, categoria: 'carboidratos' },
  { id: 'batata_doce', nome: 'Batata doce', icone: '🍠', porcao: '1 média (150g)', calorias: 129, proteina_g: 2.7, carbo_g: 29.0, gordura_g: 0.2, categoria: 'carboidratos' },
  { id: 'macarrao', nome: 'Macarrão', icone: '🍝', porcao: '80g cozido', calorias: 131, proteina_g: 4.6, carbo_g: 25.0, gordura_g: 1.0, categoria: 'carboidratos' },
  { id: 'tapioca', nome: 'Tapioca', icone: '🌮', porcao: '1 média (40g)', calorias: 140, proteina_g: 0.2, carbo_g: 34.0, gordura_g: 0.2, categoria: 'carboidratos' },
  { id: 'banana', nome: 'Banana', icone: '🍌', porcao: '1 unidade (100g)', calorias: 89, proteina_g: 1.1, carbo_g: 23.0, gordura_g: 0.3, categoria: 'carboidratos' },
  { id: 'aveia', nome: 'Aveia', icone: '🥣', porcao: '3 colheres (40g)', calorias: 147, proteina_g: 5.4, carbo_g: 26.0, gordura_g: 2.8, categoria: 'carboidratos' },
  { id: 'cuscuz', nome: 'Cuscuz', icone: '🌾', porcao: '4 colheres (100g)', calorias: 125, proteina_g: 3.8, carbo_g: 26.0, gordura_g: 0.4, categoria: 'carboidratos' },
  { id: 'mandioca', nome: 'Mandioca', icone: '🌿', porcao: '100g cozida', calorias: 157, proteina_g: 1.0, carbo_g: 38.0, gordura_g: 0.3, categoria: 'carboidratos' },
  { id: 'inhame', nome: 'Inhame', icone: '🥦', porcao: '100g cozido', calorias: 118, proteina_g: 1.5, carbo_g: 27.0, gordura_g: 0.1, categoria: 'carboidratos' },

  // Extras
  { id: 'salada', nome: 'Salada', icone: '🥗', porcao: '1 prato', calorias: 25, proteina_g: 1.5, carbo_g: 4.0, gordura_g: 0.2, categoria: 'extras' },
  { id: 'fruta', nome: 'Fruta', icone: '🍎', porcao: '1 porção', calorias: 65, proteina_g: 0.5, carbo_g: 16.0, gordura_g: 0.2, categoria: 'extras' },
  { id: 'doce', nome: 'Doce', icone: '🍫', porcao: '1 porção (30g)', calorias: 150, proteina_g: 2.0, carbo_g: 20.0, gordura_g: 7.0, categoria: 'extras' },
  { id: 'bebida', nome: 'Bebida alcoólica', icone: '🍺', porcao: '350ml', calorias: 150, proteina_g: 1.0, carbo_g: 13.0, gordura_g: 0.0, categoria: 'extras' },
  { id: 'azeite', nome: 'Azeite', icone: '🫙', porcao: '1 colher (10ml)', calorias: 88, proteina_g: 0.0, carbo_g: 0.0, gordura_g: 10.0, categoria: 'extras' },
  { id: 'manteiga', nome: 'Manteiga', icone: '🧈', porcao: '1 colher (10g)', calorias: 73, proteina_g: 0.1, carbo_g: 0.0, gordura_g: 8.1, categoria: 'extras' },
  { id: 'granola', nome: 'Granola', icone: '🌰', porcao: '3 colheres (40g)', calorias: 162, proteina_g: 4.0, carbo_g: 26.0, gordura_g: 5.0, categoria: 'extras' },
  { id: 'iogurte', nome: 'Iogurte', icone: '🥛', porcao: '1 pote (120g)', calorias: 100, proteina_g: 9.0, carbo_g: 8.0, gordura_g: 2.5, categoria: 'extras' },
]

export const FOODS_BY_CATEGORY = {
  proteinas: FOODS.filter((f) => f.categoria === 'proteinas'),
  carboidratos: FOODS.filter((f) => f.categoria === 'carboidratos'),
  extras: FOODS.filter((f) => f.categoria === 'extras'),
}

export const FOOD_MAP: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]))

export const TIPO_LABELS: Record<string, string> = {
  cafe_manha: 'Café da manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
  pos_treino: 'Pós-treino',
  outro: 'Outro',
}

export const TIPO_ICONS: Record<string, string> = {
  cafe_manha: '☀️',
  almoco: '🍽️',
  lanche: '🍎',
  jantar: '🌙',
  pos_treino: '💪',
  outro: '🍴',
}

export function calcularTotais(items: Array<{ food_id: string; quantidade: number }>) {
  return items.reduce(
    (acc, item) => {
      const food = FOOD_MAP[item.food_id]
      if (!food) return acc
      return {
        calorias: acc.calorias + Math.round(food.calorias * item.quantidade),
        proteina_g: +(acc.proteina_g + food.proteina_g * item.quantidade).toFixed(1),
        carbo_g: +(acc.carbo_g + food.carbo_g * item.quantidade).toFixed(1),
        gordura_g: +(acc.gordura_g + food.gordura_g * item.quantidade).toFixed(1),
      }
    },
    { calorias: 0, proteina_g: 0, carbo_g: 0, gordura_g: 0 }
  )
}

// ─── Metas nutricionais ───────────────────────────────────────────────────────

type GoalProfile = {
  peso: number | null
  altura: number | null
  idade: number | null
  sexo: 'masculino' | 'feminino' | null
  objetivo: string | null
  dias_por_semana: number | null
}

export function calcularMetaCalorica(profile: GoalProfile): number {
  const { peso, altura, idade, sexo, objetivo, dias_por_semana } = profile
  if (!peso || !altura || !idade || !sexo) return 2000

  // TMB Harris-Benedict
  const tmb =
    sexo === 'masculino'
      ? 88.36 + 13.4 * peso + 4.8 * altura - 5.7 * idade
      : 447.6 + 9.2 * peso + 3.1 * altura - 4.3 * idade

  // Fator de atividade baseado em dias_por_semana
  const dias = dias_por_semana ?? 3
  const fator =
    dias <= 1 ? 1.2 : dias <= 3 ? 1.375 : dias <= 5 ? 1.55 : 1.725

  const tdee = tmb * fator

  // Ajuste por objetivo
  if (objetivo?.includes('perda_peso')) return Math.round(tdee - 400)
  if (objetivo?.includes('ganho_massa')) return Math.round(tdee + 300)
  return Math.round(tdee)
}

export function calcularMetaProteina(peso_kg: number | null): number {
  if (!peso_kg) return 120
  return Math.round(peso_kg * 1.8)
}
