import { redirect } from 'next/navigation'

// Redireciona a raiz para /login
// Após autenticação, o middleware redireciona para /dashboard
export default function RootPage() {
  redirect('/login')
}
