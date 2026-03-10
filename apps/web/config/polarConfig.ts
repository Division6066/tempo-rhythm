// ============================================================================
// קונפיגורציית Polar (Checkout)
// ============================================================================
// קובץ זה מכיל את כל ההגדרות הקשורות ל-Polar Checkout.
// מזהי מוצרים, סביבת עבודה, וכו'.

// סביבת Polar: sandbox לבדיקות, production לייצור
export const POLAR_SERVER: "sandbox" | "production" = "sandbox";

// מזהי מוצר (Product IDs) ב-Polar עבור תוכניות בתשלום
// מומלץ להגדיר דרך משתני סביבה ולהשאיר כאן fallback ריק.
export const POLAR_MONTHLY_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID || "";

export const POLAR_YEARLY_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID || "";
