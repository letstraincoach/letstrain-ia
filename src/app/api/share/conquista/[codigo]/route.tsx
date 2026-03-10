import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codigo: string }> },
) {
  await params // resolve dynamic param (not used in image, data comes from query)

  const { searchParams } = req.nextUrl
  const emoji = searchParams.get('emoji') ?? '🏅'
  const nome = searchParams.get('nome') ?? 'Conquista'
  const descricao = searchParams.get('descricao') ?? ''

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
        }}
      >
        {/* Glow de fundo */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Tag topo */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.30)',
              borderRadius: 100,
              padding: '8px 20px',
              color: '#F59E0B',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Conquista desbloqueada
          </div>
        </div>

        {/* Card da figurinha */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 260,
            height: 320,
            background: 'rgba(245,158,11,0.08)',
            border: '2px solid rgba(245,158,11,0.40)',
            borderRadius: 28,
            padding: '0 0 20px 0',
            marginBottom: 36,
            overflow: 'hidden',
          }}
        >
          {/* Topo degradê */}
          <div
            style={{
              width: '100%',
              height: 56,
              background: 'linear-gradient(to bottom, rgba(245,158,11,0.20), transparent)',
              flexShrink: 0,
            }}
          />
          {/* Emoji */}
          <div style={{ fontSize: 110, lineHeight: 1 }}>{emoji}</div>
          {/* Divisória */}
          <div
            style={{
              width: '85%',
              height: 1,
              background: 'rgba(245,158,11,0.25)',
              margin: '0 auto',
            }}
          />
          {/* Nome */}
          <div
            style={{
              color: '#F59E0B',
              fontSize: 22,
              fontWeight: 800,
              textAlign: 'center',
              padding: '12px 20px 0',
              lineHeight: 1.2,
            }}
          >
            {nome}
          </div>
        </div>

        {/* Descrição */}
        {descricao && (
          <div
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 26,
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.45,
              marginBottom: 12,
            }}
          >
            {descricao}
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              color: '#FF8C00',
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            LETS TRAIN
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>
            letstrain.com.br
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    },
  )
}
