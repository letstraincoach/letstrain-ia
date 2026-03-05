'use client'

import { useEffect } from 'react'

/**
 * Registra o Service Worker assim que o app é carregado.
 * Deve ser incluído no layout de app (não em auth/onboarding).
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] Falha no registro:', err))
    }
  }, [])

  return null
}
