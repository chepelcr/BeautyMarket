import React, { useRef, useState } from "react";
import { Icon } from "./Icon";

interface ImagePickerProps {
  currentUrl?: string | null;
  onFileChange: (file: File | null) => void;
  size?: number;
}

export function ImagePicker({ currentUrl, onFileChange, size = 100 }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displaySrc = preview ?? currentUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: "2px dashed var(--border-color, #e5e7eb)",
          background: "var(--bg-secondary, #f9fafb)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent, #6366f1)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)")}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "var(--text-secondary, #9ca3af)" }}>
            <Icon name="upload" size={22} />
            <span style={{ fontSize: 10, textAlign: "center", lineHeight: 1.2 }}>Subir imagen</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-color, #e5e7eb)",
            background: "var(--bg-primary, #fff)",
            cursor: "pointer",
            color: "var(--text-primary, #111)",
          }}
        >
          {displaySrc ? "Cambiar" : "Seleccionar"}
        </button>
        {displaySrc && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid var(--border-color, #e5e7eb)",
              background: "var(--bg-primary, #fff)",
              cursor: "pointer",
              color: "var(--error, #ef4444)",
            }}
          >
            Eliminar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
