'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/workout/checkin',
    label: 'Treinar',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11M3 12h3m15 0h-3M6 8.5V6a.5.5 0 0 1 .5-.5h1A.5.5 0 0 1 8 6v2.5m0 7V18a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 6 18v-2.5M16 8.5V6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2.5m0 7V18a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-2.5"/>
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Progresso',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Perfil',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-sm mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href.replace('/checkin', ''))

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all"
            >
              <span
                className="transition-colors"
                style={{ color: isActive ? '#FF8C00' : 'rgba(255,255,255,0.28)' }}
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? '#FF8C00' : 'rgba(255,255,255,0.28)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
