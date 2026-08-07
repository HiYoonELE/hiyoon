import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>1. Agreement to terms</h2>
            <p>
              By accessing or using Hiyoon at hiyoon.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including customers, transportation providers, and visitors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>2. What Hiyoon is</h2>
            <p>
              Hiyoon is a marketplace platform that connects individuals, families, and organizations seeking local transportation services with independent transportation providers. Hiyoon facilitates introductions and quote comparisons but is not itself a transportation provider. We do not employ drivers, own vehicles, or provide transportation services directly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>3. Customer terms</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information when submitting a transportation request.</li>
              <li>You understand that submitting a request does not guarantee that a provider will be available or that a match will be made.</li>
              <li>You are responsible for verifying that any provider you select meets your specific requirements, including licensing, insurance, and vehicle suitability.</li>
              <li>Any transportation agreement, including pricing and service terms, is between you and the provider directly. Hiyoon is not a party to that agreement.</li>
              <li>You agree not to misuse the platform or submit false requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>4. Provider terms</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providers must submit accurate information during the application process, including licensing, insurance, and vehicle details.</li>
              <li>Providers must maintain all required licenses, permits, and insurance required by Massachusetts law and any applicable local regulations.</li>
              <li>Providers are independent contractors, not employees or agents of Hiyoon.</li>
              <li>Providers are solely responsible for the safety and quality of transportation services they deliver.</li>
              <li>Hiyoon reserves the right to approve, deny, suspend, or remove providers from the platform at any time.</li>
              <li>Providers agree not to misuse lead information or contact customers for purposes unrelated to the matched request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>5. Limitation of liability</h2>
            <p>
              Hiyoon provides a matching and communication platform only. We do not guarantee the quality, safety, legality, or suitability of any transportation provider or service. To the maximum extent permitted by law, Hiyoon shall not be liable for any damages arising from the transportation services provided by independent providers found through our platform, including but not limited to personal injury, property damage, or financial loss.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>6. Child safety</h2>
            <p>
              Hiyoon takes the safety of children seriously. We require providers to hold appropriate licenses and insurance. However, parents and guardians are responsible for conducting their own due diligence before allowing any provider to transport their children. We strongly encourage verifying driver background checks, vehicle inspections, and insurance directly with any provider before service begins.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>7. Intellectual property</h2>
            <p>
              All content on Hiyoon, including the platform design, branding, and written content, is owned by Hiyoon and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to Hiyoon for any user who violates these terms, provides false information, or engages in behavior that is harmful to other users or the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>9. Governing law</h2>
            <p>
              These terms are governed by the laws of the Commonwealth of Massachusetts. Any disputes arising from the use of Hiyoon shall be resolved in the courts of Massachusetts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>10. Changes to terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Hiyoon after changes are posted constitutes acceptance of the updated terms. Material changes will be communicated by updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>11. Contact</h2>
            <p>
              Questions about these terms? Contact us at <a href="mailto:hello@hiyoon.com" className="underline" style={{ color: '#0E9F7E' }}>hello@hiyoon.com</a>.
            </p>
          </section>

        </div>
      </div>
      <Footer />
    </>
  )
}
