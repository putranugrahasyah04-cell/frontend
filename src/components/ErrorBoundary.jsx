import { Component } from "react";

// ── ErrorBoundary ──────────────────────────────────────────────────────────
// BUG FIX: Mencegah seluruh app crash menjadi layar putih kosong.
// Jika komponen manapun melempar error tak tertangani, ErrorBoundary
// menangkapnya dan menampilkan halaman fallback yang ramah pengguna
// — bukan layar putih tanpa pesan apapun.
// ──────────────────────────────────────────────────────────────────────────
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[SAWPI ErrorBoundary] Error tertangkap:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
          <div className="text-6xl mb-4">🌴</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-500 text-base mb-1">
            Maaf, ada sesuatu yang tidak berjalan dengan baik.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Coba muat ulang halaman. Jika masalah berlanjut, periksa koneksi internet Anda.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}