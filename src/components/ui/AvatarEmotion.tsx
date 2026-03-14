/**
 * AvatarEmotion
 *
 * Exibe a foto de perfil com anel colorido (sinaleira) indicando
 * consistência de treino. A foto sempre original, sem filtros.
 *
 * Sinaleira:
 *  0 dias   → verde pulsando  (treinou hoje)
 *  1 dia    → verde estático  (treinou ontem)
 *  2–4 dias → amarelo         (atenção)
 *  5+ dias  → vermelho pulsando (alerta)
 */

import Image from 'next/image'

interface AvatarEmotionProps {
  avatarUrl: string | null
  diasSemTreinar: number
  size?: number
}

type SignalState = 'green-pulse' | 'green' | 'yellow' | 'red-pulse'

function getSignal(dias: number): SignalState {
  if (dias === 0) return 'green-pulse'  // treinou hoje
  if (dias === 1) return 'green'        // treinou ontem
  if (dias <= 4)  return 'yellow'       // 2–4 dias sem treinar
  return 'red-pulse'                    // 5+ dias — alerta
}

const SIGNAL_STYLES: Record<SignalState, { borderColor: string; boxShadow: string; glowPulse: string }> = {
  'green-pulse': {
    borderColor: '#22c55e',
    boxShadow: '0 0 0 2px rgba(34,197,94,0.25), 0 0 16px rgba(34,197,94,0.35)',
    glowPulse: '0 0 0 3px rgba(34,197,94,0.15), 0 0 24px rgba(34,197,94,0.55)',
  },
  'green': {
    borderColor: 'rgba(34,197,94,0.65)',
    boxShadow: '0 0 10px rgba(34,197,94,0.20)',
    glowPulse: '',
  },
  'yellow': {
    borderColor: 'rgba(234,179,8,0.75)',
    boxShadow: '0 0 10px rgba(234,179,8,0.25)',
    glowPulse: '',
  },
  'red-pulse': {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 2px rgba(239,68,68,0.25), 0 0 16px rgba(239,68,68,0.35)',
    glowPulse: '0 0 0 3px rgba(239,68,68,0.15), 0 0 24px rgba(239,68,68,0.55)',
  },
}

function DefaultAvatar({ size, signal }: { size: number; signal: SignalState }) {
  const s = SIGNAL_STYLES[signal]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${s.borderColor}`,
        boxShadow: s.boxShadow,
        background: 'rgba(255,140,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.45}
        height={size * 0.45}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,140,0,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

export default function AvatarEmotion({ avatarUrl, diasSemTreinar, size = 40 }: AvatarEmotionProps) {
  const signal = getSignal(diasSemTreinar)
  const s = SIGNAL_STYLES[signal]
  const isPulsing = signal === 'green-pulse' || signal === 'red-pulse'

  const animName = signal === 'green-pulse' ? 'avatar-pulse-green' : 'avatar-pulse-red'

  if (!avatarUrl) {
    return <DefaultAvatar size={size} signal={signal} />
  }

  return (
    <>
      {isPulsing && (
        <style>{`
          @keyframes ${animName} {
            0%, 100% { box-shadow: ${s.boxShadow}; }
            50%       { box-shadow: ${s.glowPulse}; }
          }
        `}</style>
      )}

      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px solid ${s.borderColor}`,
          boxShadow: s.boxShadow,
          animation: isPulsing ? `${animName} 2.4s ease-in-out infinite` : 'none',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
        }}
      >
        <Image
          src={avatarUrl}
          alt="Seu avatar"
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </div>
    </>
  )
}
