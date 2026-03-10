import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ServiceWorkerRegistration />

      {/* Header com logo — presente em todas as telas do app */}
      <header className="flex items-center justify-center pt-6 pb-1">
        <LetsTrainLogo size="sm" />
      </header>

      {children}

      {/* PWA install prompt — aparece 30s após o usuário estar no app */}
      <PwaInstallPrompt />
    </div>
  )
}
