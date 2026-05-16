import Navbar from "../components/Navbar";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import imgNPK      from "../assets/pupuknpk.png";
import imgUrea     from "../assets/pupukurea.png";
import imgKCl      from "../assets/pupukkcl.png";
import imgTSP      from "../assets/pupuktsp.png";
import imgDolomit  from "../assets/pupukdolomit.png";
import imgMOP      from "../assets/pupukmop.png";
import imgKiserit  from "../assets/pupukkiserit.png";
import imgRP       from "../assets/pupukrp.png";
import imgPohon    from "../assets/pohonsawit.png";

// ─── Palm Leaf Decoration ─────────────────────────────────────
function PalmLeafLeft() {
  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 bottom-0 pointer-events-none select-none"
      style={{ height: "100%", width: "auto", opacity: 0.22 }}>
      <path d="M-10,200 C10,155 30,115 55,75" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20,165 C38,148 58,142 74,146 C57,150 36,160 20,165Z" fill="white" opacity="0.55"/>
      <path d="M20,165 C6,150 -8,144 -18,150 C-6,150 8,158 20,165Z" fill="white" opacity="0.45"/>
      <path d="M30,148 C50,128 72,121 90,124 C72,129 49,139 30,148Z" fill="white" opacity="0.5"/>
      <path d="M30,148 C15,133 -1,127 -14,132 C-1,133 15,141 30,148Z" fill="white" opacity="0.4"/>
      <path d="M40,130 C60,108 84,100 102,103 C83,108 59,119 40,130Z" fill="white" opacity="0.45"/>
      <path d="M50,112 C68,89 92,80 110,83 C90,89 65,101 50,112Z" fill="white" opacity="0.4"/>
      <path d="M-5,200 C20,148 50,100 82,55" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M18,163 C38,142 60,134 78,138 C60,143 37,153 18,163Z" fill="white" opacity="0.55"/>
      <path d="M32,142 C54,118 78,109 98,112 C78,118 53,129 32,142Z" fill="white" opacity="0.5"/>
      <path d="M48,118 C68,93 93,83 112,86 C91,93 64,106 48,118Z" fill="white" opacity="0.45"/>
      <path d="M5,200 C36,155 68,108 100,65" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M28,168 C46,148 66,140 84,144 C66,149 44,159 28,168Z" fill="white" opacity="0.4"/>
      <path d="M46,144 C64,122 86,114 104,117 C85,123 61,134 46,144Z" fill="white" opacity="0.38"/>
      <path d="M62,120 C79,98 100,90 118,93 C98,99 74,111 62,120Z" fill="white" opacity="0.34"/>
    </svg>
  );
}

// ─── Sidebar Kategori ─────────────────────────────────────────
function SidebarKategori({ aktif }) {
  // BUG FIX: Ganti href → to, dan <a> → <Link> agar tidak terjadi
  // full page reload saat navigasi sidebar antar kategori.
  const links = [
    { label: "Edukasi",             to: "/edukasi",             id: "edukasi"   },
    { label: "Hama & Penyakit",     to: "/hamadanpenyakit",     id: "hama"      },
    { label: "Pemupukan",           to: "/pemupukan",           id: "pemupukan" },
    { label: "Perawatan Kebun",     to: "/perawatankebunsawit", id: "perawatan" },
    { label: "Panen & Pasca Panen", to: "/panen",               id: "panen"     },
  ];
  return (
    <div className="w-full md:w-52 flex-shrink-0">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {links.map((k) => (
          <Link key={k.id} to={k.to}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              k.id === aktif ? "bg-green-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700"
            }`}>
            {k.label}
          </Link>
        ))}
      </div>
      {/* Desktop: vertical sidebar */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
        <p className="font-bold text-gray-900 text-sm mb-3 text-center">Kategori</p>
        <div className="flex flex-col gap-1.5">
          {links.map((k) => (
            <Link key={k.id} to={k.to}
              className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                k.id === aktif
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}>
              {k.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pupuk Metadata ───────────────────────────────────────────
const pupukMeta = {
  "Pupuk NPK":  { gradTop:"#16a34a", gradBot:"#14532d", badge:"NPK",  bgCard:"#f0fdf4", textColor:"#166534", img: imgNPK     },
  "Pupuk Urea": { gradTop:"#4ade80", gradBot:"#15803d", badge:"UREA", bgCard:"#dcfce7", textColor:"#166534", img: imgUrea    },
  "Pupuk KCl":  { gradTop:"#f59e0b", gradBot:"#b45309", badge:"KCl",  bgCard:"#fef9c3", textColor:"#92400e", img: imgKCl     },
  "Pupuk TSP":  { gradTop:"#a78bfa", gradBot:"#6d28d9", badge:"TSP",  bgCard:"#ede9fe", textColor:"#5b21b6", img: imgTSP     },
  "Dolomit":    { gradTop:"#94a3b8", gradBot:"#475569", badge:"DOL",  bgCard:"#f1f5f9", textColor:"#334155", img: imgDolomit },
  "Pupuk MOP":  { gradTop:"#fb923c", gradBot:"#c2410c", badge:"MOP",  bgCard:"#fff7ed", textColor:"#9a3412", img: imgMOP     },
  "Kiserit":    { gradTop:"#2dd4bf", gradBot:"#0f766e", badge:"KIS",  bgCard:"#f0fdfa", textColor:"#134e4a", img: imgKiserit },
  "Pupuk RP":   { gradTop:"#c084fc", gradBot:"#7e22ce", badge:"RP",   bgCard:"#faf5ff", textColor:"#6b21a8", img: imgRP      },
};

// ─── Fertilizer Bag Card ──────────────────────────────────────
function FertilizerCard({ p, idx }) {
  const meta = pupukMeta[p.jenis] || {
    gradTop:"#16a34a", gradBot:"#14532d", badge:"PPK", bgCard:"#f0fdf4", textColor:"#166534", img: null,
  };
  return (
    <div className="card-pop flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white"
      style={{ animationDelay: `${idx * 0.06}s` }}>
      {/* Product image — fixed uniform size */}
      <div className="relative flex items-center justify-center bg-gray-50"
        style={{ height: 160, width: "100%" }}>
        {meta.img ? (
          <img
            src={meta.img}
            alt={p.jenis}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              padding: "8px",
            }}
          />
        ) : (
          /* Fallback gradient if no image */
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(155deg, ${meta.gradTop}, ${meta.gradBot})` }}>
            <span className="text-white font-black text-xl tracking-widest drop-shadow-sm">{meta.badge}</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3 pt-2.5">
        <p className="font-bold text-gray-900 text-xs leading-snug mb-1.5">{p.jenis}</p>
        <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: meta.bgCard }}>
          <p className="text-xs font-bold" style={{ color: meta.textColor }}>{p.dosis}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">{p.waktu}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Zona Penempatan Pupuk ────────────────────────────────────
const zonas = [
  {
    label:"Z1", nama:"Area Batang",      jarak:"0 – 50 cm",   
    status:"Hindari",      color:"#ef4444",
    bgZone:"#fef2f2",  borderZone:"#fecaca", statusBg:"#fee2e2", statusText:"#b91c1c",
    desc:"Terlalu dekat batang, berisiko membakar akar aktif tanaman.",
  },
  {
    label:"Z2", nama:"Piringan Pohon",   jarak:"50 – 200 cm", 
    status:"Zona Utama",   color:"#16a34a",
    bgZone:"#f0fdf4",  borderZone:"#bbf7d0", statusBg:"#dcfce7", statusText:"#166534",
    desc:"Zona ideal. Sebagian besar akar aktif berada di sini.",
  },
  {
    label:"Z3", nama:"Tepi Piringan",    jarak:"200 – 300 cm", 
    status:"Dewasa Saja",  color:"#d97706",
    bgZone:"#fffbeb",  borderZone:"#fde68a", statusBg:"#fef3c7", statusText:"#92400e",
    desc:"Efektif untuk tanaman dewasa yang akarnya sudah melebar.",
  },
  {
    label:"Z4", nama:"Gawangan / Parit", jarak:"> 300 cm",     
    status:"Organik",      color:"#6366f1",
    bgZone:"#eef2ff",  borderZone:"#c7d2fe", statusBg:"#e0e7ff", statusText:"#3730a3",
    desc:"Cocok untuk pupuk organik agar tidak tercuci hujan deras.",
  },
];

function ZonaPenempatan() {
  const [hov, setHov] = useState(null);
  return (
    <div className="zone-slide bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-5">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50/80">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Zona Penempatan Pupuk</h3>
          <p className="text-gray-400 text-xs">Jarak aplikasi optimal dari batang pohon sawit</p>
        </div>
      </div>

      <div className="p-5">
        {/* Visual Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-transparent">
              <img src={imgPohon} alt="Pohon Sawit"
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
            <div className="flex-1 flex h-7 rounded-xl overflow-hidden gap-0.5 bg-gray-100 shadow-inner">
              {[
                { color:"#ef4444", flex:"0 0 14%", label:"Z1" },
                { color:"#16a34a", flex:"1 1 auto",  label:"Z2" },
                { color:"#d97706", flex:"0 0 22%", label:"Z3" },
                { color:"#6366f1", flex:"0 0 18%", label:"Z4" },
              ].map((z, i) => (
                <div key={i}
                  className="flex items-center justify-center transition-all duration-300 cursor-pointer"
                  style={{
                    flex: z.flex,
                    background: hov === i ? z.color : `${z.color}BB`,
                  }}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}>
                  <span className="text-white text-xs font-black drop-shadow-sm select-none">{z.label}</span>
                </div>
              ))}
              <div className="flex items-center px-2 bg-gray-200 text-gray-400 text-xs">→</div>
            </div>
          </div>
          {/* Jarak ticks */}
          <div className="flex text-xs text-gray-400 pl-9 justify-between pr-2">
            <span>0</span><span>50cm</span><span>200cm</span><span>300cm</span><span></span>
          </div>
        </div>

        {/* Zone Cards — 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {zonas.map((z, i) => (
            <div key={i}
              className="rounded-xl border p-3.5 transition-all duration-200 cursor-default zone-slide"
              style={{
                background: z.bgZone,
                borderColor: hov === i ? z.color : z.borderZone,
                boxShadow: hov === i ? `0 6px 20px ${z.color}22` : "none",
                transform: hov === i ? "translateY(-3px)" : "none",
                animationDelay: `${i * 0.07}s`,
              }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-lg">{z.icon}</span>
                <span className="text-xs font-bold" style={{ color: z.color }}>{z.label}</span>
              </div>
              <p className="font-bold text-gray-800 text-xs leading-snug mb-0.5">{z.nama}</p>
              <p className="text-xs font-semibold mb-1.5" style={{ color: z.color }}>{z.jarak}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{z.desc}</p>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: z.statusBg, color: z.statusText }}>
                {z.status}
              </span>
            </div>
          ))}
        </div>

        {/* Pro tip */}
        <div className="mt-3.5 flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <span className="text-green-500 text-base flex-shrink-0">💡</span>
          <p className="text-green-700 text-xs leading-relaxed">
            <span className="font-semibold">Pro Tip: </span>
            Bersihkan piringan dari gulma sebelum aplikasi pupuk agar serapan hara lebih maksimal.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Data Tabs & Pupuk ────────────────────────────────────────
const tabs = [
  { id:"bibit",  label:" Bibit Muda"     },
  { id:"1-3",    label:" 1 Sampai 3 Tahun"      },
  { id:"4-7",    label:" 4 Sampai 7 Tahun"      },
  { id:"dewasa", label:" Tanaman Dewasa"  },
];

const data = {
  bibit: {
    judul: "Rekomendasi Umum (Bibit Muda)",
    deskripsi: "Fase pertumbuhan akar dan daun pertama — hara masih rendah namun kritis untuk pondasi tanaman.",
    pupuk: [
      { jenis:"Pupuk NPK",  kandungan:"15-15-15", dosis:"0,5 – 1 kg",   waktu:"1-2 bulan sekali" },
      { jenis:"Pupuk Urea", kandungan:"46% N",    dosis:"0,2 – 0,3 kg", waktu:"1-2 bulan sekali" },
      { jenis:"Pupuk KCl",  kandungan:"60% K₂O",  dosis:"0,2 kg",       waktu:"2-3 bulan sekali" },
    ],
    catatan: "Dosis dapat disesuaikan dengan kondisi tanah dan hasil analisis daun.",
    url: "https://www.google.com/search?q=pemupukan+bibit+kelapa+sawit",
    tip: "Aplikasikan pupuk di sekitar perakaran bibit, jangan terlalu dekat batang agar akar tidak terbakar.",
    tipEmoji:"", tipGrad:"from-emerald-500 to-green-600", barGrad:"from-green-400 to-emerald-500",
  },
  "1-3": {
    judul: "Rekomendasi Umum (Tanaman 1 Sampai 3 Tahun)",
    deskripsi: "Fase vegetatif aktif — butuh nitrogen & fosfor tinggi untuk pembentukan tajuk dan batang kuat.",
    pupuk: [
      { jenis:"Pupuk NPK",  kandungan:"12-12-17", dosis:"1,5 – 2 kg",    waktu:"3-4 bulan sekali" },
      { jenis:"Pupuk Urea", kandungan:"46% N",    dosis:"0,5 – 0,75 kg", waktu:"3-4 bulan sekali" },
      { jenis:"Pupuk TSP",  kandungan:"46% P₂O₅", dosis:"0,5 kg",        waktu:"6 bulan sekali"   },
      { jenis:"Pupuk KCl",  kandungan:"60% K₂O",  dosis:"0,75 kg",       waktu:"3-4 bulan sekali" },
      { jenis:"Dolomit",    kandungan:"CaMg",      dosis:"1 kg",          waktu:"6 bulan sekali"   },
    ],
    catatan: "Aplikasi pupuk sebaiknya dilakukan saat musim hujan untuk penyerapan optimal.",
    url: "https://www.google.com/search?q=pemupukan+kelapa+sawit+1-3+tahun",
    tip: "Buat piringan bersih di sekitar pohon sebelum aplikasi pupuk agar hara langsung terserap akar.",
    tipEmoji:"", tipGrad:"from-green-500 to-teal-600", barGrad:"from-teal-400 to-green-500",
  },
  "4-7": {
    judul: "Rekomendasi Umum (Tanaman 4 Sampai 7 Tahun)",
    deskripsi: "Fase produksi awal — kebutuhan kalium meningkat untuk pembentukan dan pengisian buah.",
    pupuk: [
      { jenis:"Pupuk NPK",  kandungan:"12-12-17", dosis:"2 – 3 kg",    waktu:"3-4 bulan sekali" },
      { jenis:"Pupuk Urea", kandungan:"46% N",    dosis:"0,75 – 1 kg", waktu:"3-4 bulan sekali" },
      { jenis:"Pupuk MOP",  kandungan:"60% K₂O",  dosis:"1 – 1,5 kg",  waktu:"3-4 bulan sekali" },
      { jenis:"Pupuk TSP",  kandungan:"46% P₂O₅", dosis:"0,75 kg",     waktu:"6 bulan sekali"   },
      { jenis:"Kiserit",    kandungan:"27% MgO",   dosis:"0,5 kg",      waktu:"6 bulan sekali"   },
    ],
    catatan: "Pastikan pemupukan merata di piringan pohon untuk hasil optimal.",
    url: "https://www.google.com/search?q=pemupukan+kelapa+sawit+4-7+tahun",
    tip: "Hindari pemupukan saat hujan lebat agar pupuk tidak tercuci ke lapisan tanah yang lebih dalam.",
    tipEmoji:"", tipGrad:"from-amber-500 to-orange-500", barGrad:"from-orange-400 to-amber-500",
  },
  dewasa: {
    judul: "Rekomendasi Umum (Tanaman Dewasa)",
    deskripsi: "Fase produksi penuh — kebutuhan nutrisi sangat tinggi untuk mempertahankan produktivitas tandan.",
    pupuk: [
      { jenis:"Pupuk NPK",  kandungan:"12-12-17", dosis:"3 – 4 kg",    waktu:"3 bulan sekali"  },
      { jenis:"Pupuk Urea", kandungan:"46% N",    dosis:"1 – 1,5 kg",  waktu:"3 bulan sekali"  },
      { jenis:"Pupuk MOP",  kandungan:"60% K₂O",  dosis:"2 – 2,5 kg",  waktu:"3 bulan sekali"  },
      { jenis:"Pupuk RP",   kandungan:"32% P₂O₅", dosis:"1 kg",        waktu:"6 bulan sekali"  },
      { jenis:"Kiserit",    kandungan:"27% MgO",   dosis:"0,75 – 1 kg", waktu:"6 bulan sekali"  },
      { jenis:"Dolomit",    kandungan:"CaMg",      dosis:"2 kg",        waktu:"Setahun sekali"  },
    ],
    catatan: "Lakukan analisis daun dan tanah setiap tahun untuk penyesuaian dosis yang akurat.",
    url: "https://www.google.com/search?q=pemupukan+kelapa+sawit+dewasa+produksi",
    tip: "Kombinasikan pupuk organik untuk menjaga struktur dan kesuburan tanah dalam jangka panjang.",
    tipEmoji:"", tipGrad:"from-green-700 to-emerald-600", barGrad:"from-emerald-500 to-green-700",
  },
};

const rowColors = [
  { bg:"bg-white",       hov:"hover:bg-green-50/60" },
  { bg:"bg-green-50/25", hov:"hover:bg-green-50/60" },
];

// ─── Main Export ──────────────────────────────────────────────
export default function Pemupukan() {
  const [aktif, setAktif]   = useState("bibit");
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef(null);
  const d = data[aktif];

  const handleTab = (id) => {
    if (id === aktif) return;
    setAktif(id);
    setAnimKey((k) => k + 1);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  const scrollCards = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 185, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-5 py-7 md:px-6 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize:"24px 24px",
          }} />
        <PalmLeafLeft />
        <div className="max-w-screen-xl mx-auto relative z-10">
          <p className="text-green-200 text-sm mb-1">Pusat Pengetahuan</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Panduan Pemupukan Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">
            Pilih kategori tanaman untuk melihat rekomendasi pupuk yang tepat.
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarKategori aktif="pemupukan" />

          <div className="flex-1 min-w-0">

            {/* ── TABS ── */}
            <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => handleTab(t.id)}
                  className={`tab-btn flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    aktif === t.id
                      ? "bg-green-600 text-white shadow-lg shadow-green-200 scale-105"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600 hover:shadow-sm"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── IN-PLACE CONTENT (changes per tab, same slot) ── */}
            <div key={animKey} className="flex flex-col md:grid md:grid-cols-3 gap-4">

              {/* ── Right: Tips + Cards — on mobile comes FIRST ── */}
              <div className="flex flex-col gap-4 md:order-2">

                {/* Tips Aplikasi */}
                <div className={`tip-wrap relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${d.tipGrad} anim-main`}
                  style={{ animationDelay:"0.1s" }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
                      backgroundSize:"16px 16px",
                    }} />
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/8 blur-xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="tip-emoji text-2xl">{d.tipEmoji}</span>
                      <p className="font-bold text-white text-sm">Tips Aplikasi</p>
                    </div>
                    <p className="text-white/90 text-xs leading-relaxed">{d.tip}</p>
                    <div className="mt-4 h-px bg-white/20 rounded-full" />
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <div className="w-1 h-1 rounded-full bg-white/25" />
                      <span className="text-white/55 text-xs ml-1">Rekomendasi Ahli</span>
                    </div>
                  </div>
                </div>

                {/* Jenis Pupuk — Slideable Cards */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 anim-main"
                  style={{ animationDelay:"0.15s" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900 text-sm">Jenis Pupuk</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => scrollCards(-1)}
                        className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm font-bold hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all flex items-center justify-center">
                        ‹
                      </button>
                      <button onClick={() => scrollCards(1)}
                        className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm font-bold hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all flex items-center justify-center">
                        ›
                      </button>
                    </div>
                  </div>
                  <div ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-1.5"
                    style={{ scrollSnapType:"x mandatory" }}>
                    {d.pupuk.map((p, i) => (
                      <div key={`${aktif}-${i}`} style={{ scrollSnapAlign:"start" }}>
                        <FertilizerCard p={p} idx={i} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1 mt-2.5">
                    {d.pupuk.map((_, i) => (
                      <div key={i} className="rounded-full bg-gray-200 transition-all"
                        style={{ width: i === 0 ? 14 : 6, height: 6 }} />
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Left: Table — on mobile comes SECOND ── */}
              <div className="md:col-span-2 md:order-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden anim-main">
                <div className={`h-1.5 bg-gradient-to-r ${d.barGrad}`} />
                <div className="p-4 md:p-6">
                  <h2 className="font-bold text-gray-900 text-base md:text-lg mb-1">{d.judul}</h2>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{d.deskripsi}</p>

                  <div className="overflow-x-auto rounded-xl border border-green-100">
                    <table className="w-full text-sm min-w-[420px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold uppercase tracking-wide">
                          <th className="text-left px-4 py-3.5 rounded-tl-xl">Jenis Pupuk</th>
                          <th className="text-left px-4 py-3.5">Kandungan</th>
                          <th className="text-left px-4 py-3.5">Dosis / Tanaman</th>
                          <th className="text-left px-4 py-3.5 rounded-tr-xl">Waktu Aplikasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.pupuk.map((p, i) => {
                          const rc   = rowColors[i % 2];
                          const meta = pupukMeta[p.jenis] || { bgCard:"#f0fdf4", textColor:"#166534" };
                          return (
                            <tr key={i}
                              className={`border-t border-green-50/80 ${rc.bg} ${rc.hov} transition-colors row-anim`}
                              style={{ animationDelay:`${0.08 + i * 0.055}s` }}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: meta.textColor }} />
                                  <span className="font-semibold text-gray-800">{p.jenis}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                  style={{ background: meta.bgCard, color: meta.textColor }}>
                                  {p.kandungan}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-700">{p.dosis}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                                  {p.waktu}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Catatan */}
                  <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <span className="font-semibold">Catatan: </span>{d.catatan}
                    </p>
                  </div>

                  <div className="text-center mt-5">
                    <a href={d.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm">
                      Lihat Sumber Lengkap <span>→</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
            {/* ── end in-place content ── */}

            {/* ── Zona Penempatan — fixed section below ── */}
            <ZonaPenempatan />

          </div>
        </div>
      </div>
    </div>
  );
}