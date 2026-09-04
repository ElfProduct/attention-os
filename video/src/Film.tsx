import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import data from "./data.json";

const C = {
  bg: "#F3F0E8",
  paper: "#FCFBF7",
  ink: "#162033",
  muted: "#667083",
  blue: "#2457D6",
  paleBlue: "#DCE6FF",
  green: "#326B56",
  amber: "#B4741B",
  red: "#9A3E4C",
  line: "#D6D0C3"
};

type SceneData = (typeof data.scenes)[number];

const enter = (frame: number, fps: number, delay = 0) => spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 125, mass: 0.7 } });

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; delay?: number }> = ({ children, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: "0 12px 40px rgba(22,32,51,.08)", padding: 22, opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.97 + p * 0.03})`, ...style }}>{children}</div>;
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = C.paleBlue }) => <span style={{ display: "inline-flex", padding: "9px 14px", borderRadius: 999, background: tone, color: C.ink, fontWeight: 760, fontSize: 18 }}>{children}</span>;

const Arrow = ({ delay = 0 }: { delay?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{ width: 68, height: 2, background: C.blue, position: "relative", transform: `scaleX(${p})`, transformOrigin: "left" }}><span style={{ position: "absolute", right: -2, top: -6, width: 12, height: 12, borderTop: `2px solid ${C.blue}`, borderRight: `2px solid ${C.blue}`, transform: "rotate(45deg)" }} /></div>;
};

const SceneChrome: React.FC<{ scene: SceneData; children: React.ReactNode }> = ({ scene, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const globalFrame = frame + Math.floor((scene.startMs / 1000) * fps);
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.ink, fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(36,87,214,.08) 1px, transparent 0)", backgroundSize: "28px 28px", opacity: 0.45 }} />
      <div style={{ position: "absolute", top: 30, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 850, letterSpacing: -0.4 }}><span style={{ width: 25, height: 25, borderRadius: 8, background: C.blue, display: "inline-flex", color: "white", alignItems: "center", justifyContent: "center", fontSize: 14 }}>A</span>Attention OS</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", color: C.muted, fontSize: 14, fontWeight: 700, letterSpacing: 1.1 }}><span>{String(scene.id).padStart(2, "0")} / 12</span><span>OPEN-SOURCE ALPHA</span></div>
      </div>
      <div style={{ position: "absolute", top: 84, left: 48, right: 48, height: 2, background: C.line }}><div style={{ height: "100%", width: `${(globalFrame / durationInFrames) * 100}%`, background: C.blue }} /></div>
      <div style={{ position: "absolute", top: 112, left: 70, right: 70 }}>
        <div style={{ color: C.blue, fontSize: 15, letterSpacing: 2.2, fontWeight: 850, marginBottom: 8 }}>{scene.eyebrow}</div>
        <div style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 47, lineHeight: 1.02, letterSpacing: -1.7, maxWidth: 1120 }}>{scene.title}</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 230, bottom: 138 }}>{children}</div>
      <div style={{ position: "absolute", left: 48, bottom: 20, color: C.muted, fontSize: 13 }}>Local-first · human-readable · evidence-led</div>
      <div style={{ position: "absolute", right: 48, bottom: 20, color: C.muted, fontSize: 13 }}>{Math.max(0, Math.floor((globalFrame / fps)))}s</div>
    </AbsoluteFill>
  );
};

const Hero = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, 2);
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%", alignItems: "center", gap: 55 }}>
    <div style={{ transform: `translateX(${(1 - p) * -50}px)`, opacity: p }}>
      <div style={{ fontSize: 98, lineHeight: 0.9, fontWeight: 900, letterSpacing: -7 }}>04<span style={{ color: C.blue }}>.</span>09<span style={{ color: C.blue }}>.</span>26</div>
      <div style={{ marginTop: 26, fontSize: 24, color: C.muted }}>Friday · Europe/London</div>
    </div>
    <Card style={{ padding: 30 }} delay={8}>
      <div style={{ fontSize: 15, color: C.green, fontWeight: 850, letterSpacing: 1.8 }}>SYSTEM AWAKE</div>
      <div style={{ fontSize: 34, lineHeight: 1.13, fontWeight: 830, marginTop: 14 }}>Context that knows<br />which day it is.</div>
      <div style={{ height: 8, background: C.paleBlue, borderRadius: 8, marginTop: 28, overflow: "hidden" }}><div style={{ width: `${p * 100}%`, height: "100%", background: C.blue }} /></div>
    </Card>
  </div>;
};

const Fragmented = () => {
  const items = [["GOAL", "another conversation"], ["CODE", "three repositories"], ["TIME", "calendar"], ["SIGNALS", "messages + documents"], ["DECISION", "half finished"]];
  return <div style={{ position: "relative", height: "100%" }}>
    {items.map(([a, b], i) => <Card key={a} delay={i * 4} style={{ position: "absolute", width: 245, left: [0, 260, 25, 800, 860][i], top: [10, 190, 300, 40, 265][i], transform: `rotate(${[-3, 2, 1, -2, 3][i]}deg)` }}><div style={{ color: C.blue, fontSize: 13, letterSpacing: 1.6, fontWeight: 850 }}>{a}</div><div style={{ fontSize: 23, fontWeight: 780, marginTop: 8 }}>{b}</div></Card>)}
    <Card delay={22} style={{ position: "absolute", left: 500, top: 138, width: 300, border: `2px solid ${C.red}` }}><div style={{ color: C.red, fontWeight: 900, fontSize: 14, letterSpacing: 1.5 }}>NEW AI CHAT</div><div style={{ fontSize: 38, fontWeight: 900, marginTop: 8 }}>Starts cold.</div></Card>
  </div>;
};

const Orbit = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, 3);
  const nodes = [["GOALS", -185, -90], ["DECISIONS", 175, -100], ["OUTCOMES", 205, 110], ["CORRECTIONS", -185, 120]];
  return <div style={{ height: "100%", display: "grid", placeItems: "center" }}><div style={{ position: "relative", width: 720, height: 350, transform: `scale(${0.8 + p * .2})`, opacity: p }}>
    <div style={{ position: "absolute", left: 245, top: 62, width: 230, height: 230, borderRadius: "50%", background: C.blue, color: "white", display: "grid", placeItems: "center", textAlign: "center", boxShadow: "0 25px 70px rgba(36,87,214,.25)" }}><div><div style={{ fontSize: 15, letterSpacing: 2 }}>ATTENTION OS</div><div style={{ fontFamily: "Georgia, serif", fontSize: 36, marginTop: 8 }}>Private<br />memory</div></div></div>
    {nodes.map(([label, x, y], i) => <div key={String(label)} style={{ position: "absolute", left: 335 + Number(x), top: 155 + Number(y), width: 150, padding: "13px 0", borderRadius: 999, background: C.paper, border: `1px solid ${C.line}`, textAlign: "center", fontWeight: 850, fontSize: 15, opacity: enter(frame, fps, 8 + i * 4), boxShadow: "0 8px 25px rgba(22,32,51,.08)" }}>{label}</div>)}
  </div></div>;
};

const Setup = () => {
  const labels = ["Who are you?", "What is the goal?", "What role now?", "How direct?" ];
  return <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", alignItems: "center", gap: 38, height: "100%" }}>
    <div><Card style={{ background: "#121A2A", color: "white", padding: 28 }}><div style={{ color: "#8FAEFF", font: "15px ui-monospace", marginBottom: 16 }}>$ codex plugin add attention-os</div><div style={{ font: "700 23px ui-monospace", lineHeight: 1.6 }}>&gt; Set up Attention OS for me<span style={{ color: C.blue }}>_</span></div></Card><div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>{labels.map((label, i) => <Card key={label} delay={8 + i * 3} style={{ padding: "13px 17px", borderRadius: 12, fontWeight: 760 }}>{label}</Card>)}</div></div>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}><Arrow delay={18} /><Card delay={22} style={{ flex: 1, padding: 26 }}><div style={{ fontSize: 58 }}>📁</div><div style={{ fontSize: 24, fontWeight: 860, marginTop: 10 }}>Your private memory</div><div style={{ color: C.muted, marginTop: 8 }}>Markdown · local Git<br />no remote added</div></Card></div>
  </div>;
};

const MemoryLoop = () => {
  const steps = [["01", "WORK", "Codex tasks"], ["02", "CHECKPOINT", "bounded pointer"], ["03", "RECONCILE", "fact ≠ inference"], ["04", "COMMIT", "durable change"], ["05", "RETURN", "relevant context"]];
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>{steps.map(([n, a, b], i) => <React.Fragment key={n}><Card delay={i * 5} style={{ width: 180, minHeight: 145, padding: 20 }}><div style={{ color: C.blue, fontSize: 14, fontWeight: 900 }}>{n}</div><div style={{ fontSize: 18, fontWeight: 900, marginTop: 20 }}>{a}</div><div style={{ color: C.muted, fontSize: 17, marginTop: 8 }}>{b}</div></Card>{i < steps.length - 1 && <Arrow delay={i * 5 + 4} />}</React.Fragment>)}</div>;
};

const Products = () => {
  const products = [["FOUNDER COACH", "Choose the next evidence-producing move", C.blue], ["DAILY RECONCILIATION", "Intention versus verified outcome", C.green], ["EVENING REVIEW", "Human context telemetry misses", C.amber], ["MEMORY REVIEW", "Inspect, trace, and correct", C.red]];
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, height: "100%", alignContent: "center" }}>{products.map(([name, copy, color], i) => <Card key={name} delay={i * 5} style={{ display: "flex", gap: 18, alignItems: "center", padding: 24 }}><div style={{ width: 11, height: 78, borderRadius: 9, background: color }} /><div><div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 1 }}>{name}</div><div style={{ color: C.muted, fontSize: 21, marginTop: 8 }}>{copy}</div></div></Card>)}</div>;
};

const Briefing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inputs = ["GOALS", "PROJECTS", "CALENDAR", "TASKS", "RISKS", "CAPACITY"];
  return <div style={{ height: "100%", display: "grid", gridTemplateColumns: ".8fr 80px 1.2fr", gap: 22, alignItems: "center" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{inputs.map((x, i) => <Card key={x} delay={i * 3} style={{ padding: 15, textAlign: "center", fontWeight: 850, fontSize: 14 }}>{x}</Card>)}</div>
    <Arrow delay={18} />
    <Card delay={22} style={{ height: 300, padding: 0, overflow: "hidden", border: `2px solid ${C.blue}` }}><div style={{ background: C.blue, color: "white", padding: "12px 18px", fontWeight: 850, display: "flex", justifyContent: "space-between" }}><span>MORNING BRIEFING</span><span>02:37</span></div><div style={{ padding: 24 }}><div style={{ fontFamily: "Georgia, serif", fontSize: 34, lineHeight: 1.05 }}>One grounded plan.<br />Built for this day.</div><div style={{ display: "flex", gap: 10, marginTop: 25 }}><Pill>FULL CAPTIONS</Pill><Pill tone="#E1F0E9">EXPLANATORY MOTION</Pill></div><div style={{ display: "flex", gap: 7, alignItems: "end", height: 58, marginTop: 18 }}>{[.4,.7,.35,.9,.6,.75,.45,.85,.5].map((h,i)=><div key={i} style={{ width: 8, height: 48*h*enter(frame,fps,24+i), borderRadius: 5, background: i%3===0?C.blue:C.line }} />)}</div></div></Card>
  </div>;
};

const Permissions = () => {
  const sources = ["Calendar", "Tasks", "Activity", "Documents", "Messages", "Voice"];
  return <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 55, alignItems: "center" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{sources.map((x,i)=><Card key={x} delay={i*3} style={{ padding: "13px 16px", fontWeight: 800 }}>{x}<span style={{ color: C.green, marginLeft: 8 }}>opt in</span></Card>)}</div>
    <Card delay={16} style={{ border: `2px solid ${C.ink}`, padding: 30 }}><div style={{ display: "flex", gap: 18, alignItems: "center" }}><div style={{ fontSize: 62 }}>🔐</div><div><div style={{ fontSize: 27, fontWeight: 900 }}>Context ≠ authority</div><div style={{ color: C.muted, fontSize: 19, marginTop: 7 }}>Every external action keeps its approval boundary.</div></div></div><div style={{ borderTop: `1px solid ${C.line}`, marginTop: 24, paddingTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}><Pill tone="#F5DFE3">NO SECRET IN CHAT</Pill><Pill tone="#E1F0E9">OWNER APPROVAL</Pill></div></Card>
  </div>;
};

const Stack = () => {
  const layers = [["ATTENTION OS", "memory · coaching · reviews", C.blue, "white"], ["CODEX", "tasks · hooks · scheduling · interface", "#202B42", "white"], ["AUTHORIZED SOURCES", "calendar · projects · documents · activity", C.paper, C.ink]];
  return <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 45, alignItems: "center" }}><div>{layers.map(([a,b,bg,fg],i)=><Card key={a} delay={i*6} style={{ marginTop: i?12:0, background:bg, color:fg, padding: "19px 25px" }}><div style={{ fontWeight: 900, fontSize: 19 }}>{a}</div><div style={{ opacity:.75, fontSize:18, marginTop:5 }}>{b}</div></Card>)}</div><div><div style={{ fontSize: 15, color: C.green, fontWeight: 900, letterSpacing: 1.5 }}>EASY</div><div style={{ fontSize: 25, fontWeight: 850, marginTop: 7 }}>Package the behavior.</div><div style={{ height: 24 }} /><div style={{ fontSize: 15, color: C.red, fontWeight: 900, letterSpacing: 1.5 }}>HARD</div><div style={{ fontSize: 25, fontWeight: 850, marginTop: 7 }}>Earn justified trust.</div></div></div>;
};

const Network = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, 6);
  const nodes = [["CODEX",80,45],["CLAUDE",825,25],["GEMINI",870,275],["LOCAL",60,290]];
  return <div style={{ position: "relative", height: "100%" }}>
    <svg width="100%" height="100%" style={{position:"absolute",inset:0,overflow:"visible"}}><line x1="240" y1="95" x2="620" y2="205" stroke={C.blue} strokeWidth="4" strokeDasharray={`${p*420} 500`} /><line x1="990" y1="75" x2="690" y2="205" stroke={C.blue} strokeWidth="4" strokeDasharray={`${p*420} 500`} /><line x1="1030" y1="325" x2="690" y2="235" stroke={C.blue} strokeWidth="4" strokeDasharray={`${p*420} 500`} /><line x1="220" y1="340" x2="620" y2="235" stroke={C.blue} strokeWidth="4" strokeDasharray={`${p*420} 500`} /></svg>
    {nodes.map(([label,x,y],i)=><Card key={label} delay={i*4} style={{position:"absolute",left:x,top:y,width:170,textAlign:"center",fontWeight:900,fontSize:18}}>{label}<div style={{fontSize:13,color:C.muted,marginTop:5}}>agent harness</div></Card>)}
    <Card delay={18} style={{position:"absolute",left:500,top:130,width:280,textAlign:"center",border:`3px solid ${C.blue}`}}><div style={{color:C.blue,fontWeight:900,fontSize:14,letterSpacing:1.4}}>NEUTRAL TRUST LAYER</div><div style={{fontSize:25,fontWeight:900,marginTop:8}}>identity · permission<br/>delegation · proof</div></Card>
    <div style={{position:"absolute",left:390,right:390,bottom:8,textAlign:"center",color:C.red,fontWeight:850}}>Capability compounds. So can failure.</div>
  </div>;
};

const Stages = () => {
  const stages = [["1", "PRIVATE", "one owner"], ["2", "BILATERAL", "signed delegation"], ["3", "GOVERNED", "tested swarms"]];
  return <div style={{ height: "100%", display: "flex", alignItems: "end", justifyContent: "center", gap: 20, paddingBottom: 18 }}>{stages.map(([n,a,b],i)=><Card key={n} delay={i*7} style={{width:285,height:145+i*65,padding:24,borderTop:`7px solid ${[C.green,C.blue,C.amber][i]}`}}><div style={{fontSize:42,fontWeight:900,color:[C.green,C.blue,C.amber][i]}}>{n}</div><div style={{fontSize:19,fontWeight:900,letterSpacing:1}}>{a}</div><div style={{color:C.muted,fontSize:18,marginTop:7}}>{b}</div></Card>)}<Card delay={25} style={{width:240,height:330,padding:24,background:"#162033",color:"white"}}><div style={{fontSize:52}}>🛡️</div><div style={{fontSize:22,fontWeight:900,marginTop:15}}>Safety gate</div><div style={{fontSize:17,lineHeight:1.5,color:"#CBD3E3",marginTop:10}}>identity<br/>least privilege<br/>audit<br/>revocation<br/>containment</div></Card></div>;
};

const Cta = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center"}}><div><div style={{fontSize:68,fontWeight:930,letterSpacing:-4,lineHeight:.95}}>Build with<br/><span style={{color:C.blue}}>continuity.</span></div><div style={{fontSize:22,color:C.muted,marginTop:22}}>github.com/ElfProduct/attention-os</div></div><Card delay={8} style={{background:"#121A2A",color:"white",padding:28}}><div style={{font:"14px ui-monospace",color:"#8FAEFF"}}>NEW CODEX TASK</div><div style={{font:"700 23px/1.5 ui-monospace",marginTop:18}}>&gt; Set up Attention OS<br/>for me.<span style={{color:"#72A0FF"}}>_</span></div><div style={{marginTop:24,color:"#AAB5C9"}}>Open source · alpha · local first</div></Card></div>;

const Visual = ({ type }: { type: string }) => {
  if (type === "hero") return <Hero />;
  if (type === "fragmented") return <Fragmented />;
  if (type === "orbit") return <Orbit />;
  if (type === "setup") return <Setup />;
  if (type === "loop") return <MemoryLoop />;
  if (type === "products") return <Products />;
  if (type === "briefing") return <Briefing />;
  if (type === "permissions") return <Permissions />;
  if (type === "stack") return <Stack />;
  if (type === "network") return <Network />;
  if (type === "stages") return <Stages />;
  return <Cta />;
};

const TimedScene = ({ scene }: { scene: SceneData }) => {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = Math.ceil(((scene.endMs - scene.startMs) / 1000) * fps);
  const fade = Math.min(
    interpolate(localFrame, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(localFrame, [duration - 9, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  return <AbsoluteFill style={{ opacity: fade }}><SceneChrome scene={scene}><Visual type={scene.type} /></SceneChrome></AbsoluteFill>;
};

const Captions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = (frame / fps) * 1000;
  const group = data.captions.find((caption) => time >= caption.startMs && time <= caption.endMs);
  if (!group) return null;
  return <div style={{ position: "absolute", left: 210, right: 210, bottom: 45, zIndex: 50, display: "flex", justifyContent: "center", pointerEvents: "none" }}><div style={{ background: "rgba(18,26,42,.96)", color: "white", borderRadius: 14, padding: "13px 21px 15px", fontFamily: "Inter, ui-sans-serif, sans-serif", fontWeight: 760, fontSize: 29, lineHeight: 1.18, letterSpacing: -.35, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>{group.words.map((word, index) => <React.Fragment key={`${word.startMs}-${word.text}`}><span style={{ color: time >= word.startMs && time <= word.endMs ? "#78A5FF" : "white" }}>{word.text}</span>{index < group.words.length - 1 ? " " : ""}</React.Fragment>)}</div></div>;
};

export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ background: C.bg }}><Audio src={staticFile("narration-final.mp3")} />{data.scenes.map((scene) => {
    const from = Math.floor((scene.startMs / 1000) * fps);
    const duration = Math.ceil(((scene.endMs - scene.startMs) / 1000) * fps);
    return <Sequence key={scene.id} from={from} durationInFrames={duration} premountFor={fps}><TimedScene scene={scene} /></Sequence>;
  })}<Captions /></AbsoluteFill>;
};

export const Poster: React.FC = () => <AbsoluteFill style={{background:C.bg,color:C.ink,fontFamily:"Inter,ui-sans-serif,sans-serif",padding:70}}><div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 1px 1px, rgba(36,87,214,.09) 1px, transparent 0)",backgroundSize:"28px 28px"}}/><div style={{position:"relative",height:"100%",display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:60,alignItems:"center"}}><div><Pill>OPEN-SOURCE · CODEX PLUGIN</Pill><div style={{fontFamily:"Georgia,serif",fontSize:91,lineHeight:.92,letterSpacing:-5,marginTop:28}}>Your founder<br/>operating system.</div><div style={{fontSize:27,color:C.muted,marginTop:28,maxWidth:730,lineHeight:1.3}}>Private memory, honest accountability, and a grounded next move—inside Codex.</div></div><div style={{position:"relative",height:470}}><div style={{position:"absolute",left:90,top:105,width:290,height:290,borderRadius:"50%",background:C.blue,color:"white",display:"grid",placeItems:"center",textAlign:"center",boxShadow:"0 30px 80px rgba(36,87,214,.25)"}}><div><div style={{fontSize:18,letterSpacing:2,fontWeight:850}}>ATTENTION OS</div><div style={{fontFamily:"Georgia,serif",fontSize:43,marginTop:10}}>Remember.<br/>Focus.<br/>Reconcile.</div></div></div>{[["GOALS",0,25],["WORK",285,0],["EVIDENCE",300,365],["NEXT MOVE",0,395]].map(([x,l,t])=><div key={x} style={{position:"absolute",left:l,top:t,background:C.paper,border:`1px solid ${C.line}`,borderRadius:999,padding:"13px 20px",fontWeight:900,boxShadow:"0 8px 25px rgba(22,32,51,.08)"}}>{x}</div>)}</div></div><div style={{position:"absolute",left:70,bottom:35,color:C.blue,fontWeight:850,fontSize:18}}>▶ WATCH THE 2½-MINUTE EXPLAINER</div><div style={{position:"absolute",right:70,bottom:35,color:C.muted,fontSize:17}}>github.com/ElfProduct/attention-os</div></AbsoluteFill>;
