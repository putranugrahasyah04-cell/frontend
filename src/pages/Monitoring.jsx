import Navbar from "../components/Navbar";
import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import { listenRiwayat, deleteRiwayat } from "../services/firestoreService";

function formatTanggal(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusInfo(penyakit, tingkat) {
  const p = String(penyakit || "").toLowerCase().trim();
  const t = String(tingkat  || "").toLowerCase().trim();

  const isSehat =
    !p ||
    p.includes("tidak ditemukan") || p.includes("tidak ada") ||
    p.includes("sehat") || p.includes("normal") ||
    p.includes("tidak terdeteksi") || p.includes("tidak ada gejala") ||
    t.includes("tidak ada");

  if (isSehat)
    return { label: "Sehat", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", row: "hover:bg-emerald-50/50" };

  if (t.includes("berat") || t.includes("parah") || t.includes("tinggi") || t.includes("kritis"))
    return { label: "Perlu Tindakan", color: "bg-red-100 text-red-600", dot: "bg-red-500", row: "hover:bg-rose-50/50" };

  return { label: "Perlu Perawatan", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500", row: "hover:bg-amber-50/50" };
}

// ─── Smooth Area Chart ────────────────────────────────────────────────────────
function AreaChart({ data }) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = 600, H = 120, padX = 20, padY = 12;

  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = padY + ((maxVal - d.total) / maxVal) * (H - padY * 2);
    return { x, y, d };
  });

  const sehatPts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = padY + ((maxVal - d.sehat) / maxVal) * (H - padY * 2);
    return { x, y };
  });

  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const toArea = (points) => {
    const path = toPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${path} L ${last.x.toFixed(1)} ${(H - padY).toFixed(1)} L ${first.x.toFixed(1)} ${(H - padY).toFixed(1)} Z`;
  };

  function handleMouseMove(e) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    let closest = null;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = { ...p, idx: i };
      }
    });

    if (closest) {
      const pctX = (closest.x / W) * 100;
      const pctY = (closest.y / (H + 24)) * 100;
      setTooltip({ pctX, pctY, svgX: closest.x, svgY: closest.y, idx: closest.idx, data: closest.d });
    }
  }

  // ── Touch support untuk mobile ──────────────────────────────────────────
  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const svg = svgRef.current;
    if (!svg || !touch) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (touch.clientX - rect.left) * scaleX;

    let closest = null;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = { ...p, idx: i };
      }
    });

    if (closest) {
      const pctX = (closest.x / W) * 100;
      const pctY = (closest.y / (H + 24)) * 100;
      setTooltip({ pctX, pctY, svgX: closest.x, svgY: closest.y, idx: closest.idx, data: closest.d });
    }
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  const hasData = data.some(d => d.total > 0);
  const current = data[data.length - 1] || { total: 0, sehat: 0 };
  const currentSakit = Math.max(0, current.total - current.sehat);

  return (
    <div className="relative w-full">
      {!hasData ? (
        <div className="h-32 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl opacity-30">📊</span>
          <p className="text-xs text-gray-400">Belum ada data analisis</p>
        </div>
      ) : (
        <>
          {/* Legend — mobile: lebih compact, wrap rapi */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-1.5">
              <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/></svg>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Total Analisis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round"/></svg>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Tanaman Sehat</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] text-gray-400 hidden sm:inline">otomatis diperbarui tiap bulan</span>
            </div>
          </div>

          {/* Container relatif untuk overlay tooltip HTML */}
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H + 24}`}
              className="w-full overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
              style={{ cursor: "crosshair", touchAction: "none" }}
            >
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sehatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#16a34a" floodOpacity="0.15"/>
                </filter>
              </defs>

              {[0, 0.33, 0.66, 1].map((r, i) => (
                <line key={i}
                  x1={padX} y1={padY + r * (H - padY * 2)}
                  x2={W - padX} y2={padY + r * (H - padY * 2)}
                  stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4 4"
                />
              ))}

              {tooltip && (
                <line
                  x1={tooltip.svgX} y1={padY}
                  x2={tooltip.svgX} y2={H - padY}
                  stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"
                />
              )}

              <path d={toArea(pts)} fill="url(#totalGrad)" />
              <path d={toPath(pts)} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={toArea(sehatPts)} fill="url(#sehatGrad)" />
              <path d={toPath(sehatPts)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />

              {pts.map((p, i) => (
                <g key={i}>
                  {p.d.total > 0 && (
                    <>
                      {tooltip?.idx === i && (
                        <circle cx={p.x} cy={p.y} r="10" fill="#16a34a" fillOpacity="0.12" />
                      )}
                      <circle cx={p.x} cy={p.y} r={tooltip?.idx === i ? "5" : "3.5"}
                        fill={tooltip?.idx === i ? "#16a34a" : "#22c55e"}
                        stroke="white" strokeWidth="2"
                        style={{ transition: "r 0.15s ease" }}
                      />
                    </>
                  )}
                  {p.d.total === 0 && tooltip?.idx === i && (
                    <circle cx={p.x} cy={p.y} r="4" fill="#d1d5db" stroke="white" strokeWidth="2" />
                  )}
                </g>
              ))}

              {data.map((d, i) => {
                const x = padX + (i / (data.length - 1)) * (W - padX * 2);
                const show = data.length <= 6 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
                const isActive = tooltip?.idx === i;
                return show ? (
                  <text key={i} x={x} y={H + 18} textAnchor="middle"
                    fontSize={isActive ? "10" : "9"}
                    fontWeight={isActive ? "700" : "400"}
                    fill={isActive ? "#16a34a" : "#9ca3af"}
                    fontFamily="inherit"
                    style={{ transition: "all 0.15s ease" }}>
                    {monthNames[d.month]}
                  </text>
                ) : null;
              })}
            </svg>

            {/* Tooltip HTML overlay — clamp lebih ketat di mobile */}
            {tooltip && (() => {
              const sakit = Math.max(0, tooltip.data.total - tooltip.data.sehat);
              const pctSehat = tooltip.data.total > 0
                ? Math.round((tooltip.data.sehat / tooltip.data.total) * 100) : 0;

              const isLeft = tooltip.pctX > 55;

              return (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${Math.min(Math.max(tooltip.pctX, 8), 85)}%`,
                    top: `${Math.max(tooltip.pctY - 28, 0)}%`,
                    transform: isLeft ? "translateX(-108%)" : "translateX(6px)",
                    transition: "left 0.12s cubic-bezier(0.4,0,0.2,1), top 0.12s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[130px] max-w-[160px]"
                    style={{ boxShadow: "0 8px 32px -4px rgba(16,163,74,0.18), 0 2px 8px -2px rgba(0,0,0,0.08)" }}>

                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-2">
                      <p className="text-white font-bold text-[11px] tracking-wide">
                        {monthNames[tooltip.data.month]} {tooltip.data.year}
                      </p>
                      {tooltip.data.total === 0 && (
                        <p className="text-green-200 text-[10px] mt-0.5">Tidak ada analisis</p>
                      )}
                    </div>

                    {tooltip.data.total > 0 && (
                      <div className="px-3 py-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                            <span className="text-[10px] text-gray-500">Total</span>
                          </div>
                          <span className="text-xs font-extrabold text-gray-800">{tooltip.data.total}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-500">Sehat</span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600">{tooltip.data.sehat}</span>
                        </div>
                        {sakit > 0 && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <span className="text-[10px] text-gray-500">Bermasalah</span>
                            </div>
                            <span className="text-xs font-extrabold text-red-500">{sakit}</span>
                          </div>
                        )}
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-gray-400">Tingkat Kesehatan</span>
                            <span className="text-[9px] font-bold text-emerald-600">{pctSehat}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                              style={{ width: `${pctSehat}%`, transition: "width 0.3s ease" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute w-2.5 h-2.5 bg-white border-r border-b border-gray-100 rotate-45"
                    style={{
                      bottom: -5,
                      left: isLeft ? "auto" : 18,
                      right: isLeft ? 18 : "auto",
                      boxShadow: "2px 2px 4px rgba(0,0,0,0.06)",
                    }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Footer chart — mobile: wrap dengan gap lebih kecil */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-1">Bulan ini:</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                <span className="text-[10px] text-gray-600">Total <strong className="text-gray-800">{current.total}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-gray-600">Sehat <strong className="text-emerald-700">{current.sehat}</strong></span>
              </span>
              {currentSakit > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[10px] text-gray-600">Bermasalah <strong className="text-red-600">{currentSakit}</strong></span>
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Animated Ring ────────────────────────────────────────────────────────────
function RingChart({ sehat, sakit, total }) {
  const r = 44, cx = 56, cy = 56, stroke = 10;
  const circ = 2 * Math.PI * r;
  const sehatPct = total > 0 ? sehat / total : 0;
  const sakitPct = total > 0 ? sakit / total : 0;
  const sehatDash = sehatPct * circ;
  const sakitDash = sakitPct * circ;
  const gap = total > 0 ? 3 : 0;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="drop-shadow-sm">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {total > 0 ? (
        <>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#34d399" strokeWidth={stroke}
            strokeDasharray={`${Math.max(sehatDash - gap, 0)} ${circ - Math.max(sehatDash - gap, 0)}`}
            strokeDashoffset={circ / 4} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }} />
          {sakit > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f87171" strokeWidth={stroke}
              strokeDasharray={`${Math.max(sakitDash - gap, 0)} ${circ - Math.max(sakitDash - gap, 0)}`}
              strokeDashoffset={circ / 4 - sehatDash + gap} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }} />
          )}
        </>
      ) : null}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="700" fill="#111827">
        {total > 0 ? Math.round(sehatPct * 100) : 0}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#6b7280">Sehat</text>
    </svg>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#16a34a" }) {
  if (!data || data.length < 2) return <div className="h-7" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28, pad = 3;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const fillPts = `${pad},${h} ` + pts + ` ${w - pad},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polygon points={fillPts} fill={color} fillOpacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PalmLeafLeft() {
  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 bottom-0 pointer-events-none select-none"
      style={{ height: "100%", width: "auto", opacity: 0.22 }}>
      <path d="M-10,200 C10,155 30,115 55,75" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20,165 C38,148 58,142 74,146 C57,150 36,160 20,165Z" fill="white" opacity="0.55"/>
      <path d="M20,165 C6,150 -8,144 -18,150 C-6,150 8,158 20,165Z" fill="white" opacity="0.45"/>
      <path d="M30,148 C50,128 72,121 90,124 C72,129 49,139 30,148Z" fill="white" opacity="0.5"/>
      <path d="M40,130 C60,108 84,100 102,103 C83,108 59,119 40,130Z" fill="white" opacity="0.45"/>
      <path d="M50,112 C68,89 92,80 110,83 C90,89 65,101 50,112Z" fill="white" opacity="0.4"/>
      <path d="M-5,200 C20,148 50,100 82,55" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M18,163 C38,142 60,134 78,138 C60,143 37,153 18,163Z" fill="white" opacity="0.55"/>
      <path d="M32,142 C54,118 78,109 98,112 C78,118 53,129 32,142Z" fill="white" opacity="0.5"/>
      <path d="M48,118 C68,93 93,83 112,86 C91,93 64,106 48,118Z" fill="white" opacity="0.45"/>
      <path d="M62,95 C80,70 104,60 122,63 C100,70 74,83 62,95Z" fill="white" opacity="0.4"/>
    </svg>
  );
}

function getRiwayatLocal() {
  try { return JSON.parse(localStorage.getItem("riwayat_analisis") || "[]"); }
  catch { return []; }
}

function buildMonthlyData(history, bulan = 6) {
  const months = Array.from({ length: bulan }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (bulan - 1 - i));
    return { month: d.getMonth(), year: d.getFullYear(), total: 0, sehat: 0 };
  });
  history.forEach(item => {
    const d = new Date(item.tanggal);
    const m = months.findIndex(x => x.month === d.getMonth() && x.year === d.getFullYear());
    if (m >= 0) {
      months[m].total++;
      if (getStatusInfo(item.penyakit, item.tingkat_keparahan).label === "Sehat") months[m].sehat++;
    }
  });
  return months;
}

const facts = [
  { label: "Produksi CPO Indonesia", value: "46,8 jt ton", sub: "terbesar dunia (2023)", color: "from-green-500 to-emerald-600" },
  { label: "Luas Perkebunan Nasional", value: "16,8 jt ha", sub: "termasuk swadaya & swasta", color: "from-teal-500 to-green-600" },
  { label: "Petani Swadaya", value: "2,67 jt KK", sub: "sumber GAPKI 2023", color: "from-lime-500 to-green-500" },
];

const STATUS_BADGE_STYLES = {
  "Sehat":          "badge-sehat",
  "Perlu Tindakan": "badge-tindakan",
  "Perlu Perawatan":"badge-perawatan",
};

function StatusBadge({ label, compact = false }) {
  const cls = STATUS_BADGE_STYLES[label] || "badge-sehat";
  // compact = true untuk mobile card (lebih kecil, auto width)
  if (compact) {
    return (
      <span className={`inline-flex items-center justify-center text-[10px] font-bold rounded-full px-2.5 py-1 ${cls}`}>
        {label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center justify-center text-xs font-bold rounded-full ${cls}`}
      style={{ width: 128, paddingTop: 5, paddingBottom: 5, letterSpacing: "0.01em" }}>
      {label}
    </span>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Monitoring() {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [showAll, setShowAll] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── Refs untuk fitur scroll otomatis ──────────────────────────────────────
  const riwayatSectionRef = useRef(null);   // ref ke header section Riwayat
  const firstNewItemRef   = useRef(null);   // ref ke item pertama yang baru muncul

  useEffect(() => {
    if (!user?.uid) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setFirestoreError(null);

    const unsubscribe = listenRiwayat(
      user.uid,
      (data) => {
        setHistory(data);
        setLoadingData(false);
        setFirestoreError(null);
      },
      (_err) => {
        setLoadingData(false);
        setFirestoreError("Koneksi bermasalah. Menampilkan data terakhir yang tersimpan.");
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Deteksi mobile (< 768px = md breakpoint Tailwind) ────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function handleDeleteItem(item) {
    if (!user?.uid) return;
    setDeleteLoading(true);
    try {
      await deleteRiwayat(user.uid, item.id);
      setDeleteTarget(null);
      if (selectedItem?.id === item.id) setSelectedItem(null);
    } catch (err) {
      console.error("Gagal hapus:", err);
      alert("Gagal menghapus data. Periksa koneksi internet dan coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = history.length;
    const sehat     = history.filter(h => getStatusInfo(h.penyakit, h.tingkat_keparahan).label === "Sehat").length;
    const perawatan = history.filter(h => getStatusInfo(h.penyakit, h.tingkat_keparahan).label === "Perlu Perawatan").length;
    const tindakan  = history.filter(h => getStatusInfo(h.penyakit, h.tingkat_keparahan).label === "Perlu Tindakan").length;
    const sakit     = total - sehat;
    const pctSehat  = total > 0 ? Math.round((sehat / total) * 100) : 0;
    const pctSakit  = total > 0 ? Math.round((sakit / total) * 100) : 0;
    const luasTotal = history
      .reduce((acc, h) => {
        const val = parseFloat(String(h.luas ?? ""));
        return acc + (Number.isFinite(val) && val > 0 ? val : 0);
      }, 0)
      .toFixed(1);
    const monthly     = buildMonthlyData(history, 6);
    const monthlyFull = buildMonthlyData(history, 12);
    const sparkData   = monthly.map(m => m.sehat);
    const sparkTotal  = monthly.map(m => m.total);
    const sparkSakit  = monthly.map(m => Math.max(0, m.total - m.sehat));
    return { total, sehat, perawatan, tindakan, sakit, pctSehat, pctSakit, luasTotal, monthlyFull, sparkData, sparkTotal, sparkSakit };
  }, [history]);

  const { total, sehat, perawatan, tindakan, sakit, pctSehat, pctSakit, luasTotal, monthlyFull, sparkData, sparkTotal, sparkSakit } = stats;

  const filtered = useMemo(() => history.filter(h => {
    if (filter === "sehat") return getStatusInfo(h.penyakit, h.tingkat_keparahan).label === "Sehat";
    if (filter === "sakit") return getStatusInfo(h.penyakit, h.tingkat_keparahan).label !== "Sehat";
    return true;
  }), [history, filter]);

  const DISPLAY_LIMIT = isMobile ? 3 : 5;
  const displayed = showAll ? filtered : filtered.slice(0, DISPLAY_LIMIT);

  // ── Handler expand/collapse dengan scroll otomatis ─────────────────────────
  function handleToggleShowAll() {
    if (!showAll) {
      // Expand: tampil semua → scroll ke item baru pertama
      setShowAll(true);
      setTimeout(() => {
        firstNewItemRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      // Collapse: sembunyikan → scroll balik ke header Riwayat Monitoring
      setShowAll(false);
      setTimeout(() => {
        riwayatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  const fadeUp = (delay = 0) => ({
    opacity: animIn ? 1 : 0,
    transform: animIn ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-800">

      <Navbar />

      {/* HEADER */}
      <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-4 md:px-6 py-8 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <PalmLeafLeft />
        <div className="max-w-screen-xl mx-auto relative z-10">
          <p className="text-green-200 text-xs md:text-sm mb-1">Dashboard Kebun</p>
          <h1 className="text-xl md:text-3xl font-bold text-white">Monitoring Tanaman Sawit</h1>
          <p className="text-green-100 text-xs md:text-sm mt-1 max-w-lg">
            Pantau kondisi kebun secara real-time. Data riwayat diambil dari hasil analisis AI di Cek Tanaman.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-3 md:px-8 py-5 md:py-8 space-y-4 md:space-y-6">

        {/* BANNER ERROR */}
        {firestoreError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-xs text-amber-700">{firestoreError}</p>
            <button onClick={() => setFirestoreError(null)} className="ml-auto text-amber-400 hover:text-amber-600 text-xs font-bold">×</button>
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={fadeUp(0)}>
          {loadingData ? (
            <>
              {[0,1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 rounded-xl" />
                  </div>
                  <div className="h-7 w-10 bg-gray-100 rounded-lg" />
                  <div className="h-2 w-20 bg-gray-100 rounded-full" />
                  <div className="h-7 w-16 bg-gray-50 rounded" />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Card 1 — Total Analisis */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3 relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 stat-card-enter" style={{ animationDelay: "0ms" }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 bg-green-400 blur-xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Total Analisis</span>
                  <span className="w-8 h-8 md:w-9 md:h-9 bg-green-50 rounded-xl flex items-center justify-center text-xs md:text-sm shadow-sm border border-green-100">{"🔍"}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none">{total}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">pemeriksaan tercatat</p>
                </div>
                <Sparkline data={sparkTotal} color="#16a34a" />
              </div>

              {/* Card 2 — Tanaman Sehat */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3 relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 stat-card-enter" style={{ animationDelay: "80ms" }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 bg-emerald-400 blur-xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Tanaman Sehat</span>
                  <span className="w-8 h-8 md:w-9 md:h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-xs md:text-sm shadow-sm border border-emerald-100">{"💚"}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 leading-none">{sehat}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">{pctSehat}% dari total</p>
                </div>
                <Sparkline data={sparkData} color="#10b981" />
              </div>

              {/* Card 3 — Perlu Perawatan/Tindakan */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3 relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 stat-card-enter" style={{ animationDelay: "160ms" }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 bg-red-400 blur-xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Perlu Perawatan</span>
                  <span className="w-8 h-8 md:w-9 md:h-9 bg-red-50 rounded-xl flex items-center justify-center text-xs md:text-sm shadow-sm border border-red-100">{"⚠️"}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-extrabold text-red-500 leading-none">{sakit}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">{pctSakit}% dari total</p>
                </div>
                <Sparkline data={sparkSakit} color="#ef4444" />
              </div>

              {/* Card 4 — Lahan Dipantau */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3 relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 stat-card-enter" style={{ animationDelay: "240ms" }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 bg-teal-400 blur-xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Lahan Dipantau</span>
                  <span className="w-8 h-8 md:w-9 md:h-9 bg-teal-50 rounded-xl flex items-center justify-center text-xs md:text-sm shadow-sm border border-teal-100">{"🌿"}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-extrabold text-teal-600 leading-none">{luasTotal} <span className="text-base md:text-lg font-semibold">Ha</span></p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">area teranalisis</p>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                    style={{ width: `${pctSehat}%` }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* CHART + RINGKASAN */}
        <div className="grid md:grid-cols-3 gap-3 md:gap-4" style={fadeUp(150)}>
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Aktivitas Analisis Bulanan</h3>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">12 bulan terakhir · sentuh/hover titik untuk detail angka</p>
            </div>
            <AreaChart data={monthlyFull} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col">
            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-4 md:mb-5">Ringkasan Kondisi</h3>
            <div className="flex items-center justify-center mb-4 md:mb-5">
              <RingChart sehat={sehat} sakit={sakit} total={total} />
            </div>
            <div className="space-y-2 mt-auto">
              {[
                { label: "Sehat",           count: sehat,     bg: "bg-emerald-50 border border-emerald-100", dot: "bg-emerald-400", text: "text-emerald-700" },
                { label: "Perlu Perawatan", count: perawatan, bg: "bg-amber-50 border border-amber-100",    dot: "bg-amber-400", text: "text-amber-700" },
                { label: "Perlu Tindakan",  count: tindakan,  bg: "bg-red-50 border border-red-100",        dot: "bg-red-400", text: "text-red-600" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between ${item.bg} rounded-xl px-3 py-2 md:py-2.5 transition-all hover:scale-[1.01]`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.dot} pulse-dot`} />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${item.text}`}>{item.count} analisis</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIWAYAT */}
        <div ref={riwayatSectionRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={fadeUp(250)}>

          {/* Header Riwayat */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Riwayat Monitoring</h3>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Data dari hasil analisis AI Cek Tanaman</p>
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 self-start sm:self-auto">
              {[
                { key: "semua", label: "Semua" },
                { key: "sehat", label: "Sehat" },
                { key: "sakit", label: "Bermasalah" },
              ].map(f => (
                <button key={f.key} onClick={() => { setFilter(f.key); setShowAll(false); }}
                  className={`text-xs font-semibold px-2.5 md:px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    filter === f.key
                      ? "bg-white text-gray-800 shadow-sm border border-gray-100"
                      : "text-gray-400 hover:text-gray-600"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-16 md:py-20">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-400">Memuat data riwayat...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="text-5xl mb-3 opacity-20">🌿</div>
              <p className="text-sm font-medium text-gray-500">Belum ada data analisis</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">Lakukan Cek Tanaman untuk memulai monitoring</p>
              <a href="/cek" className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm">
                Cek Tanaman Sekarang
              </a>
            </div>
          ) : (
            <>
              {/* Header kolom — desktop only */}
              <div className="hidden md:grid grid-cols-[1fr_1fr_2fr_136px_52px] gap-4 px-6 py-3 bg-gray-50/60 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <span>Tanggal</span>
                <span>Lokasi / Luas</span>
                <span>Kondisi Terdeteksi</span>
                <span className="text-center">Status</span>
                <span />
              </div>

              <div className="divide-y divide-gray-50/80">
                {displayed.map((item, i) => {
                  const st = getStatusInfo(item.penyakit, item.tingkat_keparahan);
                  // Pasang ref ke item pertama yang baru muncul saat expand
                  const isFirstNew = i === DISPLAY_LIMIT;
                  return (
                    <div key={item.id || i}
                      ref={isFirstNew ? firstNewItemRef : null}
                      className="transition-all duration-200 hover:bg-green-50/30 group"
                      style={{ animationDelay: `${i * 40}ms` }}>

                      {/* ── MOBILE CARD LAYOUT (hanya muncul di hp) ── */}
                      <div className="md:hidden px-4 py-4">
                        {/* Baris atas: tanggal + badge + tombol hapus */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedItem(item)}>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot} pulse-dot`} />
                            <span className="text-[11px] text-gray-400 font-medium">{formatTanggal(item.tanggal)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge label={st.label} compact={true} />
                            {/* Tombol hapus — SELALU VISIBLE di mobile (tidak perlu hover) */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 active:bg-red-50 active:text-red-400 transition-all"
                              aria-label="Hapus riwayat"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Baris konten: lokasi + penyakit */}
                        <div
                          className="bg-gray-50/70 rounded-xl px-3 py-2.5 cursor-pointer active:bg-green-50/60 transition-colors"
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {item.lokasi || "—"}
                            </span>
                            {item.luas && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 rounded-md px-1.5 py-0.5 flex-shrink-0">
                                {item.luas} Ha
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] font-medium text-gray-600">{item.penyakit || "Tidak diketahui"}</p>
                          {item.tingkat_keparahan && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{item.tingkat_keparahan}</p>
                          )}
                          {/* Hint klik untuk detail */}
                          <p className="text-[9px] text-gray-300 mt-1.5 text-right">Ketuk untuk detail →</p>
                        </div>
                      </div>

                      {/* ── DESKTOP ROW LAYOUT (tidak berubah) ── */}
                      <div className="hidden md:grid grid-cols-[1fr_1fr_2fr_136px_52px] gap-4 px-6 py-4 text-sm items-center row-hover">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot} pulse-dot`} />
                          <span className="text-gray-500 text-xs">{formatTanggal(item.tanggal)}</span>
                        </div>
                        <div className="text-gray-700 font-semibold cursor-pointer text-sm" onClick={() => setSelectedItem(item)}>
                          {item.lokasi || "—"}
                          {item.luas && <span className="ml-1 text-xs font-normal text-gray-400">· {item.luas} Ha</span>}
                        </div>
                        <div className="flex flex-col cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <span className="font-semibold text-gray-800 text-sm">{item.penyakit || "Tidak diketahui"}</span>
                          {item.tingkat_keparahan && <span className="text-xs text-gray-400 mt-0.5">{item.tingkat_keparahan}</span>}
                        </div>
                        <div className="flex justify-center cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <StatusBadge label={st.label} />
                        </div>
                        <div className="flex justify-center items-center">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                            className="p-1.5 rounded-lg text-gray-200 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                            {"🗑️"}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {filtered.length > DISPLAY_LIMIT && (
                <div className="text-center px-4 md:px-6 py-4 border-t border-gray-50">
                  <button onClick={handleToggleShowAll}
                    className="text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-6 py-2 rounded-xl transition-all w-full md:w-auto">
                    {showAll ? "Sembunyikan" : `Lihat ${filtered.length - DISPLAY_LIMIT} riwayat lainnya`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* FAKTA */}
        <div style={fadeUp(350)}>
          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Konteks Industri Kelapa Sawit Indonesia</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {facts.map((f, i) => (
              <div key={i} className={`bg-gradient-to-br ${f.color} rounded-2xl p-4 md:p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                <div className="absolute -top-4 -right-4 text-6xl opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500">{f.icon}</div>
                <p className="text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">{f.label}</p>
                <p className="text-xl md:text-2xl font-extrabold leading-none">{f.value}</p>
                <p className="text-[10px] md:text-xs text-white/60 mt-1.5">{f.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 mt-2 px-1">Sumber: GAPKI, Kementerian Pertanian RI, BPS 2023.</p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
          style={fadeUp(400)}>
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-white font-bold text-base md:text-lg">Mulai pemeriksaan baru sekarang</h3>
            <p className="text-green-100 text-xs md:text-sm mt-0.5">Deteksi dini penyakit sawit dengan AI untuk hasil panen optimal</p>
          </div>
          <a href="/cek" className="relative z-10 flex-shrink-0 bg-white text-green-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-all shadow-sm hover:shadow-md hover:scale-105 w-full sm:w-auto text-center">
            Cek Tanaman
          </a>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedItem(null)}
          style={{ animation: "fadeIn 0.2s ease" }}>
          {/* Mobile: slide up dari bawah; Desktop: centered modal */}
          <div
            className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-2xl rounded-t-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ animation: "slideUp 0.25s cubic-bezier(0.4,0,0.2,1)" }}>

            {/* Handle bar mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Detail Hasil Analisis</h2>
              <button onClick={() => setSelectedItem(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg font-bold leading-none">
                ×
              </button>
            </div>

            <div className="px-5 md:px-6 py-5 space-y-4 md:space-y-5">
              <div className="flex gap-3 md:gap-4">
                {selectedItem.imagePreview ? (
                  <img src={selectedItem.imagePreview} alt="Foto tanaman" className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-3xl flex-shrink-0 border border-green-100">{"🌿"}</div>
                )}
                <div className="flex-1 min-w-0">
                  {(() => {
                    const st = getStatusInfo(selectedItem.penyakit, selectedItem.tingkat_keparahan);
                    return (
                      <>
                        <div className="mb-2"><StatusBadge label={st.label} compact={true} /></div>
                        <p className="font-bold text-gray-900 text-xs md:text-sm leading-snug">
                          Penyakit Terdeteksi: <span className="text-green-600">{selectedItem.penyakit || "—"}</span>
                        </p>
                      </>
                    );
                  })()}
                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">
                    {new Date(selectedItem.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}{" "}
                    · {new Date(selectedItem.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                    {selectedItem.lokasi || "—"}
                    {selectedItem.luas && <span> · {selectedItem.luas} Ha</span>}
                    {selectedItem.umur && <span> · {selectedItem.umur}</span>}
                  </p>
                </div>
              </div>

              {(selectedItem.gejala?.length > 0 || selectedItem.solusi_awal?.length > 0) && (
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {selectedItem.gejala?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-600 mb-2">Gejala Teridentifikasi</p>
                      <ul className="space-y-1.5">
                        {selectedItem.gejala.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">✓</span>{g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedItem.solusi_awal?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-600 mb-2">Solusi Awal</p>
                      <ul className="space-y-1.5">
                        {selectedItem.solusi_awal.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedItem.rekomendasi_lengkap && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-green-800 mb-1">Rekomendasi Lengkap:</p>
                  <p className="text-xs text-green-700 leading-relaxed">{selectedItem.rekomendasi_lengkap}</p>
                </div>
              )}
              {selectedItem.catatan && <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">{selectedItem.catatan}</p>}
            </div>

            <div className="px-5 md:px-6 pb-6 md:pb-5">
              <button onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-gray-100 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-200 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setDeleteTarget(null)}>
          {/* Mobile: slide up; Desktop: centered */}
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-5 md:p-6"
            onClick={e => e.stopPropagation()}
            style={{ animation: "slideUp 0.25s cubic-bezier(0.4,0,0.2,1)" }}>

            {/* Handle bar mobile */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{"🗑️"}</div>
            <h2 className="font-bold text-gray-900 text-base mb-1 text-center">Hapus Riwayat Ini?</h2>
            <p className="text-xs text-gray-400 text-center mb-4">Data analisis berikut akan dihapus permanen:</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5 space-y-1">
              <p className="text-xs font-semibold text-gray-700">
                {new Date(deleteTarget.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs text-gray-500">{deleteTarget.lokasi || "—"}{deleteTarget.luas ? ` · ${deleteTarget.luas} Ha` : ""}</p>
              <p className="text-xs text-gray-500">{deleteTarget.penyakit || "—"}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-200 transition">
                Batal
              </button>
              <button onClick={() => handleDeleteItem(deleteTarget)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-500 text-white font-semibold text-sm rounded-xl hover:bg-red-600 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}