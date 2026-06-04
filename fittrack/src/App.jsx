import { useState, useEffect } from "react";

const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const MEAL_SCHEDULE = [
  { time: "06:00", label: "Sarapan", icon: "🌅", cal: 350, menu: "Oat + pisang / Nasi merah + telur rebus + sayur" },
  { time: "10:00", label: "Snack Pagi", icon: "🍎", cal: 100, menu: "Buah (apel/pepaya) / Segelas susu rendah lemak" },
  { time: "12:00", label: "Makan Siang", icon: "☀️", cal: 450, menu: "Nasi merah porsi sedang + ayam/tahu/tempe + sayur" },
  { time: "15:00", label: "Snack Sore", icon: "🌿", cal: 150, menu: "Buah / Jagung rebus / Kacang tanpa garam" },
  { time: "18:00", label: "Makan Malam", icon: "🌙", cal: 350, menu: "Porsi kecil nasi merah + protein + sayur banyak" },
];

const WORKOUT_SCHEDULE = {
  1: { label: "Full Body Workout", icon: "💪", duration: "30–45 menit", exercises: ["Squat 3x15","Push-up 3x12","Plank 3x30 detik","Jumping Jack 3x30","Burpees 3x10"], type: "app" },
  2: { label: "Cardio — Jalan/Jogging", icon: "🏃", duration: "30 menit", exercises: ["Jalan cepat / Jogging santai","Lompat tali (opsional)","Cool down stretching"], type: "cardio" },
  3: { label: "Upper Body + Core", icon: "🔥", duration: "30–45 menit", exercises: ["Push-up 3x15","Tricep dips 3x12","Mountain climbers 3x20","Plank 3x45 detik","Sit-up 3x20"], type: "app" },
  4: { label: "Istirahat Aktif", icon: "🧘", duration: "20–30 menit", exercises: ["Jalan santai 20 menit","Full body stretching","Chin tuck (postur dagu)"], type: "light" },
  5: { label: "Lower Body + Cardio", icon: "🦵", duration: "30–45 menit", exercises: ["Squat 4x15","Lunges 3x12","Glute bridge 3x15","High knees 3x30","Jumping jack 3x30"], type: "app" },
  6: { label: "Cardio Bebas", icon: "⚡", duration: "30–40 menit", exercises: ["Jogging 20 menit","Jumping jack 3x40","Burpees 3x10","Cool down"], type: "cardio" },
  0: { label: "Rest Total", icon: "😴", duration: "Istirahat penuh", exercises: ["Tidur cukup 8 jam","Pemulihan otot","Hidrasi baik"], type: "rest" },
};

const FOOD_DB = [
  { name: "Nasi Putih (100g)", cal: 130, protein: 2.7, carb: 28, fat: 0.3 },
  { name: "Nasi Merah (100g)", cal: 110, protein: 2.5, carb: 23, fat: 0.9 },
  { name: "Oatmeal (100g)", cal: 389, protein: 17, carb: 66, fat: 7 },
  { name: "Telur Rebus (1 butir)", cal: 78, protein: 6, carb: 0.6, fat: 5 },
  { name: "Dada Ayam (100g)", cal: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: "Tahu (100g)", cal: 76, protein: 8, carb: 1.9, fat: 4.8 },
  { name: "Tempe (100g)", cal: 193, protein: 19, carb: 9, fat: 11 },
  { name: "Pisang (1 buah)", cal: 89, protein: 1.1, carb: 23, fat: 0.3 },
  { name: "Apel (1 buah)", cal: 52, protein: 0.3, carb: 14, fat: 0.2 },
  { name: "Pepaya (100g)", cal: 43, protein: 0.5, carb: 11, fat: 0.3 },
  { name: "Bayam (100g)", cal: 23, protein: 2.9, carb: 3.6, fat: 0.4 },
  { name: "Brokoli (100g)", cal: 34, protein: 2.8, carb: 7, fat: 0.4 },
  { name: "Susu Rendah Lemak (200ml)", cal: 102, protein: 8, carb: 12, fat: 2.5 },
  { name: "Mie Instan (1 bungkus)", cal: 380, protein: 8, carb: 52, fat: 14 },
  { name: "Gorengan (1 buah)", cal: 150, protein: 3, carb: 15, fat: 9 },
  { name: "Es Teh Manis (1 gelas)", cal: 90, protein: 0, carb: 23, fat: 0 },
  { name: "Kacang Tanah (30g)", cal: 170, protein: 7, carb: 5, fat: 15 },
  { name: "Jagung Rebus (1 buah)", cal: 96, protein: 3.4, carb: 21, fat: 1.5 },
];

const CALORIE_TARGET = 1500;
const PROTEIN_TARGET = 80;
const WATER_TARGET = 8;

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function getTodayData(storage, dateKey) {
  const raw = storage[dateKey];
  if (raw) return raw;
  return { foods: [], water: 0, weight: null, workoutDone: false, notes: "" };
}

export default function HealthTracker() {
  const [today] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [storage, setStorage] = useState({});
  const [weights, setWeights] = useState({});
  const [activeTab, setActiveTab] = useState("today");
  const [foodSearch, setFoodSearch] = useState("");
  const [customFood, setCustomFood] = useState({ name: "", cal: "", protein: "", carb: "", fat: "" });
  const [showCustom, setShowCustom] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  // === FITUR SCAN FOTO MAKANAN ===
  const [showPhotoScan, setShowPhotoScan] = useState(false);
  const [scanImage, setScanImage] = useState(null); // base64
  const [scanImagePreview, setScanImagePreview] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { name, cal, protein, carb, fat, confidence, needsQuestions }
  const [scanQuestions, setScanQuestions] = useState([]); // array of {question, options, key}
  const [scanAnswers, setScanAnswers] = useState({});
  const [scanStep, setScanStep] = useState("upload"); // upload | loading | result | questions | confirm
  const [scanMediaType, setScanMediaType] = useState("image/jpeg");
  const [scanPortions, setScanPortions] = useState(1);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const mt = file.type || "image/jpeg";
    setScanMediaType(mt);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Full = ev.target.result;
      setScanImagePreview(base64Full);
      setScanImage(base64Full.split(",")[1]);
      setScanStep("preview");
    };
    reader.readAsDataURL(file);
  }

  async function callGemini(prompt, maxTokens = 3000) {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    if (!apiKey) throw new Error("API key Gemini belum diset di file .env");
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: scanMediaType || "image/jpeg", data: scanImage } },
              { text: prompt }
            ]}],
            generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens, responseMimeType: "application/json" }
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI tidak mengembalikan format yang benar, coba lagi");
        return JSON.parse(jsonMatch[0]);
      }
      const err = await response.json();
      const msg = err?.error?.message || `HTTP ${response.status}`;
      const isServerBusy = response.status === 503 || msg.toLowerCase().includes("high demand") || msg.toLowerCase().includes("overloaded");
      if (isServerBusy && attempt < maxRetries) {
        // Tunggu makin lama tiap percobaan: 3s, 6s, 9s
        await new Promise(r => setTimeout(r, attempt * 3000));
        continue;
      }
      throw new Error(msg);
    }
  }

  async function analyzeFood() {
    if (!scanImage) return;
    setScanStep("loading");
    setScanLoading(true);
    try {
      const prompt = `Kamu adalah ahli gizi profesional. Analisis foto makanan ini.

INSTRUKSI: Balas HANYA dengan JSON murni, tidak ada teks lain, tidak ada markdown, tidak ada penjelasan.

Format JSON yang harus dikembalikan:
{"detected":true,"confidence":90,"foodName":"nama makanan","description":"deskripsi singkat","portionEstimate":"250g","cal":400,"protein":15.0,"carb":55.0,"fat":12.0,"breakdown":[{"item":"nama bahan","weight":"100g","cal":200,"protein":8,"carb":30,"fat":5}],"needsQuestions":false,"questions":[]}

Jika makanan tidak jelas, set needsQuestions:true dan isi questions seperti:
{"detected":false,"confidence":50,"foodName":"Tidak terdeteksi","description":"gambar tidak jelas","portionEstimate":"","cal":0,"protein":0,"carb":0,"fat":0,"breakdown":[],"needsQuestions":true,"questions":[{"key":"size","question":"Seberapa besar porsinya?","options":["Kecil 150g","Sedang 250g","Besar 400g"]},{"key":"cooking","question":"Cara memasak?","options":["Direbus","Ditumis","Digoreng"]}]}

Gunakan data gizi standar Indonesia. Balas JSON saja, mulai dari { dan akhiri dengan }.`;

      const parsed = await callGemini(prompt, 3000);
      setScanResult(parsed);
      if (parsed.needsQuestions && parsed.questions?.length > 0) {
        setScanQuestions(parsed.questions);
        setScanAnswers({});
        setScanStep("questions");
      } else {
        setScanStep("result");
      }
    } catch (err) {
      setScanResult({ error: true, message: `Analisis gagal: ${err.message}` });
      setScanStep("result");
    }
    setScanLoading(false);
  }

  async function analyzeWithAnswers() {
    if (!scanImage) return;
    setScanStep("loading");
    setScanLoading(true);
    try {
      const answersText = scanQuestions.map(q => `${q.question}: ${scanAnswers[q.key] || "tidak dijawab"}`).join("\n");
      const prompt = `Kamu adalah ahli gizi profesional. Hitung nilai gizi makanan berdasarkan jawaban berikut:
${answersText}

INSTRUKSI: Balas HANYA dengan JSON murni, mulai dari { dan akhiri dengan }, tidak ada teks lain.
Format: {"detected":true,"confidence":85,"foodName":"nama makanan","portionEstimate":"250g","cal":350,"protein":12.0,"carb":48.0,"fat":9.0,"breakdown":[],"needsQuestions":false,"questions":[]}`;

      const parsed = await callGemini(prompt, 2000);
      setScanResult(parsed);
      setScanStep("result");
    } catch (err) {
      setScanResult({ error: true, message: `Analisis gagal: ${err.message}` });
      setScanStep("result");
    }
    setScanLoading(false);
  }

  function confirmScanFood() {
    if (!scanResult || scanResult.error) return;
    addFood({
      name: scanPortions !== 1 ? `${scanResult.foodName} (${scanPortions}x)` : scanResult.foodName,
      cal: Math.round(scanResult.cal * scanPortions),
      protein: parseFloat((scanResult.protein * scanPortions).toFixed(1)),
      carb: parseFloat((scanResult.carb * scanPortions).toFixed(1)),
      fat: parseFloat((scanResult.fat * scanPortions).toFixed(1)),
    });
    setShowPhotoScan(false);
    setScanStep("upload");
    setScanImage(null);
    setScanImagePreview(null);
    setScanResult(null);
    setScanQuestions([]);
    setScanAnswers({});
    setScanPortions(1);
  }

  function resetScan() {
    setScanStep("upload");
    setScanImage(null);
    setScanImagePreview(null);
    setScanResult(null);
    setScanQuestions([]);
    setScanAnswers({});
    setScanPortions(1);
  }

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("ht_data") || "{}");
      const w = JSON.parse(localStorage.getItem("ht_weights") || "{}");
      setStorage(s);
      setWeights(w);
    } catch {}
  }, []);

  const dateKey = getDateKey(selectedDate);
  const dayData = getTodayData(storage, dateKey);
  const todayKey = getDateKey(today);
  const dayOfWeek = selectedDate.getDay();
  const workout = WORKOUT_SCHEDULE[dayOfWeek];

  const totalCal = dayData.foods.reduce((s, f) => s + f.cal, 0);
  const totalProtein = dayData.foods.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarb = dayData.foods.reduce((s, f) => s + (f.carb || 0), 0);
  const totalFat = dayData.foods.reduce((s, f) => s + (f.fat || 0), 0);
  const calLeft = CALORIE_TARGET - totalCal;

  function save(newDayData) {
    const newStorage = { ...storage, [dateKey]: newDayData };
    setStorage(newStorage);
    try { localStorage.setItem("ht_data", JSON.stringify(newStorage)); } catch {}
  }

  function addFood(food) {
    const newFoods = [...dayData.foods, { ...food, id: Date.now() }];
    save({ ...dayData, foods: newFoods });
    setFoodSearch("");
  }

  function removeFood(id) {
    save({ ...dayData, foods: dayData.foods.filter(f => f.id !== id) });
  }

  function addWater() { save({ ...dayData, water: Math.min(dayData.water + 1, 20) }); }
  function removeWater() { save({ ...dayData, water: Math.max(dayData.water - 1, 0) }); }
  function toggleWorkout() { save({ ...dayData, workoutDone: !dayData.workoutDone }); }

  function saveWeight() {
    if (!weightInput) return;
    const newW = { ...weights, [dateKey]: parseFloat(weightInput) };
    setWeights(newW);
    try { localStorage.setItem("ht_weights", JSON.stringify(newW)); } catch {}
    setWeightInput("");
  }

  function addCustomFood() {
    if (!customFood.name || !customFood.cal) return;
    addFood({ name: customFood.name, cal: +customFood.cal, protein: +customFood.protein || 0, carb: +customFood.carb || 0, fat: +customFood.fat || 0 });
    setCustomFood({ name: "", cal: "", protein: "", carb: "", fat: "" });
    setShowCustom(false);
  }

  const filteredFoods = foodSearch ? FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())) : [];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const k = getDateKey(d);
    const dd = getTodayData(storage, k);
    return { label: DAYS[d.getDay()].slice(0, 3), cal: dd.foods.reduce((s, f) => s + f.cal, 0), water: dd.water, workout: dd.workoutDone, weight: weights[k] || null };
  });

  const weightEntries = Object.entries(weights).sort(([a], [b]) => a.localeCompare(b));
  const startWeight = 70;
  const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1][1] : startWeight;
  const weightLost = startWeight - currentWeight;

  const calPct = Math.min((totalCal / CALORIE_TARGET) * 100, 100);
  const waterPct = Math.min((dayData.water / WATER_TARGET) * 100, 100);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const nextMeal = MEAL_SCHEDULE.find(m => {
    const [h, min] = m.time.split(":").map(Number);
    return h + min / 60 > currentHour;
  });

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e8eaf0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1d2e; }
        ::-webkit-scrollbar-thumb { background: #4ade80; border-radius: 2px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }
        .card { background: #1a1d2e; border-radius: 16px; padding: 16px; border: 1px solid #252840; animation: fadeIn 0.3s ease; }
        .btn-green { background: linear-gradient(135deg, #4ade80, #22c55e); color: #0f1117; border: none; border-radius: 10px; padding: 8px 16px; font-family: 'Nunito', sans-serif; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .btn-green:hover { transform: translateY(-1px); box-shadow: 0 4px 15px #4ade8044; }
        .btn-outline { background: transparent; color: #4ade80; border: 1.5px solid #4ade80; border-radius: 10px; padding: 7px 14px; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-outline:hover { background: #4ade8022; }
        .tab { padding: 8px 14px; border-radius: 10px; border: none; background: transparent; color: #888; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 12px; white-space: nowrap; }
        .tab.active { background: #252840; color: #4ade80; }
        .input-dark { background: #252840; border: 1.5px solid #333660; border-radius: 10px; color: #e8eaf0; padding: 8px 12px; font-family: 'Nunito', sans-serif; font-size: 14px; width: 100%; transition: border 0.2s; }
        .input-dark:focus { border-color: #4ade80; outline: none; }
        .prog-bar-bg { background: #252840; border-radius: 99px; overflow: hidden; }
        .prog-bar { background: linear-gradient(90deg, #4ade80, #22d3ee); border-radius: 99px; transition: width 0.5s ease; height: 100%; }
        .prog-bar.danger { background: linear-gradient(90deg, #f87171, #ef4444); }
        .prog-bar.warning { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
        .food-item { background: #252840; border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .meal-card { background: #252840; border-radius: 12px; padding: 12px; margin-bottom: 8px; border-left: 3px solid #4ade80; }
        .meal-card.past { border-left-color: #555; opacity: 0.6; }
        .meal-card.next { border-left-color: #22d3ee; box-shadow: 0 0 15px #22d3ee22; animation: pulse 2s infinite; }
        .stat-mini { background: #252840; border-radius: 12px; padding: 12px; text-align: center; flex: 1; }
        .badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; display: inline-block; }
        .exercise-tag { background: #1a3a2a; color: #4ade80; border-radius: 8px; padding: 5px 10px; font-size: 12px; font-weight: 700; margin: 3px; display: inline-block; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0f1117", padding: "16px 16px 0", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #252840" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg, #4ade80, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                FitTrack 💚
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>
                {DAYS[today.getDay()]}, {today.getDate()} {MONTHS[today.getMonth()]} 2026
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#888" }}>Berat Saat Ini</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#4ade80" }}>{currentWeight} kg</div>
              {weightLost > 0 && <div style={{ fontSize: 11, color: "#22d3ee" }}>-{weightLost.toFixed(1)} kg turun 🎉</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {["today","makan","olahraga","progress","jadwal"].map(t => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t === "today" ? "🏠 Hari Ini" : t === "makan" ? "🍽️ Makan" : t === "olahraga" ? "💪 Olahraga" : t === "progress" ? "📊 Progress" : "📅 Jadwal"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>

        {/* TODAY TAB */}
        {activeTab === "today" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btn-outline" style={{ padding: "6px 12px" }} onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); }}>‹</button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{dateKey === todayKey ? "Hari Ini" : `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{DAYS[dayOfWeek]}</div>
              </div>
              <button className="btn-outline" style={{ padding: "6px 12px" }} onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); if(d <= today) setSelectedDate(d); }}>›</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div className="stat-mini">
                <div style={{ fontSize: 20, fontWeight: 900, color: calLeft < 0 ? "#f87171" : "#4ade80" }}>{totalCal}</div>
                <div style={{ fontSize: 10, color: "#888" }}>Kalori Masuk</div>
              </div>
              <div className="stat-mini">
                <div style={{ fontSize: 20, fontWeight: 900, color: calLeft < 0 ? "#f87171" : "#22d3ee" }}>{Math.abs(calLeft)}</div>
                <div style={{ fontSize: 10, color: "#888" }}>{calLeft < 0 ? "Kelebihan" : "Sisa"}</div>
              </div>
              <div className="stat-mini">
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>{dayData.water}</div>
                <div style={{ fontSize: 10, color: "#888" }}>Gelas Air</div>
              </div>
              <div className="stat-mini">
                <div style={{ fontSize: 20, fontWeight: 900, color: dayData.workoutDone ? "#4ade80" : "#888" }}>{dayData.workoutDone ? "✓" : "○"}</div>
                <div style={{ fontSize: 10, color: "#888" }}>Olahraga</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 800 }}>Kalori Harian</span>
                <span style={{ fontSize: 13, color: "#888" }}>Target: {CALORIE_TARGET} kkal</span>
              </div>
              <div className="prog-bar-bg" style={{ height: 14, marginBottom: 10 }}>
                <div className={`prog-bar ${calPct > 100 ? "danger" : calPct > 85 ? "warning" : ""}`} style={{ width: `${calPct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                <span>Protein: <b style={{ color: "#4ade80" }}>{totalProtein.toFixed(0)}g</b>/{PROTEIN_TARGET}g</span>
                <span>Karbo: <b style={{ color: "#fbbf24" }}>{totalCarb.toFixed(0)}g</b></span>
                <span>Lemak: <b style={{ color: "#f87171" }}>{totalFat.toFixed(0)}g</b></span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 800 }}>💧 Air Putih</span>
                <span style={{ fontSize: 13, color: "#888" }}>{dayData.water}/{WATER_TARGET} gelas</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {Array.from({ length: WATER_TARGET }, (_, i) => (
                  <div key={i} style={{ fontSize: 22, filter: i < dayData.water ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.2s" }}>💧</div>
                ))}
              </div>
              <div className="prog-bar-bg" style={{ height: 8, marginBottom: 10 }}>
                <div className="prog-bar" style={{ width: `${waterPct}%`, background: "linear-gradient(90deg, #60a5fa, #22d3ee)" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ width: 38, height: 38, borderRadius: 99, border: "none", background: "#252840", color: "#888", fontSize: 18, cursor: "pointer" }} onClick={removeWater}>−</button>
                <button className="btn-green" style={{ flex: 1 }} onClick={addWater}>+ Tambah 1 Gelas</button>
              </div>
            </div>

            {nextMeal && dateKey === todayKey && (
              <div className="card" style={{ marginBottom: 12, border: "1px solid #22d3ee44", background: "#0d1f2d" }}>
                <div style={{ fontSize: 11, color: "#22d3ee", fontWeight: 800, marginBottom: 4 }}>⏰ JADWAL MAKAN BERIKUTNYA</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{nextMeal.icon} {nextMeal.label} — {nextMeal.time}</div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{nextMeal.menu}</div>
                <div style={{ marginTop: 6 }}><span className="badge" style={{ background: "#1a3a2a", color: "#4ade80" }}>~{nextMeal.cal} kkal</span></div>
              </div>
            )}

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{workout.icon} {workout.label}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{workout.duration}</div>
                </div>
                <button className={dayData.workoutDone ? "btn-green" : "btn-outline"} onClick={toggleWorkout} style={{ fontSize: 12 }}>
                  {dayData.workoutDone ? "✓ Selesai!" : "Tandai Selesai"}
                </button>
              </div>
              <div>{workout.exercises.slice(0, 3).map(e => <span key={e} className="exercise-tag">{e}</span>)}</div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>⚖️ Catat Berat Badan</div>
              {weights[dateKey] ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#4ade80" }}>{weights[dateKey]} kg</span>
                  <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => { const w = { ...weights }; delete w[dateKey]; setWeights(w); try { localStorage.setItem("ht_weights", JSON.stringify(w)); } catch {} }}>Ubah</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input-dark" type="number" placeholder="Berat sekarang (kg)" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn-green" onClick={saveWeight}>Simpan</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAKAN TAB */}
        {activeTab === "makan" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>

            {/* ===== PHOTO SCAN MODAL ===== */}
            {showPhotoScan && (
              <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ background: "#1a1d2e", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: 20, maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 900, fontSize: 17, background: "linear-gradient(135deg, #4ade80, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      📸 Scan Makanan AI
                    </div>
                    <button onClick={() => { setShowPhotoScan(false); resetScan(); }} style={{ background: "none", border: "none", color: "#888", fontSize: 22, cursor: "pointer" }}>×</button>
                  </div>

                  {/* STEP: UPLOAD */}
                  {(scanStep === "upload" || scanStep === "preview") && (
                    <div>
                      {!scanImagePreview ? (
                        <label style={{ display: "block", border: "2px dashed #4ade8066", borderRadius: 16, padding: 32, textAlign: "center", cursor: "pointer", background: "#0f1117" }}>
                          <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
                          <div style={{ fontWeight: 800, color: "#4ade80", marginBottom: 4 }}>Foto Makananmu</div>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Tap untuk ambil foto atau pilih dari galeri</div>
                          <div style={{ fontSize: 11, color: "#555" }}>AI akan mendeteksi kalori, protein, karbo & lemak secara otomatis</div>
                          <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: "none" }} />
                        </label>
                      ) : (
                        <div>
                          <img src={scanImagePreview} alt="preview" style={{ width: "100%", borderRadius: 14, maxHeight: 260, objectFit: "cover", marginBottom: 12 }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-outline" style={{ flex: 1, fontSize: 13 }} onClick={resetScan}>🔄 Ganti Foto</button>
                            <button className="btn-green" style={{ flex: 2 }} onClick={analyzeFood}>🔍 Analisis AI Sekarang</button>
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 12, background: "#252840", borderRadius: 10, padding: 10, fontSize: 11, color: "#888" }}>
                        <div style={{ fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>💡 Tips untuk hasil terbaik:</div>
                        <div>• Foto dari atas (bird-eye view) untuk estimasi porsi lebih akurat</div>
                        <div>• Pastikan pencahayaan cukup terang</div>
                        <div>• Sertakan alat makan sebagai referensi ukuran</div>
                      </div>
                    </div>
                  )}

                  {/* STEP: LOADING */}
                  {scanStep === "loading" && (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <div style={{ fontSize: 52, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🧠</div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#4ade80", marginBottom: 8 }}>AI Sedang Menganalisis...</div>
                      <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Mendeteksi bahan makanan & menghitung nilai gizi</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#555", textAlign: "left", background: "#0f1117", borderRadius: 10, padding: 12 }}>
                        <div>✦ Mengidentifikasi jenis makanan...</div>
                        <div>✦ Mengestimasi porsi & berat...</div>
                        <div>✦ Menghitung kalori & makronutrien...</div>
                        <div>✦ Jika server sibuk, otomatis coba ulang (maks 3x)...</div>
                      </div>
                    </div>
                  )}

                  {/* STEP: QUESTIONS */}
                  {scanStep === "questions" && (
                    <div>
                      <div style={{ background: "#0f1117", borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 13, color: "#fbbf24" }}>
                        ⚠️ AI tidak bisa memastikan 100% dari foto saja. Jawab beberapa pertanyaan berikut untuk hasil yang lebih akurat:
                      </div>
                      {scanResult?.description && (
                        <div style={{ background: "#252840", borderRadius: 10, padding: 10, marginBottom: 12, fontSize: 12, color: "#aaa" }}>
                          👁️ AI melihat: <span style={{ color: "#e8eaf0" }}>{scanResult.description}</span>
                        </div>
                      )}
                      {scanQuestions.map((q, qi) => (
                        <div key={q.key} style={{ marginBottom: 14 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#e8eaf0" }}>{qi + 1}. {q.question}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {q.options.map(opt => (
                              <button key={opt} onClick={() => setScanAnswers(a => ({ ...a, [q.key]: opt }))}
                                style={{ padding: "8px 14px", borderRadius: 99, border: `1.5px solid ${scanAnswers[q.key] === opt ? "#4ade80" : "#333660"}`, background: scanAnswers[q.key] === opt ? "#1a3a2a" : "#252840", color: scanAnswers[q.key] === opt ? "#4ade80" : "#aaa", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button className="btn-green" style={{ width: "100%", marginTop: 8 }}
                        onClick={analyzeWithAnswers}
                        disabled={scanQuestions.some(q => !scanAnswers[q.key])}>
                        {scanQuestions.some(q => !scanAnswers[q.key]) ? "Jawab semua pertanyaan dulu" : "✓ Hitung Nilai Gizi"}
                      </button>
                    </div>
                  )}

                  {/* STEP: RESULT */}
                  {scanStep === "result" && scanResult && !scanResult.error && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#e8eaf0" }}>{scanResult.foodName}</div>
                        <span className="badge" style={{ background: scanResult.confidence >= 80 ? "#1a3a2a" : "#2d1515", color: scanResult.confidence >= 80 ? "#4ade80" : "#f87171", fontSize: 10 }}>
                          {scanResult.confidence}% akurat
                        </span>
                      </div>
                      {scanResult.portionEstimate && (
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>📦 Estimasi porsi: {scanResult.portionEstimate}</div>
                      )}

                      {/* Makro besar */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                        {[
                          { label: "Kalori", val: Math.round(scanResult.cal), unit: "kkal", color: "#4ade80", icon: "🔥" },
                          { label: "Protein", val: scanResult.protein?.toFixed(1), unit: "g", color: "#22d3ee", icon: "💪" },
                          { label: "Karbo", val: scanResult.carb?.toFixed(1), unit: "g", color: "#fbbf24", icon: "🌾" },
                          { label: "Lemak", val: scanResult.fat?.toFixed(1), unit: "g", color: "#f87171", icon: "🧈" },
                        ].map(m => (
                          <div key={m.label} style={{ background: "#252840", borderRadius: 12, padding: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
                            <div style={{ fontWeight: 900, fontSize: 16, color: m.color }}>{m.val}</div>
                            <div style={{ fontSize: 9, color: "#666" }}>{m.unit}</div>
                            <div style={{ fontSize: 9, color: "#888" }}>{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Breakdown */}
                      {scanResult.breakdown?.length > 0 && (
                        <div style={{ background: "#0f1117", borderRadius: 12, padding: 10, marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", marginBottom: 8 }}>📊 Rincian per Bahan:</div>
                          {scanResult.breakdown.map((b, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 0", borderBottom: i < scanResult.breakdown.length - 1 ? "1px solid #1f2235" : "none" }}>
                              <div>
                                <span style={{ color: "#e8eaf0" }}>{b.item}</span>
                                <span style={{ color: "#555", marginLeft: 6 }}>({b.weight})</span>
                              </div>
                              <div style={{ color: "#4ade80", fontWeight: 700 }}>{b.cal} kkal</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {scanResult.confidence < 80 && (
                        <div style={{ background: "#2d1f00", border: "1px solid #fbbf2444", borderRadius: 10, padding: 10, fontSize: 11, color: "#fbbf24", marginBottom: 12 }}>
                          ⚠️ Kepercayaan AI {scanResult.confidence}% — Nilai gizi mungkin tidak 100% akurat. Kamu bisa edit setelah ditambahkan.
                        </div>
                      )}

                      {/* PENGATUR PORSI */}
                      <div style={{ background: "#252840", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 8 }}>🍽️ Berapa porsi yang dimakan?</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                          <button onClick={() => setScanPortions(p => Math.max(0.5, parseFloat((p - 0.5).toFixed(1))))}
                            style={{ width: 36, height: 36, borderRadius: 99, border: "2px solid #4ade80", background: "none", color: "#4ade80", fontSize: 20, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 900, fontSize: 28, color: "#4ade80" }}>{scanPortions}</div>
                            <div style={{ fontSize: 10, color: "#666" }}>porsi</div>
                          </div>
                          <button onClick={() => setScanPortions(p => parseFloat((p + 0.5).toFixed(1)))}
                            style={{ width: 36, height: 36, borderRadius: 99, border: "2px solid #4ade80", background: "none", color: "#4ade80", fontSize: 20, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                        {scanPortions !== 1 && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
                            {[
                              { label: "Kalori", val: Math.round(scanResult.cal * scanPortions), color: "#4ade80" },
                              { label: "Protein", val: (scanResult.protein * scanPortions).toFixed(1) + "g", color: "#22d3ee" },
                              { label: "Karbo", val: (scanResult.carb * scanPortions).toFixed(1) + "g", color: "#fbbf24" },
                              { label: "Lemak", val: (scanResult.fat * scanPortions).toFixed(1) + "g", color: "#f87171" },
                            ].map(m => (
                              <div key={m.label} style={{ background: "#0f1117", borderRadius: 8, padding: 6, textAlign: "center" }}>
                                <div style={{ fontWeight: 900, fontSize: 13, color: m.color }}>{m.val}</div>
                                <div style={{ fontSize: 9, color: "#666" }}>{m.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-outline" style={{ flex: 1, fontSize: 12 }} onClick={resetScan}>🔄 Scan Ulang</button>
                        <button className="btn-green" style={{ flex: 2 }} onClick={confirmScanFood}>✓ Tambah ke Log</button>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {scanStep === "result" && scanResult?.error && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>😕</div>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Analisis Gagal</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{scanResult.message}</div>
                      <button className="btn-green" onClick={resetScan}>Coba Lagi</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* ===== END PHOTO SCAN MODAL ===== */}

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 800 }}>🍽️ Tambah Makanan</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ background: "linear-gradient(135deg, #22d3ee, #4ade80)", color: "#0f1117", border: "none", borderRadius: 10, padding: "7px 12px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }} onClick={() => setShowPhotoScan(true)}>
                    📸 Scan Foto
                  </button>
                  <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setShowCustom(!showCustom)}>
                    {showCustom ? "Tutup" : "+ Custom"}
                  </button>
                </div>
              </div>
              <input className="input-dark" placeholder="🔍 Cari makanan... (contoh: nasi, telur)" value={foodSearch} onChange={e => setFoodSearch(e.target.value)} style={{ marginBottom: 8 }} />

              {showCustom && (
                <div style={{ background: "#252840", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#4ade80" }}>✏️ Tambah Makanan Sendiri</div>
                  <input className="input-dark" placeholder="Nama makanan" value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})} style={{ marginBottom: 6 }} />
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input className="input-dark" type="number" placeholder="Kalori" value={customFood.cal} onChange={e => setCustomFood({...customFood, cal: e.target.value})} />
                    <input className="input-dark" type="number" placeholder="Protein g" value={customFood.protein} onChange={e => setCustomFood({...customFood, protein: e.target.value})} />
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input className="input-dark" type="number" placeholder="Karbo g" value={customFood.carb} onChange={e => setCustomFood({...customFood, carb: e.target.value})} />
                    <input className="input-dark" type="number" placeholder="Lemak g" value={customFood.fat} onChange={e => setCustomFood({...customFood, fat: e.target.value})} />
                  </div>
                  <button className="btn-green" style={{ width: "100%" }} onClick={addCustomFood}>Tambahkan ke Log</button>
                </div>
              )}

              {filteredFoods.length > 0 && (
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {filteredFoods.map(food => (
                    <div key={food.name} className="food-item" style={{ cursor: "pointer" }} onClick={() => addFood(food)}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{food.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>P:{food.protein}g  K:{food.carb}g  L:{food.fat}g</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge" style={{ background: "#1a3a2a", color: "#4ade80" }}>{food.cal}</span>
                        <span style={{ color: "#4ade80", fontSize: 18 }}>+</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {foodSearch && filteredFoods.length === 0 && (
                <div style={{ color: "#888", fontSize: 13, textAlign: "center", padding: 12 }}>Tidak ditemukan — gunakan tombol Custom</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[
                { label: "Kalori", val: totalCal, target: CALORIE_TARGET, unit: "kkal", color: "#4ade80" },
                { label: "Protein", val: Math.round(totalProtein), target: PROTEIN_TARGET, unit: "g", color: "#22d3ee" },
                { label: "Karbo", val: Math.round(totalCarb), target: 150, unit: "g", color: "#fbbf24" },
                { label: "Lemak", val: Math.round(totalFat), target: 50, unit: "g", color: "#f87171" },
              ].map(m => (
                <div key={m.label} className="stat-mini" style={{ padding: 8 }}>
                  <div style={{ fontSize: 10, color: "#888" }}>{m.label}</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: "#666" }}>{m.unit}</div>
                  <div className="prog-bar-bg" style={{ height: 4, marginTop: 4 }}>
                    <div className="prog-bar" style={{ width: `${Math.min((m.val/m.target)*100,100)}%`, background: m.color, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>📋 Log Makanan — {dateKey === todayKey ? "Hari Ini" : dateKey}</div>
              {dayData.foods.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 }}>
                  Belum ada makanan dicatat hari ini<br />
                  <span style={{ fontSize: 11 }}>Cari atau tambah makanan di atas</span>
                </div>
              ) : (
                <>
                  {dayData.foods.map(f => (
                    <div key={f.id} className="food-item">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>P:{f.protein}g  K:{f.carb}g  L:{f.fat}g</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge" style={{ background: "#1a3a2a", color: "#4ade80" }}>{f.cal}</span>
                        <button onClick={() => removeFood(f.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #333", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                    <span>TOTAL</span>
                    <span style={{ color: totalCal > CALORIE_TARGET ? "#f87171" : "#4ade80" }}>{totalCal} / {CALORIE_TARGET} kkal</span>
                  </div>
                  {totalCal > CALORIE_TARGET && (
                    <div style={{ marginTop: 8, background: "#2d1515", borderRadius: 8, padding: 8, fontSize: 12, color: "#f87171", textAlign: "center" }}>
                      ⚠️ Kelebihan {totalCal - CALORIE_TARGET} kkal hari ini
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* OLAHRAGA TAB */}
        {activeTab === "olahraga" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 12, border: workout.type === "rest" ? "1px solid #333" : "1px solid #4ade8044" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 36 }}>{workout.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6 }}>{workout.label}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{DAYS[dayOfWeek]} • {workout.duration}</div>
                </div>
                <button className={dayData.workoutDone ? "btn-green" : "btn-outline"} onClick={toggleWorkout}>
                  {dayData.workoutDone ? "✓ Selesai!" : "Tandai Selesai"}
                </button>
              </div>
              {dayData.workoutDone && (
                <div style={{ background: "#1a3a2a", borderRadius: 10, padding: 10, fontSize: 13, color: "#4ade80", fontWeight: 700, textAlign: "center" }}>
                  🎉 Keren! Olahraga hari ini sudah selesai!
                </div>
              )}
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>📋 Gerakan Hari Ini</div>
              {workout.exercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < workout.exercises.length - 1 ? "1px solid #252840" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 99, background: "#1a3a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#4ade80", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 12 }}>📅 Jadwal Olahraga Mingguan</div>
              {Object.entries(WORKOUT_SCHEDULE).map(([day, w]) => {
                const d = parseInt(day);
                const isToday = dayOfWeek === d && dateKey === todayKey;
                return (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", marginBottom: 4, borderRadius: 10, background: isToday ? "#1a3a2a" : "transparent" }}>
                    <div style={{ width: 40, fontSize: 12, color: isToday ? "#4ade80" : "#888", fontWeight: isToday ? 800 : 600 }}>{DAYS[d].slice(0,3)}</div>
                    <div style={{ fontSize: 20 }}>{w.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{w.label}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{w.duration}</div>
                    </div>
                    {isToday && <span className="badge" style={{ background: "#4ade8033", color: "#4ade80" }}>Hari Ini</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>⚖️ Progres Berat Badan</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Mulai", val: "70", unit: "kg", color: "#888" },
                  { label: "Sekarang", val: currentWeight.toString(), unit: "kg", color: "#4ade80" },
                  { label: "Turun", val: weightLost > 0 ? `-${weightLost.toFixed(1)}` : "0", unit: "kg", color: "#22d3ee" },
                  { label: "Target", val: "57", unit: "kg", color: "#fbbf24" },
                ].map(s => (
                  <div key={s.label} className="stat-mini" style={{ padding: 10 }}>
                    <div style={{ fontSize: 10, color: "#888" }}>{s.label}</div>
                    <div style={{ fontWeight: 900, fontSize: 17, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#666" }}>{s.unit}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Perjalanan ke target (70 → 57 kg)</div>
              <div className="prog-bar-bg" style={{ height: 14, marginBottom: 6 }}>
                <div className="prog-bar" style={{ width: `${Math.min(Math.max((weightLost / 13) * 100, 0), 100)}%` }} />
              </div>
              <div style={{ fontSize: 12, color: "#aaa", textAlign: "right" }}>{Math.min(Math.max(((weightLost / 13) * 100), 0), 100).toFixed(0)}% dari target akhir</div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>📊 Kalori 7 Hari Terakhir</div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                {last7.map((day, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>{day.cal || 0}</div>
                    <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 4 }}>
                      <div style={{
                        width: "80%", borderRadius: "4px 4px 0 0",
                        height: `${day.cal > 0 ? Math.max((day.cal / CALORIE_TARGET) * 80, 4) : 4}px`,
                        background: day.cal > CALORIE_TARGET ? "#f87171" : day.cal > 0 ? "linear-gradient(180deg, #4ade80, #22c55e)" : "#252840",
                        transition: "height 0.5s ease"
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{day.label}</div>
                    <div style={{ fontSize: 14 }}>{day.workout ? "✅" : "⬜"}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#666" }}>
                <span>🟩 Di bawah target</span>
                <span>🟥 Melebihi target</span>
                <span>✅ Olahraga selesai</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(() => {
                let streak = 0;
                for (let i = 6; i >= 0; i--) { if (last7[i].workout) streak++; else break; }
                const workoutCount = last7.filter(d => d.workout).length;
                const avgCal = last7.filter(d => d.cal > 0).reduce((s, d) => s + d.cal, 0) / Math.max(last7.filter(d => d.cal > 0).length, 1);
                return (
                  <>
                    <div className="card" style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>{streak}🔥</div>
                      <div style={{ fontSize: 11, color: "#888" }}>Streak Hari Ini</div>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#4ade80" }}>{workoutCount}/7</div>
                      <div style={{ fontSize: 11, color: "#888" }}>Olahraga Minggu Ini</div>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#22d3ee" }}>{Math.round(avgCal) || 0}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>Rata Kalori/Hari</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>📅 Riwayat Berat Badan</div>
              {weightEntries.length === 0 ? (
                <div style={{ color: "#888", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  Belum ada data berat.<br />
                  <span style={{ fontSize: 11 }}>Catat berat di tab Hari Ini setiap Senin pagi!</span>
                </div>
              ) : weightEntries.slice(-10).reverse().map(([date, w], i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? w - prev[1] : 0;
                return (
                  <div key={date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #252840" : "none" }}>
                    <span style={{ color: "#888", fontSize: 13 }}>{date}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {diff !== 0 && <span style={{ fontSize: 12, color: diff < 0 ? "#4ade80" : "#f87171" }}>{diff < 0 ? "▼" : "▲"} {Math.abs(diff).toFixed(1)} kg</span>}
                      <span style={{ fontWeight: 800, color: "#4ade80", fontSize: 16 }}>{w} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* JADWAL TAB */}
        {activeTab === "jadwal" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>🍽️ Jadwal Makan Harian</div>
              {MEAL_SCHEDULE.map((meal, i) => {
                const [h, m] = meal.time.split(":").map(Number);
                const mealHour = h + m / 60;
                const isPast = mealHour < currentHour && dateKey === todayKey;
                const isNext = meal === nextMeal && dateKey === todayKey;
                return (
                  <div key={i} className={`meal-card ${isPast ? "past" : isNext ? "next" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontWeight: 800 }}>{meal.icon} {meal.label}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span className="badge" style={{ background: "#1a3a2a", color: "#4ade80" }}>{meal.cal} kkal</span>
                        <span style={{ fontSize: 13, color: "#22d3ee", fontWeight: 700 }}>{meal.time}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa" }}>{meal.menu}</div>
                    {isNext && <div style={{ fontSize: 11, color: "#22d3ee", marginTop: 6, fontWeight: 700 }}>⏰ Jadwal makan berikutnya!</div>}
                    {isPast && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>✓ Sudah lewat</div>}
                  </div>
                );
              })}
              <div style={{ background: "#1a1118", borderRadius: 10, padding: 10, border: "1px solid #f8717144" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#f87171" }}>🚫 Setelah 21:00 — Stop Makan</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Minum air putih saja kalau lapar</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>💧 Jadwal Minum Air</div>
              {["06:00","07:30","09:00","10:30","12:00","14:00","16:00","19:00"].map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 7 ? "1px solid #252840" : "none", fontSize: 13 }}>
                  <span style={{ color: "#22d3ee", fontWeight: 700 }}>{t}</span>
                  <span>💧 1 gelas air putih</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontWeight: 800, marginBottom: 12 }}>📋 Rutinitas Harian Lengkap</div>
              {[
                { time: "05:30", act: "☀️ Bangun tidur", color: "#fbbf24" },
                { time: "05:30–06:00", act: "🌞 Jemur matahari 10–15 mnt + 2 gelas air", color: "#fbbf24" },
                { time: "06:00–06:30", act: "🌅 Sarapan (~350 kkal)", color: "#4ade80" },
                { time: "06:30–07:00", act: "🎒 Siap-siap kuliah", color: "#888" },
                { time: "07:00–12:00", act: "📚 Kuliah D3", color: "#888" },
                { time: "10:00", act: "🍎 Snack pagi (~100 kkal)", color: "#4ade80" },
                { time: "12:00–13:00", act: "☀️ Makan siang (~450 kkal)", color: "#4ade80" },
                { time: "13:00–16:00", act: "📖 Kuliah / Belajar", color: "#888" },
                { time: "15:00", act: "🌿 Snack sore (~150 kkal)", color: "#4ade80" },
                { time: "16:00–17:00", act: "💪 Olahraga sesuai jadwal", color: "#22d3ee" },
                { time: "17:00–17:30", act: "🚿 Mandi + istirahat", color: "#888" },
                { time: "18:00–19:00", act: "🌙 Makan malam (~350 kkal)", color: "#4ade80" },
                { time: "19:00–21:00", act: "📝 Belajar / Tugas kuliah", color: "#888" },
                { time: "21:00", act: "🚫 Stop makan — air putih saja", color: "#f87171" },
                { time: "22:00", act: "📵 Kurangi layar HP", color: "#888" },
                { time: "22:30", act: "😴 Tidur (target 8 jam!)", color: "#a78bfa" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: i < 15 ? "1px solid #1f2235" : "none" }}>
                  <div style={{ fontSize: 11, color: item.color, fontWeight: 700, minWidth: 80 }}>{item.time}</div>
                  <div style={{ fontSize: 13 }}>{item.act}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "16px 0", fontSize: 11, color: "#444" }}>
          FitTrack v1.0 • Data tersimpan lokal 💚
        </div>
      </div>
    </div>
  );
}