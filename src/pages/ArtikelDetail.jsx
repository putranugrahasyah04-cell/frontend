import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Halaman ini sudah tidak digunakan — semua artikel di Edukasi.jsx
// kini menggunakan URL eksternal langsung (target="_blank").
// File ini dipertahankan hanya sebagai fallback safety redirect.
export default function ArtikelDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/edukasi", { replace: true });
  }, [navigate]);

  return null;
}