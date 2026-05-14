/* Consumer mobile app — Roomer */

const { useState, useEffect, useMemo, useRef } = React;

// ---------- helpers ----------
const fmtPrice = (n) => n ? "$" + n.toLocaleString() : "—";
const fmtSqft  = (n) => n ? n.toLocaleString() + " sqft" : null;

// ---------- icons (inline, minimal originals) ----------
const Icon = {
  Chevron: ({dir="right", size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{transform: dir==="left"?"rotate(180deg)":dir==="up"?"rotate(-90deg)":dir==="down"?"rotate(90deg)":"none"}}>
      <polyline points="9 6 15 12 9 18"/>
    </svg>
  ),
  Phone: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.92.33 1.81.61 2.66a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.42-1.27a2 2 0 0 1 2.11-.45c.85.28 1.74.49 2.66.61A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Msg: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Bed: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17V7M22 17v-5a3 3 0 0 0-3-3H8M2 13h20M2 17h20"/>
    </svg>
  ),
  Bath: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M6 12V6a2 2 0 0 1 4 0M5 19l-1 2M19 19l1 2"/>
    </svg>
  ),
  Ruler: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-4 2 2 4-4 2 2 4-4 2 2-12 12z M7 13l2 2 M11 9l2 2 M15 5l2 2"/>
    </svg>
  ),
  Heart: ({size=16, fill="none"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Share: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Pin: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Camera: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
};

// ---------- photo placeholder ----------
function PhotoSlot({label, ratio="4/3", style={}}) {
  return (
    <div className="placeholder-stripes" style={{
      aspectRatio: ratio, borderRadius: 14, position:"relative",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#8C816F", border:"1px solid var(--line)", ...style
    }}>
      <div className="mono" style={{fontSize:11, letterSpacing:".08em", textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

// ===========================================================
// SCREEN 1 — Property overview
// ===========================================================
function ScreenOverview({listing, onOpenFloor, onOpenRoom, onContact}) {
  const totalRooms = listing.floors.reduce((s,f)=>s+f.rooms.length, 0);
  return (
    <div className="scroll-y" style={{height:"100%", background:"var(--paper)", paddingBottom:30}}>
      {/* Hero */}
      <div style={{position:"relative", padding:"0 0 0 0"}}>
        {listing.heroPhoto ? (
          <img src={listing.heroPhoto} alt="" referrerPolicy="no-referrer" style={{
            display:"block", width:"100%", aspectRatio:"4/4.2", objectFit:"cover",
            borderRadius:0, border:"none"
          }}/>
        ) : (
          <PhotoSlot label="HERO · FRONT EXTERIOR" ratio="4/4.2" style={{borderRadius:0, borderLeft:0, borderRight:0, borderTop:0}}/>
        )}
        <div style={{position:"absolute", top:14, left:14, right:14, display:"flex", justifyContent:"space-between"}}>
          <span className="tag" style={{background:"rgba(255,255,255,0.92)"}}>
            <span className="dot green"/> Open House · Sat 11–1
          </span>
          <button className="btn ghost" style={{background:"rgba(255,255,255,0.92)", padding:"6px 10px"}}>
            <Icon.Heart size={14}/>
          </button>
        </div>
      </div>

      <div style={{padding:"22px 22px 14px"}}>
        <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".08em"}}>
          120 SUMMER AVE · READING, MA
        </div>
        <h1 className="serif" style={{fontSize:36, lineHeight:1.05, margin:"8px 0 12px", letterSpacing:"-0.02em"}}>
          {listing.headline}
        </h1>
        <div style={{display:"flex", gap:10, alignItems:"baseline"}}>
          <div className="serif" style={{fontSize:30}}>{fmtPrice(listing.price)}</div>
          <div style={{fontSize:13, color:"var(--muted)"}}>·  ${Math.round(listing.price/listing.sqft)}/sqft</div>
        </div>

        {/* stat row */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0,
          marginTop:18, padding:"14px 0",
          borderTop:"1px solid var(--line)", borderBottom:"1px solid var(--line)"
        }}>
          {[
            {n:listing.beds, l:"beds"},
            {n:listing.baths+(listing.halfBaths?"·"+listing.halfBaths:""), l:"baths"},
            {n:listing.sqft.toLocaleString(), l:"sqft"},
            {n:"0.3", l:"acres"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center", borderRight: i<3?"1px solid var(--line)":"none"}}>
              <div className="serif" style={{fontSize:22}}>{s.n}</div>
              <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".1em", textTransform:"uppercase"}}>{s.l}</div>
            </div>
          ))}
        </div>

        <p style={{fontSize:15, lineHeight:1.5, color:"var(--ink-2)", margin:"16px 0 4px", textWrap:"pretty"}}>
          {listing.blurb}
        </p>
      </div>

      {/* Floor plan — explore */}
      <div style={{padding:"0 22px"}}>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", margin:"14px 0 10px"}}>
          <h2 className="serif" style={{fontSize:24, margin:0}}>Explore the house</h2>
          <span className="mono" style={{fontSize:11, color:"var(--muted)"}}>{totalRooms} rooms</span>
        </div>
        <p style={{fontSize:13, color:"var(--muted)", margin:"0 0 16px"}}>
          Tap any room to read the story behind it.
        </p>

        {listing.floors.map(floor => (
          <FloorCard key={floor.id} floor={floor} onOpenRoom={onOpenRoom}/>
        ))}
      </div>

      {/* Highlights */}
      <div style={{padding:"6px 22px 0"}}>
        <h2 className="serif" style={{fontSize:24, margin:"10px 0 12px"}}>What stands out</h2>
        <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:18}}>
          {listing.highlights.map(h => (
            <span key={h} className="tag">{h}</span>
          ))}
        </div>
      </div>

      {/* Agent CTA */}
      <div style={{padding:"4px 22px 0"}}>
        <div style={{
          background:"var(--bg-dark)", color:"#FBF7EE",
          borderRadius:18, padding:"18px 18px 16px",
          display:"flex", alignItems:"center", gap:14
        }}>
          <div style={{
            width:46, height:46, borderRadius:999,
            background:"#3A352D", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Instrument Serif, serif", fontSize:22
          }}>{listing.agent.name.split(" ").map(s=>s[0]).join("").slice(0,2)}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:11, opacity:0.6, letterSpacing:".1em", textTransform:"uppercase"}} className="mono">Your agent</div>
            <div className="serif" style={{fontSize:20, lineHeight:1.1}}>{listing.agent.name}</div>
            <div style={{fontSize:12, opacity:0.7}}>{listing.agent.brokerage}</div>
          </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10}}>
          <button className="btn" onClick={()=>onContact("call")}>
            <Icon.Phone/> Call
          </button>
          <button className="btn primary" onClick={()=>onContact("text")}>
            <Icon.Msg/> Text agent
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:"28px 22px 40px", textAlign:"center"}}>
        <div className="mono" style={{fontSize:10, letterSpacing:".15em", color:"var(--muted)", textTransform:"uppercase"}}>
          Roomer · open house companion
        </div>
      </div>
    </div>
  );
}

function FloorCard({floor, onOpenRoom}) {
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--line)",
      borderRadius:18, padding:"14px 14px 8px", marginBottom:14
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0 4px 8px"}}>
        <h3 className="serif" style={{fontSize:20, margin:0}}>{floor.name}</h3>
        <span className="mono" style={{fontSize:11, color:"var(--muted)"}}>{floor.rooms.length} rooms</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
        {floor.rooms.map((room, i) => (
          <button key={room.id} onClick={()=>onOpenRoom(floor.id, room.id)} style={{
            textAlign:"left", padding:"10px 12px", borderRadius:12,
            background:"var(--paper)", border:"1px solid var(--line)",
            display:"flex", flexDirection:"column", gap:4, minHeight:62
          }}>
            <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".08em"}}>
              {(i+1).toString().padStart(2,"0")}
            </div>
            <div style={{fontWeight:500, fontSize:14, lineHeight:1.2}}>{room.name}</div>
            {room.sqft && <div style={{fontSize:11, color:"var(--muted)"}}>{fmtSqft(room.sqft)}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===========================================================
// SCREEN 2 — Room detail
// ===========================================================
function ScreenRoom({listing, floorId, roomId, onBack, onPrev, onNext}) {
  const floor = listing.floors.find(f => f.id === floorId);
  const idx   = floor.rooms.findIndex(r => r.id === roomId);
  const room  = floor.rooms[idx];
  const hasDesc = room.description && room.description.length > 0;

  // sibling navigation
  const prevRoom = idx > 0 ? floor.rooms[idx-1] : null;
  const nextRoom = idx < floor.rooms.length-1 ? floor.rooms[idx+1] : null;

  return (
    <div className="scroll-y" style={{height:"100%", background:"var(--paper)"}}>
      {/* top bar */}
      <div style={{
        position:"sticky", top:0, zIndex:5,
        background:"var(--paper)",
        padding:"12px 16px",
        borderBottom:"1px solid var(--line)",
        display:"flex", alignItems:"center", justifyContent:"space-between"
      }}>
        <button className="btn ghost" onClick={onBack} style={{padding:"6px 10px"}}>
          <Icon.Chevron dir="left"/> All rooms
        </button>
        <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".08em"}}>
          {floor.name.toUpperCase()} · {(idx+1).toString().padStart(2,"0")} / {floor.rooms.length.toString().padStart(2,"0")}
        </div>
      </div>

      {/* hero photo */}
      <div style={{padding:"14px 16px 0"}}>
        {room.photos.length > 0 ? (
          <img src={room.photos[0]} referrerPolicy="no-referrer" style={{width:"100%", aspectRatio:"4/3", objectFit:"cover", borderRadius:16, border:"1px solid var(--line)"}}/>
        ) : (
          <PhotoSlot label={`${room.name.toUpperCase()} · PHOTO`} ratio="4/3"/>
        )}
        {/* thumb row */}
        {room.photos.length > 1 && (
          <div style={{display:"flex", gap:8, marginTop:8, overflowX:"auto"}}>
            {room.photos.slice(1).map((p,i)=>(
              <img key={i} src={p} referrerPolicy="no-referrer" style={{width:72, height:72, objectFit:"cover", borderRadius:8, border:"1px solid var(--line)"}}/>
            ))}
          </div>
        )}
      </div>

      {/* title */}
      <div style={{padding:"18px 22px 6px"}}>
        <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".08em"}}>
          {floor.name.toUpperCase()}
        </div>
        <h1 className="serif" style={{fontSize:40, lineHeight:1.0, margin:"4px 0 10px", letterSpacing:"-0.02em"}}>
          {room.name}
        </h1>
        {room.sqft && (
          <div style={{display:"flex", alignItems:"center", gap:6, color:"var(--muted)", fontSize:13}}>
            <Icon.Ruler size={14}/> {fmtSqft(room.sqft)}
          </div>
        )}
      </div>

      {/* highlights */}
      {room.highlights.length > 0 && (
        <div style={{padding:"10px 22px 0", display:"flex", gap:8, flexWrap:"wrap"}}>
          {room.highlights.map(h => (
            <span key={h} className="tag" style={{background:"#FBF7EE"}}>{h}</span>
          ))}
        </div>
      )}

      {/* description */}
      <div style={{padding:"18px 22px 6px"}}>
        {hasDesc ? (
          <p className="serif" style={{fontSize:21, lineHeight:1.35, margin:0, textWrap:"pretty", color:"var(--ink)"}}>
            {room.description}
          </p>
        ) : (
          <div style={{
            border:"1px dashed var(--line-2)", borderRadius:12, padding:14,
            color:"var(--muted)", fontSize:13
          }}>
            Description coming soon — ask your agent for details on this room.
          </div>
        )}
      </div>

      {/* prev / next */}
      <div style={{padding:"24px 22px 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <button className="btn" disabled={!prevRoom} onClick={()=>prevRoom && onPrev(floorId, prevRoom.id)}
          style={{opacity: prevRoom?1:0.4, justifyContent:"flex-start", padding:"14px 14px"}}>
          <Icon.Chevron dir="left"/>
          <div style={{textAlign:"left", marginLeft:2}}>
            <div className="mono" style={{fontSize:10, color:"var(--muted)", letterSpacing:".08em"}}>PREV</div>
            <div style={{fontSize:13}}>{prevRoom ? prevRoom.name : "—"}</div>
          </div>
        </button>
        <button className="btn primary" disabled={!nextRoom} onClick={()=>nextRoom && onNext(floorId, nextRoom.id)}
          style={{opacity: nextRoom?1:0.4, justifyContent:"flex-end", padding:"14px 14px"}}>
          <div style={{textAlign:"right", marginRight:2}}>
            <div className="mono" style={{fontSize:10, opacity:0.6, letterSpacing:".08em"}}>NEXT</div>
            <div style={{fontSize:13}}>{nextRoom ? nextRoom.name : "—"}</div>
          </div>
          <Icon.Chevron dir="right"/>
        </button>
      </div>

      {/* all rooms */}
      <div style={{padding:"0 22px 40px", textAlign:"center"}}>
        <button className="btn ghost" onClick={onBack}
          style={{width:"100%", justifyContent:"center", gap:6}}>
          <Icon.Chevron dir="left"/>
          All Rooms
        </button>
      </div>
    </div>
  );
}

// ===========================================================
// Toast for contact action
// ===========================================================
function Toast({msg, onClose}) {
  useEffect(() => { if(!msg) return; const t = setTimeout(onClose, 2400); return ()=>clearTimeout(t); }, [msg]);
  if(!msg) return null;
  return (
    <div style={{
      position:"absolute", left:14, right:14, bottom:34, zIndex:30,
      background:"var(--ink)", color:"#FBF7EE", borderRadius:14, padding:"12px 14px",
      fontSize:13, boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
    }}>{msg}</div>
  );
}

// ===========================================================
// Root consumer app
// ===========================================================
function ConsumerApp({listing, initialRoute}) {
  const [route, setRoute] = useState(initialRoute || {name:"overview"});
  const [toast, setToast] = useState(null);

  const goRoom = (floorId, roomId) => setRoute({name:"room", floorId, roomId});
  const back   = () => setRoute({name:"overview"});

  const onContact = (kind) => {
    if(kind==="call") setToast("Calling " + listing.agent.phone + " …");
    else setToast("Opening text to " + listing.agent.name + " …");
  };

  return (
    <div style={{height:"100%", position:"relative", overflow:"hidden"}}>
      {route.name === "overview" && (
        <ScreenOverview listing={listing} onOpenRoom={goRoom} onContact={onContact}/>
      )}
      {route.name === "room" && (
        <ScreenRoom listing={listing} floorId={route.floorId} roomId={route.roomId}
          onBack={back} onPrev={goRoom} onNext={goRoom}/>
      )}
      <Toast msg={toast} onClose={()=>setToast(null)}/>
    </div>
  );
}

Object.assign(window, { ConsumerApp, ScreenRoom, ScreenOverview });
