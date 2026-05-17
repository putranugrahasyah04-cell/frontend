import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import Navbar from "../components/Navbar";
import heroImage from "../assets/home.png";
import pupukIcon from "../assets/pupuk.png";
import deteksiIcon from "../assets/deteksi.png";
import edukasiIcon from "../assets/edukasi.png";

const features = [
  {
    icon: deteksiIcon,
    title: "Deteksi Penyakit",
    desc: "Upload foto daun sawit dan dapatkan diagnosis penyakit secara instan berbasis AI.",
    route: "/cek",
    scale: "1",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    badge: "AI Powered",
    badgeColor: "bg-green-100 text-green-700",
    arrowColor: "text-green-600",
    accentColor: "#16a34a",
    glowColor: "rgba(22,163,74,0.18)",
    borderHover: "rgba(22,163,74,0.35)",
  },
  {
    icon: pupukIcon,
    title: "Rekomendasi Pupuk",
    desc: "Saran pemupukan yang tepat berdasarkan kondisi dan usia tanaman Anda.",
    route: "/pemupukan",
    scale: "1",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    badge: "Smart",
    badgeColor: "bg-blue-100 text-blue-700",
    arrowColor: "text-blue-500",
    accentColor: "#2563eb",
    glowColor: "rgba(37,99,235,0.15)",
    borderHover: "rgba(37,99,235,0.3)",
  },
  {
    icon: edukasiIcon,
    title: "Edukasi & Panduan",
    desc: "Artikel dan panduan lengkap budidaya kelapa sawit dari para ahli.",
    route: "/edukasi",
    scale: "1.8",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    badge: "Lengkap",
    badgeColor: "bg-amber-100 text-amber-700",
    arrowColor: "text-amber-500",
    accentColor: "#d97706",
    glowColor: "rgba(217,119,6,0.15)",
    borderHover: "rgba(217,119,6,0.3)",
  },
];

const STATS = [
  {
    value: "46,8 jt", unit: "ton CPO", label: "Produksi 2023",
    bgStyle: { background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" },
    accentColor: "rgba(52,211,153,0.15)",
    borderColor: "rgba(52,211,153,0.2)",
    glow: "rgba(6,78,59,0.35)",
  },
  {
    value: "16,8 jt", unit: "hektar", label: "Total Perkebunan",
    bgStyle: { background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)" },
    accentColor: "rgba(134,239,172,0.12)",
    borderColor: "rgba(134,239,172,0.2)",
    glow: "rgba(20,83,45,0.35)",
  },
  {
    value: "#1", unit: "dunia", label: "Penghasil CPO",
    bgStyle: { background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)" },
    accentColor: "rgba(74,222,128,0.18)",
    borderColor: "rgba(74,222,128,0.22)",
    glow: "rgba(5,46,22,0.45)",
  },
  {
    value: "2,67 jt", unit: "KK", label: "Petani Swadaya",
    bgStyle: { background: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #0d9488 100%)" },
    accentColor: "rgba(94,234,212,0.15)",
    borderColor: "rgba(94,234,212,0.2)",
    glow: "rgba(19,78,74,0.45)",
  },
];

// ══════════════════════════════════════════════════════════════
// BUG FIX: Slug GeoJSON untuk Kalimantan tidak sesuai nama geografis.
// Berdasarkan file indonesia.geojson yang dipakai:
//   - slug "west-kalimantan"    → secara VISUAL adalah Kalimantan Tengah
//   - slug "central-kalimantan" → secara VISUAL adalah Kalimantan Barat
// Sehingga data nama/rank/luas/produksi dibalik agar tooltip tampil benar.
// ══════════════════════════════════════════════════════════════
const SAWIT_DATA = {
  "riau":                    { nama: "Riau",               luas: "2,86 jt ha", produksi: "8,5 jt ton", rank: 1  },
  "west-kalimantan":         { nama: "Kalimantan Tengah",  luas: "1,92 jt ha", produksi: "5,2 jt ton", rank: 2  },
  "north-sumatera":          { nama: "Sumatera Utara",     luas: "1,56 jt ha", produksi: "4,8 jt ton", rank: 3  },
  "central-kalimantan":      { nama: "Kalimantan Barat",   luas: "1,74 jt ha", produksi: "4,1 jt ton", rank: 4  },
  "east-kalimantan":         { nama: "Kalimantan Timur",   luas: "1,28 jt ha", produksi: "3,6 jt ton", rank: 5  },
  "south-sumatera":          { nama: "Sumatera Selatan",   luas: "1,11 jt ha", produksi: "3,1 jt ton", rank: 6  },
  "jambi":                   { nama: "Jambi",              luas: "0,76 jt ha", produksi: "2,4 jt ton", rank: 7  },
  "south-kalimantan":        { nama: "Kalimantan Selatan", luas: "0,62 jt ha", produksi: "1,8 jt ton", rank: 8  },
  "special-region-of-aceh":  { nama: "Aceh",               luas: "0,51 jt ha", produksi: "1,5 jt ton", rank: 9  },
  "special-region-of-papua": { nama: "Papua",              luas: "0,43 jt ha", produksi: "1,1 jt ton", rank: 10 },
  "bengkulu":                { nama: "Bengkulu",           luas: "0,38 jt ha", produksi: "0,9 jt ton", rank: 11 },
  "central-sulawesi":        { nama: "Sulawesi Tengah",    luas: "0,22 jt ha", produksi: "0,6 jt ton", rank: 12 },
};

function getRankColor(rank) {
  const dark  = [6,  78,  59];
  const light = [187, 247, 208];
  const t = (rank - 1) / 11;
  const r = Math.round(dark[0] + (light[0] - dark[0]) * t);
  const g = Math.round(dark[1] + (light[1] - dark[1]) * t);
  const b = Math.round(dark[2] + (light[2] - dark[2]) * t);
  return `rgb(${r},${g},${b})`;
}

const LON_MIN = 94.5, LON_MAX = 141.5;
const LAT_MIN = -13, LAT_MAX = 7;
const SVG_W = 800, SVG_H = 420;

function project(lon, lat) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * SVG_W;
  const y = SVG_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

function coordsToPath(rings) {
  return rings.map(ring =>
    ring.map((coord, i) => {
      const [x, y] = project(coord[0], coord[1]);
      return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ") + " Z"
  ).join(" ");
}

function geomToPath(geometry) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") return coordsToPath(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.map(poly => coordsToPath(poly)).join(" ");
  return "";
}

function simplifyCoords(coords, step = 4) {
  return coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
}

function simplifyGeom(geometry) {
  if (!geometry) return geometry;
  if (geometry.type === "Polygon") return { ...geometry, coordinates: geometry.coordinates.map(ring => simplifyCoords(ring)) };
  if (geometry.type === "MultiPolygon") return { ...geometry, coordinates: geometry.coordinates.map(poly => poly.map(ring => simplifyCoords(ring))) };
  return geometry;
}

/* ══════════════════════════════════════════════════════════════
   INDONESIA MAP
   FIX #2 — Ganti onMouseEnter/Leave → onPointerEnter/Leave
            dengan cek pointerType agar ghost event mobile
            tidak langsung menutup tooltip.
   FIX #6 — Tambah hoverTimerRef (debounce 80ms) agar hover
            tidak flicker saat mouse pindah antar provinsi.
══════════════════════════════════════════════════════════════ */
const IndonesiaMap = memo(function IndonesiaMap({ onHover, hoveredSlug }) {
  const [mapFeatures, setMapFeatures] = useState([]);
  // FIX #6: debounce ref — cegah flicker saat mouse cepat berpindah
  const hoverTimerRef = useRef(null);

  useEffect(() => {
    fetch("/indonesia.geojson")
      .then(r => r.json())
      .then(data => {
        const processed = data.features.map(f => ({
          slug: f.properties.slug,
          path: geomToPath(simplifyGeom(f.geometry)),
        }));
        setMapFeatures(processed);
      })
      .catch(err => console.error("GeoJSON load error:", err));
  }, []);

  // Toggle: tap lagi provinsi yang sama = tutup tooltip
  const handleClick = useCallback((e, slug, isSawit) => {
    e.stopPropagation();
    if (!isSawit) return;
    onHover(hoveredSlug === slug ? null : slug);
  }, [hoveredSlug, onHover]);

  return (
    <div
      className="w-full relative"
      style={{ background: "#dbeafe", borderRadius: 12 }}
      onClick={() => onHover(null)}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ display: "block", touchAction: "pan-y" }}
      >
        {mapFeatures.map((feat) => {
          const sawitData = SAWIT_DATA[feat.slug];
          const isSawit = !!sawitData;
          const isHovered = hoveredSlug === feat.slug;
          let fill = "#cbd5e1";
          if (isSawit) fill = isHovered ? "#f59e0b" : getRankColor(sawitData.rank);
          else if (isHovered) fill = "#e2e8f0";
          return (
            <path
              key={feat.slug}
              d={feat.path}
              fill={fill}
              stroke="white"
              strokeWidth="0.8"
              strokeLinejoin="round"
              style={{
                transition: "fill 0.22s cubic-bezier(0.4,0,0.2,1)",
                cursor: isSawit ? "pointer" : "default",
                filter: isHovered && isSawit
                  ? "drop-shadow(0 3px 8px rgba(245,158,11,0.55)) brightness(1.08)"
                  : "none",
              }}
              /* FIX #2 + #6 — Desktop: hanya aktif untuk pointer mouse,
                 bukan touch. Debounce 80ms cegah flicker antar provinsi. */
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimeout(hoverTimerRef.current);
                if (isSawit) onHover(feat.slug);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                hoverTimerRef.current = setTimeout(() => onHover(null), 80);
              }}
              /* Mobile: tap toggle */
              onClick={(e) => handleClick(e, feat.slug, isSawit)}
            />
          );
        })}
        {mapFeatures.length === 0 && (
          <foreignObject x="150" y="145" width="500" height="50">
            <div xmlns="http://www.w3.org/1999/xhtml"
              style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, lineHeight: "50px" }}>
              Memuat peta Indonesia...
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
});

/* ══════════════════════════════════════════════════════════════
   PETA SAWIT SECTION
   FIX #1 — overscrollBehavior: "contain" pada ranking scroll
   FIX #3 — willChange pada elemen animasi IntersectionObserver
   FIX #5 — ResizeObserver cek display sebelum observe
══════════════════════════════════════════════════════════════ */
function SawitMapSection() {
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const mapRef = useRef(null);
  const [mapHeight, setMapHeight] = useState(420);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // FIX #5 — cek display !== "none" sebelum observe, dan hanya
  //           update mapHeight jika hasilnya lebih dari 0 (desktop saja)
  useEffect(() => {
    if (!mapRef.current) return;
    const el = mapRef.current;
    if (getComputedStyle(el).display === "none") return;
    const ro = new ResizeObserver(() => {
      if (el) {
        const h = el.offsetHeight;
        if (h > 0) setMapHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hovData = hoveredSlug ? SAWIT_DATA[hoveredSlug] : null;
  const allProvinsi = Object.entries(SAWIT_DATA).sort((a, b) => a[1].rank - b[1].rank);
  const maxProd = 8.5;

  return (
    <section ref={sectionRef} className="py-8 md:py-16 px-4 md:px-16 bg-white border-t border-gray-100">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tooltipPop {
          0%   { opacity: 0; transform: scale(0.88) translateY(6px); }
          60%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes barFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .ranking-scroll::-webkit-scrollbar { width: 4px; }
        .ranking-scroll::-webkit-scrollbar-track { background: transparent; }
        .ranking-scroll::-webkit-scrollbar-thumb { background: #bbf7d0; border-radius: 99px; }
        .ranking-row {
          transition: background 0.2s cubic-bezier(0.4,0,0.2,1),
                      border-color 0.2s cubic-bezier(0.4,0,0.2,1),
                      transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.2s ease;
        }
        .ranking-row:hover { transform: translateX(3px); }
        .stat-card {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease;
        }
        .stat-card:hover { transform: translateY(-5px) scale(1.025); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/*
          PERF FIX: Hapus willChange dari elemen yang animasinya
          hanya sekali (IntersectionObserver entry). Setelah visible,
          willChange tidak berguna dan malah memakan GPU memory terus.
        */}
        <div
          className="text-center mb-6 md:mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
            Peta Sawit Indonesia
          </span>
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            Indonesia, Raksasa <span className="text-green-600">Kelapa Sawit</span> Dunia
          </h2>
          <p className="mt-1.5 text-gray-400 text-xs md:text-sm px-4">
            Ketuk provinsi untuk melihat data produksi · Warna lebih gelap = produksi lebih tinggi
          </p>
        </div>

        {/* Stat Cards */}
        {/*
          PERF FIX: Hapus willChange dari stat cards. Hover effect
          sudah ditangani CSS class .stat-card, tidak perlu inline willChange.
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 mb-5 md:mb-10">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="stat-card relative rounded-2xl overflow-hidden"
              style={{
                ...stat.bgStyle,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 90}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 90}ms`,
                boxShadow: `0 8px 24px -4px ${stat.glow}, 0 2px 8px -2px rgba(0,0,0,0.2)`,
                border: `1px solid ${stat.borderColor}`,
              }}
            >
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)",
              }} />
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 2,
                background: `linear-gradient(to right, transparent, ${stat.accentColor.replace("0.15","0.7")}, transparent)`,
                borderRadius: "0 0 4px 4px",
              }} />
              <div className="relative p-3 md:p-5">
                <div className="flex items-start justify-between mb-1.5 md:mb-3">
                  <p className="text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest leading-tight">{stat.label}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg md:text-3xl font-extrabold leading-none tracking-tight text-white">{stat.value}</span>
                  <span className="text-[9px] md:text-xs font-semibold text-white/65">{stat.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MOBILE layout ── */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <IndonesiaMap onHover={setHoveredSlug} hoveredSlug={hoveredSlug} />

            {/* Mobile tooltip — fixed di bawah peta, hanya muncul saat ada data */}
            {hovData && (
              <div
                className="absolute bottom-3 left-3 right-3 bg-white/97 backdrop-blur-md border border-amber-200 rounded-xl shadow-xl p-3 z-10"
                style={{ animation: "tooltipPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="font-bold text-gray-900 text-sm flex-1">{hovData.nama}</span>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">#{hovData.rank}</span>
                  {/* Tombol tutup untuk mobile */}
                  <button
                    onClick={() => setHoveredSlug(null)}
                    className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 ml-1"
                    style={{ fontSize: 10 }}
                  >✕</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Luas</p>
                    <p className="text-xs font-bold text-green-700">{hovData.luas}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Produksi</p>
                    <p className="text-xs font-bold text-green-700">{hovData.produksi}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile hint — hanya tampil saat tidak ada provinsi dipilih */}
            {!hovData && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                <span className="bg-white/90 text-gray-400 text-[10px] px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                   Ketuk provinsi untuk detail
                </span>
              </div>
            )}

            <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white/90 rounded-lg p-1.5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-10 h-2 rounded-sm flex-shrink-0" style={{ background: "linear-gradient(to right, #064e3b, #bbf7d0)" }} />
                <span className="text-[9px] text-gray-500">Tinggi→Rendah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-amber-400 flex-shrink-0" />
                <span className="text-[9px] text-gray-500">Dipilih</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 -mt-2">Sumber: GAPKI, Kementan RI, BPS 2023</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900 text-sm">12 Provinsi Sawit Terbesar</p>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                <svg width="8" height="10" viewBox="0 0 10 12" fill="none"><path d="M5 1v10M5 11L2.5 8.5M5 11L7.5 8.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                geser
              </span>
            </div>
            {/*
              PERF FIX: Tambah WebkitOverflowScrolling: "touch" untuk iOS
              agar scroll dalam list terasa native dan tidak chain ke halaman.
              overscrollBehavior: "contain" sudah ada, tetap dipertahankan.
            */}
            <div
              className="overflow-y-auto space-y-2 ranking-scroll"
              style={{ maxHeight: 280, paddingRight: 2, overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
            >
              {allProvinsi.map(([slug, d], i) => {
                const prodNum = parseFloat(d.produksi.replace(/[^\d.]/g, ""));
                const pct = (prodNum / maxProd) * 100;
                const rankColor = getRankColor(d.rank);
                const isHov = hoveredSlug === slug;
                return (
                  <div
                    key={slug}
                    className={`rounded-xl px-3 py-2.5 border cursor-pointer transition-all ${isHov ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-transparent"}`}
                    onClick={() => setHoveredSlug(isHov ? null : slug)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: rankColor }}
                        >{d.rank}</span>
                        <span className="text-xs font-semibold text-gray-800">{d.nama}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-700">{d.produksi}</span>
                        <span className="text-[9px] text-gray-400">{d.luas}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: pct + "%",
                          background: rankColor,
                          transformOrigin: "left",
                          transform: visible ? "scaleX(1)" : "scaleX(0)",
                          transition: `transform 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 55 + 200}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── DESKTOP layout ── */}
        {/*
          PERF FIX: Hapus willChange dari container desktop.
          Elemen ini hanya animasi sekali saat enter viewport,
          setelah itu willChange memakan GPU memory percuma.
        */}
        <div
          className="hidden md:grid md:grid-cols-3 gap-6 items-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s, transform 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s",
          }}
        >
          <div className="md:col-span-2 flex flex-col">
            <div ref={mapRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <IndonesiaMap onHover={setHoveredSlug} hoveredSlug={hoveredSlug} />
              {hovData && (
                <div
                  className="absolute bottom-4 left-4 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[200px] z-10"
                  style={{ animation: "tooltipPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">{hovData.nama}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">#{hovData.rank}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Luas</p>
                      <p className="text-sm font-bold text-green-700">{hovData.luas}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Produksi</p>
                      <p className="text-sm font-bold text-green-700">{hovData.produksi}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/95 rounded-xl p-2.5 border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Keterangan</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-16 h-3 rounded-sm flex-shrink-0" style={{ background: "linear-gradient(to right, #064e3b, #bbf7d0)" }} />
                  <span>Tinggi → Rendah</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 flex-shrink-0" />Sedang Dipilih
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-slate-300 flex-shrink-0" />Non-Sawit
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Sumber: GAPKI, Kementerian Pertanian RI, BPS 2023</p>
          </div>

          {/* Ranking Desktop */}
          <div className="flex flex-col">
            <div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
              style={{ height: mapHeight || 420, maxHeight: 500 }}
            >
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm">12 Provinsi Sawit Terbesar</p>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 1v10M5 11L2.5 8.5M5 11L7.5 8.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  scroll
                </span>
              </div>
              {/*
                PERF FIX: Tambah WebkitOverflowScrolling: "touch" untuk iOS.
                overscrollBehavior: "contain" tetap dipertahankan.
              */}
              <div
                className="flex-1 overflow-y-auto pr-1 space-y-2 ranking-scroll"
                style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
              >
                {allProvinsi.map(([slug, d], i) => {
                  const prodNum = parseFloat(d.produksi.replace(/[^\d.]/g, ""));
                  const pct = (prodNum / maxProd) * 100;
                  const isHov = hoveredSlug === slug;
                  const rankColor = getRankColor(d.rank);
                  return (
                    <div
                      key={slug}
                      className={"ranking-row rounded-lg px-2.5 py-2 cursor-pointer border " + (isHov ? "bg-amber-50 border-amber-200 shadow-sm" : "hover:bg-green-50 border-transparent")}
                      onMouseEnter={() => setHoveredSlug(slug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                            style={{ background: rankColor, fontSize: 9 }}
                          >{d.rank}</span>
                          <span className="text-xs font-medium text-gray-800 truncate max-w-[110px]">{d.nama}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{d.produksi}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: pct + "%",
                            background: rankColor,
                            transformOrigin: "left",
                            transform: visible ? "scaleX(1)" : "scaleX(0)",
                            transition: `transform 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 65 + 300}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex-shrink-0 h-6 -mb-1 rounded-b-2xl pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
            </div>
          </div>
        </div>

        {/* Artikel Faktual */}
        <div className="mt-8 md:mt-10 max-w-4xl">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Fakta & Data Industri Sawit</p>
          <div className="space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
            <p>
              Indonesia dan Malaysia secara bersama-sama menguasai lebih dari{" "}
              <strong className="text-gray-900">85% produksi minyak kelapa sawit dunia</strong>, menjadikan kedua negara ini sebagai pilar utama industri sawit global.
              Indonesia sendiri merupakan produsen terbesar dengan volume produksi CPO mencapai{" "}
              <strong className="text-gray-900">46,8 juta ton</strong> pada tahun 2023.
            </p>
            <p>
              Di dalam negeri, industri kelapa sawit berkontribusi sekitar{" "}
              <strong className="text-gray-900">3,5–4% terhadap PDB Indonesia</strong> dan menyerap tenaga kerja langsung maupun tidak langsung bagi lebih dari{" "}
              <strong className="text-gray-900">21 juta orang</strong>.
            </p>
            <p>
              Luas total perkebunan kelapa sawit mencapai{" "}
              <strong className="text-gray-900">16,8 juta hektar</strong> setara hampir setengah luas Pulau Sumatera. Sekitar{" "}
              <strong className="text-gray-900">41%</strong> dikelola petani swadaya.
            </p>
            <p>
              Sebagai komoditas ekspor unggulan, minyak sawit menyumbang devisa sebesar{" "}
              <strong className="text-gray-900">lebih dari USD 28 miliar</strong> per tahun.
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-4">Sumber: GAPKI, Kementerian Pertanian RI, BPS 2023.</p>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FITUR UNGGULAN
══════════════════════════════════════════════════════════════ */
function FiturSection() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-10 md:py-16 px-4 md:px-16 border-t border-gray-100">
      <style>{`
        @keyframes iconBounce {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.22) rotate(-6deg); }
          55%  { transform: scale(0.95) rotate(2deg); }
          75%  { transform: scale(1.08) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes shimmerSweep {
          0%   { left: -80%; }
          100% { left: 130%; }
        }
        @keyframes badgePop {
          0%   { transform: scale(0.8); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes arrowSlide {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(5px); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 var(--ring-color, rgba(22,163,74,0.4)); }
          70%  { box-shadow: 0 0 0 8px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }

        .feature-card {
          position: relative;
          transition:
            transform 0.38s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.35s cubic-bezier(0.4,0,0.2,1),
            border-color 0.28s ease;
          will-change: transform;
          overflow: hidden;
        }
        .feature-card:hover {
          transform: translateY(-10px) scale(1.015);
        }
        .feature-icon-wrap {
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-card:hover .feature-icon-wrap {
          animation: iconBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .feature-arrow {
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-card:hover .feature-arrow { gap: 8px; }
        .feature-arrow-icon {
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-card:hover .feature-arrow-icon {
          animation: arrowSlide 0.6s ease-in-out infinite;
        }
        .feature-shimmer {
          position: absolute;
          top: 0; bottom: 0;
          width: 55%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .feature-card:hover .feature-shimmer {
          opacity: 1;
          animation: shimmerSweep 0.65s cubic-bezier(0.4,0,0.6,1) forwards;
        }
        .feature-badge {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-card:hover .feature-badge {
          animation: badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .feature-orb {
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .feature-card:hover .feature-orb-top {
          opacity: 0.22 !important;
          transform: scale(1.15) !important;
        }
        .feature-card:hover .feature-orb-bottom {
          opacity: 0.14 !important;
          transform: scale(1.2) !important;
        }
        .mobile-feature-card {
          transition:
            transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.22s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-feature-card:active {
          transform: scale(0.96);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .mobile-arrow-icon {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mobile-feature-card:active .mobile-arrow-icon {
          transform: translateX(3px);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/*
          PERF FIX: Hapus willChange dari header section.
          Animasi hanya sekali (IntersectionObserver entry).
        */}
        <div
          className="text-center mb-8 md:mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <span className="inline-block text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3 tracking-wider uppercase">
            Fitur Unggulan
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold text-gray-900">Semua yang Kamu Butuhkan</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1.5">Teknologi AI untuk pertanian sawit yang lebih cerdas</p>
        </div>

        {/* ── Desktop: 3 cols ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const isHov = hoveredIdx === i;
            return (
              <div
                key={i}
                onClick={() => navigate(f.route)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`feature-card cursor-pointer rounded-2xl p-6 border ${f.bg}`}
                style={{
                  border: isHov ? `1.5px solid ${f.borderHover}` : "1.5px solid #f1f5f9",
                  boxShadow: isHov
                    ? `0 20px 44px -8px ${f.glowColor}, 0 8px 20px -4px rgba(0,0,0,0.08)`
                    : "0 2px 8px -2px rgba(0,0,0,0.05)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(28px)",
                  transition: `
                    opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${i * 110}ms,
                    transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 110}ms,
                    box-shadow 0.35s ease,
                    border-color 0.28s ease
                  `,
                }}
              >
                <div className="feature-shimmer" />
                <div className={`feature-orb feature-orb-top absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${f.gradient} opacity-10`} />
                <div className={`feature-orb feature-orb-bottom absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-gradient-to-br ${f.gradient} opacity-5`} />

                <div className="relative flex items-center justify-between mb-5">
                  <div
                    className={`feature-icon-wrap w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center shadow-sm`}
                    style={{
                      boxShadow: isHov ? `0 4px 14px -2px ${f.glowColor}` : "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <img
                      src={f.icon}
                      alt={f.title}
                      className="object-contain"
                      style={{ width: "28px", height: "28px", transform: `scale(${f.scale || 1})` }}
                    />
                  </div>
                  <span className={`feature-badge text-[10px] font-bold px-2.5 py-1 rounded-full ${f.badgeColor}`}>{f.badge}</span>
                </div>

                <div className="relative">
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>

                <div className={`feature-arrow relative mt-5 text-xs font-bold ${f.arrowColor}`}>
                  <span>Lihat selengkapnya</span>
                  <svg className="feature-arrow-icon w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: compact cards ── */}
        <div className="md:hidden flex flex-col gap-3">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={() => navigate(f.route)}
              className="mobile-feature-card relative flex items-center gap-4 rounded-2xl p-4 cursor-pointer overflow-hidden border border-gray-100"
              style={{
                background: "white",
                boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-28px)",
                transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 100}ms,
                             transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 100}ms`,
              }}
            >
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 4, background: f.accentColor,
                borderRadius: "4px 0 0 4px",
              }} />
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm ml-1`}>
                <img
                  src={f.icon}
                  alt={f.title}
                  className="object-contain"
                  style={{ width: "26px", height: "26px", transform: `scale(${f.scale || 1})` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${f.badgeColor}`}>{f.badge}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{f.desc}</p>
              </div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${f.iconBg}`}>
                <svg
                  className={`mobile-arrow-icon w-3.5 h-3.5 ${f.arrowColor}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CTA SECTION
   FIX #4 — URL WhatsApp diperbaiki (082→6282 kode negara Indonesia)
══════════════════════════════════════════════════════════════ */
const CTA_FEATURES = [
  { text: "Monitoring tanaman real-time" },
  { text: "Deteksi penyakit berbasis AI" },
  { text: "Rekomendasi pupuk otomatis" },
  { text: "Analisis hasil panen" },
];

function CTASection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-10 md:py-20 px-4 md:px-16 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 25%, #15803d 55%, #16a34a 80%, #22c55e 100%)" }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 80% at 2% 55%, rgba(74,222,128,0.28) 0%, transparent 65%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 60% at 95% 10%, rgba(187,247,208,0.18) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, rgba(187,247,208,0.6), rgba(255,255,255,0.5), rgba(187,247,208,0.6), transparent)" }} />

      {/*
        PERF FIX: Hapus willChange dari container CTA.
        Animasi hanya sekali saat enter viewport.
      */}
      <div
        className="max-w-7xl mx-auto relative"
        style={{
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* MOBILE */}
        <div className="md:hidden flex flex-col gap-6">
          <div className="text-center">
            <span style={{
              display: "inline-block", marginBottom: 12,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
              color: "white", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 99,
            }}>Platform Sawit Cerdas</span>
            <h2 className="text-2xl font-bold text-white leading-snug">
              Siap Meningkatkan <br />
              <span style={{ color: "#dcfce7" }}>Hasil Sawit</span> Anda?
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(220,252,231,0.85)" }}>
              Gunakan teknologi AI untuk pertanian yang lebih cerdas.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {CTA_FEATURES.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 12, padding: "10px 14px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-16px)",
                transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 80 + 200}ms,
                             transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80 + 200}ms`,
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ color: "rgba(220,252,231,0.95)", fontSize: 13, fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <a href="https://instagram.com/shrrmadhania" target="_blank" rel="noreferrer"
              style={{
                flex: 1, textAlign: "center",
                background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.4)",
                color: "white", fontWeight: 600, padding: "12px 16px",
                borderRadius: 14, fontSize: 13, textDecoration: "none",
              }}
            >Instagram</a>
            <a href="https://wa.me/6282380252538" target="_blank" rel="noreferrer"
              style={{
                flex: 1, textAlign: "center",
                background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
                border: "1.5px solid rgba(255,255,255,0.6)",
                color: "#15803d", fontWeight: 700, padding: "12px 16px",
                borderRadius: 14, fontSize: 13, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >WhatsApp</a>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span style={{
              display: "inline-block", marginBottom: 16,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
              color: "white", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 99,
            }}>Platform Sawit Cerdas</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              Siap Meningkatkan <br />
              <span style={{ color: "#dcfce7" }}>Hasil Sawit</span> Anda?
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(220,252,231,0.85)" }}>
              Gunakan teknologi AI untuk pertanian yang lebih cerdas dan efisien.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://instagram.com/shrrmadhania" target="_blank" rel="noreferrer"
                style={{
                  background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "white", fontWeight: 600, padding: "10px 22px",
                  borderRadius: 12, fontSize: 14, textDecoration: "none",
                  transition: "background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  backdropFilter: "blur(4px)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Follow Instagram</a>
              <a href="https://wa.me/6282380252538" target="_blank" rel="noreferrer"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  color: "#15803d", fontWeight: 700, padding: "10px 22px",
                  borderRadius: 12, fontSize: 14, textDecoration: "none",
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
              >WhatsApp Kami</a>
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20, padding: "28px", backdropFilter: "blur(8px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <p style={{ color: "#dcfce7", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>Fitur Unggulan</p>
            <ul className="space-y-4">
              {CTA_FEATURES.map((item, i) => (
                <li key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(20px)",
                  transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 80 + 300}ms,
                               transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80 + 300}ms`,
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: "rgba(220,252,231,0.95)", fontSize: 14, fontWeight: 500 }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <style>{`
        @keyframes heroFloat {
          0%   { transform: translateY(0px)   rotate(0deg); }
          18%  { transform: translateY(-16px) rotate(0.7deg); }
          36%  { transform: translateY(-10px) rotate(-0.3deg); }
          55%  { transform: translateY(-20px) rotate(0.5deg); }
          72%  { transform: translateY(-7px)  rotate(-0.5deg); }
          88%  { transform: translateY(-13px) rotate(0.3deg); }
          100% { transform: translateY(0px)   rotate(0deg); }
        }
        @keyframes blobMorph {
          0%,100% {
            border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%;
            transform: translateX(-50%) scale(1);
          }
          25% {
            border-radius: 40% 60% 45% 55% / 60% 40% 60% 40%;
            transform: translateX(-50%) scale(1.06);
          }
          50% {
            border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%;
            transform: translateX(-50%) scale(0.94);
          }
          75% {
            border-radius: 45% 55% 40% 60% / 65% 35% 55% 45%;
            transform: translateX(-50%) scale(1.08);
          }
        }
        @keyframes shadowBreath {
          0%,100% { transform: translateX(-50%) scaleX(1); opacity: 0.18; }
          50%      { transform: translateX(-50%) scaleX(0.82); opacity: 0.1; }
        }
        @keyframes rotateCW  { to { transform: rotate(360deg); } }
        @keyframes rotateCCW { to { transform: rotate(-360deg); } }
        @keyframes particleA {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.7; }
          30%     { transform: translate(4px,-12px) scale(1.15); opacity: 1; }
          60%     { transform: translate(-3px,-7px) scale(0.9); opacity: 0.55; }
          80%     { transform: translate(2px,-15px) scale(1.1); opacity: 0.9; }
        }
        @keyframes particleB {
          0%,100% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 0.65; }
          40%     { transform: translate(-5px,-10px) scale(1.2) rotate(45deg); opacity: 1; }
          70%     { transform: translate(3px,-6px) scale(0.85) rotate(-20deg); opacity: 0.5; }
        }
        @keyframes particleC {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.8; }
          50%     { transform: translate(6px,-18px) scale(1.3); opacity: 0.4; }
        }
        @keyframes badgeEntrance {
          0%   { opacity: 0; transform: scale(0.6) translateY(12px); }
          55%  { transform: scale(1.08) translateY(-4px); opacity: 1; }
          75%  { transform: scale(0.97) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes badgeFloat {
          0%,100% { transform: translateY(0px) translateX(0px); }
          30%     { transform: translateY(-7px) translateX(2px); }
          65%     { transform: translateY(-3px) translateX(-2px); }
        }
        @keyframes badgeShimmer {
          0%   { left: -60%; }
          100% { left: 160%; }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1);    opacity: 1; }
          50%      { transform: scale(1.35); opacity: 0.75; }
        }
        @keyframes leafSway {
          0%,100% { filter: saturate(1.15) contrast(1.02); }
          40%     { filter: saturate(1.22) contrast(1.03); }
          70%     { filter: saturate(1.12) contrast(1.01); }
        }

        /*
          PERF FIX (MOBILE SCROLL):
          Sembunyikan elemen hero dekoratif di mobile:
          - Partikel (7 titik kecil floating)
          - Ring berputar (2 lingkaran dashed)
          - Blob morphing background
          - Shadow breathing
          Elemen-elemen ini menyebabkan GPU mobile bekerja terlalu berat
          saat semua berjalan bersamaan, membuat scroll terasa loncat/kasar.
          Di mobile layarnya kecil sehingga elemen ini hampir tidak terlihat.
          Tampilan hero tetap sama: gambar sawit + 3 badge tetap tampil.
        */
        @media (max-width: 767px) {
          .hero-particle-elem { display: none !important; }
          .hero-ring-elem     { display: none !important; }
          .hero-blob-elem     { display: none !important; }
          .hero-shadow-elem   { display: none !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <p className="text-green-600 text-sm font-semibold mb-3">Platform Pertanian Cerdas</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Solusi Pintar untuk <span className="text-green-600">Kelapa Sawit</span>
          </h1>
          <p className="mt-4 text-gray-500 text-base leading-relaxed max-w-md">
            Deteksi penyakit berbasis AI, monitoring kondisi, dan edukasi pohon sawit untuk meningkatkan hasil panen Anda.
          </p>
          <p className="mt-4 text-gray-500 text-base leading-relaxed max-w-md">
            Upload foto sawit sakit sekarang — AI analisis 70% akurat! Monitoring harian dan edukasi gratis tingkatkan hasil panen Anda.
            Rasakan revolusi perkebunan pintar.
          </p>
        </div>

        {/* ── HERO IMAGE AREA ── */}
        <div
          className="flex justify-center items-center relative"
          style={{ minHeight: "clamp(260px, 50vw, 440px)", overflow: "visible" }}
        >
          {/*
            PERF FIX: Tambah className="hero-blob-elem" agar blob disembunyikan di mobile.
            blobMorph adalah animasi berat (border-radius + scale + translateX terus-menerus).
          */}
          <div
            className="hero-blob-elem"
            style={{
              position: "absolute",
              bottom: "-8%", left: "50%",
              width: "min(380px, 90vw)",
              height: "min(380px, 90vw)",
              background: "radial-gradient(ellipse at 50% 60%, rgba(20,83,45,0.14) 0%, rgba(74,222,128,0.11) 40%, rgba(187,247,208,0.05) 65%, transparent 80%)",
              animation: "blobMorph 9s cubic-bezier(0.4,0,0.2,1) infinite",
              zIndex: 0,
              willChange: "transform, border-radius",
            }}
          />

          {/*
            PERF FIX: Tambah className="hero-shadow-elem" agar shadow disembunyikan di mobile.
          */}
          <div
            className="hero-shadow-elem"
            style={{
              position: "absolute",
              bottom: "1.5%", left: "50%",
              width: "min(200px, 50vw)",
              height: "min(26px, 7vw)",
              background: "radial-gradient(ellipse, rgba(22,101,52,0.2) 0%, transparent 70%)",
              filter: "blur(6px)",
              animation: "shadowBreath 7s cubic-bezier(0.4,0,0.2,1) infinite",
              zIndex: 1,
            }}
          />

          {/*
            PERF FIX: Tambah className="hero-ring-elem" pada kedua ring.
            Ring berputar terus (rotateCW/CCW) dan sangat boros GPU di mobile.
          */}
          <div
            className="hero-ring-elem"
            style={{
              position: "absolute",
              width: "min(310px, 78vw)", height: "min(310px, 78vw)",
              borderRadius: "50%",
              border: "1.5px dashed rgba(134,239,172,0.38)",
              animation: "rotateCW 30s linear infinite",
              zIndex: 0,
            }}
          />
          <div
            className="hero-ring-elem"
            style={{
              position: "absolute",
              width: "min(375px, 93vw)", height: "min(375px, 93vw)",
              borderRadius: "50%",
              border: "1px solid rgba(187,247,208,0.2)",
              animation: "rotateCCW 44s linear infinite",
              zIndex: 0,
            }}
          />

          {/*
            PERF FIX: Tambah className="hero-particle-elem" pada setiap partikel.
            7 partikel berjalan bersamaan sangat berat untuk GPU mobile.
          */}
          {[
            { w: 8,  h: 8,  top: "10%", left: "13%",      anim: "particleA", delay: "0s",   dur: "4.4s" },
            { w: 5,  h: 5,  top: "20%", right: "10%",     anim: "particleB", delay: "1.1s", dur: "3.8s" },
            { w: 10, h: 10, top: "68%", left: "8%",       anim: "particleC", delay: "0.6s", dur: "5.2s" },
            { w: 6,  h: 6,  bottom: "18%", right: "12%",  anim: "particleA", delay: "1.8s", dur: "3.6s" },
            { w: 4,  h: 4,  top: "42%", left: "3%",       anim: "particleB", delay: "2.3s", dur: "4.8s" },
            { w: 7,  h: 7,  top: "30%", right: "5%",      anim: "particleC", delay: "0.9s", dur: "3.3s" },
            { w: 5,  h: 5,  bottom: "35%", left: "18%",   anim: "particleA", delay: "3.1s", dur: "5.6s" },
          ].map((p, i) => (
            <div
              key={i}
              className="hero-particle-elem"
              style={{
                position: "absolute",
                width: p.w, height: p.h,
                top: p.top, left: p.left, right: p.right, bottom: p.bottom,
                borderRadius: i % 3 === 0 ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "50%",
                background: i % 2 === 0
                  ? "radial-gradient(circle, rgba(74,222,128,0.6), rgba(34,197,94,0.2))"
                  : "radial-gradient(circle, rgba(187,247,208,0.75), rgba(74,222,128,0.28))",
                animation: `${p.anim} ${p.dur} cubic-bezier(0.4,0,0.2,1) infinite`,
                animationDelay: p.delay,
                zIndex: 2,
              }}
            />
          ))}

          {/*
            PERF FIX: Hapus mixBlendMode: "multiply".
            mixBlendMode memaksa browser membuat layer compositing baru dan
            menonaktifkan GPU acceleration — sangat berat di mobile.
            Tampilan tetap bagus karena drop-shadow masih ada.
            willChange: "transform" dipertahankan karena heroFloat berjalan terus.
          */}
          <div style={{
            position: "relative",
            zIndex: 10,
            animation: "heroFloat 8.5s cubic-bezier(0.4,0,0.2,1) infinite",
            filter: "drop-shadow(0 32px 48px rgba(22,101,52,0.3)) drop-shadow(0 10px 20px rgba(22,101,52,0.16)) drop-shadow(0 2px 6px rgba(22,101,52,0.1))",
            willChange: "transform",
          }}>
            <img
              src={heroImage}
              alt="sawit"
              style={{
                width: "clamp(200px, 56vw, 440px)",
                height: "auto",
                display: "block",
                animation: "leafSway 10s ease-in-out infinite",
              }}
            />
          </div>

          {/*
            PERF FIX: Kurangi backdropFilter blur dari 12px → 4px pada badge.
            backdrop-filter: blur(12px) × 3 badge bersamaan = sangat berat di mobile GPU.
            blur(4px) secara visual hampir tidak berbeda tapi jauh lebih ringan.
            Badge masih punya background rgba(255,255,255,0.93) yang hampir opaque,
            sehingga perubahan blur ini tidak terlihat secara signifikan.
          */}
          {[
            { top: "9%",    right: "3%",  delay: "0.4s", dur: "5.2s",  dot: "#22c55e", label: "Deteksi AI",    entranceDelay: "0.3s" },
            { bottom: "15%",left: "1%",   delay: "1.1s", dur: "4.6s",  dot: "#0ea5e9", label: "Edukasi Sawit", entranceDelay: "0.6s" },
            { bottom: "40%",right: "0%",  delay: "2.2s", dur: "5.8s",  dot: "#f59e0b", label: "Monitoring",    entranceDelay: "0.9s" },
          ].map((b, i) => (
            <div key={i} style={{
              position: "absolute",
              top: b.top, bottom: b.bottom, right: b.right, left: b.left,
              zIndex: 20,
              background: "rgba(255,255,255,0.93)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              borderRadius: 14, padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              border: "1px solid rgba(134,239,172,0.4)",
              animation: `badgeEntrance 0.7s cubic-bezier(0.34,1.56,0.64,1) ${b.entranceDelay} both,
                          badgeFloat ${b.dur} cubic-bezier(0.4,0,0.2,1) ${b.delay} infinite`,
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "40%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                animation: `badgeShimmer ${3 + i * 0.7}s cubic-bezier(0.4,0,0.2,1) ${i * 1.2 + 1}s infinite`,
                pointerEvents: "none",
              }} />
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: b.dot,
                animation: `dotPulse 1.8s cubic-bezier(0.4,0,0.2,1) infinite`,
                animationDelay: `${i * 0.3}s`,
                display: "inline-block", flexShrink: 0,
                boxShadow: `0 0 6px ${b.dot}80`,
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", whiteSpace: "nowrap", position: "relative" }}>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <SawitMapSection />
      <FiturSection />
      <CTASection />

      <footer className="bg-white border-t border-gray-100 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-600">SAWPI</span>
            <span>— Smart Agriculture Platform</span>
          </div>
          <p>© 2026 SAWPI - Smart Agriculture</p>
        </div>
      </footer>
    </div>
  );
}