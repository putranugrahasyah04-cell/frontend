import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { createPortal } from "react-dom";
import logoSawit from "../assets/aisawit.png";
import { auth, db } from "../firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState, useRef } from "react";

export default function Navbar() {
  // BUG FIX Bug5: pakai shared auth state — hapus duplikat listener
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const menuClass = ({ isActive }) =>
    isActive
      ? "text-green-600 font-semibold"
      : "text-gray-600 hover:text-green-600 transition-colors duration-200";

  const mobileMenuClass = ({ isActive }) =>
    isActive
      ? "block px-4 py-3 text-sm font-semibold text-green-600 bg-green-50 rounded-xl"
      : "block px-4 py-3 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-200";

  // BUG FIX Bug5: sync displayName & imgError dari AuthContext user
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setImgError(false);
    } else {
      setDisplayName("");
      setCustomPhoto(null);
    }
  }, [user]);

  // FIX FLASH FOTO: Baca sessionStorage secara SINKRON sebelum browser menampilkan
  // frame pertama. useLayoutEffect jalan setelah DOM diperbarui tapi SEBELUM
  // browser paint — foto langsung tersedia di render pertama tanpa kedip.
  useLayoutEffect(() => {
    if (!user?.uid) {
      setCustomPhoto(null);
      return;
    }
    const cached = sessionStorage.getItem("sawpi_photo_" + user.uid);
    if (cached) setCustomPhoto(cached);
  }, [user?.uid]);

  // Fetch Firestore async (setelah render) hanya saat UID berubah.
  // Path: profil/foto agar tidak bercampur dengan data analisis riwayat tanaman.
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid, "profil", "foto"))
      .then(snap => {
        if (!isMounted.current) return;
        if (snap.exists() && snap.data().customPhoto) {
          const photo = snap.data().customPhoto;
          sessionStorage.setItem("sawpi_photo_" + user.uid, photo);
          setCustomPhoto(photo);
        }
      })
      .catch(e => console.error("Gagal ambil foto:", e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setEditOpen(false);
        setEditSuccess(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
    setDropdownOpen(false);
    setMobileOpen(false);
    setCustomPhoto(null);
    setDisplayName(""); // user direset otomatis oleh AuthContext
    navigate("/login");
  };

  const openEdit = () => {
    setEditName(displayName || user?.displayName || "");
    setEditSuccess(false);
    setDropdownOpen(false);
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (!trimmed || !user) return;
    setEditLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      if (!isMounted.current) return;
      setDisplayName(trimmed);
      setEditSuccess(true);
      setTimeout(() => {
        if (!isMounted.current) return;
        setEditOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      console.error("Gagal update profil:", err);
      alert("Gagal menyimpan nama. Coba lagi.");
    } finally {
      if (isMounted.current) setEditLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }
    e.target.value = "";
    setPhotoLoading(true);
    try {
      const base64 = await compressImage(file);
      if (!isMounted.current) return;
      await setDoc(
        doc(db, "users", user.uid, "profil", "foto"),
        { customPhoto: base64 },
        { merge: true }
      );
      if (!isMounted.current) return;
      setImgError(false);
      // FIX FLASH: Simpan ke sessionStorage sekalian supaya tidak kedip saat pindah halaman
      sessionStorage.setItem("sawpi_photo_" + user.uid, base64);
      setCustomPhoto(base64);
    } catch (err) {
      console.error("Gagal ganti foto:", err);
      alert("Gagal mengganti foto. Coba lagi.");
    } finally {
      if (isMounted.current) setPhotoLoading(false);
    }
  };

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Gambar tidak valid"));
        img.src = ev.target.result;
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });
  }

  const getInitials = (name, email) => {
    if (name && typeof name === "string" && name.trim()) {
      return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return (email?.[0] || "U").toUpperCase();
  };

  const photoSrc =
    customPhoto || (user?.photoURL && !imgError ? user.photoURL : null);

  const renderAvatar = (size = "w-9 h-9", textSize = "text-sm") => {
    if (photoSrc) {
      return (
        <img
          key={photoSrc}
          src={photoSrc}
          alt="avatar"
          className={`${size} rounded-full object-cover ring-2 ring-green-500 ring-offset-1`}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold ${textSize}`}
      >
        {user ? getInitials(displayName, user.email) : ""}
      </div>
    );
  };

  const spinnerIcon = (
    <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
  );

  const cameraIcon = (
    <svg
      className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  return (
    <>
<input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-2.5 select-none cursor-default">
            <img
              src={logoSawit}
              alt="SAWPI logo"
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <span
              style={{
                fontFamily: "'Orbitron','Rajdhani',sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: "0.10em",
                color: "#16a34a",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              SAWPI
            </span>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavLink to="/" className={menuClass}>Beranda</NavLink>
            <NavLink to="/cek" className={menuClass}>Cek Tanaman</NavLink>
            <NavLink to="/edukasi" className={menuClass}>Edukasi</NavLink>
            <NavLink to="/monitoring" className={menuClass}>Monitoring</NavLink>
          </div>

          {/* KANAN */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {authLoading ? (
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
              ) : !user ? (
                <NavLink
                  to="/login"
                  className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Login
                </NavLink>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="focus:outline-none transition-transform duration-150 hover:scale-105 active:scale-95 block"
                  >
                    {renderAvatar("w-9 h-9", "text-sm")}
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-anim bg-white rounded-2xl z-50"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        right: "0",
                        width: "256px",
                        boxShadow:
                          "0 8px 32px -4px rgba(0,0,0,0.13), 0 2px 12px -2px rgba(16,163,74,0.10)",
                        border: "1px solid rgba(0,0,0,0.07)",
                        overflow: "visible",
                      }}
                    >
                      {/* Panah */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-7px",
                          right: "10px",
                          width: "14px",
                          height: "14px",
                          background: "white",
                          transform: "rotate(45deg)",
                          borderLeft: "1px solid rgba(0,0,0,0.07)",
                          borderTop: "1px solid rgba(0,0,0,0.07)",
                        }}
                      />

                      <div className="rounded-2xl overflow-hidden">
                        <div className="pt-6 pb-4 px-5 flex flex-col items-center text-center gap-2 relative">
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-green-50 blur-xl opacity-80 pointer-events-none" />

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="relative z-10 group focus:outline-none"
                            title="Klik untuk ganti foto"
                          >
                            {renderAvatar("w-16 h-16", "text-xl")}
                            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center">
                              {photoLoading ? spinnerIcon : cameraIcon}
                            </div>
                          </button>

                          <div className="relative z-10">
                            <p className="text-sm font-bold text-gray-800 leading-snug">
                              {displayName || "Pengguna"}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                          <span className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-semibold bg-green-50 text-green-600 border border-green-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                            Aktif
                          </span>
                        </div>

                        <div className="mx-4 h-px bg-gray-100" />

                        <div className="p-3 space-y-1.5">
                          <button
                            onClick={openEdit}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 font-semibold text-sm rounded-xl transition-all duration-200 group border border-transparent hover:border-green-100"
                          >
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Profil
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 font-semibold text-sm rounded-xl transition-all duration-200 group"
                          >
                            <svg
                              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Keluar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HAMBURGER */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 my-1 transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <NavLink to="/" className={mobileMenuClass} onClick={() => setMobileOpen(false)}>
              Beranda
            </NavLink>
            <NavLink to="/cek" className={mobileMenuClass} onClick={() => setMobileOpen(false)}>
              Cek Tanaman
            </NavLink>
            <NavLink to="/edukasi" className={mobileMenuClass} onClick={() => setMobileOpen(false)}>
              Edukasi
            </NavLink>
            <NavLink to="/monitoring" className={mobileMenuClass} onClick={() => setMobileOpen(false)}>
              Monitoring
            </NavLink>
            {user && (
              <>
                <button
                  onClick={() => { setMobileOpen(false); openEdit(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Keluar
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* MODAL EDIT PROFIL — dirender via portal ke document.body */}
      {/* Portal mencegah React 19 removeChild crash: modal tidak lagi jadi child */}
      {/* dari container halaman, sehingga DOM reconciliation bersih */}
      {editOpen && createPortal(
        <div
          className="modal-bg fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => { setEditOpen(false); setEditSuccess(false); }}
        >
          <div
            className="modal-card bg-white rounded-2xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: "0 24px 64px -12px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-3 border-b border-gray-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group focus:outline-none"
                title="Klik untuk ganti foto"
              >
                {renderAvatar("w-16 h-16", "text-xl")}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center">
                  {photoLoading ? spinnerIcon : cameraIcon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md pointer-events-none">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15H9v-2z"
                    />
                  </svg>
                </div>
              </button>
              <p className="text-[10px] text-gray-400">Klik foto untuk mengganti</p>
              <div>
                <h2 className="text-base font-bold text-gray-800">Edit Profil</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ubah nama dan foto profil Anda</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-400 truncate">{user?.email}</span>
                  <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">
                    Google
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Nama Tampilan
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveProfile();
                    }}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoFocus
                  />
                </div>
              </div>

              {editSuccess && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 border border-green-100 rounded-xl">
                  <svg
                    className="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-semibold text-green-600">
                    Profil berhasil diperbarui!
                  </span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => { setEditOpen(false); setEditSuccess(false); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm rounded-xl transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={
                    editLoading ||
                    !editName.trim() ||
                    editName.trim() === displayName
                  }
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {editLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{editLoading ? "Menyimpan..." : "Simpan"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}