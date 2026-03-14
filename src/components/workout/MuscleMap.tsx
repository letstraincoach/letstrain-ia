'use client'

// Maps exercise grupo_muscular values to internal visual IDs
const MUSCLE_MAP: Record<string, string[]> = {
  peito:        ['chest'],
  peitoral:     ['chest'],
  costas:       ['lats', 'traps'],
  ombros:       ['delt_f', 'delt_r'],
  deltoides:    ['delt_f', 'delt_r'],
  deltóide:     ['delt_f', 'delt_r'],
  biceps:       ['biceps'],
  bíceps:       ['biceps'],
  triceps:      ['triceps'],
  tríceps:      ['triceps'],
  quadriceps:   ['quads'],
  posterior:    ['hamstrings'],
  gluteos:      ['glutes'],
  glúteos:      ['glutes'],
  panturrilha:  ['calves'],
  abdomen:      ['abs'],
  abdômen:      ['abs'],
  core:         ['abs'],
  lombar:       ['lower_back'],
  trapezio:     ['traps'],
  trapézio:     ['traps'],
  'antebraço':  ['biceps'],
}

type Props = {
  muscles: string[]
  className?: string
}

export default function MuscleMap({ muscles, className }: Props) {
  const activeIds = new Set(
    muscles.flatMap(m => MUSCLE_MAP[m.toLowerCase()] ?? [])
  )

  const a = (id: string) => activeIds.has(id)
  const f = (id: string) => a(id) ? '#ef4444' : '#272727'
  const op = (id: string) => a(id) ? 0.92 : 0.85
  const glow = (id: string) => a(id) ? 'url(#glow)' : undefined

  // Body part color
  const B = '#1a1a1a'

  const Defs = () => (
    <defs>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  )

  // Shared body silhouette shapes (front and back look the same)
  const BodySilhouette = () => (
    <>
      <circle cx="50" cy="19" r="12" fill={B}/>
      <rect x="45" y="30" width="10" height="9" rx="3" fill={B}/>
      <ellipse cx="25" cy="44" rx="9" ry="7" fill={B}/>
      <ellipse cx="75" cy="44" rx="9" ry="7" fill={B}/>
      <path d="M 30 41 Q 30 38 50 38 Q 70 38 70 41 L 71 100 Q 65 108 50 108 Q 35 108 29 100 Z" fill={B}/>
      <rect x="15" y="42" width="13" height="34" rx="6" fill={B}/>
      <rect x="72" y="42" width="13" height="34" rx="6" fill={B}/>
      <rect x="14" y="74" width="12" height="30" rx="5" fill={B}/>
      <rect x="74" y="74" width="12" height="30" rx="5" fill={B}/>
      <rect x="30" y="106" width="18" height="52" rx="9" fill={B}/>
      <rect x="52" y="106" width="18" height="52" rx="9" fill={B}/>
      <rect x="31" y="156" width="16" height="50" rx="7" fill={B}/>
      <rect x="53" y="156" width="16" height="50" rx="7" fill={B}/>
      <ellipse cx="39" cy="210" rx="10" ry="5" fill={B}/>
      <ellipse cx="61" cy="210" rx="10" ry="5" fill={B}/>
    </>
  )

  return (
    <div className={`flex gap-5 justify-center items-start ${className ?? ''}`}>

      {/* ── FRONT VIEW ── */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[8px] tracking-widest text-white/20 uppercase font-medium">Frente</span>
        <svg viewBox="0 0 100 220" width="82" height="180">
          <Defs/>
          <BodySilhouette/>

          {/* Deltoids front */}
          <ellipse cx="25" cy="46" rx="8" ry="7" fill={f('delt_f')} opacity={op('delt_f')} filter={glow('delt_f')}/>
          <ellipse cx="75" cy="46" rx="8" ry="7" fill={f('delt_f')} opacity={op('delt_f')} filter={glow('delt_f')}/>

          {/* Pectorals */}
          <path d="M 31 45 Q 31 40 50 40 L 50 66 Q 42 69 31 63 Z" fill={f('chest')} opacity={op('chest')} filter={glow('chest')}/>
          <path d="M 69 45 Q 69 40 50 40 L 50 66 Q 58 69 69 63 Z" fill={f('chest')} opacity={op('chest')} filter={glow('chest')}/>

          {/* Biceps */}
          <ellipse cx="21" cy="64" rx="5" ry="11" fill={f('biceps')} opacity={op('biceps')} filter={glow('biceps')}/>
          <ellipse cx="79" cy="64" rx="5" ry="11" fill={f('biceps')} opacity={op('biceps')} filter={glow('biceps')}/>

          {/* Abs — 3 rows × 2 cols */}
          <rect x="41" y="67" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>
          <rect x="52" y="67" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>
          <rect x="41" y="77" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>
          <rect x="52" y="77" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>
          <rect x="41" y="87" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>
          <rect x="52" y="87" width="7" height="8" rx="2" fill={f('abs')} opacity={op('abs')} filter={glow('abs')}/>

          {/* Quadriceps */}
          <ellipse cx="39" cy="131" rx="8" ry="22" fill={f('quads')} opacity={op('quads')} filter={glow('quads')}/>
          <ellipse cx="61" cy="131" rx="8" ry="22" fill={f('quads')} opacity={op('quads')} filter={glow('quads')}/>

          {/* Calves (front) */}
          <ellipse cx="39" cy="177" rx="6" ry="15" fill={f('calves')} opacity={op('calves')} filter={glow('calves')}/>
          <ellipse cx="61" cy="177" rx="6" ry="15" fill={f('calves')} opacity={op('calves')} filter={glow('calves')}/>
        </svg>
      </div>

      {/* ── BACK VIEW ── */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[8px] tracking-widest text-white/20 uppercase font-medium">Costas</span>
        <svg viewBox="0 0 100 220" width="82" height="180">
          <Defs/>
          <BodySilhouette/>

          {/* Rear deltoids */}
          <ellipse cx="25" cy="46" rx="8" ry="7" fill={f('delt_r')} opacity={op('delt_r')} filter={glow('delt_r')}/>
          <ellipse cx="75" cy="46" rx="8" ry="7" fill={f('delt_r')} opacity={op('delt_r')} filter={glow('delt_r')}/>

          {/* Trapezius */}
          <path d="M 34 42 L 66 42 L 58 62 L 42 62 Z" fill={f('traps')} opacity={op('traps')} filter={glow('traps')}/>

          {/* Lats */}
          <path d="M 30 52 Q 28 68 34 98 L 41 98 Q 43 68 36 52 Z" fill={f('lats')} opacity={op('lats')} filter={glow('lats')}/>
          <path d="M 70 52 Q 72 68 66 98 L 59 98 Q 57 68 64 52 Z" fill={f('lats')} opacity={op('lats')} filter={glow('lats')}/>

          {/* Triceps */}
          <ellipse cx="21" cy="63" rx="5" ry="12" fill={f('triceps')} opacity={op('triceps')} filter={glow('triceps')}/>
          <ellipse cx="79" cy="63" rx="5" ry="12" fill={f('triceps')} opacity={op('triceps')} filter={glow('triceps')}/>

          {/* Lower back */}
          <rect x="38" y="87" width="24" height="16" rx="4" fill={f('lower_back')} opacity={op('lower_back')} filter={glow('lower_back')}/>

          {/* Glutes */}
          <ellipse cx="39" cy="118" rx="13" ry="13" fill={f('glutes')} opacity={op('glutes')} filter={glow('glutes')}/>
          <ellipse cx="61" cy="118" rx="13" ry="13" fill={f('glutes')} opacity={op('glutes')} filter={glow('glutes')}/>

          {/* Hamstrings */}
          <ellipse cx="39" cy="136" rx="8" ry="21" fill={f('hamstrings')} opacity={op('hamstrings')} filter={glow('hamstrings')}/>
          <ellipse cx="61" cy="136" rx="8" ry="21" fill={f('hamstrings')} opacity={op('hamstrings')} filter={glow('hamstrings')}/>

          {/* Calves (back) */}
          <ellipse cx="39" cy="178" rx="7" ry="16" fill={f('calves')} opacity={op('calves')} filter={glow('calves')}/>
          <ellipse cx="61" cy="178" rx="7" ry="16" fill={f('calves')} opacity={op('calves')} filter={glow('calves')}/>
        </svg>
      </div>

    </div>
  )
}
