export default function PrivacyPage() {
  return (
    <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-text-secondary mb-8">Last updated: July 13, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <p className="text-base">
            <strong className="text-white">Ero Musa</strong> ("we", "us", "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, how we share it and your rights.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-card">
                  <th className="border border-border px-4 py-2 text-left text-white">Category</th>
                  <th className="border border-border px-4 py-2 text-left text-white">Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2 text-white">Information you provide</td>
                  <td className="border border-border px-4 py-2">Account credentials, email address, uploaded images, payment details (handled by third-party processors)</td>
                </tr>
                <tr className="bg-card/50">
                  <td className="border border-border px-4 py-2 text-white">Content data</td>
                  <td className="border border-border px-4 py-2">User Content (images) and AI-Generated Content</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2 text-white">Automatically collected data</td>
                  <td className="border border-border px-4 py-2">IP address, browser type, device identifiers, log files, usage statistics, cookies</td>
                </tr>
                <tr className="bg-card/50">
                  <td className="border border-border px-4 py-2 text-white">Derived data</td>
                  <td className="border border-border px-4 py-2">Embeddings, model outputs, analytics</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide & operate the Service and generate AI-Generated Content.</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Improve, test and develop our models, algorithms and features.</li>
            <li>Monitor and secure the Service, prevent fraud and abuse.</li>
            <li>Comply with legal obligations and enforce our Terms.</li>
            <li>Communicate with you about updates, security alerts and support.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Sharing of Information</h2>
          <p>We only share personal information as follows:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-white">Service Providers</strong> – cloud hosting, payment processors, analytics vendors and content-delivery networks, bound by confidentiality agreements.</li>
            <li><strong className="text-white">Legal & Compliance</strong> – when required by law, subpoena or court order, or to protect rights, safety or property.</li>
            <li><strong className="text-white">Business Transfers</strong> – in connection with a merger, acquisition or asset sale (with notice to you).</li>
            <li><strong className="text-white">With Your Consent</strong> – where you explicitly authorise us to share data.</li>
          </ul>
          <div className="p-4 rounded-lg bg-accent-orange/10 border border-accent-orange/30 mt-4">
            <p className="text-white font-medium mb-2">Important</p>
            <p className="mb-2">We never share your uploaded images or AI-generated videos with any third parties. Your content remains private and is only processed by our systems to provide the Service.</p>
            <p className="text-white font-medium">We never sell your personal data.</p>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Cookies & Tracking</h2>
          <p>
            We use cookies and similar technologies to remember preferences, perform analytics, and improve the Service.
          </p>
          <p className="mt-2">
            You can disable cookies in your browser, but some features may not function.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary for the purposes outlined here, unless a longer retention period is required to comply with law, resolve disputes or enforce our agreements.
          </p>

          <p className="font-medium text-white mt-4">Content Retention:</p>
          <p>
            We store your uploaded images and generated videos to provide you with access to your content. Content is only deleted when you explicitly take a deletion action (such as deleting specific content or your entire account). We do not automatically delete your content - it remains available until you choose to remove it.
          </p>

          <p className="font-medium text-white mt-4">Content Deletion:</p>
          <p>
            When you delete your content (individual images/videos or through account deletion), the deletion is irreversible and we immediately and permanently remove it from our systems. We do not retain any copies of your deleted content.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. International Transfers</h2>
          <p>
            Your data may be processed in countries outside your jurisdiction where privacy laws may be different. We take steps to ensure appropriate safeguards are in place to protect your personal information.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Security</h2>
          <p>
            We implement industry-standard administrative, technical and physical safeguards to protect personal data. However, no security measure is unconditional; you use the Service at your own risk.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Your Rights</h2>
          <p>You may have rights to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Access, correct or delete personal data.</li>
            <li>Object to or restrict processing.</li>
            <li>Data portability.</li>
            <li>Withdraw consent at any time (processing prior to withdrawal remains lawful).</li>
          </ul>
          <p className="mt-2">
            You can exercise these rights by contacting us at <a href="mailto:privacy@eromusa.com" className="text-accent-orange hover:underline">privacy@eromusa.com</a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. Delete Your Account</h2>
          <p>You can permanently delete your Ero Musa account at any time:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Sign in and go to Settings → Delete Account</li>
          </ul>
          <p className="mt-2">
            Deletion is irreversible. All credits, videos, uploaded images and personal data will be completely erased from our systems and we do not retain any copies of your content after deletion, except where retention is required by law (e.g., fraud-prevention and bookkeeping records which do not include your content).
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Children's Privacy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Service is not directed to children under 18.</li>
            <li>We do not knowingly collect personal data from minors.</li>
            <li>If you believe a child has provided us with personal data, please contact us to delete it.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. Changes to This Policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We may update this Privacy Policy periodically.</li>
            <li>We will post the revised version and revise the "Last updated" date.</li>
            <li>Material changes will be notified by email or prominent notice.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. Contact Us</h2>
          <p>
            For questions about privacy, please email <a href="mailto:privacy@eromusa.com" className="text-accent-orange hover:underline">privacy@eromusa.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}