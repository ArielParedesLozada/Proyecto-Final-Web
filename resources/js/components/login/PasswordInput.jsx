import { useState } from "react";

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="w-full border rounded-lg px-3 py-2 pr-10 border-gray-300 focus:border-gray-400 outline-none focus:ring-2 ring-indigo-200 transition"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}
