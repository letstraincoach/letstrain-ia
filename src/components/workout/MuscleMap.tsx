'use client'

// Maps grupo_muscular values to static anatomy images
const MUSCLE_IMAGE: Record<string, string> = {
  peito:        '/Muscles/peito.jpg',
  peitoral:     '/Muscles/peito.jpg',
  costas:       '/Muscles/costas.jpg',
  ombros:       '/Muscles/ombros.jpg',
  deltoides:    '/Muscles/ombros.jpg',
  'deltóide':   '/Muscles/ombros.jpg',
  biceps:       '/Muscles/biceps.jpg',
  'bíceps':     '/Muscles/biceps.jpg',
  triceps:      '/Muscles/triceps.jpg',
  'tríceps':    '/Muscles/triceps.jpg',
  quadriceps:   '/Muscles/quadriceps.jpg',
  posterior:    '/Muscles/posterior.jpg',
  gluteos:      '/Muscles/gluteos.jpg',
  'glúteos':    '/Muscles/gluteos.jpg',
  panturrilha:  '/Muscles/panturrilha.jpg',
  abdomen:      '/Muscles/abdomen.jpg',
  'abdômen':    '/Muscles/abdomen.jpg',
  core:         '/Muscles/core.jpg',
  lombar:       '/Muscles/lombar.jpg',
  trapezio:     '/Muscles/costas.jpg',
  'trapézio':   '/Muscles/costas.jpg',
  'antebraço':  '/Muscles/biceps.jpg',
}

type Props = {
  muscles: string[]
  className?: string
}

export default function MuscleMap({ muscles, className }: Props) {
  // Pick the image for the first recognized muscle group
  const image = muscles
    .map(m => MUSCLE_IMAGE[m.toLowerCase()])
    .find(Boolean)

  if (!image) return null

  return (
    <div className={`w-full rounded-2xl overflow-hidden ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Músculos ativados"
        className="w-full object-cover"
        style={{ maxHeight: 220 }}
      />
    </div>
  )
}
