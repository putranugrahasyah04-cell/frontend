import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import CekTanaman from "./pages/CekTanaman.jsx";
import Edukasi from "./pages/Edukasi.jsx";
import Hamadanpenyakit from "./pages/Hamadanpenyakit.jsx";
import Pemupukan from "./pages/Pemupukan.jsx";
import Perawatankebunsawit from "./pages/Perawatankebunsawit.jsx";
import Panenpascapanen from "./pages/Panenpascapanen.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/cek" element={<ProtectedRoute><CekTanaman /></ProtectedRoute>} />
        <Route path="/edukasi" element={<ProtectedRoute><Edukasi /></ProtectedRoute>} />
        <Route path="/hamadanpenyakit" element={<ProtectedRoute><Hamadanpenyakit /></ProtectedRoute>} />
        <Route path="/pemupukan" element={<ProtectedRoute><Pemupukan /></ProtectedRoute>} />
        <Route path="/perawatankebunsawit" element={<ProtectedRoute><Perawatankebunsawit /></ProtectedRoute>} />
        <Route path="/panen" element={<ProtectedRoute><Panenpascapanen /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />

        {/* Halaman 404 - URL tidak dikenali */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;