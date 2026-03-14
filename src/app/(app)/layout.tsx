import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt'
import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ServiceWorkerRegistration />

      {/* Conteúdo com padding inferior para não ficar atrás do BottomNav */}
      <div className="pb-20">
        {children}
      </div>

      {/* Bottom Navigation — persistente em todas as telas do app */}
      <BottomNav />

      <PwaInstallPrompt />
    </div>
  )
}
