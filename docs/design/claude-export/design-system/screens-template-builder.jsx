/* ============================================================
   Tempo Flow — Template Builder (visual block editor)
   Chunk 3b: palette + canvas + inspector.
   Slash commands + /= AI block land in chunk 3c.
   Scheduling + run mode in chunk 3d.
   ============================================================ */

/* ---------- Block type registry ---------- */
const TB_BLOCK_TYPES = [
  { type: "heading",    label: "Heading",      icon: "Heading",    desc: "Section title",            defaults: { text: "Heading", level: 2 } },
  { type: "paragraph",  label: "Paragraph",    icon: "AlignLeft",  desc: "Rich-text body",           defaults: { text: "Write something…" } },
  { type: "checklist",  label: "Checklist",    icon: "CheckSquare",desc: "Task list with checkboxes",defaults: { items: ["Task one", "Task two", "Task three"] } },
  { type: "subtasks",   label: "Sub-tasks",    icon: "List",       desc: "Collapsible task tree",    defaults: { parent: "Main task", children: ["Subtask one", "Subtask two"] } },
  { type: "prompt",     label: "Journal prompt",icon: "BookOpen",  desc: "Long-form answer",         defaults: { prompt: "What stayed with you this week?", rows: 4 } },
  { type: "energy",     label: "Energy slider",icon: "Flame",      desc: "1–5 energy rating",        defaults: { label: "Energy", min: 1, max: 5 } },
  { type: "rating",     label: "Rating 1–10",  icon: "Slider",     desc: "Numeric rating",           defaults: { label: "How was the week?", min: 1, max: 10 } },
  { type: "habit",      label: "Habit check",  icon: "Check",      desc: "Yes/no with streak",       defaults: { label: "Morning walk", streak: 4 } },
  { type: "timeblock",  label: "Time block",   icon: "Clock",      desc: "Start–end time",           defaults: { label: "Deep work", start: "09:00", end: "10:30" } },
  { type: "callout",    label: "Callout",      icon: "Info",       desc: "Info / tip / warning",     defaults: { tone: "info", text: "Take a breath." } },
  { type: "divider",    label: "Divider",      icon: "Layers",     desc: "Visual break",             defaults: {} },
  { type: "image",      label: "Image",        icon: "Image",      desc: "Cover or inline image",    defaults: { url: "", caption: "" } },
  { type: "variable",   label: "Variable",     icon: "Sparkles",   desc: "{{today}}, {{friday}}, etc.",defaults: { key: "today", label: "Today's date" } },
  { type: "coach",      label: "Coach reflection",icon: "Mic",     desc: "AI fills on run",          defaults: { prompt: "Reflect on the week", fillsFromHistory: true } },
  { type: "gratitude",  label: "Gratitude × 3", icon: "Leaf",      desc: "Three-row gratitude list", defaults: { rows: 3 } },
  { type: "mood",       label: "Mood picker",   icon: "Smile",     desc: "Emoji row",                defaults: { options: ["😔","😕","😐","🙂","😄"] } },
];

const TB_CAT = {
  "Structure":      ["heading", "paragraph", "divider", "callout", "image"],
  "Tasks":          ["checklist", "subtasks", "habit", "timeblock"],
  "Reflection":     ["prompt", "coach", "gratitude", "mood"],
  "Measurement":    ["energy", "rating"],
  "Dynamic":        ["variable"],
};

/* ---------- Default template starter (for new or unknown ids) ---------- */
const TB_NEW_TEMPLATE = () => ({
  title: "Untitled template",
  emoji: "📝",
  cadence: "Weekly",
  schedule: "Friday · 4pm",
  desc: "A fresh canvas. Drag blocks from the left, or type / to summon them.",
  blocks: [
    { id: "b1", type: "heading", text: "Your template", level: 1 },
    { id: "b2", type: "paragraph", text: "Tell people what this template is for. One sentence is enough." },
  ],
});

/* ---------- Seed content for known starter IDs (quick previews) ---------- */
const TB_SEEDS = {
  "weekly-review": {
    title: "Weekly Review",
    emoji: "🗓",
    cadence: "Weekly",
    schedule: "Every Friday · 3:00pm",
    desc: "Nine questions. Fifteen minutes. Every Friday at 3.",
    blocks: [
      { id: "w1", type: "heading", text: "Weekly Review", level: 1 },
      { id: "w2", type: "variable", key: "week_range", label: "Week of {{monday}} – {{friday}}" },
      { id: "w3", type: "rating", label: "How did the week feel?", min: 1, max: 10 },
      { id: "w4", type: "prompt", prompt: "Three wins — however small.", rows: 3 },
      { id: "w5", type: "prompt", prompt: "One thing you dodged. Name it.", rows: 2 },
      { id: "w6", type: "coach", prompt: "What pattern shows up across the last three weeks?", fillsFromHistory: true },
      { id: "w7", type: "divider" },
      { id: "w8", type: "heading", text: "Next week", level: 2 },
      { id: "w9", type: "checklist", items: ["Top three for next week", "One project I'll protect time for", "One person I'll reach out to"] },
      { id: "w10", type: "callout", tone: "info", text: "Put this on the calendar before you close the laptop." },
    ],
  },
  "sunday-reset": {
    title: "Sunday Reset",
    emoji: "🌿",
    cadence: "Weekly",
    schedule: "Every Sunday · 6:00pm",
    desc: "Recap · clear · re-aim.",
    blocks: [
      { id: "s1", type: "heading", text: "Sunday Reset", level: 1 },
      { id: "s2", type: "mood", options: ["😔","😕","😐","🙂","😄"] },
      { id: "s3", type: "energy", label: "Body energy", min: 1, max: 5 },
      { id: "s4", type: "prompt", prompt: "What do you want less of next week?", rows: 2 },
      { id: "s5", type: "prompt", prompt: "What do you want more of?", rows: 2 },
      { id: "s6", type: "gratitude", rows: 3 },
      { id: "s7", type: "divider" },
      { id: "s8", type: "checklist", items: ["Laundry", "Fridge", "Inbox zero-ish", "Plan Monday morning"] },
    ],
  },
  "morning-pages": {
    title: "Morning Pages",
    emoji: "☀",
    cadence: "Daily",
    schedule: "Every morning · before 10am",
    desc: "Three long pages. No prompts. Just the cursor.",
    blocks: [
      { id: "m1", type: "heading", text: "Morning Pages", level: 1 },
      { id: "m2", type: "variable", key: "today", label: "{{today, full}}" },
      { id: "m3", type: "prompt", prompt: "", rows: 20 },
    ],
  },
};

/* ---------- Slugging helper for deterministic ids ---------- */
const tbId = () => "b" + Math.random().toString(36).slice(2, 8);

/* ---------- Emoji picker (tiny inline) ---------- */
const TB_EMOJIS = ["📝","🗓","☀","🌙","🌿","📊","🎯","🔥","⚡","✅","📖","⏱","🌱","🚢","🧭","💎","🧪","🪞","🕯"];

/* ---------- Drag-n-drop helper ---------- */
const useReorderable = (initial, onChange) => {
  const dragId = useRef(null);
  const [overId, setOverId] = useState(null);
  const handlers = (blockId) => ({
    draggable: true,
    onDragStart: (e) => {
      dragId.current = blockId;
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", blockId); } catch {}
    },
    onDragEnd: () => { dragId.current = null; setOverId(null); },
    onDragOver: (e) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== blockId) setOverId(blockId);
    },
    onDragLeave: () => {
      if (overId === blockId) setOverId(null);
    },
    onDrop: (e) => {
      e.preventDefault();
      const from = dragId.current;
      const to = blockId;
      if (!from || from === to) return;
      const arr = [...initial];
      const fi = arr.findIndex(b => b.id === from);
      const ti = arr.findIndex(b => b.id === to);
      if (fi < 0 || ti < 0) return;
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      onChange(arr);
      dragId.current = null;
      setOverId(null);
    },
  });
  return { handlers, overId, dragId: dragId.current };
};

/* ---------- Block renderer (read-only when previewing) ---------- */
const TBBlock = ({ b, onChange, readOnly }) => {
  const patch = (u) => onChange({ ...b, ...u });
  switch (b.type) {
    case "heading": {
      const size = b.level === 1 ? 30 : b.level === 2 ? 22 : 17;
      return <div style={{fontFamily:"var(--font-serif)", fontSize:size, fontWeight:500, letterSpacing:"-0.01em", color:"var(--fg)"}}
        contentEditable={!readOnly} suppressContentEditableWarning
        onBlur={(e) => patch({ text: e.currentTarget.innerText })}>
        {b.text}
      </div>;
    }
    case "paragraph":
      return <div style={{fontSize:14.5, lineHeight:1.65, color:"var(--fg-muted)"}}
        contentEditable={!readOnly} suppressContentEditableWarning
        onBlur={(e) => patch({ text: e.currentTarget.innerText })}>
        {b.text}
      </div>;
    case "checklist":
      return <div style={{display:"flex", flexDirection:"column", gap:6}}>
        {(b.items || []).map((it, i) => (
          <label key={i} style={{display:"flex", alignItems:"center", gap:10, fontSize:14}}>
            <span style={{width:16, height:16, borderRadius:4, border:"1.5px solid var(--border)", flexShrink:0}}/>
            <span contentEditable={!readOnly} suppressContentEditableWarning
              onBlur={(e) => {
                const items = [...b.items]; items[i] = e.currentTarget.innerText; patch({ items });
              }}>{it}</span>
          </label>
        ))}
        {!readOnly && <button className="btn btn-sm btn-ghost" style={{alignSelf:"flex-start"}}
          onClick={() => patch({ items: [...(b.items||[]), "New task"] })}>
          <I.Plus size={12}/> Add task
        </button>}
      </div>;
    case "subtasks":
      return <div>
        <div style={{display:"flex", alignItems:"center", gap:10, fontSize:14.5, fontWeight:500, marginBottom:6}}>
          <I.ChevronDown size={14}/>
          <span style={{width:16, height:16, borderRadius:4, border:"1.5px solid var(--border)"}}/>
          <span contentEditable={!readOnly} suppressContentEditableWarning
            onBlur={(e) => patch({ parent: e.currentTarget.innerText })}>{b.parent}</span>
        </div>
        <div style={{marginLeft:28, display:"flex", flexDirection:"column", gap:6}}>
          {(b.children || []).map((c, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:10, fontSize:13.5, color:"var(--fg-muted)"}}>
              <span style={{width:6, height:2, background:"var(--border)"}}/>
              <span style={{width:14, height:14, borderRadius:3, border:"1.5px solid var(--border)"}}/>
              <span contentEditable={!readOnly} suppressContentEditableWarning
                onBlur={(e) => { const children = [...b.children]; children[i] = e.currentTarget.innerText; patch({ children }); }}>{c}</span>
            </div>
          ))}
        </div>
      </div>;
    case "prompt":
      return <div>
        <div style={{fontSize:14, fontWeight:500, marginBottom:8, fontFamily:"var(--font-serif)"}}
          contentEditable={!readOnly} suppressContentEditableWarning
          onBlur={(e) => patch({ prompt: e.currentTarget.innerText })}>
          {b.prompt || "Prompt"}
        </div>
        <div style={{border:"1px dashed var(--border)", borderRadius:8, padding:"10px 12px", minHeight: (b.rows || 3) * 18, background:"var(--surface-sunken)", fontSize:13, color:"var(--fg-subtle)", fontStyle:"italic"}}>
          Long-form answer · {b.rows || 3} rows
        </div>
      </div>;
    case "energy":
      return <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div style={{fontSize:13.5, fontWeight:500, minWidth:80}}>{b.label}</div>
        <div style={{display:"inline-flex", gap:4}}>
          {Array.from({length: b.max || 5}).map((_, i) => (
            <span key={i} style={{width:28, height:8, borderRadius:99, background: i < 3 ? "var(--tempo-orange)" : "var(--border)"}}/>
          ))}
        </div>
        <div style={{fontSize:11, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>{b.min}–{b.max}</div>
      </div>;
    case "rating":
      return <div>
        <div style={{fontSize:13.5, fontWeight:500, marginBottom:8}}>{b.label}</div>
        <div style={{display:"flex", gap:4}}>
          {Array.from({length: (b.max || 10) - (b.min || 1) + 1}).map((_, i) => {
            const n = (b.min || 1) + i;
            return <div key={n} style={{flex:1, height:34, borderRadius:6, border:"1px solid var(--border)", background:"var(--surface-card)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>{n}</div>;
          })}
        </div>
      </div>;
    case "habit":
      return <div style={{display:"flex", alignItems:"center", gap:12}}>
        <span style={{width:22, height:22, borderRadius:6, border:"1.5px solid var(--border)", flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:500}}>{b.label}</div>
          <div style={{fontSize:11, color:"var(--moss-600)", fontFamily:"var(--font-mono)"}}>🔥 {b.streak}-day streak</div>
        </div>
      </div>;
    case "timeblock":
      return <div style={{display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--surface-sunken)", borderRadius:8, borderLeft:"3px solid var(--tempo-orange)"}}>
        <I.Clock size={16}/>
        <div style={{fontSize:13.5, fontWeight:500}}>{b.label}</div>
        <div style={{fontSize:12, color:"var(--fg-muted)", fontFamily:"var(--font-mono)", marginLeft:"auto"}}>{b.start} – {b.end}</div>
      </div>;
    case "callout": {
      const toneColor = b.tone === "warning" ? "var(--amber)" : b.tone === "tip" ? "var(--moss)" : "var(--slate-400)";
      return <div style={{display:"flex", gap:12, padding:"12px 14px", background:"var(--surface-sunken)", borderRadius:8, borderLeft:`3px solid ${toneColor}`}}>
        <I.Info size={16}/>
        <div style={{fontSize:13.5, lineHeight:1.55, flex:1}}
          contentEditable={!readOnly} suppressContentEditableWarning
          onBlur={(e) => patch({ text: e.currentTarget.innerText })}>
          {b.text}
        </div>
      </div>;
    }
    case "divider":
      return <div style={{height:1, background:"var(--border)", margin:"4px 0"}}/>;
    case "image":
      return <div style={{border:"1px dashed var(--border)", borderRadius:10, padding:40, display:"flex", flexDirection:"column", alignItems:"center", gap:8, color:"var(--fg-muted)", fontSize:13, background:"var(--surface-sunken)"}}>
        <I.Image size={22}/>
        <div>{b.url ? b.url : "Image placeholder"}</div>
        {b.caption && <div style={{fontSize:11, fontStyle:"italic"}}>{b.caption}</div>}
      </div>;
    case "variable":
      return <div style={{display:"inline-flex", alignItems:"center", gap:8, padding:"6px 10px", background:"color-mix(in oklab, var(--tempo-orange) 8%, transparent)", border:"1px solid color-mix(in oklab, var(--tempo-orange) 25%, transparent)", borderRadius:6, fontFamily:"var(--font-mono)", fontSize:12.5}}>
        <I.Sparkles size={12}/>
        <span style={{color:"var(--tempo-orange-dark)", fontWeight:500}}>{`{{${b.key}}}`}</span>
        <span style={{color:"var(--fg-muted)"}}>·</span>
        <span style={{color:"var(--fg-muted)"}}>{b.label}</span>
      </div>;
    case "coach":
      return <div style={{padding:"14px 16px", background:"linear-gradient(145deg, color-mix(in oklab, var(--tempo-orange) 6%, var(--surface-card)) 0%, var(--surface-sunken) 100%)", borderRadius:10, border:"1px solid color-mix(in oklab, var(--tempo-orange) 15%, var(--border))"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
          <div style={{width:22, height:22, borderRadius:99, background:"var(--gradient-tempo)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}><I.Sparkles size={12}/></div>
          <div style={{fontSize:11, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--tempo-orange-dark)"}}>Coach fills on run</div>
        </div>
        <div style={{fontSize:14, fontFamily:"var(--font-serif)", lineHeight:1.5}}
          contentEditable={!readOnly} suppressContentEditableWarning
          onBlur={(e) => patch({ prompt: e.currentTarget.innerText })}>
          {b.prompt}
        </div>
        {b.fillsFromHistory && <div style={{marginTop:8, fontSize:11, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>↳ pulls from last 3 weeks of your activity</div>}
      </div>;
    case "gratitude":
      return <div>
        <div style={{fontSize:14, fontWeight:500, marginBottom:8, fontFamily:"var(--font-serif)"}}>Gratitude</div>
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {Array.from({length: b.rows || 3}).map((_, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"var(--surface-sunken)", borderRadius:6, fontSize:13, color:"var(--fg-subtle)"}}>
              <span style={{color:"var(--moss)"}}>{i+1}.</span>
              <span style={{fontStyle:"italic"}}>Something you're grateful for…</span>
            </div>
          ))}
        </div>
      </div>;
    case "mood":
      return <div style={{display:"flex", gap:8}}>
        {(b.options || []).map((o, i) => (
          <div key={i} style={{width:44, height:44, borderRadius:99, border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, background:"var(--surface-card)"}}>{o}</div>
        ))}
      </div>;
    default:
      return <div style={{fontSize:12, color:"var(--fg-subtle)", fontFamily:"var(--font-mono)"}}>Unknown block: {b.type}</div>;
  }
};

Object.assign(window, {
  TB_BLOCK_TYPES, TB_CAT, TB_NEW_TEMPLATE, TB_SEEDS, TB_EMOJIS, tbId,
  useReorderable, TBBlock,
});
