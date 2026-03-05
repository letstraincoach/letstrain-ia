import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ServiceWorkerRegistration />
      {children}
    </div>
  )
}
