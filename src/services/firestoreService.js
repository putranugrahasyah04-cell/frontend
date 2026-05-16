import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function getRiwayatRef(uid) {
  return collection(db, "users", uid, "riwayat");
}

// BUG FIX #1: Dihapus "createdAt: serverTimestamp()" — serverTimestamp menyebabkan
// dokumen TIDAK MUNCUL di query orderBy sampai server me-resolve timestamp-nya.
// Karena "tanggal" (ISO string) sudah selalu di-set saat save, kita pakai itu.
export async function saveRiwayat(uid, data) {
  if (!uid) throw new Error("UID tidak valid");
  // BUG FIX: Filter field undefined agar Firestore tidak reject
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = getRiwayatRef(uid);
  const docRef = await addDoc(ref, clean);
  return docRef.id;
}

// BUG FIX #2: Ganti orderBy("createdAt") → orderBy("tanggal")
// "tanggal" adalah ISO string yang langsung tersedia tanpa perlu server resolve.
export async function fetchRiwayat(uid) {
  const ref = getRiwayatRef(uid);
  const q = query(ref, orderBy("tanggal", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── PERBAIKAN UTAMA listenRiwayat ────────────────────────────────────────────
// BUG SEBELUMNYA: Error handler memanggil callback([]) yang mengosongkan SEMUA
// data monitoring setiap kali ada error Firestore kecil (network blip, timeout).
// Ini penyebab data "berubah-rubah" / nol saat refresh karena:
//   1. Snapshot sukses → data muncul ✓
//   2. Error sesaat → callback([]) dipanggil → history dikosongkan → semua stat jadi 0
//   3. Snapshot sukses lagi → data muncul lagi ✓
//   Siklus ini terus berulang mengikuti kondisi jaringan user.
//
// PERBAIKAN: Error handler TIDAK lagi memanggil callback([]).
// Data yang sudah tampil di UI DIPERTAHANKAN. Parameter onError (opsional)
// dipanggil agar komponen bisa menampilkan pesan error tanpa menghapus data.
export function listenRiwayat(uid, callback, onError) {
  if (!uid) {
    // Jika tidak ada uid, langsung akhiri tanpa error silent
    if (onError) onError(new Error("UID tidak valid"));
    return () => {};
  }

  const ref = getRiwayatRef(uid);
  const q = query(ref, orderBy("tanggal", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("[Firestore] listenRiwayat error:", error);
      // ✅ FIX: TIDAK memanggil callback([]) — data existing tetap aman di UI
      if (onError) onError(error);
    }
  );
}

export async function deleteRiwayat(uid, docId) {
  await deleteDoc(doc(db, "users", uid, "riwayat", docId));
}