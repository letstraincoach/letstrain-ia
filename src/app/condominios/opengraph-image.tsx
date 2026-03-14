import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Lets Train para Condomínios — Academia ativa para todos os moradores'
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
            background: 'radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)',
          }}
        />

        {/* B2B badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,140,0,0.1)',
            border: '1px solid rgba(255,140,0,0.25)',
            borderRadius: 100,
            padding: '8px 20px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FF8C00', letterSpacing: 2 }}>
            PARA CONDOMÍNIOS
          </span>
        </div>

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 900, color: '#FF8C00', letterSpacing: -1 }}>
            LETS
          </span>
          <span style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', letterSpacing: -1 }}>
            TRAIN
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            marginBottom: 28,
          }}
        >
          <p
            style={{
              fontSize: 46,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            A academia do seu condomínio
          </p>
          <p
            style={{
              fontSize: 46,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            está parada.{' '}
            <span style={{ color: '#FF8C00' }}>Nós ativamos ela.</span>
          </p>
        </div>

        {/* Sub */}
        <p
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            textAlign: 'center',
            maxWidth: 680,
          }}
        >
          APP com IA para todos os moradores. Sem obra. Sem personal fixo.
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
          {['A partir de R$790/mês', 'Todos os moradores', 'Sem obra', '12 meses'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,140,0,0.10)',
                border: '1px solid rgba(255,140,0,0.28)',
                borderRadius: 100,
                padding: '9px 22px',
                fontSize: 18,
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
            fontSize: 16,
            color: 'rgba(255,255,255,0.18)',
            margin: 0,
          }}
        >
          letstrain.com.br/condominios
        </p>
      </div>
    ),
    { ...size }
  )
}
