import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Terms() {
  return (
    <Layout>
      <SEO
        title="Terms of Service — TEMPO"
        description="Read the Terms of Service for TEMPO, the ADHD-friendly AI planner. Covers acceptable use, subscriptions, liability, and governing law."
        path="/terms"
      />
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 14, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-serif mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the TEMPO application and website (the "Service") operated by Tempo Labs Inc. ("TEMPO," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                TEMPO is an AI-powered daily planning and productivity application designed for neurodivergent users. The Service provides task management, AI-generated daily plans, calendar integration, voice memo processing, focus timers, and related productivity tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">3. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to gain unauthorized access to any part of the Service or its related systems</li>
                <li>Use the Service to transmit any malware, viruses, or other harmful code</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated scripts or bots to access the Service without our written permission</li>
                <li>Resell, sublicense, or redistribute the Service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service, including its original content, features, functionality, design, and underlying technology, is and remains the exclusive property of Tempo Labs Inc. and its licensors. The TEMPO name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Tempo Labs Inc. You may not use these marks without our prior written permission. You retain ownership of all content and data you input into the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">5. Subscription Plans & Pricing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TEMPO offers the following subscription tiers:
              </p>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Free Plan — $0/month</h3>
                  <p className="text-muted-foreground text-sm">Includes basic daily planning, standard task management, up to 5 AI suggestions per day, and community support.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Pro Plan — $9/month</h3>
                  <p className="text-muted-foreground text-sm">Includes everything in Free, plus unlimited AI planning, two-way calendar sync, voice memos to tasks, focus timers & analytics, and priority support. Comes with a 14-day free trial.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Team Plan — $19/month per user</h3>
                  <p className="text-muted-foreground text-sm">Includes everything in Pro, plus shared workspaces, team task delegation, admin controls & billing, and a dedicated success manager.</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Prices are in USD and are subject to change with 30 days' prior notice. All paid subscriptions are billed monthly on the date of initial subscription. Applicable taxes may apply based on your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">6. Cancellation & Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may cancel your paid subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Your subscription will remain active until the end of your current billing period</li>
                <li>You will not be charged for subsequent billing periods</li>
                <li>Your account will revert to the Free plan at the end of the paid period</li>
                <li>Your data will be retained and accessible under the Free plan's limitations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Refunds are available within 14 days of the initial purchase or renewal if you have not substantially used the paid features during that period. To request a refund, contact us at <a href="mailto:support@tempo.app" className="text-primary hover:underline">support@tempo.app</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, Tempo Labs Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill, resulting from your access to or use of (or inability to access or use) the Service. In no event shall our total aggregate liability exceed the amount you have paid us in the twelve (12) months preceding the claim. The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">8. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Tempo Labs Inc., its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately. You may request a copy of your data within 30 days of termination by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">10. Governing Law & Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the competent courts located in Tel Aviv-Jaffa, Israel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after any modifications constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>Tempo Labs Inc.</p>
                <p>Email: <a href="mailto:legal@tempo.app" className="text-primary hover:underline">legal@tempo.app</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
