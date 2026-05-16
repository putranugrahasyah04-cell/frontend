import { useState } from "react";

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("");

  const menu = [
    "Hama & Penyakit",
    "Pemupukan",
    "Perawatan",
    "Panen",
  ];

  const handleClick = (item) => {
    setActive(item);
    if (onSelect) onSelect(item); // kirim ke parent
  };

  return (
    <div className="w-60 bg-white p-5 shadow h-screen">

      {/* TITLE */}
      <h2 className="font-bold mb-5 text-lg">Kategori</h2>

      {/* MENU */}
      <ul className="space-y-3">
        {menu.map((item, index) => (
          <li
            key={index}
            onClick={() => handleClick(item)}
            className={`
              cursor-pointer p-2 rounded transition
              ${
                active === item
                  ? "bg-green-100 text-green-600 font-semibold"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {item}
          </li>
        ))}
      </ul>

    </div>
  );
}