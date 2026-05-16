import Navbar from "../components/Navbar";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status) {
  if (status === "Baik") return "text-green-600 font-semibold";
  if (status === "Bahaya") return "text-red-500 font-semibold";
  return "text-amber-500 font-semibold";
}


export default function Dashboard() {

  // 🔹 DATA DUMMY (nanti dari backend)
  const data = [
    {
      tanggal: "2026-01-10",
      hasil: "Sehat",
      status: "Baik",
    },
    {
      tanggal: "2026-01-12",
      hasil: "Jamur",
      status: "Bahaya",
    },
    {
      tanggal: "2026-01-15",
      hasil: "Hama",
      status: "Sedang",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-10">

        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* CARD STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Total Analisis</h3>
            <p className="text-2xl font-bold text-green-600">
              {data.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Tanaman Sehat</h3>
            <p className="text-2xl font-bold text-green-600">
              {data.filter(item => item.status === "Baik").length}
            </p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Terkena Penyakit</h3>
            <p className="text-2xl font-bold text-red-500">
              {data.filter(item => item.status !== "Baik").length}
            </p>
          </div>

        </div>

        {/* RIWAYAT */}
        <div className="mt-10 bg-white p-5 rounded shadow">
          <h3 className="font-bold mb-3">Riwayat Analisis</h3>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Tanggal</th>
                <th>Hasil</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    {formatDate(item.tanggal)}
                  </td>

                  <td>{item.hasil}</td>

                  <td className={getStatusColor(item.status)}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}