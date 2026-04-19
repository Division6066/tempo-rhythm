/* ============================================================
   Floating Coach Dock — global access to coach + brain dump.
   Mounted app-wide (bottom-right). Keyboard: ⌘J toggles.
   Matches soft-editorial aesthetic; warm not shaming.
   ============================================================ */

const { useState, useEffect, useRef } = React;

/* ---------- tiny helpers ---------- */
const CoachDotMark = ({ size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: 99,
    background: "var(--gradient-tempo, linear-gradient(135deg, #D97757, #C8643F))",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-serif)", fontSize: size * 0.45, fontWeight: 600,
    boxShadow: "0 6px 14px -6px rgba(217,119,87,0.5)",
  }}>T</div>
);

/* Gentle breathing ring used on the FAB when idle */
const FabBreath = () => (
  <span style={{
    position: "absolute", inset: -6, borderRadius: 99,
    border: "1.5px solid rgba(217,119,87,0.35)",
    animation: "coach-breath 4.5s ease-in-out infinite",
    pointerEvents: "none",
  }}/>
);

/* ---------- Coach tab ---------- */
const CoachTab = ({ draft, setDraft, onSend, onQuickAction }) => {
  const scrollerRef = useRef(null);

  // Minimal seeded conversation — looks like a continued chat.
  const [turns, setTurns] = useState([
    { who: "coach", text: "I'm here. What's up right now — a question, a worry, or a thing to capture?" },
  ]);

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setTurns(t => [...t, { who: "me", text }]);
    setDraft("");
    // Fake a warm reply after a beat
    setTimeout(() => {
      setTurns(t => [...t, {
        who: "coach",
        text: "Got it. Want me to stage that as a task for today, or just hold onto it for later?",
      }]);
    }, 520);
  };

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [turns]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div ref={scrollerRef} style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--fg-muted)", textAlign: "center", letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          Thursday · 9:47 AM · scope: Today
        </div>
        {turns.map((t, i) => (
          t.who === "coach" ? (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CoachDotMark size={22}/>
              <div style={{
                background: "var(--surface-sunken, #efe6db)",
                borderRadius: "14px 14px 14px 4px",
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                color: "var(--fg, #2a2520)", maxWidth: 280,
                fontFamily: "var(--font-serif, Fraunces, serif)",
              }}>{t.text}</div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: "var(--tempo-orange, #D97757)", color: "#fff",
                borderRadius: "14px 14px 4px 14px",
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                maxWidth: 260,
              }}>{t.text}</div>
            </div>
          )
        ))}
      </div>

      {/* Suggested pills */}
      <div style={{ padding: "0 18px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { label: "Plan my next hour", hint: "plan" },
          { label: "I'm stuck", hint: "stuck" },
          { label: "Brain dump →", hint: "braindump" },
        ].map(p => (
          <button key={p.label} onClick={() => onQuickAction(p.hint)} style={{
            border: "1px solid var(--border, #e3d8c9)", background: "transparent",
            padding: "5px 11px", borderRadius: 99, fontSize: 12,
            fontFamily: "var(--font-mono, monospace)", color: "var(--fg-muted, #6e6458)",
            cursor: "pointer",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Composer */}
      <div style={{
        borderTop: "1px solid var(--border, #e3d8c9)",
        padding: "12px 14px 14px", display: "flex", gap: 8, alignItems: "flex-end",
        background: "var(--surface-card, #fbf7f2)",
      }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type, or hold to dictate…"
          rows={1}
          style={{
            flex: 1, resize: "none", border: "1px solid var(--border, #e3d8c9)",
            borderRadius: 12, padding: "8px 12px", fontFamily: "var(--font-sans, Inter, sans-serif)",
            fontSize: 14, lineHeight: 1.5, outline: "none", minHeight: 40, maxHeight: 120,
            background: "var(--surface-page, #f3ebe2)", color: "var(--fg, #2a2520)",
          }}
        />
        {/* walkie-talkie + hands-free voice mode */}
        <button title="Walkie-talkie — hold to speak" onClick={() => window.__vcOpen?.('walkie')} style={{
          width: 40, height: 40, borderRadius: 99,
          border: "1px solid var(--border, #e3d8c9)",
          background: "var(--surface-page, #f3ebe2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--fg-muted, #6e6458)",
        }}>{window.I ? <I.Mic size={16} stroke={1.75}/> : "🎙"}</button>
        <button title="Voice mode — hands-free" onClick={() => window.__vcOpen?.('voice')} style={{
          width: 40, height: 40, borderRadius: 99,
          border: "1px solid color-mix(in oklab, var(--tempo-orange) 35%, var(--border, #e3d8c9))",
          background: "color-mix(in oklab, var(--tempo-orange) 14%, var(--surface-page, #f3ebe2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--tempo-orange)",
        }}>{window.I ? <I.Volume size={16} stroke={1.75}/> : "🔊"}</button>
        <button onClick={send} title="Send" style={{
          width: 40, height: 40, borderRadius: 99, border: "none",
          background: "var(--tempo-orange, #D97757)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          {window.I ? <I.Send size={15}/> : "→"}
        </button>
      </div>
    </div>
  );
};

/* ---------- Brain Dump tab ---------- */
const BrainDumpTab = ({ onClose }) => {
  const [text, setText] = useState("");
  const taRef = useRef(null);
  useEffect(() => { taRef.current?.focus(); }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{
          fontFamily: "var(--font-mono, monospace)", fontSize: 10,
          color: "var(--fg-muted, #6e6458)", letterSpacing: "0.06em",
          textTransform: "uppercase", marginBottom: 6,
        }}>Brain dump</div>
        <div style={{
          fontFamily: "var(--font-serif, Fraunces, serif)", fontSize: 18,
          lineHeight: 1.35, color: "var(--fg, #2a2520)", textWrap: "pretty",
        }}>
          Get it out of your head. No structure. I'll read it and offer to triage.
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: "6px 20px 12px", display: "flex" }}>
        <textarea
          ref={taRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={"Everything that's loud right now.\n\nReturns are fine. Fragments are fine."}
          style={{
            flex: 1, width: "100%", resize: "none", outline: "none",
            border: "1px solid var(--border-soft, rgba(0,0,0,0.08))",
            borderRadius: 12, padding: "14px 16px",
            fontFamily: "var(--font-serif, Fraunces, serif)", fontSize: 15, lineHeight: 1.6,
            background: "var(--surface-page, #f3ebe2)", color: "var(--fg, #2a2520)",
          }}
        />
      </div>

      <div style={{
        borderTop: "1px solid var(--border, #e3d8c9)",
        padding: "10px 16px 14px",
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--surface-card, #fbf7f2)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono, monospace)", fontSize: 11,
          color: "var(--fg-muted, #6e6458)",
        }}>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }}/>
        <button onClick={onClose} style={{
          border: "1px solid var(--border, #e3d8c9)", background: "transparent",
          padding: "7px 13px", borderRadius: 99, fontSize: 12,
          fontFamily: "var(--font-mono, monospace)", cursor: "pointer",
          color: "var(--fg-muted, #6e6458)",
        }}>Save for later</button>
        <button onClick={onClose} style={{
          border: "none", background: "var(--tempo-orange, #D97757)", color: "#fff",
          padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
          fontFamily: "var(--font-mono, monospace)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {window.I ? <I.Sparkles size={12}/> : "✦"} Triage with coach
        </button>
      </div>
    </div>
  );
};

/* ---------- Main dock ---------- */
const CoachDock = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("coach");
  const [draft, setDraft] = useState("");
  const [hasUnread, setHasUnread] = useState(true); // gentle nudge dot on the FAB

  // ⌘J / Ctrl-J toggle
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => { if (open) setHasUnread(false); }, [open]);

  const onQuickAction = (hint) => {
    if (hint === "braindump") { setTab("dump"); return; }
    if (hint === "plan") setDraft("Help me plan the next hour.");
    if (hint === "stuck") setDraft("I'm stuck — can you unblock me gently?");
  };

  return (
    <>
      {/* animations */}
      <style>{`
        @keyframes coach-breath {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50%      { transform: scale(1.12); opacity: 0; }
        }
        @keyframes coach-pop {
          from { transform: translateY(12px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes coach-backdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open coach"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 60,
          width: 56, height: 56, borderRadius: 99, border: "none",
          background: "var(--gradient-tempo, linear-gradient(135deg, #E08968, #C8643F))",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 14px 32px -10px rgba(217,119,87,0.55), 0 2px 6px rgba(0,0,0,0.08)",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        {!open && <FabBreath/>}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        ) : (
          /* chat glyph (message bubble with a dot) */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H7l-3 2v-2.4A8 8 0 0 1 4 12z"/>
            <circle cx="9" cy="12" r="0.9" fill="currentColor" stroke="none"/>
            <circle cx="12.5" cy="12" r="0.9" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none"/>
          </svg>
        )}
        {!open && hasUnread && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 10, height: 10, borderRadius: 99,
            background: "var(--moss, #8fa571)",
            boxShadow: "0 0 0 2px var(--surface-page, #f3ebe2)",
          }}/>
        )}
      </button>

      {/* keyboard hint label — shows briefly on hover */}
      {!open && (
        <div style={{
          position: "fixed", bottom: 38, right: 90, zIndex: 59,
          fontFamily: "var(--font-mono, monospace)", fontSize: 11,
          color: "var(--fg-muted, #6e6458)", pointerEvents: "none",
          opacity: 0.8,
        }}>
          coach · <kbd style={{
            fontFamily: "inherit", fontSize: 10, padding: "1px 6px",
            background: "var(--surface-card, #fbf7f2)",
            border: "1px solid var(--border, #e3d8c9)", borderRadius: 4,
          }}>⌘J</kbd>
        </div>
      )}

      {/* Panel */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 55,
              background: "rgba(30,22,14,0.18)", backdropFilter: "blur(2px)",
            animation: "coach-backdrop 200ms ease forwards",
            }}
          />
          <div style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 58,
            width: 400, maxWidth: "calc(100vw - 32px)",
            height: "min(620px, calc(100vh - 120px))",
            background: "var(--surface-card, #fbf7f2)",
            borderRadius: 20,
            boxShadow: "0 24px 60px -16px rgba(60,40,20,0.28), 0 4px 12px rgba(60,40,20,0.08)",
            border: "1px solid var(--border, #e3d8c9)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "coach-pop 240ms cubic-bezier(0.2,0.9,0.25,1.05) forwards",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderBottom: "1px solid var(--border-soft, rgba(0,0,0,0.06))",
            }}>
              <CoachDotMark size={30}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg, #2a2520)" }}>Tempo Coach</div>
                <div style={{
                  fontFamily: "var(--font-mono, monospace)", fontSize: 10,
                  color: "var(--fg-muted, #6e6458)",
                }}>warmth 6/10 · scope: Today</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--fg-muted, #6e6458)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, padding: "8px 10px 0",
              borderBottom: "1px solid var(--border-soft, rgba(0,0,0,0.06))",
            }}>
              {[
                { id: "coach", label: "Chat" },
                { id: "dump",  label: "Brain dump" },
              ].map(t => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    border: "none", background: "transparent", cursor: "pointer",
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono, monospace)", fontSize: 11,
                    letterSpacing: "0.04em",
                    color: active ? "var(--fg, #2a2520)" : "var(--fg-muted, #6e6458)",
                    borderBottom: active ? "2px solid var(--tempo-orange, #D97757)" : "2px solid transparent",
                    marginBottom: -1,
                  }}>{t.label}</button>
                );
              })}
              <div style={{ flex: 1 }}/>
              <button
                onClick={() => {
                  // hop to full coach screen if app router exposes it
                  if (window.__tempoSetScreen) { window.__tempoSetScreen("coach"); setOpen(false); }
                }}
                style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono, monospace)", fontSize: 11,
                  color: "var(--fg-muted, #6e6458)",
                }}
                title="Open full Coach screen"
              >open full ↗</button>
            </div>

            {/* Tab body */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {tab === "coach"
                ? <CoachTab draft={draft} setDraft={setDraft} onSend={()=>{}} onQuickAction={onQuickAction}/>
                : <BrainDumpTab onClose={() => setOpen(false)}/>
              }
            </div>
          </div>
        </>
      )}
    </>
  );
};

window.CoachDock = CoachDock;
