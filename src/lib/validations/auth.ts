import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export const cadastroSchema = z
  .object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirmação de senha obrigatória'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha'],
  })

export const recuperarSenhaSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const novaSenhaSchema = z
  .object({
    senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirmação de senha obrigatória'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type CadastroFormData = z.infer<typeof cadastroSchema>
export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>
export type NovaSenhaFormData = z.infer<typeof novaSenhaSchema>
