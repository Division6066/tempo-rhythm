/* ============================================================
   Tempo Flow — Theme & Accessibility controller
   Shared by landing.html, app.html, mobile.html, builder.html.

   localStorage keys (all optional):
     tf-theme        "light" | "dark" | "system"    (default "system")
     tf-dyslexia     "on"    | "off"                 (default "off")
     tf-read-aloud   "on"    | "off"                 (default "off")

   Applies:
     <html data-theme="light|dark">     (resolved from user pref)
     <html data-dyslexia="on|off">

   Emits CustomEvent "tf-theme-change" on window whenever any
   of the three settings flip so React surfaces can re-render.
   ============================================================ */
(function () {
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  function get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch {} }

  function resolveTheme(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return mq.matches ? "dark" : "light";
  }

  function apply() {
    const pref = get("tf-theme", "system");
    const resolved = resolveTheme(pref);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-pref", pref);

    root.setAttribute("data-dyslexia", get("tf-dyslexia", "off"));
    root.setAttribute("data-read-aloud", get("tf-read-aloud", "off"));

    // Notify mobile MT palette (if loaded)
    if (typeof window.__setMTTheme === "function") window.__setMTTheme(resolved);

    window.dispatchEvent(new CustomEvent("tf-theme-change", {
      detail: {
        theme: pref, resolvedTheme: resolved,
        dyslexia: get("tf-dyslexia", "off"),
        readAloud: get("tf-read-aloud", "off"),
      },
    }));
  }

  // Public API
  window.TempoTheme = {
    getTheme:     () => get("tf-theme", "system"),
    getResolved:  () => resolveTheme(get("tf-theme", "system")),
    setTheme:     (v) => { set("tf-theme", v); apply(); },
    cycleTheme:   () => {
      const cur = get("tf-theme", "system");
      const next = cur === "light" ? "dark" : cur === "dark" ? "system" : "light";
      set("tf-theme", next); apply(); return next;
    },
    getDyslexia: () => get("tf-dyslexia", "off"),
    setDyslexia: (v) => { set("tf-dyslexia", v); apply(); },
    toggleDyslexia: () => {
      const next = get("tf-dyslexia", "off") === "on" ? "off" : "on";
      set("tf-dyslexia", next); apply(); return next;
    },
    getReadAloud: () => get("tf-read-aloud", "off"),
    setReadAloud: (v) => { set("tf-read-aloud", v); apply(); },
    toggleReadAloud: () => {
      const next = get("tf-read-aloud", "off") === "on" ? "off" : "on";
      set("tf-read-aloud", next); apply(); return next;
    },
    /* Speak text using Web Speech API. Called from:
       (a) right-click handler when Read Aloud mode is ON
       (b) "listen" icon buttons added to copy blocks
       (c) chat message bubbles */
    speak: (text) => {
      try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95; u.pitch = 1.0;
        window.speechSynthesis?.speak(u);
      } catch {}
    },
    stopSpeaking: () => { try { window.speechSynthesis?.cancel(); } catch {} },
  };

  // React to system-theme changes when user pref is "system"
  mq.addEventListener?.("change", () => {
    if (get("tf-theme", "system") === "system") apply();
  });

  // Right-click-to-read-aloud — only active when mode is on
  document.addEventListener("contextmenu", (e) => {
    if (get("tf-read-aloud", "off") !== "on") return;
    const text = window.getSelection()?.toString()
      || e.target?.closest?.("[data-readable], p, h1, h2, h3, h4, li, blockquote")?.innerText;
    if (text && text.trim()) {
      e.preventDefault();
      window.TempoTheme.speak(text.trim());
    }
  });

  apply();
})();
