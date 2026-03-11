import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const nivel      = searchParams.get('nivel')      ?? 'Iniciante'
  const emoji      = searchParams.get('emoji')      ?? '🥉'
  const score      = parseInt(searchParams.get('score') ?? '0')
  const scoreLabel = searchParams.get('scoreLabel') ?? ''
  const treinos    = searchParams.get('treinos')    ?? '0'
  const streak     = parseInt(searchParams.get('streak') ?? '0')
  const conquistas = searchParams.get('conquistas') ?? '0'
  const hasScore   = score > 0

  // Score color
  const scoreCor =
    score >= 80 ? '#4ADE80' :
    score >= 60 ? '#FF8C00' :
    score >= 40 ? '#FBBF24' : '#F87171'

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
        {/* Glow central */}
        <div
          style={{
            position: 'absolute',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,140,0,0.13) 0%, transparent 70%)',
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
            border: '1px solid rgba(255,140,0,0.30)',
            borderRadius: 100,
            padding: '10px 28px',
            color: '#FF8C00',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          📊 Meu Progresso
        </div>

        {/* Level badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: hasScore ? 32 : 48,
          }}
        >
          <span style={{ fontSize: 64 }}>{emoji}</span>
          <span
            style={{
              color: '#FF8C00',
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            {nivel}
          </span>
        </div>

        {/* Body Score (se disponível) */}
        {hasScore && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: `6px solid ${scoreCor}`,
                background: scoreCor + '15',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 60px ${scoreCor}40`,
              }}
            >
              <span
                style={{
                  color: scoreCor,
                  fontSize: 62,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                /100
              </span>
            </div>
            <span
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 20,
                fontWeight: 600,
                marginTop: 14,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Lets Body Score{scoreLabel ? ` · ${scoreLabel}` : ''}
            </span>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 20,
          }}
        >
          {[
            { icon: '🏋️', value: treinos,             label: 'Treinos'    },
            { icon: '🔥', value: `${streak}d`,         label: 'Sequência'  },
            { icon: '🏅', value: conquistas,            label: 'Conquistas' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 24,
                padding: '22px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minWidth: 180,
              }}
            >
              <span style={{ fontSize: 34 }}>{stat.icon}</span>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: 38,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
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
          <div style={{ color: '#FF8C00', fontSize: 32, fontWeight: 900, letterSpacing: 1 }}>
            LETS TRAIN
          </div>
          <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 20 }}>
            letstrain.com.br
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  )
}
