import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: August 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>1. Who we are</h2>
            <p>
              Hiyoon is a school transportation marketplace that connects families and organizations with local transportation providers. We operate at hiyoon.com. When we say "Hiyoon," "we," "us," or "our," we mean the Hiyoon platform and its operators.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>2. Information we collect</h2>
            <p className="mb-3">When you use Hiyoon, we collect information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Customer information:</strong> name, email address, phone number, pickup and drop-off addresses, passenger details (age, grade), schedule preferences, special requirements, and budget range.</li>
              <li><strong>Provider information:</strong> company name, contact details, service areas, vehicle types, licensing and insurance documentation, and operational details.</li>
              <li><strong>Communications:</strong> any messages you send to us through the platform or email.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To match your transportation request with qualified local providers</li>
              <li>To send you provider quotes and offer comparisons</li>
              <li>To notify providers of matched transportation requests</li>
              <li>To communicate with you about your request status</li>
              <li>To verify and approve transportation providers</li>
              <li>To improve the platform and understand usage patterns</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>4. How we share your information</h2>
            <p className="mb-3">We share your information only as necessary to provide the service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>With providers:</strong> When we match your request, approved providers receive your route details, schedule, passenger information, and special requirements. We do not share your personal contact information with providers until you select their offer.</li>
              <li><strong>With service providers:</strong> We use third-party services including Supabase (database), Resend (email delivery), and Vercel (hosting). These providers process data only as needed to deliver our service.</li>
              <li><strong>For legal compliance:</strong> We may disclose information if required by law or to protect the safety of users.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>5. Children's privacy</h2>
            <p>
              Our service is used to arrange transportation for children, but our platform accounts and forms are completed by parents, guardians, and organizations — not by children directly. We collect only the information necessary to match transportation needs, such as grade level or age range. We do not knowingly collect personal information directly from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>6. Data retention</h2>
            <p>
              We retain your information for as long as necessary to provide the service and comply with legal obligations. Transportation request data is retained for a minimum of 12 months to support dispute resolution and service improvement. You may request deletion of your data by contacting us at hello@hiyoon.com.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>7. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission (HTTPS), secure database storage, and access controls. However, no method of transmission over the internet is 100% secure. We encourage you not to share sensitive personal information beyond what is necessary for your transportation request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>8. Your rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of non-essential communications</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at hello@hiyoon.com.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>9. Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of material changes by posting the updated policy on this page with a new date. Continued use of Hiyoon after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: '#0B1F3A' }}>10. Contact us</h2>
            <p>
              Questions about this privacy policy or how we handle your data? Contact us at <a href="mailto:hello@hiyoon.com" className="underline" style={{ color: '#0E9F7E' }}>hello@hiyoon.com</a>.
            </p>
          </section>

        </div>
      </div>
      <Footer />
    </>
  )
}
