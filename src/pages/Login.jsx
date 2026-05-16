import sawitImg from "../assets/Ribusawit.png";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, provider } from "../firebase";

// ── Konstanta ──────────────────────────────────────────────────────────────
const REMEMBER_KEY = "sawpi_remembered_email";

const PESAN_ERROR = {
  "auth/invalid-credential":     "Email atau password salah. Silakan coba lagi.",
  "auth/user-not-found":         "Akun tidak ditemukan. Silakan daftar dulu.",
  "auth/wrong-password":         "Password yang kamu masukkan salah.",
  "auth/invalid-email":          "Format email tidak valid.",
  "auth/too-many-requests":      "Terlalu banyak percobaan. Coba lagi beberapa saat.",
  "auth/user-disabled":          "Akun ini telah dinonaktifkan.",
  "auth/network-request-failed": "Periksa koneksi internet kamu.",
  "auth/popup-blocked":          "Popup diblokir browser. Izinkan popup untuk halaman ini.",
  "auth/operation-not-allowed":  "Login Google belum diaktifkan. Hubungi admin.",
};

// ── Ikon Mata ────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ── Spinner kecil ────────────────────────────────────────────────────────
function Spinner({ light = true }) {
  return (
    <div className={`w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0 ${
      light
        ? "border-white/40 border-t-white"
        : "border-gray-300 border-t-gray-600"
    }`} />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Login() {
  const navigate   = useNavigate();
  const isMounted  = useRef(true);

  // ── State form ────────────────────────────────────────────────────────
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);

  // ── State UI ──────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(false);  // loading login / Google
  const [resetLoading, setResetLoading] = useState(false);  // loading lupa password
  const [errorMsg,     setErrorMsg]     = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");

  // ── Cleanup flag (cegah setState setelah unmount) ─────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Muat email tersimpan dari localStorage saat pertama buka ─────────
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // ── Auto redirect kalau sudah login ──────────────────────────────────
  // LOGIKA ASLI DIPERTAHANKAN: onAuthStateChanged → navigate("/")
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ── Helper: reset pesan ───────────────────────────────────────────────
  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  // ── Helper: simpan / hapus email dari localStorage ────────────────────
  const handleRememberEmail = (checked, emailValue) => {
    if (checked && emailValue.trim()) {
      localStorage.setItem(REMEMBER_KEY, emailValue.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  // ── Helper: validasi email format (cepat, sebelum kirim ke Firebase) ──
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // ══════════════════════════════════════════════════════════════════════
  // LOGIN EMAIL + PASSWORD
  // LOGIKA ASLI DIPERTAHANKAN: signInWithEmailAndPassword
  // FIX: finally sudah ada di versi asli — dipertahankan
  // TAMBAH: validasi format email sebelum request ke Firebase
  // ══════════════════════════════════════════════════════════════════════
  const handleLogin = async () => {
    clearMessages();

    if (!email || !password) {
      setErrorMsg("Isi email dan password dulu!");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Format email tidak valid. Contoh: nama@email.com");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Simpan email jika "Ingat saya" dicentang
      handleRememberEmail(rememberMe, email);
      // onAuthStateChanged akan otomatis redirect ke "/"
    } catch (error) {
      if (!isMounted.current) return;
      setErrorMsg(PESAN_ERROR[error.code] || "Terjadi kesalahan: " + error.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // LOGIN GOOGLE
  // LOGIKA ASLI DIPERTAHANKAN: signInWithPopup + linkWithCredential
  // FIX: tambah finally → setLoading(false) selalu dipanggil
  // FIX: error Google lebih lengkap (popup-blocked ditangani)
  // ══════════════════════════════════════════════════════════════════════
  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);

      // Kalau user punya password yang diisi, coba gabungkan akun
      // LOGIKA ASLI DIPERTAHANKAN persis
      if (password && result.user) {
        try {
          const credential = EmailAuthProvider.credential(result.user.email, password);
          await linkWithCredential(result.user, credential);
          if (isMounted.current) {
            setSuccessMsg("Akun berhasil digabungkan! Sekarang kamu bisa login pakai email+password juga.");
          }
        } catch (_) {
          // Abaikan kalau gagal link — login Google sudah berhasil
        }
      }

      // Simpan email jika "Ingat saya" dicentang
      if (result.user?.email) {
        handleRememberEmail(rememberMe, result.user.email);
      }
      // onAuthStateChanged akan otomatis redirect ke "/"

    } catch (error) {
      if (!isMounted.current) return;
      // Popup ditutup user atau dibatalkan → tidak tampilkan error (normal)
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        setErrorMsg(PESAN_ERROR[error.code] || "Login Google gagal. Coba lagi.");
      }
    } finally {
      // FIX UTAMA: setLoading(false) selalu dipanggil (sebelumnya hanya di catch)
      if (isMounted.current) setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // LUPA PASSWORD
  // LOGIKA ASLI DIPERTAHANKAN: sendPasswordResetEmail
  // FIX: tambah resetLoading agar tombol tidak bisa di-spam-klik
  // FIX: tambah validasi email format sebelum kirim
  // ══════════════════════════════════════════════════════════════════════
  const handleLupaPassword = async () => {
    clearMessages();

    if (!email) {
      setErrorMsg("Masukkan email kamu dulu, lalu klik 'Lupa Password'.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Format email tidak valid. Contoh: nama@email.com");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      if (!isMounted.current) return;
      setSuccessMsg(`Link reset password sudah dikirim ke ${email.trim()}. Cek inbox atau folder spam kamu.`);
    } catch (error) {
      if (!isMounted.current) return;
      if (error.code === "auth/user-not-found") {
        setErrorMsg("Email ini belum terdaftar.");
      } else if (error.code === "auth/network-request-failed") {
        setErrorMsg("Periksa koneksi internet kamu.");
      } else {
        setErrorMsg("Gagal mengirim email reset. Coba lagi.");
      }
    } finally {
      if (isMounted.current) setResetLoading(false);
    }
  };

  // ── Enter → login ─────────────────────────────────────────────────────
  // LOGIKA ASLI DIPERTAHANKAN
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && !resetLoading) handleLogin();
  };

  // ── Apakah semua tombol action harus disabled ─────────────────────────
  const isAnyLoading = loading || resetLoading;

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">

      {/* ── KIRI: Foto sawit (struktur asli dipertahankan) ───────────────── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img
          src={sawitImg}
          alt="Perkebunan Sawit"
          className="h-full w-full object-cover"
        />
        {/* Overlay gradient supaya foto tidak terlalu polos */}
        <div className="absolute inset-0 bg-gradient-to-tr from-green-900/40 via-transparent to-transparent pointer-events-none" />
        {/* Label di pojok bawah kiri */}
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-200 mb-1">
            Sistem Analisis Sawit Pintar
          </p>
          <p className="text-2xl font-bold leading-snug drop-shadow">
            Pantau kebun sawit anda<br />dengan teknologi AI
          </p>
        </div>
      </div>

      {/* ── KANAN: Form ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-gray-50 px-4 py-8 md:px-6 md:py-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-5 py-8 md:px-8 md:py-10">

          {/* Header */}
          <p className="text-sm text-gray-500 mb-0.5">Selamat Datang di</p>
          <h1 className="text-2xl font-bold text-green-700 mb-1">SAWPI</h1>
          <p className="text-sm text-gray-400 mb-7">Silakan masuk untuk melanjutkan</p>

          {/* ── Pesan Error ─────────────────────────────────────────────── */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {/* Ikon peringatan */}
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Pesan Sukses ─────────────────────────────────────────────── */}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              {/* Ikon centang */}
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Field Email ──────────────────────────────────────────────── */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Jika "Ingat saya" aktif, update localStorage langsung
                if (rememberMe) handleRememberEmail(true, e.target.value);
              }}
              onKeyDown={handleKeyDown}
              disabled={isAnyLoading}
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-400 transition"
            />
          </div>

          {/* ── Field Password ───────────────────────────────────────────── */}
          <div className="mb-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnyLoading}
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                  hover:text-gray-600 transition focus:outline-none"
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* ── Baris: Ingat Saya + Lupa Password ───────────────────────── */}
          <div className="flex items-center justify-between mb-6 mt-3">
            {/* Ingat saya (simpan email ke localStorage) */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  handleRememberEmail(e.target.checked, email);
                }}
                disabled={isAnyLoading}
                className="accent-green-600 w-4 h-4"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">
                Ingat saya
              </span>
            </label>

            {/* Lupa password — punya loading state sendiri */}
            <button
              type="button"
              onClick={handleLupaPassword}
              disabled={isAnyLoading}
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700
                hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {resetLoading && <Spinner light={false} />}
              {resetLoading ? "Mengirim..." : "Lupa password?"}
            </button>
          </div>

          {/* ── Tombol Login ─────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
              disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold
              py-3 rounded-xl transition text-sm shadow-sm hover:shadow-md"
          >
            {loading && <Spinner light />}
            {loading ? "Memproses..." : "Login"}
          </button>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Tombol Google ─────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-200
              py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
              transition text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Spinner light={false} />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Memproses..." : "Masuk dengan Google"}
          </button>

          {/* ── Link ke Register ─────────────────────────────────────────── */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-green-600 font-semibold hover:underline hover:text-green-700 transition"
            >
              Daftar di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}