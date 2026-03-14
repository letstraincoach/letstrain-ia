'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { novaSenhaSchema, type NovaSenhaFormData } from '@/lib/validations/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

export default function NovaSenhaPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovaSenhaFormData>({
    resolver: zodResolver(novaSenhaSchema),
  })

  async function onSubmit(data: NovaSenhaFormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: data.senha,
    })

    if (error) {
      setServerError('Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm px-6">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <LetsTrainLogo size="lg" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-1 text-lg font-semibold">Nova senha</h2>
        <p className="mb-6 text-sm text-white/50">Escolha uma senha forte para sua conta.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            {...register('senha')}
            error={errors.senha?.message}
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            {...register('confirmarSenha')}
            error={errors.confirmarSenha?.message}
          />

          {serverError && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Redefinir senha
          </Button>
        </form>
      </div>
    </div>
  )
}
