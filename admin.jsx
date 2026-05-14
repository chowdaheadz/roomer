/* Admin panel — Roomer */

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ----- helpers -----
const moneyA = (n) => n ? "$" + n.toLocaleString() : "—";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function createBlankListing({ line1, city, state, zip, agentName, agentPhone, price, beds, baths }) {
  const id = slugify(`${line1}-${city}-${state}`);
  return {
    id,
    status: "draft",
    agent: { name: agentName || "", phone: agentPhone || "", email: "", brokerage: "" },
    address: { line1: line1.trim(), city: city.trim(), state: state.trim(), zip: (zip || "").trim() },
    headline: "",
    blurb: "",
    price: price ? parseInt(price) || null : null,
    beds:  beds  ? parseInt(beds)  || null : null,
    baths: baths ? parseInt(baths) || null : null,
    halfBaths: 0,
    sqft: null, lotSqft: null, yearBuilt: null,
    heroPhoto: null,
    highlights: [],
    floors: [{ id: "first", name: "First Floor", rooms: [] }],
  };
}

// ----- Pill -----
function Pill({children, tone="neutral", style={}, ...props}) {
  const tones = {
    neutral: { bg:"#FBF7EE", color:"var(--ink-2)", bd:"var(--line)" },
    green:   { bg:"#EFF3EB", color:"#3F5A3F",     bd:"#D4DFCB" },
    warn:    { bg:"#FBF1DC", color:"#7A5512",     bd:"#EFDDB1" },
    accent:  { bg:"#F6E4D9", color:"#6E2F18",     bd:"#E9C8B3" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6, padding:"3px 9px",
      borderRadius:999, background:t.bg, color:t.color, border:`1px solid ${t.bd}`,
      fontSize:12, ...style
    }} {...props}>{children}</span>
  );
}

// ----- Sidebar -----
function AdminSidebar({view, setView, listing, onBack}) {
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
          <div className="mono" style={{fontSize:10, opacity:0.5, letterSpacing:".1em"}}>AGENT v0.2</div>
        </div>
      </div>

      {listing ? (
        <>
          <button onClick={onBack} style={{
            display:"flex", alignItems:"center", gap:6, padding:"7px 10px",
            borderRadius:8, border:"1px solid #3A352D", background:"transparent",
            color:"rgba(233,225,208,0.7)", fontSize:12, cursor:"pointer", textAlign:"left"
          }}>← All listings</button>
          <div style={{padding:"0 6px", borderLeft:"2px solid #3A352D"}}>
            <div style={{fontSize:13, fontWeight:500, color:"#FBF7EE", marginBottom:2}}>
              {listing.address.line1}
            </div>
            <div style={{fontSize:11, color:"rgba(233,225,208,0.45)"}}>
              {listing.address.city}, {listing.address.state}
            </div>
          </div>
          <nav style={{display:"flex", flexDirection:"column", gap:2}}>
            {[{id:"property",label:"Property"},{id:"qr",label:"QR & share"}].map(it => (
              <button key={it.id} onClick={() => setView(it.id)} style={{
                textAlign:"left", padding:"8px 10px", borderRadius:8,
                background: view===it.id ? "#2E2A23" : "transparent",
                color:"#E9E1D0", border:"none", fontSize:13, cursor:"pointer",
              }}>{it.label}</button>
            ))}
          </nav>
        </>
      ) : (
        <nav style={{display:"flex", flexDirection:"column", gap:2}}>
          <button style={{
            textAlign:"left", padding:"8px 10px", borderRadius:8,
            background:"#2E2A23", color:"#E9E1D0", border:"none", fontSize:13
          }}>Listings</button>
        </nav>
      )}

      <div style={{marginTop:"auto", padding:"12px", borderRadius:10, background:"#2E2A23", fontSize:12, lineHeight:1.5}}>
        {listing ? (
          <>
            <div className="mono" style={{fontSize:9, opacity:0.5, letterSpacing:".1em", marginBottom:4}}>LISTING ID</div>
            <div style={{color:"rgba(233,225,208,0.55)", wordBreak:"break-all", fontSize:11}}>{listing.id}</div>
          </>
        ) : (
          <>
            <div className="serif" style={{fontSize:15, color:"#FBF7EE", marginBottom:4}}>Multi-listing</div>
            <div style={{color:"rgba(233,225,208,0.55)"}}>Manage multiple open houses from one place.</div>
          </>
        )}
      </div>
    </aside>
  );
}

// ----- New listing modal -----
function NewListingModal({onClose, onCreate}) {
  const [form, setFormA] = useStateA({
    line1:"", city:"", state:"MA", zip:"",
    agentName:"", agentPhone:"", price:"", beds:"", baths:"",
  });
  const [busy, setBusy] = useStateA(false);
  const [error, setError] = useStateA(null);

  const set = (key, val) => setFormA(f => ({...f, [key]: val}));

  const submit = async () => {
    if (!form.line1.trim() || !form.city.trim()) {
      setError("Street address and city are required.");
      return;
    }
    setBusy(true); setError(null);
    try {
      const listing = createBlankListing(form);
      const r = await fetch("/api/listings", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(listing),
      });
      if (!r.ok) throw new Error(((await r.json().catch(()=>({}))).error) || `HTTP ${r.status}`);
      onCreate(listing);
      onClose();
    } catch(e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(27,25,22,0.5)", zIndex:50,
      display:"flex", alignItems:"center", justifyContent:"center", padding:30
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"min(560px,96%)", background:"var(--paper)", borderRadius:16,
        border:"1px solid var(--line-2)", boxShadow:"0 30px 80px rgba(0,0,0,0.25)"
      }}>
        <div style={{padding:"18px 22px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 className="serif" style={{fontSize:24, margin:0}}>New listing</h2>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>

        <div style={{padding:22}}>
          {error && (
            <div style={{padding:"10px 14px", borderRadius:8, background:"#FBF1DC", border:"1px solid #EFDDB1", color:"#7A5512", fontSize:13, marginBottom:16}}>
              {error}
            </div>
          )}

          <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", marginBottom:10}}>ADDRESS</div>
          <Field label="Street address *">
            <input style={inp} placeholder="120 Summer Avenue" value={form.line1}
              onChange={e=>set("line1",e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </Field>
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10}}>
            <Field label="City *">
              <input style={inp} placeholder="Reading" value={form.city} onChange={e=>set("city",e.target.value)}/>
            </Field>
            <Field label="State">
              <input style={inp} placeholder="MA" value={form.state} onChange={e=>set("state",e.target.value)}/>
            </Field>
            <Field label="Zip">
              <input style={inp} placeholder="01867" value={form.zip} onChange={e=>set("zip",e.target.value)}/>
            </Field>
          </div>

          <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", margin:"4px 0 10px"}}>DETAILS <span style={{opacity:.5}}>(optional)</span></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
            <Field label="List price"><input style={inp} type="number" placeholder="899000" value={form.price} onChange={e=>set("price",e.target.value)}/></Field>
            <Field label="Beds"><input style={inp} type="number" placeholder="3" value={form.beds} onChange={e=>set("beds",e.target.value)}/></Field>
            <Field label="Baths"><input style={inp} type="number" placeholder="2" value={form.baths} onChange={e=>set("baths",e.target.value)}/></Field>
          </div>

          <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", margin:"4px 0 10px"}}>AGENT <span style={{opacity:.5}}>(optional)</span></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <Field label="Agent name"><input style={inp} placeholder="Jane Smith" value={form.agentName} onChange={e=>set("agentName",e.target.value)}/></Field>
            <Field label="Agent phone"><input style={inp} placeholder="(555) 000-0000" value={form.agentPhone} onChange={e=>set("agentPhone",e.target.value)}/></Field>
          </div>
        </div>

        <div style={{padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", justifyContent:"flex-end", gap:10}}>
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Create listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Listings view -----
function ListingsView({onEdit}) {
  const [listings, setListings] = useStateA(null);
  const [error, setError] = useStateA(null);
  const [showNew, setShowNew] = useStateA(false);
  const [deleting, setDeleting] = useStateA(null);
  const [migrateData, setMigrateData] = useStateA(null);
  const [migrating, setMigrating] = useStateA(false);

  const load = () => {
    setListings(null); setError(null);
    fetch("/api/listings")
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || "Failed to load")))
      .then(data => setListings(data))
      .catch(e => setError(typeof e === "string" ? e : "Could not load listings. Is Vercel Blob connected?"));
  };

  useEffectA(() => { load(); }, []);

  // Offer to migrate data from the previous single-listing localStorage format
  useEffectA(() => {
    if (listings && listings.length === 0) {
      try {
        const raw = localStorage.getItem("roomer.listing.v1");
        if (raw) setMigrateData(JSON.parse(raw));
      } catch(e) {}
    }
  }, [listings]);

  const migrate = async () => {
    if (!migrateData) return;
    setMigrating(true);
    try {
      const r = await fetch("/api/listings", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(migrateData),
      });
      if (r.ok) {
        localStorage.removeItem("roomer.listing.v1");
        setMigrateData(null);
        load();
      }
    } catch(e) {
      alert("Migration failed: " + e.message);
    } finally {
      setMigrating(false);
    }
  };

  const deleteListing = async (id) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/listing/${id}`, { method:"DELETE" });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch(e) {
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
        <div>
          <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".1em"}}>WORKSPACE</div>
          <h1 className="serif" style={{fontSize:32, margin:"4px 0 0"}}>Listings</h1>
        </div>
        <button className="btn primary" onClick={() => setShowNew(true)}>+ New listing</button>
      </div>

      {/* Migration banner */}
      {migrateData && (
        <div style={{
          background:"#FBF1DC", border:"1px solid #EFDDB1", borderRadius:12,
          padding:"16px 20px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16
        }}>
          <div>
            <div style={{fontWeight:600, color:"#7A5512", fontSize:13}}>Existing listing found in browser storage</div>
            <div style={{fontSize:12, color:"#7A5512", marginTop:2}}>
              {migrateData.address?.line1} · {migrateData.address?.city}, {migrateData.address?.state}
            </div>
          </div>
          <div style={{display:"flex", gap:8, flexShrink:0}}>
            <button className="btn" onClick={() => setMigrateData(null)} style={{fontSize:12}}>Dismiss</button>
            <button className="btn primary" onClick={migrate} disabled={migrating} style={{fontSize:12}}>
              {migrating ? "Importing…" : "Import to cloud"}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {listings === null && !error && (
        <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:"48px", textAlign:"center", color:"var(--muted)", fontSize:14}}>
          Loading…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{background:"#FBF1DC", border:"1px solid #EFDDB1", borderRadius:14, padding:"24px 28px"}}>
          <div style={{fontWeight:600, color:"#7A5512", marginBottom:6}}>Could not load listings</div>
          <div style={{fontSize:13, color:"#7A5512", marginBottom:14}}>{error}</div>
          <button className="btn" onClick={load}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {listings && listings.length === 0 && !migrateData && (
        <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:"60px 40px", textAlign:"center"}}>
          <div className="serif" style={{fontSize:26, marginBottom:8}}>No listings yet</div>
          <div style={{color:"var(--muted)", fontSize:14, marginBottom:20}}>Create your first listing to get started.</div>
          <button className="btn primary" onClick={() => setShowNew(true)}>+ New listing</button>
        </div>
      )}

      {/* Table */}
      {listings && listings.length > 0 && (
        <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden"}}>
          <div style={{
            display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
            padding:"11px 16px", borderBottom:"1px solid var(--line)",
            fontSize:11, color:"var(--muted)", letterSpacing:".08em"
          }} className="mono">
            <div>ADDRESS</div><div>STATUS</div><div>ROOMS</div><div>AGENT</div><div/>
          </div>
          {listings.map((l, i) => (
            <div key={l.id} style={{
              display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
              padding:"14px 16px", alignItems:"center",
              borderBottom: i < listings.length-1 ? "1px solid var(--line)" : "none",
            }}>
              <button onClick={() => onEdit(l.id)} style={{textAlign:"left", background:"none", border:"none", cursor:"pointer", padding:0}}>
                <div className="serif" style={{fontSize:18}}>{l.address?.line1}</div>
                <div style={{fontSize:12, color:"var(--muted)"}}>
                  {l.address?.city}, {l.address?.state}
                  {l.price ? " · " + moneyA(l.price) : ""}
                </div>
              </button>
              <div>
                {l.status === "active"
                  ? <Pill tone="green"><span className="dot green"/> Active</Pill>
                  : <Pill>Draft</Pill>}
              </div>
              <div style={{fontSize:13}}>
                {l.roomCount || 0} rooms
                <div style={{fontSize:11, color:"var(--muted)"}}>{l.floorCount || 0} floors</div>
              </div>
              <div style={{fontSize:13, color:"var(--ink-2)"}}>{l.agent?.name || "—"}</div>
              <div style={{display:"flex", gap:6}}>
                <button onClick={() => onEdit(l.id)} style={{
                  padding:"6px 12px", border:"1px solid var(--line)", borderRadius:8,
                  background:"transparent", fontSize:12, cursor:"pointer"
                }}>Edit ›</button>
                <button onClick={() => deleteListing(l.id)} disabled={deleting===l.id} title="Delete listing" style={{
                  padding:"6px 9px", border:"1px solid var(--line)", borderRadius:8,
                  background:"transparent", fontSize:12, cursor:"pointer",
                  color:"#9B4A3A", opacity: deleting===l.id ? 0.4 : 1
                }}>{deleting===l.id ? "…" : "✕"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewListingModal
          onClose={() => setShowNew(false)}
          onCreate={(listing) => {
            setListings(prev => [...(prev||[]), {
              id: listing.id, address: listing.address, status: listing.status,
              agent: {name: listing.agent?.name}, price: listing.price,
              roomCount: 0, floorCount: 1,
            }]);
            onEdit(listing.id);
          }}
        />
      )}
    </div>
  );
}

// ----- Property editor -----
function PropertyView({listing, setListing, openRoom, gotoQR, onBack}) {
  const [activeFloor, setActiveFloor] = useStateA(listing.floors[0]?.id || "first");
  const [hlInput, setHlInput] = useStateA("");

  const floor = listing.floors.find(f => f.id === activeFloor) || listing.floors[0];
  const totalRooms = listing.floors.reduce((s,f)=>s+f.rooms.length, 0);
  const incomplete = listing.floors.flatMap(f=>f.rooms).filter(r=>!r.complete).length;

  const updateField = (key, val) => setListing({...listing, [key]: val});

  const addRoom = (floorId) => {
    const id = "room-" + Date.now();
    const newRoom = { id, name:"New Room", sqft:null, highlights:[], description:"", photos:[], complete:false };
    const next = JSON.parse(JSON.stringify(listing));
    next.floors.find(f => f.id === floorId).rooms.push(newRoom);
    setListing(next);
    openRoom(floorId, id);
  };

  const addFloor = () => {
    const name = prompt("Floor name (e.g. \"Second Floor\", \"Basement\"):", "Second Floor");
    if (!name?.trim()) return;
    const id = "floor-" + Date.now();
    const next = JSON.parse(JSON.stringify(listing));
    next.floors.push({ id, name: name.trim(), rooms: [] });
    setListing(next);
    setActiveFloor(id);
  };

  const addHighlight = () => {
    if (!hlInput.trim()) return;
    updateField("highlights", [...listing.highlights, hlInput.trim()]);
    setHlInput("");
  };

  return (
    <div style={{padding:"28px 32px 60px"}}>
      <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--muted)", fontSize:12, marginBottom:10}} className="mono">
        <button onClick={onBack} style={{
          background:"none", border:"none", cursor:"pointer",
          color:"var(--muted)", fontSize:12, padding:0, fontFamily:"inherit"
        }}>← LISTINGS</button>
        <span>·</span>
        <span style={{color:"var(--ink-2)"}}>{listing.address.line1.toUpperCase()}</span>
      </div>

      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, gap:24}}>
        <div style={{flex:1}}>
          <h1 className="serif" style={{fontSize:38, margin:"0 0 6px", letterSpacing:"-0.02em"}}>
            {listing.address.line1}
          </h1>
          <div style={{color:"var(--muted)", fontSize:14}}>
            {listing.address.city}, {listing.address.state} {listing.address.zip}
          </div>
          <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap", alignItems:"center"}}>
            {["draft","active"].map(s => (
              <button key={s} onClick={() => updateField("status", s)} style={{
                padding:"4px 12px", borderRadius:999, fontSize:12, cursor:"pointer",
                border: listing.status===s ? "2px solid var(--ink)" : "1px solid var(--line)",
                background: listing.status===s ? "var(--ink)" : "transparent",
                color: listing.status===s ? "var(--paper)" : "var(--ink-2)",
                fontWeight: listing.status===s ? 600 : 400,
                textTransform:"capitalize",
              }}>{s}</button>
            ))}
            {incomplete > 0 && <Pill tone="warn">⚠ {incomplete} rooms need details</Pill>}
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <a href={`./index.html?id=${listing.id}`} target="_blank" className="btn">Preview ↗</a>
          <button className="btn primary" onClick={gotoQR}>Generate QR</button>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1.1fr", gap:20}}>
        {/* LEFT: details */}
        <section style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:20}}>
          <h3 className="serif" style={{fontSize:20, margin:"0 0 14px"}}>Listing details</h3>

          <Field label="Headline">
            <input style={inp} value={listing.headline} onChange={e=>updateField("headline",e.target.value)}/>
          </Field>
          <Field label="Blurb">
            <textarea style={{...inp, minHeight:80, resize:"vertical"}} value={listing.blurb}
              onChange={e=>updateField("blurb",e.target.value)}/>
          </Field>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <Field label="Price">
              <input style={inp} type="number" value={listing.price??""} onChange={e=>updateField("price",parseInt(e.target.value)||null)}/>
            </Field>
            <Field label="Year built">
              <input style={inp} type="number" value={listing.yearBuilt??""} onChange={e=>updateField("yearBuilt",parseInt(e.target.value)||null)}/>
            </Field>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10}}>
            <Field label="Beds"><input style={inp} type="number" value={listing.beds??""} onChange={e=>updateField("beds",+e.target.value||null)}/></Field>
            <Field label="Full baths"><input style={inp} type="number" value={listing.baths??""} onChange={e=>updateField("baths",+e.target.value||null)}/></Field>
            <Field label="½ baths"><input style={inp} type="number" value={listing.halfBaths??""} onChange={e=>updateField("halfBaths",+e.target.value||0)}/></Field>
            <Field label="Sqft"><input style={inp} type="number" value={listing.sqft??""} onChange={e=>updateField("sqft",+e.target.value||null)}/></Field>
          </div>

          <Field label="Agent">
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <input style={inp} placeholder="Name" value={listing.agent.name} onChange={e=>updateField("agent",{...listing.agent,name:e.target.value})}/>
              <input style={inp} placeholder="Phone" value={listing.agent.phone} onChange={e=>updateField("agent",{...listing.agent,phone:e.target.value})}/>
            </div>
          </Field>

          <Field label="Hero photo">
            <PhotoUploader photos={listing.heroPhoto?[listing.heroPhoto]:[]} max={1}
              onChange={(arr)=>updateField("heroPhoto",arr[0]||null)}/>
          </Field>
        </section>

        {/* RIGHT: rooms */}
        <section style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:20}}>
          <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between"}}>
            <h3 className="serif" style={{fontSize:20, margin:0}}>Rooms</h3>
            <span className="mono" style={{fontSize:11, color:"var(--muted)"}}>{totalRooms} total</span>
          </div>

          <div style={{display:"flex", gap:6, margin:"14px 0", borderBottom:"1px solid var(--line)"}}>
            {listing.floors.map(f => (
              <button key={f.id} onClick={()=>setActiveFloor(f.id)} style={{
                padding:"8px 12px", border:"none", background:"transparent",
                borderBottom: activeFloor===f.id ? "2px solid var(--ink)" : "2px solid transparent",
                fontSize:13, fontWeight: activeFloor===f.id ? 600 : 400, marginBottom:-1, cursor:"pointer"
              }}>{f.name}</button>
            ))}
            <button onClick={addFloor} style={{
              marginLeft:"auto", padding:"6px 10px", border:"1px dashed var(--line-2)",
              borderRadius:8, background:"transparent", fontSize:12, color:"var(--muted)"
            }}>+ Floor</button>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {floor?.rooms.map((room, i) => (
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
            <button onClick={() => addRoom(floor?.id)} style={{
              padding:"10px 12px", border:"1px dashed var(--line-2)", borderRadius:10,
              background:"transparent", fontSize:13, color:"var(--muted)", textAlign:"left"
            }}>+ Add room to {floor?.name}</button>
          </div>

          <div style={{marginTop:18, borderTop:"1px solid var(--line)", paddingTop:14}}>
            <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", marginBottom:8}}>PROPERTY HIGHLIGHTS</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:8}}>
              {listing.highlights.map((h, i) => (
                <Pill key={i} tone="accent" style={{cursor:"pointer"}}
                  onClick={() => updateField("highlights", listing.highlights.filter((_,j)=>j!==i))}>
                  {h} <span style={{opacity:0.5, marginLeft:2}}>×</span>
                </Pill>
              ))}
            </div>
            <div style={{display:"flex", gap:8}}>
              <input style={{...inp, marginBottom:0, fontSize:12, padding:"7px 10px"}}
                placeholder="e.g. Mantled fireplace" value={hlInput}
                onChange={e=>setHlInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addHighlight())}/>
              <button className="btn" onClick={addHighlight} style={{flexShrink:0, padding:"7px 12px", fontSize:12}}>Add</button>
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
  fontSize:14, outline:"none", marginBottom:12,
  boxSizing:"border-box",
};

function Field({label, children}) {
  return (
    <label style={{display:"block", marginBottom:2}}>
      <div className="mono" style={{letterSpacing:".05em", marginBottom:4, color:"var(--muted)", fontSize:11, textTransform:"uppercase"}}>{label}</div>
      {children}
    </label>
  );
}

// ----- Photo uploader -----
async function compressImage(file, maxEdge=1200, quality=0.7) {
  const dataURL = await new Promise((res,rej) => {
    const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file);
  });
  const img = await new Promise((res,rej) => {
    const i = new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=dataURL;
  });
  let {width:w, height:h} = img;
  if (Math.max(w,h) > maxEdge) { const s=maxEdge/Math.max(w,h); w=Math.round(w*s); h=Math.round(h*s); }
  const canvas = document.createElement("canvas");
  canvas.width=w; canvas.height=h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function PhotoUploader({photos, onChange, max=5}) {
  const inputRef = useRefA(null);
  const [busy, setBusy] = useStateA(false);
  const [urlInput, setUrlInput] = useStateA("");

  const add = async (files) => {
    const slice = Array.from(files).slice(0, max - photos.length);
    setBusy(true);
    try {
      const compressed = await Promise.all(slice.map(f => compressImage(f).catch(()=>null)));
      onChange([...photos, ...compressed.filter(Boolean)]);
    } finally { setBusy(false); }
  };
  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) { alert("URL must start with http:// or https://"); return; }
    if (photos.length >= max) return;
    onChange([...photos, u]);
    setUrlInput("");
  };
  const remove = (i) => onChange(photos.filter((_,j)=>j!==i));
  const isData = (p) => typeof p === "string" && p.startsWith("data:");
  const totalKB = Math.round(photos.filter(isData).reduce((s,p)=>s+(p?.length||0),0)*0.75/1024);
  const urlCount = photos.filter(p=>!isData(p)).length;

  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
        {photos.map((p,i) => (
          <div key={i} style={{position:"relative", aspectRatio:"1/1", borderRadius:10, overflow:"hidden", border:"1px solid var(--line)"}}>
            <img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.style.display="none"}}/>
            {!isData(p) && (
              <span style={{position:"absolute",left:4,top:4,padding:"2px 6px",borderRadius:4,
                background:"rgba(0,0,0,0.55)",color:"#FFF",fontSize:9,
                fontFamily:"JetBrains Mono,monospace",letterSpacing:".06em"}}>URL</span>
            )}
            <button onClick={()=>remove(i)} style={{
              position:"absolute",top:4,right:4,width:22,height:22,
              borderRadius:999,border:"none",background:"rgba(0,0,0,0.55)",color:"#FFF",
              fontSize:12,cursor:"pointer"
            }}>×</button>
          </div>
        ))}
        {photos.length < max && (
          <button onClick={()=>inputRef.current?.click()} disabled={busy}
            className="placeholder-stripes" style={{
              aspectRatio:"1/1",borderRadius:10,border:"1px dashed var(--line-2)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              background:"#FBF7EE",color:"var(--muted)",fontSize:11,gap:4,
              cursor:busy?"wait":"pointer",opacity:busy?0.6:1
            }}>
            <div style={{fontSize:20,lineHeight:1}}>{busy?"…":"+"}</div>
            <div className="mono" style={{fontSize:9,letterSpacing:".1em"}}>{busy?"RESIZING":"UPLOAD"}</div>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>add(e.target.files)}/>
      {photos.length < max && (
        <div style={{display:"flex",gap:6,marginTop:8}}>
          <input style={{...inp,marginBottom:0,fontSize:12,padding:"7px 10px"}}
            placeholder="…or paste image URL (e.g. from Zillow)"
            value={urlInput} onChange={e=>setUrlInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addUrl())}/>
          <button className="btn" onClick={addUrl} style={{flexShrink:0,padding:"7px 12px",fontSize:12}}>Add URL</button>
        </div>
      )}
      <div style={{marginTop:6,fontSize:11,color:"var(--muted)",display:"flex",justifyContent:"space-between"}}>
        <span>
          {photos.length}/{max}
          {urlCount>0&&` · ${urlCount} hosted`}
          {(photos.length-urlCount)>0&&` · ${photos.length-urlCount} uploaded`}
        </span>
        {totalKB>0&&<span>~{totalKB} KB</span>}
      </div>
    </div>
  );
}

// ----- Room editor -----
function RoomEditor({listing, setListing, floorId, roomId, onClose}) {
  const floor = listing.floors.find(f=>f.id===floorId);
  const room  = floor.rooms.find(r=>r.id===roomId);
  const [draft, setDraft] = useStateA(room);
  useEffectA(()=>{ setDraft(floor.rooms.find(r=>r.id===roomId)); }, [floorId, roomId]);

  const save = () => {
    const next = JSON.parse(JSON.stringify(listing));
    const f = next.floors.find(x=>x.id===floorId);
    const idx = f.rooms.findIndex(r=>r.id===roomId);
    f.rooms[idx] = {...draft, complete:!!(draft.description&&draft.description.length>4)};
    setListing(next); onClose();
  };

  const deleteRoom = () => {
    if (!confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;
    const next = JSON.parse(JSON.stringify(listing));
    const f = next.floors.find(x=>x.id===floorId);
    f.rooms = f.rooms.filter(r=>r.id!==roomId);
    setListing(next); onClose();
  };

  const [hlInput, setHlInput] = useStateA("");
  const addHighlight = () => {
    if (!hlInput.trim()) return;
    setDraft({...draft, highlights:[...draft.highlights, hlInput.trim()]});
    setHlInput("");
  };

  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(27,25,22,0.45)",zIndex:50,
      display:"flex",alignItems:"center",justifyContent:"center",padding:30
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"min(720px,96%)",maxHeight:"90vh",overflowY:"auto",
        background:"var(--paper)",borderRadius:16,border:"1px solid var(--line-2)",
        boxShadow:"0 30px 80px rgba(0,0,0,0.25)"
      }}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div className="mono" style={{fontSize:11,color:"var(--muted)",letterSpacing:".08em"}}>{floor.name.toUpperCase()}</div>
            <input className="serif" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}
              style={{fontSize:26,border:"none",background:"transparent",outline:"none",letterSpacing:"-0.01em",padding:0,marginTop:2,width:"100%"}}/>
          </div>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>

        <div style={{padding:22,display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          <Field label="Square feet (optional)">
            <input style={inp} type="number" value={draft.sqft??""} onChange={e=>setDraft({...draft,sqft:e.target.value?+e.target.value:null})}/>
          </Field>
          <Field label="Status">
            <div style={{paddingTop:6}}>
              {draft.description&&draft.description.length>4
                ?<Pill tone="green">ready to publish</Pill>
                :<Pill tone="warn">needs description</Pill>}
            </div>
          </Field>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Highlights">
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
                {draft.highlights.map((h,i)=>(
                  <span key={i} className="tag" style={{cursor:"pointer"}}
                    onClick={()=>setDraft({...draft,highlights:draft.highlights.filter((_,j)=>j!==i)})}>
                    {h} <span style={{opacity:0.5,marginLeft:2}}>×</span>
                  </span>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input style={inp} placeholder="e.g. Mantled fireplace" value={hlInput}
                  onChange={e=>setHlInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addHighlight())}/>
                <button className="btn" onClick={addHighlight} style={{marginBottom:12,flexShrink:0}}>Add</button>
              </div>
            </Field>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Description">
              <textarea style={{...inp,minHeight:120,resize:"vertical"}} value={draft.description}
                placeholder="A sentence or two — what catches the eye, what's been updated, the story buyers should know."
                onChange={e=>setDraft({...draft,description:e.target.value})}/>
            </Field>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <Field label="Photos (up to 5)">
              <PhotoUploader photos={draft.photos} max={5} onChange={arr=>setDraft({...draft,photos:arr})}/>
            </Field>
          </div>
        </div>

        <div style={{padding:"14px 22px",borderTop:"1px solid var(--line)",display:"flex",justifyContent:"space-between",gap:10}}>
          <button className="btn ghost" style={{color:"#9B4A3A"}} onClick={deleteRoom}>Delete room</button>
          <div style={{display:"flex",gap:8}}>
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
  const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com";
  const defaultUrl = `${origin}/?id=${listing.id}`;
  const storageKey = `roomer.publicUrl.${listing.id}`;
  const [url, setUrl] = useStateA(() => {
    try { return localStorage.getItem(storageKey) || defaultUrl; } catch(e) { return defaultUrl; }
  });
  useEffectA(() => {
    try { localStorage.setItem(storageKey, url); } catch(e) {}
  }, [url]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=400x400&margin=10&qzone=1&format=svg`;
  const downloadQR = async () => {
    try {
      const r = await fetch(qrSrc.replace("format=svg","format=png").replace("size=400x400","size=1024x1024"));
      const b = await r.blob();
      const a = document.createElement("a");
      a.href=URL.createObjectURL(b); a.download=`roomer-qr-${listing.id}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(a.href),0);
    } catch(e) { alert("Could not download — right-click the QR and Save Image As…"); }
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <div className="mono" style={{fontSize:11,color:"var(--muted)",letterSpacing:".1em"}}>SHARE</div>
      <h1 className="serif" style={{fontSize:32,margin:"4px 0 6px"}}>QR &amp; share</h1>
      <p style={{color:"var(--muted)",margin:"0 0 22px",fontSize:14}}>Print and tape to the front door.</p>

      <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:22}}>
        <div style={{background:"var(--card)",border:"1px solid var(--line)",borderRadius:14,padding:22,textAlign:"center"}}>
          <div style={{background:"#FFF",padding:14,borderRadius:10,border:"1px solid var(--line)",display:"inline-block"}}>
            <img src={qrSrc} alt="QR code" style={{width:260,height:260,display:"block"}}/>
          </div>
          <div className="serif" style={{fontSize:20,marginTop:14}}>{listing.address.line1}</div>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginTop:2,wordBreak:"break-all"}}>
            {url.replace(/^https?:\/\//,"")}
          </div>
          <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center"}}>
            <button className="btn" onClick={downloadQR}>Download PNG</button>
            <button className="btn primary" onClick={()=>window.open(qrSrc,"_blank")}>Open SVG</button>
          </div>
        </div>

        <div style={{background:"var(--card)",border:"1px solid var(--line)",borderRadius:14,padding:22}}>
          <h3 className="serif" style={{fontSize:20,margin:"0 0 10px"}}>Your public link</h3>
          <p style={{fontSize:13,color:"var(--muted)",margin:"0 0 10px"}}>
            Set this to the URL buyers land on when they scan. The QR updates live.
          </p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <input style={inp} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-listing.vercel.app/"/>
            <button className="btn" onClick={()=>navigator.clipboard?.writeText(url)} style={{marginBottom:12,flexShrink:0}}>Copy</button>
          </div>
          <a href={url} target="_blank" className="mono" style={{fontSize:12,color:"var(--accent-ink)"}}>↗ Open in new tab to test</a>
          <div style={{borderTop:"1px solid var(--line)",marginTop:18,paddingTop:14}}>
            <div className="mono" style={{fontSize:11,color:"var(--muted)",letterSpacing:".08em",marginBottom:8}}>CHECKLIST</div>
            <ol style={{paddingLeft:18,margin:0,lineHeight:1.7,fontSize:13,color:"var(--ink-2)"}}>
              <li>Confirm the public link above points to your live site.</li>
              <li>Scan the QR with your own phone — make sure it loads.</li>
              <li>Print on a half-sheet with the address.</li>
              <li>Tape to front door + stack on the kitchen counter.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- App root -----
function AdminApp({view, setView, listing, setListing, onOpenListing, onBack}) {
  const [editingRoom, setEditingRoom] = useStateA(null);

  return (
    <div style={{display:"flex",height:"100%",background:"var(--paper)",overflow:"hidden"}}>
      <AdminSidebar view={view} setView={setView} listing={listing} onBack={onBack}/>
      <main style={{flex:1,overflowY:"auto"}}>
        {view==="listings" && <ListingsView onEdit={onOpenListing}/>}
        {view==="property" && listing && (
          <PropertyView listing={listing} setListing={setListing}
            openRoom={(fId,rId)=>setEditingRoom({floorId:fId,roomId:rId})}
            gotoQR={()=>setView("qr")}
            onBack={onBack}/>
        )}
        {view==="qr" && listing && <QRView listing={listing}/>}
      </main>
      {editingRoom && listing && (
        <RoomEditor listing={listing} setListing={setListing}
          floorId={editingRoom.floorId} roomId={editingRoom.roomId}
          onClose={()=>setEditingRoom(null)}/>
      )}
    </div>
  );
}

Object.assign(window, { AdminApp });
