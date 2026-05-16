import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Halaman ini sudah tidak digunakan — hasil analisis kini ditampilkan
// langsung (inline) di halaman CekTanaman. Route /hasil sudah dihapus
// dari App.jsx sehingga halaman ini tidak akan pernah dirender.
// File ini dipertahankan hanya sebagai fallback safety redirect.
export default function HasilAnalisis() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/cek", { replace: true });
  }, [navigate]);

  return null;
}