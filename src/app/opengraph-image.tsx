import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Lets Train — Treino personalizado por IA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 52, fontWeight: 900, color: '#FF8C00', letterSpacing: -1 }}>
            LETS
          </span>
          <span style={{ fontSize: 52, fontWeight: 900, color: '#ffffff', letterSpacing: -1 }}>
            TRAIN
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Seu treino,{' '}
            <span style={{ color: '#FF8C00' }}>gerado por IA.</span>
          </p>
          <p
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Evoluindo todo dia.
          </p>
        </div>

        {/* Sub */}
        <p
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Metodologia real, resultados de verdade.
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['15 níveis', '60+ conquistas', '3 dias grátis'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,140,0,0.12)',
                border: '1px solid rgba(255,140,0,0.3)',
                borderRadius: 100,
                padding: '10px 24px',
                fontSize: 20,
                fontWeight: 700,
                color: '#FF8C00',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 18,
            color: 'rgba(255,255,255,0.2)',
            margin: 0,
          }}
        >
          letstrain.com.br
        </p>
      </div>
    ),
    { ...size }
  )
}
