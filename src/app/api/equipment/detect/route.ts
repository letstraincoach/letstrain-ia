import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DetectedEquipment {
  nome: string
  categoria: 'pesos_livres' | 'maquinas' | 'cabos' | 'cardio' | 'funcionais'
  confianca: 'alta' | 'media' | 'baixa'
}

interface DetectResponse {
  equipamentos: DetectedEquipment[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: { imageUrls: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { imageUrls } = body
  if (!imageUrls?.length) {
    return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
  }

  const urls = imageUrls.slice(0, 10) // máximo 10 imagens

  // Montar content blocks com todas as imagens
  const imageBlocks: Anthropic.ImageBlockParam[] = urls.map((url) => ({
    type: 'image',
    source: {
      type: 'url',
      url,
    },
  }))

  const systemPrompt = `Você é um especialista em equipamentos de academia.
Analise as imagens fornecidas e identifique todos os equipamentos de academia visíveis.
Responda APENAS com JSON válido, sem texto adicional.
Use as categorias: pesos_livres, maquinas, cabos, cardio, funcionais.
Use nomes em português brasileiro.`

  const userPrompt = `Analise estas imagens de uma academia de condomínio e liste todos os equipamentos visíveis.
Para cada equipamento retorne: nome (string em português), categoria (uma das 5 categorias) e confianca (alta/media/baixa).
Se não identificar nenhum equipamento, retorne um array vazio.

Responda APENAS neste formato JSON:
{
  "equipamentos": [
    { "nome": "Halter (par)", "categoria": "pesos_livres", "confianca": "alta" },
    { "nome": "Esteira", "categoria": "cardio", "confianca": "alta" }
  ]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: userPrompt },
          ],
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    let parsed: DetectResponse = { equipamentos: [] }

    try {
      // Extrair JSON do texto (defensivo)
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0]) as DetectResponse
      }
    } catch {
      // Se falhar o parse, retorna lista vazia
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[equipment/detect] Claude API error:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar imagens. Tente novamente.' },
      { status: 500 }
    )
  }
}
