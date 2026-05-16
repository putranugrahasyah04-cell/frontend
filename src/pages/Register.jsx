import sawitImg from "../assets/jalansawit.png";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase";

export default function Register() {
  const navigate = useNavigate();
  const [nama, setNama]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [konfirm, setKonfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Auto redirect kalau sudah login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const pesanError = {
    "auth/email-already-in-use":  "Email ini sudah terdaftar. Silakan login.",
    "auth/invalid-email":         "Format email tidak valid.",
    "auth/weak-password":         "Password terlalu lemah. Minimal 6 karakter.",
    "auth/network-request-failed":"Periksa koneksi internet kamu.",
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!nama || !email || !password || !konfirm) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }
    if (password !== konfirm) {
      setErrorMsg("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: nama });
      // onAuthStateChanged akan otomatis redirect ke "/"
    } catch (error) {
      setErrorMsg(pesanError[error.code] || "Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen flex">

      {/* KIRI */}
      <div className="hidden md:block w-1/2">
        <img src={sawitImg} alt="Sawit" className="h-full w-full object-cover" />
      </div>

      {/* KANAN */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-gray-100 px-6 py-10">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">

          <h2 className="text-xl text-gray-700">Daftar Akun</h2>
          <h1 className="text-2xl font-bold text-green-700 mb-2">SAWPI (Sawit Pintar)</h1>
          <p className="text-sm text-gray-500 mb-6">Buat akun baru untuk mulai menggunakan aplikasi</p>

          {/* Error / Success */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Nama */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama kamu"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition" tabIndex={-1}>
                <EyeIcon show={showPass} />
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <input
                type={showKonfirm ? "text" : "password"}
                placeholder="Ulangi password"
                value={konfirm}
                onChange={(e) => setKonfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              />
              <button type="button" onClick={() => setShowKonfirm(!showKonfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition" tabIndex={-1}>
                <EyeIcon show={showKonfirm} />
              </button>
            </div>
          </div>

          {/* Tombol Daftar */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition text-sm"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>

          {/* Link ke Login */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}