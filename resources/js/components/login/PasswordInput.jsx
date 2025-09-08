import { useState } from "react";

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="input-base pr-10 transition"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 focus-ring rounded-md px-1"
        aria-pressed={show}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}
