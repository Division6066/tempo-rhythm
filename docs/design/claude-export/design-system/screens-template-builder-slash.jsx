/* ============================================================
   Tempo Flow — Slash command menu (phase 3a)
   Usage: inside any block, user types "/" → popup appears →
   pick a block type → it inserts that block AFTER the current one.
   ============================================================ */

const TB_SLASH_SHORTCUTS = [
  { key: "h1",        label: "Heading 1",       type: "heading",   patch: { level: 1, text: "Heading" } },
  { key: "h2",        label: "Heading 2",       type: "heading",   patch: { level: 2, text: "Heading" } },
  { key: "h3",        label: "Heading 3",       type: "heading",   patch: { level: 3, text: "Heading" } },
  { key: "text",      label: "Paragraph",       type: "paragraph" },
  { key: "todo",      label: "Checklist",       type: "checklist" },
  { key: "subtasks",  label: "Sub-tasks",       type: "subtasks" },
  { key: "prompt",    label: "Journal prompt",  type: "prompt" },
  { key: "energy",    label: "Energy slider",   type: "energy" },
  { key: "rating",    label: "Rating 1–10",     type: "rating" },
  { key: "habit",     label: "Habit check",     type: "habit" },
  { key: "time",      label: "Time block",      type: "timeblock" },
  { key: "callout",   label: "Callout",         type: "callout" },
  { key: "divider",   label: "Divider",         type: "divider" },
  { key: "variable",  label: "Variable",        type: "variable" },
  { key: "coach",     label: "Coach reflection",type: "coach" },
  { key: "gratitude", label: "Gratitude × 3",   type: "gratitude" },
  { key: "mood",      label: "Mood picker",     type: "mood" },
];

/* Hook: attach slash detection to any contentEditable element.
   onInsert(type, patch) is called when user picks an item. */
const useSlashMenu = (onInsert) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [idx, setIdx] = useState(0);
  const triggerRef = useRef(null); // { node, offset } — where the "/" was typed
  const aiMode = query.startsWith("=");
  const searchTerm = (aiMode ? query.slice(1) : query).toLowerCase();

  const filtered = aiMode
    ? [] // AI mode shown separately
    : TB_SLASH_SHORTCUTS.filter(s =>
        !searchTerm ||
        s.label.toLowerCase().includes(searchTerm) ||
        s.key.toLowerCase().includes(searchTerm)
      );

  const close = () => { setOpen(false); setQuery(""); setIdx(0); triggerRef.current = null; };

  const pick = (item) => {
    // Remove the "/" + query from the element
    try {
      const sel = window.getSelection();
      if (triggerRef.current && sel && sel.rangeCount) {
        const el = triggerRef.current.node;
        // Simple approach: strip any "/..." substring from text
        if (el && el.innerText.includes("/")) {
          el.innerText = el.innerText.replace(/\/[^\s]*$/, "").replace(/\/[^\s]*/, "");
        }
      }
    } catch {}
    onInsert(item.type, item.patch || {});
    close();
  };

  const pickAI = async () => {
    // Phase 3b: call Claude to generate a block from natural language
    const prompt = query.slice(1).trim();
    if (!prompt) return;
    close();
    // Strip the "/=..." from element
    try {
      const el = triggerRef.current?.node;
      if (el) el.innerText = el.innerText.replace(/\/=[^\n]*$/, "").trimEnd();
    } catch {}
    await onInsert("__ai__", { aiPrompt: prompt });
  };

  // Handlers to spread onto a contentEditable element
  const handlers = {
    onKeyDown: (e) => {
      if (open) {
        if (e.key === "Escape") { e.preventDefault(); close(); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); return; }
        if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); return; }
        if (e.key === "Enter")     {
          e.preventDefault();
          if (aiMode) { pickAI(); return; }
          if (filtered[idx]) pick(filtered[idx]);
          return;
        }
        if (e.key === "Backspace") {
          if (query === "") { close(); return; }
          setQuery(q => q.slice(0, -1));
          return;
        }
        if (e.key.length === 1) {
          e.preventDefault();
          setQuery(q => q + e.key);
          setIdx(0);
          return;
        }
      } else if (e.key === "/") {
        // Opening: record position
        const sel = window.getSelection();
        const rect = sel && sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null;
        triggerRef.current = { node: e.currentTarget };
        setAnchor({ x: rect?.left || e.clientX || 100, y: (rect?.bottom || 100) + 4 });
        setQuery("");
        setIdx(0);
        // Let the "/" land in the text, then open
        setTimeout(() => setOpen(true), 0);
      }
    },
    onBlur: () => { setTimeout(close, 150); },
  };

  return { open, query, anchor, idx, filtered, aiMode, pick, pickAI, close, handlers };
};

/* The floating menu element — render it inside the component tree; it positions itself via `fixed`. */
const SlashMenu = ({ open, anchor, query, filtered, idx, aiMode, pick, pickAI, close }) => {
  if (!open) return null;
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed", left: Math.min(anchor.x, window.innerWidth - 280), top: Math.min(anchor.y, window.innerHeight - 340),
        width: 260, maxHeight: 320, overflowY: "auto",
        background: "var(--surface-card)", border: "1px solid var(--border)",
        borderRadius: 10, boxShadow: "var(--shadow-lift)", zIndex: 2000,
        padding: 6,
      }}>
      <div style={{padding:"6px 10px 8px", borderBottom:"1px solid var(--border-soft)", marginBottom:4}}>
        <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--fg-muted)"}}>
          {aiMode ? "AI · ask for a block" : "Insert block"}
        </div>
        <div style={{fontSize:12, color:"var(--fg)", marginTop:3, fontFamily: aiMode ? "var(--font-sans)" : "var(--font-mono)"}}>
          {aiMode
            ? (query.slice(1) || <span style={{color:"var(--fg-subtle)"}}>e.g. "main task with 3 subtasks"</span>)
            : `/${query}`}
        </div>
      </div>

      {aiMode ? (
        <div style={{padding:10}}>
          <div style={{fontSize:12.5, color:"var(--fg-muted)", lineHeight:1.55, marginBottom:10}}>
            Describe the block you want. The coach will pick a type and fill in the labels.
          </div>
          <button className="btn btn-primary btn-sm" style={{width:"100%"}} onClick={pickAI} disabled={!query.slice(1).trim()}>
            <I.Sparkles size={12}/> Generate block
          </button>
          <div style={{fontSize:11, color:"var(--fg-subtle)", marginTop:10, lineHeight:1.5}}>
            Try: <span style={{fontFamily:"var(--font-mono)"}}>energy + focus rating</span>,
            {" "}<span style={{fontFamily:"var(--font-mono)"}}>3 gratitude rows</span>,
            {" "}<span style={{fontFamily:"var(--font-mono)"}}>friday review checklist</span>.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{padding:14, fontSize:12.5, color:"var(--fg-muted)", textAlign:"center"}}>
          No matches. Try <span style={{fontFamily:"var(--font-mono)"}}>/=</span> + a description to ask the coach.
        </div>
      ) : (
        filtered.map((s, i) => {
          const spec = TB_BLOCK_TYPES.find(sp => sp.type === s.type);
          const Ic = I[spec?.icon || "Layers"] || I.Layers;
          return (
            <button key={s.key}
              onMouseEnter={() => {}}
              onClick={() => pick(s)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"8px 10px", borderRadius:6,
                background: i === idx ? "var(--surface-sunken)" : "transparent",
                border:"none", cursor:"pointer", color:"var(--fg)",
                fontSize:13, textAlign:"left",
              }}>
              <Ic size={14} stroke={1.5}/>
              <span style={{flex:1}}>{s.label}</span>
              <span style={{fontSize:10.5, fontFamily:"var(--font-mono)", color:"var(--fg-subtle)"}}>/{s.key}</span>
            </button>
          );
        })
      )}

      <div style={{borderTop:"1px solid var(--border-soft)", padding:"6px 10px", marginTop:4, display:"flex", gap:10, fontSize:10.5, color:"var(--fg-subtle)", fontFamily:"var(--font-mono)"}}>
        <span>↑↓ nav</span><span>↵ pick</span><span>esc close</span>
      </div>
    </div>
  );
};

Object.assign(window, { TB_SLASH_SHORTCUTS, useSlashMenu, SlashMenu });
