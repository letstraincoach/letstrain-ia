'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

type Step = 'intro' | 'camera' | 'preview' | 'uploading'

export default function AvatarPage() {
  const router = useRouter()
  const supabase = createClient()

  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)

  const [step, setStep]         = useState<Step>('intro')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl]  = useState<string | null>(null)
  const [error, setError]        = useState<string | null>(null)

  // ── Abre câmera frontal ──────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 512 }, height: { ideal: 512 } },
        audio: false,
      })
      streamRef.current = stream
      setStep('camera') // muda o step primeiro — o video renderiza, depois o useEffect conecta o stream
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões do browser.')
    }
  }, [])

  // ── Conecta stream ao <video> após renderizar ────────────────────────────
  useEffect(() => {
    if (step === 'camera' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [step])

  // ── Captura frame do vídeo ───────────────────────────────────────────────
  const capture = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const size = 512
    canvas.width  = size
    canvas.height = size

    const ctx = canvas.getContext('2d')!
    // Espelha horizontalmente (câmera frontal parece mais natural)
    ctx.save()
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, size, size)
    ctx.restore()

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setPhotoBlob(blob)
      setPhotoUrl(url)
      setStep('preview')
      // Para o stream
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }, 'image/jpeg', 0.9)
  }, [])

  // ── Refaz foto ──────────────────────────────────────────────────────────
  const retake = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoBlob(null)
    startCamera()
  }, [photoUrl, startCamera])

  // ── Upload para Supabase Storage ─────────────────────────────────────────
  const upload = useCallback(async () => {
    if (!photoBlob) return
    setStep('uploading')
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const path = `${user.id}/avatar.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoBlob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Salva URL no perfil (com cache-bust para refletir a nova foto)
      const avatarUrl = `${publicUrl}?t=${Date.now()}`
      await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      router.push('/dashboard')
    } catch {
      setError('Erro ao salvar foto. Tente novamente.')
      setStep('preview')
    }
  }, [photoBlob, supabase, router])

  // ── Pular (sem avatar) ───────────────────────────────────────────────────
  const skip = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-between px-6 py-10">
      <LetsTrainLogo size="sm" />

      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Avatar placeholder com glow */}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,140,0,0.08)',
                  border: '2px solid rgba(255,140,0,0.25)',
                  boxShadow: '0 0 48px rgba(255,140,0,0.12)',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,140,0,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>

              <div>
                <p className="text-[10px] text-[#FF8C00] uppercase tracking-widest font-bold mb-2">
                  Seu avatar
                </p>
                <h2 className="text-xl font-bold leading-snug">
                  Tire uma selfie<br />para personalizar seu perfil
                </h2>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">
                  Seu avatar vai refletir seu estado de treino — quanto mais consistente, mais vivo ele fica.
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={startCamera}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Abrir câmera
              </button>
              <button onClick={skip} className="text-sm text-white/25 hover:text-white/50 transition-colors text-center py-2">
                Pular por agora
              </button>
            </div>
          </>
        )}

        {/* ── CÂMERA ── */}
        {step === 'camera' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div>
              <p className="text-[10px] text-[#FF8C00] uppercase tracking-widest font-bold text-center mb-1">
                Câmera
              </p>
              <p className="text-sm text-white/40 text-center">Centralize seu rosto no círculo</p>
            </div>

            {/* Viewfinder circular */}
            <div className="relative">
              <div
                className="w-64 h-64 rounded-full overflow-hidden"
                style={{ border: '3px solid rgba(255,140,0,0.5)', boxShadow: '0 0 32px rgba(255,140,0,0.15)' }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
              {/* Guia de rosto */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: '1px dashed rgba(255,140,0,0.2)' }}
              />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={capture}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
              >
                Capturar foto
              </button>
              <button onClick={skip} className="text-sm text-white/25 hover:text-white/50 transition-colors text-center py-2">
                Pular
              </button>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === 'preview' && photoUrl && (
          <div className="w-full flex flex-col items-center gap-6">
            <div>
              <p className="text-[10px] text-[#FF8C00] uppercase tracking-widest font-bold text-center mb-1">
                Ficou bom?
              </p>
              <p className="text-sm text-white/40 text-center">Confirme ou tire outra foto</p>
            </div>

            {/* Preview circular */}
            <div
              className="w-64 h-64 rounded-full overflow-hidden"
              style={{ border: '3px solid rgba(255,140,0,0.6)', boxShadow: '0 0 48px rgba(255,140,0,0.20)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Sua foto" className="w-full h-full object-cover" />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={upload}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
              >
                Usar esta foto
              </button>
              <button
                onClick={retake}
                className="w-full h-11 rounded-xl font-medium text-sm text-white/50 flex items-center justify-center transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Tirar outra
              </button>
            </div>
          </div>
        )}

        {/* ── UPLOADING ── */}
        {step === 'uploading' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,140,0,0.08)', border: '2px solid rgba(255,140,0,0.25)' }}
            >
              <svg className="animate-spin w-8 h-8" style={{ color: '#FF8C00' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <p className="text-sm text-white/50">Salvando sua foto...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      <p className="text-[10px] text-white/15 text-center">
        Sua foto é armazenada com segurança e só você a vê.
      </p>
    </div>
  )
}
