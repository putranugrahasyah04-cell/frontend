import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

const SAWIT_DATA = {
  "riau":                       { nama: "Riau",               luas: "2,86 jt ha", produksi: "8,5 jt ton", rank: 1  },
  // FIX: GeoJSON menyimpan slug "west-kalimantan" untuk area yang secara visual adalah
  // Kalimantan Tengah (provinsi besar di tengah-selatan Kalimantan). Jadi data
  // Kalimantan Tengah harus dipasang di key "west-kalimantan" agar tooltip & list sinkron.
  "west-kalimantan":            { nama: "Kalimantan Tengah",  luas: "1,92 jt ha", produksi: "5,2 jt ton", rank: 2  },
  "north-sumatera":             { nama: "Sumatera Utara",     luas: "1,56 jt ha", produksi: "4,8 jt ton", rank: 3  },
  "central-kalimantan":         { nama: "Kalimantan Barat",   luas: "1,74 jt ha", produksi: "4,1 jt ton", rank: 4  },
  "east-kalimantan":            { nama: "Kalimantan Timur",   luas: "1,28 jt ha", produksi: "3,6 jt ton", rank: 5  },
  "south-sumatera":             { nama: "Sumatera Selatan",   luas: "1,11 jt ha", produksi: "3,1 jt ton", rank: 6  },
  "jambi":                      { nama: "Jambi",              luas: "0,76 jt ha", produksi: "2,4 jt ton", rank: 7  },
  "south-kalimantan":           { nama: "Kalimantan Selatan", luas: "0,62 jt ha", produksi: "1,8 jt ton", rank: 8  },
  "special-region-of-aceh":     { nama: "Aceh",               luas: "0,51 jt ha", produksi: "1,5 jt ton", rank: 9  },
  "special-region-of-papua":    { nama: "Papua",              luas: "0,43 jt ha", produksi: "1,1 jt ton", rank: 10 },
  "bengkulu":                   { nama: "Bengkulu",           luas: "0,38 jt ha", produksi: "0,9 jt ton", rank: 11 },
  "central-sulawesi":           { nama: "Sulawesi Tengah",    luas: "0,22 jt ha", produksi: "0,6 jt ton", rank: 12 },
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

function IndonesiaMap({ onHover, hoveredSlug }) {
  const [mapFeatures, setMapFeatures] = useState([]);

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

  return (
    <div className="w-full relative" style={{ background: "#dbeafe", borderRadius: 12 }}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ display: "block" }}>
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
                transition: "fill 0.2s ease",
                cursor: isSawit ? "pointer" : "default",
                filter: isHovered && isSawit ? "drop-shadow(0 2px 6px rgba(245,158,11,0.5))" : "none",
              }}
              onMouseEnter={() => isSawit ? onHover(feat.slug) : null}
              onMouseLeave={() => onHover(null)}
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
}

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

  useEffect(() => {
    if (!mapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapRef.current) setMapHeight(mapRef.current.offsetHeight);
    });
    ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, []);

  const hovData = hoveredSlug ? SAWIT_DATA[hoveredSlug] : null;
  const allProvinsi = Object.entries(SAWIT_DATA).sort((a, b) => a[1].rank - b[1].rank);
  const maxProd = 8.5;

  return (
    <section ref={sectionRef} className="py-10 md:py-16 px-5 md:px-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div
          className="text-center mb-10"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
        >
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
            Peta Sawit Indonesia
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Indonesia, Raksasa <span className="text-green-600">Kelapa Sawit</span> Dunia
          </h2>
          <p className="mt-2 text-gray-400 text-sm">Arahkan kursor ke provinsi untuk melihat data produksi · Warna lebih gelap = produksi lebih tinggi</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-3.5 md:p-5 text-white overflow-hidden group cursor-default"
              style={{
                ...stat.bgStyle,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`,
                boxShadow: `0 12px 32px -4px ${stat.glow}, 0 4px 12px -2px rgba(0,0,0,0.2)`,
                border: `1px solid ${stat.borderColor}`,
              }}
            >
              {/* Subtle diagonal shine */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
              }} />
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 2,
                background: `linear-gradient(to right, transparent, ${stat.accentColor.replace("0.15","0.6")}, transparent)`,
                borderRadius: "0 0 4px 4px",
              }} />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{stat.label}</p>
                  <span className="text-base" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}></span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl md:text-3xl font-extrabold leading-none tracking-tight">{stat.value}</span>
                  <span className="text-xs font-semibold text-white/65">{stat.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Peta + Ranking */}
        <div
          className="grid md:grid-cols-3 gap-6 items-start"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}
        >
          {/* PETA */}
          <div className="md:col-span-2 flex flex-col">
            <div ref={mapRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <IndonesiaMap onHover={setHoveredSlug} hoveredSlug={hoveredSlug} />

              {/* Tooltip */}
              {hovData && (
                <div className="absolute bottom-4 left-4 bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[200px] z-10"
                  style={{ animation: "fadeIn 0.15s ease" }}>
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

              {/* Legend */}
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

          {/* Ranking 12 Provinsi */}
          <div className="flex flex-col gap-4">
            <div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
              style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? 'auto' : mapHeight, maxHeight: mapHeight || 500 }}
            >
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm">12 Provinsi Sawit Terbesar</p>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1v10M5 11L2.5 8.5M5 11L7.5 8.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  scroll
                </span>
              </div>

              <div
                className="flex-1 overflow-y-auto pr-1 space-y-2"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#bbf7d0 transparent" }}
              >
                {allProvinsi.map(([slug, d], i) => {
                  const prodNum = parseFloat(d.produksi.replace(/[^\d.]/g, ""));
                  const pct = (prodNum / maxProd) * 100;
                  const isHov = hoveredSlug === slug;
                  const rankColor = getRankColor(d.rank);
                  return (
                    <div
                      key={slug}
                      className={"rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-200 " + (isHov ? "bg-amber-50 border border-amber-200" : "hover:bg-green-50 border border-transparent")}
                      onMouseEnter={() => setHoveredSlug(slug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                            style={{ background: rankColor, fontSize: 9 }}
                          >
                            {d.rank}
                          </span>
                          <span className="text-xs font-medium text-gray-800 truncate max-w-[110px]">{d.nama}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{d.produksi}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: visible ? pct + "%" : "0%",
                            background: rankColor,
                            transitionDelay: i * 60 + "ms",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className="flex-shrink-0 h-6 -mb-1 rounded-b-2xl pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, white)" }}
              />
            </div>
          </div>
        </div>

        {/* ARTIKEL FAKTUAL */}
        <div className="mt-10 max-w-4xl">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Fakta & Data Industri Sawit</p>

          <div className="space-y-5 text-gray-700 text-base leading-relaxed">
            <p>
              Indonesia dan Malaysia secara bersama-sama menguasai lebih dari{" "}
              <strong className="text-gray-900">85% produksi minyak kelapa sawit dunia</strong>, menjadikan kedua negara ini sebagai pilar utama industri sawit global.
              Indonesia sendiri merupakan produsen terbesar dengan volume produksi CPO mencapai{" "}
              <strong className="text-gray-900">46,8 juta ton</strong> pada tahun 2023, jauh melampaui negara produsen lainnya.
            </p>

            <p>
              Di dalam negeri, industri kelapa sawit berkontribusi sekitar{" "}
              <strong className="text-gray-900">3,5–4% terhadap PDB Indonesia</strong> dan menyerap tenaga kerja langsung maupun tidak langsung bagi lebih dari{" "}
              <strong className="text-gray-900">21 juta orang</strong>, mulai dari petani swadaya, buruh kebun, hingga pekerja di sektor pengolahan dan hilir.
            </p>

            <p>
              Luas total perkebunan kelapa sawit di Indonesia mencapai{" "}
              <strong className="text-gray-900">16,8 juta hektar</strong> — setara dengan hampir setengah luas Pulau Sumatera. Sekitar{" "}
              <strong className="text-gray-900">41% di antaranya</strong> dikelola oleh petani swadaya (smallholders) yang tersebar di Sumatera, Kalimantan, dan Sulawesi.
            </p>

            <p>
              Sebagai komoditas ekspor unggulan, minyak sawit dan produk turunannya menyumbang devisa negara sebesar{" "}
              <strong className="text-gray-900">lebih dari USD 28 miliar</strong> per tahun, menjadikannya salah satu sumber penghasil devisa terbesar Indonesia setelah sektor energi dan mineral.
            </p>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            Sumber: GAPKI (Gabungan Pengusaha Kelapa Sawit Indonesia), Kementerian Pertanian RI, BPS 2023.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      {/* HERO */}
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
            Upload foto sawit sakit sekarang AI analisis 70% akurat! Monitoring harian dan edukasi gratis tingkatkan hasil panen Anda
            Rasakan revolusi perkebunan pintar.
          </p>
        </div>

        {/* ── HERO IMAGE — animasi diperbaiki ── */}
        <div className="flex justify-center items-center relative" style={{ minHeight: 'clamp(240px, 50vw, 420px)', overflow: 'hidden' }}>

          {/* Glow blob di belakang */}
          <div style={{
            position: "absolute",
            width: "min(320px, 80vw)",
            height: "min(320px, 80vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, rgba(34,197,94,0.09) 55%, transparent 75%)",
            animation: "heroPulseGlow 5s ease-in-out infinite",
            zIndex: 0,
          }} />

          {/* Ring dekoratif berputar lambat */}
          <div style={{
            position: "absolute",
            width: "min(300px, 75vw)",
            height: "min(300px, 75vw)",
            borderRadius: "50%",
            border: "1.5px dashed rgba(134,239,172,0.45)",
            animation: "heroRotateCW 22s linear infinite",
            zIndex: 0,
          }} />
          <div style={{
            position: "absolute",
            width: "min(360px, 90vw)",
            height: "min(360px, 90vw)",
            borderRadius: "50%",
            border: "1px solid rgba(187,247,208,0.3)",
            animation: "heroRotateCCW 32s linear infinite",
            zIndex: 0,
          }} />

          {/* Partikel mengambang */}
          {[
            { w: 9,  h: 9,  top: "8%",  left: "14%", delay: "0s",    dur: "3.8s" },
            { w: 6,  h: 6,  top: "18%", right: "12%", delay: "0.9s", dur: "4.2s" },
            { w: 11, h: 11, top: "72%", left: "9%",   delay: "1.4s", dur: "3.5s" },
            { w: 7,  h: 7,  bottom: "14%", right: "13%", delay: "0.5s", dur: "4.8s" },
            { w: 5,  h: 5,  top: "44%", left: "4%",   delay: "2.1s", dur: "3.2s" },
            { w: 8,  h: 8,  top: "28%", right: "6%",  delay: "1.6s", dur: "5.1s" },
            { w: 6,  h: 6,  bottom: "30%", left: "18%", delay: "0.3s", dur: "4.0s" },
          ].map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              width: p.w,
              height: p.h,
              top: p.top,
              left: p.left,
              right: p.right,
              bottom: p.bottom,
              borderRadius: "50%",
              background: "rgba(74,222,128,0.35)",
              animation: `heroParticleFloat ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
              zIndex: 1,
            }} />
          ))}

          {/* Gambar utama floating */}
          <div style={{
            position: "relative",
            zIndex: 10,
            animation: "heroImageFloat 6.5s ease-in-out infinite",
            filter: "drop-shadow(0 28px 40px rgba(22,101,52,0.22)) drop-shadow(0 8px 16px rgba(22,101,52,0.12))",
          }}>
            <img
              src={heroImage}
              alt="sawit"
              style={{
                width: "clamp(180px, 55vw, 420px)",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          {/* Badge AI Powered melayang */}
          <div style={{
            position: "absolute",
            top: "10%",
            right: "4%",
            zIndex: 20,
            background: "white",
            borderRadius: 14,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid rgba(134,239,172,0.5)",
            animation: "heroBadgeFloat 5s ease-in-out infinite",
            animationDelay: "1s",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              animation: "heroDotPulse 2s ease-in-out infinite",
              display: "inline-block",
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Deteksi AI</span>
          </div>

          {/* Badge Deteksi Instan melayang */}
          <div style={{
            position: "absolute",
            bottom: "16%",
            left: "2%",
            zIndex: 20,
            background: "white",
            borderRadius: 14,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid rgba(134,239,172,0.5)",
            animation: "heroBadgeFloat 4.5s ease-in-out infinite",
            animationDelay: "0.4s",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22c5c2",
              boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              animation: "heroDotPulse 2s ease-in-out infinite",
              display: "inline-block",
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Edukasi Sawit</span>
          </div>

          {/* Badge Akurasi melayang */}
          <div style={{
            position: "absolute",
            bottom: "42%",
            right: "1%",
            zIndex: 20,
            background: "white",
            borderRadius: 14,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid rgba(134,239,172,0.5)",
            animation: "heroBadgeFloat 5.5s ease-in-out infinite",
            animationDelay: "2s",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#c5a722",
              boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              animation: "heroDotPulse 2s ease-in-out infinite",
              display: "inline-block",
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Monitoring</span>
          </div>
        </div>
        {/* ── END HERO IMAGE ── */}
      </section>

      {/* CSS keyframes untuk animasi hero */}

      {/* PETA SAWIT */}
      <SawitMapSection />

      {/* FITUR */}
      <section className="bg-white py-10 md:py-14 px-5 md:px-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3 tracking-wider uppercase">Fitur Unggulan</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Semua yang Kamu Butuhkan</h2>
            <p className="text-gray-400 text-sm mt-2">Teknologi AI untuk pertanian sawit yang lebih cerdas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => navigate(f.route)}
                className={`relative cursor-pointer rounded-2xl p-6 border border-gray-100 ${f.bg} group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-transparent`}
              >
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br ${f.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <img
                      src={f.icon}
                      alt={f.title}
                      className="object-contain"
                      style={{ width: "28px", height: "28px", transform: `scale(${f.scale || 1})` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <div className="relative">
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>

                <div className={`relative mt-5 flex items-center gap-1 text-xs font-bold ${f.arrowColor} group-hover:gap-2 transition-all duration-200`}>
                  Lihat selengkapnya
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-10 md:py-20 px-5 md:px-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 25%, #15803d 55%, #16a34a 80%, #22c55e 100%)" }}
      >
        {/* Noise texture overlay for premium feel */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
        {/* Radial glow kiri */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 80% at 2% 55%, rgba(74,222,128,0.28) 0%, transparent 65%)" }} />
        {/* Radial glow kanan atas */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 60% at 95% 10%, rgba(187,247,208,0.18) 0%, transparent 60%)" }} />
        {/* Radial glow bawah tengah */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 40% at 50% 110%, rgba(21,128,61,0.55) 0%, transparent 70%)" }} />
        {/* Garis top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, rgba(187,247,208,0.6), rgba(255,255,255,0.5), rgba(187,247,208,0.6), transparent)" }} />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative" style={{ zIndex: 1 }}>
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
                  transition: "all 0.2s ease", backdropFilter: "blur(4px)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              >Follow Instagram</a>
              <a href="https://wa.me/082380252538" target="_blank" rel="noreferrer"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  color: "#15803d", fontWeight: 700, padding: "10px 22px",
                  borderRadius: 12, fontSize: 14, textDecoration: "none",
                  transition: "all 0.2s ease", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >WhatsApp Kami</a>
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20, padding: "28px",
            backdropFilter: "blur(8px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <p style={{ color: "#dcfce7", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
              Fitur Unggulan
            </p>
            <ul className="space-y-3">
              {[
                "Monitoring tanaman real-time",
                "Deteksi penyakit berbasis AI",
                "Rekomendasi pupuk otomatis",
                "Analisis hasil panen",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dcfce7", flexShrink: 0 }} />
                  <span style={{ color: "rgba(220,252,231,0.95)", fontSize: 14, fontWeight: 500 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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