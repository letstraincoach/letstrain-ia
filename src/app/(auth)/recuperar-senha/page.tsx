'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { recuperarSenhaSchema, type RecuperarSenhaFormData } from '@/lib/validations/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaSchema),
  })

  async function onSubmit(data: RecuperarSenhaFormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    if (error) {
      setServerError('Erro ao enviar email. Verifique o endereço e tente novamente.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF8C00]/10">
            <svg className="h-8 w-8 text-[#FF8C00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Email enviado!</h2>
        <p className="mt-2 text-sm text-white/50">
          Enviamos um link de recuperação para{' '}
          <span className="text-white/80 font-medium">{getValues('email')}</span>.
          Verifique sua caixa de entrada.
        </p>
        <p className="mt-4 text-xs text-white/30">Não recebeu? Verifique o spam ou tente novamente.</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-[#FF8C00] hover:text-[#E07000] transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm px-6">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <LetsTrainLogo size="lg" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-1 text-lg font-semibold">Recuperar senha</h2>
        <p className="mb-6 text-sm text-white/50">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />

          {serverError && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Enviar link de recuperação
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-white/40">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-[#FF8C00] hover:text-[#E07000] font-medium transition-colors">
          Voltar para login
        </Link>
      </p>
    </div>
  )
}
