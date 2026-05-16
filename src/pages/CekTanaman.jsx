import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/useAuth";
import { saveRiwayat, fetchRiwayat } from "../services/firestoreService";
import API from "../services/api";
import { buildPromptFull } from "../utils/promptBuilder";

// ─── Konstanta ─────────────────────────────────────────────────────────────
const UMUR_OPTIONS = ["< 1 tahun", "1-3 tahun", "4-7 tahun", "8-14 tahun", "> 15 tahun"];
const JENIS_LAHAN_OPTIONS = [
  { value: "mineral",    label: "Tanah Mineral" },
  { value: "gambut",     label: "Lahan Gambut"  },
  { value: "tidak_tahu", label: "Tidak Tahu"    },
];
const RIWAYAT_OPTIONS = [
  { value: "tidak_ada",  label: "Tidak ada"            },
  { value: "ganoderma",  label: "Pernah ada Ganoderma" },
  { value: "hama",       label: "Pernah ada hama"      },
  { value: "lainnya",    label: "Lainnya"               },
];
const BAGIAN_OPTIONS = [
  { value: "daun",        label: "Daun"             },
  { value: "batang",      label: "Batang / Pangkal"  },
  { value: "tandan",      label: "Tandan Buah"       },
  { value: "keseluruhan", label: "Keseluruhan Pohon" },
];
const MAX_PHOTOS = 3;

// ─── Dekorasi SVG Daun Sawit ────────────────────────────────────────────────
function PalmLeafLeft() {
  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 bottom-0 pointer-events-none select-none"
      style={{ height: "100%", width: "auto", opacity: 0.22 }}>
      <path d="M-10,200 C10,155 30,115 55,75" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20,165 C38,148 58,142 74,146 C57,150 36,160 20,165Z" fill="white" opacity="0.55"/>
      <path d="M20,165 C38,148 60,141 76,144" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M20,165 C6,150 -8,144 -18,150 C-6,150 8,158 20,165Z" fill="white" opacity="0.45"/>
      <path d="M30,148 C50,128 72,121 90,124 C72,129 49,139 30,148Z" fill="white" opacity="0.5"/>
      <path d="M30,148 C50,128 72,120 90,123" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M30,148 C15,133 -1,127 -14,132 C-1,133 15,141 30,148Z" fill="white" opacity="0.4"/>
      <path d="M40,130 C60,108 84,100 102,103 C83,108 59,119 40,130Z" fill="white" opacity="0.45"/>
      <path d="M40,130 C26,115 10,109 -2,113" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M50,112 C68,89 92,80 110,83 C90,89 65,101 50,112Z" fill="white" opacity="0.4"/>
      <path d="M60,94 C76,72 98,63 115,66 C95,72 71,84 60,94Z" fill="white" opacity="0.35"/>
      <path d="M-5,200 C20,148 50,100 82,55" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M18,163 C38,142 60,134 78,138 C60,143 37,153 18,163Z" fill="white" opacity="0.55"/>
      <path d="M18,163 C4,148 -12,142 -24,148 C-10,148 6,156 18,163Z" fill="white" opacity="0.45"/>
      <path d="M32,142 C54,118 78,109 98,112 C78,118 53,129 32,142Z" fill="white" opacity="0.5"/>
      <path d="M32,142 C16,126 -2,120 -16,126 C-2,127 16,135 32,142Z" fill="white" opacity="0.4"/>
      <path d="M48,118 C68,93 93,83 112,86 C91,93 64,106 48,118Z" fill="white" opacity="0.45"/>
      <path d="M62,95 C80,70 104,60 122,63 C100,70 74,83 62,95Z" fill="white" opacity="0.4"/>
      <path d="M74,74 C90,50 113,40 130,43 C108,50 82,63 74,74Z" fill="white" opacity="0.35"/>
      <path d="M5,200 C36,155 68,108 100,65" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M28,168 C46,148 66,140 84,144 C66,149 44,159 28,168Z" fill="white" opacity="0.4"/>
      <path d="M28,168 C14,153 -4,147 -18,153 C-4,153 12,161 28,168Z" fill="white" opacity="0.35"/>
      <path d="M46,144 C64,122 86,114 104,117 C85,123 61,134 46,144Z" fill="white" opacity="0.38"/>
      <path d="M62,120 C79,98 100,90 118,93 C98,99 74,111 62,120Z" fill="white" opacity="0.34"/>
      <path d="M76,98 C92,77 112,68 130,71 C110,78 86,90 76,98Z" fill="white" opacity="0.3"/>
    </svg>
  );
}

// ─── Helper: Parse AI Result ────────────────────────────────────────────────
function parseAIResult(text) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"penyakit"[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return JSON.parse(text);
  } catch { return null; }
}

// ─── Helper: Severity Color ─────────────────────────────────────────────────
function getSeverityColor(level) {
  if (!level) return "bg-gray-100 text-gray-600";
  const l = level.toLowerCase();
  if (l === "kritis") return "bg-red-100 text-red-700";
  if (l === "berat" || l.includes("parah") || l.includes("tinggi")) return "bg-red-50 text-red-600";
  if (l === "sedang" || l.includes("menengah")) return "bg-amber-50 text-amber-700";
  if (l === "ringan" || l.includes("awal")) return "bg-yellow-50 text-yellow-700";
  if (l.includes("tidak ada") || l === "normal") return "bg-emerald-50 text-emerald-700";
  return "bg-emerald-50 text-emerald-700";
}

// ─── Helper: Compress Image ─────────────────────────────────────────────────
function compressImage(dataUrl, maxSize = 300, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// ─── Sub-component: Indikator Progress Analisis ─────────────────────────────
function AnalysisProgress({ step }) {
  const steps = [
    { label: "Foto diupload"           },
    { label: "Menganalisis gambar..."  },
    { label: "Menyiapkan rekomendasi"  },
  ];
  return (
    <div className="mt-5 space-y-2">
      {steps.map((s, i) => {
        const isDone   = step > i + 1;
        const isActive = step === i + 1;
        return (
          <div key={i} className={
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 " +
            (isDone   ? "bg-emerald-50 text-emerald-700"  :
             isActive ? "bg-green-50 text-green-700"      :
                        "bg-gray-50 text-gray-400")
          }>
            <span className={
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 " +
              (isDone   ? "bg-emerald-500 text-white" :
               isActive ? "bg-green-600 text-white"   :
                          "bg-gray-200 text-gray-500")
            }>
              {isDone ? "✓" : i + 1}
            </span>
            <span className="text-sm font-medium">{s.label}</span>
            {isActive && (
              <div className="ml-auto w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-component: Panduan Foto Visual ─────────────────────────────────────
function PhotoGuide() {
  const good = [
    "Cahaya cukup dan merata",
    "Fokus tajam pada gejala",
    "Jarak 20–40 cm dari daun",
    "Tampilkan gejala seluruhnya",
  ];
  const bad = [
    "Foto terlalu gelap",
    "Foto blur / tidak fokus",
    "Terlalu jauh dari objek",
    "Gejala terpotong di frame",
  ];
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 px-4 pt-3 pb-2 bg-gray-50 border-b border-gray-100 tracking-wide uppercase">Panduan Foto</p>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4">
          <p className="text-xs font-semibold text-emerald-700 mb-2.5 tracking-wide uppercase">Foto Baik</p>
          <ul className="space-y-2">
            {good.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-gray-50/50">
          <p className="text-xs font-semibold text-red-500 mb-2.5 tracking-wide uppercase">Hindari</p>
          <ul className="space-y-2">
            {bad.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Mini History Card ───────────────────────────────────────
function MiniHistoryCard({ item }) {
  const tgl = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-200">
      {item.imagePreview ? (
        <img src={item.imagePreview} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
          <span className="w-5 h-5 rounded-full bg-green-200" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate mb-1">{item.penyakit || "—"}</p>
        <span className={"text-xs font-medium px-2 py-0.5 rounded-md " + getSeverityColor(item.tingkat_keparahan)}>
          {item.tingkat_keparahan || "—"}
        </span>
        <p className="text-xs text-gray-400 mt-1">{tgl}</p>
      </div>
    </div>
  );
}

// ─── Sub-component: Radio Group ─────────────────────────────────────────────
function RadioGroup({ options, value, onChange, name }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt.value}
          className={
            "flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer text-sm transition-all duration-150 " +
            (value === opt.value
              ? "border-green-500 bg-green-600 text-white font-semibold shadow-sm"
              : "border-gray-200 text-gray-600 hover:border-green-300 hover:bg-gray-50")
          }>
          <input type="radio" name={name} value={opt.value} checked={value === opt.value}
            onChange={() => onChange(opt.value)} className="sr-only" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// ─── Label komponen ─────────────────────────────────────────────────────────
function FieldLabel({ children, hint }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}
      {hint && <span className="ml-1.5 text-xs text-green-600 font-normal">{hint}</span>}
    </label>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="font-bold text-gray-900 text-base">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function CekTanaman() {
  const { user } = useAuth();

  // ── State Form Utama ──────────────────────────────────────────────────────
  const [umur,   setUmur]   = useState("");
  const [luas,   setLuas]   = useState("");
  const [lokasi, setLokasi] = useState("");
  const [simpan, setSimpan] = useState(true);
  const [agree,  setAgree]  = useState(false);

  // ── State Field Tambahan ──────────────────────────────────────────────────
  const [jenisLahan,      setJenisLahan]      = useState("");
  const [keluhanPetani,   setKeluhanPetani]   = useState("");
  const [riwayatPenyakit, setRiwayatPenyakit] = useState("");
  const [sudahDiberiObat, setSudahDiberiObat] = useState("");
  const [bagianTanaman,   setBagianTanaman]   = useState("");

  // ── State Multi-Foto (maks 3) ─────────────────────────────────────────────
  const [imageFiles,    setImageFiles]    = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileRef    = useRef();
  const addFileRef = useRef();

  // ── State UI ──────────────────────────────────────────────────────────────
  const [dragging,      setDragging]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [analysisStep,  setAnalysisStep]  = useState(0);
  const [result,        setResult]        = useState(null);
  const [error,         setError]         = useState("");
  const [showFull,      setShowFull]      = useState(false);
  const [riwayatTerakhir, setRiwayatTerakhir] = useState([]);

  // ── Load 3 riwayat terakhir saat mount ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchRiwayat(user.uid);
        if (Array.isArray(data)) setRiwayatTerakhir(data.slice(0, 3));
      } catch {
        // Gagal muat riwayat — tidak crash, tidak tampil
      }
    })();
  }, [user]);

  // ── Handle File (tunggal / tambahan) ─────────────────────────────────────
  function handleFile(file, isAdditional = false) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB. Kompres foto terlebih dahulu.");
      return;
    }
    if (isAdditional && imageFiles.length >= MAX_PHOTOS) {
      setError(`Maksimal ${MAX_PHOTOS} foto.`);
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isAdditional) {
        setImageFiles(prev    => [...prev, file]);
        setImagePreviews(prev => [...prev, e.target.result]);
      } else {
        setImageFiles(prev    => [file,             ...prev.slice(1)]);
        setImagePreviews(prev => [e.target.result,  ...prev.slice(1)]);
      }
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(idx) {
    setImageFiles(prev    => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0], false);
  }

  // ── MAIN: Analisis ────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (imageFiles.length === 0) { setError("Silakan upload foto tanaman terlebih dahulu."); return; }
    if (!agree)                   { setError("Harap setujui syarat & ketentuan sebelum melanjutkan."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    setAnalysisStep(1);

    try {
      const primaryFile = imageFiles[0];
      const base64Data = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = () => res(reader.result.split(",")[1]);
        reader.onerror = () => rej(new Error("Gagal membaca file"));
        reader.readAsDataURL(primaryFile);
      });

      setAnalysisStep(2);

      const mediaType = primaryFile.type;

      const jenisLahanText =
        jenisLahan === "gambut"     ? "Lahan Gambut (risiko Ganoderma & defisiensi K lebih tinggi)"
        : jenisLahan === "mineral"  ? "Tanah Mineral"
        : jenisLahan === "tidak_tahu" ? "Tidak diketahui"
        : "tidak disebutkan";

      const riwayatText =
        riwayatPenyakit === "ganoderma" ? "Pernah terinfeksi Ganoderma — waspadai gejala awal busuk pangkal batang"
        : riwayatPenyakit === "hama"    ? "Pernah terserang hama — perhatikan kerusakan mekanis dan gejala gigitan"
        : riwayatPenyakit === "lainnya" ? "Pernah ada penyakit lain (tidak spesifik)"
        : riwayatPenyakit === "tidak_ada" ? "Tidak ada riwayat penyakit sebelumnya"
        : "tidak disebutkan";

      const bagianText =
        bagianTanaman === "daun"        ? "Daun/anak daun — fokus analisis bercak, warna, dan tekstur daun"
        : bagianTanaman === "batang"    ? "Batang/Pangkal batang — fokus analisis lesi, busuk, dan basidiokarp"
        : bagianTanaman === "tandan"    ? "Tandan Buah — fokus analisis kondisi tandan dan buah"
        : bagianTanaman === "keseluruhan" ? "Keseluruhan Pohon — analisis tajuk, pelepah, postur umum"
        : "tidak disebutkan";

      const fotoInfo = imageFiles.length > 1
        ? `Petani mengupload ${imageFiles.length} foto. Foto #1 adalah foto utama yang dianalisis. Foto #2–${imageFiles.length} adalah foto pendukung dari sudut lain. Pertimbangkan konteks multi-foto ini dalam diagnosis.`
        : "Satu foto dikirim.";

      // ── PROMPT BARU v3.0 ──────────────────────────────────────────────────
      const prompt = buildPromptFull({
        umur, luas, lokasi,
        jenisLahan, jenisLahanText,
        bagianText, riwayatText,
        sudahDiberiObat, keluhanPetani,
        fotoInfo,
        jumlahFoto: imageFiles.length,
      });
      // ─────────────────────────────────────────────────────────────────────

      setAnalysisStep(3);

      const { data } = await API.post("/analyze", {
        image:    base64Data,
        mimeType: mediaType,
        prompt,
      });

      const rawText = data.rawText || "";
      let parsed = parseAIResult(rawText);
      if (!parsed) {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd   = rawText.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          try { parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1)); } catch { parsed = null; }
        }
      }

      if (!parsed) {
        setError("Gagal memproses respons AI. Coba lagi dengan foto yang lebih jelas.");
      } else {
        setResult({
          ...parsed,
          imagePreview:  imagePreviews[0],
          allPreviews:   imagePreviews,
          waktuAnalisis: new Date().toISOString(),
        });

        if (simpan && user) {
          try {
            const imageThumbnail = await compressImage(imagePreviews[0]);
            await saveRiwayat(user.uid, {
              tanggal:             new Date().toISOString(),
              penyakit:            parsed.penyakit            || "Tidak diketahui",
              // BUG FIX: Pastikan tingkat_keparahan selalu ada nilainya
              // Jika AI tidak mengembalikan, fallback ke "Tidak ada"
              tingkat_keparahan:   parsed.tingkat_keparahan   || "Tidak ada",
              gejala:              parsed.gejala              || [],
              solusi_awal:         parsed.solusi_awal         || [],
              rekomendasi_lengkap: parsed.rekomendasi_lengkap || "",
              catatan:             parsed.catatan             || "",
              lokasi: lokasi || "",
              // BUG FIX: Simpan luas sebagai number bukan string
              // agar parseFloat di Monitoring selalu akurat
              luas: luas !== "" && !isNaN(parseFloat(luas)) ? parseFloat(luas) : null,
              umur,
              jenisLahan,
              keluhanPetani,
              riwayatPenyakit,
              bagianTanaman,
              imagePreview: imageThumbnail,
            });
            try {
              const freshData = await fetchRiwayat(user.uid);
              if (Array.isArray(freshData)) setRiwayatTerakhir(freshData.slice(0, 3));
            } catch {
              // Tidak crash kalau fetch gagal
            }
          } catch (saveErr) {
            console.warn("Gagal simpan ke Firestore:", saveErr);
          }
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
      setAnalysisStep(0);
    }
  }

  // ── Bagikan via WhatsApp ──────────────────────────────────────────────────
  function handleShareWhatsApp() {
    if (!result) return;
    const solusiText = (result.solusi_awal || [])
      .slice(0, 3)
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");
    const text =
      `🌴 *Hasil Analisis Sawit - SAWPI*\n\n` +
      `📊 Kondisi   : *${result.penyakit}*\n` +
      `⚠️ Keparahan : *${result.tingkat_keparahan}*\n` +
      `🎯 Akurasi   : ${result.confidence}\n` +
      (lokasi ? `📍 Lokasi    : ${lokasi}\n` : "") +
      `\n✅ *Solusi Awal:*\n${solusiText}\n\n` +
      `_Dianalisis menggunakan SAWPI — Sistem Analisis Sawit Pintar_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // ── Cetak / Simpan PDF ────────────────────────────────────────────────────
  function handlePrint() {
    if (!result) return;
    const tgl = result.waktuAnalisis
      ? new Date(result.waktuAnalisis).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
        " " + new Date(result.waktuAnalisis).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
      : "—";
    const win = window.open("", "_blank");
    // BUG FIX: window.open() returns null jika popup diblokir browser
    // win.document.write() pada null → TypeError crash
    if (!win) {
      alert("Popup diblokir browser. Izinkan popup untuk halaman ini, lalu coba lagi.");
      return;
    }
    win.document.write(`<!DOCTYPE html><html lang="id"><head>
      <meta charset="UTF-8"><title>Laporan Analisis Sawit - SAWPI</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#1a1a1a;font-size:14px;line-height:1.6}
        h1{color:#16a34a;font-size:22px;margin-bottom:4px}
        h2{color:#15803d;font-size:16px;margin-top:24px;margin-bottom:8px;border-bottom:1px solid #d1fae5;padding-bottom:4px}
        .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:bold;font-size:13px}
        .row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
        .label{color:#6b7280;font-size:12px}
        ul{margin:0;padding-left:20px}
        li{margin-bottom:4px}
        .box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-top:8px}
        .footer{margin-top:40px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}
        @media print{body{margin:20px}}
      </style></head><body>
      <h1>Laporan Analisis Sawit</h1>
      <p class="label">Digenerate oleh SAWPI · ${tgl}</p>
      <h2>Hasil Diagnosis</h2>
      <div class="row">
        <span class="badge" style="background:#dcfce7;color:#15803d">${result.penyakit}</span>
        <span class="badge" style="background:#fef9c3;color:#854d0e">Keparahan: ${result.tingkat_keparahan}</span>
        <span class="badge" style="background:#dbeafe;color:#1e40af">Akurasi: ${result.confidence}</span>
      </div>
      <h2>Data Kebun</h2>
      <table style="width:100%;border-collapse:collapse">
        ${[
          ["Umur Tanaman",      umur    || "—"],
          ["Luas Lahan",        luas ? luas + " Ha" : "—"],
          ["Lokasi Kebun",      lokasi  || "—"],
          ["Jenis Lahan",       jenisLahan || "—"],
          ["Bagian Difoto",     bagianTanaman || "—"],
          ["Riwayat Penyakit",  riwayatPenyakit || "—"],
        ].map(([k, v]) => `<tr><td style="padding:4px 8px;color:#6b7280;width:40%">${k}</td><td style="padding:4px 8px;font-weight:500">${v}</td></tr>`).join("")}
      </table>
      ${keluhanPetani ? `<p><strong>Keluhan Petani:</strong> ${keluhanPetani}</p>` : ""}
      <h2>Gejala Teridentifikasi</h2>
      <ul>${(result.gejala || []).map(g => `<li>${g}</li>`).join("")}</ul>
      <h2>Solusi Awal</h2>
      <ul>${(result.solusi_awal || []).map(s => `<li>${s}</li>`).join("")}</ul>
      ${result.rekomendasi_lengkap ? `<h2>Rekomendasi Lengkap</h2><div class="box">${result.rekomendasi_lengkap}</div>` : ""}
      ${result.catatan ? `<h2>Catatan</h2><p style="color:#6b7280;font-style:italic">${result.catatan}</p>` : ""}
      <div class="footer">
        Laporan ini adalah hasil analisis AI berbasis foto. Konfirmasi lapangan oleh petugas pertanian tetap diperlukan untuk diagnosis definitif.<br>
        Digenerate oleh SAWPI — Sistem Analisis Sawit Pintar
      </div>
      <script>window.onload=()=>{window.print()}</script>
      </body></html>`);
    win.document.close();
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleReset() {
    setResult(null);
    setImageFiles([]); setImagePreviews([]);
    setError("");
    setUmur(""); setLuas(""); setLokasi("");
    setJenisLahan(""); setKeluhanPetani(""); setRiwayatPenyakit("");
    setSudahDiberiObat(""); setBagianTanaman("");
    setAgree(false); setSimpan(true); setShowFull(false);
    setAnalysisStep(0);
  }

  const tanggalAnalisis = result?.waktuAnalisis
    ? new Date(result.waktuAnalisis).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
      " — " + new Date(result.waktuAnalisis).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
    : "";

  // ── Shared Input Classes ──────────────────────────────────────────────────
  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-white transition-shadow duration-150";
  const cardClass  = "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-6";

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#f8faf8] text-gray-800">
      <Navbar />

      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-6 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <PalmLeafLeft />
        <div className="max-w-screen-xl mx-auto relative z-10">
          <p className="text-green-200 text-sm mb-1">Beranda / Cek Tanaman</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Cek Kondisi Tanaman Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">Upload foto daun/batang sawit untuk mendapatkan hasil analisis AI secara cepat.</p>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">

        {/* ══════════════════════════════════════════════════════════════════
            TAMPILAN HASIL ANALISIS
        ══════════════════════════════════════════════════════════════════ */}
        {result ? (
          <div className="space-y-5">
            {/* ── Baris atas: Ringkasan + Gejala & Solusi ── */}
            <div className="grid lg:grid-cols-3 gap-5">

              {/* Kolom 1–2: Ringkasan diagnosis */}
              <div className={`lg:col-span-2 ${cardClass}`}>
                <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-gray-100">
                  <div className="flex gap-2.5 flex-shrink-0">
                    {(result.allPreviews || [result.imagePreview]).filter(Boolean).map((src, i) => (
                      <img key={i} src={src} alt={`Foto ${i + 1}`}
                        className={i === 0
                          ? "w-36 h-28 object-cover rounded-xl border border-gray-100 shadow-sm"
                          : "w-16 h-16 object-cover rounded-lg border border-gray-100 self-start shadow-sm"} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={"inline-block text-xs font-semibold px-3 py-1 rounded-md " + getSeverityColor(result.tingkat_keparahan)}>
                        {result.tingkat_keparahan || "Tidak Diketahui"}
                      </span>
                      {result.confidence && (
                        <span className={
                          "inline-flex items-center text-xs font-semibold px-3 py-1 rounded-md " +
                          (result.confidence === "Tinggi" ? "bg-blue-50 text-blue-700" :
                           result.confidence === "Sedang" ? "bg-amber-50 text-amber-700" :
                           "bg-gray-100 text-gray-500")
                        }>
                          Kepercayaan {result.confidence}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-xl text-gray-900 mb-1">{result.penyakit}</h2>
                    <p className="text-xs text-gray-400">{tanggalAnalisis}</p>
                    {result.catatan && (
                      <p className="text-xs text-gray-500 mt-3 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {result.catatan}
                      </p>
                    )}
                    {simpan && (
                      <div className="mt-3 inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                        Tersimpan ke riwayat monitoring
                      </div>
                    )}
                  </div>
                </div>

                {/* Gejala & Solusi */}
                <div className="grid sm:grid-cols-2 gap-6 mt-5">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">Gejala Teridentifikasi</p>
                    <ul className="space-y-2.5">
                      {(result.gejala || []).map((g, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">Solusi Awal</p>
                    <ul className="space-y-2.5">
                      {(result.solusi_awal || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="text-xs font-bold text-green-600 bg-green-50 rounded-md w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kolom 3: Tombol Aksi */}
              <div className={`${cardClass} flex flex-col gap-3`}>
                <p className="font-bold text-gray-900 text-sm mb-1 pb-2 border-b border-gray-100">Tindakan</p>

                <button onClick={() => setShowFull(!showFull)}
                  className="w-full border border-green-600 text-green-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors duration-150">
                  {showFull ? "Sembunyikan Rekomendasi" : "Rekomendasi Lengkap"}
                </button>
                <button onClick={handleReset}
                  className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150">
                  Cek Tanaman Lain
                </button>
                <a href="/monitoring"
                  className="w-full text-center bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors duration-150">
                  Lihat di Monitoring
                </a>
                <div className="border-t border-gray-100 pt-3 mt-1 space-y-3">
                  <button onClick={handleShareWhatsApp}
                    className="w-full bg-[#25D366] text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-[#1ebe5d] transition-colors duration-150">
                    Bagikan via WhatsApp
                  </button>
                  <button onClick={handlePrint}
                    className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150">
                    Cetak / Simpan PDF
                  </button>
                </div>

                {/* Mini riwayat di sidebar hasil */}
                {riwayatTerakhir.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500">Analisis Terakhir</p>
                      <a href="/monitoring" className="text-xs text-green-600 font-semibold hover:underline">Semua</a>
                    </div>
                    <div className="space-y-2">
                      {riwayatTerakhir.slice(0, 2).map((item, i) => (
                        <MiniHistoryCard key={i} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rekomendasi Lengkap */}
            {showFull && result.rekomendasi_lengkap && (
              <div className="bg-white rounded-2xl border border-green-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-6">
                <p className="font-semibold text-green-800 mb-3 text-xs uppercase tracking-wide">Rekomendasi Lengkap</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.rekomendasi_lengkap}</p>
              </div>
            )}
          </div>

        ) : (
          /* ══════════════════════════════════════════════════════════════════
              TAMPILAN FORM INPUT — 3 KOLOM PENUH
          ══════════════════════════════════════════════════════════════════ */
          <div className="space-y-5">

            {/* ── Baris Utama: 3 kolom sejajar ── */}
            <div className="grid lg:grid-cols-3 gap-5 items-start">

              {/* ── KOLOM 1: Data Tanaman ────────────────────────────────── */}
              <div className={cardClass}>
                <SectionHeader title="Data Tanaman" />
                <div className="space-y-5">

                  {/* Umur */}
                  <div>
                    <FieldLabel>Umur Tanaman</FieldLabel>
                    <select value={umur} onChange={(e) => setUmur(e.target.value)} className={inputClass}>
                      <option value="">Pilih umur tanaman</option>
                      {UMUR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  {/* Luas Lahan */}
                  <div>
                    <FieldLabel>Luas Lahan <span className="font-normal text-gray-400">(Ha)</span></FieldLabel>
                    <input
                      type="number"
                      placeholder="Contoh: 2.5"
                      value={luas}
                      min="0"
                      max="10000"
                      step="0.1"
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (e.target.value === "" || (v >= 0 && v <= 10000)) setLuas(e.target.value);
                      }}
                      className={inputClass}
                    />
                  </div>

                  {/* Lokasi */}
                  <div>
                    <FieldLabel>Lokasi Kebun</FieldLabel>
                    <input type="text" placeholder="Contoh: Blok A" value={lokasi} onChange={(e) => setLokasi(e.target.value)} className={inputClass} />
                  </div>

                  {/* Jenis Lahan */}
                  <div>
                    <FieldLabel hint="mempengaruhi akurasi">Jenis Lahan</FieldLabel>
                    <RadioGroup
                      name="jenisLahan"
                      options={JENIS_LAHAN_OPTIONS}
                      value={jenisLahan}
                      onChange={setJenisLahan}
                    />
                    {jenisLahan === "gambut" && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                        Lahan gambut memiliki risiko Ganoderma dan defisiensi Kalium yang lebih tinggi.
                      </p>
                    )}
                  </div>

                  {/* Simpan ke riwayat */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" id="simpan" checked={simpan} onChange={(e) => setSimpan(e.target.checked)} className="accent-green-600 w-4 h-4" />
                    <span className="text-sm text-gray-500">Simpan ke riwayat</span>
                  </label>
                </div>
              </div>

              {/* ── KOLOM 2: Upload Foto ─────────────────────────────────── */}
              <div className={cardClass}>
                <SectionHeader title="Upload Foto Tanaman" />

                {/* Bagian yang Difoto */}
                <div className="mb-5">
                  <FieldLabel>Bagian yang Difoto</FieldLabel>
                  <RadioGroup
                    name="bagianTanaman"
                    options={BAGIAN_OPTIONS}
                    value={bagianTanaman}
                    onChange={setBagianTanaman}
                  />
                </div>

                {/* Dropzone multi-foto */}
                <div
                  onClick={() => imagePreviews.length === 0 && fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={
                    "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 " +
                    (dragging
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/40")
                  }>
                  {imagePreviews.length > 0 ? (
                    <div>
                      <div className="flex gap-2.5 justify-center flex-wrap mb-3">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group">
                            <img src={src} alt={`Foto ${idx + 1}`}
                              className={idx === 0
                                ? "w-32 h-24 object-cover rounded-xl border border-gray-100 shadow-sm"
                                : "w-20 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"} />
                            <button
                              onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              ×
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded font-medium">Utama</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{imagePreviews.length} foto dipilih</p>
                      <div className="flex gap-2 justify-center">
                        <button onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
                          className="text-xs text-green-700 font-semibold border border-green-200 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                          Ganti Foto Utama
                        </button>
                        {imagePreviews.length < MAX_PHOTOS && (
                          <button onClick={(e) => { e.stopPropagation(); addFileRef.current.click(); }}
                            className="text-xs text-gray-600 font-semibold border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            Tambah Foto
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {imagePreviews.length < MAX_PHOTOS
                          ? `Bisa tambah ${MAX_PHOTOS - imagePreviews.length} foto lagi`
                          : "Maksimal 3 foto tercapai"}
                      </p>
                    </div>
                  ) : (
                    <div className="py-3">
                      <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 mx-auto mb-4 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-sm border-2 border-green-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Klik atau seret foto ke sini</p>
                      <p className="text-xs text-gray-400 mb-1">JPG, PNG, WEBP — maks. 5MB</p>
                      <p className="text-xs text-green-600 mb-4">Upload 2–3 foto berbeda untuk akurasi lebih tinggi</p>
                      <button onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
                        className="text-sm font-semibold text-green-700 border border-green-300 bg-white px-5 py-2 rounded-lg hover:bg-green-50 transition-colors">
                        Pilih Foto
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { handleFile(e.target.files[0], false); e.target.value = ""; }} />
                  <input ref={addFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { handleFile(e.target.files[0], true); e.target.value = ""; }} />
                </div>

                {/* Panduan Foto */}
                <PhotoGuide />

                {/* Checkbox setuju */}
                <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
                  <input type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-green-600 w-4 h-4" />
                  <span className="text-xs text-gray-500">
                    Saya setuju dengan <span className="text-green-600 cursor-pointer underline underline-offset-2">syarat &amp; ketentuan</span>
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-xs leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Progress / Tombol Analisis */}
                {loading ? (
                  <AnalysisProgress step={analysisStep} />
                ) : (
                  <button onClick={handleAnalyze} disabled={imageFiles.length === 0 || !agree}
                    className={
                      "w-full mt-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 " +
                      (imageFiles.length > 0 && agree
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    }>
                    Analisis Sekarang
                  </button>
                )}
              </div>

              {/* ── KOLOM 3: Informasi Tambahan (stacked) ───────────────── */}
              <div className="space-y-4">

                {/* Card: Keluhan Petani */}
                <div className={cardClass}>
                  <SectionHeader title="Keluhan Petani" />
                  <FieldLabel hint="paling berpengaruh">Deskripsikan Gejala</FieldLabel>
                  <textarea
                    rows={5}
                    value={keluhanPetani}
                    onChange={(e) => setKeluhanPetani(e.target.value)}
                    placeholder="Contoh: daun menguning sejak 2 minggu, ada bau busuk di pangkal batang, pertumbuhan melambat..."
                    className={inputClass + " resize-none"}
                  />
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Ceritakan gejala yang Anda lihat atau rasakan di lapangan.</p>
                </div>

                {/* Card: Riwayat Penyakit */}
                <div className={cardClass}>
                  <SectionHeader title="Riwayat Penyakit" />
                  <div className="flex flex-col gap-2">
                    {RIWAYAT_OPTIONS.map((opt) => (
                      <label key={opt.value}
                        className={
                          "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer text-sm transition-all duration-150 " +
                          (riwayatPenyakit === opt.value
                            ? "border-green-500 bg-green-600 text-white font-semibold shadow-sm"
                            : "border-gray-200 text-gray-600 hover:border-green-200 hover:bg-gray-50")
                        }>
                        <input type="radio" name="riwayat" value={opt.value} checked={riwayatPenyakit === opt.value}
                          onChange={() => setRiwayatPenyakit(opt.value)} className="sr-only" />
                        <span className={
                          "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors " +
                          (riwayatPenyakit === opt.value ? "border-white bg-white" : "border-gray-300")
                        } />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Card: Treatment Sebelumnya */}
                <div className={cardClass}>
                  <SectionHeader title="Treatment Sebelumnya" />
                  <FieldLabel>Sudah Diberi Pupuk / Obat Apa?</FieldLabel>
                  <textarea
                    rows={4}
                    value={sudahDiberiObat}
                    onChange={(e) => setSudahDiberiObat(e.target.value)}
                    placeholder="Contoh: sudah disemprot fungisida Dithane 3 minggu lalu, sudah diberi pupuk KCl bulan lalu..."
                    className={inputClass + " resize-none"}
                  />
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">AI tidak akan menyarankan ulang treatment yang sudah dilakukan.</p>
                </div>
              </div>
            </div>

            {/* ── Tips Banner ───────────────────────────────────────────────── */}
            <div className="bg-white border border-green-100 rounded-xl px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-green-700">Tips:</span>{" "}
                Upload 2–3 foto dari sudut berbeda (daun, batang, keseluruhan) untuk diagnosis paling akurat.
                Isi kolom <span className="font-semibold text-gray-800">Keluhan Petani</span> untuk memberikan konteks yang tidak terlihat dari foto.
              </p>
            </div>

            {/* ── Analisis Terakhir ─────────────────────────────────────────── */}
            {riwayatTerakhir.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 text-sm">Analisis Terakhir</h3>
                  <a href="/monitoring" className="text-xs text-green-600 font-semibold hover:underline underline-offset-2">Lihat Semua</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {riwayatTerakhir.map((item, i) => (
                    <MiniHistoryCard key={i} item={item} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}