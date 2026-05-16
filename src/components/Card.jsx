export default function Card({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer text-center"
    >
      {/* ICON */}
      <div className="flex justify-center mb-4">
        <img src={icon} alt={title} className="w-14 h-14 object-contain" />
      </div>

      {/* TITLE */}
      <h3 className="font-semibold text-lg text-gray-800">
        {title}
      </h3>

      {/* DESC */}
      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}