/* Admin panel — Roomer */

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA } = React;

// ----- helpers -----
const moneyA = (n) => n ? "$" + n.toLocaleString() : "—";

function Pill({children, tone="neutral", style={}}) {
  const tones = {
    neutral: { bg:"#FBF7EE", color:"var(--ink-2)", bd:"var(--line)" },
    green:   { bg:"#EFF3EB", color:"#3F5A3F",     bd:"#D4DFCB" },
    warn:    { bg:"#FBF1DC", color:"#7A5512",     bd:"#EFDDB1" },
    accent:  { bg:"#F6E4D9", color:"#6E2F18",     bd:"#E9C8B3" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"3px 9px", borderRadius:999,
      background:t.bg, color:t.color, border:`1px solid ${t.bd}`,
      fontSize:12, ...style
    }}>{children}</span>
  );
}

// ----- Sidebar -----
function AdminSidebar({active, setActive, listing}) {
  const items = [
    {id:"listings", label:"Listings"},
    {id:"property", label:"Property"},
    {id:"qr",       label:"QR & share"},
    {id:"leads",    label:"Leads", count:0, disabled:true},
    {id:"settings", label:"Settings", disabled:true},
  ];
  return (
    <aside style={{
      width:228, flexShrink:0, background:"#1B1916", color:"#E9E1D0",
      padding:"22px 14px", display:"flex", flexDirection:"column", gap:18,
      borderRight:"1px solid #000"
    }}>
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"0 6px"}}>
        <div style={{
          width:30, height:30, borderRadius:8, background:"var(--accent)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Instrument Serif, serif", fontSize:18, color:"#FFF6EF"
        }}>R</div>
        <div>
          <div className="serif" style={{fontSize:18, lineHeight:1, color:"#FBF7EE"}}>Roomer</div>
          <div className="mono" style={{fontSize:10, opacity:0.5, letterSpacing:".1em"}}>AGENT v0.1</div>
        </div>
      </div>

      <nav style={{display:"flex", flexDirection:"column", gap:2}}>
        {items.map(it => (
          <button key={it.id} disabled={it.disabled}
            onClick={() => !it.disabled && setActive(it.id)}
            style={{
              textAlign:"left", padding:"8px 10px", borderRadius:8,
              background: active===it.id ? "#2E2A23" : "transparent",
              color: it.disabled ? "rgba(233,225,208,0.35)" : "#E9E1D0",
              border:"none", fontSize:13, cursor: it.disabled ? "default":"pointer",
              display:"flex", alignItems:"center", justifyContent:"space-between"
            }}>
            <span>{it.label}</span>
            {it.disabled && <span className="mono" style={{fontSize:9, opacity:0.5}}>SOON</span>}
          </button>
        ))}
      </nav>

      <div style={{marginTop:"auto", padding:"12px", borderRadius:10, background:"#2E2A23", fontSize:12, lineHeight:1.4}}>
        <div className="serif" style={{fontSize:15, color:"#FBF7EE", marginBottom:4}}>Weekend test</div>
        <div style={{color:"rgba(233,225,208,0.65)"}}>
          One listing. Skip the database. Print the QR, tape it to the door.
        </div>
      </div>
    </aside>
  );
}

// ----- Listings view -----
function ListingsView({listing, openProperty}) {
  return (
    <div style={{padding:"28px 32px"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18}}>
        <div>
          <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".1em"}}>WORKSPACE</div>
          <h1 className="serif" style={{fontSize:32, margin:"4px 0 0"}}>Listings</h1>
        </div>
        <button className="btn primary">+ New listing</button>
      </div>

      <div style={{
        background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden"
      }}>
        <div style={{
          display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
          padding:"12px 16px", borderBottom:"1px solid var(--line)",
          fontSize:11, color:"var(--muted)", letterSpacing:".08em", textTransform:"uppercase"
        }} className="mono">
          <div>Address</div><div>Status</div><div>Rooms</div><div>Agent</div><div/>
        </div>

        <button onClick={openProperty} style={{
          display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
          width:"100%", padding:"16px", border:"none", background:"transparent",
          textAlign:"left", alignItems:"center", borderBottom:"1px solid var(--line)"
        }}>
          <div>
            <div className="serif" style={{fontSize:18}}>{listing.address.line1}</div>
            <div style={{fontSize:12, color:"var(--muted)"}}>
              {listing.address.city}, {listing.address.state} {listing.address.zip} · {moneyA(listing.price)}
            </div>
          </div>
          <div><Pill tone="green"><span className="dot green"/> Active</Pill></div>
          <div style={{fontSize:13}}>
            {listing.floors.reduce((s,f)=>s+f.rooms.length,0)} rooms
            <div style={{fontSize:11, color:"var(--muted)"}}>{listing.floors.length} floors</div>
          </div>
          <div style={{fontSize:13}}>{listing.agent.name}</div>
          <div style={{color:"var(--muted)"}}>›</div>
        </button>

        <div style={{padding:16, color:"var(--muted)", fontSize:13, fontStyle:"italic"}}>
          No other listings yet. You're testing with one this weekend — that's the right call.
        </div>
      </div>
    </div>
  );
}

// ----- Property editor -----
function PropertyView({listing, setListing, openRoom, gotoQR}) {
  const [activeFloor, setActiveFloor] = useStateA(listing.floors[0].id);
  const floor = listing.floors.find(f => f.id === activeFloor);
  const totalRooms = listing.floors.reduce((s,f)=>s+f.rooms.length,0);
  const incomplete = listing.floors.flatMap(f=>f.rooms).filter(r=>!r.complete).length;

  const updateField = (key, val) => {
    setListing({...listing, [key]: val});
  };

  return (
    <div style={{padding:"28px 32px 60px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, color:"var(--muted)", fontSize:12, marginBottom:8}} className="mono">
        LISTINGS · <span style={{color:"var(--ink-2)"}}>120 SUMMER AVE</span>
      </div>
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, gap:24}}>
        <div style={{flex:1}}>
          <h1 className="serif" style={{fontSize:38, margin:"0 0 6px", letterSpacing:"-0.02em"}}>
            {listing.address.line1}
          </h1>
          <div style={{color:"var(--muted)", fontSize:14}}>
            {listing.address.city}, {listing.address.state} {listing.address.zip}
          </div>
          <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
            <Pill tone="green"><span className="dot green"/> Active</Pill>
            {incomplete > 0 && <Pill tone="warn">⚠ {incomplete} rooms need details</Pill>}
            <Pill>roomer.app/p/{listing.id}</Pill>
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn">Preview</button>
          <button className="btn primary" onClick={gotoQR}>Generate QR</button>
        </div>
      </div>

      {/* TWO COLUMNS: form + rooms */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1.1fr", gap:20}}>
        {/* LEFT: basics */}
        <section style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:20}}>
          <h3 className="serif" style={{fontSize:20, margin:"0 0 14px"}}>Listing details</h3>

          <Field label="Headline">
            <input style={inp} value={listing.headline} onChange={e=>updateField("headline", e.target.value)}/>
          </Field>

          <Field label="Blurb (shown under hero)">
            <textarea style={{...inp, minHeight:80, resize:"vertical"}} value={listing.blurb}
              onChange={e=>updateField("blurb", e.target.value)}/>
          </Field>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <Field label="Price">
              <input style={inp} type="number" value={listing.price ?? ""}
                onChange={e=>updateField("price", parseInt(e.target.value)||0)}/>
            </Field>
            <Field label="Year built">
              <input style={inp} type="number" value={listing.yearBuilt}
                onChange={e=>updateField("yearBuilt", parseInt(e.target.value)||0)}/>
            </Field>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10}}>
            <Field label="Beds"><input style={inp} type="number" value={listing.beds} onChange={e=>updateField("beds", +e.target.value)}/></Field>
            <Field label="Full baths"><input style={inp} type="number" value={listing.baths} onChange={e=>updateField("baths", +e.target.value)}/></Field>
            <Field label="½ baths"><input style={inp} type="number" value={listing.halfBaths} onChange={e=>updateField("halfBaths", +e.target.value)}/></Field>
            <Field label="Sqft"><input style={inp} type="number" value={listing.sqft} onChange={e=>updateField("sqft", +e.target.value)}/></Field>
          </div>

          <Field label="Agent">
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <input style={inp} placeholder="Name" value={listing.agent.name} onChange={e=>updateField("agent", {...listing.agent, name:e.target.value})}/>
              <input style={inp} placeholder="Phone" value={listing.agent.phone} onChange={e=>updateField("agent", {...listing.agent, phone:e.target.value})}/>
            </div>
          </Field>

          <Field label="Hero photo">
            <PhotoUploader photos={listing.heroPhoto ? [listing.heroPhoto] : []} max={1}
              onChange={(arr)=>updateField("heroPhoto", arr[0]||null)}/>
          </Field>
        </section>

        {/* RIGHT: rooms */}
        <section style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:20}}>
          <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between"}}>
            <h3 className="serif" style={{fontSize:20, margin:0}}>Rooms</h3>
            <span className="mono" style={{fontSize:11, color:"var(--muted)"}}>{totalRooms} total</span>
          </div>

          {/* floor tabs */}
          <div style={{display:"flex", gap:6, margin:"14px 0", borderBottom:"1px solid var(--line)"}}>
            {listing.floors.map(f => (
              <button key={f.id} onClick={()=>setActiveFloor(f.id)} style={{
                padding:"8px 12px", border:"none", background:"transparent",
                borderBottom: activeFloor===f.id ? "2px solid var(--ink)" : "2px solid transparent",
                fontSize:13, fontWeight: activeFloor===f.id ? 600 : 400, marginBottom:-1, cursor:"pointer"
              }}>{f.name}</button>
            ))}
            <button style={{
              marginLeft:"auto", padding:"6px 10px", border:"1px dashed var(--line-2)",
              borderRadius:8, background:"transparent", fontSize:12, color:"var(--muted)"
            }}>+ Floor</button>
          </div>

          {/* rooms list */}
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {floor.rooms.map((room, i) => (
              <button key={room.id} onClick={()=>openRoom(floor.id, room.id)} style={{
                display:"grid", gridTemplateColumns:"24px 1fr auto auto",
                gap:10, alignItems:"center", padding:"10px 12px",
                background: room.complete ? "var(--paper)" : "#FBF1DC22",
                border:"1px solid var(--line)", borderRadius:10,
                textAlign:"left", cursor:"pointer"
              }}>
                <span className="mono" style={{fontSize:10, color:"var(--muted)"}}>{(i+1).toString().padStart(2,"0")}</span>
                <div>
                  <div style={{fontSize:14, fontWeight:500}}>{room.name}</div>
                  <div style={{fontSize:11, color:"var(--muted)"}}>
                    {room.sqft ? room.sqft+" sqft · " : ""}
                    {room.photos.length} photo{room.photos.length===1?"":"s"}
                    {room.highlights.length>0 && " · "+room.highlights.length+" highlights"}
                  </div>
                </div>
                <div>
                  {!room.description && <Pill tone="warn">no description</Pill>}
                  {room.description && room.photos.length===0 && <Pill tone="warn">no photos</Pill>}
                  {room.complete && room.description && <Pill tone="green">ready</Pill>}
                </div>
                <span style={{color:"var(--muted)"}}>›</span>
              </button>
            ))}
            <button style={{
              padding:"10px 12px", border:"1px dashed var(--line-2)", borderRadius:10,
              background:"transparent", fontSize:13, color:"var(--muted)", textAlign:"left"
            }}>+ Add room to {floor.name}</button>
          </div>

          {/* highlights bar */}
          <div style={{marginTop:18, borderTop:"1px solid var(--line)", paddingTop:14}}>
            <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", marginBottom:8}}>PROPERTY HIGHLIGHTS</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {listing.highlights.map(h => (
                <Pill key={h} tone="accent">{h} ×</Pill>
              ))}
              <span style={{
                padding:"3px 9px", border:"1px dashed var(--line-2)",
                borderRadius:999, fontSize:12, color:"var(--muted)"
              }}>+ Add</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const inp = {
  width:"100%", padding:"9px 11px", borderRadius:8,
  border:"1px solid var(--line-2)", background:"#FBF7EE",
  fontSize:14, outline:"none", marginBottom:12
};

function Field({label, children}) {
  return (
    <label style={{display:"block", fontSize:12, color:"var(--muted)", marginBottom:2}}>
      <div className="mono" style={{letterSpacing:".05em", marginBottom:4, color:"var(--muted)", fontSize:11, textTransform:"uppercase"}}>{label}</div>
      {children}
    </label>
  );
}

// ----- Photo uploader -----
function PhotoUploader({photos, onChange, max=5}) {
  const inputRef = useRefA(null);
  const add = (files) => {
    const remaining = max - photos.length;
    const slice = Array.from(files).slice(0, remaining);
    Promise.all(slice.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }))).then(urls => onChange([...photos, ...urls]));
  };
  const remove = (i) => onChange(photos.filter((_,j)=>j!==i));

  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
        {photos.map((p,i) => (
          <div key={i} style={{position:"relative", aspectRatio:"1/1", borderRadius:10, overflow:"hidden", border:"1px solid var(--line)"}}>
            <img src={p} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
            <button onClick={()=>remove(i)} style={{
              position:"absolute", top:4, right:4, width:22, height:22,
              borderRadius:999, border:"none", background:"rgba(0,0,0,0.55)", color:"#FFF",
              fontSize:12, cursor:"pointer"
            }}>×</button>
          </div>
        ))}
        {photos.length < max && (
          <button onClick={()=>inputRef.current?.click()} className="placeholder-stripes" style={{
            aspectRatio:"1/1", borderRadius:10, border:"1px dashed var(--line-2)",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            background:"#FBF7EE", color:"var(--muted)", fontSize:11, gap:4
          }}>
            <div style={{fontSize:20, lineHeight:1}}>+</div>
            <div className="mono" style={{fontSize:9, letterSpacing:".1em"}}>UPLOAD</div>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple
        style={{display:"none"}} onChange={e=>add(e.target.files)}/>
      <div style={{marginTop:6, fontSize:11, color:"var(--muted)"}}>
        {photos.length} / {max} · drag in or click +
      </div>
    </div>
  );
}

// ----- Room editor (modal) -----
function RoomEditor({listing, setListing, floorId, roomId, onClose}) {
  const floor = listing.floors.find(f => f.id === floorId);
  const room  = floor.rooms.find(r => r.id === roomId);
  const [draft, setDraft] = useStateA(room);

  useEffectA(() => { setDraft(floor.rooms.find(r=>r.id===roomId)); }, [floorId, roomId]);

  const save = () => {
    const next = JSON.parse(JSON.stringify(listing));
    const f = next.floors.find(x=>x.id===floorId);
    const idx = f.rooms.findIndex(r=>r.id===roomId);
    const complete = !!(draft.description && draft.description.length > 4);
    f.rooms[idx] = {...draft, complete};
    setListing(next);
    onClose();
  };

  const [hlInput, setHlInput] = useStateA("");
  const addHighlight = () => {
    if(!hlInput.trim()) return;
    setDraft({...draft, highlights:[...draft.highlights, hlInput.trim()]});
    setHlInput("");
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(27,25,22,0.45)", zIndex:50,
      display:"flex", alignItems:"center", justifyContent:"center", padding:30
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"min(720px, 96%)", maxHeight:"90vh", overflowY:"auto",
        background:"var(--paper)", borderRadius:16, border:"1px solid var(--line-2)",
        boxShadow:"0 30px 80px rgba(0,0,0,0.25)"
      }}>
        <div style={{padding:"18px 22px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".08em"}}>{floor.name.toUpperCase()}</div>
            <input className="serif"
              value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})}
              style={{fontSize:26, border:"none", background:"transparent", outline:"none", letterSpacing:"-0.01em", padding:0, marginTop:2, width:"100%"}}/>
          </div>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>

        <div style={{padding:22, display:"grid", gridTemplateColumns:"1fr 1fr", gap:18}}>
          <Field label="Square feet (optional)">
            <input style={inp} type="number" value={draft.sqft ?? ""}
              onChange={e=>setDraft({...draft, sqft: e.target.value ? +e.target.value : null})}/>
          </Field>
          <Field label="Status">
            <div style={{display:"flex", gap:8, alignItems:"center", paddingTop:6}}>
              {draft.description && draft.description.length > 4
                ? <Pill tone="green">ready to publish</Pill>
                : <Pill tone="warn">needs description</Pill>}
            </div>
          </Field>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Highlights (chips)">
              <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:6}}>
                {draft.highlights.map((h,i) => (
                  <span key={i} className="tag" style={{cursor:"pointer"}}
                    onClick={()=>setDraft({...draft, highlights: draft.highlights.filter((_,j)=>j!==i)})}>
                    {h} <span style={{opacity:0.5, marginLeft:2}}>×</span>
                  </span>
                ))}
              </div>
              <div style={{display:"flex", gap:8}}>
                <input style={inp} placeholder="e.g. Mantled fireplace" value={hlInput}
                  onChange={e=>setHlInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter" && (e.preventDefault(), addHighlight())}/>
                <button className="btn" onClick={addHighlight} style={{marginBottom:12, flexShrink:0}}>Add</button>
              </div>
            </Field>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Description (what to say about this room)">
              <textarea style={{...inp, minHeight:120, resize:"vertical"}} value={draft.description}
                placeholder="A sentence or two — what catches the eye, what's been updated, the story buyers should know."
                onChange={e=>setDraft({...draft, description: e.target.value})}/>
            </Field>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Photos (up to 5)">
              <PhotoUploader photos={draft.photos} max={5}
                onChange={(arr)=>setDraft({...draft, photos: arr})}/>
            </Field>
          </div>
        </div>

        <div style={{padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", justifyContent:"space-between", gap:10}}>
          <button className="btn ghost" style={{color:"#9B4A3A"}}>Delete room</button>
          <div style={{display:"flex", gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={save}>Save room</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- QR view -----
function QRView({listing}) {
  const url = `https://roomer.app/p/${listing.id}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=400x400&margin=10&qzone=1&format=svg`;
  return (
    <div style={{padding:"28px 32px"}}>
      <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".1em"}}>SHARE</div>
      <h1 className="serif" style={{fontSize:32, margin:"4px 0 6px"}}>QR & share</h1>
      <p style={{color:"var(--muted)", margin:"0 0 22px", fontSize:14}}>
        Print and tape to the front door Saturday morning.
      </p>

      <div style={{display:"grid", gridTemplateColumns:"360px 1fr", gap:22}}>
        <div style={{
          background:"var(--card)", border:"1px solid var(--line)", borderRadius:14,
          padding:22, textAlign:"center"
        }}>
          <div style={{
            background:"#FFF", padding:14, borderRadius:10, border:"1px solid var(--line)",
            display:"inline-block"
          }}>
            <img src={qrSrc} alt="QR code" style={{width:260, height:260, display:"block"}}/>
          </div>
          <div className="serif" style={{fontSize:20, marginTop:14}}>120 Summer Avenue</div>
          <div className="mono" style={{fontSize:11, color:"var(--muted)", marginTop:2}}>{url.replace("https://","")}</div>
          <div style={{display:"flex", gap:8, marginTop:14, justifyContent:"center"}}>
            <button className="btn">Download PNG</button>
            <button className="btn primary">Print sheet</button>
          </div>
        </div>

        <div style={{
          background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:22
        }}>
          <h3 className="serif" style={{fontSize:20, margin:"0 0 10px"}}>Saturday checklist</h3>
          <ol style={{paddingLeft:18, margin:0, lineHeight:1.7, fontSize:14, color:"var(--ink-2)"}}>
            <li>Walk every room — confirm each description matches.</li>
            <li>Add one photo per room (kitchen especially).</li>
            <li>Print this QR on a half-sheet with the address.</li>
            <li>Tape to front door + place a stack on the kitchen counter.</li>
            <li>After: ask 3 buyers if they actually used it.</li>
          </ol>

          <div style={{borderTop:"1px solid var(--line)", marginTop:18, paddingTop:14}}>
            <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".08em", marginBottom:6}}>SHARE LINK</div>
            <div style={{display:"flex", gap:8}}>
              <input style={inp} readOnly value={url}/>
              <button className="btn" style={{marginBottom:12, flexShrink:0}}>Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Admin root -----
function AdminApp({listing, setListing}) {
  const [active, setActive] = useStateA("property");
  const [editing, setEditing] = useStateA(null); // {floorId, roomId} | null

  return (
    <div style={{display:"flex", height:"100%", background:"var(--paper)", overflow:"hidden", borderRadius:0}}>
      <AdminSidebar active={active} setActive={setActive} listing={listing}/>
      <main style={{flex:1, overflowY:"auto"}}>
        {active==="listings" && <ListingsView listing={listing} openProperty={()=>setActive("property")}/>}
        {active==="property" && <PropertyView listing={listing} setListing={setListing}
          openRoom={(fId,rId)=>setEditing({floorId:fId, roomId:rId})}
          gotoQR={()=>setActive("qr")}/>}
        {active==="qr" && <QRView listing={listing}/>}
      </main>
      {editing && <RoomEditor listing={listing} setListing={setListing}
        floorId={editing.floorId} roomId={editing.roomId}
        onClose={()=>setEditing(null)}/>}
    </div>
  );
}

Object.assign(window, { AdminApp });
