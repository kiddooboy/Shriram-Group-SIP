import KYCJourney from '@/components/kyc/KYCJourney'
import SiteHeader   from '@/components/layout/SiteHeader'
import SiteFooter   from '@/components/layout/SiteFooter'

export const dynamic = 'force-dynamic'

export default function KYCRoute({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-shriram-cream">
      <SiteHeader />
      <main className="flex-1">
        <KYCJourney token={params.token} />
      </main>
      <SiteFooter />
    </div>
  )
}
