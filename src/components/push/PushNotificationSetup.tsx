'use client'

import { useState, useEffect } from 'react'

const DAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sab', value: 6 },
]

type PermissionState = 'unknown' | 'granted' | 'denied' | 'default' | 'unsupported'

interface Props {
  initialDias?: number[]
  initialHorario?: string | null
}

export default function PushNotificationSetup({ initialDias = [], initialHorario = null }: Props) {
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown')
  const [dias, setDias] = useState<number[]>(initialDias)
  const [horario, setHorario] = useState(initialHorario ?? '07:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermissionState('unsupported')
      return
    }
    setPermissionState(Notification.permission as PermissionState)

    // Registrar o Service Worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => setRegistration(reg))
      .catch(console.error)
  }, [])

  async function handleEnable() {
    if (!('Notification' in window)) return
    setRequesting(true)

    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission as PermissionState)

      if (permission === 'granted') {
        await subscribeAndSave()
      }
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err)
    } finally {
      setRequesting(false)
    }
  }

  async function subscribeAndSave() {
    const reg = registration ?? await navigator.serviceWorker.ready

    const existingSubscription = await reg.pushManager.getSubscription()
    const pushSubscription = existingSubscription ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as BufferSource,
    })

    await saveConfig(pushSubscription)
  }

  async function saveConfig(pushSubscription?: PushSubscription) {
    const reg = registration ?? await navigator.serviceWorker.ready
    const sub = pushSubscription ?? await reg.pushManager.getSubscription()
    if (!sub) return

    setSaving(true)
    setSaved(false)

    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          diasTreino: dias,
          horarioLembrete: horario || null,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Erro ao salvar config push:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDisable() {
    const reg = registration ?? await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return

    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
    setPermissionState('default')
  }

  function toggleDay(day: number) {
    setDias((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // ── Não suportado ────────────────────────────────────────────────────────
  if (permissionState === 'unsupported') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold mb-1">🔔 Notificações</p>
        <p className="text-xs text-white/40">Notificações não são suportadas neste navegador.</p>
      </div>
    )
  }

  // ── Bloqueado pelo usuário ────────────────────────────────────────────────
  if (permissionState === 'denied') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold mb-1">🔔 Notificações bloqueadas</p>
        <p className="text-xs text-white/40 leading-relaxed">
          As notificações estão bloqueadas. Para ativar, vá em Configurações do seu navegador e permita notificações para este site.
        </p>
      </div>
    )
  }

  // ── Não autorizado ainda ─────────────────────────────────────────────────
  if (permissionState === 'default' || permissionState === 'unknown') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">🔔 Ativar lembretes</p>
          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
            Receba lembretes nos dias configurados para não perder seu treino.
          </p>
        </div>
        <button
          type="button"
          onClick={handleEnable}
          disabled={requesting}
          className="h-10 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors disabled:opacity-60"
        >
          {requesting ? (
            <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : '🔔 Ativar notificações'}
        </button>
      </div>
    )
  }

  // ── Configuração (permissão granted) ────────────────────────────────────
  return (
    <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">🔔 Notificações ativas</p>
          <p className="text-xs text-white/50 mt-0.5">Configure seus lembretes de treino</p>
        </div>
        <button
          type="button"
          onClick={handleDisable}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Desativar
        </button>
      </div>

      {/* Dias da semana */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-white/60 font-medium">Dias de treino</p>
        <div className="flex gap-1.5">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all
                ${dias.includes(day.value)
                  ? 'bg-[#FF8C00] text-black'
                  : 'bg-white/[0.06] text-white/40 hover:text-white/70'
                }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horário */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-white/60 font-medium">Horário do lembrete</p>
        <input
          type="time"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
        />
      </div>

      <button
        type="button"
        onClick={() => saveConfig()}
        disabled={saving}
        className="h-10 rounded-xl bg-white/8 border border-white/10 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/12 transition-colors disabled:opacity-60"
      >
        {saving ? (
          <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        ) : saved ? '✅ Salvo!' : 'Salvar configuração'}
      </button>
    </div>
  )
}

// Utilitário para converter VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}
