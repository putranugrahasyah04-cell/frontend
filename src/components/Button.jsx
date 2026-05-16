export default function Button({ 
  text, 
  type = "primary", 
  onClick, 
  disabled = false,
  full = false 
}) {

  const base = "px-4 py-2 rounded transition duration-200";

  const styles = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary: "border border-green-600 text-green-600 hover:bg-green-50",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base} 
        ${styles[type]} 
        ${disabled ? disabledStyle : ""}
        ${full ? "w-full" : ""}
      `}
    >
      {text}
    </button>
  );
}