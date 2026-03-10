// ============================================================================
// Route של Checkout (Polar)
// ============================================================================
// הקובץ הזה יוצר Session של Checkout דרך Polar ומחזיר Redirect ל-Checkout שלהם.
//
// איך זה עובד בקצרה:
// - הלקוח ניגש ל-`/checkout?products=<PRODUCT_ID>`
// - Polar יוצר Checkout לפי המוצר(ים) שהעברנו
// - בסיום תשלום, Polar מפנה ל-`POLAR_SUCCESS_URL` עם `{CHECKOUT_ID}`
//
// ⚠️ חשוב:
// - NEVER לחשוף POLAR_ACCESS_TOKEN לצד לקוח.
// - כרגע אנו עובדים ב-Sandbox כדי לאפשר בדיקות בטוחות.

import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  // טוקן ארגוני (OAT) של Polar - נשמר אך ורק בשרת דרך משתני סביבה
  accessToken: process.env.POLAR_ACCESS_TOKEN!,

  // כתובת הצלחה שאליה Polar יפנה לאחר Checkout
  // מומלץ לכלול `{CHECKOUT_ID}` כדי שנוכל לאמת/לעדכן סטטוס משתמש בהמשך.
  successUrl: process.env.POLAR_SUCCESS_URL!,

  // סביבת עבודה: sandbox לבדיקות (בייצור לשנות ל-production או להסיר)
  server: "sandbox",

  // עיצוב חשוך כדי להתאים לתבנית
  theme: "dark",
});
