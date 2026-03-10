import Link from "next/link";

// ============================================================================
// רכיב Footer (כותרת תחתונה)
// ============================================================================
// מציג קישורים משפטיים, פרטי קשר וזכויות יוצרים

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">אודות</h3>
            <p className="text-sm text-muted-foreground">
              פתרון מוביל להשגת תוצאות מדהימות בזמן קצר. מאמינים בפשטות, יעילות ותוצאות מוכחות.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">קישורים מהירים</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">יצירת קשר</h3>
            <p className="text-sm text-muted-foreground">
              support@temporhythm.app
            </p>
          </div>
        </div>
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Tempo Rhythm. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
