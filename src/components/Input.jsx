export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  disabled = false,
  error = "",
}) {
  return (
    <div className="mb-4">

      {/* LABEL */}
      {label && (
        <label className="block mb-1 font-medium">
          {label}
        </label>
      )}

      {/* INPUT */}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          border p-2 w-full rounded outline-none
          focus:ring-2 focus:ring-green-500
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      />

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}

    </div>
  );
}