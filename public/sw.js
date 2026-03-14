// ── Lets Train — Service Worker ──────────────────────────────────────────────
// Gerencia push notifications em background

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Push: exibir notificação ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Lets Train', body: event.data.text(), url: '/dashboard' }
  }

  const { title = 'Lets Train', body = '', url = '/dashboard', icon, badge } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon ?? '/icon-192.png',
      badge: badge ?? '/icon-72.png',
      data: { url },
      vibrate: [100, 50, 100],
      requireInteraction: false,
    })
  )
})

// ── Notificationclick: abrir o app ──────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/dashboard'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focar janela existente se houver
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Abrir nova janela
        return self.clients.openWindow(url)
      })
  )
})
