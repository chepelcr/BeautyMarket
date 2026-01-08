import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { SectionContent } from "./types";

interface ContentFieldProps {
  item: SectionContent;
  value: string;
  onChange: (value: string) => void;
  sectionType: string;
  sectionMode?: string;
  onModeChange?: (mode: string) => void;
  showSeparator?: boolean;
}

export function ContentField({
  item,
  value,
  onChange,
  sectionType,
  sectionMode = "both",
  onModeChange,
  showSeparator = true,
}: ContentFieldProps) {
  const renderColorInput = () => {
    try {
      const colorData = JSON.parse(value || '{"mode":"single","value":"#000000"}');

      if (sectionMode === "both") {
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Color Modo Claro
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={colorData.lightValue || colorData.value || "#000000"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.lightValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorData.lightValue || colorData.value || "#000000"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.lightValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Color Modo Oscuro
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={colorData.darkValue || "#ffffff"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.darkValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorData.darkValue || "#ffffff"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.darkValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={colorData.value || value || "#000000"}
              onChange={(e) => {
                colorData.mode = "single";
                colorData.value = e.target.value;
                onChange(JSON.stringify(colorData));
              }}
              className="w-16 h-10 p-1 border rounded cursor-pointer"
            />
            <Input
              type="text"
              value={colorData.value || value || "#000000"}
              onChange={(e) => {
                colorData.mode = "single";
                colorData.value = e.target.value;
                onChange(JSON.stringify(colorData));
              }}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );
      }
    } catch {
      return (
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-10 p-1 border rounded cursor-pointer"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      );
    }
  };

  const renderBackgroundInput = () => {
    const bgData = JSON.parse(value || '{"type":"color","value":"#ffffff","mode":"both"}');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tipo de Fondo
            </Label>
            <select
              className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              value={bgData.type}
              onChange={(e) => {
                bgData.type = e.target.value;
                if (e.target.value === "color") {
                  bgData.value = bgData.color || "#ffffff";
                } else if (e.target.value === "gradient") {
                  bgData.gradient = bgData.gradient || {
                    from: "#ffffff",
                    to: "#000000",
                    direction: "to-r",
                  };
                } else if (e.target.value === "image") {
                  bgData.image = bgData.image || { url: "", opacity: 1 };
                }
                onChange(JSON.stringify(bgData));
              }}
            >
              <option value="color">Color Sólido</option>
              <option value="gradient">Gradiente</option>
              <option value="image">Imagen</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Modo de Colores
            </Label>
            <select
              className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              value={sectionMode}
              onChange={(e) => onModeChange?.(e.target.value)}
            >
              <option value="both">Ambos Modos (Claro y Oscuro)</option>
              <option value="single">Color Único</option>
            </select>
          </div>
        </div>

        {bgData.type === "color" && (
          <div className="space-y-3">
            {sectionMode === "both" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Color Modo Claro
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={bgData.lightValue || bgData.value || "#ffffff"}
                      onChange={(e) => {
                        bgData.lightValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgData.lightValue || bgData.value || "#ffffff"}
                      onChange={(e) => {
                        bgData.lightValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Color Modo Oscuro
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={bgData.darkValue || "#000000"}
                      onChange={(e) => {
                        bgData.darkValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgData.darkValue || "#000000"}
                      onChange={(e) => {
                        bgData.darkValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={bgData.value || "#ffffff"}
                  onChange={(e) => {
                    bgData.value = e.target.value;
                    onChange(JSON.stringify(bgData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={bgData.value || "#ffffff"}
                  onChange={(e) => {
                    bgData.value = e.target.value;
                    onChange(JSON.stringify(bgData));
                  }}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}

        {bgData.type === "image" && (
          <div className="space-y-3">
            <ImageUpload
              value={bgData.image?.url || ""}
              onChange={(url) => {
                bgData.image = bgData.image || {};
                bgData.image.url = url;
                onChange(JSON.stringify(bgData));
              }}
              label="Imagen de fondo"
              folder={`images/${sectionType}-backgrounds`}
            />
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Transparencia: {Math.round((bgData.image?.opacity || 1) * 100)}%
              </Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bgData.image?.opacity || 1}
                onChange={(e) => {
                  bgData.image = bgData.image || {};
                  bgData.image.opacity = parseFloat(e.target.value);
                  onChange(JSON.stringify(bgData));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInput = () => {
    switch (item.valueType) {
      case "color":
        return renderColorInput();
      case "background":
        return renderBackgroundInput();
      case "text":
        if (item.key.includes("description") || value.length > 100) {
          return (
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          );
        }
        return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
      case "image":
        return (
          <ImageUpload
            value={value}
            onChange={onChange}
            label=""
            folder={`images/${sectionType}-images`}
          />
        );
      default:
        return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={item.id} className="font-medium">
          {item.displayName}
        </Label>
        <Badge
          variant="outline"
          className={
            item.valueType === "color"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : item.valueType === "background"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              : item.valueType === "text"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }
        >
          {item.valueType === "background" ? "fondo" : item.valueType}
        </Badge>
      </div>
      {item.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      )}
      {renderInput()}
      {showSeparator && <Separator className="mt-4" />}
    </div>
  );
}
