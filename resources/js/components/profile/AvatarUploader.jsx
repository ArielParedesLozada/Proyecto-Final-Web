import { useRef, useState } from "react";

export default function AvatarUploader({ url, name = "", onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(url);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <img
          src={preview || "/assets/icons/Logo_FinSave.png"}
          alt={name || "avatar"}
          className="h-20 w-20 rounded-full object-cover ring-1 ring-white/15 shadow"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 h-8 w-8 grid place-items-center rounded-full bg-primary-600 text-white ring-1 ring-white/10"
          title="Cambiar foto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        className="btn btn-ghost text-xs px-3 py-1.5"
        onClick={() => {
          setPreview(null);
          onChange?.(null);
        }}
      >
        Quitar foto
      </button>
    </div>
  );
}
