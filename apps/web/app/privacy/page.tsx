import Link from "next/link";

// Privacy Policy page — plain-language summary. Customise as needed.
export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What we collect</h2>
            <p>
              We collect the personal information you share with us — things like your name and
              email — when you sign up for our services or get in touch.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How we use it</h2>
            <p>We use the information to:</p>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
              <li>Provide and improve our services</li>
              <li>Send updates and relevant information</li>
              <li>Respond to support requests</li>
              <li>Make your experience with the product smoother</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Security</h2>
            <p>
              We apply modern technical and organisational safeguards to protect your personal
              information from unauthorised access, use, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Sharing</h2>
            <p>
              We don't sell, rent, or share your personal information with third parties for
              marketing purposes unless you've explicitly opted in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookies</h2>
            <p>
              Our site uses cookies to improve your experience and understand how the site is used.
              You can block cookies in your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your rights</h2>
            <p>
              You can request access to your personal information, ask us to correct or delete it,
              or withdraw consent to its use at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Significant changes will be posted on the
              site with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact</h2>
            <p>Questions about privacy? Reach us at support@temporhythm.app.</p>
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
