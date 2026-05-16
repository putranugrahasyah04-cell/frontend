import Navbar from "../components/Navbar";
import { useState } from "react";
import { Link } from "react-router-dom";

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
  // BUG FIX: Ganti href/to dari string ke route, dan <a> ke <Link>
  // agar navigasi sidebar tidak menyebabkan full page reload
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

const tabs = [
  { id: "panen", label: "Panen" },
  { id: "pengangkutan", label: "Pengangkutan" },
  { id: "pengolahan", label: "Pengolahan" },
  { id: "penyimpanan", label: "Penyimpanan" },
];

const data = {
  panen: { judul: "Teknik Panen Kelapa Sawit", desc: "Panen dilakukan saat buah matang optimal untuk mendapatkan rendemen minyak tertinggi.", img: "https://www.bpdp.or.id/uploads/images/image_750x_64b75e5c64b7b.jpg", poin: ["Panen dilakukan saat buah matang optimal (TBS berwarna merah kehitaman)","Gunakan egrek yang sesuai agar tidak merusak tanaman","Potong tangkai 2-3 cm dari pangkal, hindari buah jatuh ke tanah","Kumpulkan TBS di tempat teduh, jangan terkena hujan langsung","Rotasi panen ideal 7-10 hari sekali tergantung musim","Brondolan yang jatuh harus dikumpulkan karena mengandung minyak tinggi","Angkut TBS ke PKS maksimal 24 jam setelah panen untuk kualitas optimal"], tips: "Waktu panen terbaik adalah pagi hari pukul 06.00-10.00 saat suhu masih rendah.", url: "https://www.google.com/search?q=teknik+panen+kelapa+sawit+yang+benar" },
  pengangkutan: { judul: "Pengangkutan TBS ke PKS", desc: "Pengangkutan yang cepat dan tepat menentukan kualitas CPO yang dihasilkan.", img: "https://tosadah.com/wp-content/uploads/2024/06/Pengangkutan-tbs-kelapa-sawit-Tosadah.png", poin: ["Angkut TBS ke PKS maksimal 24 jam setelah dipanen","Gunakan kendaraan bersih, bebas kontaminasi bahan kimia","Jangan menumpuk TBS terlalu tinggi agar tidak memar dan busuk","Pastikan jalan produksi dalam kondisi baik sebelum musim panen","Timbang dan catat setiap pengiriman untuk monitoring hasil panen","Hindari pengangkutan saat hujan lebat untuk menjaga kualitas buah","Brondolan dikumpulkan terpisah dalam karung dan ikut dikirim ke PKS"], tips: "Keterlambatan pengangkutan lebih dari 48 jam dapat menurunkan rendemen CPO hingga 2-3%.", url: "https://www.google.com/search?q=pengangkutan+TBS+kelapa+sawit+ke+PKS" },
  pengolahan: { judul: "Proses Pengolahan di PKS", desc: "Proses pengolahan TBS menjadi CPO melalui beberapa tahapan penting di Pabrik Kelapa Sawit.", img: "https://blog.indonetwork.co.id/wp-content/uploads/2022/01/panel-rebusan.jpg", poin: ["Penerimaan dan penimbangan TBS di jembatan timbang PKS","Sterilisasi TBS dalam bejana uap (sterilizer) pada suhu 130-135°C selama 90 menit","Perontokan buah dari tandan menggunakan thresher","Pelumatan dan pengepresan untuk memisahkan minyak dari serat","Pemurnian minyak kasar (crude oil) melalui klarifikasi dan sentrifugasi","Pemisahan kernel dari cangkang menggunakan hydrocyclone","CPO disimpan dalam tangki dengan suhu 50-55°C sebelum dikirim"], tips: "Rendemen CPO normal berkisar 20-23% dari berat TBS segar yang diolah.", url: "https://www.google.com/search?q=proses+pengolahan+TBS+kelapa+sawit+di+PKS" },
  penyimpanan: { judul: "Penyimpanan CPO & Hasil Panen", desc: "Penyimpanan yang benar menjaga kualitas CPO dan produk turunan kelapa sawit.", img: "https://seimangkeisez.com/wp-content/uploads/2024/09/LR-73-of-96-Medium-1024x684.jpg", poin: ["Simpan CPO dalam tangki tertutup pada suhu 50-55°C untuk mencegah pembekuan","Kadar air CPO harus dijaga di bawah 0,15% untuk kualitas premium","Kadar asam lemak bebas (ALB) dijaga di bawah 3,5% untuk harga terbaik","Tangki penyimpanan harus dibersihkan secara rutin minimal 6 bulan sekali","Hindari kontaminasi air dan kotoran selama proses penyimpanan","Lakukan pengujian kualitas CPO secara berkala di laboratorium","TBS segar tidak boleh disimpan lebih dari 24 jam sebelum diolah"], tips: "Kualitas CPO sangat dipengaruhi oleh ALB — semakin rendah ALB semakin tinggi harga jual.", url: "https://www.google.com/search?q=penyimpanan+CPO+kelapa+sawit+standar+kualitas" },
};

const jadwalPanen = [
  { bulan: "Januari", produksi: "Sedang", harga: "Fluktuatif", catatan: "Awal tahun, perlu monitoring ketat" },
  { bulan: "Februari", produksi: "Sedang", harga: "Fluktuatif", catatan: "Musim hujan, jaga kualitas angkutan" },
  { bulan: "Maret", produksi: "Tinggi", harga: "Baik", catatan: "Puncak produksi semester 1" },
  { bulan: "April", produksi: "Tinggi", harga: "Baik", catatan: "Produksi masih tinggi" },
  { bulan: "Mei", produksi: "Tinggi", harga: "Baik", catatan: "Optimalkan rotasi panen" },
  { bulan: "Juni", produksi: "Sedang", harga: "Sedang", catatan: "Mulai turun menjelang kemarau" },
  { bulan: "Juli", produksi: "Rendah", harga: "Sedang", catatan: "Musim kemarau, produksi turun" },
  { bulan: "Agustus", produksi: "Rendah", harga: "Sedang", catatan: "Puncak kemarau, jaga pemupukan" },
  { bulan: "September", produksi: "Sedang", harga: "Baik", catatan: "Mulai recovery produksi" },
  { bulan: "Oktober", produksi: "Tinggi", harga: "Baik", catatan: "Puncak produksi semester 2" },
  { bulan: "November", produksi: "Tinggi", harga: "Baik", catatan: "Produksi optimal" },
  { bulan: "Desember", produksi: "Sedang", harga: "Fluktuatif", catatan: "Akhir tahun, evaluasi produksi" },
];

const produksiColor = { Tinggi: "bg-green-100 text-green-700", Sedang: "bg-yellow-100 text-yellow-700", Rendah: "bg-red-100 text-red-600" };
const hargaColor = { Baik: "bg-green-100 text-green-700", Sedang: "bg-yellow-100 text-yellow-700", Fluktuatif: "bg-blue-100 text-blue-700" };

export default function PanenPascaPanen() {
  const [aktif, setAktif] = useState("panen");
  const d = data[aktif];

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Panen & Pasca Panen Sawit</h1>
          <p className="text-green-100 text-sm mt-1 max-w-lg">Informasi penting untuk hasil panen yang optimal dan berkualitas.</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarKategori aktif="panen" />

          <div className="flex-1 min-w-0 space-y-6">
            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setAktif(t.id)}
                  className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 " +
                    (aktif === t.id ? "bg-green-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-600")}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-1">{d.judul}</h2>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{d.desc}</p>
                  <ul className="space-y-3">
                    {d.poin.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <span className="text-amber-500 flex-shrink-0">💡</span>
                    <p className="text-amber-700 text-xs leading-relaxed">{d.tips}</p>
                  </div>
                  <div className="mt-5">
                    <a href={d.url} target="_blank" rel="noreferrer"
                      className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-sm">
                      Lihat Sumber Lengkap →
                    </a>
                  </div>
                </div>
                <div className="h-64 md:h-auto overflow-hidden">
                  <img src={d.img} alt={d.judul} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* KALENDER PRODUKSI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4">Kalender Produksi Sawit per Bulan</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Bulan</th>
                      <th className="text-left px-4 py-3">Produksi</th>
                      <th className="text-left px-4 py-3">Harga CPO</th>
                      <th className="text-left px-4 py-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalPanen.map((j, i) => (
                      <tr key={i} className={"border-t border-gray-50 hover:bg-green-50/30 transition-colors " + (i % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                        <td className="px-4 py-3 font-medium text-gray-800">{j.bulan}</td>
                        <td className="px-4 py-3"><span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + produksiColor[j.produksi]}>{j.produksi}</span></td>
                        <td className="px-4 py-3"><span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + hargaColor[j.harga]}>{j.harga}</span></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{j.catatan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-green-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base mb-1">Cek kondisi tanaman sebelum panen</h3>
                <p className="text-green-100 text-sm">Pastikan tanaman sawit kamu dalam kondisi optimal dengan analisis AI.</p>
              </div>
              <Link to="/cek"
                className="flex-shrink-0 bg-white text-green-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition">
                Cek Tanaman Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}