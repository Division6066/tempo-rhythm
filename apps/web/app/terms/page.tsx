import Link from "next/link";

// Terms of Use page — a plain-language summary. Customise as needed.
export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Terms of Use</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Accepting these terms</h2>
            <p>
              By accessing and using this site you agree to everything laid out here. If any of it
              doesn't sit right, please don't use the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Using the site</h2>
            <p>
              The site is for lawful use only. You agree not to use it in any way that harms its
              operation or causes damage to us or to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Intellectual property</h2>
            <p>
              All content on this site — text, graphics, logos, images — belongs to us or to our
              content providers and is protected under applicable copyright law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Liability</h2>
            <p>
              Services and information on this site are provided &quot;as is&quot;. We do not
              guarantee accuracy, completeness, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Changes to these terms</h2>
            <p>
              We may update these terms over time. Updates take effect as soon as they are posted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact</h2>
            <p>
              Questions about these terms? Reach us at support@temporhythm.app.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
