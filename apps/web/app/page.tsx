// דף הבית הראשי של האפליקציה
export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto">
        <h1 className="mb-6 font-bold text-4xl">ברוכים הבאים</h1>
        <p className="text-lg leading-relaxed">
          זהו תבנית אפליקציית Next.js עם תמיכה מלאה בעברית מימין לשמאל. האפליקציה מכילה מערכת ניווט
          עם שלושה עמודים נוספים, ומספקת נקודת התחלה מצוינת לפיתוח יישומים בעברית. הממשק מותאם
          לכיוון כתיבה מימין לשמאל, והטקסט מוצג בצורה נכונה ונוחה לקריאה.
        </p>
      </main>
    </div>
  );
}
