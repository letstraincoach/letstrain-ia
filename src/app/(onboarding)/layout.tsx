import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header com logo */}
      <header className="flex items-center justify-center pt-8 pb-2">
        <LetsTrainLogo size="sm" />
      </header>

      {/* Conteúdo com scroll natural */}
      <main className="flex-1 flex flex-col items-center px-6 py-4">{children}</main>
    </div>
  )
}
