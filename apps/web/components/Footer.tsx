import Link from "next/link";

// ============================================================================
// Footer component
// ============================================================================
// Shows legal links, contact info, and copyright.

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              An overwhelm-first daily planner for ADHD, autistic, and neurodivergent brains.
              Built on calm, concrete next steps — not shame.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of use
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Get in touch</h3>
            <p className="text-sm text-muted-foreground">support@temporhythm.app</p>
          </div>
        </div>
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Tempo Rhythm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
