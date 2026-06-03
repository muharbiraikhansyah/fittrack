import { useState, useEffect, useRef } from "react";

const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const MEAL_SCHEDULE = [
  { time: "06:00", label: "Sarapan", icon: "🌅", cal: 350, menu: "Oat + pisang / Nasi merah + telur rebus + sayur", color: "#f59e0b" },
  { time: "10:00", label: "Snack Pagi", icon: "🍎", cal: 100, menu: "Buah (apel/pepaya) / Susu rendah lemak", color: "#10b981" },
  { time: "12:00", label: "Makan Siang", icon: "☀️", cal: 450, menu: "Nasi merah + ayam/tahu/tempe + sayur", color: "#3b82f6" },
  { time: "15:00", label: "Snack Sore", icon: "🌿", cal: 150, menu: "Buah / Jagung rebus / Kacang tanpa garam", color: "#8b5cf6" },
  { time: "18:00", label: "Makan Malam", icon: "🌙", cal: 350, menu: "Porsi kecil nasi merah + protein + sayur banyak", color: "#ec4899" },
];

const WORKOUT_SCHEDULE = {
  1: { label: "Full Body Workout", icon: "💪", duration: "30–45 menit", exercises: ["Squat 3×15","Push-up 3×12","Plank 3×30 dtk","Jumping Jack 3×30","Burpees 3×10"], color: "#4ade80", type: "hard" },
  2: { label: "Cardio — Jalan/Jogging", icon: "🏃", duration: "30 menit", exercises: ["Jalan cepat / Jogging","Lompat tali (opsional)","Cool down stretching"], color: "#60a5fa", type: "cardio" },
  3: { label: "Upper Body + Core", icon: "🔥", duration: "30–45 menit", exercises: ["Push-up 3×15","Tricep dips 3×12","Mountain climbers 3×20","Plank 3×45 dtk","Sit-up 3×20"], color: "#f87171", type: "hard" },
  4: { label: "Istirahat Aktif", icon: "🧘", duration: "20–30 menit", exercises: ["Jalan santai 20 menit","Full body stretching","Chin tuck postur"], color: "#a78bfa", type: "light" },
  5: { label: "Lower Body + Cardio", icon: "🦵", duration: "30–45 menit", exercises: ["Squat 4×15","Lunges 3×12","Glute bridge 3×15","High knees 3×30","Jumping jack 3×30"], color: "#fb923c", type: "hard" },
  6: { label: "Cardio Bebas", icon: "⚡", duration: "30–40 menit", exercises: ["Jogging 20 menit","Jumping jack 3×40","Burpees 3×10","Cool down"], color: "#34d399", type: "cardio" },
  0: { label: "Rest Total", icon: "😴", duration: "Istirahat penuh", exercises: ["Tidur 8 jam","Pemulihan otot","Hidrasi baik"], color: "#94a3b8", type: "rest" },
};

const FOOD_DB = [
  { name: "Nasi Putih (100g)", cal: 130, protein: 2.7, carb: 28, fat: 0.3, emoji: "🍚" },
  { name: "Nasi Merah (100g)", cal: 110, protein: 2.5, carb: 23, fat: 0.9, emoji: "🍚" },
  { name: "Oatmeal (100g)", cal: 389, protein: 17, carb: 66, fat: 7, emoji: "🥣" },
  { name: "Telur Rebus (1 butir)", cal: 78, protein: 6, carb: 0.6, fat: 5, emoji: "🥚" },
  { name: "Dada Ayam (100g)", cal: 165, protein: 31, carb: 0, fat: 3.6, emoji: "🍗" },
  { name: "Tahu (100g)", cal: 76, protein: 8, carb: 1.9, fat: 4.8, emoji: "🟨" },
  { name: "Tempe (100g)", cal: 193, protein: 19, carb: 9, fat: 11, emoji: "🟫" },
  { name: "Pisang (1 buah)", cal: 89, protein: 1.1, carb: 23, fat: 0.3, emoji: "🍌" },
  { name: "Apel (1 buah)", cal: 52, protein: 0.3, carb: 14, fat: 0.2, emoji: "🍎" },
  { name: "Pepaya (100g)", cal: 43, protein: 0.5, carb: 11, fat: 0.3, emoji: "🍈" },
  { name: "Bayam (100g)", cal: 23, protein: 2.9, carb: 3.6, fat: 0.4, emoji: "🥬" },
  { name: "Brokoli (100g)", cal: 34, protein: 2.8, carb: 7, fat: 0.4, emoji: "🥦" },
  { name: "Susu Rendah Lemak (200ml)", cal: 102, protein: 8, carb: 12, fat: 2.5, emoji: "🥛" },
  { name: "Mie Instan (1 bungkus)", cal: 380, protein: 8, carb: 52, fat: 14, emoji: "🍜" },
  { name: "Gorengan (1 buah)", cal: 150, protein: 3, carb: 15, fat: 9, emoji: "🍟" },
  { name: "Es Teh Manis (1 gelas)", cal: 90, protein: 0, carb: 23, fat: 0, emoji: "🧋" },
  { name: "Kacang Tanah (30g)", cal: 170, protein: 7, carb: 5, fat: 15, emoji: "🥜" },
  { name: "Jagung Rebus (1 buah)", cal: 96, protein: 3.4, carb: 21, fat: 1.5, emoji: "🌽" },
  { name: "Ikan Goreng (100g)", cal: 196, protein: 22, carb: 0, fat: 12, emoji: "🐟" },
  { name: "Sayur Sop (1 porsi)", cal: 85, protein: 4, carb: 12, fat: 2, emoji: "🥘" },
];

const CAL_TARGET = 1500;
const PROTEIN_TARGET = 80;
const WATER_TARGET = 8;
const START_WEIGHT = 70;
const GOAL_WEIGHT = 57;

function dateKey(d) { return d.toISOString().split("T")[0]; }
function emptyDay() { return { foods: [], water: 0, workoutDone: false }; }
function getDay(store, key) { return store[key] || emptyDay(); }

export default function FitTrack() {
  const [today] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const [store, setStore] = useState({});
  const [weights, setWeights] = useState({});
  const [tab, setTab] = useState("today");
  const [foodQ, setFoodQ] = useState("");
  const [custom, setCustom] = useState({ name:"", cal:"", protein:"", carb:"", fat:"" });
  const [showCustom, setShowCustom] = useState(false);
  const [wtInput, setWtInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [timerSec, setTimerSec] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      setStore(JSON.parse(localStorage.getItem("ft_store") || "{}"));
      setWeights(JSON.parse(localStorage.getItem("ft_weights") || "{}"));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  const dk = dateKey(selDate);
  const tdk = dateKey(today);
  const day = getDay(store, dk);
  const dow = selDate.getDay();
  const workout = WORKOUT_SCHEDULE[dow];

  const totalCal = day.foods.reduce((s,f) => s + f.cal, 0);
  const totalP = day.foods.reduce((s,f) => s + (f.protein||0), 0);
  const totalC = day.foods.reduce((s,f) => s + (f.carb||0), 0);
  const totalF = day.foods.reduce((s,f) => s + (f.fat||0), 0);
  const calLeft = CAL_TARGET - totalCal;
  const calPct = Math.min((totalCal / CAL_TARGET) * 100, 100);

  const wEntries = Object.entries(weights).sort(([a],[b]) => a.localeCompare(b));
  const curWeight = wEntries.length > 0 ? wEntries[wEntries.length-1][1] : START_WEIGHT;
  const lost = START_WEIGHT - curWeight;
  const goalPct = Math.min(Math.max((lost / (START_WEIGHT - GOAL_WEIGHT)) * 100, 0), 100);

  const now = new Date();
  const nowH = now.getHours() + now.getMinutes()/60;
  const nextMeal = MEAL_SCHEDULE.find(m => { const [h,mn]=m.time.split(":").map(Number); return h+mn/60 > nowH; });

  const last7 = Array.from({length:7},(_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-(6-i));
    const k = dateKey(d); const dd = getDay(store, k);
    return { label: DAYS[d.getDay()].slice(0,3), cal: dd.foods.reduce((s,f)=>s+f.cal,0), water: dd.water, workout: dd.workoutDone, weight: weights[k]||null, dow: d.getDay() };
  });

  function save(newDay) {
    const ns = { ...store, [dk]: newDay };
    setStore(ns);
    try { localStorage.setItem("ft_store", JSON.stringify(ns)); } catch {}
  }

  function addFood(food) {
    save({ ...day, foods: [...day.foods, { ...food, id: Date.now() }] });
    setFoodQ(""); showToast(`${food.emoji || "🍽️"} ${food.name} ditambahkan!`);
  }
  function removeFood(id) { save({ ...day, foods: day.foods.filter(f=>f.id!==id) }); showToast("Makanan dihapus", "info"); }
  function addWater() { if(day.water >= 20) return; save({ ...day, water: day.water+1 }); if((day.water+1) === WATER_TARGET) showToast("🎉 Target air tercapai!"); }
  function removeWater() { if(day.water <= 0) return; save({ ...day, water: day.water-1 }); }
  function toggleWorkout() {
    const done = !day.workoutDone;
    save({ ...day, workoutDone: done });
    if(done) showToast("🔥 Olahraga selesai! Keren!");
  }
  function saveWeight() {
    if(!wtInput) return;
    const nw = { ...weights, [dk]: parseFloat(wtInput) };
    setWeights(nw);
    try { localStorage.setItem("ft_weights", JSON.stringify(nw)); } catch {}
    setWtInput(""); showToast(`⚖️ Berat ${wtInput} kg tersimpan!`);
  }
  function addCustomFood() {
    if(!custom.name||!custom.cal) return;
    addFood({ name:custom.name, cal:+custom.cal, protein:+custom.protein||0, carb:+custom.carb||0, fat:+custom.fat||0, emoji:"✏️" });
    setCustom({ name:"",cal:"",protein:"",carb:"",fat:"" }); setShowCustom(false);
  }

  const filteredFoods = foodQ ? FOOD_DB.filter(f=>f.name.toLowerCase().includes(foodQ.toLowerCase())) : FOOD_DB.slice(0,8);

  const streak = (() => { let s=0; for(let i=6;i>=0;i--){ if(last7[i].workout) s++; else break; } return s; })();
  const workoutCount = last7.filter(d=>d.workout).length;

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if(!loaded) return <div style={{background:"#060912",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#4ade80",fontFamily:"sans-serif",fontSize:24}}>💚</div>;

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:"#060912",minHeight:"100vh",color:"#f0f4ff",position:"relative",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Clash+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#4ade8055;border-radius:99px;}
        input{outline:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #4ade8033}50%{box-shadow:0 0 40px #4ade8066}}
        @keyframes slideIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-20px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:18px;backdrop-filter:blur(10px);animation:fadeUp 0.4s ease both;}
        .card:hover{border-color:rgba(74,222,128,0.2);transition:border-color 0.3s;}
        .btn-primary{background:linear-gradient(135deg,#4ade80,#22c55e);color:#060912;border:none;border-radius:12px;padding:10px 20px;font-family:inherit;font-weight:800;cursor:pointer;transition:all 0.2s;font-size:13px;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px #4ade8044;}
        .btn-primary:active{transform:translateY(0);}
        .btn-ghost{background:rgba(74,222,128,0.08);color:#4ade80;border:1px solid rgba(74,222,128,0.25);border-radius:12px;padding:9px 16px;font-family:inherit;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:13px;}
        .btn-ghost:hover{background:rgba(74,222,128,0.15);}
        .tab-btn{padding:9px 16px;border-radius:12px;border:none;background:transparent;color:#64748b;font-family:inherit;font-weight:700;cursor:pointer;transition:all 0.25s;font-size:12px;white-space:nowrap;}
        .tab-btn.active{background:rgba(74,222,128,0.12);color:#4ade80;box-shadow:0 0 0 1px rgba(74,222,128,0.2);}
        .inp{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#f0f4ff;padding:10px 14px;font-family:inherit;font-size:14px;width:100%;transition:all 0.2s;}
        .inp:focus{border-color:#4ade80;background:rgba(74,222,128,0.06);}
        .food-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;transition:all 0.2s;cursor:pointer;border:1px solid transparent;}
        .food-row:hover{background:rgba(74,222,128,0.06);border-color:rgba(74,222,128,0.15);}
        .pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:800;display:inline-block;}
        .glow-green{animation:glow 3s ease infinite;}
        .ex-tag{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;display:inline-block;margin:3px;cursor:pointer;transition:all 0.2s;}
        .ex-tag:hover{background:rgba(74,222,128,0.1);border-color:#4ade80;color:#4ade80;}
        .ex-tag.done{background:rgba(74,222,128,0.15);border-color:#4ade8066;color:#4ade80;}
        .shimmer-text{background:linear-gradient(90deg,#4ade80,#22d3ee,#818cf8,#4ade80);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
      `}</style>

      {/* Background orbs */}
      <div style={{position:"fixed",top:"-20%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,#4ade8011,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-10%",left:"-10%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,#3b82f611,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="success"?"rgba(74,222,128,0.95)":"rgba(99,102,241,0.95)",color:"#060912",padding:"10px 20px",borderRadius:12,fontWeight:800,fontSize:13,animation:"toastIn 0.3s ease",boxShadow:"0 8px 30px rgba(0,0,0,0.3)",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:"rgba(6,9,18,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:500,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,fontWeight:700}} className="shimmer-text">FitTrack Pro</div>
              <div style={{fontSize:11,color:"#475569",marginTop:1}}>{DAYS[today.getDay()]}, {today.getDate()} {MONTHS[today.getMonth()]} 2026</div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {streak > 0 && <div style={{background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:10,padding:"4px 10px",fontSize:12,fontWeight:800,color:"#fb923c"}}>🔥 {streak} hari</div>}
              <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:12,padding:"6px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#64748b"}}>Berat</div>
                <div style={{fontWeight:900,fontSize:16,color:"#4ade80"}}>{curWeight}<span style={{fontSize:10}}> kg</span></div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
            {[["today","🏠","Hari Ini"],["makan","🍽️","Makan"],["olahraga","💪","Latihan"],["progress","📊","Progress"],["jadwal","📅","Jadwal"]].map(([t,ic,lb]) => (
              <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{ic} {lb}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:500,margin:"0 auto",padding:"16px",position:"relative",zIndex:1}}>

        {/* ─── TODAY TAB ─── */}
        {tab==="today" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Date nav */}
            <div className="card" style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"12px 16px"}}>
              <button className="btn-ghost" style={{padding:"6px 14px"}} onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()-1);setSelDate(d);}}>‹</button>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:15}}>{dk===tdk?"Hari Ini ✨":`${selDate.getDate()} ${MONTHS[selDate.getMonth()]}`}</div>
                <div style={{fontSize:11,color:"#475569"}}>{DAYS[dow]}</div>
              </div>
              <button className="btn-ghost" style={{padding:"6px 14px"}} onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()+1);if(d<=today)setSelDate(d);}}>›</button>
            </div>

            {/* Goal progress */}
            <div className="card" style={{marginBottom:12,background:"linear-gradient(135deg,rgba(74,222,128,0.08),rgba(34,211,238,0.05))"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15}}>🎯 Target Berat Badan</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{START_WEIGHT} kg → {GOAL_WEIGHT} kg</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:22,fontWeight:900,color:"#4ade80"}}>{goalPct.toFixed(0)}%</div>
                  <div style={{fontSize:11,color:"#64748b"}}>tercapai</div>
                </div>
              </div>
              <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${goalPct}%`,background:"linear-gradient(90deg,#4ade80,#22d3ee)",borderRadius:99,transition:"width 0.8s ease",boxShadow:"0 0 10px #4ade8066"}}/>
              </div>
              {lost > 0 && <div style={{marginTop:8,fontSize:12,color:"#4ade80",fontWeight:700}}>🎉 Sudah turun {lost.toFixed(1)} kg! Tinggal {(curWeight-GOAL_WEIGHT).toFixed(1)} kg lagi!</div>}
            </div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"Kalori",val:totalCal,unit:"kkal",color:calLeft<0?"#f87171":"#4ade80",sub:`sisa ${Math.abs(calLeft)}`},
                {label:"Protein",val:Math.round(totalP),unit:"g",color:"#60a5fa",sub:`target ${PROTEIN_TARGET}g`},
                {label:"Air",val:day.water,unit:"gls",color:"#38bdf8",sub:`target ${WATER_TARGET}`},
                {label:"Latihan",val:day.workoutDone?"✓":"○",unit:"",color:day.workoutDone?"#4ade80":"#475569",sub:day.workoutDone?"selesai":"belum"},
              ].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#475569",marginBottom:4}}>{s.label}</div>
                  <div style={{fontWeight:900,fontSize:18,color:s.color,lineHeight:1}}>{s.val}<span style={{fontSize:10,fontWeight:600}}>{s.unit}</span></div>
                  <div style={{fontSize:9,color:"#334155",marginTop:3}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Calorie ring visual */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:800}}>🔥 Kalori Hari Ini</span>
                <span style={{fontSize:12,color:"#475569"}}>Target {CAL_TARGET} kkal</span>
              </div>
              <div style={{height:12,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${calPct}%`,background:calPct>100?"linear-gradient(90deg,#f87171,#ef4444)":calPct>85?"linear-gradient(90deg,#fbbf24,#f59e0b)":"linear-gradient(90deg,#4ade80,#22d3ee)",borderRadius:99,transition:"width 0.6s ease",boxShadow:calPct>100?"0 0 10px #f8717166":"0 0 10px #4ade8044"}}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[["🟢 Protein",totalP.toFixed(0)+"g","#4ade80"],["🟡 Karbo",totalC.toFixed(0)+"g","#fbbf24"],["🔴 Lemak",totalF.toFixed(0)+"g","#f87171"]].map(([l,v,c])=>(
                  <div key={l} style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#475569"}}>{l}</div>
                    <div style={{fontWeight:800,fontSize:13,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:800}}>💧 Hidrasi</span>
                <span style={{fontSize:13,color:day.water>=WATER_TARGET?"#4ade80":"#475569",fontWeight:700}}>{day.water}/{WATER_TARGET} gelas</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                {Array.from({length:WATER_TARGET},(_,i)=>(
                  <div key={i} onClick={i<day.water?removeWater:addWater} style={{fontSize:24,cursor:"pointer",filter:i<day.water?"drop-shadow(0 0 6px #38bdf8)":"grayscale(1) opacity(0.2)",transition:"all 0.2s",transform:i<day.water?"scale(1.1)":"scale(1)"}}>💧</div>
                ))}
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((day.water/WATER_TARGET)*100,100)}%`,background:"linear-gradient(90deg,#38bdf8,#818cf8)",borderRadius:99,transition:"width 0.4s ease"}}/>
              </div>
            </div>

            {/* Next meal */}
            {nextMeal && dk===tdk && (
              <div className="card" style={{marginBottom:12,border:`1px solid ${nextMeal.color}33`,background:`linear-gradient(135deg,${nextMeal.color}08,transparent)`}} >
                <div style={{fontSize:10,color:nextMeal.color,fontWeight:800,letterSpacing:1,marginBottom:4}}>⏰ JADWAL MAKAN BERIKUTNYA</div>
                <div style={{fontWeight:800,fontSize:16}}>{nextMeal.icon} {nextMeal.label}</div>
                <div style={{fontSize:13,color:"#94a3b8",margin:"4px 0"}}>{nextMeal.menu}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{background:nextMeal.color+"22",color:nextMeal.color,borderRadius:99}} className="pill">🕐 {nextMeal.time}</span>
                  <span style={{background:"rgba(255,255,255,0.06)",color:"#94a3b8",borderRadius:99}} className="pill">~{nextMeal.cal} kkal</span>
                </div>
              </div>
            )}

            {/* Workout preview */}
            <div className="card" style={{marginBottom:12,border:`1px solid ${workout.color}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:11,color:workout.color,fontWeight:800,letterSpacing:1}}>LATIHAN HARI INI</div>
                  <div style={{fontWeight:800,fontSize:16,marginTop:2}}>{workout.icon} {workout.label}</div>
                  <div style={{fontSize:12,color:"#475569"}}>{workout.duration}</div>
                </div>
                <button className={day.workoutDone?"btn-primary":"btn-ghost"} onClick={toggleWorkout} style={{fontSize:12}}>
                  {day.workoutDone?"✓ Selesai!":"Tandai Selesai"}
                </button>
              </div>
              <div>{workout.exercises.slice(0,3).map(e=><span key={e} className="ex-tag">{e}</span>)}</div>
            </div>

            {/* Weight */}
            <div className="card">
              <div style={{fontWeight:800,marginBottom:10}}>⚖️ Catat Berat Badan</div>
              {weights[dk] ? (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:32,fontWeight:900,color:"#4ade80"}}>{weights[dk]}</span>
                    <span style={{fontSize:14,color:"#64748b"}}> kg</span>
                  </div>
                  <button className="btn-ghost" style={{fontSize:12}} onClick={()=>{const w={...weights};delete w[dk];setWeights(w);try{localStorage.setItem("ft_weights",JSON.stringify(w));}catch{}}}>Ubah</button>
                </div>
              ) : (
                <div style={{display:"flex",gap:8}}>
                  <input className="inp" type="number" step="0.1" placeholder="Contoh: 68.5" value={wtInput} onChange={e=>setWtInput(e.target.value)} style={{flex:1}}/>
                  <button className="btn-primary" onClick={saveWeight}>Simpan</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MAKAN TAB ─── */}
        {tab==="makan" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Macro summary */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
              {[
                {l:"Kalori",v:totalCal,t:CAL_TARGET,u:"kkal",c:calLeft<0?"#f87171":"#4ade80"},
                {l:"Protein",v:Math.round(totalP),t:PROTEIN_TARGET,u:"g",c:"#60a5fa"},
                {l:"Karbo",v:Math.round(totalC),t:150,u:"g",c:"#fbbf24"},
                {l:"Lemak",v:Math.round(totalF),t:50,u:"g",c:"#f87171"},
              ].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"10px 8px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#475569"}}>{m.l}</div>
                  <div style={{fontWeight:900,fontSize:16,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:9,color:"#334155"}}>{m.u}</div>
                  <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,marginTop:5,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min((m.v/m.t)*100,100)}%`,background:m.c,borderRadius:99}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input className="inp" placeholder="🔍 Cari makanan..." value={foodQ} onChange={e=>setFoodQ(e.target.value)} style={{flex:1}}/>
                <button className="btn-ghost" onClick={()=>setShowCustom(!showCustom)} style={{whiteSpace:"nowrap"}}>
                  {showCustom?"✕ Tutup":"+ Custom"}
                </button>
              </div>

              {showCustom && (
                <div style={{background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{fontWeight:800,color:"#4ade80",marginBottom:10,fontSize:13}}>✏️ Tambah Makanan Sendiri</div>
                  <input className="inp" placeholder="Nama makanan" value={custom.name} onChange={e=>setCustom({...custom,name:e.target.value})} style={{marginBottom:8}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <input className="inp" type="number" placeholder="Kalori (kkal)" value={custom.cal} onChange={e=>setCustom({...custom,cal:e.target.value})}/>
                    <input className="inp" type="number" placeholder="Protein (g)" value={custom.protein} onChange={e=>setCustom({...custom,protein:e.target.value})}/>
                    <input className="inp" type="number" placeholder="Karbo (g)" value={custom.carb} onChange={e=>setCustom({...custom,carb:e.target.value})}/>
                    <input className="inp" type="number" placeholder="Lemak (g)" value={custom.fat} onChange={e=>setCustom({...custom,fat:e.target.value})}/>
                  </div>
                  <button className="btn-primary" style={{width:"100%"}} onClick={addCustomFood}>Tambahkan ke Log</button>
                </div>
              )}

              <div style={{maxHeight:260,overflowY:"auto"}}>
                {filteredFoods.map(food=>(
                  <div key={food.name} className="food-row" onClick={()=>addFood(food)}>
                    <div style={{fontSize:22}}>{food.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{food.name}</div>
                      <div style={{fontSize:11,color:"#475569"}}>P:{food.protein}g  K:{food.carb}g  L:{food.fat}g</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:12,fontWeight:800,padding:"3px 10px",borderRadius:99}}>{food.cal}</span>
                      <span style={{color:"#4ade80",fontSize:20,fontWeight:300}}>+</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food log */}
            <div className="card">
              <div style={{fontWeight:800,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>📋 Log Makanan</span>
                <span style={{fontSize:11,color:"#475569"}}>{dk===tdk?"Hari Ini":dk}</span>
              </div>
              {day.foods.length===0 ? (
                <div style={{textAlign:"center",padding:"24px 0",color:"#334155"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🍽️</div>
                  <div style={{fontSize:13}}>Belum ada makanan dicatat</div>
                  <div style={{fontSize:11,marginTop:4}}>Cari dan tambahkan makanan di atas</div>
                </div>
              ) : (
                <>
                  {day.foods.map(f=>(
                    <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <div style={{fontSize:20}}>{f.emoji||"🍽️"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{f.name}</div>
                        <div style={{fontSize:11,color:"#475569"}}>P:{f.protein}g  K:{f.carb}g  L:{f.fat}g</div>
                      </div>
                      <span style={{background:"rgba(74,222,128,0.1)",color:"#4ade80",fontSize:12,fontWeight:800,padding:"3px 10px",borderRadius:99}}>{f.cal}</span>
                      <button onClick={()=>removeFood(f.id)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,padding:"0 4px",opacity:0.7}}>×</button>
                    </div>
                  ))}
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:15}}>
                    <span>TOTAL</span>
                    <span style={{color:totalCal>CAL_TARGET?"#f87171":"#4ade80"}}>{totalCal} / {CAL_TARGET} kkal</span>
                  </div>
                  {totalCal>CAL_TARGET && (
                    <div style={{marginTop:8,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#f87171",fontWeight:700}}>
                      ⚠️ Kelebihan {totalCal-CAL_TARGET} kkal hari ini — kurangi makan malam!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── OLAHRAGA TAB ─── */}
        {tab==="olahraga" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Main workout card */}
            <div className="card" style={{marginBottom:12,border:`1px solid ${workout.color}33`,background:`linear-gradient(135deg,${workout.color}06,transparent)`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:42}}>{workout.icon}</div>
                  <div style={{fontWeight:900,fontSize:20,marginTop:6}}>{workout.label}</div>
                  <div style={{fontSize:13,color:"#475569"}}>{DAYS[dow]} • {workout.duration}</div>
                </div>
                <button className={day.workoutDone?"btn-primary":"btn-ghost"} onClick={toggleWorkout}>
                  {day.workoutDone?"✅ Selesai!":"Tandai Selesai"}
                </button>
              </div>
              {day.workoutDone && (
                <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:12,padding:10,fontSize:13,color:"#4ade80",fontWeight:700,textAlign:"center"}}>
                  🎉 Luar biasa! Olahraga hari ini sudah selesai!
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="card" style={{marginBottom:12,textAlign:"center"}}>
              <div style={{fontWeight:800,marginBottom:12}}>⏱️ Timer Latihan</div>
              <div style={{fontSize:52,fontWeight:900,color:timerOn?"#4ade80":"#f0f4ff",fontVariantNumeric:"tabular-nums",letterSpacing:2,marginBottom:12,textShadow:timerOn?"0 0 20px #4ade8088":"none",transition:"all 0.3s"}}>{fmtTime(timerSec)}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button className={timerOn?"btn-ghost":"btn-primary"} onClick={()=>setTimerOn(!timerOn)}>{timerOn?"⏸ Pause":"▶ Mulai"}</button>
                <button className="btn-ghost" onClick={()=>{setTimerOn(false);setTimerSec(0);}}>↺ Reset</button>
              </div>
            </div>

            {/* Exercises */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontWeight:800,marginBottom:12}}>📋 Gerakan Hari Ini</div>
              {workout.exercises.map((ex,i)=>(
                <div key={i} onClick={()=>setActiveExercise(activeExercise===i?null:i)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<workout.exercises.length-1?"1px solid rgba(255,255,255,0.05)":"none",cursor:"pointer"}}>
                  <div style={{width:30,height:30,borderRadius:99,background:activeExercise===i?`${workout.color}22`:"rgba(255,255,255,0.05)",border:`1px solid ${activeExercise===i?workout.color:"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:activeExercise===i?workout.color:"#64748b",transition:"all 0.2s",flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,fontWeight:600,fontSize:14,color:activeExercise===i?"#f0f4ff":"#cbd5e1"}}>{ex}</div>
                  {activeExercise===i && <div style={{fontSize:11,color:workout.color,fontWeight:700}}>▶ Aktif</div>}
                </div>
              ))}
            </div>

            {/* Weekly schedule */}
            <div className="card">
              <div style={{fontWeight:800,marginBottom:12}}>📅 Jadwal Mingguan</div>
              {Object.entries(WORKOUT_SCHEDULE).map(([d,w])=>{
                const isToday = dow===parseInt(d) && dk===tdk;
                const dayData = last7.find(x=>x.dow===parseInt(d));
                return (
                  <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"10px",marginBottom:4,borderRadius:12,background:isToday?"rgba(74,222,128,0.06)":"transparent",border:isToday?"1px solid rgba(74,222,128,0.15)":"1px solid transparent",transition:"all 0.2s"}}>
                    <div style={{width:44,fontSize:11,color:isToday?"#4ade80":"#475569",fontWeight:isToday?800:600}}>{DAYS[parseInt(d)].slice(0,3)}</div>
                    <div style={{fontSize:20}}>{w.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:isToday?"#f0f4ff":"#94a3b8"}}>{w.label}</div>
                      <div style={{fontSize:11,color:"#334155"}}>{w.duration}</div>
                    </div>
                    {dayData?.workout && <span style={{color:"#4ade80",fontSize:16}}>✅</span>}
                    {isToday && <span style={{background:"rgba(74,222,128,0.15)",color:"#4ade80",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:99}}>Hari Ini</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── PROGRESS TAB ─── */}
        {tab==="progress" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Weight cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {l:"Mulai",v:START_WEIGHT,c:"#64748b"},
                {l:"Sekarang",v:curWeight,c:"#4ade80"},
                {l:"Turun",v:lost>0?`-${lost.toFixed(1)}`:"0",c:"#22d3ee"},
                {l:"Target",v:GOAL_WEIGHT,c:"#fbbf24"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#475569"}}>{s.l}</div>
                  <div style={{fontWeight:900,fontSize:18,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,color:"#334155"}}>kg</div>
                </div>
              ))}
            </div>

            {/* Goal progress */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontWeight:800}}>🎯 Perjalanan ke Target</span>
                <span style={{fontWeight:900,color:"#4ade80"}}>{goalPct.toFixed(0)}%</span>
              </div>
              <div style={{height:14,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${goalPct}%`,background:"linear-gradient(90deg,#4ade80,#22d3ee)",borderRadius:99,transition:"width 0.8s ease",boxShadow:"0 0 12px #4ade8055"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}>
                <span>70 kg (mulai)</span>
                <span style={{color:"#4ade80"}}>{curWeight} kg (sekarang)</span>
                <span>57 kg (target)</span>
              </div>
            </div>

            {/* 7-day chart */}
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontWeight:800,marginBottom:14}}>📊 Kalori 7 Hari Terakhir</div>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100}}>
                {last7.map((d,i)=>{
                  const h = d.cal>0 ? Math.max((d.cal/CAL_TARGET)*100,6) : 6;
                  const over = d.cal>CAL_TARGET;
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:9,color:"#334155"}}>{d.cal||""}</div>
                      <div style={{width:"100%",height:80,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                        <div style={{width:"70%",height:`${h}%`,borderRadius:"4px 4px 0 0",background:over?"linear-gradient(180deg,#f87171,#ef4444)":d.cal>0?"linear-gradient(180deg,#4ade80,#22c55e)":"rgba(255,255,255,0.05)",transition:"height 0.5s ease",boxShadow:d.cal>0&&!over?"0 -4px 12px #4ade8033":""}}/>
                      </div>
                      <div style={{fontSize:10,color:"#475569"}}>{d.label}</div>
                      <div style={{fontSize:13}}>{d.workout?"✅":"⬜"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak & stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {l:"Streak",v:`${streak}🔥`,c:"#fb923c",sub:"hari berturut"},
                {l:"Olahraga",v:`${workoutCount}/7`,c:"#4ade80",sub:"minggu ini"},
                {l:"Avg Kalori",v:Math.round(last7.filter(d=>d.cal>0).reduce((s,d)=>s+d.cal,0)/Math.max(last7.filter(d=>d.cal>0).length,1))||0,c:"#60a5fa",sub:"kkal/hari"},
              ].map(s=>(
                <div key={s.l} className="card" style={{textAlign:"center",padding:14}}>
                  <div style={{fontSize:10,color:"#475569",marginBottom:4}}>{s.l}</div>
                  <div style={{fontWeight:900,fontSize:22,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#334155",marginTop:2}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Weight history */}
            <div className="card">
              <div style={{fontWeight:800,marginBottom:12}}>📅 Riwayat Berat Badan</div>
              {wEntries.length===0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"#334155"}}>
                  <div style={{fontSize:32,marginBottom:8}}>⚖️</div>
                  <div style={{fontSize:13}}>Belum ada data</div>
                  <div style={{fontSize:11,marginTop:4}}>Catat berat setiap Senin pagi di tab Hari Ini</div>
                </div>
              ) : wEntries.slice(-10).reverse().map(([date,w],i,arr)=>{
                const prev = arr[i+1];
                const diff = prev ? w-prev[1] : 0;
                const d = new Date(date);
                return (
                  <div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                    <span style={{color:"#475569",fontSize:13}}>{d.getDate()} {MONTHS[d.getMonth()].slice(0,3)}</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      {diff!==0 && <span style={{fontSize:12,color:diff<0?"#4ade80":"#f87171",fontWeight:700}}>{diff<0?"▼":"▲"} {Math.abs(diff).toFixed(1)} kg</span>}
                      <span style={{fontWeight:900,color:"#4ade80",fontSize:17}}>{w} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── JADWAL TAB ─── */}
        {tab==="jadwal" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontWeight:800,marginBottom:12}}>🍽️ Jadwal Makan Harian</div>
              {MEAL_SCHEDULE.map((m,i)=>{
                const [h,mn]=m.time.split(":").map(Number);
                const isPast=(h+mn/60)<nowH && dk===tdk;
                const isNext=m===nextMeal && dk===tdk;
                return (
                  <div key={i} style={{borderRadius:12,padding:"12px",marginBottom:8,borderLeft:`3px solid ${isNext?m.color:isPast?"#1e293b":"#1e293b"}`,background:isNext?`${m.color}08`:isPast?"rgba(255,255,255,0.01)":"rgba(255,255,255,0.03)",opacity:isPast?0.55:1,transition:"all 0.2s",border:`1px solid ${isNext?m.color+"44":"rgba(255,255,255,0.06)"}`,borderLeft:`3px solid ${isNext?m.color:isPast?"#1e293b":"rgba(255,255,255,0.1)"}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{fontWeight:800}}>{m.icon} {m.label}</div>
                      <div style={{display:"flex",gap:6}}>
                        <span style={{background:`${m.color}22`,color:m.color,borderRadius:99}} className="pill">{m.cal} kkal</span>
                        <span style={{background:"rgba(255,255,255,0.06)",color:"#94a3b8",borderRadius:99}} className="pill">{m.time}</span>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"#64748b"}}>{m.menu}</div>
                    {isNext && <div style={{fontSize:11,color:m.color,fontWeight:700,marginTop:6}}>⏰ Waktunya makan sebentar lagi!</div>}
                  </div>
                );
              })}
              <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,padding:"10px 12px"}}>
                <div style={{fontWeight:800,fontSize:12,color:"#f87171"}}>🚫 Setelah 21:00 — Stop Makan</div>
                <div style={{fontSize:12,color:"#475569",marginTop:2}}>Minum air putih saja kalau lapar</div>
              </div>
            </div>

            <div className="card" style={{marginBottom:12}}>
              <div style={{fontWeight:800,marginBottom:10}}>💧 Jadwal Minum Air</div>
              {["06:00","07:30","09:00","10:30","12:00","14:00","16:00","19:00"].map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<7?"1px solid rgba(255,255,255,0.05)":"none"}}>
                  <span style={{color:"#38bdf8",fontWeight:700,fontSize:13}}>{t}</span>
                  <span style={{fontSize:13}}>💧 1 gelas air putih</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{fontWeight:800,marginBottom:12}}>📋 Rutinitas Harian</div>
              {[
                {t:"05:30",a:"☀️ Bangun tidur",c:"#fbbf24"},
                {t:"05:30–06:00",a:"🌞 Jemur matahari 10–15 mnt + 2 gelas air",c:"#fbbf24"},
                {t:"06:00–06:30",a:"🌅 Sarapan ~350 kkal",c:"#4ade80"},
                {t:"07:00–12:00",a:"📚 Kuliah D3",c:"#60a5fa"},
                {t:"10:00",a:"🍎 Snack pagi ~100 kkal",c:"#4ade80"},
                {t:"12:00–13:00",a:"☀️ Makan siang ~450 kkal",c:"#4ade80"},
                {t:"13:00–16:00",a:"📖 Kuliah / Belajar",c:"#60a5fa"},
                {t:"15:00",a:"🌿 Snack sore ~150 kkal",c:"#4ade80"},
                {t:"16:00–17:00",a:"💪 Olahraga sesuai jadwal",c:"#f87171"},
                {t:"17:00–17:30",a:"🚿 Mandi + istirahat",c:"#94a3b8"},
                {t:"18:00–19:00",a:"🌙 Makan malam ~350 kkal",c:"#4ade80"},
                {t:"19:00–21:00",a:"📝 Belajar / Tugas kuliah",c:"#60a5fa"},
                {t:"21:00",a:"🚫 Stop makan — air putih saja",c:"#f87171"},
                {t:"22:00",a:"📵 Kurangi layar HP",c:"#94a3b8"},
                {t:"22:30",a:"😴 Tidur — target 8 jam!",c:"#a78bfa"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:i<14?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <div style={{fontSize:11,color:item.c,fontWeight:700,minWidth:86,flexShrink:0}}>{item.t}</div>
                  <div style={{fontSize:13,color:"#94a3b8"}}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{textAlign:"center",padding:"20px 0 8px",fontSize:11,color:"#1e293b"}}>FitTrack Pro • dibuat khusus untuk Arbi 💚</div>
      </div>
    </div>
  );
}
