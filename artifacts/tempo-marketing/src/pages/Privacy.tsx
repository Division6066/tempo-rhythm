import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy — TEMPO"
        description="Learn how TEMPO collects, uses, and protects your personal data in compliance with Israeli Privacy Law (Protection of Privacy Law, 5741-1981)."
        path="/privacy"
      />
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 14, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-serif mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tempo Labs Inc. ("TEMPO," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the TEMPO application and website (collectively, the "Service"). This policy is drafted in compliance with the Israeli Protection of Privacy Law, 5741-1981 (the "Privacy Law") and the regulations thereunder.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">2. Data Collection</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect the following categories of personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Account Information:</strong> Name, email address, and password when you create an account.</li>
                <li><strong className="text-foreground">Profile Data:</strong> Preferences, settings, and productivity patterns you configure within the app.</li>
                <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with the Service, including tasks created, scheduling patterns, and feature usage.</li>
                <li><strong className="text-foreground">Device Information:</strong> Device type, operating system, browser type, IP address, and unique device identifiers.</li>
                <li><strong className="text-foreground">Calendar & Integration Data:</strong> If you connect third-party services (e.g., Google Calendar, Outlook), we access calendar events and related metadata to provide our planning features.</li>
                <li><strong className="text-foreground">Voice Data:</strong> If you use voice memo features, audio recordings are processed to extract text and are not stored after processing.</li>
                <li><strong className="text-foreground">Payment Information:</strong> Billing details are processed by our third-party payment processor and are not stored on our servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">3. Purpose Limitation</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In accordance with the Privacy Law, we collect and process your personal data only for the following specified purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Providing, operating, and improving the TEMPO Service</li>
                <li>Generating AI-powered daily plans, task suggestions, and productivity insights</li>
                <li>Personalizing your experience based on your usage patterns and preferences</li>
                <li>Processing payments and managing your subscription</li>
                <li>Communicating with you about service updates, security alerts, and support</li>
                <li>Analyzing aggregate usage data to improve our product (in anonymized form)</li>
                <li>Complying with legal obligations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We will not use your personal data for purposes materially different from those stated above without obtaining your prior consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">4. Your Rights Under Israeli Privacy Law</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the Protection of Privacy Law, 5741-1981, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Right of Access:</strong> You may request to review any personal data we hold about you in our databases.</li>
                <li><strong className="text-foreground">Right to Correction:</strong> If your data is inaccurate, incomplete, or outdated, you have the right to request its correction or amendment.</li>
                <li><strong className="text-foreground">Right to Deletion:</strong> You may request the deletion of your personal data from our databases, subject to any legal retention requirements.</li>
                <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw your consent at any time.</li>
                <li><strong className="text-foreground">Right to Object:</strong> You may object to the use of your data for direct marketing purposes.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@tempo.app" className="text-primary hover:underline">privacy@tempo.app</a>. We will respond to your request within 30 days as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, regular security audits, access controls limiting data access to authorized personnel, and secure development practices. While we strive to use commercially acceptable means to protect your personal data, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">6. Cross-Border Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your personal data may be transferred to and processed in countries other than the State of Israel, including countries where our cloud service providers maintain servers. When we transfer data outside of Israel, we ensure that adequate protections are in place in accordance with the Privacy Law and applicable regulations. These protections may include contractual safeguards requiring the recipient to maintain a level of data protection comparable to that required under Israeli law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">7. Database Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                In compliance with the Protection of Privacy Law, 5741-1981, and the Privacy Protection Regulations (Database Registration Conditions), we are required to register our databases containing personal data with the Israeli Privacy Protection Authority (PPA). Our database registration details are available upon request. If you believe your data is being processed in violation of the Privacy Law, you have the right to file a complaint with the PPA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal data for as long as your account is active or as needed to provide you with the Service. If you delete your account, we will delete or anonymize your personal data within 90 days, except where we are required to retain certain data to comply with legal obligations, resolve disputes, or enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child under 16, we will take steps to delete that information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Service after any changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>Tempo Labs Inc.</p>
                <p>Email: <a href="mailto:privacy@tempo.app" className="text-primary hover:underline">privacy@tempo.app</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
