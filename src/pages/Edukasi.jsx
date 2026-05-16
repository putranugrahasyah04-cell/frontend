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

// Sidebar 5 Kategori
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
  // ... sisa kode sama

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

// Data Artikel
const artikelEdukasi = [
  // EDUKASI
  {
    title: "Sejarah & Perkembangan Kelapa Sawit di Indonesia",
    desc: "Dari perkebunan kolonial Belanda 1848 hingga Indonesia menjadi produsen CPO terbesar dunia — perjalanan panjang industri sawit nasional yang kini menghasilkan devisa Rp 510 triliun/tahun.",
    url: "https://gapki.id/id/wikisawit/knowledge-base/sejarah-kelapa-sawit-indonesia/",
    img: "/images/sejarah.png",
    tag: "Edukasi",
  },
  {
    title: "Mengenal Varietas Unggul Kelapa Sawit Indonesia",
    desc: "Perbedaan varietas Tenera, Dura, dan Pisifera — karakteristik, keunggulan, dan rekomendasi PPKS Medan untuk produktivitas tinggi dengan OER hingga 28%.",
    url: "https://mitalom.com/mengenal-jenis-dan-varietas-unggul-kelapa-sawit-di-indonesia/",
    img: "/images/varietas.png",
    tag: "Edukasi",
  },
  {
    title: "Siklus Hidup Tanaman Kelapa Sawit",
    desc: "Dari kecambah hingga replanting: fase pembibitan (pre & main nursery), TBM 1–3, TM, dan manajemen replanting setelah umur ekonomis 25 tahun.",
    url: " https://pkt-group.com/sawitnotif/mengenal-tbm1-tbm2-tbm3-pada-kelapa-sawit/",
    img: "/images/siklus.png",
    tag: "Edukasi",
  },
  {
    title: "Standar Kebun Sawit Berkelanjutan (ISPO & RSPO)",
    desc: "Syarat dan manfaat sertifikasi ISPO (Permentan No.38/2020) dan RSPO — perbedaan prinsip, biaya, dan dampaknya bagi petani swadaya maupun korporasi.",
    url: "https://mutucertification.com/perbedaan-ispo-dan-rspo/",
    img: "/images/standar.png",
    tag: "Edukasi",
  },
  {
    title: "Potensi Ekonomi Sawit bagi Petani Swadaya",
    desc: "Data BPS: 41% lahan sawit Indonesia (±6,8 juta ha) dikelola petani swadaya. Strategi peningkatan pendapatan, akses pasar CPO, dan program BPDPKS untuk petani.",
    url: "https://www.ekon.go.id/publikasi/detail/3349/industri-kelapa-sawit-nasional-perkuat-kemitraan-petani-sawit-untuk-masa-depan-sawit-indonesia-yang-berkelanjutans",
    img: "/images/perekonomian.png",
    tag: "Edukasi",
  },
  {
    title: "Kontribusi Sawit terhadap Perekonomian Nasional",
    desc: "Ekspor CPO dan produk turunan Indonesia mencapai USD 28,9 miliar (2023). Sawit menyerap 16,2 juta tenaga kerja langsung dan tidak langsung, menjadi tulang punggung devisa non-migas.",
    url: "https://www.ekon.go.id/publikasi/detail/5699/gelar-rapat-koordinasi-nasional-pemerintah-lanjutkan-rencana-aksi-perkebunan-kelapa-sawit-berkelanjutan",
    img: "/images/kontribusi.png",
    tag: "Edukasi",
  },

  // DASAR BUDIDAYA
  {
    title: "Sejarah Kelapa Sawit: Dari Afrika ke Indonesia",
    desc: "Elaeis guineensis berasal dari Guinea Barat Afrika. Masuk ke Indonesia tahun 1848 melalui Kebun Raya Bogor oleh pemerintah kolonial Belanda — 4 pohon pertama menjadi cikal bakal industri raksasa sawit nusantara.",
    url:  "https://www.infosawit.com/2023/06/04/asal-muasal-sawit-di-jawa-dari-afrika-ke-belanda-terbang-ke-nusantara/",
    img:  "/images/afrika.png",
    tag: "Dasar Budidaya",
  },
  {
    title: "Syarat Tumbuh Optimal: Iklim, Tanah & Curah Hujan",
    desc: "Sawit tumbuh optimal pada suhu 24–28°C, curah hujan 2.000–2.500 mm/tahun merata, ketinggian <500 mdpl, dan tanah mineral pH 4,0–6,0 dengan kedalaman efektif >80 cm. Defisit air >3 bulan menurunkan produksi TBS.",
    url: "https://rizkiagro.com/blog/syarat-tumbuh-kelapa-sawit/",
    img: "/images/syarat.png",
    tag: "Dasar Budidaya",
  },
  {
    title: "Cara Membuat Lubang Tanam & Menanam Bibit Unggul",
    desc: "Standar lubang tanam 60×60×60 cm dengan jarak triangular 9×9 m (143 pokok/ha). Bibit bersertifikat PPKS wajib digunakan — bibit palsu menurunkan produktivitas hingga 50% dan merugikan petani miliaran rupiah.",
    url: "https://disbun.kukarkab.go.id/artikel/pedoman-teknis-budidaya-kelapa-sawit",
    img: "/images/lubang.png",
    tag: "Dasar Budidaya",
  },
  {
    title: "Pemilihan Varietas Tahan Hama & Produktivitas Tinggi",
    desc: "Varietas Tenera DxP Simalungun, Langkat, Avros, dan Yangambi — potensi produksi 25–30 ton TBS/ha/tahun. Varietas toleran Ganoderma kini dikembangkan PPKS Medan melalui program pemuliaan berbasis marka molekuler.",
    url: "https://mitalom.com/mengenal-jenis-dan-varietas-unggul-kelapa-sawit-di-indonesia/",
    img: "/images/varietas.png",
    tag: "Dasar Budidaya",
  },
  {
    title: "Tanaman Penutup Tanah (LCC) untuk Cegah Erosi",
    desc: "Legume Cover Crop (LCC) seperti Mucuna bracteata mampu mengurangi erosi hingga 80%, menekan gulma, menambat N-organik, dan menjaga kelembaban tanah. Ditanam bersamaan dengan sawit TBM usia 0–3 bulan.",
    url: "https://sostech.greenvest.co.id/index.php/sostech/article/view/32625",
    img: "/images/erosi.png",
    tag: "Dasar Budidaya",
  },
  {
    title: "Manajemen Pembibitan: Pre-Nursery hingga Main Nursery",
    desc: "Pre-nursery (0–3 bulan) menggunakan polybag kecil 15×23 cm. Main nursery (3–12 bulan) di polybag besar 40×50 cm dengan naungan 50%. Bibit siap tanam pada umur 10–12 bulan, tinggi 60–90 cm, dengan 9–12 helai daun.",
    url: "https://pkt-group.com/sawitnotif/mengenal-tbm1-tbm2-tbm3-pada-kelapa-sawit/",
    img: "/images/pembibitan.png",
    tag: "Dasar Budidaya",
  },

  // ISU LINGKUNGAN & MITOS
  {
    title: "Fakta: Sawit Bukan Penyebab Utama Deforestasi",
    desc: "Studi CIFOR (2019): deforestasi di Indonesia mayoritas akibat konversi pertanian subsisten dan kebakaran lahan gambut. Sertifikasi RSPO & ISPO melarang pembukaan lahan gambut dan kawasan HCV sejak 2018.",
    url: "https://gapki.id/news/2025/04/25/sawit-dan-deforestasi-mengungkap-mitos-lewat-sejarah-dan-bukti-ilmiah/",
    img:  "/images/destorasi.png",
    tag: "Isu Lingkungan & Mitos",
  },
  {
    title: "Mitos 'Sawit Boros Air' vs Fakta Ilmiah",
    desc: "Sawit mengkonsumsi 1.000–1.200 liter air per kg minyak — jauh lebih hemat dibanding kedelai (2.100 l/kg) dan rapeseed (3.800 l/kg). Produktivitas minyak per hektar sawit 4–10× lebih tinggi dari tanaman minyak nabati lain.",
    url: "https://www.sawitsetara.co/artikel/Edukasi/fakta-ilmiah-patahkan-mitos-kelapa-sawit-boros-air",
    img:  "/images/mitos.png",
    tag: "Isu Lingkungan & Mitos",
  },
  {
    title: "RSPO & Konservasi Satwa Liar di Areal Sawit",
    desc: "Prinsip RSPO P&C 2018 mensyaratkan High Conservation Value (HCV) assessment — termasuk perlindungan koridor satwa. Beberapa kebun bersertifikat RSPO di Kalimantan Tengah menjadi habitat orangutan dan beruang madu yang terlindungi.",
    url: "https://rspo.org/id/mengapa-minyak-sawit-berkelanjutan/dampak-lingkungan/",
    img: "/images/satwa.png",
    tag: "Isu Lingkungan & Mitos",
  },
  {
    title: "Pengelolaan POME: Limbah Cair PKS Jadi Biogas & Pupuk",
    desc: "Palm Oil Mill Effluent (POME) mengandung BOD 20.000–30.000 mg/l. Teknologi biogas POME menghasilkan listrik 1,5–2 MW per PKS, mengurangi emisi metana, dan lumpur sisa (sludge) diolah menjadi pupuk organik.",
    url: "https://www.infosawit.com/2025/07/14/dari-limbah-jadi-berkah-inovasi-peneliti-indonesia-ubah-pome-jadi-energi-bersih-air-murni-dan-pupuk-organik/amp/",
    img: "/images/biogas.png",
    tag: "Isu Lingkungan & Mitos",
  },
  {
    title: "Manfaat Ekonomi Sawit bagi Masyarakat Pedesaan",
    desc: "Riset World Bank (2020): rumah tangga petani sawit di Kalimantan dan Sumatera memiliki pendapatan 67% lebih tinggi dari rata-rata petani tanaman pangan. Sawit mendorong elektrifikasi, pembangunan jalan, dan akses pendidikan desa.",
    url: "https://palmoilina.asia/berita-sawit/sawit-pengentasan-kemiskinan-desa/",
    img: "/images/desa.png",
    tag: "Isu Lingkungan & Mitos",
  },
  {
    title: "Biodiesel Sawit: Energi Rendah Emisi untuk Indonesia",
    desc: "Program B40 Indonesia (2025) mewajibkan campuran 40% FAME dari CPO pada solar. Biodiesel sawit menurunkan emisi CO₂ hingga 51% dibanding solar fosil (LCA BRIN, 2023). Target program B50 dijadwalkan mulai 2026.",
    url: "https://gapki.id/news/2024/10/16/biodiesel-sawit-solusi-energi-atau-penghambat-penurunan-emisi-indonesia/",
    img: "/images/rendah.png",
    tag: "Isu Lingkungan & Mitos",
  },

  // PRODUK TURUNAN
  {
    title: "CPO & Minyak Goreng: Dari Tandan ke Dapur",
    desc: "Crude Palm Oil (CPO) diolah menjadi RBDPO lalu menjadi minyak goreng. Indonesia memproduksi ±19 juta ton minyak goreng sawit per tahun — terbesar di dunia — dengan harga yang terjangkau untuk seluruh lapisan masyarakat.",
    url: "https://www.tempo.co/sains/5-produk-di-dapur-yang-dibuat-dari-kelapa-sawit-218622",
    img: "/images/tandan.png",
    tag: "Produk Turunan",
  },
  {
    title: "Sawit di Industri Kosmetik & Perawatan Pribadi",
    desc: "Palm Kernel Oil (PKO) menghasilkan lauric acid — bahan utama sabun, sampo, pelembab, dan lipstik. Sekitar 70% produk perawatan pribadi global mengandung turunan sawit karena tekstur lembut, stabilitas tinggi, dan biaya produksi rendah.",
    url: "https://sinpo.id/detail/81181/kosmetik-berbahan-dasar-sawit-hilirisasi-sawit-menjangkau-kecantikan",
    img: "/images/kosmetik.png",
    tag: "Produk Turunan",
  },
  {
    title: "Sawit dalam Industri Makanan: Cokelat hingga Mi Instan",
    desc: "Palm stearin digunakan sebagai shortening, margarin, dan coating cokelat karena titik leleh 44–56°C. Mi instan, biskuit, dan produk kue hampir semuanya menggunakan fraksionasi minyak sawit sebagai bahan baku utama.",
    url: "https://www.tempo.co/sains/5-produk-di-dapur-yang-dibuat-dari-kelapa-sawit-218622",
    img: "/images/coklatt.png",
    tag: "Produk Turunan",
  },
  {
    title: "Oleokimia: Bahan Kimia Berbasis Sawit untuk Industri",
    desc: "Fatty acid, fatty alcohol, dan gliserin dari sawit menjadi bahan baku deterjen, cat, pelumas, lilin, dan farmasi. Ekspor oleokimia Indonesia mencapai USD 4,1 miliar (2023) — tumbuh rata-rata 12% per tahun dalam 5 tahun terakhir.",
    url: "https://www.infosawit.com/2023/03/15/mengenal-oleokimia-berbasis-sawit/",
    img: "/images/oleokimia.png",
    tag: "Produk Turunan",
  },
  {
    title: "Vitamin E (Tokotrienol) dari Sawit untuk Kesehatan",
    desc: "Palm Tocotrienol Complex (PCT) mengandung α, β, γ, δ-tokotrienol — bentuk Vitamin E paling aktif secara biologis. Riset klinis menunjukkan manfaat neuroprotektif, anti-kanker, dan kardioprotektif. Diekstrak dari distilat CPO.",
    url: "https://www.news.infosawit.com/news/8454/vitamin-e-tokotrienol-di-minyak-sawit--musuh-penyakit-kanker",
    img: "/images/vitamin.png",
    tag: "Produk Turunan",
  },
  {
    title: "Biomassa Sawit: TKKS & Cangkang untuk Energi Terbarukan",
    desc: "Tandan Kosong Kelapa Sawit (TKKS) menghasilkan 22–23% biomassa per TBS. Diolah menjadi pupuk kompos, papan partikel, dan co-firing PLTU. Cangkang sawit diekspor sebagai biomass pellet ke Jepang & Korea Selatan senilai USD 420 juta/tahun.",
    url: "https://haisawit.co.id/news/detail/pln-ip-optimalkan-tandan-kosong-sawit-sebagai-biomassa-untuk-pltu-sintang",
    img: "/images/biomasa.png",
    tag: "Produk Turunan",
  },
];

const tagColor = {
  "Edukasi":                "bg-emerald-100 text-emerald-700",
  "Dasar Budidaya":         "bg-lime-100 text-lime-700",
  "Isu Lingkungan & Mitos": "bg-blue-100 text-blue-600",
  "Produk Turunan":         "bg-orange-100 text-orange-600",
};

const semuaTag = ["Semua", "Edukasi", "Dasar Budidaya", "Isu Lingkungan & Mitos", "Produk Turunan"];

export default function Edukasi() {
  const [search, setSearch] = useState("");
  const [tagAktif, setTagAktif] = useState("Semua");
  const [showAll, setShowAll] = useState(false);

  const filtered = artikelEdukasi.filter((a) => {
    const cocokTag = tagAktif === "Semua" || a.tag === tagAktif;
    const cocokSearch =
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase());
    return cocokTag && cocokSearch;
  });
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* HEADER */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Edukasi Kelapa Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">Panduan lengkap budidaya sawit dari para ahli</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarKategori aktif="edukasi" />

          <div className="flex-1 min-w-0">
            {/* Filter tag topik */}
            <div className="flex flex-wrap gap-2 mb-4">
              {semuaTag.map((tag) => (
                <button key={tag} onClick={() => { setTagAktif(tag); setShowAll(false); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    tagAktif === tag
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input type="text" placeholder="Cari artikel atau topik..."
                value={search} onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
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
                      <span className={"absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full " + (tagColor[a.tag] || "bg-gray-100 text-gray-600")}>
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