import React, { useRef, useState } from "react";
import { Icon } from "./Icon";

interface ImagePickerProps {
  currentUrl?: string | null;
  onFileChange: (file: File | null) => void;
  size?: number;
}

export function ImagePicker({ currentUrl, onFileChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const applyFile = (file: File) => {
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) applyFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displaySrc = preview ?? currentUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !displaySrc && inputRef.current?.click()}
        style={{
          width: "100%",
          height: 160,
          borderRadius: 10,
          border: `2px dashed ${dragging ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
          background: dragging ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.35)",
          cursor: displaySrc ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        {displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Hover overlay with actions */}
            <div
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: hovering ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  fontSize: 12,
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  fontSize: 12,
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,100,100,0.6)",
                  background: "rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                Eliminar
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))", userSelect: "none" }}>
            <Icon name="upload" size={28} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Arrastra una imagen aquí</div>
              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>o haz clic para seleccionar</div>
            </div>
          </div>
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
