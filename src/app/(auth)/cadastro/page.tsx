'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { cadastroSchema, type CadastroFormData } from '@/lib/validations/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function CadastroPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(data: CadastroFormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: { full_name: data.nome },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        setServerError('Este email já está cadastrado. Tente fazer login.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    router.push('/quiz')
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setServerError('Erro ao conectar com Google. Tente novamente.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Lets <span className="text-[#FF8C00]">Train</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">Comece hoje, treino feito sob medida pra você</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-6 text-lg font-semibold">Criar sua conta</h2>

        {/* Google OAuth */}
        <Button
          variant="outline"
          fullWidth
          loading={googleLoading}
          onClick={handleGoogleSignup}
          type="button"
          className="mb-4"
        >
          {!googleLoading && (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continuar com Google
        </Button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0f0f0f] px-3 text-white/30">ou</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            {...register('nome')}
            error={errors.nome?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            {...register('senha')}
            error={errors.senha?.message}
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
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
            Criar conta
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-white/40">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#FF8C00] hover:text-[#E07000] font-medium transition-colors">
          Fazer login
        </Link>
      </p>
    </div>
  )
}
