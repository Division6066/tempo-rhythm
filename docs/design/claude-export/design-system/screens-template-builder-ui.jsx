/* ============================================================
   Tempo Flow — Template Builder UI (screen)
   Uses primitives from screens-template-builder.jsx.
   ============================================================ */

const ScreenTemplateBuilderV2 = () => {
  const { setScreen } = useApp();
  const [currentId, setCurrentId] = useState(() => {
    try { return localStorage.getItem("tf-current-template") || "new"; } catch { return "new"; }
  });
  const seed = (currentId && currentId !== "new" && TB_SEEDS[currentId]) || TB_NEW_TEMPLATE();
  const [tpl, setTpl] = useState(seed);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("edit"); // "edit" | "preview"

  const update = (u) => setTpl({ ...tpl, ...u });
  const updateBlock = (id, patch) => {
    setTpl({ ...tpl, blocks: tpl.blocks.map(b => b.id === id ? { ...b, ...patch } : b) });
  };
  const removeBlock = (id) => {
    setTpl({ ...tpl, blocks: tpl.blocks.filter(b => b.id !== id) });
    if (selected === id) setSelected(null);
  };
  const duplicateBlock = (id) => {
    const idx = tpl.blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const copy = { ...tpl.blocks[idx], id: tbId() };
    const blocks = [...tpl.blocks];
    blocks.splice(idx + 1, 0, copy);
    setTpl({ ...tpl, blocks });
  };
  const addBlock = (type, extra = {}) => {
    const spec = TB_BLOCK_TYPES.find(s => s.type === type);
    if (!spec) return;
    const nb = { id: tbId(), type, ...spec.defaults, ...extra };
    setTpl({ ...tpl, blocks: [...tpl.blocks, nb] });
    setSelected(nb.id);
  };

  // Slash / =AI handler: inserts a block at the end (after whichever block was being edited)
  const handleSlashInsert = async (type, patch) => {
    if (type === "__ai__") {
      // Phase 3b: ask Claude to infer block type + fields
      try {
        const raw = await window.claude.complete({
          messages: [{
            role: "user",
            content: `You're a template block generator. Given a user's request, output STRICT JSON with keys: type, extra.\n\nValid types: heading, paragraph, checklist, subtasks, prompt, energy, rating, habit, timeblock, callout, divider, variable, coach, gratitude, mood.\n\nExtra is an object with optional overrides: text, level (1-3), items (array of strings), parent, children (array), prompt, rows, label, min, max, start, end, tone (info|tip|warning), streak, key.\n\nRequest: "${patch.aiPrompt}"\n\nRespond with only valid JSON, no prose.`
          }]
        });
        const cleaned = raw.trim().replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.type) {
          addBlock(parsed.type, parsed.extra || {});
          return;
        }
      } catch (e) {
        console.warn("AI block generation failed, falling back", e);
      }
      // Fallback: insert a paragraph with the prompt as a note
      addBlock("callout", { tone: "tip", text: `(AI would add block for: "${patch.aiPrompt}")` });
      return;
    }
    addBlock(type, patch);
  };

  const slash = useSlashMenu(handleSlashInsert);

  const { handlers, overId } = useReorderable(tpl.blocks, (blocks) => setTpl({ ...tpl, blocks }));

  const selectedBlock = tpl.blocks.find(b => b.id === selected);

  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", minHeight:0, background:"var(--surface-sunken)"}}>
      <Topbar title={tpl.title} crumb="Templates"
        right={
          <div style={{display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap"}}>
            <div className="seg-control" style={{marginRight:4, flexShrink:0}}>
              <button className={mode==="edit"?"is-active":""} onClick={() => setMode("edit")} style={{whiteSpace:"nowrap"}}>Edit</button>
              <button className={mode==="preview"?"is-active":""} onClick={() => setMode("preview")} style={{whiteSpace:"nowrap"}}>Preview</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen("templates")}>Cancel</button>
            <button className="btn btn-primary btn-sm"><I.Check size={13}/> Save</button>
          </div>
        }/>
      <div style={{display:"grid", gridTemplateColumns: mode === "preview" ? "1fr" : "240px minmax(0,1fr) 300px", flex:1, minHeight:0}}>

        {/* LEFT · Block palette */}
        {mode === "edit" && (
          <aside style={{borderRight:"1px solid var(--border)", background:"var(--surface-card)", overflowY:"auto", padding:"18px 14px"}}>
            <div className="eyebrow" style={{marginBottom:10, paddingLeft:4}}>Blocks</div>
            <div style={{fontSize:11, color:"var(--fg-subtle)", marginBottom:16, paddingLeft:4, lineHeight:1.5}}>
              Drag onto canvas, or click to append. Try <span style={{fontFamily:"var(--font-mono)", color:"var(--fg-muted)"}}>/</span> in any block.
            </div>
            {Object.entries(TB_CAT).map(([cat, types]) => (
              <div key={cat} style={{marginBottom:16}}>
                <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--fg-muted)", padding:"4px 6px", marginBottom:4}}>{cat}</div>
                {types.map(type => {
                  const spec = TB_BLOCK_TYPES.find(s => s.type === type);
                  const Ic = I[spec.icon] || I.Layers;
                  return (
                    <button key={type}
                      onClick={() => addBlock(type)}
                      draggable
                      onDragStart={(e) => {
                        try { e.dataTransfer.setData("tf/new-block", type); } catch {}
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      style={{
                        width:"100%", display:"flex", alignItems:"center", gap:10,
                        padding:"8px 10px", borderRadius:6, background:"transparent",
                        border:"1px solid transparent", cursor:"pointer", color:"var(--fg)",
                        fontSize:13, fontFamily:"var(--font-sans)", textAlign:"left",
                        marginBottom:2,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-sunken)"; e.currentTarget.style.borderColor = "var(--border-soft)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
                      <Ic size={15} stroke={1.5}/>
                      <span style={{flex:1}}>{spec.label}</span>
                      <I.Plus size={12} stroke={1.5} style={{opacity:0.4}}/>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* MIDDLE · Canvas */}
        <div style={{overflowY:"auto", padding: mode === "preview" ? "48px 24px" : "24px"}}
             onKeyDown={mode === "edit" ? slash.handlers.onKeyDown : undefined}>
          <div style={{maxWidth: 720, margin:"0 auto"}}>
            {/* Header — editable */}
            <div className="card" style={{marginBottom:20, padding:"22px 26px"}}>
              <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:10}}>
                <button
                  onClick={() => {
                    if (mode === "preview") return;
                    const i = TB_EMOJIS.indexOf(tpl.emoji);
                    update({ emoji: TB_EMOJIS[(i+1) % TB_EMOJIS.length] });
                  }}
                  style={{width:52, height:52, borderRadius:12, background:"var(--surface-sunken)", border:"1px solid var(--border)", fontSize:28, cursor: mode==="preview" ? "default" : "pointer"}}>
                  {tpl.emoji}
                </button>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--font-serif)", fontSize:26, fontWeight:500, letterSpacing:"-0.015em", outline:"none"}}
                    contentEditable={mode !== "preview"} suppressContentEditableWarning
                    onBlur={(e) => update({ title: e.currentTarget.innerText })}>
                    {tpl.title}
                  </div>
                  <div style={{fontSize:12, fontFamily:"var(--font-mono)", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2}}>
                    {tpl.cadence} · {tpl.schedule}
                  </div>
                </div>
              </div>
              <div style={{fontSize:14, color:"var(--fg-muted)", lineHeight:1.55, outline:"none"}}
                contentEditable={mode !== "preview"} suppressContentEditableWarning
                onBlur={(e) => update({ desc: e.currentTarget.innerText })}>
                {tpl.desc}
              </div>
            </div>

            {/* Blocks */}
            <div style={{display:"flex", flexDirection:"column", gap:10}}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const nt = e.dataTransfer.getData("tf/new-block");
                if (nt) { e.preventDefault(); addBlock(nt); }
              }}>
              {tpl.blocks.map((b) => {
                const spec = TB_BLOCK_TYPES.find(s => s.type === b.type);
                const Ic = I[spec?.icon || "Layers"] || I.Layers;
                const isOver = overId === b.id;
                const isSelected = selected === b.id;
                return (
                  <div key={b.id}
                    {...(mode === "edit" ? handlers(b.id) : {})}
                    onClick={() => mode === "edit" && setSelected(b.id)}
                    style={{
                      position:"relative",
                      padding:"14px 16px 14px 44px",
                      borderRadius:10,
                      background:"var(--surface-card)",
                      border: isSelected ? "1.5px solid var(--tempo-orange)" : isOver ? "1.5px dashed var(--tempo-orange)" : "1px solid var(--border)",
                      boxShadow: isSelected ? "0 0 0 3px color-mix(in oklab, var(--tempo-orange) 15%, transparent)" : "var(--shadow-whisper)",
                      transition:"border-color 120ms, box-shadow 120ms",
                    }}>
                    {mode === "edit" && (
                      <div style={{position:"absolute", left:10, top:12, display:"flex", flexDirection:"column", alignItems:"center", gap:2, color:"var(--fg-subtle)"}}>
                        <button title="Drag to reorder" style={{background:"transparent", border:"none", padding:2, cursor:"grab", color:"inherit"}}>
                          <I.GripVertical size={14}/>
                        </button>
                        <div title={spec?.label} style={{color:"var(--fg-muted)"}}>
                          <Ic size={12} stroke={1.6}/>
                        </div>
                      </div>
                    )}
                    {mode === "edit" && isSelected && (
                      <div style={{position:"absolute", right:10, top:10, display:"flex", gap:4}}>
                        <button title="Duplicate" className="icon-btn" style={{width:26, height:26}} onClick={(e) => {e.stopPropagation(); duplicateBlock(b.id);}}>
                          <I.Copy size={12}/>
                        </button>
                        <button title="Delete" className="icon-btn" style={{width:26, height:26, color:"var(--rust)"}} onClick={(e) => {e.stopPropagation(); removeBlock(b.id);}}>
                          <I.Trash size={12}/>
                        </button>
                      </div>
                    )}
                    <TBBlock b={b} onChange={(nb) => updateBlock(b.id, nb)} readOnly={mode === "preview"}/>
                  </div>
                );
              })}

              {mode === "edit" && (
                <button
                  onClick={() => addBlock("paragraph")}
                  style={{
                    marginTop:4, padding:"12px", borderRadius:10,
                    border:"1.5px dashed var(--border)", background:"transparent",
                    color:"var(--fg-muted)", fontSize:13, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>
                  <I.Plus size={14}/> Add a block — or drag one from the palette
                </button>
              )}

              {mode === "preview" && (
                <div style={{marginTop:20, padding:"14px 18px", background:"var(--surface-card)", borderRadius:10, border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12}}>
                  <I.Eye size={15} stroke={1.6}/>
                  <div style={{fontSize:13, color:"var(--fg-muted)", flex:1}}>
                    This is how the template looks when it runs for a date. Variables fill in, the coach prompts pull from your history.
                  </div>
                  <button className="btn btn-sm btn-primary"><I.Play size={12}/> Run now</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT · Inspector */}
        {mode === "edit" && (
          <aside style={{borderLeft:"1px solid var(--border)", background:"var(--surface-card)", overflowY:"auto", padding:"20px 18px"}}>
            {!selectedBlock ? (
              <>
                <div className="eyebrow" style={{marginBottom:10}}>Template</div>
                <div style={{display:"flex", flexDirection:"column", gap:14}}>
                  <div className="field"><label>Cadence</label>
                    <div className="seg-control" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
                      {["Daily","Weekly","Monthly"].map(c => (
                        <button key={c} className={tpl.cadence===c?"is-active":""} onClick={() => update({cadence:c})}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field"><label>Schedule</label>
                    <input value={tpl.schedule} onChange={(e) => update({schedule: e.target.value})}/>
                    <div style={{fontSize:11, color:"var(--fg-subtle)", marginTop:4}}>e.g. "Every Friday · 4pm", "First of month", "Ad-hoc".</div>
                  </div>
                  <div className="field"><label>Fills into</label>
                    <div className="seg-control" style={{gridTemplateColumns:"repeat(2, 1fr)"}}>
                      <button className="is-active">Daily note</button>
                      <button>Journal</button>
                    </div>
                  </div>
                  <div className="field"><label>Cover emoji</label>
                    <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                      {TB_EMOJIS.slice(0,12).map(e => (
                        <button key={e} onClick={() => update({emoji:e})}
                          style={{width:34, height:34, borderRadius:8, border: tpl.emoji===e ? "2px solid var(--tempo-orange)" : "1px solid var(--border)", background: tpl.emoji===e ? "var(--surface-sunken)" : "var(--surface-card)", fontSize:18, cursor:"pointer"}}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginTop:8, padding:12, background:"var(--surface-sunken)", borderRadius:8, fontSize:12, color:"var(--fg-muted)", lineHeight:1.55}}>
                    <div style={{fontWeight:500, color:"var(--fg)", marginBottom:4}}>Click a block</div>
                    to edit its settings — labels, ranges, whether the coach auto-fills it, etc.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
                  <div className="eyebrow">Block · {TB_BLOCK_TYPES.find(s => s.type === selectedBlock.type)?.label}</div>
                  <button className="icon-btn" onClick={() => setSelected(null)} style={{width:24, height:24}}><I.X size={12}/></button>
                </div>
                <BlockInspector b={selectedBlock} onChange={(patch) => updateBlock(selectedBlock.id, patch)}/>
              </>
            )}
          </aside>
        )}
      </div>
      <SlashMenu {...slash}/>
    </div>
  );
};

/* ---------- Per-block inspector ---------- */
const BlockInspector = ({ b, onChange }) => {
  const commonLabel = b.label !== undefined && (
    <div className="field"><label>Label</label>
      <input value={b.label || ""} onChange={(e) => onChange({label: e.target.value})}/>
    </div>
  );
  switch (b.type) {
    case "heading":
      return <div className="stack-3">
        <div className="field"><label>Text</label><input value={b.text} onChange={(e) => onChange({text: e.target.value})}/></div>
        <div className="field"><label>Level</label>
          <div className="seg-control">
            {[1,2,3].map(l => <button key={l} className={b.level===l?"is-active":""} onClick={() => onChange({level:l})}>H{l}</button>)}
          </div>
        </div>
      </div>;
    case "paragraph":
      return <div className="field"><label>Text</label>
        <textarea value={b.text} onChange={(e) => onChange({text: e.target.value})} rows={5}
          style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"var(--font-sans)", fontSize:13.5, resize:"vertical", background:"var(--surface-card)", color:"var(--fg)"}}/>
      </div>;
    case "checklist":
      return <div className="stack-3">
        <div style={{fontSize:12, color:"var(--fg-muted)", marginBottom:4}}>{b.items?.length || 0} items · edit inline on canvas</div>
        <button className="btn btn-sm btn-outline" onClick={() => onChange({ items: [...(b.items||[]), "New task"] })}><I.Plus size={12}/> Add item</button>
      </div>;
    case "prompt":
      return <div className="stack-3">
        <div className="field"><label>Prompt</label><input value={b.prompt} onChange={(e) => onChange({prompt: e.target.value})}/></div>
        <div className="field"><label>Rows · {b.rows}</label>
          <input type="range" min={2} max={20} value={b.rows || 3} onChange={(e) => onChange({rows: parseInt(e.target.value, 10)})}/>
        </div>
      </div>;
    case "energy":
    case "rating":
      return <div className="stack-3">
        {commonLabel}
        <div className="field"><label>Min · Max</label>
          <div style={{display:"flex", gap:8}}>
            <input type="number" value={b.min} onChange={(e) => onChange({min: parseInt(e.target.value, 10) || 1})} style={{width:"50%"}}/>
            <input type="number" value={b.max} onChange={(e) => onChange({max: parseInt(e.target.value, 10) || 5})} style={{width:"50%"}}/>
          </div>
        </div>
      </div>;
    case "habit":
      return <div className="stack-3">
        {commonLabel}
        <div className="field"><label>Current streak</label>
          <input type="number" value={b.streak || 0} onChange={(e) => onChange({streak: parseInt(e.target.value, 10) || 0})}/>
        </div>
      </div>;
    case "timeblock":
      return <div className="stack-3">
        {commonLabel}
        <div style={{display:"flex", gap:8}}>
          <div className="field" style={{flex:1}}><label>Start</label><input value={b.start} onChange={(e) => onChange({start: e.target.value})}/></div>
          <div className="field" style={{flex:1}}><label>End</label><input value={b.end} onChange={(e) => onChange({end: e.target.value})}/></div>
        </div>
      </div>;
    case "callout":
      return <div className="stack-3">
        <div className="field"><label>Tone</label>
          <div className="seg-control">
            {["info","tip","warning"].map(t => <button key={t} className={b.tone===t?"is-active":""} onClick={() => onChange({tone:t})}>{t}</button>)}
          </div>
        </div>
        <div className="field"><label>Text</label>
          <textarea value={b.text} rows={3} onChange={(e) => onChange({text: e.target.value})}
            style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"var(--font-sans)", fontSize:13.5, resize:"vertical", background:"var(--surface-card)", color:"var(--fg)"}}/>
        </div>
      </div>;
    case "variable":
      return <div className="stack-3">
        <div className="field"><label>Key</label>
          <select value={b.key} onChange={(e) => onChange({key: e.target.value, label:`{{${e.target.value}}}`})}
            style={{width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-card)", fontFamily:"var(--font-mono)", fontSize:13}}>
            {["today","friday","monday","yesterday","week_range","last_week_wins","top_3_tasks","current_streak"].map(k => <option key={k} value={k}>{`{{${k}}}`}</option>)}
          </select>
        </div>
        <div className="field"><label>Display label</label><input value={b.label} onChange={(e) => onChange({label: e.target.value})}/></div>
      </div>;
    case "coach":
      return <div className="stack-3">
        <div className="field"><label>Prompt (what coach reflects on)</label>
          <textarea value={b.prompt} rows={3} onChange={(e) => onChange({prompt: e.target.value})}
            style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"var(--font-sans)", fontSize:13.5, resize:"vertical", background:"var(--surface-card)", color:"var(--fg)"}}/>
        </div>
        <label style={{display:"flex", alignItems:"center", gap:10, fontSize:13.5}}>
          <input type="checkbox" checked={!!b.fillsFromHistory} onChange={(e) => onChange({fillsFromHistory: e.target.checked})}/>
          Pull from last 3 weeks of activity
        </label>
      </div>;
    case "gratitude":
      return <div className="field"><label>Rows · {b.rows}</label>
        <input type="range" min={1} max={7} value={b.rows || 3} onChange={(e) => onChange({rows: parseInt(e.target.value, 10)})}/>
      </div>;
    default:
      return <div style={{fontSize:13, color:"var(--fg-muted)", lineHeight:1.5}}>No settings for this block.</div>;
  }
};

/* Replace stub with real builder */
window.ScreenTemplateBuilder = ScreenTemplateBuilderV2;
Object.assign(window, { ScreenTemplateBuilderV2, BlockInspector });
