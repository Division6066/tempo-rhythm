/* ============================================================
   Tempo Flow — Template Run (guided execution)
   Loads a template from localStorage ("tf-current-template") and
   walks through it block by block. Variables auto-fill, coach
   blocks show AI-filled content, checklists are interactive.
   ============================================================ */

const TR_dateFmt = (d = new Date()) => {
  return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
};
const TR_fillVar = (key) => {
  const now = new Date();
  switch (key) {
    case "today": return TR_dateFmt(now);
    case "yesterday": {
      const d = new Date(now); d.setDate(d.getDate() - 1); return TR_dateFmt(d);
    }
    case "friday": {
      const d = new Date(now); const off = (5 - d.getDay() + 7) % 7; d.setDate(d.getDate() + off); return TR_dateFmt(d);
    }
    case "monday": {
      const d = new Date(now); const off = (1 - d.getDay() + 7) % 7; d.setDate(d.getDate() + off); return TR_dateFmt(d);
    }
    case "week_range": {
      const d = new Date(now); const s = new Date(d); s.setDate(d.getDate() - d.getDay());
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `${s.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;
    }
    case "last_week_wins": return "shipped v2 · pair with M · journal 3×";
    case "top_3_tasks": return "1. Draft proposal · 2. 1:1 with Ray · 3. Review PRD";
    case "current_streak": return "12 days";
    default: return `{{${key}}}`;
  }
};

const ScreenTemplateRunV2 = () => {
  const { setScreen } = useApp();
  const tid = (() => { try { return localStorage.getItem("tf-current-template") || "weekly-review"; } catch { return "weekly-review"; } })();
  const seed = TB_SEEDS[tid] || TB_NEW_TEMPLATE();
  const [tpl] = useState(seed);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // blockId → value
  const [done, setDone] = useState(false);

  // Filter to "runnable" blocks — skip pure layout
  const runBlocks = tpl.blocks.filter(b => !["divider","image"].includes(b.type));
  const current = runBlocks[step];
  const pct = ((step) / Math.max(1, runBlocks.length)) * 100;

  const setAns = (id, v) => setAnswers({ ...answers, [id]: v });
  const next = () => {
    if (step < runBlocks.length - 1) setStep(step + 1);
    else setDone(true);
  };
  const prev = () => step > 0 && setStep(step - 1);

  if (done) {
    return <div style={{display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--surface-sunken)"}}>
      <Topbar title={tpl.title} crumb={`${tpl.emoji} Template · complete`}/>
      <div className="page" style={{maxWidth:680}}>
        <div style={{textAlign:"center", padding:"60px 20px"}}>
          <div style={{fontSize:56, marginBottom:20}}>✨</div>
          <h1 style={{fontFamily:"var(--font-serif)", fontSize:38, fontWeight:500, letterSpacing:"-0.02em", marginBottom:12}}>Template complete.</h1>
          <p className="lede" style={{maxWidth:420, margin:"0 auto 32px"}}>
            Your answers are saved into the daily note and appended to your activity history.
            Next run — {tpl.schedule.toLowerCase()}.
          </p>
          <div style={{display:"flex", gap:10, justifyContent:"center"}}>
            <button className="btn btn-ghost" onClick={() => setScreen("templates")}>Back to templates</button>
            <button className="btn btn-primary" onClick={() => setScreen("today")}><I.ArrowRight size={14}/> See daily note</button>
          </div>
        </div>
      </div>
    </div>;
  }

  return <div style={{display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--surface-sunken)"}}>
    <Topbar title={tpl.title} crumb={`${tpl.emoji} Template · run`}
      right={
        <div className="row-tight">
          <span style={{fontSize:12, fontFamily:"var(--font-mono)", color:"var(--fg-muted)"}}>
            {step + 1} / {runBlocks.length}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setScreen("templates")}>Exit</button>
        </div>
      }/>
    <div style={{height:3, background:"var(--border-soft)", position:"sticky", top:"var(--topbar-h)", zIndex:5}}>
      <div style={{height:"100%", width:`${pct}%`, background:"var(--tempo-orange)", transition:"width 250ms ease"}}/>
    </div>

    <div style={{maxWidth:680, margin:"0 auto", padding:"48px 24px 120px"}}>
      <div style={{fontSize:11, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--fg-muted)", marginBottom:14}}>
        Step {step + 1} · {TB_BLOCK_TYPES.find(s => s.type === current?.type)?.label || current?.type}
      </div>

      <TRBlockRunner block={current} value={answers[current?.id]} onChange={(v) => setAns(current.id, v)}/>

      <div style={{display:"flex", gap:10, marginTop:40, alignItems:"center"}}>
        <button className="btn btn-ghost" onClick={prev} disabled={step === 0}>
          <I.ArrowLeft size={14}/> Back
        </button>
        <div style={{flex:1}}/>
        <button className="btn btn-ghost btn-sm" onClick={next}>Skip</button>
        <button className="btn btn-primary" onClick={next}>
          {step === runBlocks.length - 1 ? <>Finish <I.Check size={14}/></> : <>Next <I.ArrowRight size={14}/></>}
        </button>
      </div>

      <div style={{marginTop:60, padding:"14px 16px", background:"var(--surface-card)", border:"1px solid var(--border)", borderRadius:10, display:"flex", gap:12, alignItems:"center"}}>
        <div style={{width:32, height:32, borderRadius:99, background:"var(--tempo-orange)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          <I.Mic size={14}/>
        </div>
        <div style={{flex:1, fontSize:13, color:"var(--fg-muted)", lineHeight:1.55}}>
          <span style={{color:"var(--fg)", fontWeight:500}}>Coach · </span>
          {current?.type === "prompt"
            ? "Take your time. You can ramble — I'll clean it up for the journal."
            : current?.type === "energy" || current?.type === "rating"
            ? "Just your gut — don't overthink the number."
            : current?.type === "coach"
            ? "Here's what I noticed from the last three weeks of your activity."
            : "One block at a time. Skip anything that isn't landing today."}
        </div>
        <button className="icon-btn"><I.Volume size={14}/></button>
      </div>
    </div>
  </div>;
};

/* Block-specific runner — interactive when running, unlike the builder's read-only preview. */
const TRBlockRunner = ({ block, value, onChange }) => {
  if (!block) return null;
  switch (block.type) {
    case "heading": {
      const size = block.level === 1 ? 40 : block.level === 2 ? 30 : 22;
      return <h1 style={{fontFamily:"var(--font-serif)", fontSize:size, fontWeight:500, letterSpacing:"-0.02em", marginBottom:8}}>{block.text}</h1>;
    }
    case "paragraph":
      return <p style={{fontSize:16, lineHeight:1.7, color:"var(--fg-muted)"}}>{block.text}</p>;

    case "checklist":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:22, fontWeight:500, marginBottom:16}}>{block.label || "Your checklist"}</h2>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {(block.items || []).map((it, i) => {
            const checked = (value || {})[i];
            return <label key={i} style={{display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"var(--surface-card)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer"}}>
              <span style={{width:20, height:20, borderRadius:5, border: checked ? "none" : "1.5px solid var(--border)", background: checked ? "var(--tempo-orange)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                {checked && <I.Check size={13} stroke={3} style={{color:"white"}}/>}
              </span>
              <span style={{fontSize:15, flex:1, textDecoration: checked ? "line-through" : "none", color: checked ? "var(--fg-muted)" : "var(--fg)"}}>{it}</span>
              <input type="checkbox" checked={!!checked} onChange={() => onChange({...(value||{}), [i]: !checked})} style={{display:"none"}}/>
            </label>;
          })}
        </div>
      </div>;

    case "prompt":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:24, fontWeight:500, marginBottom:16, lineHeight:1.35}}>{block.prompt}</h2>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write freely…"
          rows={block.rows || 5}
          autoFocus
          style={{
            width:"100%", padding:"16px 18px", borderRadius:10,
            border:"1px solid var(--border)", background:"var(--surface-card)",
            fontFamily:"var(--font-serif)", fontSize:16, lineHeight:1.65,
            color:"var(--fg)", resize:"vertical", outline:"none",
          }}/>
      </div>;

    case "energy":
    case "rating": {
      const max = block.max || (block.type === "energy" ? 5 : 10);
      const min = block.min || 1;
      const range = max - min + 1;
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:26, fontWeight:500, marginBottom:20}}>{block.label || (block.type === "energy" ? "Energy check" : "Rate it")}</h2>
        <div style={{display:"flex", gap:6}}>
          {Array.from({length: range}).map((_, i) => {
            const n = min + i;
            const selected = value === n;
            return <button key={n}
              onClick={() => onChange(n)}
              style={{
                flex:1, padding:"18px 0", borderRadius:10,
                border: selected ? "2px solid var(--tempo-orange)" : "1px solid var(--border)",
                background: selected ? "color-mix(in oklab, var(--tempo-orange) 12%, var(--surface-card))" : "var(--surface-card)",
                fontSize:20, fontWeight:500, fontFamily:"var(--font-serif)",
                color: selected ? "var(--tempo-orange)" : "var(--fg-muted)",
                cursor:"pointer",
              }}>{n}</button>;
          })}
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, fontFamily:"var(--font-mono)", color:"var(--fg-subtle)", textTransform:"uppercase", letterSpacing:"0.08em"}}>
          <span>Low</span><span>High</span>
        </div>
      </div>;
    }

    case "habit":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:24, fontWeight:500, marginBottom:8}}>Did you {block.label?.toLowerCase() || "do it"}?</h2>
        <p style={{fontSize:13, color:"var(--fg-muted)", marginBottom:20, fontFamily:"var(--font-mono)"}}>🔥 {block.streak || 0}-day streak — keep it going.</p>
        <div style={{display:"flex", gap:10}}>
          {[["no","Not today"],["yes","Yes, done"]].map(([k,l]) => (
            <button key={k} onClick={() => onChange(k)}
              style={{
                flex:1, padding:"20px", borderRadius:10,
                border: value === k ? "2px solid var(--tempo-orange)" : "1px solid var(--border)",
                background: value === k ? "color-mix(in oklab, var(--tempo-orange) 10%, var(--surface-card))" : "var(--surface-card)",
                fontSize:16, fontWeight:500, cursor:"pointer", color:"var(--fg)",
              }}>{l}</button>
          ))}
        </div>
      </div>;

    case "timeblock":
      return <div style={{padding:"24px 28px", background:"var(--surface-card)", borderRadius:12, borderLeft:"4px solid var(--tempo-orange)"}}>
        <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8}}>Time block</div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:28, fontWeight:500, marginBottom:6}}>{block.label}</h2>
        <div style={{fontSize:16, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>{block.start} — {block.end}</div>
      </div>;

    case "callout": {
      const toneColor = block.tone === "warning" ? "var(--amber)" : block.tone === "tip" ? "var(--moss)" : "var(--slate-400)";
      return <div style={{padding:"20px 24px", background:"var(--surface-card)", borderRadius:10, borderLeft:`3px solid ${toneColor}`, fontSize:16, lineHeight:1.6}}>
        {block.text}
      </div>;
    }

    case "variable":
      return <div style={{padding:"24px 28px", background:"var(--surface-sunken)", borderRadius:10, border:"1px dashed var(--border)"}}>
        <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6}}>{block.label || block.key}</div>
        <div style={{fontFamily:"var(--font-serif)", fontSize:26, fontWeight:500}}>{TR_fillVar(block.key)}</div>
      </div>;

    case "coach":
      return <div>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <div style={{width:28, height:28, borderRadius:99, background:"var(--tempo-orange)", color:"white", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <I.Sparkles size={14}/>
          </div>
          <div style={{fontSize:12, fontFamily:"var(--font-mono)", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:"0.08em"}}>Coach reflection</div>
        </div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:22, fontWeight:500, marginBottom:16, lineHeight:1.4}}>{block.prompt}</h2>
        <div style={{padding:"18px 20px", background:"color-mix(in oklab, var(--tempo-orange) 6%, var(--surface-card))", borderRadius:10, border:"1px solid color-mix(in oklab, var(--tempo-orange) 15%, var(--border))", fontSize:15, lineHeight:1.7, color:"var(--fg)"}}>
          {block.fillsFromHistory
            ? "Over the past three weeks, your high-energy mornings have overlapped with deep-work sessions 8 times out of 11. The days you shipped something also had a walk before 10am. The pattern isn't subtle — your body is telling you when to do hard things."
            : block.prompt}
        </div>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your response (optional)…"
          rows={3}
          style={{width:"100%", marginTop:14, padding:"12px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-card)", fontFamily:"var(--font-serif)", fontSize:15, lineHeight:1.6, resize:"vertical", outline:"none", color:"var(--fg)"}}/>
      </div>;

    case "gratitude":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:26, fontWeight:500, marginBottom:16}}>Three things, briefly.</h2>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {Array.from({length: block.rows || 3}).map((_, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:14}}>
              <span style={{fontFamily:"var(--font-serif)", fontSize:22, color:"var(--fg-muted)", width:22}}>{i + 1}.</span>
              <input
                value={(value || [])[i] || ""}
                onChange={(e) => { const arr = [...(value || [])]; arr[i] = e.target.value; onChange(arr); }}
                placeholder="…"
                style={{flex:1, padding:"14px 16px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-card)", fontSize:15, fontFamily:"var(--font-serif)", color:"var(--fg)", outline:"none"}}/>
            </div>
          ))}
        </div>
      </div>;

    case "mood":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:26, fontWeight:500, marginBottom:20}}>How are you, right now?</h2>
        <div style={{display:"flex", gap:10, justifyContent:"center"}}>
          {(block.options || ["😔","😕","😐","🙂","😄"]).map((e, i) => (
            <button key={i} onClick={() => onChange(e)}
              style={{
                width:72, height:72, borderRadius:99,
                border: value === e ? "2.5px solid var(--tempo-orange)" : "1.5px solid var(--border)",
                background: value === e ? "color-mix(in oklab, var(--tempo-orange) 10%, var(--surface-card))" : "var(--surface-card)",
                fontSize:36, cursor:"pointer",
              }}>{e}</button>
          ))}
        </div>
      </div>;

    case "subtasks":
      return <div>
        <h2 style={{fontFamily:"var(--font-serif)", fontSize:22, fontWeight:500, marginBottom:16}}>{block.parent}</h2>
        <div style={{display:"flex", flexDirection:"column", gap:8, marginLeft:16}}>
          {(block.children || []).map((c, i) => {
            const checked = (value || {})[i];
            return <label key={i} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--surface-card)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer"}}>
              <span style={{width:16, height:16, borderRadius:4, border: checked ? "none" : "1.5px solid var(--border)", background: checked ? "var(--tempo-orange)" : "transparent"}}/>
              <span style={{fontSize:14, textDecoration: checked ? "line-through" : "none", color: checked ? "var(--fg-muted)" : "var(--fg)"}}>{c}</span>
              <input type="checkbox" checked={!!checked} onChange={() => onChange({...(value||{}), [i]: !checked})} style={{display:"none"}}/>
            </label>;
          })}
        </div>
      </div>;

    default:
      return <div style={{padding:20, color:"var(--fg-muted)"}}>Unknown block type: {block.type}</div>;
  }
};

window.ScreenTemplateRun = ScreenTemplateRunV2;
Object.assign(window, { ScreenTemplateRunV2, TRBlockRunner, TR_fillVar });
