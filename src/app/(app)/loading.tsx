import LetsTrainLogo from '@/components/ui/LetsTrainLogo'

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <LetsTrainLogo size="xl" />
      </div>
    </div>
  )
}
