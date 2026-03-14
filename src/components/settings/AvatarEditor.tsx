'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AvatarEditorProps {
  userId: string
  currentAvatarUrl: string | null
}

type CameraStep = 'idle' | 'camera' | 'preview' | 'uploading' | 'success'

export default function AvatarEditor({ userId, currentAvatarUrl }: AvatarEditorProps) {
  const supabase = createClient()

  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]           = useState<CameraStep>('idle')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl]   = useState<string | null>(null)
  const [liveAvatarUrl, setLiveAvatarUrl] = useState(currentAvatarUrl)
  const [error, setError]         = useState<string | null>(null)

  // ── Conecta stream ao <video> após renderizar ────────────────────────────
  useEffect(() => {
    if (step === 'camera' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [step])

  // ── Para stream ao desmontar ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 512 }, height: { ideal: 512 } },
        audio: false,
      })
      streamRef.current = stream
      setStep('camera')
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões do browser.')
    }
  }, [])

  const pickFromGallery = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    const canvas = canvasRef.current
    if (!canvas) return

    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const size = 512
      canvas.width  = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      // crop centralizado
      const min = Math.min(img.width, img.height)
      const sx  = (img.width  - min) / 2
      const sy  = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(objectUrl)
      canvas.toBlob((blob) => {
        if (!blob) return
        setPhotoBlob(blob)
        setPhotoUrl(URL.createObjectURL(blob))
        setStep('preview')
      }, 'image/jpeg', 0.9)
    }
    img.src = objectUrl
    // reset input so same file can be picked again
    e.target.value = ''
  }, [])

  const capture = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const size = 512
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.save()
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, size, size)
    ctx.restore()

    canvas.toBlob((blob) => {
      if (!blob) return
      setPhotoBlob(blob)
      setPhotoUrl(URL.createObjectURL(blob))
      setStep('preview')
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }, 'image/jpeg', 0.9)
  }, [])

  const retake = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoBlob(null)
    startCamera()
  }, [photoUrl, startCamera])

  const upload = useCallback(async () => {
    if (!photoBlob) return
    setStep('uploading')
    setError(null)

    try {
      const path = `${userId}/avatar.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoBlob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const newAvatarUrl = `${publicUrl}?t=${Date.now()}`

      await supabase
        .from('user_profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId)

      if (photoUrl) URL.revokeObjectURL(photoUrl)
      setLiveAvatarUrl(newAvatarUrl)
      setPhotoUrl(null)
      setPhotoBlob(null)
      setStep('success')
      setTimeout(() => setStep('idle'), 2000)
    } catch {
      setError('Erro ao salvar foto. Tente novamente.')
      setStep('preview')
    }
  }, [photoBlob, photoUrl, userId, supabase])

  const cancel = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoBlob(null)
    setStep('idle')
    setError(null)
  }, [photoUrl])

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Foto do Perfil</p>

      {/* ── IDLE / SUCCESS: mostra avatar atual + botão trocar ── */}
      {(step === 'idle' || step === 'success') && (
        <div className="flex items-center gap-4">
          {/* Avatar atual */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(255,140,0,0.35)', boxShadow: '0 0 20px rgba(255,140,0,0.1)' }}
          >
            {liveAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={liveAvatarUrl} alt="Foto do perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,140,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {step === 'success' ? (
              <p className="text-sm font-medium text-green-400">Foto atualizada!</p>
            ) : (
              <p className="text-sm text-white/50">
                {liveAvatarUrl ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                style={{ background: 'rgba(255,140,0,0.12)', color: '#FF8C00', border: '1px solid rgba(255,140,0,0.2)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Câmera
              </button>
              <button
                onClick={pickFromGallery}
                className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Galeria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CÂMERA ── */}
      {step === 'camera' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-white/40 text-center">Centralize seu rosto no círculo</p>
          <div
            className="w-56 h-56 rounded-full overflow-hidden"
            style={{ border: '3px solid rgba(255,140,0,0.5)', boxShadow: '0 0 24px rgba(255,140,0,0.12)' }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={capture}
              className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
            >
              Capturar
            </button>
            <button
              onClick={cancel}
              className="h-11 px-4 rounded-xl text-sm text-white/40 transition-colors hover:text-white/70"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === 'preview' && photoUrl && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-white/40 text-center">Ficou bom?</p>
          <div
            className="w-56 h-56 rounded-full overflow-hidden"
            style={{ border: '3px solid rgba(255,140,0,0.6)', boxShadow: '0 0 32px rgba(255,140,0,0.15)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={upload}
              className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
            >
              Usar esta foto
            </button>
            <button
              onClick={retake}
              className="h-11 px-4 rounded-xl text-sm text-white/40 transition-colors hover:text-white/70"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Tirar outra
            </button>
          </div>
        </div>
      )}

      {/* ── UPLOADING ── */}
      {step === 'uploading' && (
        <div className="flex items-center gap-3 py-2">
          <svg className="animate-spin w-5 h-5 flex-shrink-0" style={{ color: '#FF8C00' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-white/50">Salvando foto...</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}
