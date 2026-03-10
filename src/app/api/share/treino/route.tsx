import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const STAR_FILLED  = '⭐'
const RATING_EMOJI = ['😞', '😕', '😐', '😊', '🤩']

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const nome    = searchParams.get('nome')    ?? 'Treino'
  const duracao = searchParams.get('duracao') ?? '45'
  const streak  = searchParams.get('streak')  ?? '0'
  const rating  = parseInt(searchParams.get('rating') ?? '5')

  const stars    = STAR_FILLED.repeat(Math.min(Math.max(rating, 1), 5))
  const moodEmoji = RATING_EMOJI[Math.min(Math.max(rating - 1, 0), 4)]
  const streakNum = parseInt(streak)

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          gap: 0,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Tag topo */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            background: 'rgba(255,140,0,0.10)',
            border: '1px solid rgba(255,140,0,0.28)',
            borderRadius: 100,
            padding: '8px 24px',
            color: '#FF8C00',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          Treino Concluído 🏋️
        </div>

        {/* Emoji central */}
        <div style={{ fontSize: 96, marginBottom: 28 }}>{moodEmoji}</div>

        {/* Nome do treino */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 52,
            fontWeight: 900,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.15,
            marginBottom: 24,
          }}
        >
          {nome}
        </div>

        {/* Stars */}
        <div style={{ fontSize: 40, marginBottom: 40, letterSpacing: 4 }}>{stars}</div>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 20,
              padding: '14px 28px',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 26,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>⏱</span>
            <span>{duracao} min</span>
          </div>

          {streakNum >= 2 && (
            <div
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 20,
                padding: '14px 28px',
                color: '#EF4444',
                fontSize: 26,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>🔥</span>
              <span>{streak} dias</span>
            </div>
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div style={{ color: '#FF8C00', fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>
            LETS TRAIN
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 19 }}>
            letstrain.com.br
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  )
}
