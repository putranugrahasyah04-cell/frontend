import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

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
      <path d="M46,144 C64,122 86,114 104,117 C85,123 61,134 46,144Z" fill="white" opacity="0.38"/>
      <path d="M62,120 C79,98 100,90 118,93 C98,99 74,111 62,120Z" fill="white" opacity="0.34"/>
      <path d="M76,98 C92,77 112,68 130,71 C110,78 86,90 76,98Z" fill="white" opacity="0.3"/>
    </svg>
  );
}

// ─── Sidebar 5 Kategori ───────────────────────────────────────
function SidebarKategori({ aktif }) {
  const navigate = useNavigate();
  const links = [
    { label: "Edukasi",             route: "/edukasi",             id: "edukasi"   },
    { label: "Hama & Penyakit",     route: "/hamadanpenyakit",     id: "hama"      },
    { label: "Pemupukan",           route: "/pemupukan",           id: "pemupukan" },
    { label: "Perawatan Kebun",     route: "/perawatankebunsawit", id: "perawatan" },
    { label: "Panen & Pasca Panen", route: "/panen",               id: "panen"     },
  ];
  return (
    <div className="w-full md:w-52 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
        <p className="font-bold text-gray-900 text-sm mb-3 text-center">Kategori</p>
        <div className="flex flex-col gap-1.5">
          {links.map((k) => (
            <button key={k.id} onClick={() => navigate(k.route)}
              className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                k.id === aktif ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}>
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const kegiatanUtama = [
  {
    judul: "Penyiangan",
    desc: "Bersihkan gulma di piringan dan gawangan secara rutin setiap 2–3 bulan untuk hasil optimal.",
    warna: "from-green-50 to-emerald-50",
    border: "border-green-200",
    statBg: "bg-green-100",
    statText: "text-green-700",
    stat: "2–3 bln",
    statLabel: "sekali",
  },
  {
    judul: "Piringan",
    desc: "Buat piringan bersih radius 1,5–2 m di sekitar pokok sawit untuk penyerapan hara optimal.",
    warna: "from-lime-50 to-green-50",
    border: "border-lime-200",
    statBg: "bg-lime-100",
    statText: "text-lime-700",
    stat: "1,5–2 m",
    statLabel: "radius",
  },
  {
    judul: "Pemangkasan",
    desc: "Pangkas pelepah tua dan daun kering untuk sirkulasi udara dan mencegah sarang hama.",
    warna: "from-teal-50 to-green-50",
    border: "border-teal-200",
    statBg: "bg-teal-100",
    statText: "text-teal-700",
    stat: "6 bln",
    statLabel: "sekali",
  },
  {
    judul: "Pengendalian Hama",
    desc: "Lakukan pengendalian hama secara rutin menggunakan metode terpadu (PHT) yang efektif.",
    warna: "from-emerald-50 to-cyan-50",
    border: "border-emerald-200",
    statBg: "bg-emerald-100",
    statText: "text-emerald-700",
    stat: "PHT",
    statLabel: "terpadu",
  },
];

const tipsPerawatanKebun = [
  "Periksa kondisi tanaman secara rutin, minimal seminggu sekali untuk deteksi dini masalah.",
  "Pastikan drainase dan parit berfungsi baik, hindari genangan air lebih dari 48 jam.",
  "Berikan pupuk sesuai dosis dan waktu yang dianjurkan berdasarkan hasil analisis tanah.",
  "Catat setiap gejala abnormal pada daun, batang, atau buah untuk tindak lanjut cepat.",
  "Bersihkan tumpukan pelepah di sekitar pokok yang bisa menjadi sarang hama tikus.",
  "Lakukan pemangkasan pelepah secara teratur dan jangan terlalu berlebihan (over-pruning).",
  "Semprot herbisida hanya pada gulma target, jauhkan dari pelepah dan batang sawit.",
  "Pasang perangkap tikus dan rumah burung hantu (Tyto alba) sebagai pengendali alami.",
];

const jadwalPerawatan = [
  { kegiatan: "Penyiangan piringan", frekuensi: "2–3 bulan sekali", waktu: "Sepanjang tahun", prioritas: "Tinggi" },
  { kegiatan: "Pemangkasan pelepah", frekuensi: "6 bulan sekali", waktu: "Sebelum panen", prioritas: "Tinggi" },
  { kegiatan: "Pengendalian gulma gawangan", frekuensi: "3–4 bulan sekali", waktu: "Musim hujan", prioritas: "Sedang" },
  { kegiatan: "Sanitasi kebun", frekuensi: "Setiap bulan", waktu: "Sepanjang tahun", prioritas: "Sedang" },
  { kegiatan: "Perbaikan drainase/parit", frekuensi: "2x setahun", waktu: "Awal & akhir tahun", prioritas: "Tinggi" },
  { kegiatan: "Pemupukan organik", frekuensi: "Setahun sekali", waktu: "Awal musim hujan", prioritas: "Sedang" },
  { kegiatan: "Sensus tanaman", frekuensi: "Setahun sekali", waktu: "Awal tahun", prioritas: "Rendah" },
  { kegiatan: "Pemasangan perangkap tikus", frekuensi: "Berkelanjutan", waktu: "Sepanjang tahun", prioritas: "Sedang" },
];

const panduanLengkap = [
  {
    judul: "Penyiangan & Pengendalian Gulma",
    warnaBadge: "bg-green-100 text-green-700",
    warnaGaris: "bg-green-500",
    poin: [
      "Penyiangan piringan dilakukan radius 1,5–2 m dari pokok sawit",
      "Gulma seperti alang-alang dan pakis harus dibasmi hingga akar",
      "Gunakan herbisida selektif untuk gawangan, hindari semprot ke pokok sawit",
      "Legum penutup tanah (LCC) bisa ditanam di gawangan untuk menekan gulma alami",
      "Frekuensi penyiangan lebih sering di musim hujan karena gulma tumbuh lebih cepat",
    ],
    url: "https://www.google.com/search?q=penyiangan+gulma+kebun+kelapa+sawit",
  },
  {
    judul: "Pemangkasan Pelepah (Pruning)",
    warnaBadge: "bg-teal-100 text-teal-700",
    warnaGaris: "bg-teal-500",
    poin: [
      "Pangkas pelepah kering, patah, dan yang menggantung ke bawah",
      "Sisakan 40–48 pelepah aktif per pokok untuk fotosintesis optimal",
      "Pemangkasan berlebihan (over-pruning) dapat menurunkan hasil TBS hingga 20%",
      "Lakukan pemangkasan sebelum panen untuk memudahkan akses buah",
      "Susun pelepah bekas di gawangan antar pokok untuk mulsa organik",
    ],
    url: "https://www.google.com/search?q=pemangkasan+pelepah+kelapa+sawit+pruning",
  },
  {
    judul: "Manajemen Air & Drainase",
    warnaBadge: "bg-blue-100 text-blue-700",
    warnaGaris: "bg-blue-500",
    poin: [
      "Pastikan parit utama dan parit koleksi berfungsi optimal, bebas sumbatan",
      "Kedalaman parit ideal 60–80 cm untuk mencegah genangan di musim hujan",
      "Genangan air lebih dari 48 jam dapat merusak sistem perakaran",
      "Di lahan gambut, kelola muka air tanah agar tidak terlalu rendah atau tinggi",
      "Bersihkan parit minimal 2x setahun, terutama sebelum musim hujan",
    ],
    url: "https://www.google.com/search?q=manajemen+drainase+kebun+kelapa+sawit",
  },
  {
    judul: "Pengendalian Hama Terpadu (PHT)",
    warnaBadge: "bg-amber-100 text-amber-700",
    warnaGaris: "bg-amber-500",
    poin: [
      "Monitoring rutin hama utama: ulat api, ulat kantung, kumbang tanduk, tikus",
      "Pasang perangkap feromon untuk kumbang tanduk (Oryctes rhinoceros)",
      "Burung hantu (Tyto alba) sebagai musuh alami tikus, pasang rumah burung hantu",
      "Semprot insektisida hanya jika populasi hama melewati ambang ekonomi",
      "Catat setiap serangan hama dalam buku lapangan untuk tindakan preventif",
    ],
    url: "https://www.google.com/search?q=pengendalian+hama+terpadu+kelapa+sawit",
  },
  {
    judul: "Sanitasi & Kebersihan Kebun",
    warnaBadge: "bg-orange-100 text-orange-700",
    warnaGaris: "bg-orange-500",
    poin: [
      "Singkirkan tandan buah kosong (TBK) busuk yang bisa menjadi sumber penyakit",
      "Bakar atau kubur batang sawit mati untuk mencegah penyebaran Ganoderma",
      "Bersihkan area sekitar pokok dari sampah organik yang bisa menjadi sarang hama",
      "Lakukan roguing (pencabutan) tanaman terserang Ganoderma parah",
      "Desinfeksi alat pangkas setelah digunakan di tanaman yang sakit",
    ],
    url: "https://www.google.com/search?q=sanitasi+kebun+kelapa+sawit+ganoderma",
  },
  {
    judul: "Pemeliharaan Jalan Produksi",
    warnaBadge: "bg-lime-100 text-lime-700",
    warnaGaris: "bg-lime-500",
    poin: [
      "Jalan produksi yang baik memudahkan angkutan TBS dan efisiensi panen",
      "Perbaiki jalan yang berlubang sebelum musim panen tiba",
      "Pasang gorong-gorong di titik persilangan jalan dan parit",
      "Beri lapisan laterit/kerikil pada jalan utama agar tidak licin di musim hujan",
      "Perawatan jalan dilakukan minimal 2x setahun",
    ],
    url: "https://www.google.com/search?q=perawatan+jalan+produksi+kebun+sawit",
  },
];

const prioritasMeta = {
  Tinggi: { cls: "bg-red-100 text-red-600 border border-red-200", dot: "bg-red-500" },
  Sedang: { cls: "bg-amber-100 text-amber-600 border border-amber-200", dot: "bg-amber-500" },
  Rendah: { cls: "bg-blue-100 text-blue-600 border border-blue-200", dot: "bg-blue-500" },
};

export default function PerawatanKebun() {
  const navigate = useNavigate();
  const [hoveredPanduan, setHoveredPanduan] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* ── HEADER (tidak diubah) ── */}
      <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-5 py-7 md:px-6 md:py-10 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <PalmLeafLeft />
        <div className="max-w-screen-xl mx-auto relative z-10">
          <p className="text-green-200 text-sm mb-1">Pusat Pengetahuan</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Perawatan Kebun Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">Panduan lengkap untuk menjaga kebun tetap produktif.</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarKategori aktif="perawatan" />

          <div className="flex-1 min-w-0 space-y-8">

            {/* ── 4 KARTU KEGIATAN UTAMA ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kegiatanUtama.map((k, i) => (
                <div key={i} className={`card-kegiatan group bg-gradient-to-br ${k.warna} border ${k.border} rounded-2xl p-5 cursor-default
                  hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/30 blur-xl pointer-events-none" />
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 ">{k.judul}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{k.desc}</p>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${k.statBg} ${k.statText} text-xs font-bold`}>
                    <span>{k.stat}</span>
                    <span className="font-normal opacity-70">{k.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── TIPS PERAWATAN KEBUN + GAMBAR ── */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 rounded-t-2xl" />
                <div className="flex items-center gap-2.5 mb-5 mt-1">
                  <div className="flex items-center justify-center text-base"></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-none">Tips Perawatan Kebun</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Panduan praktis menjaga kebun produktif</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    {tipsPerawatanKebun.length} tips
                  </span>
                </div>
                <div className="space-y-2">
                  {tipsPerawatanKebun.map((tip, i) => (
                    <div key={i} className="tip-item flex items-start gap-3 bg-gray-50 hover:bg-green-50 rounded-xl px-4 py-2.5
                      border border-transparent hover:border-green-200 transition-all duration-200 cursor-default">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold
                        flex items-center justify-center mt-0.5">{i + 1}</span>
                      <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/kebun.png"
                  alt="kebun sawit"
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-110"
                  style={{ minHeight: "220px", display: "block" }}
                />
              </div>
            </div>

            {/* ── JADWAL PERAWATAN RUTIN ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-white to-green-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Jadwal Perawatan Rutin</h3>
                  <p className="text-gray-400 text-xs">Rencana kerja terstruktur sepanjang tahun</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                  {jadwalPerawatan.length} kegiatan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="text-left px-6 py-3.5">Kegiatan</th>
                      <th className="text-left px-4 py-3.5">Frekuensi</th>
                      <th className="text-left px-4 py-3.5">Waktu Terbaik</th>
                      <th className="text-left px-4 py-3.5">Prioritas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalPerawatan.map((j, i) => (
                      <tr key={i}
                        className={`tabel-row border-t border-gray-50 hover:bg-green-50/50 transition-colors duration-150 group
                          ${i % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}
                        style={{ animationDelay: `${i * 0.06}s` }}>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-gray-800 text-sm group-hover:text-green-700 transition-colors">
                            {j.kegiatan}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                            {j.frekuensi}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{j.waktu}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${prioritasMeta[j.prioritas].cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${prioritasMeta[j.prioritas].dot} ${j.prioritas === "Tinggi" ? "pulse-dot" : ""}`} />
                            {j.prioritas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── PANDUAN PERAWATAN LENGKAP ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="font-bold text-gray-900 text-base">Panduan Perawatan Lengkap</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  {panduanLengkap.length} panduan
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {panduanLengkap.map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noreferrer"
                    onMouseEnter={() => setHoveredPanduan(i)}
                    onMouseLeave={() => setHoveredPanduan(null)}
                    className="panduan-card group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                      hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                    {/* garis warna atas */}
                    <div className={`h-1 w-full ${p.warnaGaris} transition-all duration-300 ${hoveredPanduan === i ? "h-1.5" : ""}`} />
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-green-700 transition-colors mb-4">
                        {p.judul}
                      </h4>
                      <div className="space-y-2 flex-1">
                        {p.poin.map((pt, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
                              ${p.warnaBadge}`}>
                              {j + 1}
                            </span>
                            <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors">{pt}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.warnaBadge}`}>
                          {p.poin.length} poin
                        </span>
                        <span className="text-green-600 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Baca selengkapnya
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── CTA BANNER ── */}
            <div className="bg-green-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base mb-1">Ada gejala aneh pada tanaman?</h3>
                <p className="text-green-100 text-sm">Cek kondisi tanaman sawit kamu dengan AI untuk diagnosis cepat dan akurat.</p>
              </div>
              <button onClick={() => navigate("/cek")}
                className="flex-shrink-0 bg-white text-green-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition">
                Cek Tanaman Sekarang
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}