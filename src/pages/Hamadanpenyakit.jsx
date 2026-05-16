import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

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

// ─── Sidebar 5 Kategori ───────────────────────────────────────
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
    <div className="md:w-52 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
        <p className="font-bold text-gray-900 text-sm mb-3 text-center">Kategori</p>
        <div className="flex flex-col gap-1.5">
          {links.map((k) => (
            <Link key={k.id} to={k.to}
              className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                k.id === aktif ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}>
              {k.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Data Hama & Penyakit ─────────────────────────────────────
const artikelHama = [
  { title: "Busuk Pangkal Batang (Ganoderma boninense)", desc: "Penyakit paling destruktif di perkebunan sawit Indonesia — deteksi dini lewat daun tombak & strategi pengendalian terpadu", url: "https://kumparan.com/dunia-tani/penyakit-busuk-pangkal-batang-ganoderma-pada-kelapa-sawit-26uzwGyCh6P/1", img: "/images/ganoderma.png", tag: "Penyakit" },
  { title: "Ulat Api (Setothosea asigna)", desc: "Hama defoliator paling merusak — pengendalian hayati dengan NPV (Nuclear Polyhedrosis Virus) dan parasitoid Apanteles", url: "https://www.kabarsawitindonesia.com/2025/07/23/ulat-api-kelapa-sawit/", img: "/images/ulatsawit.png", tag: "Hama" },
  { title: "Bercak Daun Cercospora (Cercospora elaeidis)", desc: "Jamur penyebab bercak kuning-coklat pada daun sawit muda — gejala, penyebaran, dan penggunaan fungisida mancozeb", url: "https://www.mertani.co.id/post/penyakit-pada-perkebunan-kelapa-sawit-dan-pengendaliannya", img: "/images/Penyakit-bercak-daun-sawit.jpg", tag: "Penyakit" },
  { title: "Kumbang Tanduk (Oryctes rhinoceros)", desc: "Kumbang perusak titik tumbuh tanaman muda — pengendalian biologis dengan Baculovirus oryctes dan perangkap feromon", url: "https://www.infosawit.com/2025/09/19/kumbang-tanduk-ancam-perkebunan-sawit-ahli-ingatkan-pentingnya-pengendalian-terpadu/", img: "/images/kumbangtanduk.png", tag: "Hama" },
  { title: "Tikus Sawit (Rattus tiomanicus)", desc: "Hama vertebrata penyebab kehilangan produksi 1–5% — pengendalian terpadu dengan burung hantu Tyto alba dan rodentisida", url: "https://www.kabarsawitindonesia.com/2025/07/19/hama-tikus-kelapa-sawit/", img: "/images/tikussawit.png", tag: "Hama" },
  { title: "Penyakit Crown Disease", desc: "Kelainan genetik pada tanaman muda yang menyebabkan daun tombak tidak membuka sempurna — identifikasi dan tindakan", url: "https://gdm.id/penyakit-tajuk-pada-kelapa-sawit/", img: "/images/crown.png", tag: "Penyakit" },
  { title: "Ulat Kantung (Metisa plana)", desc: "Hama defoliator koloni besar — identifikasi kantung sutera khas dan pengendalian kimiawi serta hayati", url: "https://nufarm.com/id/pengendalian-ulat-kantong/", img: "/images/mestisaplana.png", tag: "Hama" },
  { title: "Layu Fusarium (Fusarium oxysporum)", desc: "Penyakit layu pembuluh yang menyerang akar dan batang — gejala menguning dan pencegahan dengan Trichoderma sp.", url: "https://www.corteva.com/id/berita/Penyakit-Pada-Tanaman-Kelapa-Sawit-dan-Cara-Mencegahnya.html", img: "/images/layu.png", tag: "Penyakit" },
  { title: "Ngengat Pemakan Bunga (Tirathaba rufivena)", desc: "Hama yang merusak bunga dan brondolan muda sehingga menurunkan fruit set secara signifikan", url: "https://srs-ssms.com/id/waspada-serangan-hama-penggerek-buah-tirathaba-mundella/", img: "/images/tirathaba.png", tag: "Hama" },
];

const tagColor = {
  Penyakit: "bg-red-100 text-red-600",
  Hama: "bg-orange-100 text-orange-600",
};

export default function Hamadanpenyakit() {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = artikelHama.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
  );
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-6 py-10 relative overflow-hidden">
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Hama & Penyakit Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">Panduan identifikasi, gejala, dan pengendalian dari para ahli</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarKategori aktif="hama" />
          <div className="flex-1 min-w-0">
            <div className="relative mb-5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input type="text" placeholder="Cari hama atau penyakit..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white shadow-sm" />
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-sm">Artikel tidak ditemukan 🔍</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayed.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer"
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div className="h-40 overflow-hidden bg-gray-100 relative">
                      <img src={a.img} alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = "none"; }} />
                      <span className={"absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full " + tagColor[a.tag]}>
                        {a.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-green-600 transition">{a.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{a.desc}</p>
                      <p className="mt-3 text-green-600 text-xs font-semibold group-hover:underline">Baca selengkapnya →</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {filtered.length > 6 && (
              <div className="text-center mt-8">
                <button onClick={() => setShowAll(!showAll)}
                  className="border border-gray-200 bg-white text-gray-600 px-8 py-2.5 rounded-xl text-sm font-semibold hover:border-green-500 hover:text-green-600 shadow-sm transition">
                  {showAll ? "Sembunyikan" : "Lihat Semua Artikel"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}