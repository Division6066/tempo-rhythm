/**
 * Inline pre-hydration script for Tempo Flow theme + dyslexia toggles.
 *
 * Runs before React hydrates so the user's stored preference is applied
 * in the same frame as first paint (no FOUC / theme flash).
 *
 * Source: docs/design/claude-export/design-system/theme-controller.js
 * Target: <script> injected by apps/web/app/layout.tsx via `dangerouslySetInnerHTML`.
 */

export const THEME_STORAGE_KEY = "tempo-theme";
export const DYSLEXIA_STORAGE_KEY = "tempo-dyslexia";

export type ThemePreference = "light" | "dark" | "system";

export function themeInitScript(): string {
  return `(function(){try{
    var root=document.documentElement;
    var t=localStorage.getItem('${THEME_STORAGE_KEY}');
    if(t==='light'||t==='dark'){root.setAttribute('data-theme',t);}
    else{root.removeAttribute('data-theme');}
    var d=localStorage.getItem('${DYSLEXIA_STORAGE_KEY}');
    if(d==='on'){root.setAttribute('data-dyslexia','on');}
  }catch(e){}})();`;
}
