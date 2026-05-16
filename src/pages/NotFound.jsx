import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-4">🌴</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 text-lg mb-6">Halaman tidak ditemukan</p>
      <Link
        to="/"
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}