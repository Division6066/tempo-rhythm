import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Cookies() {
  return (
    <Layout>
      <SEO
        title="Cookie Policy — TEMPO"
        description="Understand how TEMPO uses cookies and similar technologies, including analytics, functional, and marketing cookies, and how to manage your preferences."
        path="/cookies"
      />
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 14, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-serif mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and supply information to website owners. Cookies can be "persistent" (remaining on your device until they expire or you delete them) or "session" cookies (deleted when you close your browser).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TEMPO uses cookies and similar technologies for the following purposes:
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">These cookies are strictly necessary for the Service to function. They enable core features such as authentication, session management, and security. You cannot opt out of essential cookies as the Service will not work without them.</p>
                  <div className="text-xs text-muted-foreground/70">Examples: session ID, authentication token, CSRF protection</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">These cookies remember your preferences and settings to provide a more personalized experience. They may remember your language preferences, display settings, and recently viewed items.</p>
                  <div className="text-xs text-muted-foreground/70">Examples: theme preference, language setting, timezone</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">These cookies help us understand how visitors interact with the Service by collecting and reporting information anonymously. This data helps us improve the Service and identify areas where users may experience difficulties.</p>
                  <div className="text-xs text-muted-foreground/70">Examples: Google Analytics (_ga, _gid), page view tracking, feature usage metrics</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Marketing Cookies</h3>
                  <p className="text-muted-foreground text-sm mb-2">These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. They may be set by us or by third-party advertising partners.</p>
                  <div className="text-xs text-muted-foreground/70">Examples: conversion tracking, retargeting pixels, attribution cookies</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">3. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies on our Service are set by third-party services that appear on our pages. We do not control these third-party cookies and recommend reviewing the privacy policies of these third parties for more information. Third parties that may set cookies through our Service include Google Analytics, payment processors, and social media platforms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">4. How to Manage Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you when a cookie is being set. The process varies by browser — check your browser's help section for instructions.</li>
                <li><strong className="text-foreground">Google Analytics Opt-Out:</strong> You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.</li>
                <li><strong className="text-foreground">Do Not Track:</strong> We honor "Do Not Track" browser signals. When enabled, we will limit data collection to essential cookies only.</li>
                <li><strong className="text-foreground">Mobile Devices:</strong> On mobile devices, you can manage cookie preferences and reset advertising identifiers through your device's settings menu.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that disabling certain cookies may affect the functionality of the Service and your user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">5. Changes to This Cookie Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies, please contact us at:
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
